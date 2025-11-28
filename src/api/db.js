"use strict";
import path_vc_bb from 'path';
import { fileURLToPath as fileURLToPath_vc_bb } from 'url';
import sqlite3_vc_bb from 'sqlite3';
import fs_vc_bb from 'fs';

class Database_vc_bb {
    constructor() {
        this.__filename_vc_bb = fileURLToPath_vc_bb(import.meta.url);
        // __dirname será /ruta/a/tu/proyecto/src/api
        this.__dirname_vc_bb = path_vc_bb.dirname(this.__filename_vc_bb);
        this.sqlite_vc_bb = sqlite3_vc_bb.verbose();
        this.db_vc_bb = null;
        this.init_vc_bb();
    }

    init_vc_bb() {
        const dbPath_vc_bb = path_vc_bb.resolve(this.__dirname_vc_bb, "../db");
        const dbFile_vc_bb = path_vc_bb.resolve(dbPath_vc_bb, "database.db");
        // -------------------------

        // Verificamos si el directorio existe, si no, lo creamos recursivamente.
        if (!fs_vc_bb.existsSync(dbPath_vc_bb)) {
            console.log(`[DB] Creando directorio que no existe: ${dbPath_vc_bb}`);
            fs_vc_bb.mkdirSync(dbPath_vc_bb, { recursive: true });
        }
        // ------------------------------------

        this.db_vc_bb = new this.sqlite_vc_bb.Database(
            dbFile_vc_bb, // Usamos la ruta completa al archivo
            (error_vc_bb) => {
                if (error_vc_bb) {
                    console.error("❌ Error conectando a BD:", error_vc_bb);
                    return;
                }
                console.log(`✅ Conexión a SQLite establecida en: ${dbFile_vc_bb}`);
                this.createTable_vc_bb();
            }
        );
    }



    createTable_vc_bb() {
        // Script SQL completo para crear el esquema de la base de datos
        const sql_vc_bb = `
          PRAGMA foreign_keys = ON;

          -- -----------------------------------------------------
          -- Tablas de Estructura Básica (Usuarios y Roles)
          -- -----------------------------------------------------
          CREATE TABLE IF NOT EXISTS td_Usuarios_bb_vc (
            ID_usuario_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_bb_vc TEXT NOT NULL,
            apellido_bb_vc TEXT NOT NULL,
            userName_bb_vc VARCHAR(80) UNIQUE NOT NULL,
            correo_bb_vc TEXT NOT NULL,
            telefono_bb_vc TEXT NOT NULL,
            password_bb_vc VARCHAR(250) NOT NULL
          );

          CREATE TABLE IF NOT EXISTS td_Rol_bb_vc (
            ID_rol_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            rol_bb_vc TEXT UNIQUE
          );

          CREATE TABLE IF NOT EXISTS td_UsuarioRol_bb_vc (
            ID_usuarioRol_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_usuario_usuarioRol_bb_vc INTEGER NOT NULL,
            ID_rol_usuarioRol_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_usuario_usuarioRol_bb_vc) REFERENCES td_Usuarios_bb_vc(ID_usuario_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_rol_usuarioRol_bb_vc) REFERENCES td_Rol_bb_vc(ID_rol_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
          );

          -- Tablas de especialización de usuarios
          CREATE TABLE IF NOT EXISTS td_Administradores_bb_vc(
            ID_administradores_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_usuarioRol_admin_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_usuarioRol_admin_bb_vc) REFERENCES td_UsuarioRol_bb_vc(ID_usuarioRol_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_usuarioRol_admin_bb_vc)
          );

          CREATE TABLE IF NOT EXISTS td_Profesores_bb_vc(
            ID_profesor_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_usuarioRol_profesor_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_usuarioRol_profesor_bb_vc) REFERENCES td_UsuarioRol_bb_vc(ID_usuarioRol_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_usuarioRol_profesor_bb_vc)
          );

          -- -----------------------------------------------------
          -- Tablas de Recursos Temporales y Espaciales
          -- -----------------------------------------------------
          CREATE TABLE IF NOT EXISTS td_Bloque_bb_vc(
            ID_bloque_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            hora_bloque_bb_vc TEXT NOT NULL UNIQUE CHECK (
              hora_bloque_bb_vc IN (
                '7:00 am','8:00 am','9:00 am','10:00 am','11:00 am',
                '12:00 pm','1:00 pm','2:00 pm','3:00 pm','4:00 pm'
              )
            )
          );

          CREATE TABLE IF NOT EXISTS td_Dia_bb_vc (
            ID_dia_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            dia_bb_vc TEXT NOT NULL UNIQUE CHECK (
              dia_bb_vc IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes')
            )
          );

          CREATE TABLE IF NOT EXISTS td_TipoEspacio_bb_vc (
            ID_TipoEspacio_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_bb_vc TEXT
          );

          CREATE TABLE IF NOT EXISTS td_Espacios_bb_vc (
            ID_espacio_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_bb_vc TEXT NOT NULL,
            capacidad_bb_vc INTEGER,
            ID_TipoEspacio_espacio_bb_vc INTEGER,
            FOREIGN KEY (ID_TipoEspacio_espacio_bb_vc) REFERENCES td_TipoEspacio_bb_vc(ID_TipoEspacio_bb_vc) ON DELETE SET NULL ON UPDATE CASCADE
          );

          -- -----------------------------------------------------
          -- Tablas de Estructura Académica (Pensum)
          -- -----------------------------------------------------
          CREATE TABLE IF NOT EXISTS td_Grados_bb_vc (
            ID_grado_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            nro_grado_bb_vc INTEGER UNIQUE NOT NULL CHECK (nro_grado_bb_vc >= 1 AND nro_grado_bb_vc <= 5)
          );

          CREATE TABLE IF NOT EXISTS td_Secciones_bb_vc (
            ID_seccion_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            letra_seccion_bb_vc TEXT UNIQUE NOT NULL
          );

          -- Tabla "Clases" (grado + seccion)
          CREATE TABLE IF NOT EXISTS td_Clases_bb_vc (
            ID_clase_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_grado_clase_bb_vc INTEGER NOT NULL,
            ID_seccion_clase_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_grado_clase_bb_vc) REFERENCES td_Grados_bb_vc(ID_grado_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_seccion_clase_bb_vc) REFERENCES td_Secciones_bb_vc(ID_seccion_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc)
          );

          CREATE TABLE IF NOT EXISTS td_Asignaturas_bb_vc (
            ID_asignatura_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_bb_vc TEXT NOT NULL,
            horas_academicas_bb_vc INTEGER,
            descripcion_bb_vc TEXT,
            duracion_bloque_min_bb_vc INTEGER DEFAULT 1,
            duracion_bloque_max_bb_vc INTEGER DEFAULT 1,
            ID_TipoEspacio_requerido_bb_vc INTEGER NULL,
            FOREIGN KEY (ID_TipoEspacio_requerido_bb_vc) REFERENCES td_TipoEspacio_bb_vc(ID_TipoEspacio_bb_vc) ON DELETE SET NULL ON UPDATE CASCADE,
            UNIQUE (nombre_bb_vc)
          );

          CREATE TABLE IF NOT EXISTS td_GradosAsignaturas_bb_vc (
            ID_gradoAsignatura_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_grado_gradoAsig_bb_vc INTEGER NOT NULL,
            ID_asignatura_gradoAsig_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_grado_gradoAsig_bb_vc) REFERENCES td_Grados_bb_vc(ID_grado_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_asignatura_gradoAsig_bb_vc) REFERENCES td_Asignaturas_bb_vc(ID_asignatura_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc)
          );

          -- -----------------------------------------------------
          -- Tabla de Idoneidad de Profesores (R3.4)
          -- -----------------------------------------------------
          CREATE TABLE IF NOT EXISTS td_ProfesorAsignaturas_bb_vc (
            ID_profesorAsig_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_profesor_profAsig_bb_vc INTEGER NOT NULL,
            ID_asignatura_profAsig_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_profesor_profAsig_bb_vc) REFERENCES td_Profesores_bb_vc(ID_profesor_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_asignatura_profAsig_bb_vc) REFERENCES td_Asignaturas_bb_vc(ID_asignatura_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_profesor_profAsig_bb_vc, ID_asignatura_profAsig_bb_vc)
          );

          -- -----------------------------------------------------
          -- Tablas de Disponibilidad (Restricciones de Entrada)
          -- -----------------------------------------------------
          CREATE TABLE IF NOT EXISTS td_DisponibilidadProfesor_bb_vc (
            ID_DisponibilidadProfesor_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_dia_DispProfesor_bb_vc INTEGER NOT NULL,
            ID_bloque_DispProfesor_bb_vc INTEGER NOT NULL,
            ID_profesor_DispProfesor_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_dia_DispProfesor_bb_vc) REFERENCES td_Dia_bb_vc(ID_dia_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_bloque_DispProfesor_bb_vc) REFERENCES td_Bloque_bb_vc(ID_bloque_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_profesor_DispProfesor_bb_vc) REFERENCES td_Profesores_bb_vc(ID_profesor_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc)
          );

          CREATE TABLE IF NOT EXISTS td_DisponibilidadEspacio_bb_vc (
            ID_DisponibilidadEspacio_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_dia_DispEspacio_bb_vc INTEGER NOT NULL,
            ID_bloque_DispEspacio_bb_vc INTEGER NOT NULL,
            ID_espacio_DispEspacio_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_dia_DispEspacio_bb_vc) REFERENCES td_Dia_bb_vc(ID_dia_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_bloque_DispEspacio_bb_vc) REFERENCES td_Bloque_bb_vc(ID_bloque_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_espacio_DispEspacio_bb_vc) REFERENCES td_Espacios_bb_vc(ID_espacio_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_dia_DispEspacio_bb_vc, ID_bloque_DispEspacio_bb_vc, ID_espacio_DispEspacio_bb_vc)
          );

          -- Tabla de ocupación (derivada de horarios)
          CREATE TABLE IF NOT EXISTS td_OcupacionEspacio_bb_vc (
            ID_OcupacionEspacio_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_dia_OcupEspacio_bb_vc INTEGER NOT NULL,
            ID_bloque_OcupEspacio_bb_vc INTEGER NOT NULL,
            ID_espacio_OcupEspacio_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_dia_OcupEspacio_bb_vc) REFERENCES td_Dia_bb_vc(ID_dia_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_bloque_OcupEspacio_bb_vc) REFERENCES td_Bloque_bb_vc(ID_bloque_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_espacio_OcupEspacio_bb_vc) REFERENCES td_Espacios_bb_vc(ID_espacio_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_dia_OcupEspacio_bb_vc, ID_bloque_OcupEspacio_bb_vc, ID_espacio_OcupEspacio_bb_vc)
          );

          -- -----------------------------------------------------
          -- Tabla Central: El Horario (Resultado del Algoritmo)
          -- -----------------------------------------------------
          CREATE TABLE IF NOT EXISTS td_Horario_bb_vc (
            ID_Horario_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_dia_horario_bb_vc INTEGER NOT NULL,
            ID_bloque_horario_bb_vc INTEGER NOT NULL,
            ID_asignatura_horario_bb_vc INTEGER NOT NULL,
            ID_espacio_horario_bb_vc INTEGER NOT NULL,
            ID_profesor_horario_bb_vc INTEGER NOT NULL,
            ID_grado_horario_bb_vc INTEGER NOT NULL,
            ID_seccion_horario_bb_vc INTEGER NOT NULL,
            FOREIGN KEY (ID_dia_horario_bb_vc) REFERENCES td_Dia_bb_vc(ID_dia_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_bloque_horario_bb_vc) REFERENCES td_Bloque_bb_vc(ID_bloque_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_asignatura_horario_bb_vc) REFERENCES td_Asignaturas_bb_vc(ID_asignatura_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_espacio_horario_bb_vc) REFERENCES td_Espacios_bb_vc(ID_espacio_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_profesor_horario_bb_vc) REFERENCES td_Profesores_bb_vc(ID_profesor_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_grado_horario_bb_vc) REFERENCES td_Grados_bb_vc(ID_grado_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (ID_seccion_horario_bb_vc) REFERENCES td_Secciones_bb_vc(ID_seccion_bb_vc) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (ID_dia_horario_bb_vc, ID_bloque_horario_bb_vc, ID_espacio_horario_bb_vc, ID_profesor_horario_bb_vc)
          );


          -- -----------------------------------------------------
          -- Índices recomendados
          -- -----------------------------------------------------
          CREATE UNIQUE INDEX IF NOT EXISTS idx_td_Rol_unq_rol ON td_Rol_bb_vc(rol_bb_vc);
          CREATE UNIQUE INDEX IF NOT EXISTS idx_td_Usuario_userName_unq ON td_Usuarios_bb_vc(userName_bb_vc);
          CREATE UNIQUE INDEX IF NOT EXISTS idx_td_Grados_nro_unq ON td_Grados_bb_vc(nro_grado_bb_vc);
          CREATE UNIQUE INDEX IF NOT EXISTS idx_td_Secciones_letra_unq ON td_Secciones_bb_vc(letra_seccion_bb_vc);
          CREATE UNIQUE INDEX IF NOT EXISTS idx_td_TipoEspacio_tipo_unq ON td_TipoEspacio_bb_vc(tipo_bb_vc);

          CREATE INDEX IF NOT EXISTS idx_td_UsuarioRol_usuario ON td_UsuarioRol_bb_vc(ID_usuario_usuarioRol_bb_vc);
          CREATE INDEX IF NOT EXISTS idx_td_UsuarioRol_rol ON td_UsuarioRol_bb_vc(ID_rol_usuarioRol_bb_vc);
          CREATE INDEX IF NOT EXISTS idx_td_Profesores_userrol ON td_Profesores_bb_vc(ID_usuarioRol_profesor_bb_vc);
          CREATE INDEX IF NOT EXISTS idx_td_Clases_grado ON td_Clases_bb_vc(ID_grado_clase_bb_vc);
          CREATE INDEX IF NOT EXISTS idx_td_Clases_seccion ON td_Clases_bb_vc(ID_seccion_clase_bb_vc);
          CREATE INDEX IF NOT EXISTS idx_td_Asignaturas_nombre ON td_Asignaturas_bb_vc(nombre_bb_vc);


          -- Evitar doble reserva del espacio
          CREATE UNIQUE INDEX IF NOT EXISTS ux_horario_espacio_dia_bloque_bb_vc
          ON td_Horario_bb_vc (ID_dia_horario_bb_vc, ID_bloque_horario_bb_vc, ID_espacio_horario_bb_vc);

          -- Evitar doble reserva del profesor
          CREATE UNIQUE INDEX IF NOT EXISTS ux_horario_profesor_dia_bloque_bb_vc
          ON td_Horario_bb_vc (ID_dia_horario_bb_vc, ID_bloque_horario_bb_vc, ID_profesor_horario_bb_vc);

          -- Evitar doble reserva de la sección (grupo)
          CREATE UNIQUE INDEX IF NOT EXISTS ux_horario_grupo_dia_bloque_bb_vc
          ON td_Horario_bb_vc (ID_dia_horario_bb_vc, ID_bloque_horario_bb_vc, ID_grado_horario_bb_vc, ID_seccion_horario_bb_vc);
          -- -----------------------------------------------------
          -- TRIGGERS: Sincronizar td_Clases_bb_vc al insertar grados o secciones
          -- -----------------------------------------------------
          CREATE TRIGGER IF NOT EXISTS trg_after_insert_grado_vc
          AFTER INSERT ON td_Grados_bb_vc
          BEGIN
            INSERT OR IGNORE INTO td_Clases_bb_vc (ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc)
            SELECT NEW.ID_grado_bb_vc, s.ID_seccion_bb_vc FROM td_Secciones_bb_vc s;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_after_insert_seccion_vc
          AFTER INSERT ON td_Secciones_bb_vc
          BEGIN
            INSERT OR IGNORE INTO td_Clases_bb_vc (ID_grado_clase_bb_vc, ID_seccion_clase_bb_vc)
            SELECT g.ID_grado_bb_vc, NEW.ID_seccion_bb_vc FROM td_Grados_bb_vc g;
          END;

          -- Cuando se elimina un grado o sección, las FKs con ON DELETE CASCADE eliminarán las clases,
          -- pero dejamos triggers para limpiar o ejecutar lógica adicional si fuera necesario (a modo informativo)
          CREATE TRIGGER IF NOT EXISTS trg_after_delete_grado_vc
          AFTER DELETE ON td_Grados_bb_vc
          BEGIN
            DELETE FROM td_Clases_bb_vc WHERE ID_grado_clase_bb_vc = OLD.ID_grado_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_after_delete_seccion_vc
          AFTER DELETE ON td_Secciones_bb_vc
          BEGIN
            DELETE FROM td_Clases_bb_vc WHERE ID_seccion_clase_bb_vc = OLD.ID_seccion_bb_vc;
          END;


          ------TRIGGERS PARA HORARIOS-------
                    --  Profesores
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_profesor_insert
          AFTER INSERT ON td_Profesores_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_profesor_update
          AFTER UPDATE ON td_Profesores_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_profesor_delete
          AFTER DELETE ON td_Profesores_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          -- Asignaturas
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_asignatura_insert
          AFTER INSERT ON td_Asignaturas_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_asignatura_update
          AFTER UPDATE ON td_Asignaturas_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_asignatura_delete
          AFTER DELETE ON td_Asignaturas_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          -- Espacios (salones)
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_espacio_insert
          AFTER INSERT ON td_Espacios_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_espacio_update
          AFTER UPDATE ON td_Espacios_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_espacio_delete
          AFTER DELETE ON td_Espacios_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          -- Bloques
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_bloque_insert
          AFTER INSERT ON td_Bloque_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_bloque_update
          AFTER UPDATE ON td_Bloque_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_bloque_delete
          AFTER DELETE ON td_Bloque_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          -- Grados
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_grado_insert
          AFTER INSERT ON td_Grados_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_grado_update
          AFTER UPDATE ON td_Grados_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_grado_delete
          AFTER DELETE ON td_Grados_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          -- Secciones
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_seccion_insert
          AFTER INSERT ON td_Secciones_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_seccion_update
          AFTER UPDATE ON td_Secciones_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_seccion_delete
          AFTER DELETE ON td_Secciones_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          -- =====================================================
          -- Disponibilidad de Profesores
          -- =====================================================
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_disp_profesor_insert
          AFTER INSERT ON td_DisponibilidadProfesor_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_disp_profesor_update
          AFTER UPDATE ON td_DisponibilidadProfesor_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_disp_profesor_delete
          AFTER DELETE ON td_DisponibilidadProfesor_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          -- =====================================================
          -- Disponibilidad de Espacios
          -- =====================================================
          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_disp_espacio_insert
          AFTER INSERT ON td_DisponibilidadEspacio_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_disp_espacio_update
          AFTER UPDATE ON td_DisponibilidadEspacio_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

          CREATE TRIGGER IF NOT EXISTS trg_reset_horarios_disp_espacio_delete
          AFTER DELETE ON td_DisponibilidadEspacio_bb_vc
          BEGIN
            DELETE FROM td_Horario_bb_vc;
          END;

      --  Al borrar horarios, vaciar ocupación de espacios
          CREATE TRIGGER IF NOT EXISTS trg_reset_ocup_espacio_horarios_delete
          AFTER DELETE ON td_Horario_bb_vc
          BEGIN
            DELETE FROM td_OcupacionEspacio_bb_vc;
          END;

          -- -----------------------------------------------------
          -- Seed inicial (roles, admin, profesor, dias, bloques)
          -- -----------------------------------------------------
          INSERT OR IGNORE INTO td_Rol_bb_vc (rol_bb_vc) VALUES ('Administrador'), ('Profesor');

          INSERT OR IGNORE INTO td_Usuarios_bb_vc (
            userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc
          ) VALUES ('admin', 'admin@colegio.com', '0000000000', 'Admin', 'Principal', '123456');

          INSERT OR IGNORE INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
          SELECT u.ID_usuario_bb_vc, r.ID_rol_bb_vc
          FROM td_Usuarios_bb_vc u, td_Rol_bb_vc r
          WHERE u.userName_bb_vc = 'admin' AND r.rol_bb_vc = 'Administrador';

          INSERT OR IGNORE INTO td_Administradores_bb_vc (ID_usuarioRol_admin_bb_vc)
          SELECT ID_usuarioRol_bb_vc FROM td_UsuarioRol_bb_vc
          WHERE ID_usuario_usuarioRol_bb_vc = (SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE userName_bb_vc = 'admin')
          AND ID_rol_usuarioRol_bb_vc = (SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Administrador');

          -- Profesor de ejemplo
          INSERT OR IGNORE INTO td_Usuarios_bb_vc (
            userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc
          ) VALUES ('profe1', 'profesor@colegio.com', '04121234567', 'Carlos', 'Docente', '123456');

          INSERT OR IGNORE INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
          SELECT u.ID_usuario_bb_vc, r.ID_rol_bb_vc
          FROM td_Usuarios_bb_vc u, td_Rol_bb_vc r
          WHERE u.userName_bb_vc = 'profe1' AND r.rol_bb_vc = 'Profesor';

          INSERT OR IGNORE INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc)
          SELECT ID_usuarioRol_bb_vc FROM td_UsuarioRol_bb_vc
          WHERE ID_usuario_usuarioRol_bb_vc = (SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE userName_bb_vc = 'profe1')
          AND ID_rol_usuarioRol_bb_vc = (SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Profesor');

          INSERT OR IGNORE INTO td_TipoEspacio_bb_vc (tipo_bb_vc) VALUES ('Aula Genérica'), ('Espacio Especializado');

          -- Días y Bloques
          INSERT OR IGNORE INTO td_Dia_bb_vc (dia_bb_vc) VALUES ('lunes'), ('martes'), ('miércoles'), ('jueves'), ('viernes');

          INSERT OR IGNORE INTO td_Bloque_bb_vc (hora_bloque_bb_vc) VALUES
          ('7:00 am'), ('8:00 am'), ('9:00 am'), ('10:00 am'), ('11:00 am'),
          ('12:00 pm'), ('1:00 pm'), ('2:00 pm'), ('3:00 pm');


        --- VISTAS SQL ---

DROP VIEW IF EXISTS vista_horarios_admin_bb_vc;
CREATE VIEW vista_horarios_admin_bb_vc AS
SELECT 
  h.ID_Horario_bb_vc,
  d.dia_bb_vc AS dia,
  b.hora_bloque_bb_vc AS bloque,
  a.nombre_bb_vc AS asignatura,
  u.nombre_bb_vc || ' ' || u.apellido_bb_vc AS profesor,
  g.nro_grado_bb_vc AS grado,
  s.letra_seccion_bb_vc AS seccion,
  e.nombre_bb_vc AS espacio
FROM td_Horario_bb_vc h
JOIN td_Asignaturas_bb_vc a ON h.ID_asignatura_horario_bb_vc = a.ID_asignatura_bb_vc
JOIN td_Profesores_bb_vc p ON h.ID_profesor_horario_bb_vc = p.ID_profesor_bb_vc
JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
JOIN td_Grados_bb_vc g ON h.ID_grado_horario_bb_vc = g.ID_grado_bb_vc
JOIN td_Secciones_bb_vc s ON h.ID_seccion_horario_bb_vc = s.ID_seccion_bb_vc
JOIN td_Espacios_bb_vc e ON h.ID_espacio_horario_bb_vc = e.ID_espacio_bb_vc
JOIN td_Dia_bb_vc d ON h.ID_dia_horario_bb_vc = d.ID_dia_bb_vc
JOIN td_Bloque_bb_vc b ON h.ID_bloque_horario_bb_vc = b.ID_bloque_bb_vc;

DROP VIEW IF EXISTS vista_horarios_profesor_bb_vc;
CREATE VIEW vista_horarios_profesor_bb_vc AS
SELECT 
  h.ID_Horario_bb_vc,
  d.dia_bb_vc AS dia,
  b.hora_bloque_bb_vc AS bloque,
  a.nombre_bb_vc AS asignatura,
  u.nombre_bb_vc || ' ' || u.apellido_bb_vc AS profesor,
  g.nro_grado_bb_vc AS grado,
  s.letra_seccion_bb_vc AS seccion,
  e.nombre_bb_vc AS espacio,
  h.ID_profesor_horario_bb_vc AS ID_profesor
FROM td_Horario_bb_vc h
JOIN td_Asignaturas_bb_vc a ON h.ID_asignatura_horario_bb_vc = a.ID_asignatura_bb_vc
JOIN td_Profesores_bb_vc p ON h.ID_profesor_horario_bb_vc = p.ID_profesor_bb_vc
JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
JOIN td_Grados_bb_vc g ON h.ID_grado_horario_bb_vc = g.ID_grado_bb_vc
JOIN td_Secciones_bb_vc s ON h.ID_seccion_horario_bb_vc = s.ID_seccion_bb_vc
JOIN td_Espacios_bb_vc e ON h.ID_espacio_horario_bb_vc = e.ID_espacio_bb_vc
JOIN td_Dia_bb_vc d ON h.ID_dia_horario_bb_vc = d.ID_dia_bb_vc
JOIN td_Bloque_bb_vc b ON h.ID_bloque_horario_bb_vc = b.ID_bloque_bb_vc;


-- Todos los slots posibles (día , bloque , espacio)
CREATE VIEW IF NOT EXISTS vista_SlotsEspacio_bb_vc AS
SELECT d.ID_dia_bb_vc AS ID_dia,
       b.ID_bloque_bb_vc AS ID_bloque,
       e.ID_espacio_bb_vc AS ID_espacio
FROM td_Dia_bb_vc d
CROSS JOIN td_Bloque_bb_vc b
CROSS JOIN td_Espacios_bb_vc e;

-- Disponibilidad real: slots posibles menos ocupación actual
CREATE VIEW IF NOT EXISTS vista_DisponibilidadRealEspacio_bb_vc AS
SELECT s.ID_dia, s.ID_bloque, s.ID_espacio
FROM vista_SlotsEspacio_bb_vc s
LEFT JOIN td_OcupacionEspacio_bb_vc o
  ON o.ID_dia_OcupEspacio_bb_vc = s.ID_dia
 AND o.ID_bloque_OcupEspacio_bb_vc = s.ID_bloque
 AND o.ID_espacio_OcupEspacio_bb_vc = s.ID_espacio
WHERE o.ID_OcupacionEspacio_bb_vc IS NULL;




`;
        
        // Usar .exec() para correr múltiples sentencias SQL a la vez
        this.db_vc_bb.exec(sql_vc_bb, (error_vc_bb) => {
          if (error_vc_bb) {
            console.error("❌ Error creando el esquema de tablas:", error_vc_bb.message);
          } else {
            console.log("✅ Esquema de tablas verificado/creado exitosamente");

            // Migrar eliminación de columna 'turno' en Bloque si existe, aplicar unicidad y sembrar
            this.migrateRemoveBloqueTurno_vc_bb()
              .then(() => this.enforceUniqueness_vc_bb())
              .then(() => this.seedInitialData_vc_bb())
              .catch((err_vc_bb) => {
                console.error("❌ Error en migración/unicidad antes del seed:", err_vc_bb.message);
                // Aun así intentamos el seed para no bloquear el arranque
                this.seedInitialData_vc_bb();
              });
          }
        });
    }

    async enforceUniqueness_vc_bb() {
      try {
        // Depurar duplicados en tablas relacionadas con usuarios
        await this.run_vc_bb(`DELETE FROM td_Rol_bb_vc WHERE rowid NOT IN (SELECT MIN(rowid) FROM td_Rol_bb_vc GROUP BY rol_bb_vc);`);
        await this.run_vc_bb(`DELETE FROM td_UsuarioRol_bb_vc WHERE rowid NOT IN (SELECT MIN(rowid) FROM td_UsuarioRol_bb_vc GROUP BY ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc);`);
        await this.run_vc_bb(`DELETE FROM td_Administradores_bb_vc WHERE rowid NOT IN (SELECT MIN(rowid) FROM td_Administradores_bb_vc GROUP BY ID_usuarioRol_admin_bb_vc);`);
        await this.run_vc_bb(`DELETE FROM td_Profesores_bb_vc WHERE rowid NOT IN (SELECT MIN(rowid) FROM td_Profesores_bb_vc GROUP BY ID_usuarioRol_profesor_bb_vc);`);

        // Crear índices únicos para garantizar no duplicar nuevamente
        await this.run_vc_bb(`CREATE UNIQUE INDEX IF NOT EXISTS idx_td_Rol_unq_rol ON td_Rol_bb_vc(rol_bb_vc);`);
        await this.run_vc_bb(`CREATE UNIQUE INDEX IF NOT EXISTS idx_td_UsuarioRol_unq ON td_UsuarioRol_bb_vc(ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc);`);
        await this.run_vc_bb(`CREATE UNIQUE INDEX IF NOT EXISTS idx_td_Administradores_unq ON td_Administradores_bb_vc(ID_usuarioRol_admin_bb_vc);`);
        await this.run_vc_bb(`CREATE UNIQUE INDEX IF NOT EXISTS idx_td_Profesores_unq ON td_Profesores_bb_vc(ID_usuarioRol_profesor_bb_vc);`);
        await this.run_vc_bb(`CREATE UNIQUE INDEX IF NOT EXISTS idx_td_TipoEspacio_tipo_unq ON td_TipoEspacio_bb_vc(tipo_bb_vc);`);

        console.log("✅ Unicidad aplicada: índices únicos creados y duplicados depurados");
      } catch (err_vc_bb) {
        console.error("❌ Error aplicando unicidad:", err_vc_bb.message);
      }
    }

    /**
     * Inserta los datos iniciales (roles, admin, profesor, días, bloques, etc.)
     * Utiliza 'INSERT OR IGNORE' para evitar duplicados si la base de datos ya existe.
     */
    async seedInitialData_vc_bb() {
      console.log("[DB] Verificando e insertando datos iniciales (roles, admin, profesor, etc.)...");
      try {
        // --- 1. Insertar Roles ---
        // 'INSERT OR IGNORE' evita que se inserten si ya existen.
        await this.run_vc_bb(`INSERT OR IGNORE INTO td_Rol_bb_vc (rol_bb_vc) VALUES ('Administrador'), ('Profesor');`);
        // --- 2. Insertar Admin ---
        await this.run_vc_bb(`
          INSERT OR IGNORE INTO td_Usuarios_bb_vc (
            userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc
          )
          VALUES ('admin', 'admin@colegio.com', '0000000000', 'Admin', 'Principal', '123456');
        `);
        await this.run_vc_bb(`
          INSERT OR IGNORE INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
          SELECT ID_usuario_bb_vc, ID_rol_bb_vc
          FROM td_Usuarios_bb_vc, td_Rol_bb_vc
          WHERE td_Usuarios_bb_vc.userName_bb_vc = 'admin' AND td_Rol_bb_vc.rol_bb_vc = 'Administrador';
        `);
        await this.run_vc_bb(`
          INSERT OR IGNORE INTO td_Administradores_bb_vc (ID_usuarioRol_admin_bb_vc)
          SELECT ID_usuarioRol_bb_vc
          FROM td_UsuarioRol_bb_vc
          WHERE ID_usuario_usuarioRol_bb_vc = (SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE userName_bb_vc = 'admin')
          AND ID_rol_usuarioRol_bb_vc = (SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Administrador');
        `);
        // --- 3. Insertar Profesor de prueba ---
        await this.run_vc_bb(`
          INSERT OR IGNORE INTO td_Usuarios_bb_vc (
            userName_bb_vc, correo_bb_vc, telefono_bb_vc, nombre_bb_vc, apellido_bb_vc, password_bb_vc
          )
          VALUES ('profe1', 'profesor@colegio.com', '04121234567', 'Carlos', 'Docente', '123456');
        `);
        await this.run_vc_bb(`
          INSERT OR IGNORE INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
          SELECT ID_usuario_bb_vc, ID_rol_bb_vc
          FROM td_Usuarios_bb_vc, td_Rol_bb_vc
          WHERE td_Usuarios_bb_vc.userName_bb_vc = 'profe1' AND td_Rol_bb_vc.rol_bb_vc = 'Profesor';
        `);
        await this.run_vc_bb(`
          INSERT OR IGNORE INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc)
          SELECT ID_usuarioRol_bb_vc
          FROM td_UsuarioRol_bb_vc
          WHERE ID_usuario_usuarioRol_bb_vc = (SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE userName_bb_vc = 'profe1')
          AND ID_rol_usuarioRol_bb_vc = (SELECT ID_rol_bb_vc FROM td_Rol_bb_vc WHERE rol_bb_vc = 'Profesor');
        `);
        // 4. Insertar Días
        await this.run_vc_bb(`INSERT OR IGNORE INTO td_Dia_bb_vc (dia_bb_vc) VALUES 
          ('lunes'), ('martes'), ('miércoles'), ('jueves'), ('viernes');`);
        // 5. Insertar Bloques (solo hora; sin turno)
        await this.run_vc_bb(`INSERT OR IGNORE INTO td_Bloque_bb_vc (hora_bloque_bb_vc) VALUES 
          ('7:00 am'), ('8:00 am'), ('9:00 am'), ('10:00 am'), ('11:00 am'),
          ('12:00 pm'), ('1:00 pm'), ('2:00 pm'), ('3:00 pm'), ('4:00 pm');`);
        await this.run_vc_bb(`INSERT OR IGNORE INTO td_TipoEspacio_bb_vc (tipo_bb_vc) VALUES ('Aula Genérica'), ('Espacio Especializado');`);
        console.log("✅ Datos iniciales (admin, profesor, roles, etc.) insertados/verificados correctamente.");
      } catch (err) {
        console.error("❌ Error insertando datos iniciales:", err.message);
      }
    }

    async migrateRemoveBloqueTurno_vc_bb() {
      try {
        const cols_vc_bb = await this.all_vc_bb(`PRAGMA table_info(td_Bloque_bb_vc);`);
        const hasTurno_vc_bb = cols_vc_bb.some((c_vc_bb) => c_vc_bb.name === 'turno_bloque_bb_vc');
        if (hasTurno_vc_bb) {
          console.log("[DB] Migrando td_Bloque_bb_vc para eliminar columna 'turno_bloque_bb_vc'...");
          await this.run_vc_bb(`PRAGMA foreign_keys = OFF;`);
          await this.run_vc_bb(`CREATE TABLE IF NOT EXISTS td_Bloque_bb_vc_new (
              ID_bloque_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
              hora_bloque_bb_vc TEXT NOT NULL UNIQUE CHECK (
                hora_bloque_bb_vc IN (
                  '7:00 am','8:00 am','9:00 am','10:00 am','11:00 am',
                  '12:00 pm','1:00 pm','2:00 pm','3:00 pm','4:00 pm'
                )
              )
            );`);
          await this.run_vc_bb(`INSERT INTO td_Bloque_bb_vc_new (ID_bloque_bb_vc, hora_bloque_bb_vc)
                                 SELECT ID_bloque_bb_vc, hora_bloque_bb_vc FROM td_Bloque_bb_vc;`);
          await this.run_vc_bb(`DROP TABLE td_Bloque_bb_vc;`);
          await this.run_vc_bb(`ALTER TABLE td_Bloque_bb_vc_new RENAME TO td_Bloque_bb_vc;`);
          await this.run_vc_bb(`PRAGMA foreign_keys = ON;`);
          console.log("[DB] Migración completada: columna 'turno_bloque_bb_vc' eliminada.");
        }
      } catch (err_vc_bb) {
        console.error("❌ Error migrando tabla Bloque para eliminar 'turno':", err_vc_bb.message);
      }
    }


    // Métodos para operaciones CRUD
    // Archivo: src/api/db.js

run_vc_bb(sql_vc_bb, params_vc_bb = []) {
    return new Promise((resolve, reject) => {
        // ❌ INCORRECTO (lo que seguro tienes ahora):
        // this.db.run(sql, params, (err) => { ... }) 
        
        // ✅ CORRECTO (Copia y pega esto):
        this.db_vc_bb.run(sql_vc_bb, params_vc_bb, function(err_vc_bb) {  // <--- OJO: Usa 'function(err)'
            if (err_vc_bb) {
                console.log('Error ejecutando SQL: ' + sql_vc_bb);
                console.log(err_vc_bb);
                reject(err_vc_bb);
            } else {
                // Solo usando 'function' podemos acceder a 'this.lastID'
                resolve({ 
                    lastID: this.lastID,  // Aquí es donde estaba el 'undefined'
                    changes: this.changes 
                });
            }
        });
    });
}

    all_vc_bb(sql_vc_bb, params_vc_bb = []) {
        return new Promise((resolve, reject) => {
            this.db_vc_bb.all(sql_vc_bb, params_vc_bb, (error_vc_bb, rows_vc_bb) => {
                if (error_vc_bb) reject(error_vc_bb);
                else resolve(rows_vc_bb);
            });
        });
    }

    get_vc_bb(sql_vc_bb, params_vc_bb = []) {
        return new Promise((resolve, reject) => {
            this.db_vc_bb.get(sql_vc_bb, params_vc_bb, (error_vc_bb, row_vc_bb) => {
                if (error_vc_bb) reject(error_vc_bb);
                else resolve(row_vc_bb);
            });
        });
    }

    close_vc_bb() {
        if (this.db_vc_bb) {
            this.db_vc_bb.close((error_vc_bb) => {
                if (error_vc_bb) {
                    console.error("❌ Error cerrando la conexión:", error_vc_bb.message);
                } else {
                    console.log("🔌 Conexión a SQLite cerrada.");
                }
            });
        }
    }
}

// Se exporta la *instancia* ya creada.
// La conexión se inicia en cuanto este archivo sea importado por primera vez.
export default new Database_vc_bb();