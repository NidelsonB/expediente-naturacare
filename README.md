# Expediente Natura Care

Una aplicación de gestión de expedientes médicos construida con React, TypeScript y Vite.

## Características

- Dashboard de pacientes
- Crear nuevos pacientes
- Ver detalles de pacientes
- Sistema de login
- Gestión de datos de pacientes

## Requisitos previos

- Node.js (v16 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio
```bash
git clone https://github.com/NidelsonB/expediente-naturacare.git
cd expediente-naturacare
```

2. Instala las dependencias
```bash
npm install
```

## Desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## Build

Para crear una versión de producción:
```bash
npm run build
```

## Estructura del proyecto

```
src/
├── pages/          # Páginas de la aplicación
├── components/     # Componentes reutilizables
├── App.tsx         # Componente principal
├── store.ts        # Estado global
├── types.ts        # Tipos TypeScript
└── index.tsx       # Punto de entrada
```

## Tecnologías

- **React** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Bundler y servidor de desarrollo
- **CSS** - Estilos

## Licencia

Este proyecto está bajo la licencia MIT.
