import { Router } from "express";
import { 
  verificarDatosExistentes_vc_bb,
  ejecutarRollback_vc_bb,
  obtenerRespaldos_vc_bb,
  restaurarRespaldo_vc_bb
} from "../api/controllers/lock.controller.js";
import { requireAdmin_vc_bb } from "../middleware/auth.middleware.js";

const router_vc_bb = Router();

// Verificar si hay datos existentes para un tipo de carga masiva
router_vc_bb.get("/verificar/:tipoCarga", verificarDatosExistentes_vc_bb);

// Ejecutar rollback de datos para un tipo de carga masiva
router_vc_bb.post("/rollback/:tipoCarga", requireAdmin_vc_bb, ejecutarRollback_vc_bb);

// Obtener información sobre los respaldos existentes
router_vc_bb.get("/respaldos", requireAdmin_vc_bb, obtenerRespaldos_vc_bb);

// Restaurar datos desde un respaldo específico
router_vc_bb.post("/restaurar/:nombreRespaldo", requireAdmin_vc_bb, restaurarRespaldo_vc_bb);

export default router_vc_bb;
