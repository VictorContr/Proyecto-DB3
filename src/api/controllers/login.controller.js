import db_vc_bb from "../db.js";

// Controlador para inicio de sesión (admin o profesor)
export const login_vc_bb = async (req, res) => {
  const { userName_bb_vc, password_bb_vc } = req.body;

  try {
    const user_vc_bb = await db_vc_bb.get_vc_bb(
      `
      SELECT u.*, r.rol_bb_vc AS nombre_rol_bb_vc
      FROM td_Usuarios_bb_vc u
      LEFT JOIN td_UsuarioRol_bb_vc ur ON u.ID_usuario_bb_vc = ur.ID_usuario_usuarioRol_bb_vc
      LEFT JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      WHERE u.userName_bb_vc = ? AND u.password_bb_vc = ?
    `,
      [userName_bb_vc, password_bb_vc]
    );

    if (!user_vc_bb) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    res.json({
      ID_usuario: user_vc_bb.ID_usuario_bb_vc,
      nombre: user_vc_bb.nombre_bb_vc,
      apellido: user_vc_bb.apellido_bb_vc,
      correo: user_vc_bb.correo_bb_vc,
      telefono: user_vc_bb.telefono_bb_vc,
      userName: user_vc_bb.userName_bb_vc,
      rol: user_vc_bb.nombre_rol_bb_vc || "Sin rol asignado",
    });
  } catch (error_vc_bb) {
    console.error("Error en login:", error_vc_bb);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
