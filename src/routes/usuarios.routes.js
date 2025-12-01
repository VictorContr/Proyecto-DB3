import { Router } from "express";
import {
  getAllUsuarios_vc_bb,
  getUsuarioById_vc_bb,
  createUsuario_vc_bb,
  updateUsuario_vc_bb,
  deleteUsuario_vc_bb
} from "../api/controllers/usuarios.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

router_vc_bb.get('/', getAllUsuarios_vc_bb);
router_vc_bb.get('/:id', getUsuarioById_vc_bb);
router_vc_bb.post('/', requireAdmin_vc_bb, createUsuario_vc_bb);
router_vc_bb.put('/:id', requireAdmin_vc_bb, updateUsuario_vc_bb);
router_vc_bb.delete('/:id', requireAdmin_vc_bb, deleteUsuario_vc_bb);

export default router_vc_bb;
