import db_vc_bb from "../db.js";

export class UsuarioRolModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (UsuarioRolModel_vc_bb.#instancia_vc_bb) {
      return UsuarioRolModel_vc_bb.#instancia_vc_bb;
    }
    UsuarioRolModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!UsuarioRolModel_vc_bb.#instancia_vc_bb) {
      UsuarioRolModel_vc_bb.#instancia_vc_bb = new UsuarioRolModel_vc_bb();
    }
    return UsuarioRolModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerPorUsuario_vc_bb(idUsuario_vc_bb) {
    const sql_vc_bb = `
      SELECT ur.*, r.rol_bb_vc
      FROM td_UsuarioRol_bb_vc ur
      JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      WHERE ur.ID_usuario_usuarioRol_bb_vc = ?
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [idUsuario_vc_bb]);
  }

  async obtenerPorUsuarioYRol_vc_bb(idUsuario_vc_bb, idRol_vc_bb) {
    const sql_vc_bb = `
      SELECT * FROM td_UsuarioRol_bb_vc 
      WHERE ID_usuario_usuarioRol_bb_vc = ? AND ID_rol_usuarioRol_bb_vc = ?
      LIMIT 1
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [idUsuario_vc_bb, idRol_vc_bb]);
  }

  async crear_vc_bb(idUsuario_vc_bb, idRol_vc_bb) {
    const sql_vc_bb = `
      INSERT OR IGNORE INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
      VALUES (?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [idUsuario_vc_bb, idRol_vc_bb]);
    return result_vc_bb.lastID;
  }

  async eliminar_vc_bb(idUsuarioRol_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_UsuarioRol_bb_vc WHERE ID_usuarioRol_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [idUsuarioRol_vc_bb]);
    return result_vc_bb.changes;
  }
}