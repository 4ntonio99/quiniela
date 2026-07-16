from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import database, models

# Esquema para que aparezca el botón "Authorize" en Swagger
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "13ene26"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
        # EXTRAEMOS LOS DATOS DEL TOKEN (sin consultar BD para esto)
        token_data = {
            "area_id": payload.get("area_id"),
            "is_admin": payload.get("is_admin")
        }
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.Usuario).filter(models.Usuario.username == username).first()
    if user is None:
        raise credentials_exception
    
    # OPCIONAL: Inyectamos los datos del token en el objeto usuario temporalmente 
    # para usarlos fácilmente en los endpoints
    user.area_id = token_data["area_id"]
    user.is_admin = token_data["is_admin"]
        
    return user

