from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

    # Relaciones
    predicciones = relationship("Prediccion", back_populates="usuario")
    quinielas = relationship("Quiniela", back_populates="usuario") # Nueva relación

class Quiniela(Base):
    __tablename__ = "quinielas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"))
    puntos = Column(Integer, default=0)
    
    # True = Aleatoria, False = Decisión
    is_random = Column(Boolean, default=True) 
    is_approved = Column(Boolean, default=False)
    
    usuario = relationship("Usuario", back_populates="quinielas")
    predicciones = relationship("Prediccion", back_populates="quiniela")

class Partido(Base):
    __tablename__ = "partidos"

    id = Column(Integer, primary_key=True, index=True)
    equipo_local = Column(String, nullable=True)
    equipo_visitante = Column(String, nullable=True)
    goles_local = Column(Integer, default=0)
    goles_visitante = Column(Integer, default=0)
    estadio = Column(String)
    horario = Column(String)
    fase = Column(String) # "Grupos", "8avos", etc.
    grupo = Column(String, nullable=True) # "A", "B", etc.
    jugado = Column(Boolean, default=False)

    predicciones = relationship("Prediccion", back_populates="partido")

class Prediccion(Base):
    __tablename__ = "predicciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    quiniela_id = Column(Integer, ForeignKey("quinielas.id"))
    partido_id = Column(Integer, ForeignKey("partidos.id"))
    goles_local_pred = Column(Integer)
    goles_visitante_pred = Column(Integer)

    usuario = relationship("Usuario", back_populates="predicciones")
    partido = relationship("Partido", back_populates="predicciones")
    quiniela = relationship("Quiniela", back_populates="predicciones")