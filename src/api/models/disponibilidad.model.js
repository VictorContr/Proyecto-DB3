import db_vc_bb from "../db.js";

export class DisponibilidadModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (DisponibilidadModel_vc_bb.#instancia_vc_bb) {
      return DisponibilidadModel_vc_bb.#instancia_vc_bb;
    }
    DisponibilidadModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!DisponibilidadModel_vc_bb.#instancia_vc_bb) {
      DisponibilidadModel_vc_bb.#instancia_vc_bb = new DisponibilidadModel_vc_bb();
    }
    return DisponibilidadModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerDisponibilidadProfesor_vc_bb() {
    const sql_vc_bb = `
      SELECT dp.ID_DisponibilidadProfesor_bb_vc, d.dia_bb_vc, b.hora_bloque_bb_vc, u.nombre_bb_vc || ' ' || u.apellido_bb_vc as profesor_bb_vc
      FROM td_DisponibilidadProfesor_bb_vc dp
      JOIN td_Dia_bb_vc d ON dp.ID_dia_DispProfesor_bb_vc = d.ID_dia_bb_vc
      JOIN td_Bloque_bb_vc b ON dp.ID_bloque_DispProfesor_bb_vc = b.ID_bloque_bb_vc
      JOIN td_Profesores_bb_vc p ON dp.ID_profesor_DispProfesor_bb_vc = p.ID_profesor_bb_vc
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
      ORDER BY d.ID_dia_bb_vc, b.ID_bloque_bb_vc, u.nombre_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerDisponibilidadEspacio_vc_bb() {
    const sql_vc_bb = `
      SELECT de.ID_DisponibilidadEspacio_bb_vc, d.dia_bb_vc, b.hora_bloque_bb_vc, e.nombre_bb_vc as espacio_bb_vc
      FROM td_DisponibilidadEspacio_bb_vc de
      JOIN td_Dia_bb_vc d ON de.ID_dia_DispEspacio_bb_vc = d.ID_dia_bb_vc
      JOIN td_Bloque_bb_vc b ON de.ID_bloque_DispEspacio_bb_vc = b.ID_bloque_bb_vc
      JOIN td_Espacios_bb_vc e ON de.ID_espacio_DispEspacio_bb_vc = e.ID_espacio_bb_vc
      ORDER BY d.ID_dia_bb_vc, b.ID_bloque_bb_vc, e.nombre_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async crearDisponibilidadProfesor_vc_bb({ ID_dia_vc_bb, ID_bloque_vc_bb, ID_profesor_vc_bb }) {
    if (!ID_dia_vc_bb || !ID_bloque_vc_bb || !ID_profesor_vc_bb) {
      throw new Error('Día, bloque y profesor son requeridos');
    }
    const sql_vc_bb = `
      INSERT INTO td_DisponibilidadProfesor_bb_vc (ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc)
      VALUES (?, ?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [ID_dia_vc_bb, ID_bloque_vc_bb, ID_profesor_vc_bb]);
    return result_vc_bb.lastID;
  }

  async crearDisponibilidadEspacio_vc_bb({ ID_dia_vc_bb, ID_bloque_vc_bb, ID_espacio_vc_bb }) {
    if (!ID_dia_vc_bb || !ID_bloque_vc_bb || !ID_espacio_vc_bb) {
      throw new Error('Día, bloque y espacio son requeridos');
    }
    const sql_vc_bb = `
      INSERT INTO td_DisponibilidadEspacio_bb_vc (ID_dia_DispEspacio_bb_vc, ID_bloque_DispEspacio_bb_vc, ID_espacio_DispEspacio_bb_vc)
      VALUES (?, ?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [ID_dia_vc_bb, ID_bloque_vc_bb, ID_espacio_vc_bb]);
    return result_vc_bb.lastID;
  }

  async actualizarDisponibilidadProfesor_vc_bb(id_vc_bb, { ID_dia_vc_bb, ID_bloque_vc_bb, ID_profesor_vc_bb }) {
    if (!ID_dia_vc_bb || !ID_bloque_vc_bb || !ID_profesor_vc_bb) {
      throw new Error('Día, bloque y profesor son requeridos');
    }
    const sql_vc_bb = `
      UPDATE td_DisponibilidadProfesor_bb_vc
      SET ID_dia_DispProfesor_bb_vc = ?, ID_bloque_DispProfesor_bb_vc = ?, ID_profesor_DispProfesor_bb_vc = ?
      WHERE ID_DisponibilidadProfesor_bb_vc = ?
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [ID_dia_vc_bb, ID_bloque_vc_bb, ID_profesor_vc_bb, id_vc_bb]);
    return result_vc_bb.changes;
  }

  async actualizarDisponibilidadEspacio_vc_bb(id_vc_bb, { ID_dia_vc_bb, ID_bloque_vc_bb, ID_espacio_vc_bb }) {
    if (!ID_dia_vc_bb || !ID_bloque_vc_bb || !ID_espacio_vc_bb) {
      throw new Error('Día, bloque y espacio son requeridos');
    }
    const sql_vc_bb = `
      UPDATE td_DisponibilidadEspacio_bb_vc
      SET ID_dia_DispEspacio_bb_vc = ?, ID_bloque_DispEspacio_bb_vc = ?, ID_espacio_DispEspacio_bb_vc = ?
      WHERE ID_DisponibilidadEspacio_bb_vc = ?
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [ID_dia_vc_bb, ID_bloque_vc_bb, ID_espacio_vc_bb, id_vc_bb]);
    return result_vc_bb.changes;
  }

  async eliminarDisponibilidadProfesor_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_DisponibilidadProfesor_bb_vc WHERE ID_DisponibilidadProfesor_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }

  async eliminarDisponibilidadEspacio_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_DisponibilidadEspacio_bb_vc WHERE ID_DisponibilidadEspacio_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }
}