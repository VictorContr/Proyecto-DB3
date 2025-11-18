import { Router } from "express";
import {
  getAllAsignaturas_vc_bb,
  createAsignatura_vc_bb,
  updateAsignatura_vc_bb,
  deleteAsignatura_vc_bb
} from "../api/controllers/asignaturas.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllAsignaturas_vc_bb);
router_vc_bb.post("/", requireAdmin_vc_bb, createAsignatura_vc_bb);
router_vc_bb.put("/:id", requireAdmin_vc_bb, updateAsignatura_vc_bb);
router_vc_bb.delete("/:id", requireAdmin_vc_bb, deleteAsignatura_vc_bb);

export default router_vc_bb;
