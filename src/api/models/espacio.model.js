import db_vc_bb from "../db.js";

export class EspacioModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (EspacioModel_vc_bb.#instancia_vc_bb) {
      return EspacioModel_vc_bb.#instancia_vc_bb;
    }
    EspacioModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!EspacioModel_vc_bb.#instancia_vc_bb) {
      EspacioModel_vc_bb.#instancia_vc_bb = new EspacioModel_vc_bb();
    }
    return EspacioModel_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb() {
    const sql_vc_bb = `
      SELECT e.*, te.tipo_bb_vc as tipoEspacio_bb_vc
      FROM td_Espacios_bb_vc e
      LEFT JOIN td_TipoEspacio_bb_vc te ON e.ID_TipoEspacio_espacio_bb_vc = te.ID_TipoEspacio_bb_vc
      ORDER BY e.nombre_bb_vc
    `;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerPorId_vc_bb(id_vc_bb) {
    const sql_vc_bb = `
      SELECT e.*, te.tipo_bb_vc as tipoEspacio_bb_vc
      FROM td_Espacios_bb_vc e
      LEFT JOIN td_TipoEspacio_bb_vc te ON e.ID_TipoEspacio_espacio_bb_vc = te.ID_TipoEspacio_bb_vc
      WHERE e.ID_espacio_bb_vc = ?
      LIMIT 1
    `;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [id_vc_bb]);
  }

  async obtenerTiposEspacio_vc_bb() {
    const sql_vc_bb = `SELECT * FROM td_TipoEspacio_bb_vc ORDER BY tipo_bb_vc`;
    return await db_vc_bb.all_vc_bb(sql_vc_bb);
  }

  async obtenerTipoEspacioPorNombre_vc_bb(nombre_vc_bb) {
    const sql_vc_bb = `SELECT * FROM td_TipoEspacio_bb_vc WHERE tipo_bb_vc = ? LIMIT 1`;
    return await db_vc_bb.get_vc_bb(sql_vc_bb, [nombre_vc_bb]);
  }

  async crear_vc_bb({ nombre_vc_bb, capacidad_vc_bb = null, ID_TipoEspacio_espacio_vc_bb = null }) {
    if (!nombre_vc_bb || nombre_vc_bb.trim() === '') {
      throw new Error('El nombre del espacio es requerido');
    }
    const sql_vc_bb = `
      INSERT INTO td_Espacios_bb_vc (nombre_bb_vc, capacidad_bb_vc, ID_TipoEspacio_espacio_bb_vc)
      VALUES (?, ?, ?)
    `;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [nombre_vc_bb, capacidad_vc_bb, ID_TipoEspacio_espacio_vc_bb]);
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
    const sql_vc_bb = `UPDATE td_Espacios_bb_vc SET ${campos_vc_bb.join(', ')} WHERE ID_espacio_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, valores_vc_bb);
    return result_vc_bb.changes;
  }

  async eliminar_vc_bb(id_vc_bb) {
    const sql_vc_bb = `DELETE FROM td_Espacios_bb_vc WHERE ID_espacio_bb_vc = ?`;
    const result_vc_bb = await db_vc_bb.run_vc_bb(sql_vc_bb, [id_vc_bb]);
    return result_vc_bb.changes;
  }
}