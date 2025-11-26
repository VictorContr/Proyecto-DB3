import db_vc_bb from "../db.js";

export class SeccionModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (SeccionModel_vc_bb.#instancia_vc_bb) {
      return SeccionModel_vc_bb.#instancia_vc_bb;
    }
    SeccionModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!SeccionModel_vc_bb.#instancia_vc_bb) {
      SeccionModel_vc_bb.#instancia_vc_bb = new SeccionModel_vc_bb();
    }
    return SeccionModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `SELECT * FROM td_Secciones_bb_vc ORDER BY letra_seccion_bb_vc`;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Secciones_bb_vc WHERE ID_seccion_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async obtenerPorLetra_vc_bb(letra_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Secciones_bb_vc WHERE letra_seccion_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [letra_vc_bb]);
  }

  async crear_vc_bb(letra_vc_bb) {
    if (!letra_vc_bb || letra_vc_bb.length !== 1) {
      throw new Error('La sección debe ser una sola letra');
    }
    const letraUpper_vc_bb = letra_vc_bb.toUpperCase();
    const sql_vc_bb = `INSERT INTO td_Secciones_bb_vc (letra_seccion_bb_vc) VALUES (?)`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [letraUpper_vc_bb]);
    return result_vc_bb.lastID;
  }

  async actualizar_vc_bb(id_vc_bb, letra_vc_bb) {
    if (!letra_vc_bb || letra_vc_bb.length !== 1) {
      throw new Error('La sección debe ser una sola letra');
    }
    const letraUpper_vc_bb = letra_vc_bb.toUpperCase();
    const sql_vc_bb = `UPDATE td_Secciones_bb_vc SET letra_seccion_bb_vc = ? WHERE ID_seccion_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [letraUpper_vc_bb, id_vc_bb]);
    return result_vc_bb.changes;
  }

  async eliminar_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_Secciones_bb_vc WHERE ID_seccion_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }
}