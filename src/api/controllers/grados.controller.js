import { GradoModel_vc_bb } from "../models/index.js";

class GradoController_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (GradoController_vc_bb.#instancia_vc_bb) {
      return GradoController_vc_bb.#instancia_vc_bb;
    }
    this.gradoModel_vc_bb = GradoModel_vc_bb.obtenerInstancia_vc_bb();
    GradoController_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!GradoController_vc_bb.#instancia_vc_bb) {
      GradoController_vc_bb.#instancia_vc_bb = new GradoController_vc_bb();
    }
    return GradoController_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const grados_vc_bb = await this.gradoModel_vc_bb.obtenerTodos_vc_bb();
      res_vc_bb.json(grados_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener grados:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al obtener grados',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async obtenerPorId_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      const grado_vc_bb = await this.gradoModel_vc_bb.obtenerPorId_vc_bb(id);
      
      if (!grado_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Grado no encontrado' 
        });
      }

      res_vc_bb.json(grado_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener grado por ID:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al obtener grado',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async crear_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      let { nro_grado_bb_vc } = req_vc_bb.body;
      
      // Validar y parsear el número de grado
      const gradoParseado_vc_bb = this.#validarNumeroGrado_vc_bb(nro_grado_bb_vc);
      if (!gradoParseado_vc_bb) {
        return res_vc_bb.status(400).json({ 
          mensaje_vc_bb: 'nro_grado_bb_vc inválido. Debe ser un número entre 1 y 5' 
        });
      }

      // Verificar si el grado ya existe
      const gradoExistente_vc_bb = await this.gradoModel_vc_bb.obtenerPorNumero_vc_bb(gradoParseado_vc_bb);
      if (gradoExistente_vc_bb) {
        return res_vc_bb.status(409).json({ 
          mensaje_vc_bb: 'El grado ya existe' 
        });
      }

      // Crear grado
      const idGrado_vc_bb = await this.gradoModel_vc_bb.crear_vc_bb(gradoParseado_vc_bb);

      res_vc_bb.status(201).json({ 
        mensaje_vc_bb: 'Grado creado exitosamente',
        id_grado_vc_bb: idGrado_vc_bb 
      });
    } catch (error_vc_bb) {
      console.error('Error al crear grado:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al crear grado',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async actualizar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      let { nro_grado_bb_vc } = req_vc_bb.body;
      
      // Validar y parsear el número de grado
      const gradoParseado_vc_bb = this.#validarNumeroGrado_vc_bb(nro_grado_bb_vc);
      if (!gradoParseado_vc_bb) {
        return res_vc_bb.status(400).json({ 
          mensaje_vc_bb: 'nro_grado_bb_vc inválido. Debe ser un número entre 1 y 5' 
        });
      }

      // Verificar si el grado existe
      const gradoExistente_vc_bb = await this.gradoModel_vc_bb.obtenerPorId_vc_bb(id);
      if (!gradoExistente_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Grado no encontrado' 
        });
      }

      // Verificar si el nuevo número de grado ya existe (si es diferente)
      if (gradoExistente_vc_bb.nro_grado_bb_vc !== gradoParseado_vc_bb) {
        const gradoConMismoNumero_vc_bb = await this.gradoModel_vc_bb.obtenerPorNumero_vc_bb(gradoParseado_vc_bb);
        if (gradoConMismoNumero_vc_bb) {
          return res_vc_bb.status(409).json({ 
            mensaje_vc_bb: 'Ya existe un grado con ese número' 
          });
        }
      }

      // Actualizar grado
      const filasAfectadas_vc_bb = await this.gradoModel_vc_bb.actualizar_vc_bb(id, gradoParseado_vc_bb);
      if (filasAfectadas_vc_bb === 0) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Grado no encontrado' 
        });
      }

      res_vc_bb.json({ 
        mensaje_vc_bb: 'Grado actualizado exitosamente' 
      });
    } catch (error_vc_bb) {
      console.error('Error al actualizar grado:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al actualizar grado',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async eliminar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;

      // Verificar si el grado existe
      const gradoExistente_vc_bb = await this.gradoModel_vc_bb.obtenerPorId_vc_bb(id);
      if (!gradoExistente_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Grado no encontrado' 
        });
      }

      // Eliminar grado
      const filasAfectadas_vc_bb = await this.gradoModel_vc_bb.eliminar_vc_bb(id);
      if (filasAfectadas_vc_bb === 0) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Grado no encontrado' 
        });
      }

      res_vc_bb.json({ 
        mensaje_vc_bb: 'Grado eliminado exitosamente' 
      });
    } catch (error_vc_bb) {
      console.error('Error al eliminar grado:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al eliminar grado',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  // Método privado para validar número de grado
  #validarNumeroGrado_vc_bb(nro_grado_bb_vc) {
    try {
      const parsed_vc_bb = parseInt(String(nro_grado_bb_vc).trim(), 10);
      if (!Number.isInteger(parsed_vc_bb) || parsed_vc_bb < 1 || parsed_vc_bb > 5) {
        return null;
      }
      return parsed_vc_bb;
    } catch (error_vc_bb) {
      console.error('Error al validar número de grado:', error_vc_bb);
      return null;
    }
  }
}

// Exportar funciones para mantener compatibilidad con rutas existentes
const controlador_vc_bb = GradoController_vc_bb.obtenerInstancia_vc_bb();

export const getAllGrados_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.obtenerTodos_vc_bb(req_vc_bb, res_vc_bb);
export const getGradoById_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.obtenerPorId_vc_bb(req_vc_bb, res_vc_bb);
export const createGrado_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.crear_vc_bb(req_vc_bb, res_vc_bb);
export const updateGrado_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.actualizar_vc_bb(req_vc_bb, res_vc_bb);
export const deleteGrado_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.eliminar_vc_bb(req_vc_bb, res_vc_bb);

export default {
  getAllGrados_vc_bb,
  getGradoById_vc_bb,
  createGrado_vc_bb,
  updateGrado_vc_bb,
  deleteGrado_vc_bb
};