import db_vc_bb from "../db.js";

// Función para obtener la info de un profesor
export const showTeacher_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const teachers_vc_bb = await db_vc_bb.all_vc_bb(`
      SELECT u.ID_usuario_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.userName_bb_vc, r.rol_bb_vc
      FROM td_Usuarios_bb_vc u
      JOIN td_UsuarioRol_bb_vc ur ON u.ID_usuario_bb_vc = ur.ID_usuario_usuarioRol_bb_vc
      JOIN td_Rol_bb_vc r ON ur.ID_rol_usuarioRol_bb_vc = r.ID_rol_bb_vc
      WHERE r.rol_bb_vc = 'Profesor';
    `);
    res_vc_bb.json(teachers_vc_bb);
  } catch (error) {
    console.error("❌ Error obteniendo profesores:", error.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
