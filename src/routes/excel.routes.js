import { Router } from "express";
import multer from "multer";
import { 
  subirProfesoresExcel_vc_bb, 
  descargarProfesoresExcel_vc_bb,
  subirEspaciosExcel_vc_bb,
  descargarEspaciosExcel_vc_bb,
  subirBloquesExcel_vc_bb,
  descargarBloquesExcel_vc_bb,
  subirDiasExcel_vc_bb,
  descargarDiasExcel_vc_bb,
  subirDiasBloquesExcel_vc_bb,
  descargarDiasBloquesExcel_vc_bb,
} from "../api/controllers/excel.controller.js";

const routerProfesoresExcel_vc_bb = Router();
const routerEspaciosExcel_vc_bb = Router();
const routerBloquesExcel_vc_bb = Router();
const routerDiasExcel_vc_bb = Router();
const routerCalendarioExcel_vc_bb = Router();

// Configuración de Multer (carpeta temporal)
const upload_vc_bb = multer({ dest: "uploads/" });

// POST → subir Excel de profesores
routerProfesoresExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirProfesoresExcel_vc_bb);

// GET → descargar Excel actualizado
routerProfesoresExcel_vc_bb.get("/download", descargarProfesoresExcel_vc_bb);

// --- Espacios ---
// POST → subir Excel de espacios
routerEspaciosExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirEspaciosExcel_vc_bb);

// GET → descargar Excel de espacios
routerEspaciosExcel_vc_bb.get("/download", descargarEspaciosExcel_vc_bb);

// --- Bloques ---
routerBloquesExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirBloquesExcel_vc_bb);
routerBloquesExcel_vc_bb.get("/download", descargarBloquesExcel_vc_bb);

// --- Días ---
routerDiasExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirDiasExcel_vc_bb);
routerDiasExcel_vc_bb.get("/download", descargarDiasExcel_vc_bb);

// --- Calendario (Combinado: Días + Bloques en un solo .xlsx) ---
routerCalendarioExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirDiasBloquesExcel_vc_bb);
routerCalendarioExcel_vc_bb.get("/download", descargarDiasBloquesExcel_vc_bb);

export { routerEspaciosExcel_vc_bb, routerBloquesExcel_vc_bb, routerDiasExcel_vc_bb, routerCalendarioExcel_vc_bb };
export default routerProfesoresExcel_vc_bb;
