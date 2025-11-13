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

## Inicio (modo recomendado)
Solo necesitas ejecutar:
```bash
npm run dev
```
- `npm run dev` utiliza `concurrently` para arrancar simultáneamente la API (`nodemon index.js`) y la aplicación Electron (`electron .`).  
- No es necesario ejecutar `npm start` de forma separada; `npm run dev` ya lanza ambos procesos.
- Si quieres ejecutar solo uno de los dos:
  - Solo API (dev): `npm run api`
  - Solo Electron: `npm run electron`

## Estructura del proyecto
- .env
- .gitignore
- index.js                — punto de entrada del servidor/API
- package.json
- README.md
- src/
  - api/
    - controllers/
      - admin.controller.js
      - excel.controller.js
      - index.controller.js
      - login.controller.js
      - teacher.controller.js
  - db/
    - example.sql
  - js/
    - app.js
    - dark-mode.js
    - excel.js
    - login.js
    - main.js
    - modal.js
    - preload.js
    - renderer.js
  - public/
    - css/
      - login-register.css
      - modal.css
      - style.css
    - img/
  - routes/
    - admin.routes.js
    - excel.routes.js
    - index.routes.js
    - login.routes.js
    - teacher.routes.js
  - tailwind/
    - tailwind.config.js
  - views/
    - admin.html
    - index.html
    - teacher.html
- temp/
- uploads/

Notas:
- `.env` contiene variables de entorno (no subir a Git).
- `index.js` arranca la API/servidor; `nodemon` recarga en cambios durante el desarrollo.
- `npm run dev` es la forma recomendada para desarrollo local porque levanta API + Electron juntos.

## Autores
- Victor Contreras  
- Barbara Briceño