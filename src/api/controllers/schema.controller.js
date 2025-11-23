import db_vc_bb from "../db.js";

class SchemaController_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (SchemaController_vc_bb.#instancia_vc_bb) {
      return SchemaController_vc_bb.#instancia_vc_bb;
    }
    SchemaController_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!SchemaController_vc_bb.#instancia_vc_bb) {
      SchemaController_vc_bb.#instancia_vc_bb = new SchemaController_vc_bb();
    }
    return SchemaController_vc_bb.#instancia_vc_bb;
  }

  async obtenerEsquemaTabla_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const tableMap_vc_bb = {
        usuarios: 'td_Usuarios_bb_vc',
        profesores: 'td_Profesores_bb_vc',
        asignaturas: 'td_Asignaturas_bb_vc',
        espacios: 'td_Espacios_bb_vc',
        secciones: 'td_Secciones_bb_vc',
        grados: 'td_Grados_bb_vc',
        disponibilidad: 'td_DisponibilidadProfesor_bb_vc'
      };

      const { tabla } = req_vc_bb.params;
      const real_vc_bb = tableMap_vc_bb[tabla];
      if (!real_vc_bb) return res_vc_bb.status(400).json({ message: 'Tabla desconocida' });

      const rows_vc_bb = await db_vc_bb.all_vc_bb(`PRAGMA table_info(${real_vc_bb});`);
      const cols_vc_bb = rows_vc_bb.map(r_vc_bb => r_vc_bb.name);
      res_vc_bb.json({ table: real_vc_bb, columns: cols_vc_bb });
    } catch (err_vc_bb) {
      console.error(err_vc_bb);
      res_vc_bb.status(500).json({ message: 'Error leyendo esquema' });
    }
  }
}

export default SchemaController_vc_bb;
