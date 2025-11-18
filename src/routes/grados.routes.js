// src/routes/grados.routes.js
import { Router } from "express";
import {
  getAllGrados_vc_bb,
  getGradoById_vc_bb,
  createGrado_vc_bb,
  updateGrado_vc_bb,
  deleteGrado_vc_bb
} from "../api/controllers/grados.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllGrados_vc_bb);
router_vc_bb.get("/:id", getGradoById_vc_bb);
router_vc_bb.post("/", requireAdmin_vc_bb, createGrado_vc_bb);
router_vc_bb.put("/:id", requireAdmin_vc_bb, updateGrado_vc_bb);
router_vc_bb.delete("/:id", requireAdmin_vc_bb, deleteGrado_vc_bb);

export default router_vc_bb;
