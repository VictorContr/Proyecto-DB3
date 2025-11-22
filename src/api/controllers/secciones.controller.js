// src/api/controllers/secciones.controller.js
import db_vc_bb from "../db.js";

export const getAllSecciones_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const rows_vc_bb = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Secciones_bb_vc ORDER BY letra_seccion_bb_vc;`);
    res_vc_bb.json(rows_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener secciones" });
  }
};

export const createSeccion_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { letra_seccion_bb_vc } = req_vc_bb.body;
    if (!letra_seccion_bb_vc) return res_vc_bb.status(400).json({ message: "Falta letra_seccion_bb_vc" });
    const result_vc_bb = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Secciones_bb_vc (letra_seccion_bb_vc) VALUES (?);`,
      [letra_seccion_bb_vc]
    );
    res_vc_bb.status(201).json({ id: result_vc_bb.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al crear sección" });
  }
};

export const updateSeccion_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const { letra_seccion_bb_vc } = req_vc_bb.body;
    const result_vc_bb = await db_vc_bb.run_vc_bb(
      `UPDATE td_Secciones_bb_vc SET letra_seccion_bb_vc = ? WHERE ID_seccion_bb_vc = ?;`,
      [letra_seccion_bb_vc, id]
    );
    if (result_vc_bb.changes === 0) return res_vc_bb.status(404).json({ message: "Sección no encontrada" });
    res_vc_bb.json({ message: "Sección actualizada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al actualizar sección" });
  }
};

export const deleteSeccion_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const result_vc_bb = await db_vc_bb.run_vc_bb(`DELETE FROM td_Secciones_bb_vc WHERE ID_seccion_bb_vc = ?;`, [id]);
    if (result_vc_bb.changes === 0) return res_vc_bb.status(404).json({ message: "Sección no encontrada" });
    res_vc_bb.json({ message: "Sección eliminada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al eliminar sección" });
  }
};
