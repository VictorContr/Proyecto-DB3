import db_vc_bb from "../db.js";

class GradoAsignaturaModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (GradoAsignaturaModel_vc_bb.#instancia_vc_bb) {
      return GradoAsignaturaModel_vc_bb.#instancia_vc_bb;
    }
    GradoAsignaturaModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!GradoAsignaturaModel_vc_bb.#instancia_vc_bb) {
      GradoAsignaturaModel_vc_bb.#instancia_vc_bb = new GradoAsignaturaModel_vc_bb();
    }
    return GradoAsignaturaModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `
      SELECT 
        ga.ID_gradoAsignatura_bb_vc,
        ga.ID_grado_gradoAsig_bb_vc,
        ga.ID_asignatura_gradoAsig_bb_vc,
        g.nro_grado_bb_vc,
        a.nombre_bb_vc AS nombre_asignatura_bb_vc
      FROM td_GradosAsignaturas_bb_vc ga
      JOIN td_Grados_bb_vc g ON g.ID_grado_bb_vc = ga.ID_grado_gradoAsig_bb_vc
      JOIN td_Asignaturas_bb_vc a ON a.ID_asignatura_bb_vc = ga.ID_asignatura_gradoAsig_bb_vc
      ORDER BY g.nro_grado_bb_vc ASC, a.nombre_bb_vc ASC`;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `
      SELECT 
        ga.ID_gradoAsignatura_bb_vc,
        ga.ID_grado_gradoAsig_bb_vc,
        ga.ID_asignatura_gradoAsig_bb_vc
      FROM td_GradosAsignaturas_bb_vc ga
      WHERE ga.ID_gradoAsignatura_bb_vc = ?
      LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async crear_vc_bb(payload_vc_bb) {
    const sql_vc_bb = `
      INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc)
      VALUES (?, ?)`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [
      payload_vc_bb.ID_grado_gradoAsig_bb_vc,
      payload_vc_bb.ID_asignatura_gradoAsig_bb_vc,
    ]);
    return result_vc_bb.lastID;
  }

  async actualizar_vc_bb(id_vc_bb, payload_vc_bb) {
    const sql_vc_bb = `
      UPDATE td_GradosAsignaturas_bb_vc
      SET ID_grado_gradoAsig_bb_vc = ?, ID_asignatura_gradoAsig_bb_vc = ?
      WHERE ID_gradoAsignatura_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [
      payload_vc_bb.ID_grado_gradoAsig_bb_vc,
      payload_vc_bb.ID_asignatura_gradoAsig_bb_vc,
      id_vc_bb
    ]);
    return result_vc_bb.changes;
  }

  async eliminar_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_GradosAsignaturas_bb_vc WHERE ID_gradoAsignatura_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }
}

export { GradoAsignaturaModel_vc_bb };

