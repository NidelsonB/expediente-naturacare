#!/bin/sh
set -e

echo "🚀 Iniciando NaturaCare en EasyPanel..."

# Verificar variables de entorno requeridas
if [ -z "$DB_HOST" ]; then
  echo "❌ ERROR: DB_HOST no está configurado"
  exit 1
fi

echo "✅ Variables de entorno configuradas"
echo "   DB_HOST: $DB_HOST"
echo "   DB_PORT: $DB_PORT"
echo "   DB_NAME: $DB_NAME"

# Iniciar Nginx en background
echo "🌐 Iniciando Nginx..."
nginx

# Esperar un momento para que Nginx inicie
sleep 2

# Verificar que Nginx esté corriendo
if ! pgrep nginx > /dev/null; then
  echo "❌ ERROR: Nginx no pudo iniciar"
  exit 1
fi

echo "✅ Nginx corriendo en puerto 80"

# Iniciar el backend de Node.js
echo "🟢 Iniciando Backend API..."
exec node server.js
