from fastapi import FastAPI, Depends, HTTPException, status
from app import models, database
from app.routers import auth
from sqlalchemy.exc import OperationalError
from fastapi import Depends, HTTPException, status
from app.security import get_current_user

app = FastAPI()

# Intentar crear tablas
try:
    models.Base.metadata.create_all(bind=database.engine)
    print("Tablas creadas exitosamente")
except OperationalError as e:
    print(f"Error al conectar con la BD: {e}")

# Registrar routers
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "La API esta viva y funcionando"}

def get_area_id(current_user = Depends(get_current_user)):
    
    """
    Retorna el area_id del usuario si es un usuario normal.
    Retorna None si el usuario es Admin Global (permitiéndole ver todo).
    """
    # Ajusta 'es_admin_global' según tu lógica, 
    # por ejemplo, un ID específico o un campo en tu modelo Usuario
    if current_user.is_admin: 
        return None 
    
    return current_user.area_id