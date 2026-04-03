# 🚀 Despliegue en EasyPanel - Clinica Base

## 📋 Configuración previa

### 1. Base de datos PostgreSQL en EasyPanel

Antes de desplegar la aplicación, crea una base de datos PostgreSQL en EasyPanel:

1. Ve a tu proyecto en EasyPanel
2. Click en "Add Service" → "Database" → "PostgreSQL"
3. Configura:
   - **Name**: `clinic_base-db`
   - **Database**: `clinic_base`
   - **User**: `postgres`
   - **Password**: (genera una segura)
4. Guarda la información de conexión

### 2. Ejecutar el esquema de base de datos

Una vez creada la base de datos, conéctate y ejecuta el contenido de `database.sql`:

```bash
# Opción 1: Desde EasyPanel Terminal
psql -h clinic_base-db -U postgres -d clinic_base < database.sql

# Opción 2: Desde un cliente local
psql -h TU_HOST_EASYPANEL -U postgres -d clinic_base -f database.sql
```

## 🐳 Despliegue de la aplicación

### Opción A: Desde GitHub (Recomendado)

1. Sube tu código a un repositorio de GitHub
2. En EasyPanel:
   - Click en "Add Service" → "App"
   - Conecta tu repositorio de GitHub
   - EasyPanel detectará automáticamente el Dockerfile

3. Configura las variables de entorno:
   ```
   DB_HOST=clinic_base-db
   DB_PORT=5432
   DB_NAME=clinic_base
   DB_USER=postgres
   DB_PASSWORD=tu_password_seguro
   PORT=3001
   NODE_ENV=production
   ```

4. Configura los puertos:
   - **Port 80**: Puerto principal (HTTP)
   - **Port 3001**: API Backend (opcional exponer)

5. Click en "Deploy"

### Opción B: Desde Docker Hub

1. Construye y sube la imagen:
   ```bash
   docker build -t tu-usuario/clinic_base:latest .
   docker push tu-usuario/clinic_base:latest
   ```

2. En EasyPanel:
   - Add Service → App → From Docker Image
   - Image: `tu-usuario/clinic_base:latest`
   - Configura las mismas variables de entorno

### Opción C: Build directo

Si EasyPanel soporta build directo desde Git:

1. Conecta el repositorio
2. Selecciona "Docker" como tipo de build
3. EasyPanel usará el Dockerfile automáticamente

## 🔧 Variables de entorno requeridas

En la sección de Environment Variables de EasyPanel, agrega:

```env
DB_HOST=clinic_base-db
DB_PORT=5432
DB_NAME=clinic_base
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_SEGURO
PORT=3001
NODE_ENV=production
```

## 🌐 Configuración de dominio

1. En EasyPanel, ve a tu app → Domains
2. Agrega tu dominio personalizado o usa el subdominio de EasyPanel
3. EasyPanel configurará automáticamente SSL/HTTPS

## 📊 Verificación

Una vez desplegado, verifica:

1. **Frontend**: https://tu-dominio.easypanel.host
2. **API Health**: https://tu-dominio.easypanel.host/health
3. **API Patients**: https://tu-dominio.easypanel.host/api/patients

## 🔒 Seguridad

### Variables sensibles

Asegúrate de configurar en EasyPanel (como secretos):
- `DB_PASSWORD`: Contraseña fuerte para PostgreSQL
- Cambia las credenciales por defecto del login en producción

### Red interna

EasyPanel creará una red privada entre los servicios:
- La app puede acceder a `postgres:5432` internamente
- Solo el puerto 80 está expuesto públicamente

## 📦 Estructura del contenedor

El Dockerfile crea un contenedor que incluye:

- ✅ Frontend React (servido por Nginx en puerto 80)
- ✅ Backend Express API (corriendo en puerto 3001)
- ✅ Nginx como reverse proxy
- ✅ Health checks automáticos

## 🔄 Actualización

Para actualizar la aplicación:

1. Push cambios a GitHub
2. En EasyPanel, click en "Redeploy"
3. O habilita auto-deploy en settings

## 🐛 Troubleshooting

### La app no inicia

1. Revisa los logs en EasyPanel:
   ```
   Logs → Application Logs
   ```

2. Verifica la conexión a PostgreSQL:
   ```bash
   # Desde el terminal de la app
   nc -zv postgres 5432
   ```

### Error de conexión a base de datos

- Verifica que `DB_HOST` sea el nombre del servicio de PostgreSQL en EasyPanel
- Confirma que el usuario y contraseña sean correctos
- Asegúrate de haber ejecutado `database.sql`

### Error 502 Bad Gateway

- El backend podría no estar iniciando correctamente
- Revisa que el puerto 3001 esté configurado
- Verifica los logs del contenedor

## 📝 Comandos útiles

### Ver logs en vivo
```bash
# Desde EasyPanel Terminal
docker logs -f CONTAINER_ID
```

### Conectarse a la base de datos
```bash
psql -h clinic_base-db -U postgres -d clinic_base
```

### Verificar servicios corriendo
```bash
# Dentro del contenedor
ps aux | grep -E 'nginx|node'
```

## 🎯 Arquitectura desplegada

```
Internet
   ↓
EasyPanel Load Balancer (HTTPS)
   ↓
[Puerto 80] → Nginx
   ├── /           → Frontend (React SPA)
   ├── /api/*      → Backend Express (Puerto 3001)
   └── /health     → Backend Health Check
   
PostgreSQL (Red interna)
   ↑
Backend Express
```

## ✅ Checklist de despliegue

- [ ] Base de datos PostgreSQL creada en EasyPanel
- [ ] Esquema `database.sql` ejecutado
- [ ] Variables de entorno configuradas
- [ ] Dockerfile presente en el repositorio
- [ ] Repositorio conectado a EasyPanel
- [ ] App desplegada y corriendo
- [ ] Health check respondiendo: `/health`
- [ ] Frontend accesible en el dominio
- [ ] Login funcionando
- [ ] Conexión a PostgreSQL establecida

¡Listo para producción! 🎉
