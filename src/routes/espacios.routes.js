import { Router } from "express";
import {
  getAllEspacios_vc_bb,
  createEspacio_vc_bb,
  updateEspacio_vc_bb,
  deleteEspacio_vc_bb,
  getAllTipoEspacio_vc_bb
} from "../api/controllers/espacios.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllEspacios_vc_bb);
router_vc_bb.get("/tipos", getAllTipoEspacio_vc_bb);
router_vc_bb.post("/", requireAdmin_vc_bb, createEspacio_vc_bb);
router_vc_bb.put("/:id", requireAdmin_vc_bb, updateEspacio_vc_bb);
router_vc_bb.delete("/:id", requireAdmin_vc_bb, deleteEspacio_vc_bb);

export default router_vc_bb;
