import { contextBridge, ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';

const preloadPath = path.join(__dirname, '..', 'js', 'preload.js');
console.log('DEBUG preloadPath:', preloadPath);
console.log('EXISTS preload?', fs.existsSync(preloadPath));

console.log('✅ Preload script cargado. Exponiendo electronAPI...');

contextBridge.exposeInMainWorld('electronAPI', {
  uploadExcel: (payload) => ipcRenderer.invoke('upload-excel', payload),
  downloadReporte: () => ipcRenderer.invoke('download-reporte'),
  onProgress: (cb) => {
    const handler = (event, data) => cb(data);
    ipcRenderer.on('transfer-progress', handler);
    return () => ipcRenderer.removeListener('transfer-progress', handler);
  },
  cancelOperation: (opId) => ipcRenderer.invoke('cancel-operation', opId)
});