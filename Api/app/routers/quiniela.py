from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, security, database
from pydantic import BaseModel
from datetime import datetime
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
    quiniela_id: int
    
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
    # 1. Obtener todas las predicciones. 
    # El 'order_by' asegura que el reporte esté agrupado por quiniela_id.
# %Y: año con 4 dígitos, %m: mes, %d: día, %H: hora (24h), %M: minutos
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    filename = f"quiniela_{timestamp}.txt"
    predicciones = db.query(models.Prediccion).order_by(models.Prediccion.quiniela_id).all()
    
    # 2. Encabezado del reporte
    lineas = ["Nombre usuario|ID Quiniela|Tipo|ID Partido|Local|Pred Local|Pred Visita|Visita|Goles Local Real|Goles Visita Real|Puntos"]
    
    # 3. Recorrer y leer los datos que ya fueron procesados por el motor
    for p in predicciones:
        # Extraer datos de la relación (Usuario, Quiniela, Partido)
        username = p.usuario.username if p.usuario else "N/A"
        quiniela_id = p.quiniela_id
        tipo = "Aleatoria" if p.quiniela.is_random else "Decisión"
        
        partido = p.partido
        id_partido = partido.id if partido else "N/A"
        local_nombre = partido.equipo_local if partido else "N/A"
        visita_nombre = partido.equipo_visitante if partido else "N/A"
        
        # Leer goles reales y los puntos YA CALCULADOS por el motor
        goles_l_real = partido.goles_local if partido else 0
        goles_v_real = partido.goles_visitante if partido else 0
        
        # LECTURA DIRECTA DE LA BD (Puntos almacenados en la tabla predicciones)
        puntos_pred = p.puntos_obtenidos if hasattr(p, 'puntos_obtenidos') else 0
        
        # 4. Construcción de la línea (sin cálculos ni if/else de reglas)
        linea = (f"{username}|{quiniela_id}|{tipo}|"
                 f"{id_partido}|{local_nombre}|{p.goles_local_pred}|"
                 f"{p.goles_visitante_pred}|{visita_nombre}|"
                 f"{goles_l_real}|{goles_v_real}|{puntos_pred}")
        
        lineas.append(linea)
    
    # 5. Retornar el archivo listo
    return PlainTextResponse(
        content="\n".join(lineas), 
        media_type="text/plain", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
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

@router.get("/admin/todas-las-quinielas")
def obtener_todas_las_quinielas(db: Session = Depends(database.get_db), 
                                 current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Hacemos un join entre Quiniela y Usuario
    quinielas = db.query(models.Quiniela, models.Usuario.username).join(
        models.Usuario, models.Quiniela.user_id == models.Usuario.id
    ).all()
    
    # Formateamos la respuesta para incluir el username
    resultado = []
    for q, username in quinielas:
        resultado.append({
            "id": q.id,
            "user_id": q.user_id,
            "user_name": username,
            "puntos": q.puntos,
            "is_random": q.is_random,
            "is_approved": q.is_approved
        })
    return resultado

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

@router.put("/admin/toggle-aprobacion/{quiniela_id}")
def toggle_aprobacion(quiniela_id: int, db: Session = Depends(database.get_db), 
                      current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    q = db.query(models.Quiniela).filter(models.Quiniela.id == quiniela_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quiniela no encontrada")
    
    # Cambia True a False y viceversa
    q.is_approved = not q.is_approved
    db.commit()
    return {"message": f"Quiniela ahora está {'aprobada' if q.is_approved else 'desaprobada'}"}

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
        models.Quiniela.is_random,
        models.Quiniela.id.label("quiniela_id")
    ).join(models.Quiniela, models.Usuario.id == models.Quiniela.user_id)\
     .filter(models.Usuario.is_admin == False, models.Quiniela.is_approved == True)\
     .order_by(models.Quiniela.puntos.desc())\
     .all()
    return ranking

    # Buscamos la predicción por partido_id y usuario_id
@router.post("/admin/llenar-aleatorio/{quiniela_id}/{partido_id}")
def llenar_prediccion_aleatoria(
    quiniela_id: int, 
    partido_id: int, 
    db: Session = Depends(database.get_db)
):
    quiniela = db.query(models.Quiniela).filter(models.Quiniela.id == quiniela_id).first()
    if not quiniela:
        raise HTTPException(status_code=404, detail="Quiniela no encontrada")

    pred = db.query(models.Prediccion).filter(
        models.Prediccion.quiniela_id == quiniela_id,
        models.Prediccion.partido_id == partido_id
    ).first()

    goles_l = random.randint(0, 4)
    goles_v = random.randint(0, 4)

    if pred:
        pred.goles_local_pred = goles_l
        pred.goles_visitante_pred = goles_v
    else:
        pred = models.Prediccion(
            quiniela_id=quiniela_id,
            partido_id=partido_id,
            usuario_id=quiniela.user_id,
            goles_local_pred=goles_l,
            goles_visitante_pred=goles_v
        )
        db.add(pred)
        db.flush() # Importante: flush asigna el ID a la nueva predicción antes del commit

    # --- AQUÍ ESTÁ LO QUE TE FALTABA ---
    nueva_resagada = models.PrediccionResagada(
        prediccion_id=pred.id, # Ahora pred.id es válido gracias al flush si era nuevo
        goles_local_asignado=goles_l,
        goles_visitante_asignado=goles_v
    )
    db.add(nueva_resagada)
    # -----------------------------------
    
    db.commit()
    return {"message": "Predicción actualizada y registrada en resagadas"}

@router.get("/rezagadas")
def get_predicciones_resagadas(db: Session = Depends(database.get_db)): # Usa database.get_db
    # Usa models.PrediccionResagada, models.Prediccion y models.Usuario
    resultados = db.query(
        models.PrediccionResagada.id,
        models.PrediccionResagada.prediccion_id,
        models.Usuario.username.label("nombre_usuario"), 
        models.PrediccionResagada.goles_local_asignado,
        models.PrediccionResagada.goles_visitante_asignado
    ).join(models.Prediccion, models.PrediccionResagada.prediccion_id == models.Prediccion.id)\
     .join(models.Usuario, models.Prediccion.usuario_id == models.Usuario.id)\
     .all()

    return [
        {
            "id": r.id,
            "prediccion_id": r.prediccion_id,
            "nombre_usuario": r.nombre_usuario,
            "goles_local_asignado": r.goles_local_asignado,
            "goles_visitante_asignado": r.goles_visitante_asignado
        } for r in resultados
    ]