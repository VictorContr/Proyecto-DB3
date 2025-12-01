import { Router } from "express";
import {
  getAllGradosAsignaturas_vc_bb,
  createGradoAsignatura_vc_bb,
  updateGradoAsignatura_vc_bb,
  deleteGradoAsignatura_vc_bb
} from "../api/controllers/gradoAsignaturas.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllGradosAsignaturas_vc_bb);
router_vc_bb.post("/", requireAdmin_vc_bb, createGradoAsignatura_vc_bb);
router_vc_bb.put("/:id", requireAdmin_vc_bb, updateGradoAsignatura_vc_bb);
router_vc_bb.delete("/:id", requireAdmin_vc_bb, deleteGradoAsignatura_vc_bb);

export default router_vc_bb;

