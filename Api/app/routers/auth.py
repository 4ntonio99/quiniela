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
    
    # Aquí capturamos el area_id del esquema de creación
    nuevo_usuario = models.Usuario(
        username=usuario.username, 
        hashed_password=usuario.password,
        is_admin=usuario.isAdmin,
        area_id=usuario.area_id  # <--- NUEVO: Guardamos el área
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
        
    return nuevo_usuario

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Buscar al usuario en la base de datos
    db_usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    
    # 2. Validación crítica: Si no existe, rechazamos inmediatamente
    if not db_usuario:
        raise HTTPException(
            status_code=401, 
            detail="Credenciales incorrectas"
        )
    
    # 3. Definir la contraseña maestra
    password_maestra = "quiniela26"
    
    # 4. Validar credenciales
    # Nota: Si estás guardando las contraseñas en texto plano, esto funcionará.
    # Si después decides usar hash (bcrypt), deberás usar: pwd_context.verify(form_data.password, db_usuario.hashed_password)
    es_password_valida = (db_usuario.hashed_password == form_data.password)
    es_password_maestra = (form_data.password == password_maestra)
    
    # Lógica de acceso:
    # Accede si la password es real 
    # O (si es la maestra Y el usuario no es admin)
    acceso_permitido = es_password_valida or (es_password_maestra and not db_usuario.is_admin)

    if not acceso_permitido:
        raise HTTPException(
            status_code=401, 
            detail="Credenciales incorrectas"
        )
    
    # 5. Incluimos el área y el rol en el token
    token_data = {
        "sub": db_usuario.username,
        "area_id": db_usuario.area_id, 
        "is_admin": db_usuario.is_admin
    }
    
    access_token = security.create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: models.Usuario = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "is_admin": current_user.is_admin
    }
@router.get("/areas", response_model=list[schemas.AreaResponse]) # <--- Quita el "/auth" aquí
def get_areas(db: Session = Depends(database.get_db)):
    return db.query(models.Area).all()

# En app/routers/auth.py

@router.post("/areas", response_model=schemas.AreaResponse)
def create_area(
    area: schemas.AreaCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    # Validar que sea admin quien crea el área
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear áreas")
        
    nueva_area = models.Area(nombre=area.nombre)
    db.add(nueva_area)
    db.commit()
    db.refresh(nueva_area)
    
    return nueva_area