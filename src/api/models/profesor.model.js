import db_vc_bb from "../db.js";

export class ProfesorModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (ProfesorModel_vc_bb.#instancia_vc_bb) {
      return ProfesorModel_vc_bb.#instancia_vc_bb;
    }
    ProfesorModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!ProfesorModel_vc_bb.#instancia_vc_bb) {
      ProfesorModel_vc_bb.#instancia_vc_bb = new ProfesorModel_vc_bb();
    }
    return ProfesorModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `
      SELECT u.ID_usuario_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.userName_bb_vc, r.rol_bb_vc
      FROM td_Usuarios_bb_vc u
      JOIN td_UsuarioRol_bb_vc ur ON u.ID_usuario_bb_vc = ur.ID_usuario_usuarioRol_bb_vc
      JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      WHERE r.rol_bb_vc = 'Profesor'
      ORDER BY u.nombre_bb_vc, u.apellido_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorIdUsuario_vc_bb(idUsuario_vc_bb) {
    const sql_vc_bb = `
      SELECT p.ID_profesor_bb_vc
      FROM td_Profesores_bb_vc p
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      WHERE ur.ID_usuario_usuarioRol_bb_vc = ?
      LIMIT 1
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [idUsuario_vc_bb]);
  }

  async crear_vc_bb(idUsuarioRol_vc_bb) {
    const sql_vc_bb = `INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (?)`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [idUsuarioRol_vc_bb]);
    return result_vc_bb.lastID;
  }

  async eliminarPorUsuarioRol_vc_bb(idUsuarioRol_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_Profesores_bb_vc WHERE ID_usuarioRol_profesor_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [idUsuarioRol_vc_bb]);
    return result_vc_bb.changes;
  }
}