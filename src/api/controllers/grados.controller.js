// src/api/controllers/grados.controller.js
import db_vc_bb from "../db.js";

export const getAllGrados_vc_bb = async (req, res) => {
  try {
    const rows = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Grados_bb_vc ORDER BY nro_grado_bb_vc;`);
    res.json(rows);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener grados" });
  }
};

export const getGradoById_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await db_vc_bb.get_vc_bb(`SELECT * FROM td_Grados_bb_vc WHERE ID_grado_bb_vc = ?;`, [id]);
    if (!row) return res.status(404).json({ message: "Grado no encontrado" });
    res.json(row);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener grado" });
  }
};

export const createGrado_vc_bb = async (req, res) => {
  try {
    let { nro_grado_bb_vc } = req.body;
    const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
    if (!Number.isInteger(parsed_vc_bb) || parsed_vc_bb < 1 || parsed_vc_bb > 5) {
      return res.status(400).json({ message: "nro_grado_bb_vc inválido" });
    }
    const result = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Grados_bb_vc (nro_grado_bb_vc) VALUES (?);`,
      [parsed_vc_bb]
    );
    res.status(201).json({ id: result.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: err_vc_bb.message || "Error al crear grado" });
  }
};

export const updateGrado_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    let { nro_grado_bb_vc } = req.body;
    const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
    if (!Number.isInteger(parsed_vc_bb) || parsed_vc_bb < 1 || parsed_vc_bb > 5) {
      return res.status(400).json({ message: "nro_grado_bb_vc inválido" });
    }
    const result = await db_vc_bb.run_vc_bb(
      `UPDATE td_Grados_bb_vc SET nro_grado_bb_vc = ? WHERE ID_grado_bb_vc = ?;`,
      [parsed_vc_bb, id]
    );
    if (result.changes === 0) return res.status(404).json({ message: "Grado no encontrado" });
    res.json({ message: "Grado actualizado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al actualizar grado" });
  }
};

export const deleteGrado_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db_vc_bb.run_vc_bb(`DELETE FROM td_Grados_bb_vc WHERE ID_grado_bb_vc = ?;`, [id]);
    if (result.changes === 0) return res.status(404).json({ message: "Grado no encontrado" });
    res.json({ message: "Grado eliminado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al eliminar grado" });
  }
};
