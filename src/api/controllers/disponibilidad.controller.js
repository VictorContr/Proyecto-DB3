import db_vc_bb from "../db.js";

export const getDisponibilidadProfesor_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const rows_vc_bb = await db_vc_bb.all_vc_bb(`
      SELECT dp.ID_DisponibilidadProfesor_bb_vc, d.dia_bb_vc, b.hora_bloque_bb_vc, u.userName_bb_vc, p.ID_profesor_bb_vc
      FROM td_DisponibilidadProfesor_bb_vc dp
      JOIN td_Dia_bb_vc d ON dp.ID_dia_DispProfesor_bb_vc = d.ID_dia_bb_vc
      JOIN td_Bloque_bb_vc b ON dp.ID_bloque_DispProfesor_bb_vc = b.ID_bloque_bb_vc
      JOIN td_Profesores_bb_vc p ON dp.ID_profesor_DispProfesor_bb_vc = p.ID_profesor_bb_vc
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
      ORDER BY d.ID_dia_bb_vc, b.ID_bloque_bb_vc;
    `);
    res_vc_bb.json(rows_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener disponibilidad profesor" });
  }
};


export const createDisponibilidadProfesor_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc } = req_vc_bb.body;
    if (!ID_dia_DispProfesor_bb_vc || !ID_bloque_DispProfesor_bb_vc || !ID_profesor_DispProfesor_bb_vc) {
      return res_vc_bb.status(400).json({ message: "Faltan datos" });
    }
    const result_vc_bb = await db_vc_bb.run_vc_bb(`
      INSERT OR IGNORE INTO td_DisponibilidadProfesor_bb_vc (ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc) VALUES (?,?,?);
    `, [ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc]);
    res_vc_bb.status(201).json({ id: result_vc_bb.lastID });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al crear disponibilidad profesor" });
  }
};


export const deleteDisponibilidadProfesor_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const result_vc_bb = await db_vc_bb.run_vc_bb(`DELETE FROM td_DisponibilidadProfesor_bb_vc WHERE ID_DisponibilidadProfesor_bb_vc = ?;`, [id]);
    if (result_vc_bb.changes === 0) return res_vc_bb.status(404).json({ message: "Disponibilidad profesor no encontrada" });
    res_vc_bb.json({ message: "Disponibilidad profesor eliminada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al eliminar disponibilidad profesor" });
  }
};


export const updateDisponibilidadProfesor_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const { id } = req_vc_bb.params;
    const { ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc } = req_vc_bb.body;
    if (!ID_dia_DispProfesor_bb_vc || !ID_bloque_DispProfesor_bb_vc || !ID_profesor_DispProfesor_bb_vc) {
      return res_vc_bb.status(400).json({ message: 'Faltan datos para actualizar' });
    }
    const result_vc_bb = await db_vc_bb.run_vc_bb(`
      UPDATE td_DisponibilidadProfesor_bb_vc
      SET ID_dia_DispProfesor_bb_vc = ?, ID_bloque_DispProfesor_bb_vc = ?, ID_profesor_DispProfesor_bb_vc = ?
      WHERE ID_DisponibilidadProfesor_bb_vc = ?;
    `, [ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc, id]);
    if (result_vc_bb.changes === 0) return res_vc_bb.status(404).json({ message: 'Disponibilidad profesor no encontrada' });
    res_vc_bb.json({ message: 'Disponibilidad profesor actualizada' });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: 'Error al actualizar disponibilidad profesor' });
  }
};

/*
DisponibilidadController (SQLite)
- Endpoints para gestión de disponibilidad de profesores.
- Consultas y actualización de días/bloques disponibles.
*/
