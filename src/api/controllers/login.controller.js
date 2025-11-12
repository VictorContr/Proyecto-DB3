import db_vc_bb from "../db.js";

// Controlador para inicio de sesión (admin o profesor)
export const login_vc_bb = async (req, res) => {
  try {
    const { userName_bb_vc, password_bb_vc } = req.body;

    if (!userName_bb_vc || !password_bb_vc) {
      return res.status(400).json({ message: "Faltan credenciales." });
    }

    // Buscar el usuario en la BD (sin importar el rol)
    const user = await db_vc_bb.get_vc_bb(`
      SELECT u.*, r.rol_bb_vc
      FROM td_Usuarios_bb_vc u
      JOIN td_UsuarioRol_bb_vc ur 
        ON u.ID_usuario_bb_vc = ur.ID_usuario_usuarioRol_bb_vc
      JOIN td_Rol_bb_vc r 
        ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      WHERE u.userName_bb_vc = ?
    `, [userName_bb_vc]);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Validar contraseña
    if (user.password_bb_vc !== password_bb_vc) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Éxito → devolver usuario con rol
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      usuario: {
        id: user.ID_usuario_bb_vc,
        nombre: user.nombre_bb_vc,
        apellido: user.apellido_bb_vc,
        rol: user.rol_bb_vc, // El rol puede usarse luego para permisos
      },
    });

  } catch (error) {
    console.error("❌ Error en login:", error.message);
    res.status(500).json({ message: "Error en el servidor." });
  }
};
