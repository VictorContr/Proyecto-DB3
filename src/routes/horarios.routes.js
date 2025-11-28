// /routes/horarios.routes.js
import { Router } from "express";
import { generarHorarios_vc_bb, obtenerHorariosProfesor_vc_bb } from "../api/controllers/horarios.controller.js";
//import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

// generar todos los horarios
router_vc_bb.post("/generar", generarHorarios_vc_bb);

// obtener horarios de un profesor específico
router_vc_bb.get("/profesor/:idProfesor", obtenerHorariosProfesor_vc_bb);

export default router_vc_bb;