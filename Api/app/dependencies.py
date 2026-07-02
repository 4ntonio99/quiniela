from fastapi import FastAPI
from app import models, database
from app.routers import auth
from sqlalchemy.exc import OperationalError

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