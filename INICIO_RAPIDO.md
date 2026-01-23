# 🚀 Guía Rápida - Iniciar NaturaCare con PostgreSQL

## Paso 1: Configurar PostgreSQL

1. Abre pgAdmin o tu cliente PostgreSQL
2. Crea la base de datos:
   ```sql
   CREATE DATABASE naturacare;
   ```
3. Ejecuta el script [database.sql](database.sql)

## Paso 2: Configurar Variables de Entorno

Edita el archivo [.env](.env) con tus credenciales:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=naturacare
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA
PORT=3001
```

## Paso 3: Instalar Dependencias

```powershell
npm install
```

## Paso 4: Iniciar la Aplicación

### Opción A: Todo junto (Recomendado)
```powershell
npm run dev:all
```

### Opción B: Por separado

**Terminal 1 - Backend:**
```powershell
npm run server
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

## ✅ Verificar que Funciona

1. **Backend:** Abre http://localhost:3001/health
   - Debe mostrar: `{"status":"ok","database":"connected"}`

2. **Frontend:** Abre http://localhost:5173
   - Deberías ver la página de login

## 📋 Endpoints Disponibles

- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente
- `GET /api/visits` - Listar visitas
- `POST /api/visits` - Crear visita
- `GET /health` - Estado del servidor

## 🔧 Solución Rápida de Problemas

| Error | Solución |
|-------|----------|
| "Cannot connect to database" | Verifica que PostgreSQL esté corriendo |
| "relation does not exist" | Ejecuta el script database.sql |
| "password authentication failed" | Revisa las credenciales en .env |
| "Port 3001 already in use" | Cambia el PORT en .env |

## 📞 Credenciales de Login (Demo)

- **Email:** doctor@naturacare.com
- **Contraseña:** (cualquiera - sin validación en demo)

¡Listo para usar! 🎉
