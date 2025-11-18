import { Router } from "express";
import {
  getAllSecciones_vc_bb,
  createSeccion_vc_bb,
  updateSeccion_vc_bb,
  deleteSeccion_vc_bb
} from "../api/controllers/secciones.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllSecciones_vc_bb);
router_vc_bb.post("/", requireAdmin_vc_bb, createSeccion_vc_bb);
router_vc_bb.put("/:id", requireAdmin_vc_bb, updateSeccion_vc_bb);
router_vc_bb.delete("/:id", requireAdmin_vc_bb, deleteSeccion_vc_bb);

export default router_vc_bb;
