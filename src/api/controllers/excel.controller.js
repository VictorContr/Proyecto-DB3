import db_vc_bb from "../db.js";
import { ExcelModel_vc_bb } from "../models/excel.model.js";
import XlsxPopulate_vc_bb from "xlsx-populate";
import xl_vc_bb from "excel4node";
import fs_vc_bb from "fs";
import path_vc_bb from "path";

// 📤 Descargar profesores en Excel
export const descargarProfesoresExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Profesores",
    filePrefix_vc_bb: "profesores",
    headers_vc_bb: [
      { title_vc_bb: "Nombre", key_vc_bb: "nombre_bb_vc" },
      { title_vc_bb: "Apellido", key_vc_bb: "apellido_bb_vc" },
      { title_vc_bb: "Correo", key_vc_bb: "correo_bb_vc" },
      { title_vc_bb: "Teléfono", key_vc_bb: "telefono_bb_vc" },
      { title_vc_bb: "Cédula", key_vc_bb: "cedula_bb_vc" },
      { title_vc_bb: "Asignaturas", key_vc_bb: "asignaturas" },
    ],
    fetchRows_vc_bb: async () => {
      const profesores_vc_bb = await db_vc_bb.all_vc_bb(`
        SELECT 
          p.ID_profesor_bb_vc,
          u.nombre_bb_vc,
          u.apellido_bb_vc,
          u.correo_bb_vc,
          u.telefono_bb_vc,
          u.cedula_bb_vc,
          COALESCE(GROUP_CONCAT(a.nombre_bb_vc, ' | '), '') AS asignaturas
        FROM td_Profesores_bb_vc p
        JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
        JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
        LEFT JOIN td_ProfesorAsignaturas_bb_vc pa ON pa.ID_profesor_profAsig_bb_vc = p.ID_profesor_bb_vc
        LEFT JOIN td_Asignaturas_bb_vc a ON pa.ID_asignatura_profAsig_bb_vc = a.ID_asignatura_bb_vc
        GROUP BY p.ID_profesor_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.correo_bb_vc, u.telefono_bb_vc, u.cedula_bb_vc
      `);
      return profesores_vc_bb;
    },
  });
};
// 📥 Subir profesores desde un Excel
export const subirProfesoresExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;
  const warningsAsign_vc_bb = [];

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    // Generador de username reutilizable
    const generateUsername_vc_bb = async (nombre_vc_bb, apellido_vc_bb) => {
      const cleanNombre_vc_bb = nombre_vc_bb ? nombre_vc_bb.toString().toLowerCase().trim() : "u";
      const cleanApellido_vc_bb = apellido_vc_bb
        ? apellido_vc_bb.toString().toLowerCase().replace(/\s/g, "").trim()
        : "user";

      const baseUsername_vc_bb = `${cleanNombre_vc_bb.charAt(0)}${cleanApellido_vc_bb}`;
      let username_vc_bb = baseUsername_vc_bb;
      let counter_vc_bb = 1;

      while (true) {
        const existingUser_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE userName_bb_vc = ?",
          [username_vc_bb]
        );
        if (!existingUser_vc_bb) return username_vc_bb;
        username_vc_bb = `${baseUsername_vc_bb}${counter_vc_bb}`;
        counter_vc_bb++;
        if (counter_vc_bb > 100) return `${baseUsername_vc_bb}${Date.now()}`;
      }
    };

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "nombre_bb_vc", required_vc_bb: true, title_vc_bb: "Nombre" },
        { key_vc_bb: "apellido_bb_vc", required_vc_bb: true, title_vc_bb: "Apellido" },
        { key_vc_bb: "correo_bb_vc", required_vc_bb: true, title_vc_bb: "Correo" },
        { key_vc_bb: "telefono_bb_vc", required_vc_bb: false, title_vc_bb: "Teléfono" },
        { key_vc_bb: "cedula_bb_vc", required_vc_bb: false, title_vc_bb: "Cédula" },
        // Nueva columna opcional para asignaturas del profesor (separadas por coma, punto y coma o |)
        { key_vc_bb: "asignaturas", required_vc_bb: false, title_vc_bb: "Asignaturas" },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const nombre_vc_bb = rowMap_vc_bb.nombre_bb_vc;
        const apellido_vc_bb = rowMap_vc_bb.apellido_bb_vc;
        const correo_vc_bb = rowMap_vc_bb.correo_bb_vc;
        const telefono_vc_bb = rowMap_vc_bb.telefono_bb_vc;
        const cedula_vc_bb = rowMap_vc_bb.cedula_bb_vc;
        const asignaturasRaw_vc_bb = rowMap_vc_bb.asignaturas;

        // Dedupe por correo
        const existingUser_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE correo_bb_vc = ?",
          [correo_vc_bb]
        );
        if (existingUser_vc_bb) {
          throw new Error(`El correo ${correo_vc_bb} ya existe`);
        }

        const userNameGenerado_vc_bb = await generateUsername_vc_bb(nombre_vc_bb, apellido_vc_bb);
        const passwordDefault_vc_bb = "123456";

        const userInsert_vc_bb = await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_Usuarios_bb_vc (
            nombre_bb_vc, apellido_bb_vc, correo_bb_vc, telefono_bb_vc, cedula_bb_vc, userName_bb_vc, password_bb_vc
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            nombre_vc_bb.toString().trim(),
            apellido_vc_bb.toString().trim(),
            correo_vc_bb.toString().trim(),
            (telefono_vc_bb ?? "").toString().trim(),
            (cedula_vc_bb ?? "").toString().trim(),
            userNameGenerado_vc_bb,
            passwordDefault_vc_bb,
          ]
        );

        const newUserId_vc_bb = userInsert_vc_bb.lastID;
        if (!newUserId_vc_bb) {
          throw new Error("No se pudo obtener el ID del usuario nuevo");
        }

        const userRolInsert_vc_bb = await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
          VALUES (?, 2)
        `,
          [newUserId_vc_bb]
        );

        const newUserRolId_vc_bb = userRolInsert_vc_bb.lastID;
        if (!newUserRolId_vc_bb) {
          throw new Error(`Error al crear rol para usuario ID ${newUserId_vc_bb}`);
        }

        const profInsert_vc_bb = await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (?)
        `,
          [newUserRolId_vc_bb]
        );

        const newProfId_vc_bb = profInsert_vc_bb.lastID;
        // Si viene la columna de asignaturas, relacionarlas con el profesor recién creado
        if (newProfId_vc_bb && asignaturasRaw_vc_bb != null && asignaturasRaw_vc_bb !== "") {
          const list_vc_bb = String(asignaturasRaw_vc_bb)
            .split(/[,;|]+/)
            .map((s_vc_bb) => s_vc_bb.trim())
            .filter((s_vc_bb) => s_vc_bb.length > 0);

          for (const nombreAsig_vc_bb of list_vc_bb) {
            // Buscar asignatura por nombre
            const asig_vc_bb = await db_vc_bb.get_vc_bb(
              `SELECT ID_asignatura_bb_vc FROM td_Asignaturas_bb_vc WHERE LOWER(nombre_bb_vc) = LOWER(?)`,
              [nombreAsig_vc_bb]
            );
            if (!asig_vc_bb) {
              // Aviso no bloqueante: la asignatura no existe; se ignora
              warningsAsign_vc_bb.push(
                `Fila profesor '${nombre_vc_bb} ${apellido_vc_bb}': asignatura inexistente '${nombreAsig_vc_bb}'`
              );
              continue;
            }

            // Evitar duplicados
            const existsRel_vc_bb = await db_vc_bb.get_vc_bb(
              `SELECT ID_profesorAsig_bb_vc FROM td_ProfesorAsignaturas_bb_vc WHERE ID_profesor_profAsig_bb_vc = ? AND ID_asignatura_profAsig_bb_vc = ?`,
              [newProfId_vc_bb, asig_vc_bb.ID_asignatura_bb_vc]
            );
            if (!existsRel_vc_bb) {
              await db_vc_bb.run_vc_bb(
                `INSERT INTO td_ProfesorAsignaturas_bb_vc (ID_profesor_profAsig_bb_vc, ID_asignatura_profAsig_bb_vc) VALUES (?, ?)`,
                [newProfId_vc_bb, asig_vc_bb.ID_asignatura_bb_vc]
              );
            }
          }
        }
      },
    });

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports_vc_bb}.`,
      errors: [...errors_vc_bb, ...warningsAsign_vc_bb],
      exito: successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};

// 📤 Descargar tipos de espacio en Excel
export const descargarTipoEspacioExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "TiposEspacio",
    filePrefix_vc_bb: "tipos_espacio",
    headers_vc_bb: [
      { title_vc_bb: "ID Tipo", key_vc_bb: "ID_TipoEspacio_bb_vc" },
      { title_vc_bb: "Tipo", key_vc_bb: "tipo_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const tipos_vc_bb = await db_vc_bb.all_vc_bb(`
        SELECT ID_TipoEspacio_bb_vc, tipo_bb_vc FROM td_TipoEspacio_bb_vc
      `);
      return tipos_vc_bb;
    },
  });
};

// 📥 Subir tipos de espacio desde un Excel
export const subirTipoEspacioExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "tipo_bb_vc", required_vc_bb: true },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const tipo_vc_bb = String(rowMap_vc_bb.tipo_bb_vc || "").trim();
        if (!tipo_vc_bb) throw new Error("Tipo de espacio vacío");

        const existing_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_TipoEspacio_bb_vc FROM td_TipoEspacio_bb_vc WHERE tipo_bb_vc = ?",
          [tipo_vc_bb]
        );
        if (existing_vc_bb) {
          throw new Error(`El tipo de espacio '${tipo_vc_bb}' ya existe`);
        }

        throw new Error("No permitido insertar tipos de espacio por Excel");
      },
    });

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports_vc_bb}.`,
      errors: errors_vc_bb,
      exito: successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};

// 📤 Descargar espacios en Excel
export const descargarEspaciosExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Espacios",
    filePrefix_vc_bb: "espacios",
    headers_vc_bb: [
      { title_vc_bb: "Nombre", key_vc_bb: "nombre_bb_vc" },
      { title_vc_bb: "Capacidad", key_vc_bb: "capacidad_bb_vc" },
      { title_vc_bb: "Tipo", key_vc_bb: "tipo_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const espacios_vc_bb = await db_vc_bb.all_vc_bb(`
        SELECT e.ID_espacio_bb_vc, e.nombre_bb_vc, e.capacidad_bb_vc, t.tipo_bb_vc
        FROM td_Espacios_bb_vc e
        LEFT JOIN td_TipoEspacio_bb_vc t ON e.ID_TipoEspacio_espacio_bb_vc = t.ID_TipoEspacio_bb_vc
      `);
      return espacios_vc_bb;
    },
  });
};

// 📥 Subir espacios desde un Excel
export const subirEspaciosExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "nombre_bb_vc", required_vc_bb: true },
        { key_vc_bb: "capacidad_bb_vc", required_vc_bb: false },
        { key_vc_bb: "tipo_bb_vc", required_vc_bb: true },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const nombre_vc_bb = String(rowMap_vc_bb.nombre_bb_vc || "").trim();
        const capacidadRaw_vc_bb = rowMap_vc_bb.capacidad_bb_vc;
        const tipoNombre_vc_bb = String(rowMap_vc_bb.tipo_bb_vc || "").trim();

        if (!nombre_vc_bb || !tipoNombre_vc_bb) {
          throw new Error("Faltan campos requeridos (nombre o tipo)");
        }

        const capacidad_vc_bb = capacidadRaw_vc_bb != null && capacidadRaw_vc_bb !== ""
          ? parseInt(capacidadRaw_vc_bb, 10)
          : null;

        let tipo_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_TipoEspacio_bb_vc FROM td_TipoEspacio_bb_vc WHERE tipo_bb_vc = ?",
          [tipoNombre_vc_bb]
        );
        if (!tipo_vc_bb) {
          throw new Error(`Tipo de espacio no existe: '${tipoNombre_vc_bb}'`);
        }

        // Insertar espacio
        await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_Espacios_bb_vc (nombre_bb_vc, capacidad_bb_vc, ID_TipoEspacio_espacio_bb_vc)
          VALUES (?, ?, ?)
        `,
          [nombre_vc_bb, capacidad_vc_bb ?? null, tipo_vc_bb.ID_TipoEspacio_bb_vc]
        );
      },
    });

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports_vc_bb}.`,
      errors: errors_vc_bb,
      exito: successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};

// 📤 Descargar grados en Excel
export const descargarGradosExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Grados",
    filePrefix_vc_bb: "grados",
    headers_vc_bb: [
      { title_vc_bb: "Grado", key_vc_bb: "nro_grado_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const grados_vc_bb = await db_vc_bb.all_vc_bb(
        `SELECT ID_grado_bb_vc, nro_grado_bb_vc FROM td_Grados_bb_vc ORDER BY nro_grado_bb_vc`
      );
      return grados_vc_bb;
    },
  });
};

// 📥 Subir grados desde un Excel
export const subirGradosExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "nro_grado_bb_vc", required_vc_bb: true },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const raw_vc_bb = rowMap_vc_bb.nro_grado_bb_vc;
        const grado_vc_bb = Number.parseInt(String(raw_vc_bb).trim(), 10);
        if (!Number.isInteger(grado_vc_bb)) throw new Error("Grado inválido (no entero)");
        if (grado_vc_bb < 1 || grado_vc_bb > 5) throw new Error("Grado fuera de rango (1-5)");

        const existing_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_grado_bb_vc FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ?",
          [grado_vc_bb]
        );
        if (existing_vc_bb) throw new Error(`El grado '${grado_vc_bb}' ya existe`);

        await db_vc_bb.run_vc_bb(
          `INSERT INTO td_Grados_bb_vc (nro_grado_bb_vc) VALUES (?)`,
          [grado_vc_bb]
        );
      },
    });

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports_vc_bb}.`,
      errors: errors_vc_bb,
      exito: successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};

// 📤 Descargar secciones en Excel
export const descargarSeccionesExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Secciones",
    filePrefix_vc_bb: "secciones",
    headers_vc_bb: [
      { title_vc_bb: "Sección", key_vc_bb: "letra_seccion_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const secciones_vc_bb = await db_vc_bb.all_vc_bb(
        `SELECT ID_seccion_bb_vc, letra_seccion_bb_vc FROM td_Secciones_bb_vc ORDER BY letra_seccion_bb_vc`
      );
      return secciones_vc_bb;
    },
  });
};

// 📥 Subir secciones desde un Excel
export const subirSeccionesExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "letra_seccion_bb_vc", required_vc_bb: true },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const seccionRaw_vc_bb = rowMap_vc_bb.letra_seccion_bb_vc;
        const seccion_vc_bb = String(seccionRaw_vc_bb || "").trim().toUpperCase();
        if (!seccion_vc_bb) throw new Error("Sección vacía");

        const existing_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_seccion_bb_vc FROM td_Secciones_bb_vc WHERE letra_seccion_bb_vc = ?",
          [seccion_vc_bb]
        );
        if (existing_vc_bb) throw new Error(`La sección '${seccion_vc_bb}' ya existe`);

        await db_vc_bb.run_vc_bb(
          `INSERT INTO td_Secciones_bb_vc (letra_seccion_bb_vc) VALUES (?)`,
          [seccion_vc_bb]
        );
      },
    });

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports_vc_bb}.`,
      errors: errors_vc_bb,
      exito: successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};

// 📤 Descargar asignaturas con su grado (una sola hoja)
export const descargarAsignaturasGradosExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Asignaturas",
    filePrefix_vc_bb: "asignaturas_grados",
    headers_vc_bb: [
      { title_vc_bb: "Asignatura", key_vc_bb: "nombre_bb_vc" },
      { title_vc_bb: "Horas Semanales", key_vc_bb: "horas_academicas_bb_vc" },
      { title_vc_bb: "Descripción", key_vc_bb: "descripcion_bb_vc" },
      { title_vc_bb: "Duración Bloque Min", key_vc_bb: "duracion_bloque_min_bb_vc" },
      { title_vc_bb: "Duración Bloque Max", key_vc_bb: "duracion_bloque_max_bb_vc" },
      { title_vc_bb: "Tipo Espacio Requerido", key_vc_bb: "tipo_espacio_requerido_bb_vc" },
      { title_vc_bb: "Grado", key_vc_bb: "nro_grado_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const rows_vc_bb = await db_vc_bb.all_vc_bb(
        `SELECT 
            a.ID_asignatura_bb_vc,
            a.nombre_bb_vc,
            a.horas_academicas_bb_vc,
            a.descripcion_bb_vc,
            a.duracion_bloque_min_bb_vc,
            a.duracion_bloque_max_bb_vc,
            te.tipo_bb_vc AS tipo_espacio_requerido_bb_vc,
            g.nro_grado_bb_vc
         FROM td_Asignaturas_bb_vc a
         LEFT JOIN td_GradosAsignaturas_bb_vc ga ON ga.ID_asignatura_gradoAsig_bb_vc = a.ID_asignatura_bb_vc
         LEFT JOIN td_Grados_bb_vc g ON ga.ID_grado_gradoAsig_bb_vc = g.ID_grado_bb_vc
         LEFT JOIN td_TipoEspacio_bb_vc te ON a.ID_TipoEspacio_requerido_bb_vc = te.ID_TipoEspacio_bb_vc
         ORDER BY a.nombre_bb_vc ASC, g.nro_grado_bb_vc ASC`
      );
      return rows_vc_bb;
    },
  });
};

// 📥 Subir asignaturas y su relación de grado (una sola hoja)
export const subirAsignaturasGradosExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "nombre_bb_vc", required_vc_bb: true, title_vc_bb: "Asignatura" },
        { key_vc_bb: "horas_academicas_bb_vc", required_vc_bb: false, title_vc_bb: "Horas Semanales" },
        { key_vc_bb: "descripcion_bb_vc", required_vc_bb: false, title_vc_bb: "Descripción" },
        { key_vc_bb: "duracion_bloque_min_bb_vc", required_vc_bb: false, title_vc_bb: "Duración Bloque Min" },
        { key_vc_bb: "duracion_bloque_max_bb_vc", required_vc_bb: false, title_vc_bb: "Duración Bloque Max" },
        { key_vc_bb: "tipo_espacio_requerido_bb_vc", required_vc_bb: false, title_vc_bb: "Tipo Espacio Requerido" },
        { key_vc_bb: "nro_grado_bb_vc", required_vc_bb: false, title_vc_bb: "Grado" },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const nombre_vc_bb = String(rowMap_vc_bb.nombre_bb_vc || "").trim();
        const horasRaw_vc_bb = rowMap_vc_bb.horas_academicas_bb_vc;
        const descripcionRaw_vc_bb = rowMap_vc_bb.descripcion_bb_vc;
        const durMinRaw_vc_bb = rowMap_vc_bb.duracion_bloque_min_bb_vc;
        const durMaxRaw_vc_bb = rowMap_vc_bb.duracion_bloque_max_bb_vc;
        const tipoEspacioNombre_vc_bb = String(rowMap_vc_bb.tipo_espacio_requerido_bb_vc || "").trim();
        const gradoRaw_vc_bb = rowMap_vc_bb.nro_grado_bb_vc;

        if (!nombre_vc_bb) throw new Error("Nombre de asignatura vacío");

        const horas_vc_bb = horasRaw_vc_bb != null && horasRaw_vc_bb !== ""
          ? parseInt(String(horasRaw_vc_bb).trim(), 10)
          : null;
        if (horas_vc_bb != null && (!Number.isInteger(horas_vc_bb) || horas_vc_bb < 0)) {
          throw new Error("Horas académicas inválidas");
        }

        const durMin_vc_bb = durMinRaw_vc_bb != null && durMinRaw_vc_bb !== ""
          ? parseInt(String(durMinRaw_vc_bb).trim(), 10)
          : null;
        const durMax_vc_bb = durMaxRaw_vc_bb != null && durMaxRaw_vc_bb !== ""
          ? parseInt(String(durMaxRaw_vc_bb).trim(), 10)
          : null;
        if (durMin_vc_bb != null && (!Number.isInteger(durMin_vc_bb) || durMin_vc_bb < 1)) {
          throw new Error("Duración mínima inválida (entero >= 1)");
        }
        if (durMax_vc_bb != null && (!Number.isInteger(durMax_vc_bb) || durMax_vc_bb < 1)) {
          throw new Error("Duración máxima inválida (entero >= 1)");
        }
        if (durMin_vc_bb != null && durMax_vc_bb != null && durMin_vc_bb > durMax_vc_bb) {
          throw new Error("Duración mínima no puede ser mayor que máxima");
        }

        // Upsert asignatura por nombre (evitar duplicados de nombre)
        let asignatura_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_asignatura_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc FROM td_Asignaturas_bb_vc WHERE nombre_bb_vc = ?",
          [nombre_vc_bb]
        );

        if (!asignatura_vc_bb) {
          // Resolver tipo de espacio requerido si viene por nombre
          let tipoEspacioId_vc_bb = null;
          if (tipoEspacioNombre_vc_bb) {
            const tipo_vc_bb = await db_vc_bb.get_vc_bb(
              "SELECT ID_TipoEspacio_bb_vc FROM td_TipoEspacio_bb_vc WHERE tipo_bb_vc = ?",
              [tipoEspacioNombre_vc_bb]
            );
            if (!tipo_vc_bb) {
              throw new Error(`Tipo de espacio no existe: '${tipoEspacioNombre_vc_bb}'`);
            } else {
              tipoEspacioId_vc_bb = tipo_vc_bb.ID_TipoEspacio_bb_vc;
            }
          }

          const insert_vc_bb = await db_vc_bb.run_vc_bb(
            `INSERT INTO td_Asignaturas_bb_vc (nombre_bb_vc, horas_academicas_bb_vc, descripcion_bb_vc, duracion_bloque_min_bb_vc, duracion_bloque_max_bb_vc, ID_TipoEspacio_requerido_bb_vc) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              nombre_vc_bb,
              horas_vc_bb ?? null,
              descripcionRaw_vc_bb != null ? String(descripcionRaw_vc_bb).trim() : null,
              durMin_vc_bb ?? null,
              durMax_vc_bb ?? null,
              tipoEspacioId_vc_bb ?? null,
            ]
          );
          asignatura_vc_bb = { ID_asignatura_bb_vc: insert_vc_bb.lastID };
        } else if (horas_vc_bb != null && horas_vc_bb !== asignatura_vc_bb.horas_academicas_bb_vc) {
          // Actualizar horas si viene valor nuevo
          await db_vc_bb.run_vc_bb(
            `UPDATE td_Asignaturas_bb_vc SET horas_academicas_bb_vc = ? WHERE ID_asignatura_bb_vc = ?`,
            [horas_vc_bb, asignatura_vc_bb.ID_asignatura_bb_vc]
          );
        }

        // Actualizar descripción si viene nueva
        if (descripcionRaw_vc_bb != null) {
          const nuevaDesc_vc_bb = String(descripcionRaw_vc_bb).trim();
          await db_vc_bb.run_vc_bb(
            `UPDATE td_Asignaturas_bb_vc SET descripcion_bb_vc = ? WHERE ID_asignatura_bb_vc = ?`,
            [nuevaDesc_vc_bb, asignatura_vc_bb.ID_asignatura_bb_vc]
          );
        }

        // Actualizar duraciones si vienen válidas
        if (durMin_vc_bb != null) {
          await db_vc_bb.run_vc_bb(
            `UPDATE td_Asignaturas_bb_vc SET duracion_bloque_min_bb_vc = ? WHERE ID_asignatura_bb_vc = ?`,
            [durMin_vc_bb, asignatura_vc_bb.ID_asignatura_bb_vc]
          );
        }
        if (durMax_vc_bb != null) {
          await db_vc_bb.run_vc_bb(
            `UPDATE td_Asignaturas_bb_vc SET duracion_bloque_max_bb_vc = ? WHERE ID_asignatura_bb_vc = ?`,
            [durMax_vc_bb, asignatura_vc_bb.ID_asignatura_bb_vc]
          );
        }

        // Actualizar tipo de espacio requerido si viene nombre
        if (tipoEspacioNombre_vc_bb) {
          let tipo_vc_bb = await db_vc_bb.get_vc_bb(
            "SELECT ID_TipoEspacio_bb_vc FROM td_TipoEspacio_bb_vc WHERE tipo_bb_vc = ?",
            [tipoEspacioNombre_vc_bb]
          );
          if (!tipo_vc_bb) {
            throw new Error(`Tipo de espacio no existe: '${tipoEspacioNombre_vc_bb}'`);
          }
          await db_vc_bb.run_vc_bb(
            `UPDATE td_Asignaturas_bb_vc SET ID_TipoEspacio_requerido_bb_vc = ? WHERE ID_asignatura_bb_vc = ?`,
            [tipo_vc_bb.ID_TipoEspacio_bb_vc, asignatura_vc_bb.ID_asignatura_bb_vc]
          );
        }

        // Relación con grado si viene provisto
        if (gradoRaw_vc_bb != null && gradoRaw_vc_bb !== "") {
          const gradoNum_vc_bb = parseInt(String(gradoRaw_vc_bb).trim(), 10);
          if (!Number.isInteger(gradoNum_vc_bb) || gradoNum_vc_bb < 1 || gradoNum_vc_bb > 5) {
            throw new Error("Grado inválido (debe ser 1-5)");
          }

          const grado_vc_bb = await db_vc_bb.get_vc_bb(
            "SELECT ID_grado_bb_vc FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ?",
            [gradoNum_vc_bb]
          );
          if (!grado_vc_bb) throw new Error(`El grado '${gradoNum_vc_bb}' no existe`);

          const existingRel_vc_bb = await db_vc_bb.get_vc_bb(
            `SELECT ID_gradoAsignatura_bb_vc FROM td_GradosAsignaturas_bb_vc WHERE ID_grado_gradoAsig_bb_vc = ? AND ID_asignatura_gradoAsig_bb_vc = ?`,
            [grado_vc_bb.ID_grado_bb_vc, asignatura_vc_bb.ID_asignatura_bb_vc]
          );
          if (!existingRel_vc_bb) {
            await db_vc_bb.run_vc_bb(
              `INSERT INTO td_GradosAsignaturas_bb_vc (ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc) VALUES (?, ?)`,
              [grado_vc_bb.ID_grado_bb_vc, asignatura_vc_bb.ID_asignatura_bb_vc]
            );
          }
        }
      },
    });

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports_vc_bb}.`,
      errors: errors_vc_bb,
      exito: successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};


// 📦 Excel combinado: Grados + Secciones (una sola .xlsx)


// 📤 Descargar Grados y Secciones en un solo Excel (dos hojas)
export const descargarGradosSeccionesExcel_vc_bb = async (req, res) => {
  try {
    const wb_vc_bb = new xl_vc_bb.Workbook();

    // Hoja: Grados
    const wsGrados_vc_bb = wb_vc_bb.addWorksheet("Grados");
    const grados_vc_bb = await db_vc_bb.all_vc_bb(
      `SELECT nro_grado_bb_vc FROM td_Grados_bb_vc ORDER BY nro_grado_bb_vc`
    );
    wsGrados_vc_bb.cell(1, 1).string("Grado");
    grados_vc_bb.forEach((g_vc_bb, i_vc_bb) => {
      wsGrados_vc_bb.cell(i_vc_bb + 2, 1).number(Number(g_vc_bb.nro_grado_bb_vc));
    });

    // Hoja: Secciones
    const wsSecciones_vc_bb = wb_vc_bb.addWorksheet("Secciones");
    const secciones_vc_bb = await db_vc_bb.all_vc_bb(
      `SELECT letra_seccion_bb_vc FROM td_Secciones_bb_vc ORDER BY letra_seccion_bb_vc`
    );
    wsSecciones_vc_bb.cell(1, 1).string("Sección");
    secciones_vc_bb.forEach((s_vc_bb, i_vc_bb) => {
      wsSecciones_vc_bb.cell(i_vc_bb + 2, 1).string(String(s_vc_bb.letra_seccion_bb_vc));
    });

    const tempDir_vc_bb = path_vc_bb.resolve("temp");
    if (!fs_vc_bb.existsSync(tempDir_vc_bb)) fs_vc_bb.mkdirSync(tempDir_vc_bb);
    const fileName_vc_bb = `grados_secciones_${Date.now()}.xlsx`;
    const filePath_vc_bb = path_vc_bb.join(tempDir_vc_bb, fileName_vc_bb);

    await new Promise((resolve_vc_bb, reject_vc_bb) => {
      wb_vc_bb.write(filePath_vc_bb, (err_vc_bb) => {
        if (err_vc_bb) return reject_vc_bb(err_vc_bb);
        resolve_vc_bb(true);
      });
    });

    res.download(filePath_vc_bb, "grados_secciones.xlsx", (err_vc_bb) => {
      if (fs_vc_bb.existsSync(filePath_vc_bb)) {
        try { fs_vc_bb.unlinkSync(filePath_vc_bb); } catch (_) {}
      }
      if (err_vc_bb) {
        console.error("Error enviando Excel combinado (Grados+Secciones):", err_vc_bb);
        if (!res.headersSent) res.status(500).json({ message: "Error al enviar Excel." });
      }
    });
  } catch (error_vc_bb) {
    console.error("❌ Error al generar Excel combinado (Grados+Secciones):", error_vc_bb);
    if (!res.headersSent) res.status(500).json({ message: "Error al generar Excel." });
  }
};

// 📥 Subir Grados y Secciones desde un solo Excel (dos hojas)
export const subirGradosSeccionesExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  const result_vc_bb = { successfulImports_vc_bb: 0, errors_vc_bb: [] };

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }
    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const workbook_vc_bb = await XlsxPopulate_vc_bb.fromFileAsync(filePath_vc_bb);
    const sheets_vc_bb = workbook_vc_bb.sheets();

    const findSheet_vc_bb = (name_vc_bb, fallbackIndex_vc_bb) => {
      const byName_vc_bb = sheets_vc_bb.find((s_vc_bb) => s_vc_bb.name() === name_vc_bb);
      return byName_vc_bb || workbook_vc_bb.sheet(fallbackIndex_vc_bb);
    };

    // --- Procesar Grados --- (hoja "Grados" o índice 1)
    try {
      const sheetGrados_vc_bb = findSheet_vc_bb("Grados", 1);
      const rowsGrados_vc_bb = sheetGrados_vc_bb.usedRange().value();
      for (let i_vc_bb = 1; i_vc_bb < rowsGrados_vc_bb.length; i_vc_bb++) {
        const row_vc_bb = rowsGrados_vc_bb[i_vc_bb];
        if (!row_vc_bb || row_vc_bb.every((c_vc_bb) => c_vc_bb == null || c_vc_bb === "")) continue;
        const raw_vc_bb = row_vc_bb[0];
        const grado_vc_bb = Number.parseInt(String(raw_vc_bb).trim(), 10);
        if (!Number.isInteger(grado_vc_bb)) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Grados): valor no entero`); continue; }
        if (grado_vc_bb < 1 || grado_vc_bb > 5) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Grados): fuera de rango (1-5)`); continue; }
        const exists_vc_bb = await db_vc_bb.get_vc_bb("SELECT ID_grado_bb_vc FROM td_Grados_bb_vc WHERE nro_grado_bb_vc = ?", [grado_vc_bb]);
        if (exists_vc_bb) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Grados): duplicado '${grado_vc_bb}'`); continue; }
        await db_vc_bb.run_vc_bb(`INSERT INTO td_Grados_bb_vc (nro_grado_bb_vc) VALUES (?)`, [grado_vc_bb]);
        result_vc_bb.successfulImports_vc_bb++;
      }
    } catch (errGrados_vc_bb) {
      result_vc_bb.errors_vc_bb.push(`Error procesando hoja 'Grados': ${errGrados_vc_bb.message}`);
    }

    // --- Procesar Secciones --- (hoja "Secciones" o índice 2)
    try {
      const sheetSecciones_vc_bb = findSheet_vc_bb("Secciones", 2);
      const rowsSecciones_vc_bb = sheetSecciones_vc_bb.usedRange().value();
      for (let i_vc_bb = 1; i_vc_bb < rowsSecciones_vc_bb.length; i_vc_bb++) {
        const row_vc_bb = rowsSecciones_vc_bb[i_vc_bb];
        if (!row_vc_bb || row_vc_bb.every((c_vc_bb) => c_vc_bb == null || c_vc_bb === "")) continue;
        const seccion_vc_bb = String(row_vc_bb[0] || "").trim().toUpperCase();
        if (!seccion_vc_bb) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Secciones): vacía`); continue; }
        const exists_vc_bb = await db_vc_bb.get_vc_bb("SELECT ID_seccion_bb_vc FROM td_Secciones_bb_vc WHERE letra_seccion_bb_vc = ?", [seccion_vc_bb]);
        if (exists_vc_bb) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Secciones): duplicada '${seccion_vc_bb}'`); continue; }
        await db_vc_bb.run_vc_bb(`INSERT INTO td_Secciones_bb_vc (letra_seccion_bb_vc) VALUES (?)`, [seccion_vc_bb]);
        result_vc_bb.successfulImports_vc_bb++;
      }
    } catch (errSecciones_vc_bb) {
      result_vc_bb.errors_vc_bb.push(`Error procesando hoja 'Secciones': ${errSecciones_vc_bb.message}`);
    }

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${result_vc_bb.successfulImports_vc_bb}.`,
      errors: result_vc_bb.errors_vc_bb,
      exito: result_vc_bb.successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  } finally {
    if (filePath_vc_bb && fs_vc_bb.existsSync(filePath_vc_bb)) {
      try { fs_vc_bb.unlinkSync(filePath_vc_bb); } catch (_) {}
    }
  }
};

// 📤 Descargar disponibilidades (una sola .xlsx con dos hojas)
export const descargarDisponibilidadesExcel_vc_bb = async (req, res) => {
  try {
    const wb_vc_bb = new xl_vc_bb.Workbook();
    const wsProf_vc_bb = wb_vc_bb.addWorksheet("DisponibilidadProfesor");

    // Encabezados para ambas hojas
    const headersProf_vc_bb = [
      { title_vc_bb: "Día", key_vc_bb: "dia_bb_vc" },
      { title_vc_bb: "Bloque", key_vc_bb: "hora_bloque_bb_vc" },
      { title_vc_bb: "Usuario Profesor", key_vc_bb: "userName_bb_vc" },
    ];

    // Escribir encabezados
    headersProf_vc_bb.forEach((h_vc_bb, i_vc_bb) => wsProf_vc_bb.cell(1, i_vc_bb + 1).string(h_vc_bb.title_vc_bb));

    // Consultas
    const dispProfRows_vc_bb = await db_vc_bb.all_vc_bb(
      `SELECT 
         dp.ID_DisponibilidadProfesor_bb_vc,
         d.dia_bb_vc,
         b.hora_bloque_bb_vc,
         u.userName_bb_vc
       FROM td_DisponibilidadProfesor_bb_vc dp
       LEFT JOIN td_Dia_bb_vc d ON dp.ID_dia_DispProfesor_bb_vc = d.ID_dia_bb_vc
       LEFT JOIN td_Bloque_bb_vc b ON dp.ID_bloque_DispProfesor_bb_vc = b.ID_bloque_bb_vc
       LEFT JOIN td_Profesores_bb_vc p ON dp.ID_profesor_DispProfesor_bb_vc = p.ID_profesor_bb_vc
       LEFT JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
       LEFT JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
       ORDER BY d.dia_bb_vc, b.hora_bloque_bb_vc, u.userName_bb_vc`
    );


    // Escribir filas de profesor
    dispProfRows_vc_bb.forEach((row_vc_bb, rowIndex_vc_bb) => {
      headersProf_vc_bb.forEach((h_vc_bb, colIndex_vc_bb) => {
        const value_vc_bb = row_vc_bb[h_vc_bb.key_vc_bb];
        if (typeof value_vc_bb === "number") {
          wsProf_vc_bb.cell(rowIndex_vc_bb + 2, colIndex_vc_bb + 1).number(value_vc_bb);
        } else {
          wsProf_vc_bb.cell(rowIndex_vc_bb + 2, colIndex_vc_bb + 1).string(
            value_vc_bb !== undefined && value_vc_bb !== null ? String(value_vc_bb) : ""
          );
        }
      });
    });


    const tempDir_vc_bb = path_vc_bb.resolve("temp");
    if (!fs_vc_bb.existsSync(tempDir_vc_bb)) fs_vc_bb.mkdirSync(tempDir_vc_bb);

    const fileName_vc_bb = `disponibilidad_profesor_${Date.now()}.xlsx`;
    const filePath_vc_bb = path_vc_bb.join(tempDir_vc_bb, fileName_vc_bb);

    await new Promise((resolve_vc_bb, reject_vc_bb) => {
      wb_vc_bb.write(filePath_vc_bb, (err_vc_bb, stats_vc_bb) => {
        if (err_vc_bb) return reject_vc_bb(err_vc_bb);
        resolve_vc_bb(stats_vc_bb);
      });
    });

    res.download(filePath_vc_bb, `disponibilidad_profesor.xlsx`, (err_vc_bb) => {
      if (err_vc_bb) {
        console.error("Error al enviar archivo:", err_vc_bb);
        if (fs_vc_bb.existsSync(filePath_vc_bb)) fs_vc_bb.unlinkSync(filePath_vc_bb);
      } else {
        fs_vc_bb.unlinkSync(filePath_vc_bb);
      }
    });
  } catch (error_vc_bb) {
    console.error("❌ Error al generar Excel de disponibilidades:", error_vc_bb);
    if (!res.headersSent) res.status(500).json({ message: "Error al generar Excel de disponibilidades." });
  }
};

// 📥 Subir disponibilidades (una sola .xlsx con dos hojas)
export const subirDisponibilidadesExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;
  const result_vc_bb = {
    successfulProfesor_vc_bb: 0,
    errors_vc_bb: [],
  };

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const workbook_vc_bb = await XlsxPopulate_vc_bb.fromFileAsync(filePath_vc_bb);

    const normalizarHoraBloque_vc_bb = (raw_vc_bb) => {
      if (raw_vc_bb == null) return null;
      let s_vc_bb = String(raw_vc_bb).trim().toLowerCase();
      if (!s_vc_bb) return null;
      s_vc_bb = s_vc_bb.replace(/\s+/g, '');
      // Si viene como '7:00am', '7am', '07am', '13:00', '13', etc.
      const m1 = s_vc_bb.match(/^([0-9]{1,2})(?::([0-9]{2}))?(am|pm)?$/);
      if (m1) {
        const hh = parseInt(m1[1], 10);
        const mm = m1[2] ? m1[2] : '00';
        const suf = m1[3] || null;
        if (Number.isNaN(hh)) return null;
        // Si trae sufijo am/pm, normalizar directamente
        if (suf === 'am' || suf === 'pm') {
          let hr = hh;
          if (hr < 1 || hr > 12) return null;
          return `${hr}:00 ${suf}`;
        }
        // Si es hora 24h, mapear al formato almacenado
        if (hh >= 0 && hh <= 23) {
          if (hh >= 7 && hh <= 11) return `${hh}:00 am`;
          if (hh === 12) return `12:00 pm`;
          if (hh >= 13 && hh <= 16) return `${hh - 12}:00 pm`;
          return null;
        }
        // Si es un número sin sufijo y fuera de 24h, tratar como índice de bloque (1..N)
        return String(hh);
      }
      return null;
    };

    const resolverBloqueId_vc_bb = async (raw_vc_bb) => {
      const norm_vc_bb = normalizarHoraBloque_vc_bb(raw_vc_bb);
      if (!norm_vc_bb) return null;
      // Si es un número simple, interpretarlo como índice de bloque (orden por hora)
      if (/^[0-9]+$/.test(norm_vc_bb)) {
        const idx = parseInt(norm_vc_bb, 10);
        if (Number.isNaN(idx) || idx < 1) return null;
        const rows = await db_vc_bb.all_vc_bb(`SELECT ID_bloque_bb_vc FROM td_Bloque_bb_vc ORDER BY ID_bloque_bb_vc ASC`);
        if (idx > rows.length) return null;
        return rows[idx - 1]?.ID_bloque_bb_vc || null;
      }
      // Buscar por texto normalizado '7:00 am', '1:00 pm', etc.
      const row = await db_vc_bb.get_vc_bb(
        `SELECT ID_bloque_bb_vc FROM td_Bloque_bb_vc WHERE LOWER(hora_bloque_bb_vc) = LOWER(?)`,
        [norm_vc_bb]
      );
      return row ? row.ID_bloque_bb_vc : null;
    };

    // Hoja: DisponibilidadProfesor
    const sheetProf_vc_bb = workbook_vc_bb.sheet("DisponibilidadProfesor");
    if (!sheetProf_vc_bb) throw new Error("No se encontró hoja 'DisponibilidadProfesor'");
    const rowsProf_vc_bb = sheetProf_vc_bb.usedRange().value();
    if (rowsProf_vc_bb && rowsProf_vc_bb.length >= 2) {
      for (let i_vc_bb = 1; i_vc_bb < rowsProf_vc_bb.length; i_vc_bb++) {
        const row_vc_bb = rowsProf_vc_bb[i_vc_bb];
        if (!row_vc_bb || row_vc_bb.every((c_vc_bb) => c_vc_bb === null || c_vc_bb === undefined || c_vc_bb === "")) {
          continue;
        }
        try {
          const diaRaw_vc_bb = String(row_vc_bb[0] ?? "").trim();
          const bloqueRaw_vc_bb = String(row_vc_bb[1] ?? "").trim();
          const userNameRaw_vc_bb = String(row_vc_bb[2] ?? "").trim();

          if (!diaRaw_vc_bb || !bloqueRaw_vc_bb || !userNameRaw_vc_bb) {
            throw new Error("Faltan datos requeridos (Día, Bloque, Usuario Profesor)");
          }

          const dia_vc_bb = await db_vc_bb.get_vc_bb(
            `SELECT ID_dia_bb_vc FROM td_Dia_bb_vc WHERE LOWER(dia_bb_vc) = LOWER(?)`,
            [diaRaw_vc_bb]
          );
          if (!dia_vc_bb) throw new Error(`Día inválido: '${diaRaw_vc_bb}'`);

          const bloqueId_vc_bb = await resolverBloqueId_vc_bb(bloqueRaw_vc_bb);
          if (!bloqueId_vc_bb) throw new Error(`Bloque inválido: '${bloqueRaw_vc_bb}'`);

          const profesor_vc_bb = await db_vc_bb.get_vc_bb(
            `SELECT p.ID_profesor_bb_vc AS id_profesor
             FROM td_Profesores_bb_vc p
             JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
             JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
             WHERE u.userName_bb_vc = ?`,
            [userNameRaw_vc_bb]
          );
          if (!profesor_vc_bb) throw new Error(`Profesor no encontrado: '${userNameRaw_vc_bb}'`);

          const exists_vc_bb = await db_vc_bb.get_vc_bb(
            `SELECT ID_DisponibilidadProfesor_bb_vc FROM td_DisponibilidadProfesor_bb_vc 
             WHERE ID_dia_DispProfesor_bb_vc = ? AND ID_bloque_DispProfesor_bb_vc = ? AND ID_profesor_DispProfesor_bb_vc = ?`,
            [dia_vc_bb.ID_dia_bb_vc, bloqueId_vc_bb, profesor_vc_bb.id_profesor]
          );
          if (exists_vc_bb) throw new Error("La disponibilidad de profesor ya existe (duplicada)");

          await db_vc_bb.run_vc_bb(
            `INSERT INTO td_DisponibilidadProfesor_bb_vc (ID_dia_DispProfesor_bb_vc, ID_bloque_DispProfesor_bb_vc, ID_profesor_DispProfesor_bb_vc)
             VALUES (?, ?, ?)`,
            [dia_vc_bb.ID_dia_bb_vc, bloqueId_vc_bb, profesor_vc_bb.id_profesor]
          );
          result_vc_bb.successfulProfesor_vc_bb++;
        } catch (errRow_vc_bb) {
          result_vc_bb.errors_vc_bb.push(`Hoja DisponibilidadProfesor - Fila ${i_vc_bb + 1}: ${errRow_vc_bb.message}`);
        }
      }
    }


    res.status(200).json({
      message: `Proceso finalizado. Disponibilidades de profesor importadas: ${result_vc_bb.successfulProfesor_vc_bb}.`,
      errors: result_vc_bb.errors_vc_bb,
      exito: result_vc_bb.successfulProfesor_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general al subir disponibilidades:", error_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel de disponibilidades." });
  } finally {
    if (filePath_vc_bb && fs_vc_bb.existsSync(filePath_vc_bb)) {
      try {
        fs_vc_bb.unlinkSync(filePath_vc_bb);
      } catch (e_vc_bb) {
        console.warn("No se pudo eliminar archivo temporal de disponibilidades:", e_vc_bb);
      }
    }
  }
};
