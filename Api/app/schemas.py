from pydantic import BaseModel
from typing import Optional

# --- Esquemas de Usuario ---
class UsuarioCreate(BaseModel):
    username: str
    password: str
    isAdmin: bool = False  # Ahora acepta un booleano directamente
    area_id: int


class UsuarioResponse(BaseModel):
    id: int
    username: str
    is_admin: bool

    class Config:
        from_attributes = True

# --- Esquemas de Partido ---
class PartidoCreate(BaseModel):
    equipo_local:Optional[str] = None
    equipo_visitante: Optional[str] = None
    estadio: str
    horario: str
    fase: str
    grupo: Optional[str] = None

# En app/schemas.py

class PartidoUpdate(BaseModel):
    id: int
    equipo_local: Optional[str] = None
    equipo_visitante: Optional[str] = None

    class Config:
        from_attributes = True

class PartidoResultadoUpdate(BaseModel):
    goles_local: int
    goles_visitante: int

class PartidoResponse(PartidoCreate):
    id: int
    goles_local: int
    goles_visitante: int
    jugado: bool

    class Config:
        from_attributes = True

# --- Esquemas de Predicción ---
class PrediccionCreate(BaseModel):
    partido_id: int
    quiniela_id: int
    goles_local_pred: int
    goles_visitante_pred: int

class PrediccionResponse(PrediccionCreate):
    id: int
    usuario_id: int

    class Config:
        from_attributes = True

# --- Esquema de Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

# En app/schemas.py

class AreaBase(BaseModel):
    nombre: str

class AreaResponse(AreaBase):
    id: int

    class Config:
        from_attributes = True # O 'orm_mode = True' si usas una versión antigua de Pydantic

# En app/schemas.py

class AreaCreate(BaseModel):
    nombre: str
