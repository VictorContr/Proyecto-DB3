import { Router } from "express";
import { getAllProfesores_vc_bb, createProfesor_vc_bb, deleteProfesor_vc_bb } from "../api/controllers/profesores.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllProfesores_vc_bb);
router_vc_bb.post("/", requireAdmin_vc_bb, createProfesor_vc_bb);
router_vc_bb.delete("/:id", requireAdmin_vc_bb, deleteProfesor_vc_bb);

export default router_vc_bb;
