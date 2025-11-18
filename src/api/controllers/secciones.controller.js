// src/api/controllers/secciones.controller.js
import db_vc_bb from "../db.js";

export const getAllSecciones_vc_bb = async (req, res) => {
  try {
    const rows = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Secciones_bb_vc ORDER BY letra_seccion_bb_vc;`);
    res.json(rows);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener secciones" });
  }
};

export const createSeccion_vc_bb = async (req, res) => {
  try {
    const { letra_seccion_bb_vc } = req.body;
    if (!letra_seccion_bb_vc) return res.status(400).json({ message: "Falta letra_seccion_bb_vc" });
    const result = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Secciones_bb_vc (letra_seccion_bb_vc) VALUES (?);`,
      [letra_seccion_bb_vc]
    );
    res.status(201).json({ id: result.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al crear sección" });
  }
};

export const updateSeccion_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const { letra_seccion_bb_vc } = req.body;
    const result = await db_vc_bb.run_vc_bb(
      `UPDATE td_Secciones_bb_vc SET letra_seccion_bb_vc = ? WHERE ID_seccion_bb_vc = ?;`,
      [letra_seccion_bb_vc, id]
    );
    if (result.changes === 0) return res.status(404).json({ message: "Sección no encontrada" });
    res.json({ message: "Sección actualizada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al actualizar sección" });
  }
};

export const deleteSeccion_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db_vc_bb.run_vc_bb(`DELETE FROM td_Secciones_bb_vc WHERE ID_seccion_bb_vc = ?;`, [id]);
    if (result.changes === 0) return res.status(404).json({ message: "Sección no encontrada" });
    res.json({ message: "Sección eliminada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al eliminar sección" });
  }
};
