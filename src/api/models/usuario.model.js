import db_vc_bb from "../db.js";

export class UsuarioModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (UsuarioModel_vc_bb.#instancia_vc_bb) {
      return UsuarioModel_vc_bb.#instancia_vc_bb;
    }
    UsuarioModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!UsuarioModel_vc_bb.#instancia_vc_bb) {
      UsuarioModel_vc_bb.#instancia_vc_bb = new UsuarioModel_vc_bb();
    }
    return UsuarioModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `
      SELECT u.*, r.rol_bb_vc
      FROM td_Usuarios_bb_vc u
      JOIN td_UsuarioRol_bb_vc ur ON u.ID_usuario_bb_vc = ur.ID_usuario_usuarioRol_bb_vc
      JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      ORDER BY u.nombre_bb_vc, u.apellido_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `
      SELECT u.*, r.rol_bb_vc
      FROM td_Usuarios_bb_vc u
      JOIN td_UsuarioRol_bb_vc ur ON u.ID_usuario_bb_vc = ur.ID_usuario_usuarioRol_bb_vc
      JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      WHERE u.ID_usuario_bb_vc = ?
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async obtenerPorUsername_vc_bb(userName_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_Usuarios_bb_vc WHERE userName_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [userName_vc_bb]);
  }

  async crear_vc_bb({ nombre_bb_vc, apellido_bb_vc, userName_bb_vc, correo_bb_vc, telefono_bb_vc, cedula_bb_vc = null, password_bb_vc }) {
    const sql_vc_bb = `
      INSERT INTO td_Usuarios_bb_vc (nombre_bb_vc, apellido_bb_vc, userName_bb_vc, correo_bb_vc, telefono_bb_vc, cedula_bb_vc, password_bb_vc)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [nombre_bb_vc, apellido_bb_vc, userName_bb_vc, correo_bb_vc, telefono_bb_vc, cedula_bb_vc, password_bb_vc]);
    return result_vc_bb.lastID;
  }

  async actualizar_vc_bb(id_vc_bb, datos_vc_bb) {
    const campos_vc_bb = [];
    const valores_vc_bb = [];
    
    for (const [clave_vc_bb, valor_vc_bb] of Object.entries(datos_vc_bb)) {
      if (clave_vc_bb !== 'id' && valor_vc_bb !== undefined) {
        campos_vc_bb.push(`${clave_vc_bb} = ?`);
        valores_vc_bb.push(valor_vc_bb);
      }
    }
    
    if (campos_vc_bb.length === 0) return 0;
    
    valores_vc_bb.push(id_vc_bb);
    const sql_vc_bb = `UPDATE td_Usuarios_bb_vc SET ${campos_vc_bb.join(', ')} WHERE ID_usuario_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, valores_vc_bb);
    return result_vc_bb.changes;
  }

  async eliminar_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_Usuarios_bb_vc WHERE ID_usuario_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }

  async obtenerRol_vc_bb(id_vc_bb) {
    const sql_vc_bb = `
      SELECT ur.ID_usuarioRol_bb_vc, r.ID_rol_bb_vc, r.rol_bb_vc
      FROM td_UsuarioRol_bb_vc ur
      JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      WHERE ur.ID_usuario_usuarioRol_bb_vc = ?
    `;
    const row_vc_bb = await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
    return row_vc_bb || null;
  }

  async asignarRol_vc_bb(id_vc_bb, rol_vc_bb) {
    const sqlRol_vc_bb = `SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = ?`;
    const rolRow_vc_bb = await db_vc_bb.get_vc_bb(sqlRol_vc_bb, [rol_vc_bb]);
    
    if (!rolRow_vc_bb) {
      throw new Error(`Rol '${rol_vc_bb}' no encontrado`);
    }
    
    const sql_vc_bb = `
      INSERT OR IGNORE INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
      VALUES (?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb, rolRow_vc_bb.ID_rol_bb_vc]);
    return result_vc_bb.changes;
  }
}
/*
UsuarioModel (SQLite)
- CRUD de usuarios.
- Manejo de credenciales básicas y datos personales.
*/
