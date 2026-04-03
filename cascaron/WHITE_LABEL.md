# Cascaron Marca Blanca

Esta carpeta (`cascaron/`) es una version reutilizable del expediente medico para demos o nuevas clinicas.

## Que mantiene

- Flujo completo de login, dashboard, nuevo paciente, detalle del paciente, visitas y secretaria.
- Integracion API + PostgreSQL igual que el proyecto original.

## Personalizacion minima por cliente

1. Cambiar textos de marca:
   - Buscar y reemplazar `Clinica Base`.
   - Buscar y reemplazar `Dr(a). Responsable` o `Doctor Responsable`.
2. Cambiar datos de login demo en `.env`:
   - `VITE_LOGIN_USER`
   - `VITE_LOGIN_PASSWORD`
   - `VITE_DOCTOR_NAME`
3. Cambiar datos comerciales en recetas/constancias:
   - Buscar y reemplazar `Tel: 0000-0000`
   - Buscar y reemplazar `Direccion comercial configurable`
   - Buscar y reemplazar `Especialidades configurables`

## Notas

- La clave de sesion en localStorage del cascaron es `whitelabel_user`.
- La base de datos por defecto en esta version es `clinic_base`.
