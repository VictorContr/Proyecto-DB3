import { app, BrowserWindow, ipcMain } from "electron";
import path, { dirname } from 'path';
import {fileURLToPath, pathToFileURL} from "url";

const __dirname_vc_bb = dirname(fileURLToPath(import.meta.url))
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
  const port_vc_bb = process.env.PORT || 3000;
  const serverUrl_vc_bb = `http://localhost:${port_vc_bb}`;
  // Página que queremos cargar cuando el servidor HTTP esté arriba
  const pagePath_vc_bb = `${serverUrl_vc_bb}/views/index.html`;

  // Esperar un poco por si el servidor HTTP todavía está arrancando.
  const waitForServer_vc_bb = async (url_vc_bb, attempts_vc_bb = 20, delay_vc_bb = 200) => {
    for (let i_vc_bb = 0; i_vc_bb < attempts_vc_bb; i_vc_bb++) {
      try {
        const res_vc_bb = await fetch(url_vc_bb, { method: "HEAD" });
        if (res_vc_bb && (res_vc_bb.ok || res_vc_bb.status === 200 || res_vc_bb.status === 204)) return true;
      } catch (e_vc_bb) {
        // Ignorar y hacer retry
      }
      await new Promise(r_vc_bb => setTimeout(r_vc_bb, delay_vc_bb));
    }
    return false;
  };

  try {
    if (!process.env.PORT) process.env.PORT = String(3000);
    const indexPath_vc_bb = path.join(__dirname_vc_bb, '..', '..', 'index.js');
    const indexUrl_vc_bb = pathToFileURL(indexPath_vc_bb).href;
    await import(indexUrl_vc_bb);
  } catch (e_vc_bb) {}

  const serverAvailable_vc_bb = await waitForServer_vc_bb(serverUrl_vc_bb, 20, 250);
  if (serverAvailable_vc_bb) {
    ventana_vc_bb.loadURL(pagePath_vc_bb);
    return;
  }
  console.warn("Servidor HTTP no respondió tras esperar, cargando archivo local.");

  // Fallback: cargar la vista local (file://) si no hay servidor HTTP disponible.
  ventana_vc_bb.loadFile(path.join(__dirname_vc_bb, '..', '/', 'views', '/', 'index.html'));
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

