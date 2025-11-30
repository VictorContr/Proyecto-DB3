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
    // Incluye usuarios y relaciones de rol vinculadas a profesores
    profesores: ['td_ProfesorAsignaturas_bb_vc','td_Profesores_bb_vc','td_UsuarioRol_bb_vc','td_Usuarios_bb_vc'],
    espacios: ['td_Espacios_bb_vc'],
    grados: ['td_Grados_bb_vc'],
    // Paso 0 del wizard incluye secciones y grados, y la tabla puente de clases
    secciones: ['td_Clases_bb_vc', 'td_Secciones_bb_vc', 'td_Grados_bb_vc'],
    asignaturas: ['td_GradosAsignaturas_bb_vc', 'td_Asignaturas_bb_vc'],
    disponibilidades: ['td_DisponibilidadProfesor_bb_vc']
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
        try {
          const sql_vc_bb = `SELECT COUNT(*) as total FROM ${tabla_vc_bb}`;
          const resultado_vc_bb = await db_vc_bb.get_vc_bb(sql_vc_bb);
          resultados_vc_bb[tabla_vc_bb] = resultado_vc_bb.total > 0;
        } catch (_) {
          resultados_vc_bb[tabla_vc_bb] = false;
        }
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

  async eliminarRespaldosAntiguosExcepto_vc_bb(tablas_vc_bb, nombreRespaldo_vc_bb) {
    try {
      for (const tabla_vc_bb of tablas_vc_bb) {
        const keep_vc_bb = `${tabla_vc_bb}_backup_${nombreRespaldo_vc_bb}`;
        const sqlList_vc_bb = `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '${tabla_vc_bb}_backup_%'`;
        const rows_vc_bb = await db_vc_bb.all_vc_bb(sqlList_vc_bb);
        for (const r_vc_bb of rows_vc_bb) {
          const n_vc_bb = r_vc_bb.name || Object.values(r_vc_bb)[0];
          if (n_vc_bb && n_vc_bb !== keep_vc_bb) {
            await db_vc_bb.run_vc_bb(`DROP TABLE ${n_vc_bb}`);
          }
        }
      }
      return true;
    } catch (error_vc_bb) {
      console.error('Error al eliminar respaldos antiguos:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  /**
   * Elimina todos los datos de las tablas especificadas
   */
  async limpiarTablas_vc_bb(tablas_vc_bb) {
    await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = OFF');
    try {
      const incluyeUsuarios_vc_bb = tablas_vc_bb.includes('td_Usuarios_bb_vc');
      const incluyeProfesores_vc_bb = tablas_vc_bb.includes('td_Profesores_bb_vc');
      if (incluyeUsuarios_vc_bb && incluyeProfesores_vc_bb) {
        await db_vc_bb.run_vc_bb('DROP TABLE IF EXISTS tmp_prof_users');
        await db_vc_bb.run_vc_bb(`
          CREATE TEMP TABLE tmp_prof_users AS
          SELECT DISTINCT u.ID_usuario_bb_vc AS ID
          FROM td_Usuarios_bb_vc u
          JOIN td_UsuarioRol_bb_vc ur ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
          JOIN td_Profesores_bb_vc p ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
        `);
        if (tablas_vc_bb.includes('td_ProfesorAsignaturas_bb_vc')) {
          await db_vc_bb.run_vc_bb(`
            DELETE FROM td_ProfesorAsignaturas_bb_vc
            WHERE ID_profesor_profAsig_bb_vc IN (
              SELECT p.ID_profesor_bb_vc FROM td_Profesores_bb_vc p
            )
          `);
        }
        await db_vc_bb.run_vc_bb('DELETE FROM td_Profesores_bb_vc');
        await db_vc_bb.run_vc_bb(`
          DELETE FROM td_UsuarioRol_bb_vc
          WHERE ID_usuario_usuarioRol_bb_vc IN (SELECT ID FROM tmp_prof_users)
        `);
        await db_vc_bb.run_vc_bb(`
          DELETE FROM td_Usuarios_bb_vc
          WHERE ID_usuario_bb_vc IN (SELECT ID FROM tmp_prof_users)
            AND userName_bb_vc <> 'admin'
        `);
        await db_vc_bb.run_vc_bb('DROP TABLE IF EXISTS tmp_prof_users');
      } else {
        for (const tabla_vc_bb of tablas_vc_bb) {
          const sql_vc_bb = `DELETE FROM ${tabla_vc_bb}`;
          await db_vc_bb.run_vc_bb(sql_vc_bb);
        }
      }
      return true;
    } catch (error_vc_bb) {
      console.error('Error al limpiar tablas:', error_vc_bb);
      throw error_vc_bb;
    } finally {
      await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = ON');
    }
  }

  /**
   * Restaura los datos desde un respaldo
   */
  async restaurarRespaldo_vc_bb(nombreRespaldo_vc_bb, tablas_vc_bb) {
    await db_vc_bb.run_vc_bb('BEGIN IMMEDIATE');
    await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = OFF');
    try {
      for (const tabla_vc_bb of tablas_vc_bb) {
        const tablaRespaldo_vc_bb = `${tabla_vc_bb}_backup_${nombreRespaldo_vc_bb}`;
        const verificar_vc_bb = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tablaRespaldo_vc_bb}'`;
        const existe_vc_bb = await db_vc_bb.get_vc_bb(verificar_vc_bb);
        if (existe_vc_bb) {
          await db_vc_bb.run_vc_bb(`DELETE FROM ${tabla_vc_bb}`);
          await db_vc_bb.run_vc_bb(`INSERT INTO ${tabla_vc_bb} SELECT * FROM ${tablaRespaldo_vc_bb}`);
          await db_vc_bb.run_vc_bb(`DROP TABLE ${tablaRespaldo_vc_bb}`);
        }
      }
      await db_vc_bb.run_vc_bb('COMMIT');
      return true;
    } catch (error_vc_bb) {
      console.error('Error al restaurar respaldo:', error_vc_bb);
      try { await db_vc_bb.run_vc_bb('ROLLBACK'); } catch (_) {}
      throw error_vc_bb;
    } finally {
      await db_vc_bb.run_vc_bb('PRAGMA foreign_keys = ON');
    }
  }

  /**
   * Ejecuta rollback de una carga masiva específica
   */
  async ejecutarRollback_vc_bb(tipoCarga_vc_bb) {
    await db_vc_bb.run_vc_bb('BEGIN IMMEDIATE');
    try {
      const tablas_vc_bb = this.obtenerTablasPorTipo_vc_bb(tipoCarga_vc_bb);
      if (tablas_vc_bb.length === 0) {
        throw new Error(`Tipo de carga masiva '${tipoCarga_vc_bb}' no válido`);
      }
      const nombreRespaldo_vc_bb = await this.crearRespaldo_vc_bb(tablas_vc_bb, tipoCarga_vc_bb);
      await this.eliminarRespaldosAntiguosExcepto_vc_bb(tablas_vc_bb, nombreRespaldo_vc_bb);
      await this.limpiarTablas_vc_bb(tablas_vc_bb);
      await db_vc_bb.run_vc_bb('COMMIT');
      return {
        exito_vc_bb: true,
        mensaje_vc_bb: `Rollback ejecutado exitosamente para ${tipoCarga_vc_bb}`,
        tablasAfectadas_vc_bb: tablas_vc_bb,
        respaldo_vc_bb: nombreRespaldo_vc_bb
      };
    } catch (error_vc_bb) {
      console.error('Error al ejecutar rollback:', error_vc_bb);
      try { await db_vc_bb.run_vc_bb('ROLLBACK'); } catch (_) {}
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
