import { AsignaturaModel_vc_bb, GradoModel_vc_bb } from "../models/index.js";

class AsignaturaController_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (AsignaturaController_vc_bb.#instancia_vc_bb) {
      return AsignaturaController_vc_bb.#instancia_vc_bb;
    }
    this.asignaturaModel_vc_bb = AsignaturaModel_vc_bb.obtenerInstancia_vc_bb();
    this.gradoModel_vc_bb = GradoModel_vc_bb.obtenerInstancia_vc_bb();
    AsignaturaController_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!AsignaturaController_vc_bb.#instancia_vc_bb) {
      AsignaturaController_vc_bb.#instancia_vc_bb = new AsignaturaController_vc_bb();
    }
    return AsignaturaController_vc_bb.#instancia_vc_bb;
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

export async function quitarGrado_vc_bb(req_vc_bb, res_vc_bb) {
  try {
    const { id, nroGrado } = req_vc_bb.params;
    const asignaturaModel_vc_bb = AsignaturaModel_vc_bb.obtenerInstancia_vc_bb();
    const gradoModel_vc_bb = GradoModel_vc_bb.obtenerInstancia_vc_bb();

    const asignaturaExistente_vc_bb = await asignaturaModel_vc_bb.obtenerPorId_vc_bb(id);
    if (!asignaturaExistente_vc_bb) {
      return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Asignatura no encontrada' });
    }

    const parsed_vc_bb = parseInt(String(nroGrado).trim(), 10);
    if (!Number.isInteger(parsed_vc_bb)) {
      return res_vc_bb.status(400).json({ mensaje_vc_bb: 'Número de grado inválido' });
    }
    const grado_vc_bb = await gradoModel_vc_bb.obtenerPorNumero_vc_bb(parsed_vc_bb);
    if (!grado_vc_bb) {
      return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Grado no encontrado' });
    }

    const cambios_vc_bb = await asignaturaModel_vc_bb.desvincularConGrado_vc_bb(id, grado_vc_bb.ID_grado_bb_vc);
    res_vc_bb.json({ mensaje_vc_bb: 'Grado desvinculado', cambios_vc_bb });
  } catch (error_vc_bb) {
    console.error('Error al desvincular grado de asignatura:', error_vc_bb);
    res_vc_bb.status(500).json({ mensaje_vc_bb: 'Error al desvincular grado', error_vc_bb: error_vc_bb.message });
  }
}

export default {
  getAllAsignaturas_vc_bb,
  createAsignatura_vc_bb,
  updateAsignatura_vc_bb,
  deleteAsignatura_vc_bb,
  quitarGrado_vc_bb
};
