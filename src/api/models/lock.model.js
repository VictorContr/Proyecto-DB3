import db_vc_bb from "../db.js";

export class LockModel_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (LockModel_vc_bb.#instancia_vc_bb) {
      return LockModel_vc_bb.#instancia_vc_bb;
    }
    LockModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!LockModel_vc_bb.#instancia_vc_bb) {
      LockModel_vc_bb.#instancia_vc_bb = new LockModel_vc_bb();
    }
    return LockModel_vc_bb.#instancia_vc_bb;
  }

  /**
   * Define las tablas asociadas a cada tipo de carga masiva
   */
  #tablasPorCarga_vc_bb = {
    profesores: ['td_Profesores_bb_vc', 'td_UsuarioRol_bb_vc'],
    espacios: ['td_Espacios_bb_vc'],
    grados: ['td_Grados_bb_vc'],
    secciones: ['td_Secciones_bb_vc'],
    asignaturas: ['td_Asignaturas_bb_vc', 'td_GradosAsignaturas_bb_vc'],
    disponibilidades: ['td_DisponibilidadProfesores_bb_vc', 'td_DisponibilidadEspacios_bb_vc']
  };

  /**
   * Obtiene las tablas asociadas a un tipo de carga masiva
   */
  obtenerTablasPorTipo_vc_bb(tipoCarga_vc_bb) {
    return this.#tablasPorCarga_vc_bb[tipoCarga_vc_bb] || [];
  }

  /**
   * Verifica si existe información en las tablas especificadas
   */
  async verificarExistenciaDatos_vc_bb(tablas_vc_bb) {
    try {
      const resultados_vc_bb = {};
      
      for (const tabla_vc_bb of tablas_vc_bb) {
        const sql_vc_bb = `SELECT COUNT(*) as total FROM ${tabla_vc_bb}`;
        const resultado_vc_bb = await db_vc_bb.get_vc_bb(sql_vc_bb);
        resultados_vc_bb[tabla_vc_bb] = resultado_vc_bb.total > 0;
      }
      
      return resultados_vc_bb;
    } catch (error_vc_bb) {
      console.error('Error al verificar existencia de datos:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  /**
   * Crea un respaldo de las tablas especificadas
   */
  async crearRespaldo_vc_bb(tablas_vc_bb, nombreRespaldo_vc_bb) {
    try {
      const ahora_vc_bb = new Date();
      const yyyy_vc_bb = ahora_vc_bb.getFullYear();
      const mm_vc_bb = String(ahora_vc_bb.getMonth() + 1).padStart(2, '0');
      const dd_vc_bb = String(ahora_vc_bb.getDate()).padStart(2, '0');
      const hh_vc_bb = String(ahora_vc_bb.getHours()).padStart(2, '0');
      const mi_vc_bb = String(ahora_vc_bb.getMinutes()).padStart(2, '0');
      const ss_vc_bb = String(ahora_vc_bb.getSeconds()).padStart(2, '0');
      const ms_vc_bb = String(ahora_vc_bb.getMilliseconds()).padStart(3, '0');
      const timestamp_vc_bb = `${yyyy_vc_bb}${mm_vc_bb}${dd_vc_bb}_${hh_vc_bb}${mi_vc_bb}${ss_vc_bb}_${ms_vc_bb}`;

      // Nombre de respaldo seguro para SQLite (solo letras, números y guiones bajos)
      const nombreCompleto_vc_bb = `${nombreRespaldo_vc_bb}_${timestamp_vc_bb}`;
      const nombreSeguro_vc_bb = nombreCompleto_vc_bb.replace(/[^A-Za-z0-9_]/g, '_');
      
      // Crear tabla de respaldo para cada tabla
      for (const tabla_vc_bb of tablas_vc_bb) {
        const tablaRespaldo_vc_bb = `${tabla_vc_bb}_backup_${nombreSeguro_vc_bb}`;
        
        // Crear tabla de respaldo con la misma estructura
        const sqlCrearRespaldo_vc_bb = `CREATE TABLE ${tablaRespaldo_vc_bb} AS SELECT * FROM ${tabla_vc_bb}`;
        await db_vc_bb.run_vc_bb(sqlCrearRespaldo_vc_bb);
      }
      
      return nombreSeguro_vc_bb;
    } catch (error_vc_bb) {
      console.error('Error al crear respaldo:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  /**
   * Elimina todos los datos de las tablas especificadas
   */
  async limpiarTablas_vc_bb(tablas_vc_bb) {
    try {
      // Desactivar verificación de claves foráneas temporalmente
      await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = OFF');
      
      for (const tabla_vc_bb of tablas_vc_bb) {
        const sql_vc_bb = `DELETE FROM ${tabla_vc_bb}`;
        await db_vc_bb.run_vc_bb(sql_vc_bb);
      }
      
      // Reactivar verificación de claves foráneas
      await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = ON');
      
      return true;
    } catch (error_vc_bb) {
      console.error('Error al limpiar tablas:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  /**
   * Restaura los datos desde un respaldo
   */
  async restaurarRespaldo_vc_bb(nombreRespaldo_vc_bb, tablas_vc_bb) {
    try {
      // Desactivar verificación de claves foráneas temporalmente
      await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = OFF');
      
      for (const tabla_vc_bb of tablas_vc_bb) {
        const tablaRespaldo_vc_bb = `${tabla_vc_bb}_backup_${nombreRespaldo_vc_bb}`;
        
        // Verificar si existe el respaldo
        const verificar_vc_bb = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tablaRespaldo_vc_bb}'`;
        const existe_vc_bb = await db_vc_bb.get_vc_bb(verificar_vc_bb);
        
        if (existe_vc_bb) {
          // Limpiar tabla original
          await db_vc_bb.run_vc_bb(`DELETE FROM ${tabla_vc_bb}`);
          
          // Restaurar desde respaldo
          await db_vc_bb.run_vc_bb(`INSERT INTO ${tabla_vc_bb} SELECT * FROM ${tablaRespaldo_vc_bb}`);
          
          // Eliminar tabla de respaldo
          await db_vc_bb.run_vc_bb(`DROP TABLE ${tablaRespaldo_vc_bb}`);
        }
      }
      
      // Reactivar verificación de claves foráneas
      await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = ON');
      
      return true;
    } catch (error_vc_bb) {
      console.error('Error al restaurar respaldo:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  /**
   * Ejecuta rollback de una carga masiva específica
   */
  async ejecutarRollback_vc_bb(tipoCarga_vc_bb) {
    try {
      const tablas_vc_bb = this.obtenerTablasPorTipo_vc_bb(tipoCarga_vc_bb);
      
      if (tablas_vc_bb.length === 0) {
        throw new Error(`Tipo de carga masiva '${tipoCarga_vc_bb}' no válido`);
      }
      
      // Crear respaldo antes de limpiar
      const nombreRespaldo_vc_bb = await this.crearRespaldo_vc_bb(tablas_vc_bb, tipoCarga_vc_bb);
      
      // Limpiar tablas
      await this.limpiarTablas_vc_bb(tablas_vc_bb);
      
      return {
        exito_vc_bb: true,
        mensaje_vc_bb: `Rollback ejecutado exitosamente para ${tipoCarga_vc_bb}`,
        tablasAfectadas_vc_bb: tablas_vc_bb,
        respaldo_vc_bb: nombreRespaldo_vc_bb
      };
    } catch (error_vc_bb) {
      console.error('Error al ejecutar rollback:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  /**
   * Obtiene información sobre los respaldos existentes
   */
  async obtenerInfoRespaldos_vc_bb() {
    try {
      const sql_vc_bb = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name LIKE '%_backup_%'
        ORDER BY name
      `;
      const respaldos_vc_bb = await db_vc_bb.all_vc_bb(sql_vc_bb);
      
      // Agrupar por tipo de respaldo
      const infoRespaldos_vc_bb = {};
      respaldos_vc_bb.forEach(respaldo_vc_bb => {
        const partes_vc_bb = respaldo_vc_bb.name.split('_backup_');
        if (partes_vc_bb.length === 2) {
          const tablaOriginal_vc_bb = partes_vc_bb[0];
          const nombreRespaldo_vc_bb = partes_vc_bb[1];
          
          if (!infoRespaldos_vc_bb[nombreRespaldo_vc_bb]) {
            infoRespaldos_vc_bb[nombreRespaldo_vc_bb] = [];
          }
          infoRespaldos_vc_bb[nombreRespaldo_vc_bb].push(tablaOriginal_vc_bb);
        }
      });
      
      return infoRespaldos_vc_bb;
    } catch (error_vc_bb) {
      console.error('Error al obtener información de respaldos:', error_vc_bb);
      throw error_vc_bb;
    }
  }
}
