import { AsignaturaModel_vc_bb, GradoModel_vc_bb } from "../models/index.js";

class AsignaturaController_vc_bb {
  static #instancia_vc_bb = null;

<<<<<<< HEAD
  constructor() {
    if (AsignaturaController_vc_bb.#instancia_vc_bb) {
      return AsignaturaController_vc_bb.#instancia_vc_bb;
    }
    this.asignaturaModel_vc_bb = AsignaturaModel_vc_bb.obtenerInstancia_vc_bb();
    this.gradoModel_vc_bb = GradoModel_vc_bb.obtenerInstancia_vc_bb();
    AsignaturaController_vc_bb.#instancia_vc_bb = this;
=======
export const createAsignatura_vc_bb = async (req, res) => {
  try {
    const { nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc, ID_grado_bb_vc, nro_grado_bb_vc } = req.body;
    if (!nombre_bb_vc) return res.status(400).json({ message: "Falta nombre" });
    const result = await db_vc_bb.run_vc_bb(
      `INSERT INTO td_Asignaturas_bb_vc (nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc) VALUES (?,?,?,?,?,?);`,
      [nombre_bb_vc, horas_academicas_bb_vc || null, descripcion_bb_vc || null, duracion_bloque_min_bb_vc || 1, duracion_bloque_max_bb_vc || 1, ID_TipoEspacio_requerido_bb_vc || null]
    );
    const newAsigId_vc_bb = result.lastID;

    let gradoId_vc_bb = null;
    if (ID_grado_bb_vc != null) {
      gradoId_vc_bb = parseInt(String(ID_grado_bb_vc).trim(), 10);
    } else if (nro_grado_bb_vc != null) {
      const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
      if (Number.isInteger(parsed_vc_bb)) {
        const gradoRow_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_grado_bb_vc FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ?;`, [parsed_vc_bb]);
        gradoId_vc_bb = gradoRow_vc_bb ? gradoRow_vc_bb.ID_grado_bb_vc : null;
      }
    }

    if (gradoId_vc_bb != null) {
      const existsRel_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_gradoAsignatura_bb_vc FROM td_GradosAsignaturas_bb_vc WHERE ID_grado_gradoAsig_bb_vc = ? AND ID_asignatura_gradoAsig_bb_vc = ?;`, [gradoId_vc_bb, newAsigId_vc_bb]);
      if (!existsRel_vc_bb) {
        await db_vc_bb.run_vc_bb(`INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc) VALUES (?, ?);`, [gradoId_vc_bb, newAsigId_vc_bb]);
      }
    }

    res.status(201).json({ id: newAsigId_vc_bb });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: err_vc_bb.message || "Error al crear asignatura" });
>>>>>>> 54018063647aa95c573d06690f4211958d621f0a
  }

<<<<<<< HEAD
  static obtenerInstancia_vc_bb() {
    if (!AsignaturaController_vc_bb.#instancia_vc_bb) {
      AsignaturaController_vc_bb.#instancia_vc_bb = new AsignaturaController_vc_bb();
    }
    return AsignaturaController_vc_bb.#instancia_vc_bb;
=======
export const updateAsignatura_vc_bb = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const result = await db_vc_bb.run_vc_bb(
      `UPDATE td_Asignaturas_bb_vc SET nombre_bb_vc = ?, horas_academicas_bb_vc = ?, descripcion_bb_vc = ?, duracion_bloque_min_bb_vc = ?, duracion_bloque_max_bb_vc = ?, ID_TipoEspacio_requerido_bb_vc = ? WHERE ID_asignatura_bb_vc = ?;`,
      [payload.nombre_bb_vc, payload.horas_academicas_bb_vc, payload.descripcion_bb_vc, payload.duracion_bloque_min_bb_vc, payload.duracion_bloque_max_bb_vc, payload.ID_TipoEspacio_requerido_bb_vc, id]
    );
    if (result.changes === 0) return res.status(404).json({ message: "Asignatura no encontrada" });

    let gradoId_vc_bb = null;
    if (payload.ID_grado_bb_vc != null) {
      gradoId_vc_bb = parseInt(String(payload.ID_grado_bb_vc).trim(), 10);
    } else if (payload.nro_grado_bb_vc != null) {
      const parsed_vc_bb = parseInt(String(payload.nro_grado_bb_vc).trim(), 10);
      if (Number.isInteger(parsed_vc_bb)) {
        const gradoRow_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_grado_bb_vc FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ?;`, [parsed_vc_bb]);
        gradoId_vc_bb = gradoRow_vc_bb ? gradoRow_vc_bb.ID_grado_bb_vc : null;
      }
    }

    if (gradoId_vc_bb != null) {
      const existsRel_vc_bb = await db_vc_bb.get_vc_bb(`SELECT ID_gradoAsignatura_bb_vc FROM td_GradosAsignaturas_bb_vc WHERE ID_grado_gradoAsig_bb_vc = ? AND ID_asignatura_gradoAsig_bb_vc = ?;`, [gradoId_vc_bb, id]);
      if (!existsRel_vc_bb) {
        await db_vc_bb.run_vc_bb(`INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc) VALUES (?, ?);`, [gradoId_vc_bb, id]);
      }
    }

    res.json({ message: "Asignatura actualizada" });
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al actualizar asignatura" });
>>>>>>> 54018063647aa95c573d06690f4211958d621f0a
  }

  async obtenerTodas_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const asignaturas_vc_bb = await this.asignaturaModel_vc_bb.obtenerTodos_vc_bb();
      res_vc_bb.json(asignaturas_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener asignaturas:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al obtener asignaturas',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async obtenerPorId_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      const asignatura_vc_bb = await this.asignaturaModel_vc_bb.obtenerPorId_vc_bb(id);
      
      if (!asignatura_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Asignatura no encontrada' 
        });
      }

      res_vc_bb.json(asignatura_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener asignatura por ID:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al obtener asignatura',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async crear_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { 
        nombre_bb_vc, 
        horas_academicas_bb_vc, 
        descripcion_bb_vc, 
        duracion_bloque_min_bb_vc, 
        duracion_bloque_max_bb_vc, 
        ID_TipoEspacio_requerido_bb_vc, 
        ID_grado_bb_vc, 
        nro_grado_bb_vc 
      } = req_vc_bb.body;

      // Validación básica
      if (!nombre_bb_vc) {
        return res_vc_bb.status(400).json({ 
          mensaje_vc_bb: 'El nombre de la asignatura es requerido' 
        });
      }

      // Verificar si la asignatura ya existe
      const asignaturaExistente_vc_bb = await this.asignaturaModel_vc_bb.obtenerPorNombre_vc_bb(nombre_bb_vc);
      if (asignaturaExistente_vc_bb) {
        return res_vc_bb.status(409).json({ 
          mensaje_vc_bb: 'La asignatura ya existe' 
        });
      }

      // Crear asignatura
      const idAsignatura_vc_bb = await this.asignaturaModel_vc_bb.crear_vc_bb({
        nombre_bb_vc,
        horas_academicas_bb_vc: horas_academicas_bb_vc || null,
        descripcion_bb_vc: descripcion_bb_vc || null,
        duracion_bloque_min_bb_vc: duracion_bloque_min_bb_vc || 1,
        duracion_bloque_max_bb_vc: duracion_bloque_max_bb_vc || 1,
        ID_TipoEspacio_requerido_bb_vc: ID_TipoEspacio_requerido_bb_vc || null
      });

      // Vincular con grado si se proporciona
      const idGrado_vc_bb = await this.#obtenerIdGrado_vc_bb(ID_grado_bb_vc, nro_grado_bb_vc);
      if (idGrado_vc_bb) {
        await this.asignaturaModel_vc_bb.vincularConGrado_vc_bb(idAsignatura_vc_bb, idGrado_vc_bb);
      }

      res_vc_bb.status(201).json({ 
        mensaje_vc_bb: 'Asignatura creada exitosamente',
        id_asignatura_vc_bb: idAsignatura_vc_bb 
      });
    } catch (error_vc_bb) {
      console.error('Error al crear asignatura:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al crear asignatura',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async actualizar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      const payload_vc_bb = req_vc_bb.body;

      // Verificar si la asignatura existe
      const asignaturaExistente_vc_bb = await this.asignaturaModel_vc_bb.obtenerPorId_vc_bb(id);
      if (!asignaturaExistente_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Asignatura no encontrada' 
        });
      }

      // Actualizar asignatura
      const filasAfectadas_vc_bb = await this.asignaturaModel_vc_bb.actualizar_vc_bb(id, {
        nombre_bb_vc: payload_vc_bb.nombre_bb_vc,
        horas_academicas_bb_vc: payload_vc_bb.horas_academicas_bb_vc,
        descripcion_bb_vc: payload_vc_bb.descripcion_bb_vc,
        duracion_bloque_min_bb_vc: payload_vc_bb.duracion_bloque_min_bb_vc,
        duracion_bloque_max_bb_vc: payload_vc_bb.duracion_bloque_max_bb_vc,
        ID_TipoEspacio_requerido_bb_vc: payload_vc_bb.ID_TipoEspacio_requerido_bb_vc
      });

      if (filasAfectadas_vc_bb === 0) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Asignatura no encontrada' 
        });
      }

      // Actualizar relación con grado si se proporciona
      const idGrado_vc_bb = await this.#obtenerIdGrado_vc_bb(payload_vc_bb.ID_grado_bb_vc, payload_vc_bb.nro_grado_bb_vc);
      if (idGrado_vc_bb) {
        await this.asignaturaModel_vc_bb.vincularConGrado_vc_bb(id, idGrado_vc_bb);
      }

      res_vc_bb.json({ 
        mensaje_vc_bb: 'Asignatura actualizada exitosamente' 
      });
    } catch (error_vc_bb) {
      console.error('Error al actualizar asignatura:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al actualizar asignatura',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async eliminar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;

      // Verificar si la asignatura existe
      const asignaturaExistente_vc_bb = await this.asignaturaModel_vc_bb.obtenerPorId_vc_bb(id);
      if (!asignaturaExistente_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Asignatura no encontrada' 
        });
      }

      // Eliminar asignatura
      const filasAfectadas_vc_bb = await this.asignaturaModel_vc_bb.eliminar_vc_bb(id);
      if (filasAfectadas_vc_bb === 0) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Asignatura no encontrada' 
        });
      }

      res_vc_bb.json({ 
        mensaje_vc_bb: 'Asignatura eliminada exitosamente' 
      });
    } catch (error_vc_bb) {
      console.error('Error al eliminar asignatura:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al eliminar asignatura',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async obtenerAsignaturasPorGrado_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { idGrado } = req_vc_bb.params;
      
      // Verificar si el grado existe
      const gradoExistente_vc_bb = await this.gradoModel_vc_bb.obtenerPorId_vc_bb(idGrado);
      if (!gradoExistente_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Grado no encontrado' 
        });
      }

      const asignaturas_vc_bb = await this.asignaturaModel_vc_bb.obtenerAsignaturasPorGrado_vc_bb(idGrado);
      res_vc_bb.json(asignaturas_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener asignaturas por grado:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al obtener asignaturas por grado',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  // Método privado para obtener ID de grado
  async #obtenerIdGrado_vc_bb(ID_grado_bb_vc, nro_grado_bb_vc) {
    try {
      if (ID_grado_bb_vc != null) {
        return parseInt(String(ID_grado_bb_vc).trim(), 10);
      } else if (nro_grado_bb_vc != null) {
        const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
        if (Number.isInteger(parsed_vc_bb)) {
          const grado_vc_bb = await this.gradoModel_vc_bb.obtenerPorNumero_vc_bb(parsed_vc_bb);
          return grado_vc_bb ? grado_vc_bb.ID_grado_bb_vc : null;
        }
      }
      return null;
    } catch (error_vc_bb) {
      console.error('Error al obtener ID de grado:', error_vc_bb);
      return null;
    }
  }
}

// Exportar funciones para mantener compatibilidad con rutas existentes
const controlador_vc_bb = AsignaturaController_vc_bb.obtenerInstancia_vc_bb();

export const getAllAsignaturas_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.obtenerTodas_vc_bb(req_vc_bb, res_vc_bb);
export const createAsignatura_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.crear_vc_bb(req_vc_bb, res_vc_bb);
export const updateAsignatura_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.actualizar_vc_bb(req_vc_bb, res_vc_bb);
export const deleteAsignatura_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.eliminar_vc_bb(req_vc_bb, res_vc_bb);

export default {
  getAllAsignaturas_vc_bb,
  createAsignatura_vc_bb,
  updateAsignatura_vc_bb,
  deleteAsignatura_vc_bb
};