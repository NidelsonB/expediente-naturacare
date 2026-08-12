# NaturaCare para Android

Aplicación Android nativa para tablets construida con Kotlin, Jetpack Compose y Material 3. Conserva los flujos de la aplicación web y consume el mismo backend REST.

## Funcionalidades

- Sesión persistente del médico.
- Búsqueda paginada por nombre o DUI.
- Vista maestro-detalle en tablets horizontales.
- Alta de paciente con consulta inicial.
- Registro administrativo de secretaría.
- Panel de pacientes registrados hoy.
- Expediente, antecedentes e historial de consultas.
- Edición de paciente y recetas.
- Nueva consulta con actualización de antecedentes.
- Vista previa e impresión A4 de recetas y constancias mediante Android Print Framework.
- Navegación lateral en tablets y navegación inferior en pantallas estrechas.
- Adaptación automática a orientación horizontal y vertical.

## Configurar el backend

La URL predeterminada de producción es `https://apps-expediente.k6qdhd.easypanel.host/api/`.

Para un emulador Android conectado al backend local, reemplázala al compilar:

```bash
./gradlew assembleDebug -PNATURACARE_API_URL=http://10.0.2.2:3001/api/
```

Para una tablet física o producción, compila indicando una URL accesible desde el dispositivo. La URL debe terminar en `/api/`:

```bash
./gradlew assembleDebug -PNATURACARE_API_URL=https://clinica.ejemplo.com/api/
```

Por privacidad clínica, las conexiones de producción deben utilizar HTTPS. El tráfico HTTP solo está habilitado para `10.0.2.2`, `127.0.0.1` y `localhost` durante desarrollo.

El backend existente en la raíz del repositorio continúa siendo la fuente de datos PostgreSQL.

## Compilar

```bash
cd android
./gradlew testDebugUnitTest assembleDebug
```

El APK se genera en `app/build/outputs/apk/debug/app-debug.apk`.

## Acceso de demostración

- Usuario: `selvin`
- Contraseña: la misma utilizada actualmente por la aplicación web.

Antes de publicar, sustituye el acceso local por autenticación de servidor y utiliza HTTPS.
