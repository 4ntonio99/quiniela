from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import engine, Base
from app import models  # <--- IMPORTANTE: Importar modelos para que se registren en Base
from app.routers import auth, partidos, predicciones, usuarios, quiniela
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas al iniciar. Si ya existen, no hace nada.
    # Esto detectará los cambios en tus modelos.py automáticamente.
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://app.abarretov.com", "https://quiniela.abarretov.com"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

app.include_router(auth.router)
app.include_router(partidos.router)
app.include_router(predicciones.router)
app.include_router(usuarios.router)
app.include_router(quiniela.router)

@app.get("/")
def read_root():
    return {"message": "La API esta viva y funcionando"}