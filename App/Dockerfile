# Etapa 1: Construcción
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copiamos el resultado de la construcción a la carpeta de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Exponemos el puerto 80 (por defecto de Nginx)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]