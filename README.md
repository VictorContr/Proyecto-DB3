# Project — Aplicación de escritorio (Electron) con API local

## Requisitos
- Node.js (>=16) y npm instalados.
- MySQL/SQLite según uso (si aplica).
- Ejecutar desde la raíz del proyecto: `/var/www/html/BD3/Project`.

## Instalación de dependencias
Abrir terminal en la raíz del proyecto y ejecutar:
```bash
npm install
```
Esto instalará `dependencies` y `devDependencies` (incluye `nodemon`).

## Orden de arranque (IMPORTANTE)
1. Iniciar la API local en modo desarrollo (recarga automática):
```bash
npm run dev
```
- `npm run dev` ejecuta `nodemon index.js`. Mantener este proceso en ejecución; levanta el servidor/API.

2. En otra terminal, iniciar la aplicación Electron:
```bash
npm start
```
- `npm start` ejecuta `electron .` y abre la UI de escritorio que consume la API local.

Orden requerido: primero `npm run dev` (API), luego `npm start` (Electron).

## Estructura del proyecto
- .env
- .gitignore
- index.js                — punto de entrada del servidor/API
- package.json
- README.md
- src/
  - api/
    - db.js
    - controllers/
      - admin.controller.js
      - index.controller.js
  - db/
    - example.sql
  - js/
    - app.js
    - dark-mode.js
    - main.js
    - modal.js
    - renderer.js
  - public/
    - css/
      - login-register.css
      - modal.css
      - style.css
    - img/
  - routes/
    - admin.routes.js
    - index.routes.js
    - teacher.routes.js
  - tailwind/
    - tailwind.config.js
  - views/
    - index.html
    - register.html

Notas:
- `.env` contiene variables de entorno (no subir a Git).
- `index.js` arranca la API/servidor (controlado por `nodemon` en dev).
- `src/js/main.js` / `renderer.js` relacionados con la parte Electron.

## Autores
- Victor Contreras
- Barbara Briceño