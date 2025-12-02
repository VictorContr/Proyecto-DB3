import db_vc_bb from "../db.js";

export class GradoModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (GradoModel_vc_bb.#instancia_vc_bb) {
      return GradoModel_vc_bb.#instancia_vc_bb;
    }
    GradoModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!GradoModel_vc_bb.#instancia_vc_bb) {
      GradoModel_vc_bb.#instancia_vc_bb = new GradoModel_vc_bb();
    }
    return GradoModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `SELECT * FROM td_Grados_bb_vc ORDER BY nro_grado_bb_vc`;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Grados_bb_vc WHERE ID_grado_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async obtenerPorNumero_vc_bb(nroGrado_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [nroGrado_vc_bb]);
  }

  async crear_vc_bb(nroGrado_vc_bb) {
    if (nroGrado_vc_bb < 1 || nroGrado_vc_bb > 5) {
      throw new Error('El número de grado debe estar entre 1 y 5');
    }
    const sql_vc_bb = `INSERT INTO td_Grados_bb_vc (nro_grado_bb_vc) VALUES (?)`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [nroGrado_vc_bb]);
    return result_vc_bb.lastID;
  }

  async actualizar_vc_bb(id_vc_bb, nroGrado_vc_bb) {
    if (nroGrado_vc_bb < 1 || nroGrado_vc_bb > 5) {
      throw new Error('El número de grado debe estar entre 1 y 5');
    }
    const sql_vc_bb = `UPDATE td_Grados_bb_vc SET nro_grado_bb_vc = ? WHERE ID_grado_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [nroGrado_vc_bb, id_vc_bb]);
    return result_vc_bb.changes;
  }

  async eliminar_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_Grados_bb_vc WHERE ID_grado_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }
}
/*
GradoModel (SQLite)
- CRUD de grados (año escolar).
- Búsqueda por número y relaciones con asignaturas.
*/
