-- Habilita el soporte para claves foráneas (requerido en cada conexión)
PRAGMA foreign_keys = ON;

-- -----------------------------------------------------
-- Tablas de Estructura Básica (Usuarios y Roles)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS td_Usuarios_bb_vc (
  ID_usuario_bb_vc INTEGER PRIMARY KEY,
  nombre_bb_vc TEXT NOT NULL,
  apellido_bb_vc TEXT NOT NULL,
  correo_bb_vc TEXT NOT NULL,
  telefono_bb_vc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS td_Rol_bb_vc (
  ID_rol_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
  rol_bb_vc TEXT
);

CREATE TABLE IF NOT EXISTS td_UsuarioRol_bb_vc (
  ID_usuarioRol_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
  ID_usuario_usuarioRol_bb_vc INTEGER NOT NULL,
  ID_rol_usuarioRol_bb_vc INTEGER NOT NULL,
  FOREIGN KEY (ID_usuario_usuarioRol_bb_vc) REFERENCES td_Usuarios_bb_vc(ID_usuario_bb_vc),
  FOREIGN KEY (ID_rol_usuarioRol_bb_vc) REFERENCES td_Rol_bb_vc(ID_rol_bb_vc)
);

-- Tablas de especialización de usuarios
CREATE TABLE IF NOT EXISTS td_Administradores_bb_vc (
  ID_administradores_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
  ID_usuarioRol_admin_bb_vc INTEGER,
  FOREIGN KEY (ID_usuarioRol_admin_bb_vc) REFERENCES td_UsuarioRol_bb_vc(ID_usuarioRol_bb_vc)
);

CREATE TABLE IF NOT EXISTS td_Profesores_bb_vc (
  ID_profesor_bb_vc INTEGER PRIMARY KEY AUTOINCREMENT,
  ID_usuarioRol_profesor_bb_vc INTEGER NOT NULL,
  FOREIGN KEY (ID_usuarioRol_profesor_bb_vc) REFERENCES td_UsuarioRol_bb_vc(ID_usuarioRol_bb_vc)
);

-- -----------------------------------------------------
-- Tablas de Recursos Temporales y Espaciales
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS td_Bloque_bb_vc (
  ID_bloque_bb_vc INTEGER PRIMARY KEY,
  hora_bloque_bb_vc TEXT NOT NULL CHECK (
    hora_bloque_bb_vc IN (
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

CREATE TABLE IF NOT EXISTS td_Dia_bb_vc (
  ID_dia_bb_vc INTEGER PRIMARY KEY,
  dia_bb_vc TEXT NOT NULL CHECK (
    dia_bb_vc IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes')
  )
);

CREATE TABLE IF NOT EXISTS td_TipoEspacio_bb_vc (
  ID_TipoEspacio_bb_vc INTEGER PRIMARY KEY,
  tipo_bb_vc TEXT -- Ej: "Aula Genérica", "Laboratorio", "Cancha"
);

CREATE TABLE IF NOT EXISTS td_Espacios_bb_vc (
  ID_espacio_bb_vc INTEGER PRIMARY KEY,
  nombre_bb_vc TEXT,
  capacidad_bb_vc INTEGER,
  ID_TipoEspacio_espacio_bb_vc INTEGER,
  FOREIGN KEY (ID_TipoEspacio_espacio_bb_vc) REFERENCES td_TipoEspacio_bb_vc(ID_TipoEspacio_bb_vc)
);

-- -----------------------------------------------------
-- Tablas de Estructura Académica (Pensum)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS td_Grados_bb_vc (
  ID_grado_bb_vc INTEGER PRIMARY KEY,
  nro_grado_bb_vc INTEGER,
  CHECK (nro_grado_bb_vc >= 1 AND nro_grado_bb_vc <= 5)
);

CREATE TABLE IF NOT EXISTS td_Secciones_bb_vc (
  ID_seccion_bb_vc INTEGER PRIMARY KEY,
  letra_seccion_bb_vc TEXT -- Ej: 'A', 'B'
);

CREATE TABLE IF NOT EXISTS td_Asignaturas_bb_vc (
  ID_asignatura_bb_vc INTEGER PRIMARY KEY,
  nombre_bb_vc TEXT NOT NULL,
  horas_academicas_bb_vc INTEGER, -- Horas *semanales* requeridas para el pensum
  descripcion_bb_vc TEXT,
  duracion_bloque_min_bb_vc INTEGER DEFAULT 1,
  duracion_bloque_max_bb_vc INTEGER DEFAULT 1,
  ID_TipoEspacio_requerido_bb_vc INTEGER NULL,
  FOREIGN KEY (ID_TipoEspacio_requerido_bb_vc) REFERENCES td_TipoEspacio_bb_vc(ID_TipoEspacio_bb_vc)
);

CREATE TABLE IF NOT EXISTS td_GradosAsignaturas_bb_vc (
  ID_gradoAsignatura_bb_vc INTEGER PRIMARY KEY,
  ID_grado_gradoAsig_bb_vc INTEGER,
  ID_asignatura_gradoAsig_bb_vc INTEGER,
  FOREIGN KEY (ID_grado_gradoAsig_bb_vc) REFERENCES td_Grados_bb_vc(ID_grado_bb_vc),
  FOREIGN KEY (ID_asignatura_gradoAsig_bb_vc) REFERENCES td_Asignaturas_bb_vc(ID_asignatura_bb_vc)
);

-- -----------------------------------------------------
-- Tabla de Idoneidad de Profesores (R3.4)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS td_ProfesorAsignaturas_bb_vc (
  ID_profesorAsig_bb_vc INTEGER PRIMARY KEY,
  ID_profesor_profAsig_bb_vc INTEGER,
  ID_asignatura_profAsig_bb_vc INTEGER,
  FOREIGN KEY (ID_profesor_profAsig_bb_vc) REFERENCES td_Profesores_bb_vc(ID_profesor_bb_vc),
  FOREIGN KEY (ID_asignatura_profAsig_bb_vc) REFERENCES td_Asignaturas_bb_vc(ID_asignatura_bb_vc)
);

-- -----------------------------------------------------
-- Tablas de Disponibilidad (Restricciones de Entrada)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS td_DisponibilidadProfesor_bb_vc (
  ID_DisponibilidadProfesor_bb_vc INTEGER PRIMARY KEY,
  ID_dia_DispProfesor_bb_vc INTEGER,
  ID_bloque_DispProfesor_bb_vc INTEGER,
  ID_profesor_DispProfesor_bb_vc INTEGER,
  FOREIGN KEY (ID_dia_DispProfesor_bb_vc) REFERENCES td_Dia_bb_vc(ID_dia_bb_vc),
  FOREIGN KEY (ID_bloque_DispProfesor_bb_vc) REFERENCES td_Bloque_bb_vc(ID_bloque_bb_vc),
  FOREIGN KEY (ID_profesor_DispProfesor_bb_vc) REFERENCES td_Profesores_bb_vc(ID_profesor_bb_vc)
);

CREATE TABLE IF NOT EXISTS td_DisponibilidadEspacio_bb_vc (
  ID_DisponibilidadEspacio_bb_vc INTEGER PRIMARY KEY,
  ID_dia_DispEspacio_bb_vc INTEGER,
  ID_bloque_DispEspacio_bb_vc INTEGER,
  ID_espacio_DispEspacio_bb_vc INTEGER,
  FOREIGN KEY (ID_dia_DispEspacio_bb_vc) REFERENCES td_Dia_bb_vc(ID_dia_bb_vc),
  FOREIGN KEY (ID_bloque_DispEspacio_bb_vc) REFERENCES td_Bloque_bb_vc(ID_bloque_bb_vc),
  FOREIGN KEY (ID_espacio_DispEspacio_bb_vc) REFERENCES td_Espacios_bb_vc(ID_espacio_bb_vc)
);

-- -----------------------------------------------------
-- Tabla Central: El Horario (Resultado del Algoritmo)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS td_Horario_bb_vc (
  ID_Horario_bb_vc INTEGER PRIMARY KEY,
  ID_dia_horario_bb_vc INTEGER,
  ID_bloque_horario_bb_vc INTEGER,
  ID_asignatura_horario_bb_vc INTEGER,
  ID_espacio_horario_bb_vc INTEGER,
  ID_profesor_horario_bb_vc INTEGER,
  ID_grado_horario_bb_vc INTEGER,
  ID_seccion_horario_bb_vc INTEGER,
  FOREIGN KEY (ID_dia_horario_bb_vc) REFERENCES td_Dia_bb_vc(ID_dia_bb_vc),
  FOREIGN KEY (ID_bloque_horario_bb_vc) REFERENCES td_Bloque_bb_vc(ID_bloque_bb_vc),
  FOREIGN KEY (ID_asignatura_horario_bb_vc) REFERENCES td_Asignaturas_bb_vc(ID_asignatura_bb_vc),
  FOREIGN KEY (ID_espacio_horario_bb_vc) REFERENCES td_Espacios_bb_vc(ID_espacio_bb_vc),
  FOREIGN KEY (ID_profesor_horario_bb_vc) REFERENCES td_Profesores_bb_vc(ID_profesor_bb_vc),
  FOREIGN KEY (ID_grado_horario_bb_vc) REFERENCES td_Grados_bb_vc(ID_grado_bb_vc),
  FOREIGN KEY (ID_seccion_horario_bb_vc) REFERENCES td_Secciones_bb_vc(ID_seccion_bb_vc)
);

-- -----------------------------------------------------
-- SECCIÓN 2: DATOS DE EJEMPLO (POBLACIÓN)
-- -----------------------------------------------------

-- Roles (ID 1: Admin, ID 2: Profesor)
INSERT INTO td_Rol_bb_vc (rol_bb_vc) VALUES ('Administrador'), ('Profesor');

-- Días (ID 1-5)
INSERT INTO td_Dia_bb_vc (dia_bb_vc) VALUES ('lunes'), ('martes'), ('miércoles'), ('jueves'), ('viernes');

-- Bloques (ID 1-10)
INSERT INTO td_Bloque_bb_vc (hora_bloque_bb_vc) VALUES
('7:00 am'), ('8:00 am'), ('9:00 am'), ('10:00 am'), ('11:00 am'),
('12:00 pm'), ('1:00 pm'), ('2:00 pm'), ('3:00 pm'), ('4:00 pm');

-- Grados (ID 1-5)
INSERT INTO td_Grados_bb_vc (nro_grado_bb_vc) VALUES (1), (2), (3), (4), (5);

-- Secciones (ID 1-3: A, B, C)
INSERT INTO td_Secciones_bb_vc (letra_seccion_bb_vc) VALUES ('A'), ('B'), ('C');

-- Tipos de Espacio (ID 1: Aula, ID 2: Lab, ID 3: Cancha)
INSERT INTO td_TipoEspacio_bb_vc (tipo_bb_vc) VALUES ('Aula Genérica'), ('Laboratorio'), ('Cancha');

-- Espacios Físicos
INSERT INTO td_Espacios_bb_vc (nombre_bb_vc, capacidad_bb_vc, ID_TipoEspacio_espacio_bb_vc) VALUES
('Aula 101', 30, 1),
('Aula 102', 30, 1),
('Laboratorio de Química', 25, 2),
('Cancha Principal', 50, 3);

-- Asignaturas (Materias)
-- ID 1: Matemática (Aula Genérica, NULL usa ID 1)
-- ID 2: Química (Requiere Lab, ID 2)
-- ID 3: Ed. Física (Requiere Cancha, ID 3)
INSERT INTO td_Asignaturas_bb_vc (nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc) VALUES
('Matemática', 5, 'Matemática de 1er año', 1, 1, 1),
('Química', 4, 'Química de 3er año', 2, 2, 2),
('Educación Física', 2, 'Deportes', 2, 2, 3);

-- Asignaturas por Grado
-- 1er año (Grado ID 1) ve Matemática (Asig ID 1)
INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc) VALUES (1, 1);
-- 3er año (Grado ID 3) ve Química (Asig ID 2) y Ed. Física (Asig ID 3)
INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc) VALUES
(3, 2),
(3, 3);

-- Usuarios
-- ID 1: Admin
-- ID 2: Prof. Ana
-- ID 3: Prof. Luis
INSERT INTO td_Usuarios_bb_vc (nombre_bb_vc, apellido_bb_vc, correo_bb_vc, telefono_bb_vc) VALUES
('Admin', 'Soporte', 'admin@mail.com', '000-0000'),
('Ana', 'Gómez', 'ana.gomez@mail.com', '111-1111'),
('Luis', 'Pérez', 'luis.perez@mail.com', '222-2222');

-- Asignación de Roles
-- UserRol ID 1: Admin (User 1) es Admin (Rol 1)
INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc) VALUES (1, 1);
-- UserRol ID 2: Ana (User 2) es Profesor (Rol 2)
INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc) VALUES (2, 2);
-- UserRol ID 3: Luis (User 3) es Profesor (Rol 2)
INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc) VALUES (3, 2);

-- Especialización (Quién es Admin)
INSERT INTO td_Administradores_bb_vc (ID_usuarioRol_admin_bb_vc) VALUES (1);

-- Especialización (Quiénes son Profesores)
-- Prof ID 1: Ana (UserRol ID 2)
INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (2);
-- Prof ID 2: Luis (UserRol ID 3)
INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (3);

-- Idoneidad de Profesores (Qué pueden dar)
-- Prof. Ana (Prof ID 1) da Matemática (Asig ID 1)
INSERT INTO td_ProfesorAsignaturas_bb_vc (ID_profesor_profAsig_bb_vc, ID_asignatura_profAsig_bb_vc) VALUES (1, 1);
-- Prof. Luis (Prof ID 2) da Química (Asig ID 2) y Ed. Física (Asig ID 3)
INSERT INTO td_ProfesorAsignaturas_bb_vc (ID_profesor_profAsig_bb_vc, ID_asignatura_profAsig_bb_vc) VALUES
(2, 2),
(2, 3);

-- Disponibilidad (Ejemplo: Prof. Ana no puede los lunes en la mañana)
-- Ana (Prof ID 1) SÍ PUEDE: todos los días (1-5), menos el lunes (1) en el bloque (1).
-- Para este modelo, es más fácil registrar las *excepciones* o los *bloqueos*.
-- (Lo dejaremos vacío por ahora, asumiendo disponibilidad total)