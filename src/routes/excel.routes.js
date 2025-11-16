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
  subirGradosExcel_vc_bb,
  descargarGradosExcel_vc_bb,
  subirSeccionesExcel_vc_bb,
  descargarSeccionesExcel_vc_bb,
  subirGradosSeccionesExcel_vc_bb,
  descargarGradosSeccionesExcel_vc_bb,
  subirAsignaturasGradosExcel_vc_bb,
  descargarAsignaturasGradosExcel_vc_bb,
} from "../api/controllers/excel.controller.js";

const routerProfesoresExcel_vc_bb = Router();
const routerEspaciosExcel_vc_bb = Router();
const routerBloquesExcel_vc_bb = Router();
const routerDiasExcel_vc_bb = Router();
const routerCalendarioExcel_vc_bb = Router();
const routerGradosExcel_vc_bb = Router();
const routerSeccionesExcel_vc_bb = Router();
const routerPensumExcel_vc_bb = Router();
const routerAsignaturasExcel_vc_bb = Router();

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

// --- Grados ---
routerGradosExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirGradosExcel_vc_bb);
routerGradosExcel_vc_bb.get("/download", descargarGradosExcel_vc_bb);

// --- Secciones ---
routerSeccionesExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirSeccionesExcel_vc_bb);
routerSeccionesExcel_vc_bb.get("/download", descargarSeccionesExcel_vc_bb);

// --- Pensum (Combinado: Grados + Secciones en un solo .xlsx) ---
routerPensumExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirGradosSeccionesExcel_vc_bb);
routerPensumExcel_vc_bb.get("/download", descargarGradosSeccionesExcel_vc_bb);

// --- Asignaturas + Grados (una sola hoja) ---
routerAsignaturasExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirAsignaturasGradosExcel_vc_bb);
routerAsignaturasExcel_vc_bb.get("/download", descargarAsignaturasGradosExcel_vc_bb);

export { routerEspaciosExcel_vc_bb, routerBloquesExcel_vc_bb, routerDiasExcel_vc_bb, routerCalendarioExcel_vc_bb, routerGradosExcel_vc_bb, routerSeccionesExcel_vc_bb, routerPensumExcel_vc_bb, routerAsignaturasExcel_vc_bb };
export default routerProfesoresExcel_vc_bb;
