# NaturaCare - Configuración de Base de Datos PostgreSQL

## 📋 Requisitos Previos

- PostgreSQL instalado y corriendo en tu máquina
- Node.js y npm instalados
- Un cliente de PostgreSQL (pgAdmin, DBeaver, o terminal psql)

## 🚀 Configuración Inicial

### 1. Crear la Base de Datos

Conecta a PostgreSQL y ejecuta:

```sql
CREATE DATABASE naturacare;
```

### 2. Ejecutar el Script de Esquema

Ejecuta el archivo `database.sql` en tu base de datos:

**Opción A - Desde la terminal:**
```bash
psql -U postgres -d naturacare -f database.sql
```

**Opción B - Desde pgAdmin:**
1. Abre pgAdmin
2. Conecta a tu servidor PostgreSQL
3. Selecciona la base de datos `naturacare`
4. Abre el Query Tool
5. Copia y pega el contenido de `database.sql`
6. Ejecuta el script

### 3. Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=naturacare
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
PORT=3001
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Iniciar el Servidor Backend

```bash
npm run server
```

Deberías ver:
```
🚀 Servidor ejecutándose en http://localhost:3001
📊 Base de datos: naturacare
✅ Conectado a PostgreSQL
```

### 6. Iniciar el Frontend

En otra terminal:
```bash
npm run dev
```

### 7. Ejecutar Ambos Simultáneamente

```bash
npm run dev:all
```

## 📊 Estructura de Tablas

### `patients`
- `id` - UUID único del paciente
- `name` - Nombre completo
- `gender` - Género (Masculino/Femenino/Otro)
- `age` - Edad en años
- `dui` - Documento de identidad (opcional, único)
- `address` - Dirección completa
- `chronicIllness` - Enfermedades crónicas
- `medicalHistory` - Historial médico
- `createdAt` - Fecha de creación

### `visits`
- `id` - UUID único de la visita
- `patientId` - Referencia al paciente (FK)
- `date` - Fecha y hora de la visita
- `notes` - Array JSON de observaciones
- `treatment` - Tratamiento indicado
- `medications` - Medicamentos recetados
- `createdAt` - Fecha de creación del registro

## 🧪 Verificar la Conexión

Puedes probar el endpoint de salud:

```bash
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 🔍 Consultas Útiles

Ver todos los pacientes:
```bash
curl http://localhost:3001/api/patients
```

Ver todas las visitas:
```bash
curl http://localhost:3001/api/visits
```

Crear un paciente de prueba:
```bash
curl -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "name": "Juan Pérez",
    "gender": "Masculino",
    "age": 30,
    "address": "San Salvador",
    "chronicIllness": "",
    "medicalHistory": "",
    "createdAt": "2026-01-23T12:00:00.000Z"
  }'
```

## ⚠️ Solución de Problemas

### Error: "relation 'patients' does not exist"
- Asegúrate de haber ejecutado el script `database.sql`

### Error: "connection refused"
- Verifica que PostgreSQL esté corriendo
- Confirma el puerto (por defecto 5432)
- Revisa las credenciales en `.env`

### Error: "password authentication failed"
- Verifica el usuario y contraseña en `.env`
- Asegúrate de tener permisos en PostgreSQL

## 🔐 Seguridad

**IMPORTANTE:** 
- No subas el archivo `.env` a control de versiones
- Cambia las contraseñas por defecto en producción
- Usa variables de entorno en servidores de producción

## 📝 Mantenimiento

### Backup de la base de datos:
```bash
pg_dump -U postgres naturacare > backup_naturacare.sql
```

### Restaurar backup:
```bash
psql -U postgres naturacare < backup_naturacare.sql
```

### Limpiar todas las tablas:
```sql
TRUNCATE TABLE visits, patients CASCADE;
```
