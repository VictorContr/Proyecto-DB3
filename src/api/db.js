"use strict";
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import fs from 'fs'; // Importamos 'fs' para verificar/crear la carpeta

class Database_vc_bb {
    constructor() {
        this.__filename = fileURLToPath(import.meta.url);
        // __dirname será /ruta/a/tu/proyecto/src/api
        this.__dirname = path.dirname(this.__filename);
        this.sqlite = sqlite3.verbose();
        this.db = null;
        this.init_vc_bb();
    }

    init_vc_bb() {
        const dbPath = path.resolve(this.__dirname, "../db");
        const dbFile = path.resolve(dbPath, "database.db");
        // -------------------------

        // Verificamos si el directorio existe, si no, lo creamos recursivamente.
        if (!fs.existsSync(dbPath)) {
            console.log(`[DB] Creando directorio que no existe: ${dbPath}`);
            fs.mkdirSync(dbPath, { recursive: true });
        }
        // ------------------------------------

        this.db = new this.sqlite.Database(
            dbFile, // Usamos la ruta completa al archivo
            (error) => {
                if (error) {
                    console.error("❌ Error conectando a BD:", error);
                    return;
                }
                console.log(`✅ Conexión a SQLite establecida en: ${dbFile}`);
                this.createTable_vc_bb();
            }
        );
    }

    createTable_vc_bb() {
        // Script SQL completo para crear el esquema de la base de datos
        // (Tu script SQL original está perfecto, lo omito aquí por brevedad
        // pero debe ir completo como lo tenías)
        const sql = `
            PRAGMA foreign_keys = ON;

            -- -----------------------------------------------------
            -- Tablas de Estructura Básica (Usuarios y Roles)
            -- -----------------------------------------------------
            CREATE TABLE IF NOT EXISTS td_Usuarios_bb_vc_bb (
              ID_usuario_bb_vc_bb INTEGER PRIMARY KEY,
              nombre_bb_vc_bb TEXT NOT NULL,
              apellido_bb_vc_bb TEXT NOT NULL,
              correo_bb_vc_bb TEXT NOT NULL,
              telefono_bb_vc_bb TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS td_Rol_bb_vc_bb (
              ID_rol_bb_vc_bb INTEGER PRIMARY KEY,
              rol_bb_vc_bb TEXT
            );
            
            /* ... (El resto de tu SQL va aquí) ... */

            CREATE TABLE IF NOT EXISTS td_UsuarioRol_bb_vc_bb (
              ID_usuarioRol_bb_vc_bb INTEGER PRIMARY KEY,
              ID_usuario_usuarioRol_bb_vc_bb INTEGER,
              ID_rol_usuarioRol_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_usuario_usuarioRol_bb_vc_bb) REFERENCES td_Usuarios_bb_vc_bb(ID_usuario_bb_vc_bb),
              FOREIGN KEY (ID_rol_usuarioRol_bb_vc_bb) REFERENCES td_Rol_bb_vc_bb(ID_rol_bb_vc_bb)
            );

            -- Tablas de especialización de usuarios
            CREATE TABLE IF NOT EXISTS td_Administradores_bb_vc_bb (
              ID_administradores_bb_vc_bb INTEGER PRIMARY KEY,
              ID_usuarioRol_admin_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_usuarioRol_admin_bb_vc_bb) REFERENCES td_UsuarioRol_bb_vc_bb(ID_usuarioRol_bb_vc_bb)
            );

            CREATE TABLE IF NOT EXISTS td_Profesores_bb_vc_bb (
              ID_profesor_bb_vc_bb INTEGER PRIMARY KEY,
              ID_usuarioRol_profesor_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_usuarioRol_profesor_bb_vc_bb) REFERENCES td_UsuarioRol_bb_vc_bb(ID_usuarioRol_bb_vc_bb)
            );

            -- -----------------------------------------------------
            -- Tablas de Recursos Temporales y Espaciales
            -- -----------------------------------------------------
            CREATE TABLE IF NOT EXISTS td_Bloque_bb_vc_bb (
              ID_bloque_bb_vc_bb INTEGER PRIMARY KEY,
              hora_bloque_bb_vc_bb TEXT NOT NULL CHECK (
                hora_bloque_bb_vc_bb IN (
                  '7:00 am',
                  '8:00 am',
                  '9:00 am',
                  '10:00 am',
                  '11:00 am',
                  '12:00 pm',
                  '1:00 pm',
                  '2:00 pm',
                  '3:00 pm',
                  '4:00 pm'
                )
              )
            );

            CREATE TABLE IF NOT EXISTS td_Dia_bb_vc_bb (
              ID_dia_bb_vc_bb INTEGER PRIMARY KEY,
              dia_bb_vc_bb TEXT NOT NULL CHECK (
                dia_bb_vc_bb IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes')
              )
            );

            CREATE TABLE IF NOT EXISTS td_TipoEspacio_bb_vc_bb (
              ID_TipoEspacio_bb_vc_bb INTEGER PRIMARY KEY,
              tipo_bb_vc_bb TEXT -- Ej: "Aula Genérica", "Laboratorio", "Cancha"
            );

            CREATE TABLE IF NOT EXISTS td_Espacios_bb_vc_bb (
              ID_espacio_bb_vc_bb INTEGER PRIMARY KEY,
              nombre_bb_vc_bb TEXT,
              capacidad_bb_vc_bb INTEGER,
              ID_TipoEspacio_espacio_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_TipoEspacio_espacio_bb_vc_bb) REFERENCES td_TipoEspacio_bb_vc_bb(ID_TipoEspacio_bb_vc_bb)
            );

            -- -----------------------------------------------------
            -- Tablas de Estructura Académica (Pensum)
            -- -----------------------------------------------------
            CREATE TABLE IF NOT EXISTS td_Grados_bb_vc_bb (
              ID_grado_bb_vc_bb INTEGER PRIMARY KEY,
              nro_grado_bb_vc_bb INTEGER,
              CHECK (nro_grado_bb_vc_bb >= 1 AND nro_grado_bb_vc_bb <= 5)
            );

            CREATE TABLE IF NOT EXISTS td_Secciones_bb_vc_bb (
              ID_seccion_bb_vc_bb INTEGER PRIMARY KEY,
              letra_seccion_bb_vc_bb TEXT -- Ej: 'A', 'B'
            );

            CREATE TABLE IF NOT EXISTS td_Asignaturas_bb_vc_bb (
              ID_asignatura_bb_vc_bb INTEGER PRIMARY KEY,
              nombre_bb_vc_bb TEXT NOT NULL,
              horas_academicas_bb_vc_bb INTEGER, -- Horas *semanales* requeridas para el pensum
              descripcion_bb_vc_bb TEXT,
              duracion_bloque_min_bb_vc_bb INTEGER DEFAULT 1,
              duracion_bloque_max_bb_vc_bb INTEGER DEFAULT 1,
              ID_TipoEspacio_requerido_bb_vc_bb INTEGER NULL,
              FOREIGN KEY (ID_TipoEspacio_requerido_bb_vc_bb) REFERENCES td_TipoEspacio_bb_vc_bb(ID_TipoEspacio_bb_vc_bb)
            );

            CREATE TABLE IF NOT EXISTS td_GradosAsignaturas_bb_vc_bb (
              ID_gradoAsignatura_bb_vc_bb INTEGER PRIMARY KEY,
              ID_grado_gradoAsig_bb_vc_bb INTEGER,
              ID_asignatura_gradoAsig_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_grado_gradoAsig_bb_vc_bb) REFERENCES td_Grados_bb_vc_bb(ID_grado_bb_vc_bb),
              FOREIGN KEY (ID_asignatura_gradoAsig_bb_vc_bb) REFERENCES td_Asignaturas_bb_vc_bb(ID_asignatura_bb_vc_bb)
            );

            -- -----------------------------------------------------
            -- Tabla de Idoneidad de Profesores (R3.4)
            -- -----------------------------------------------------
            CREATE TABLE IF NOT EXISTS td_ProfesorAsignaturas_bb_vc_bb (
              ID_profesorAsig_bb_vc_bb INTEGER PRIMARY KEY,
              ID_profesor_profAsig_bb_vc_bb INTEGER,
              ID_asignatura_profAsig_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_profesor_profAsig_bb_vc_bb) REFERENCES td_Profesores_bb_vc_bb(ID_profesor_bb_vc_bb),
              FOREIGN KEY (ID_asignatura_profAsig_bb_vc_bb) REFERENCES td_Asignaturas_bb_vc_bb(ID_asignatura_bb_vc_bb)
            );

            -- -----------------------------------------------------
            -- Tablas de Disponibilidad (Restricciones de Entrada)
            -- -----------------------------------------------------
            CREATE TABLE IF NOT EXISTS td_DisponibilidadProfesor_bb_vc_bb (
              ID_DisponibilidadProfesor_bb_vc_bb INTEGER PRIMARY KEY,
              ID_dia_DispProfesor_bb_vc_bb INTEGER,
              ID_bloque_DispProfesor_bb_vc_bb INTEGER,
              ID_profesor_DispProfesor_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_dia_DispProfesor_bb_vc_bb) REFERENCES td_Dia_bb_vc_bb(ID_dia_bb_vc_bb),
              FOREIGN KEY (ID_bloque_DispProfesor_bb_vc_bb) REFERENCES td_Bloque_bb_vc_bb(ID_bloque_bb_vc_bb),
              FOREIGN KEY (ID_profesor_DispProfesor_bb_vc_bb) REFERENCES td_Profesores_bb_vc_bb(ID_profesor_bb_vc_bb)
            );

            CREATE TABLE IF NOT EXISTS td_DisponibilidadEspacio_bb_vc_bb (
              ID_DisponibilidadEspacio_bb_vc_bb INTEGER PRIMARY KEY,
              ID_dia_DispEspacio_bb_vc_bb INTEGER,
              ID_bloque_DispEspacio_bb_vc_bb INTEGER,
              ID_espacio_DispEspacio_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_dia_DispEspacio_bb_vc_bb) REFERENCES td_Dia_bb_vc_bb(ID_dia_bb_vc_bb),
              FOREIGN KEY (ID_bloque_DispEspacio_bb_vc_bb) REFERENCES td_Bloque_bb_vc_bb(ID_bloque_bb_vc_bb),
              FOREIGN KEY (ID_espacio_DispEspacio_bb_vc_bb) REFERENCES td_Espacios_bb_vc_bb(ID_espacio_bb_vc_bb)
            );

            -- -----------------------------------------------------
            -- Tabla Central: El Horario (Resultado del Algoritmo)
            -- -----------------------------------------------------
            CREATE TABLE IF NOT EXISTS td_Horario_bb_vc_bb (
              ID_Horario_bb_vc_bb INTEGER PRIMARY KEY,
              ID_dia_horario_bb_vc_bb INTEGER,
              ID_bloque_horario_bb_vc_bb INTEGER,
              ID_asignatura_horario_bb_vc_bb INTEGER,
              ID_espacio_horario_bb_vc_bb INTEGER,
              ID_profesor_horario_bb_vc_bb INTEGER,
              ID_grado_horario_bb_vc_bb INTEGER,
              ID_seccion_horario_bb_vc_bb INTEGER,
              FOREIGN KEY (ID_dia_horario_bb_vc_bb) REFERENCES td_Dia_bb_vc_bb(ID_dia_bb_vc_bb),
              FOREIGN KEY (ID_bloque_horario_bb_vc_bb) REFERENCES td_Bloque_bb_vc_bb(ID_bloque_bb_vc_bb),
              FOREIGN KEY (ID_asignatura_horario_bb_vc_bb) REFERENCES td_Asignaturas_bb_vc_bb(ID_asignatura_bb_vc_bb),
              FOREIGN KEY (ID_espacio_horario_bb_vc_bb) REFERENCES td_Espacios_bb_vc_bb(ID_espacio_bb_vc_bb),
              FOREIGN KEY (ID_profesor_horario_bb_vc_bb) REFERENCES td_Profesores_bb_vc_bb(ID_profesor_bb_vc_bb),
              FOREIGN KEY (ID_grado_horario_bb_vc_bb) REFERENCES td_Grados_bb_vc_bb(ID_grado_bb_vc_bb),
              FOREIGN KEY (ID_seccion_horario_bb_vc_bb) REFERENCES td_Secciones_bb_vc_bb(ID_seccion_bb_vc_bb)
            );
        `;

        // Usar .exec() para correr múltiples sentencias SQL a la vez
        this.db.exec(sql, (error) => {
            if (error) {
                console.error("❌ Error creando el esquema de tablas:", error.message);
            } else {
                console.log("✅ Esquema de tablas verificado/creado exitosamente");
            }
        });
    }

    // Métodos para operaciones CRUD
    run_vc_bb(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (error) {
                if (error) reject(error);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    all_vc_bb(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (error, rows) => {
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    get_vc_bb(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (error, row) => {
                if (error) reject(error);
                else resolve(row);
            });
        });
    }

    close_vc_bb() {
        if (this.db) {
            this.db.close((error) => {
                if (error) {
                    console.error("❌ Error cerrando la conexión:", error.message);
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