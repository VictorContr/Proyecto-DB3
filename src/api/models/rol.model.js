import db_vc_bb from "../db.js";

export class RolModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (RolModel_vc_bb.#instancia_vc_bb) {
      return RolModel_vc_bb.#instancia_vc_bb;
    }
    RolModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!RolModel_vc_bb.#instancia_vc_bb) {
      RolModel_vc_bb.#instancia_vc_bb = new RolModel_vc_bb();
    }
    return RolModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `SELECT * FROM td_Rol_bb_vc ORDER BY rol_bb_vc`;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorNombre_vc_bb(rol_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Rol_bb_vc WHERE rol_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [rol_vc_bb]);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Rol_bb_vc WHERE ID_rol_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async crear_vc_bb(rol_vc_bb) {
    const sql_vc_bb = `INSERT INTO td_Rol_bb_vc (rol_bb_vc) VALUES (?)`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [rol_vc_bb]);
    return result_vc_bb.lastID;
  }
}