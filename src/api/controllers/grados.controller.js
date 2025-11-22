// src/api/controllers/grados.controller.js
import db_vc_bb from "../db.js";

export const getAllGrados_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const rows_vc_bb = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Grados_bb_vc ORDER BY nro_grado_bb_vc;`);
    res_vc_bb.json(rows_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener grados" });
  }
};

export const getGradoById_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const row_vc_bb = await db_vc_bb.get_vc_bb(`SELECT * FROM td_Grados_bb_vc WHERE ID_grado_bb_vc = ?;`, [id]);
    if (!row_vc_bb) return res_vc_bb.status(404).json({ message: "Grado no encontrado" });
    res_vc_bb.json(row_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener grado" });
  }
};

export const createGrado_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    let { nro_grado_bb_vc } = req_vc_bb.body;
    const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
    if (!Number.isInteger(parsed_vc_bb) || parsed_vc_bb < 1 || parsed_vc_bb > 5) {
      return res_vc_bb.status(400).json({ message: "nro_grado_bb_vc inválido" });
    }
    const result_vc_bb = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Grados_bb_vc (nro_grado_bb_vc) VALUES (?);`,
      [parsed_vc_bb]
    );
    res_vc_bb.status(201).json({ id: result_vc_bb.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: err_vc_bb.message || "Error al crear grado" });
  }
};

export const updateGrado_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    let { nro_grado_bb_vc } = req_vc_bb.body;
    const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
    if (!Number.isInteger(parsed_vc_bb) || parsed_vc_bb < 1 || parsed_vc_bb > 5) {
      return res_vc_bb.status(400).json({ message: "nro_grado_bb_vc inválido" });
    }
    const result_vc_bb = await db_vc_bb.run_vc_bb(
      `UPDATE td_Grados_bb_vc SET nro_grado_bb_vc = ? WHERE ID_grado_bb_vc = ?;`,
      [parsed_vc_bb, id]
    );
    if (result_vc_bb.changes === 0) return res_vc_bb.status(404).json({ message: "Grado no encontrado" });
    res_vc_bb.json({ message: "Grado actualizado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al actualizar grado" });
  }
};

export const deleteGrado_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const result_vc_bb = await db_vc_bb.run_vc_bb(`DELETE FROM td_Grados_bb_vc WHERE ID_grado_bb_vc = ?;`, [id]);
    if (result_vc_bb.changes === 0) return res_vc_bb.status(404).json({ message: "Grado no encontrado" });
    res_vc_bb.json({ message: "Grado eliminado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al eliminar grado" });
  }
};
