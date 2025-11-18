import db_vc_bb from "../db.js";

export const getAllEspacios_vc_bb = async (req, res) => {
  try {
    const rows = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Espacios_bb_vc ORDER BY nombre_bb_vc;`);
    res.json(rows);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener espacios" });
  }
};

export const createEspacio_vc_bb = async (req, res) => {
  try {
    const { nombre_bb_vc, capacidad_bb_vc, ID_TipoEspacio_espacio_bb_vc } = req.body;
    if (!nombre_bb_vc) return res.status(400).json({ message: "Falta nombre" });
    const result = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Espacios_bb_vc (nombre_bb_vc, capacidad_bb_vc, ID_TipoEspacio_espacio_bb_vc) VALUES (?,?,?);`,
      [nombre_bb_vc, capacidad_bb_vc || null, ID_TipoEspacio_espacio_bb_vc || null]
    );
    res.status(201).json({ id: result.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al crear espacio" });
  }
};

export const updateEspacio_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_bb_vc, capacidad_bb_vc, ID_TipoEspacio_espacio_bb_vc } = req.body;
    const result = await db_vc_bb.run_vc_bb(
      `UPDATE td_Espacios_bb_vc SET nombre_bb_vc = ?, capacidad_bb_vc = ?, ID_TipoEspacio_espacio_bb_vc = ? WHERE ID_espacio_bb_vc = ?;`,
      [nombre_bb_vc, capacidad_bb_vc, ID_TipoEspacio_espacio_bb_vc, id]
    );
    if (result.changes === 0) return res.status(404).json({ message: "Espacio no encontrado" });
    res.json({ message: "Espacio actualizado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al actualizar espacio" });
  }
};

export const deleteEspacio_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db_vc_bb.run_vc_bb(`DELETE FROM td_Espacios_bb_vc WHERE ID_espacio_bb_vc = ?;`, [id]);
    if (result.changes === 0) return res.status(404).json({ message: "Espacio no encontrado" });
    res.json({ message: "Espacio eliminado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al eliminar espacio" });
  }
};
