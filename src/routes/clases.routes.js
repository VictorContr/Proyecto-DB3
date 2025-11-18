import { Router } from "express";
import {
  getAllClases_vc_bb,
  createClase_vc_bb,
  deleteClase_vc_bb
} from "../api/controllers/clases.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllClases_vc_bb);
router_vc_bb.post("/", requireAdmin_vc_bb, createClase_vc_bb);
router_vc_bb.delete("/:id", requireAdmin_vc_bb, deleteClase_vc_bb);

export default router_vc_bb;
