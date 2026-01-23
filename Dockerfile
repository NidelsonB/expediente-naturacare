# Multi-stage build para NaturaCare (Frontend + Backend)

# Etapa 1: Build del Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Build del frontend
RUN npm run build

# Etapa 2: Production - Node.js + Nginx
FROM node:20-alpine

# Instalar nginx
RUN apk add --no-cache nginx

# Crear directorios necesarios
RUN mkdir -p /run/nginx /var/log/nginx /usr/share/nginx/html

WORKDIR /app

# Copiar archivos del backend
COPY package*.json ./
COPY server.js ./
COPY api.ts ./
COPY types.ts ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el build del frontend a nginx
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx actualizada
COPY nginx.conf /etc/nginx/http.d/default.conf

# Variables de entorno por defecto (se pueden sobrescribir en EasyPanel)
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=naturacare
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV PORT=3001
ENV NODE_ENV=production

# Exponer puertos
EXPOSE 80 3001

# Copiar script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Iniciar servicios
CMD ["/app/start.sh"]
