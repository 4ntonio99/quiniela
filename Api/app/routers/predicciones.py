from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database, security

router = APIRouter(prefix="/predicciones", tags=["predicciones"])

@router.post("/", response_model=schemas.PrediccionResponse)
def crear_prediccion(
    pred: schemas.PrediccionCreate, 
    # IMPORTANTE: Debes agregar quiniela_id al esquema PrediccionCreate en schemas.py
    # O recibirlo en el body si prefieres. Aquí asumo que viene en el objeto 'pred'
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    # 1. Verificar partido
    partido = db.query(models.Partido).filter(models.Partido.id == pred.partido_id).first()
    if not partido or partido.jugado:
        raise HTTPException(status_code=400, detail="Partido no encontrado o ya finalizado")
    
    # 2. Verificar que la quiniela pertenezca al usuario
    quiniela = db.query(models.Quiniela).filter(
        models.Quiniela.id == pred.quiniela_id, 
        models.Quiniela.user_id == current_user.id
    ).first()
    if not quiniela:
        raise HTTPException(status_code=403, detail="Quiniela no válida para este usuario")

    # 3. Verificar predicción duplicada en esa quiniela específica
    existe = db.query(models.Prediccion).filter(
        models.Prediccion.quiniela_id == pred.quiniela_id,
        models.Prediccion.partido_id == pred.partido_id
    ).first()
    
    if existe:
        raise HTTPException(status_code=400, detail="Ya apostaste en esta quiniela para este partido")

    nueva_prediccion = models.Prediccion(
        usuario_id=current_user.id,
        quiniela_id=pred.quiniela_id,
        partido_id=pred.partido_id,
        goles_local_pred=pred.goles_local_pred,
        goles_visitante_pred=pred.goles_visitante_pred
    )
    db.add(nueva_prediccion)
    db.commit()
    db.refresh(nueva_prediccion)
    
    return nueva_prediccion

import random