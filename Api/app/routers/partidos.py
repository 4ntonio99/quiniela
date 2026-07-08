from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app import models, schemas, database, security
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/partidos", tags=["partidos"])

# --- FUNCIÓN INTERNA PARA EL MOTOR DE PUNTOS ---
def calcular_puntos(db: Session, partido_id: int, goles_real_local: int, goles_real_visitante: int):
    predicciones = db.query(models.Prediccion).filter(models.Prediccion.partido_id == partido_id).all()
    
    for pred in predicciones:
        quiniela = db.query(models.Quiniela).filter(models.Quiniela.id == pred.quiniela_id).first()
        if not quiniela or not quiniela.is_approved:
            continue
            
        puntos_partido = 0
        
        # Regla 1: 1 punto por acertar ganador o empate
        gana_real = (goles_real_local > goles_real_visitante)
        gana_pred = (pred.goles_local_pred > pred.goles_visitante_pred)
        empate_real = (goles_real_local == goles_real_visitante)
        empate_pred = (pred.goles_local_pred == pred.goles_visitante_pred)
        
        if (gana_real == gana_pred) and (empate_real == empate_pred):
            puntos_partido += 1
            
        # Regla 2: 1 punto por acertar goles del local
        if pred.goles_local_pred == goles_real_local:
            puntos_partido += 1
            
        # Regla 3: 1 punto por acertar goles del visitante
        if pred.goles_visitante_pred == goles_real_visitante:
            puntos_partido += 1
        
        quiniela.puntos += puntos_partido

        pred.puntos_obtenidos = puntos_partido
        quiniela.puntos += puntos_partido
        db.add(pred)
   
    db.commit()

# --- ENDPOINTS ---

@router.post("/admin/crear-partidos-bulk")
def crear_partidos_bulk(
    partidos: List[schemas.PartidoCreate], 
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    """Permite subir una lista JSON de partidos."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    nuevos_partidos = []
    for p in partidos:
        partido_db = models.Partido(**p.model_dump())
        db.add(partido_db)
        nuevos_partidos.append(partido_db)
    
    db.commit()
    return {"message": f"Se han creado {len(nuevos_partidos)} partidos exitosamente"}

@router.post("/admin/actualizar-equipos-bulk")
def actualizar_equipos_bulk(
    partidos: List[schemas.PartidoUpdate], # Asumiendo que tienes un schema con ID y nombres
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    for p in partidos:
        partido = db.query(models.Partido).filter(models.Partido.id == p.id).first()
        if partido:
            # Solo actualizamos si el valor enviado no es None
            if p.equipo_local: partido.equipo_local = p.equipo_local
            if p.equipo_visitante: partido.equipo_visitante = p.equipo_visitante
    
    db.commit()
    return {"message": "Equipos actualizados exitosamente"}

@router.get("/admin/partidos")
def obtener_todos_los_partidos(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    return db.query(models.Partido).all()

@router.post("/", response_model=schemas.PartidoResponse)
def crear_partido(partido: schemas.PartidoCreate, db: Session = Depends(database.get_db), 
                  current_user: models.Usuario = Depends(security.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    nuevo_partido = models.Partido(**partido.model_dump())
    db.add(nuevo_partido)
    db.commit()
    db.refresh(nuevo_partido)
    return nuevo_partido

@router.get("/quiniela")
def obtener_quiniela_usuario(
    quiniela_id: int = Query(...),
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    # 1. Validar existencia y propiedad de la quiniela
    quiniela = db.query(models.Quiniela).filter(
        models.Quiniela.id == quiniela_id,
        models.Quiniela.user_id == current_user.id
    ).first()
    
    if not quiniela:
        raise HTTPException(status_code=404, detail="Quiniela no encontrada")

    if not quiniela.is_approved:
        raise HTTPException(status_code=403, detail="Esta quiniela aún no está aprobada.")

    # 2. Obtener partidos y predicciones
    partidos = db.query(models.Partido).all()
    predicciones = db.query(models.Prediccion).filter(models.Prediccion.quiniela_id == quiniela_id).all()
    pred_map = {p.partido_id: p for p in predicciones}

    # 3. Construir el resultado leyendo DIRECTO de la BD
    resultado = []
    for p in partidos:
        pred = pred_map.get(p.id)
        
        # Solo se agrega UN objeto por partido
        resultado.append({
            "id": p.id, 
            "fase": p.fase, 
            "grupo": p.grupo,
            "estadio": p.estadio,
            "equipo_local": p.equipo_local, 
            "equipo_visitante": p.equipo_visitante,
            "goles_local": p.goles_local if p.jugado else None,
            "goles_visitante": p.goles_visitante if p.jugado else None,
            "prediccion": {
                "goles_local": pred.goles_local_pred if pred else None,
                "goles_visitante": pred.goles_visitante_pred if pred else None,
                "bloqueado": True if pred else False
            },
            # Leemos el valor guardado en la BD (si no existe, 0)
            "puntos_obtenidos": pred.puntos_obtenidos if pred else 0
        })
    
    return {
        "usuario": current_user.username,
        "total_puntos": quiniela.puntos, # Leído de la tabla Quiniela
        "datos": resultado
    }

@router.put("/{partido_id}/resultado")
def actualizar_resultado(partido_id: int, resultado: schemas.PartidoResultadoUpdate, 
                         db: Session = Depends(database.get_db),
                         current_user: models.Usuario = Depends(security.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    partido = db.query(models.Partido).filter(models.Partido.id == partido_id).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    
    if not partido.jugado:
        partido.goles_local = resultado.goles_local
        partido.goles_visitante = resultado.goles_visitante
        partido.jugado = True
        calcular_puntos(db, partido_id, resultado.goles_local, resultado.goles_visitante)
    else:
        partido.goles_local = resultado.goles_local
        partido.goles_visitante = resultado.goles_visitante
        db.commit()
    
    db.refresh(partido)
    return partido

@router.post("/admin/recalcular-todos")
async def recalcular_todos(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    # 1. Resetear TODOS los puntos a 0 para empezar desde cero
    # Reseteamos quinielas
    todas_quinielas = db.query(models.Quiniela).all()
    for q in todas_quinielas:
        q.puntos = 0
    
    # Reseteamos puntos individuales de cada predicción (campo nuevo)
    todas_predicciones = db.query(models.Prediccion).all()
    for pred in todas_predicciones:
        pred.puntos_obtenidos = 0
        
    db.commit() # Aplicamos el borrado de puntos viejos

    # 2. Obtener todos los partidos que ya fueron jugados
    partidos_jugados = db.query(models.Partido).filter(models.Partido.jugado == True).all()

    # 3. Recalcular para cada partido
    # Tu función calcular_puntos debe estar actualizada para guardar 
    # tanto en q.puntos como en pred.puntos_obtenidos
    for p in partidos_jugados:
        calcular_puntos(db, p.id, p.goles_local, p.goles_visitante)
    
    return {"message": "Recálculo completado exitosamente y base de datos sincronizada"}

@router.post("/admin/cargar-resultados-txt")
async def cargar_resultados_txt(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")

    content = await file.read()
    # 'utf-8-sig' evita errores por caracteres ocultos 
    lines = content.decode("utf-8-sig").splitlines() 

    # PROCESAR EL ARCHIVO (Solo actualizar datos)
    for line in lines:
        clean_line = line.replace('"', '').replace(',', '').strip()
        if not clean_line: continue
        try:
            partido_id, local, visita = map(int, clean_line.split('|'))
            partido = db.query(models.Partido).filter(models.Partido.id == partido_id).first()
            
            if partido:
                partido.goles_local = local
                partido.goles_visitante = visita
                partido.jugado = True
                # Guardamos los cambios de los goles [cite: 38]
                db.commit() 
        except Exception as e:
            print(f"Error procesando línea {line}: {e}")
            continue
            
    return {"message": "Resultados actualizados correctamente sin recálculo de puntos"}