import db_vc_bb from "../db.js";

export class AsignaturaModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (AsignaturaModel_vc_bb.#instancia_vc_bb) {
      return AsignaturaModel_vc_bb.#instancia_vc_bb;
    }
    AsignaturaModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!AsignaturaModel_vc_bb.#instancia_vc_bb) {
      AsignaturaModel_vc_bb.#instancia_vc_bb = new AsignaturaModel_vc_bb();
    }
    return AsignaturaModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `
      SELECT 
        a.*, 
        te.tipo_bb_vc as tipoEspacio_bb_vc,
        COALESCE(GROUP_CONCAT(g.nro_grado_bb_vc, ' | '), '') AS grados_vc_bb
      FROM td_Asignaturas_bb_vc a
      LEFT JOIN td_TipoEspacio_bb_vc te ON a.ID_TipoEspacio_requerido_bb_vc = te.ID_TipoEspacio_bb_vc
      LEFT JOIN td_GradosAsignaturas_bb_vc ga ON ga.ID_asignatura_gradoAsig_bb_vc = a.ID_asignatura_bb_vc
      LEFT JOIN td_Grados_bb_vc g ON ga.ID_grado_gradoAsig_bb_vc = g.ID_grado_bb_vc
      GROUP BY a.ID_asignatura_bb_vc
      ORDER BY a.nombre_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `
      SELECT a.*, te.tipo_bb_vc as tipoEspacio_bb_vc
      FROM td_Asignaturas_bb_vc a
      LEFT JOIN td_TipoEspacio_bb_vc te ON a.ID_TipoEspacio_requerido_bb_vc = te.ID_TipoEspacio_bb_vc
      WHERE a.ID_asignatura_bb_vc = ?
      LIMIT 1
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async obtenerPorNombre_vc_bb(nombre_vc_bb) {
    const sql_vc_bb = `
      SELECT a.*, te.tipo_bb_vc as tipoEspacio_bb_vc
      FROM td_Asignaturas_bb_vc a
      LEFT JOIN td_TipoEspacio_bb_vc te ON a.ID_TipoEspacio_requerido_bb_vc = te.ID_TipoEspacio_bb_vc
      WHERE a.nombre_bb_vc = ?
      LIMIT 1
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [nombre_vc_bb]);
  }

  async crear_vc_bb({ nombre_bb_vc, horas_academicas_bb_vc = null, descripcion_bb_vc = null, duracion_bloque_min_bb_vc = 1, duracion_bloque_max_bb_vc = 1, ID_TipoEspacio_requerido_bb_vc = null }) {
    if (!nombre_bb_vc || nombre_bb_vc.trim() === '') {
      throw new Error('El nombre de la asignatura es requerido');
    }
    const sql_vc_bb = `
      INSERT INTO td_Asignaturas_bb_vc (nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc]);
    return result_vc_bb.lastID;
  }

  async actualizar_vc_bb(id_vc_bb, datos_vc_bb) {
    const campos_vc_bb = [];
    const valores_vc_bb = [];
    
    for (const [clave_vc_bb, valor_vc_bb] of Object.entries(datos_vc_bb)) {
      if (clave_vc_bb !== 'id' && valor_vc_bb !== undefined) {
        campos_vc_bb.push(`${clave_vc_bb} = ?`);
        valores_vc_bb.push(valor_vc_bb);
      }
    }
    
    if (campos_vc_bb.length === 0) return 0;
    
    valores_vc_bb.push(id_vc_bb);
    const sql_vc_bb = `UPDATE td_Asignaturas_bb_vc SET ${campos_vc_bb.join(', ')} WHERE ID_asignatura_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, valores_vc_bb);
    return result_vc_bb.changes;
  }

  async eliminar_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_Asignaturas_bb_vc WHERE ID_asignatura_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }

  async obtenerAsignaturasPorGrado_vc_bb(idGrado_vc_bb) {
    const sql_vc_bb = `
      SELECT a.*, te.tipo_bb_vc as tipoEspacio_bb_vc
      FROM td_Asignaturas_bb_vc a
      JOIN td_GradosAsignaturas_bb_vc ga ON a.ID_asignatura_bb_vc = ga.ID_asignatura_gradoAsig_bb_vc
      LEFT JOIN td_TipoEspacio_bb_vc te ON a.ID_TipoEspacio_requerido_bb_vc = te.ID_TipoEspacio_bb_vc
      WHERE ga.ID_grado_gradoAsig_bb_vc = ?
      ORDER BY a.nombre_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb, [idGrado_vc_bb]);
  }

  async vincularConGrado_vc_bb(idAsignatura_vc_bb, idGrado_vc_bb) {
    const sql_vc_bb = `
      INSERT OR IGNORE INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc)
      VALUES (?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [idGrado_vc_bb, idAsignatura_vc_bb]);
    return result_vc_bb.changes;
  }

  async desvincularConGrado_vc_bb(idAsignatura_vc_bb, idGrado_vc_bb) {
    const sql_vc_bb = `
      DELETE FROM td_GradosAsignaturas_bb_vc 
      WHERE ID_grado_gradoAsig_bb_vc = ? AND ID_asignatura_gradoAsig_bb_vc = ?
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [idGrado_vc_bb, idAsignatura_vc_bb]);
    return result_vc_bb.changes;
  }
}
