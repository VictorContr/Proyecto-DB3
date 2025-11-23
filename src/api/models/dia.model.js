import db_vc_bb from "../db.js";

export class DiaModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (DiaModel_vc_bb.#instancia_vc_bb) {
      return DiaModel_vc_bb.#instancia_vc_bb;
    }
    DiaModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!DiaModel_vc_bb.#instancia_vc_bb) {
      DiaModel_vc_bb.#instancia_vc_bb = new DiaModel_vc_bb();
    }
    return DiaModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `SELECT * FROM td_Dia_bb_vc ORDER BY ID_dia_bb_vc`;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Dia_bb_vc WHERE ID_dia_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async obtenerPorNombre_vc_bb(nombre_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Dia_bb_vc WHERE dia_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [nombre_vc_bb]);
  }
}