import db_vc_bb from "../db.js";

export class ClaseModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (ClaseModel_vc_bb.#instancia_vc_bb) {
      return ClaseModel_vc_bb.#instancia_vc_bb;
    }
    ClaseModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!ClaseModel_vc_bb.#instancia_vc_bb) {
      ClaseModel_vc_bb.#instancia_vc_bb = new ClaseModel_vc_bb();
    }
    return ClaseModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `
      SELECT c.ID_clase_bb_vc, g.nro_grado_bb_vc, s.letra_seccion_bb_vc
      FROM td_Clases_bb_vc c
      JOIN td_Grados_bb_vc g ON c.ID_grado_clase_bb_vc = g.ID_grado_bb_vc
      JOIN td_Secciones_bb_vc s ON c.ID_seccion_clase_bb_vc = s.ID_seccion_bb_vc
      ORDER BY g.nro_grado_bb_vc, s.letra_seccion_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `
      SELECT c.ID_clase_bb_vc, g.nro_grado_bb_vc, s.letra_seccion_bb_vc
      FROM td_Clases_bb_vc c
      JOIN td_Grados_bb_vc g ON c.ID_grado_clase_bb_vc = g.ID_grado_bb_vc
      JOIN td_Secciones_bb_vc s ON c.ID_seccion_clase_bb_vc = s.ID_seccion_bb_vc
      WHERE c.ID_clase_bb_vc = ?
      LIMIT 1
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async crear_vc_bb({ ID_grado_clase_vc_bb, ID_seccion_clase_vc_bb }) {
    if (!ID_grado_clase_vc_bb || !ID_seccion_clase_vc_bb) {
      throw new Error('Grado y sección son requeridos');
    }
    const sql_vc_bb = `INSERT OR IGNORE INTO td_Clases_bb_vc (ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc) VALUES (?, ?)`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [ID_grado_clase_vc_bb, ID_seccion_clase_vc_bb]);
    return result_vc_bb.lastID;
  }

  async eliminar_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_Clases_bb_vc WHERE ID_clase_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }
}