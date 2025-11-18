import { Router } from "express";
import db_vc_bb from "../api/db.js";

const router_vc_bb = Router();

// Mapear rutas amigables a nombres reales de tablas en la BD
const tableMap = {
  usuarios: 'td_Usuarios_bb_vc',
  profesores: 'td_Profesores_bb_vc',
  asignaturas: 'td_Asignaturas_bb_vc',
  espacios: 'td_Espacios_bb_vc',
  secciones: 'td_Secciones_bb_vc',
  grados: 'td_Grados_bb_vc',
  disponibilidad: 'td_DisponibilidadProfesor_bb_vc'
};

router_vc_bb.get('/:tabla', async (req, res) => {
  try {
    const { tabla } = req.params;
    const real = tableMap[tabla];
    if (!real) return res.status(400).json({ message: 'Tabla desconocida' });

    const rows = await db_vc_bb.all_vc_bb(`PRAGMA table_info(${real});`);
    // rows: cid, name, type, notnull, dflt_value, pk
    const cols = rows.map(r => r.name);
    res.json({ table: real, columns: cols });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: 'Error leyendo esquema' });
  }
});

export default router_vc_bb;
