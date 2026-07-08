from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, security, database
from pydantic import BaseModel
from typing import List
import random
import sys

from fastapi.responses import PlainTextResponse
from app.models import Usuario as User 
from app.security import get_current_user

router = APIRouter(prefix="/quinielas", tags=["quinielas"])

# --- ESQUEMAS ---
class RankingResponse(BaseModel):
    username: str
    puntos: int
    is_random: bool

    class Config:
        from_attributes = True

class QuinielaSolicitudResponse(BaseModel):
    id: int
    username: str
    is_random: bool
    is_approved: bool

    class Config:
        from_attributes = True

# --- ENDPOINTS ---

@router.get("/todas")
def obtener_todas_mis_quinielas(db: Session = Depends(database.get_db), 
                                current_user: User = Depends(get_current_user)):
    return db.query(models.Quiniela).filter(models.Quiniela.user_id == current_user.id).all()

@router.post("/gratis")
def solicitar_gratis(current_user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    existe = db.query(models.Quiniela).filter(models.Quiniela.user_id == current_user.id).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya tienes una quiniela.")
    
    # 1. Crear la quiniela
    nueva = models.Quiniela(user_id=current_user.id, is_approved=True, is_random=True, puntos=0)
    db.add(nueva)
    db.flush() # Esto asigna el ID a 'nueva' antes de hacer commit
    
    # 2. Generar las predicciones automáticamente
    partidos = db.query(models.Partido).all()
    for p in partidos:
        pred = models.Prediccion(
            quiniela_id=nueva.id,
            partido_id=p.id,
            usuario_id=current_user.id,
            goles_local_pred=random.randint(0, 4),
            goles_visitante_pred=random.randint(0, 4)
        )
        db.add(pred)
    
    db.commit()
    return {"message": "Quiniela gratis creada con predicciones automáticas"}

@router.get("/admin/descargar-reporte")
def descargar_reporte(db: Session = Depends(database.get_db)):
    # Obtenemos todas las predicciones cargando los datos relacionados para eficiencia
    predicciones = db.query(models.Prediccion).order_by(models.Prediccion.quiniela_id).all()
    
    # Encabezado
    lineas = ["Nombre usuario|ID Quiniela|Tipo|ID Partido|Local|Pred Local|Visita|Pred Visita|Goles Local Real|Goles Visita Real|Puntos"]
    
    for p in predicciones:
        # Extraemos la información de la BD (asumiendo que las relaciones están bien)
        username = p.usuario.username if p.usuario else "N/A"
        quiniela_id = p.quiniela_id
        tipo = "Aleatoria" if p.quiniela.is_random else "Decisión"
        
        # Datos del partido
        partido = p.partido
        id_partido = partido.id if partido else "N/A"
        local_nombre = partido.equipo_local if partido else "N/A"
        visita_nombre = partido.equipo_visitante if partido else "N/A"
        
        # Goles reales (de la BD)
        goles_l_real = partido.goles_local if partido else 0
        goles_v_real = partido.goles_visitante if partido else 0
        
        # Puntos: Aquí es donde traes el valor de la BD. 
        # NOTA: Si aún no tienes la columna, debes agregarla en models.txt 
        # y guardar el resultado del motor en ella.
        puntos_pred = getattr(p, 'puntos_obtenidos', 0) 
        
        # Construcción de la línea
        linea = (f"{username}|{quiniela_id}|{tipo}|"
                 f"{id_partido}|{local_nombre}|{p.goles_local_pred}|"
                 f"{p.goles_visitante_pred}|{visita_nombre}|"
                 f"{goles_l_real}|{goles_v_real}|{puntos_pred}")
        
        lineas.append(linea)
    
    return PlainTextResponse(
        content="\n".join(lineas), 
        media_type="text/plain", 
        headers={"Content-Disposition": "attachment; filename=reporte_quinielas.txt"}
    )

@router.post("/solicitar")
def solicitar_quiniela(is_random: bool, db: Session = Depends(database.get_db), 
                       current_user: User = Depends(get_current_user)):
    nueva_quiniela = models.Quiniela(
        user_id=current_user.id, 
        is_random=is_random, 
        is_approved=False,
        puntos=0
    )
    db.add(nueva_quiniela)
    db.commit()
    return {"message": "Solicitud enviada. Esperando aprobación del administrador."}

@router.get("/me")
def obtener_mis_quinielas(db: Session = Depends(database.get_db), 
                          current_user: User = Depends(get_current_user)):
    return db.query(models.Quiniela).filter(
        models.Quiniela.user_id == current_user.id,
        models.Quiniela.is_approved == True
    ).all()

@router.get("/admin/pendientes", response_model=List[QuinielaSolicitudResponse])
def obtener_pendientes(db: Session = Depends(database.get_db), 
                       current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    pendientes = db.query(models.Quiniela).filter(models.Quiniela.is_approved == False).all()
    
    return [
        {
            "id": q.id,
            "username": q.usuario.username,
            "is_random": q.is_random,
            "is_approved": q.is_approved
        } for q in pendientes
    ]

@router.put("/admin/aprobar/{quiniela_id}")
def aprobar_quiniela(quiniela_id: int, db: Session = Depends(database.get_db), 
                     current_user: User = Depends(get_current_user)):
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
        
    q = db.query(models.Quiniela).filter(models.Quiniela.id == quiniela_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quiniela no encontrada")
    
    print(f"--- [DEBUG] Aprobando quiniela ID: {quiniela_id} ---")
    sys.stdout.flush()
    
    if q.is_random:
        partidos = db.query(models.Partido).all()
        for p in partidos:
            nueva_prediccion = models.Prediccion(
                quiniela_id=q.id,
                partido_id=p.id,
                usuario_id=q.user_id,
                goles_local_pred=random.randint(0, 4),
                goles_visitante_pred=random.randint(0, 4)
            )
            db.add(nueva_prediccion)
        
        # Flush asegura que los objetos se guarden en la sesión antes del commit final
        db.flush()
    
    q.is_approved = True
    db.commit()
    print("--- [DEBUG] Commit exitoso ---")
    sys.stdout.flush()
    
    return {"message": "Quiniela aprobada y pronósticos aleatorios generados"}

@router.delete("/admin/rechazar/{quiniela_id}")
def rechazar_quiniela(quiniela_id: int, db: Session = Depends(database.get_db), 
                      current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
        
    q = db.query(models.Quiniela).filter(models.Quiniela.id == quiniela_id).first()
    if q:
        db.delete(q)
        db.commit()
    return {"message": "Quiniela rechazada y eliminada"}

@router.get("/ranking", response_model=List[RankingResponse])
def obtener_ranking(db: Session = Depends(database.get_db)):
    ranking = db.query(
        models.Usuario.username,
        models.Quiniela.puntos,
        models.Quiniela.is_random
    ).join(models.Quiniela, models.Usuario.id == models.Quiniela.user_id)\
     .filter(models.Usuario.is_admin == False, models.Quiniela.is_approved == True)\
     .order_by(models.Quiniela.puntos.desc())\
     .all()
    return ranking