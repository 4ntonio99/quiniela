import random  # <--- IMPORTANTE: Añadida esta línea
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.security import get_current_user
from app import models, schemas, database, security

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UsuarioResponse)
def register(usuario: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    nuevo_usuario = models.Usuario(
        username=usuario.username, 
        hashed_password=usuario.password,
        is_admin=usuario.isAdmin
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
        
    return nuevo_usuario

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # Nota: OAuth2PasswordRequestForm espera 'username' y 'password'
    db_usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    
    # Comparación de texto plano (como lo tienes configurado)
    if not db_usuario or db_usuario.hashed_password != form_data.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    access_token = security.create_access_token(data={"sub": db_usuario.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: models.Usuario = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "is_admin": current_user.is_admin
    }