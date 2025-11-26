import db_vc_bb from "../db.js";

export class BloqueModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (BloqueModel_vc_bb.#instancia_vc_bb) {
      return BloqueModel_vc_bb.#instancia_vc_bb;
    }
    BloqueModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!BloqueModel_vc_bb.#instancia_vc_bb) {
      BloqueModel_vc_bb.#instancia_vc_bb = new BloqueModel_vc_bb();
    }
    return BloqueModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `SELECT * FROM td_Bloque_bb_vc ORDER BY ID_bloque_bb_vc`;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Bloque_bb_vc WHERE ID_bloque_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async obtenerPorHora_vc_bb(hora_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Bloque_bb_vc WHERE hora_bloque_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [hora_vc_bb]);
  }
}