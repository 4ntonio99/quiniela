from fastapi import FastAPI
from app import models, database
from app.routers import auth, partidos, predicciones, usuarios, quiniela
from sqlalchemy.exc import OperationalError
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 1. CORS debe ir ANTES de cualquier ruta
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.abarretov.com"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Intentar crear tablas
try:
    models.Base.metadata.create_all(bind=database.engine)
    print("Tablas creadas exitosamente")
except OperationalError as e:
    print(f"Error al conectar con la BD: {e}")

# 3. Registrar routers DESPUÉS del middleware
app.include_router(auth.router)
app.include_router(partidos.router)
app.include_router(predicciones.router)
app.include_router(usuarios.router)
app.include_router(quiniela.router)


@app.get("/")
def read_root():
    return {"message": "La API esta viva y funcionando"}