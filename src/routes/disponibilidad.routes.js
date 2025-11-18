import { Router } from "express";
import {
  getDisponibilidadProfesor_vc_bb,
  createDisponibilidadProfesor_vc_bb,
  createDisponibilidadEspacio_vc_bb
  , getDisponibilidadEspacio_vc_bb
  , deleteDisponibilidadProfesor_vc_bb
  , deleteDisponibilidadEspacio_vc_bb
  , updateDisponibilidadProfesor_vc_bb
  , updateDisponibilidadEspacio_vc_bb
} from "../api/controllers/disponibilidad.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/profesor", getDisponibilidadProfesor_vc_bb);
router_vc_bb.post("/profesor", requireAdmin_vc_bb, createDisponibilidadProfesor_vc_bb);
router_vc_bb.delete("/profesor/:id", requireAdmin_vc_bb, deleteDisponibilidadProfesor_vc_bb);
router_vc_bb.put("/profesor/:id", requireAdmin_vc_bb, updateDisponibilidadProfesor_vc_bb);
router_vc_bb.post("/espacio", requireAdmin_vc_bb, createDisponibilidadEspacio_vc_bb);
router_vc_bb.get("/espacio", getDisponibilidadEspacio_vc_bb);
router_vc_bb.delete("/espacio/:id", requireAdmin_vc_bb, deleteDisponibilidadEspacio_vc_bb);
router_vc_bb.put("/espacio/:id", requireAdmin_vc_bb, updateDisponibilidadEspacio_vc_bb);

export default router_vc_bb;
