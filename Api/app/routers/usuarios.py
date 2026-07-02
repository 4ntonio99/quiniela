from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, database
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


class UsuarioResponse(BaseModel):
    id: int
    username: str
    is_admin: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[UsuarioResponse])
def obtener_usuarios(db: Session = Depends(database.get_db)):
    return db.query(models.Usuario).all()