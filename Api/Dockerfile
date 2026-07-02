FROM python:3.11-slim

# Evita que Python genere archivos .pyc y almacene en buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Primero copiamos solo el archivo de requerimientos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Luego copiamos el resto del código
COPY . .

# Usamos --reload para desarrollo, así si cambias el código no tienes que reiniciar todo
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]