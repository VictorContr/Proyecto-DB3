import { LockModel_vc_bb } from "../models/index.js";

class LockController_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (LockController_vc_bb.#instancia_vc_bb) {
      return LockController_vc_bb.#instancia_vc_bb;
    }
    this.lockModel_vc_bb = LockModel_vc_bb.obtenerInstancia_vc_bb();
    LockController_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!LockController_vc_bb.#instancia_vc_bb) {
      LockController_vc_bb.#instancia_vc_bb = new LockController_vc_bb();
    }
    return LockController_vc_bb.#instancia_vc_bb;
  }

  /**
   * Verifica si hay datos existentes para un tipo de carga masiva
   */
  async verificarDatosExistentes_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { tipoCarga } = req_vc_bb.params;
      
      if (!tipoCarga) {
        return res_vc_bb.status(400).json({
          mensaje_vc_bb: 'El tipo de carga es requerido'
        });
      }

      const tablas_vc_bb = this.lockModel_vc_bb.obtenerTablasPorTipo_vc_bb(tipoCarga);
      
      if (tablas_vc_bb.length === 0) {
        return res_vc_bb.status(400).json({
          mensaje_vc_bb: `Tipo de carga '${tipoCarga}' no válido`
        });
      }

      const datosExistentes_vc_bb = await this.lockModel_vc_bb.verificarExistenciaDatos_vc_bb(tablas_vc_bb);
      
      // Verificar si hay datos en alguna de las tablas
      const tieneDatos_vc_bb = Object.values(datosExistentes_vc_bb).some(existe => existe);
      
      res_vc_bb.json({
        tipoCarga_vc_bb: tipoCarga,
        tieneDatos_vc_bb: tieneDatos_vc_bb,
        tablas_vc_bb: datosExistentes_vc_bb,
        mensaje_vc_bb: tieneDatos_vc_bb 
          ? `Existen datos en las tablas de ${tipoCarga}. ¿Desea continuar?`
          : `No hay datos existentes en las tablas de ${tipoCarga}`
      });
    } catch (error_vc_bb) {
      console.error('Error al verificar datos existentes:', error_vc_bb);
      res_vc_bb.status(500).json({
        mensaje_vc_bb: 'Error al verificar datos existentes',
        error_vc_bb: error_vc_bb.message
      });
    }
  }

  /**
   * Ejecuta rollback de datos para un tipo de carga masiva
   */
  async ejecutarRollback_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { tipoCarga } = req_vc_bb.params;
      const { confirmar } = req_vc_bb.body;

      if (!tipoCarga) {
        return res_vc_bb.status(400).json({
          mensaje_vc_bb: 'El tipo de carga es requerido'
        });
      }

      if (!confirmar) {
        return res_vc_bb.status(400).json({
          mensaje_vc_bb: 'Se requiere confirmación para ejecutar el rollback'
        });
      }

      const resultado_vc_bb = await this.lockModel_vc_bb.ejecutarRollback_vc_bb(tipoCarga);
      
      res_vc_bb.json({
        mensaje_vc_bb: resultado_vc_bb.mensaje_vc_bb,
        tipoCarga_vc_bb: tipoCarga,
        tablasAfectadas_vc_bb: resultado_vc_bb.tablasAfectadas_vc_bb,
        respaldo_vc_bb: resultado_vc_bb.respaldo_vc_bb
      });
    } catch (error_vc_bb) {
      console.error('Error al ejecutar rollback:', error_vc_bb);
      res_vc_bb.status(500).json({
        mensaje_vc_bb: 'Error al ejecutar rollback',
        error_vc_bb: error_vc_bb.message
      });
    }
  }

  /**
   * Obtiene información sobre los respaldos existentes
   */
  async obtenerRespaldos_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const respaldos_vc_bb = await this.lockModel_vc_bb.obtenerInfoRespaldos_vc_bb();
      
      res_vc_bb.json({
        respaldos_vc_bb: respaldos_vc_bb,
        totalRespaldos_vc_bb: Object.keys(respaldos_vc_bb).length
      });
    } catch (error_vc_bb) {
      console.error('Error al obtener respaldos:', error_vc_bb);
      res_vc_bb.status(500).json({
        mensaje_vc_bb: 'Error al obtener respaldos',
        error_vc_bb: error_vc_bb.message
      });
    }
  }

  /**
   * Restaura datos desde un respaldo específico
   */
  async restaurarRespaldo_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { nombreRespaldo } = req_vc_bb.params;
      const { confirmar } = req_vc_bb.body;

      if (!nombreRespaldo) {
        return res_vc_bb.status(400).json({
          mensaje_vc_bb: 'El nombre del respaldo es requerido'
        });
      }

      if (!confirmar) {
        return res_vc_bb.status(400).json({
          mensaje_vc_bb: 'Se requiere confirmación para restaurar el respaldo'
        });
      }

      // Obtener tablas del respaldo
      const respaldos_vc_bb = await this.lockModel_vc_bb.obtenerInfoRespaldos_vc_bb();
      const tablas_vc_bb = respaldos_vc_bb[nombreRespaldo];

      if (!tablas_vc_bb || tablas_vc_bb.length === 0) {
        return res_vc_bb.status(404).json({
          mensaje_vc_bb: 'Respaldo no encontrado'
        });
      }

      await this.lockModel_vc_bb.restaurarRespaldo_vc_bb(nombreRespaldo, tablas_vc_bb);
      
      res_vc_bb.json({
        mensaje_vc_bb: `Respaldo '${nombreRespaldo}' restaurado exitosamente`,
        tablasRestauradas_vc_bb: tablas_vc_bb
      });
    } catch (error_vc_bb) {
      console.error('Error al restaurar respaldo:', error_vc_bb);
      res_vc_bb.status(500).json({
        mensaje_vc_bb: 'Error al restaurar respaldo',
        error_vc_bb: error_vc_bb.message
      });
    }
  }
}

// Exportar funciones para mantener compatibilidad con rutas existentes
const controlador_vc_bb = LockController_vc_bb.obtenerInstancia_vc_bb();

export const verificarDatosExistentes_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.verificarDatosExistentes_vc_bb(req_vc_bb, res_vc_bb);
export const ejecutarRollback_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.ejecutarRollback_vc_bb(req_vc_bb, res_vc_bb);
export const obtenerRespaldos_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.obtenerRespaldos_vc_bb(req_vc_bb, res_vc_bb);
export const restaurarRespaldo_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.restaurarRespaldo_vc_bb(req_vc_bb, res_vc_bb);

export default {
  verificarDatosExistentes_vc_bb,
  ejecutarRollback_vc_bb,
  obtenerRespaldos_vc_bb,
  restaurarRespaldo_vc_bb
};
