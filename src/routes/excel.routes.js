import { Router } from "express";
import multer from "multer";
import { subirProfesoresExcel_vc_bb, descargarProfesoresExcel_vc_bb } from "../api/controllers/excel.controller.js";

const routerProfesoresExcel_vc_bb = Router();

// Configuración de Multer (carpeta temporal)
const upload_vc_bb = multer({ dest: "uploads/" });

// POST → subir Excel de profesores
routerProfesoresExcel_vc_bb.post("/upload", upload_vc_bb.single("archivo"), subirProfesoresExcel_vc_bb);

// GET → descargar Excel actualizado
routerProfesoresExcel_vc_bb.get("/download", descargarProfesoresExcel_vc_bb);

export default routerProfesoresExcel_vc_bb;
