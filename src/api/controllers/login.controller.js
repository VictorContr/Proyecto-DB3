import db_vc_bb from "../db.js";

// Controlador para inicio de sesión (admin o profesor)
export const login_vc_bb = async (req_vc_bb, res_vc_bb) => {
  const { userName_bb_vc, password_bb_vc } = req_vc_bb.body;

  try {
    const user_vc_bb = await db_vc_bb.get_vc_bb(
      `
      SELECT 
        u.ID_usuario_bb_vc AS ID_usuario,
        u.nombre_bb_vc AS nombre,
        u.apellido_bb_vc AS apellido,
        u.correo_bb_vc AS correo,
        u.telefono_bb_vc AS telefono,
        u.userName_bb_vc AS userName,
        r.rol_bb_vc AS rol,
        p.ID_profesor_bb_vc AS ID_profesor
      FROM td_Usuarios_bb_vc u
      LEFT JOIN td_UsuarioRol_bb_vc ur ON u.ID_usuario_bb_vc = ur.ID_usuario_usuarioRol_bb_vc
      LEFT JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      LEFT JOIN td_Profesores_bb_vc p ON ur.ID_usuarioRol_bb_vc = p.ID_usuarioRol_profesor_bb_vc
      WHERE u.userName_bb_vc = ? AND u.password_bb_vc = ?
      `,
      [userName_bb_vc, password_bb_vc]
    );

    if (!user_vc_bb) {
      return res_vc_bb.status(401).json({ message: "Credenciales inválidas" });
    }

    res_vc_bb.json({
      ID_usuario: user_vc_bb.ID_usuario,
      nombre: user_vc_bb.nombre,
      apellido: user_vc_bb.apellido,
      correo: user_vc_bb.correo,
      telefono: user_vc_bb.telefono,
      userName: user_vc_bb.userName,
      rol: user_vc_bb.rol,
      ID_profesor: user_vc_bb.ID_profesor || null // puede ser null si no es profesor
    });
  } catch (error_vc_bb) {
    console.error("Error en login:", error_vc_bb);
    res_vc_bb.status(500).json({ message: "Error en el servidor" });
  }
};