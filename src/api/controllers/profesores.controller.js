import db_vc_bb from "../db.js";

export const getAllProfesores_vc_bb = async (req, res) => {
  try {
    const rows = await db_vc_bb.all_vc_bb(`
      SELECT p.ID_profesor_bb_vc, u.ID_usuario_bb_vc, u.userName_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.correo_bb_vc, u.telefono_bb_vc
      FROM td_Profesores_bb_vc p
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
      ORDER BY u.apellido_bb_vc, u.nombre_bb_vc;
    `);
    res.json(rows);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener profesores" });
  }
};

export const createProfesor_vc_bb = async (req, res) => {
  try {
    const { userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc } = req.body;
    if (!userName_bb_vc || !password_bb_vc) return res.status(400).json({ message: "Falta userName o password" });

    // 1) Insert usuario
    const userResult = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Usuarios_bb_vc (userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc) VALUES (?,?,?,?,?,?);`,
      [userName_bb_vc, correo_bb_vc || "", telefono_bb_vc || "", nombre_bb_vc || "", apellido_bb_vc || "", password_bb_vc]
    );

    // 2) Asociar rol Profesor
    const assignRoleResult = await db_vc_bb.run_vc_bb(`
      INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
      SELECT ?, ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Profesor'
    ;`, [userResult.lastID]);

    // 3) Insert en td_Profesores_bb_vc con el ID_usuarioRol insertado (buscarlo)
    const userRoleRow = await db_vc_bb.get_vc_bb(`
      SELECT ID_usuarioRol_bb_vc FROM td_UsuarioRol_bb_vc WHERE ID_usuario_usuarioRol_bb_vc = ? AND ID_rol_usuarioRol_bb_vc = (SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Profesor') LIMIT 1;
    `, [userResult.lastID]);

    const profResult = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (?);`,
      [userRoleRow.ID_usuarioRol_bb_vc]
    );

    res.status(201).json({ id_usuario: userResult.lastID, id_profesor: profResult.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: err_vc_bb.message || "Error al crear profesor" });
  }
};

export const deleteProfesor_vc_bb = async (req, res) => {
  try {
    const { id } = req.params; // aquí 'id' es ID_profesor_bb_vc
    // Obtenemos ID_usuarioRol y luego el ID_usuario para eliminar usuario (cascade en  td_UsuarioRol y td_Usuarios)
    const row = await db_vc_bb.get_vc_bb(`
      SELECT ur.ID_usuario_usuarioRol_bb_vc AS ID_usuario FROM td_Profesores_bb_vc p
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      WHERE p.ID_profesor_bb_vc = ? LIMIT 1;
    `, [id]);

    if (!row) return res.status(404).json({ message: "Profesor no encontrado" });

    // Borramos usuario; por cascada se borrará la fila en td_Profesores_bb_vc
    const result = await db_vc_bb.run_vc_bb(`DELETE FROM td_Usuarios_bb_vc WHERE ID_usuario_bb_vc = ?;`, [row.ID_usuario]);
    res.json({ message: "Profesor eliminado" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al eliminar profesor" });
  }
};
