// src/middleware/auth.middleware.js
import db_vc_bb from "../api/db.js";

/**
 * requireAdmin_vc_bb
 * - Espera header: x-user-id (ID_usuario_bb_vc)
 * - Consulta la tabla td_UsuarioRol_bb_vc -> td_Rol_bb_vc para comprobar rol
 */
export const requireAdmin_vc_bb = async (req, res, next) => {
  try {
    const userId_vc_bb = req.header("x-user-id");
    if (!userId_vc_bb) {
      return res.status(401).json({ message: "Falta header x-user-id" });
    }

    // Obtenemos rol(s) del usuario
    const rolRow_vc_bb = await db_vc_bb.get_vc_bb(
      `SELECT r.rol_bb_vc
       FROM td_UsuarioRol_bb_vc ur
       JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
       WHERE ur.ID_usuario_usuarioRol_bb_vc = ?
       LIMIT 1;`,
      [userId_vc_bb]
    );

    if (!rolRow_vc_bb || rolRow_vc_bb.rol_bb_vc !== "Administrador") {
      return res.status(403).json({ message: "Acceso denegado: se requiere rol Administrador" });
    }

    // Pasamos userId en req para que controladores lo puedan usar si es necesario
    req.user_vc_bb = { id: Number(userId_vc_bb), rol: rolRow_vc_bb.rol_bb_vc };
    next();
  } catch (err_vc_bb) {
    console.error("❌ Error en requireAdmin_vc_bb:", err_vc_bb.message);
    res.status(500).json({ message: "Error en autorización" });
  }
};
/*
AuthMiddleware (SQLite)
- Verifica sesión y rol del usuario.
- Controla acceso a rutas públicas y protegidas.
*/
