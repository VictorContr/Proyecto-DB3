import db_vc_bb from "../db.js";

export const getAllClases_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const rows_vc_bb = await db_vc_bb.all_vc_bb(`
      SELECT c.ID_clase_bb_vc, g.nro_grado_bb_vc, s.letra_seccion_bb_vc, c.ID_grado_clase_bb_vc, c.ID_seccion_clase_bb_vc
      FROM td_Clases_bb_vc c
      JOIN td_Grados_bb_vc g ON c.ID_grado_clase_bb_vc = g.ID_grado_bb_vc
      JOIN td_Secciones_bb_vc s ON c.ID_seccion_clase_bb_vc = s.ID_seccion_bb_vc
      ORDER BY g.nro_grado_bb_vc, s.letra_seccion_bb_vc;
    `);
    res_vc_bb.json(rows_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener clases" });
  }
};

// Crear clase manualmente (aunque triggers ya las generan)
export const createClase_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc } = req_vc_bb.body;
    if (!ID_grado_clase_bb_vc || !ID_seccion_clase_bb_vc) {
      return res_vc_bb.status(400).json({ message: "Faltan datos" });
    }
    const result_vc_bb = await db_vc_bb.run_vc_bb(
      `INSERT OR IGNORE INTO td_Clases_bb_vc (ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc) VALUES (?,?);`,
      [ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc]
    );
    res_vc_bb.status(201).json({ id: result_vc_bb.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al crear clase" });
  }
};

export const deleteClase_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const result_vc_bb = await db_vc_bb.run_vc_bb(`DELETE FROM td_Clases_bb_vc WHERE ID_clase_bb_vc = ?;`, [id]);
    if (result_vc_bb.changes === 0) return res_vc_bb.status(404).json({ message: "Clase no encontrada" });
    res_vc_bb.json({ message: "Clase eliminada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al eliminar clase" });
  }
};
