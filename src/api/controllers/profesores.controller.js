import db_vc_bb from "../db.js";

export const getAllProfesores_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const rows_vc_bb = await db_vc_bb.all_vc_bb(`
      SELECT p.ID_profesor_bb_vc, u.ID_usuario_bb_vc, u.userName_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.correo_bb_vc, u.telefono_bb_vc
      FROM td_Profesores_bb_vc p
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
      ORDER BY u.apellido_bb_vc, u.nombre_bb_vc;
    `);
    res_vc_bb.json(rows_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener profesores" });
  }
};

export const createProfesor_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc } = req_vc_bb.body;
    if (!userName_bb_vc || !password_bb_vc) return res_vc_bb.status(400).json({ message: "Falta userName o password" });

    // 1) Insert usuario
    const userResult_vc_bb = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Usuarios_bb_vc (userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc) VALUES (?,?,?,?,?,?);`,
      [userName_bb_vc, correo_bb_vc || "", telefono_bb_vc || "", nombre_bb_vc || "", apellido_bb_vc || "", password_bb_vc]
    );

    // 2) Asociar rol Profesor
    const assignRoleResult_vc_bb = await db_vc_bb.run_vc_bb(`
      INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
      SELECT ?, ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Profesor'
    ;`, [userResult_vc_bb.lastID]);

    // 3) Insert en td_Profesores_bb_vc con el ID_usuarioRol insertado (buscarlo)
    const userRoleRow_vc_bb = await db_vc_bb.get_vc_bb(`
      SELECT ID_usuarioRol_bb_vc FROM td_UsuarioRol_bb_vc WHERE ID_usuario_usuarioRol_bb_vc = ? AND ID_rol_usuarioRol_bb_vc = (SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Profesor') LIMIT 1;
    `, [userResult_vc_bb.lastID]);

    const profResult_vc_bb = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (?);`,
      [userRoleRow_vc_bb.ID_usuarioRol_bb_vc]
    );

    res_vc_bb.status(201).json({ id_usuario: userResult_vc_bb.lastID, id_profesor: profResult_vc_bb.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: err_vc_bb.message || "Error al crear profesor" });
  }
};

export const deleteProfesor_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params; // aquí 'id' es ID_profesor_bb_vc
    // Obtenemos ID_usuarioRol y luego el ID_usuario para eliminar usuario (cascade en  td_UsuarioRol y td_Usuarios)
    const row_vc_bb = await db_vc_bb.get_vc_bb(`
      SELECT ur.ID_usuario_usuarioRol_bb_vc AS ID_usuario FROM td_Profesores_bb_vc p
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      WHERE p.ID_profesor_bb_vc = ? LIMIT 1;
    `, [id]);

    if (!row_vc_bb) return res_vc_bb.status(404).json({ message: "Profesor no encontrado" });

    // Borramos usuario; por cascada se borrará la fila en td_Profesores_bb_vc
    const result_vc_bb = await db_vc_bb.run_vc_bb(`DELETE FROM td_Usuarios_bb_vc WHERE ID_usuario_bb_vc = ?;`, [row_vc_bb.ID_usuario]);
    res_vc_bb.json({ message: "Profesor eliminado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al eliminar profesor" });
  }
};
/*
ProfesoresController (SQLite)
- Endpoints CRUD de profesores.
- Vinculación de asignaturas y gestión de disponibilidad.
*/
