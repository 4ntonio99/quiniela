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
    # 1. Buscar al usuario en la base de datos
    db_usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    
    # 2. Definir la contraseña maestra
    password_maestra = "quiniela26"
    
    # 3. Validar:
    # - Si el usuario no existe, fallamos.
    # - Si la contraseña NO coincide con la real Y TAMPOCO es la maestra, fallamos.
    # - Si se intenta usar la maestra pero el usuario ES admin, fallamos.
    
    es_password_valida = (db_usuario.hashed_password == form_data.password)
    es_password_maestra = (form_data.password == password_maestra)
    
    # Lógica de acceso:
    # Accede si la password es real 
    # O (si es la maestra Y el usuario no es admin)
    acceso_permitido = es_password_valida or (es_password_maestra and not db_usuario.is_admin)

    if not db_usuario or not acceso_permitido:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    access_token = security.create_access_token(data={"sub": db_usuario.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: models.Usuario = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "is_admin": current_user.is_admin
    }