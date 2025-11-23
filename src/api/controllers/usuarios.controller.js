import db_vc_bb from "../db.js";

export const getAllUsuarios_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const rows_vc_bb = await db_vc_bb.all_vc_bb(`
      SELECT u.ID_usuario_bb_vc AS ID_usuario_bb_vc,
             u.userName_bb_vc,
             u.nombre_bb_vc,
             u.apellido_bb_vc,
             u.correo_bb_vc,
             u.telefono_bb_vc,
             r.rol_bb_vc AS rol_bb_vc,
             ur.ID_usuarioRol_bb_vc AS ID_usuarioRol_bb_vc
      FROM td_Usuarios_bb_vc u
      LEFT JOIN td_UsuarioRol_bb_vc ur ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
      LEFT JOIN td_Rol_bb_vc r ON r.ID_rol_bb_vc = ur.ID_rol_usuarioRol_bb_vc
      ORDER BY u.ID_usuario_bb_vc;
    `);
    res_vc_bb.json(rows_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const createUsuario_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const {
      userName_bb_vc = null,
      nombre_bb_vc = null,
      apellido_bb_vc = null,
      correo_bb_vc = null,
      telefono_bb_vc = null,
      rol_bb_vc = null,
      password_bb_vc = null
    } = req_vc_bb.body;

    // password_bb_vc es NOT NULL en el esquema; si no viene, usar contraseña por defecto '123456'
    const insertPassword = password_bb_vc || '123456';
    const insertUser = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Usuarios_bb_vc (userName_bb_vc, nombre_bb_vc, apellido_bb_vc, correo_bb_vc, telefono_bb_vc, password_bb_vc) VALUES (?,?,?,?,?,?);`,
      [userName_bb_vc, nombre_bb_vc, apellido_bb_vc, correo_bb_vc, telefono_bb_vc, insertPassword]
    );

    const newUserId = insertUser.lastID;

    // Si enviaron rol, asociarlo
    if (rol_bb_vc) {
      // Map simple role values to DB rol text
      let rolName = null;
      if (String(rol_bb_vc).toLowerCase().includes('prof')) rolName = 'Profesor';
      else if (String(rol_bb_vc).toLowerCase().includes('admin')) rolName = 'Administrador';
      else rolName = String(rol_bb_vc);

      const roleRow = await db_vc_bb.get_vc_bb(`SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = ? LIMIT 1;`, [rolName]);
      if (roleRow) {
        const userRoleIns = await db_vc_bb.run_vc_bb(`INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc) VALUES (?,?);`, [newUserId, roleRow.ID_rol_bb_vc]);
        const newUserRoleId = userRoleIns.lastID;

        if (rolName === 'Profesor') {
          await db_vc_bb.run_vc_bb(`INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (?);`, [newUserRoleId]);
        }
      }
    }

    res_vc_bb.status(201).json({ id_usuario: newUserId });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al crear usuario" });
  }
};

export const updateUsuario_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const {
      userName_bb_vc = null,
      nombre_bb_vc = null,
      apellido_bb_vc = null,
      correo_bb_vc = null,
      telefono_bb_vc = null,
      rol_bb_vc = null,
    } = req_vc_bb.body;

    // Actualizar campos básicos (solo los que vienen)
    const updates = [];
    const params = [];
    if (userName_bb_vc !== null) { updates.push('userName_bb_vc = ?'); params.push(userName_bb_vc); }
    if (nombre_bb_vc !== null) { updates.push('nombre_bb_vc = ?'); params.push(nombre_bb_vc); }
    if (apellido_bb_vc !== null) { updates.push('apellido_bb_vc = ?'); params.push(apellido_bb_vc); }
    if (correo_bb_vc !== null) { updates.push('correo_bb_vc = ?'); params.push(correo_bb_vc); }
    if (telefono_bb_vc !== null) { updates.push('telefono_bb_vc = ?'); params.push(telefono_bb_vc); }

    if (updates.length > 0) {
      params.push(id);
      await db_vc_bb.run_vc_bb(`UPDATE td_Usuarios_bb_vc SET ${updates.join(', ')} WHERE ID_usuario_bb_vc = ?;`, params);
    }

    if (rol_bb_vc !== null) {
      let rolName = null;
      if (String(rol_bb_vc).toLowerCase().includes('prof')) rolName = 'Profesor';
      else if (String(rol_bb_vc).toLowerCase().includes('admin')) rolName = 'Administrador';
      else rolName = String(rol_bb_vc);

      const roleRow = await db_vc_bb.get_vc_bb(`SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = ? LIMIT 1;`, [rolName]);
      if (roleRow) {
        // Verificar si existe una entrada en td_UsuarioRol_bb_vc
        const existingUR = await db_vc_bb.get_vc_bb(`SELECT ID_usuarioRol_bb_vc FROM td_UsuarioRol_bb_vc WHERE ID_usuario_usuarioRol_bb_vc = ? LIMIT 1;`, [id]);
        if (existingUR) {
          await db_vc_bb.run_vc_bb(`UPDATE td_UsuarioRol_bb_vc SET ID_rol_usuarioRol_bb_vc = ? WHERE ID_usuarioRol_bb_vc = ?;`, [roleRow.ID_rol_bb_vc, existingUR.ID_usuarioRol_bb_vc]);
        } else {
          const ins = await db_vc_bb.run_vc_bb(`INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc) VALUES (?,?);`, [id, roleRow.ID_rol_bb_vc]);
          if (rolName === 'Profesor') {
            await db_vc_bb.run_vc_bb(`INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (?);`, [ins.lastID]);
          }
        }
      }
    }

    res_vc_bb.json({ message: 'Usuario actualizado' });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

export const deleteUsuario_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    // Borrar el usuario; las relaciones por FK gestionan la integridad
    await db_vc_bb.run_vc_bb(`DELETE FROM td_Usuarios_bb_vc WHERE ID_usuario_bb_vc = ?;`, [id]);
    res_vc_bb.json({ message: 'Usuario eliminado' });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

export default {
  getAllUsuarios_vc_bb,
  createUsuario_vc_bb,
  updateUsuario_vc_bb,
  deleteUsuario_vc_bb
};
