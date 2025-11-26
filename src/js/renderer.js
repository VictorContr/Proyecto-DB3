console.log('cargando el renderer');
import { crearVentana_vc_bb } from "../js/main.js";
import { app } from "electron";
import path from 'path';

// require('../database/conexion');

if (process.env.NODE_ENV === 'development') {
  const reloader_vc_bb = require('electron-reload');
  reloader_vc_bb(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
  });
}

app.whenReady().then(crearVentana_vc_bb);
