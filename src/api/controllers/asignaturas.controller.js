import db_vc_bb from "../db.js";

export const getAllAsignaturas_vc_bb = async (req, res) => {
  try {
    const rows = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Asignaturas_bb_vc ORDER BY nombre_bb_vc;`);
    res.json(rows);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener asignaturas" });
  }
};

export const createAsignatura_vc_bb = async (req, res) => {
  try {
    const { nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc } = req.body;
    if (!nombre_bb_vc) return res.status(400).json({ message: "Falta nombre" });
    const result = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Asignaturas_bb_vc (nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc) VALUES (?,?,?,?,?,?);`,
      [nombre_bb_vc, horas_academicas_bb_vc || null, descripcion_bb_vc || null, duracion_bloque_min_bb_vc || 1, duracion_bloque_max_bb_vc || 1, ID_TipoEspacio_requerido_bb_vc || null]
    );
    res.status(201).json({ id: result.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: err_vc_bb.message || "Error al crear asignatura" });
  }
};

export const updateAsignatura_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const result = await db_vc_bb.run_vc_bb(
      `UPDATE td_Asignaturas_bb_vc SET nombre_bb_vc = ?, horas_academicas_bb_vc = ?, descripcion_bb_vc = ?, duracion_bloque_min_bb_vc = ?, duracion_bloque_max_bb_vc = ?, ID_TipoEspacio_requerido_bb_vc = ? WHERE ID_asignatura_bb_vc = ?;`,
      [payload.nombre_bb_vc, payload.horas_academicas_bb_vc, payload.descripcion_bb_vc, payload.duracion_bloque_min_bb_vc, payload.duracion_bloque_max_bb_vc, payload.ID_TipoEspacio_requerido_bb_vc, id]
    );
    if (result.changes === 0) return res.status(404).json({ message: "Asignatura no encontrada" });
    res.json({ message: "Asignatura actualizada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al actualizar asignatura" });
  }
};

export const deleteAsignatura_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db_vc_bb.run_vc_bb(`DELETE FROM td_Asignaturas_bb_vc WHERE ID_asignatura_bb_vc = ?;`, [id]);
    if (result.changes === 0) return res.status(404).json({ message: "Asignatura no encontrada" });
    res.json({ message: "Asignatura eliminada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al eliminar asignatura" });
  }
};
