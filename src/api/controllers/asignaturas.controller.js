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
    const { nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc, ID_grado_bb_vc, nro_grado_bb_vc } = req.body;
    if (!nombre_bb_vc) return res.status(400).json({ message: "Falta nombre" });
    const result = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Asignaturas_bb_vc (nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc) VALUES (?,?,?,?,?,?);`,
      [nombre_bb_vc, horas_academicas_bb_vc || null, descripcion_bb_vc || null, duracion_bloque_min_bb_vc || 1, duracion_bloque_max_bb_vc || 1, ID_TipoEspacio_requerido_bb_vc || null]
    );
    const newAsigId_vc_bb = result.lastID;

    let gradoId_vc_bb = null;
    if (ID_grado_bb_vc != null) {
      gradoId_vc_bb = parseInt(String(ID_grado_bb_vc).trim(), 10);
    } else if (nro_grado_bb_vc != null) {
      const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
      if (Number.isInteger(parsed_vc_bb)) {
        const gradoRow_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_grado_bb_vc FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ?;`, [parsed_vc_bb]);
        gradoId_vc_bb = gradoRow_vc_bb ? gradoRow_vc_bb.ID_grado_bb_vc : null;
      }
    }

    if (gradoId_vc_bb != null) {
      const existsRel_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_gradoAsignatura_bb_vc FROM td_GradosAsignaturas_bb_vc WHERE ID_grado_gradoAsig_bb_vc = ? AND ID_asignatura_gradoAsig_bb_vc = ?;`, [gradoId_vc_bb, newAsigId_vc_bb]);
      if (!existsRel_vc_bb) {
        await db_vc_bb.run_vc_bb(`INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc) VALUES (?, ?);`, [gradoId_vc_bb, newAsigId_vc_bb]);
      }
    }

    res.status(201).json({ id: newAsigId_vc_bb });
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

    let gradoId_vc_bb = null;
    if (payload.ID_grado_bb_vc != null) {
      gradoId_vc_bb = parseInt(String(payload.ID_grado_bb_vc).trim(), 10);
    } else if (payload.nro_grado_bb_vc != null) {
      const parsed_vc_bb = parseInt(String(payload.nro_grado_bb_vc).trim(), 10);
      if (Number.isInteger(parsed_vc_bb)) {
        const gradoRow_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_grado_bb_vc FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ?;`, [parsed_vc_bb]);
        gradoId_vc_bb = gradoRow_vc_bb ? gradoRow_vc_bb.ID_grado_bb_vc : null;
      }
    }

    if (gradoId_vc_bb != null) {
      const existsRel_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_gradoAsignatura_bb_vc FROM td_GradosAsignaturas_bb_vc WHERE ID_grado_gradoAsig_bb_vc = ? AND ID_asignatura_gradoAsig_bb_vc = ?;`, [gradoId_vc_bb, id]);
      if (!existsRel_vc_bb) {
        await db_vc_bb.run_vc_bb(`INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc) VALUES (?, ?);`, [gradoId_vc_bb, id]);
      }
    }

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
