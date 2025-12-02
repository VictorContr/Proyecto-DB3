# Project — Aplicación de escritorio (Electron) con API local

## Requisitos
- Node.js (>=16) y npm instalados.
- SQLite local para desarrollo (puerto `3000`).
- MySQL remoto opcional vía Railway (URL pública).
- Ejecutar desde la raíz del proyecto.

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

## Empaquetado (.exe) con Electron Forge
- Requisitos:
  - Windows x64, Node.js >= 16.
  - `electron` en `devDependencies` y Electron Forge instalado.
- Instalar (si hace falta):
  - `npm install`
- Crear el instalador:
  - `npm run make`
- Artefactos generados:
  - Instalador: `out/make/squirrel.windows/x64/project-1.0.0 Setup.exe`
  - Zip: `out/make/zip/win32/x64/project-win32-x64-1.0.0.zip`
- Ejecución con Forge en desarrollo:
  - `npm run start`

### Personalización
- Icono del ejecutable: añade `packagerConfig.icon` en `package.json` apuntando a un `.ico`.
- Ignora artefactos de build en Git: la carpeta `out/` ya está en `.gitignore`.

### Solución de problemas
- Error: `Could not find any Electron packages in devDependencies`
  - Causa: `electron` en `dependencies` en vez de `devDependencies`.
  - Fix: mover `electron` a `devDependencies` y ejecutar `npm install` de nuevo.

## Configuración de red (.env)
- Variables relevantes:
  - `API_SQLITE_PORT=3000` → API local (fallback en desarrollo).
  - `API_MYSQL_BASE_URL=https://api-mysql-horarios-bachillerato-bd3-production.up.railway.app` → API MySQL remota (Railway).
  - Opción local (comentada por defecto):
    - `# API_MYSQL_BASE_URL=http://localhost:3300`

La app cliente (`src/js/guide.js`) intenta primero MySQL remoto (`API_MYSQL_BASE_URL`) y, si no responde, cae a SQLite local (`http://localhost:API_SQLITE_PORT`).

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
