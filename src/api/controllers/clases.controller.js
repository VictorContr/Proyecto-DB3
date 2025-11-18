import db_vc_bb from "../db.js";

export const getAllClases_vc_bb = async (req, res) => {
  try {
    const rows = await db_vc_bb.all_vc_bb(`
      SELECT c.ID_clase_bb_vc, g.nro_grado_bb_vc, s.letra_seccion_bb_vc, c.ID_grado_clase_bb_vc, c.ID_seccion_clase_bb_vc
      FROM td_Clases_bb_vc c
      JOIN td_Grados_bb_vc g ON c.ID_grado_clase_bb_vc = g.ID_grado_bb_vc
      JOIN td_Secciones_bb_vc s ON c.ID_seccion_clase_bb_vc = s.ID_seccion_bb_vc
      ORDER BY g.nro_grado_bb_vc, s.letra_seccion_bb_vc;
    `);
    res.json(rows);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener clases" });
  }
};

// Crear clase manualmente (aunque triggers ya las generan)
export const createClase_vc_bb = async (req, res) => {
  try {
    const { ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc } = req.body;
    if (!ID_grado_clase_bb_vc || !ID_seccion_clase_bb_vc) {
      return res.status(400).json({ message: "Faltan datos" });
    }
    const result = await db_vc_bb.run_vc_bb(
      `INSERT OR IGNORE INTO td_Clases_bb_vc (ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc) VALUES (?,?);`,
      [ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc]
    );
    res.status(201).json({ id: result.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al crear clase" });
  }
};

export const deleteClase_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db_vc_bb.run_vc_bb(`DELETE FROM td_Clases_bb_vc WHERE ID_clase_bb_vc = ?;`, [id]);
    if (result.changes === 0) return res.status(404).json({ message: "Clase no encontrada" });
    res.json({ message: "Clase eliminada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al eliminar clase" });
  }
};
