import { app, BrowserWindow, ipcMain } from "electron";
import path, { dirname } from 'path';
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url))
let ventana_vc_bb;
export const crearVentana_vc_bb = async () => {
  ventana_vc_bb = new BrowserWindow({
    width: 1600,
    height: 820,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  });
  // Intentar cargar la API/servidor si está disponible (desarrollo).
  const port = process.env.PORT || 3000;
  const serverUrl = `http://localhost:${port}`;
  // Página que queremos cargar cuando el servidor HTTP esté arriba
  const pagePath = `${serverUrl}/views/index.html`;

  // Esperar un poco por si el servidor HTTP todavía está arrancando.
  const waitForServer = async (url, attempts = 20, delay = 200) => {
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res && (res.ok || res.status === 200 || res.status === 204)) return true;
      } catch (e) {
        // Ignorar y hacer retry
      }
      await new Promise(r => setTimeout(r, delay));
    }
    return false;
  };

  const serverAvailable = await waitForServer(serverUrl, 20, 250);
  if (serverAvailable) {
    ventana_vc_bb.loadURL(pagePath);
    return;
  }
  console.warn("Servidor HTTP no respondió tras esperar, cargando archivo local.");

  // Fallback: cargar la vista local (file://) si no hay servidor HTTP disponible.
  ventana_vc_bb.loadFile(path.join(__dirname, '..', '/', 'views', '/', 'index.html'));
};

// Handlers IPC
// ipcMain.handle("verificar-credenciales_vc_bb", async (event_vc_bb, credenciales_vc_bb) => {
//   return new Promise((resolve_vc_bb, reject_vc_bb) => {
//     const sql_vc_bb = "SELECT * FROM td_usuarios_vc_bb WHERE correo_electronico_vc_bb = ? AND clave_vc_bb = ?";
//     connection_vc_bb.query(sql_vc_bb, [credenciales_vc_bb.correo_vc_bb, credenciales_vc_bb.clave_vc_bb], (err_vc_bb, results_vc_bb) => {
//       if (err_vc_bb) {
//         console.error("Error al verificar credenciales:", err_vc_bb);
//         return reject_vc_bb(err_vc_bb);
//       }
//       resolve_vc_bb(results_vc_bb.length > 0 ? results_vc_bb[0] : null);
//     });
//   });
// });


// ipcMain.handle('query-auth_vc_bb', async (event, sql, params) => {
//   return new Promise((resolve, reject) => {
//     connection_vc_bb.query(sql, params, (err, results) => {
//       if (err) return reject(err);
//       resolve(results);
//     });
//   });
// });

