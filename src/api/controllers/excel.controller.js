import db_vc_bb from "../db.js";
import { ExcelModel_vc_bb } from "../services/excel.model.js";
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
      { title_vc_bb: "ID", key_vc_bb: "ID_profesor_bb_vc" },
      { title_vc_bb: "Nombre", key_vc_bb: "nombre_bb_vc" },
      { title_vc_bb: "Apellido", key_vc_bb: "apellido_bb_vc" },
      { title_vc_bb: "Correo", key_vc_bb: "correo_bb_vc" },
      { title_vc_bb: "Teléfono", key_vc_bb: "telefono_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const profesores_vc_bb = await db_vc_bb.all_vc_bb(`
        SELECT p.ID_profesor_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.correo_bb_vc, u.telefono_bb_vc
        FROM td_Profesores_bb_vc p
        JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
        JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
      `);
      return profesores_vc_bb;
    },
  });
};
// 📥 Subir profesores desde un Excel
export const subirProfesoresExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

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
        { key_vc_bb: "nombre_bb_vc", required_vc_bb: true },
        { key_vc_bb: "apellido_bb_vc", required_vc_bb: true },
        { key_vc_bb: "correo_bb_vc", required_vc_bb: true },
        { key_vc_bb: "telefono_bb_vc", required_vc_bb: false },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const nombre_vc_bb = rowMap_vc_bb.nombre_bb_vc;
        const apellido_vc_bb = rowMap_vc_bb.apellido_bb_vc;
        const correo_vc_bb = rowMap_vc_bb.correo_bb_vc;
        const telefono_vc_bb = rowMap_vc_bb.telefono_bb_vc;

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
            nombre_bb_vc, apellido_bb_vc, correo_bb_vc, telefono_bb_vc, userName_bb_vc, password_bb_vc
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            nombre_vc_bb.toString().trim(),
            apellido_vc_bb.toString().trim(),
            correo_vc_bb.toString().trim(),
            (telefono_vc_bb ?? "").toString().trim(),
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

        await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc) VALUES (?)
        `,
          [newUserRolId_vc_bb]
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

        await db_vc_bb.run_vc_bb(
          `INSERT INTO td_TipoEspacio_bb_vc (tipo_bb_vc) VALUES (?)`,
          [tipo_vc_bb]
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

// 📤 Descargar espacios en Excel
export const descargarEspaciosExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Espacios",
    filePrefix_vc_bb: "espacios",
    headers_vc_bb: [
      { title_vc_bb: "ID", key_vc_bb: "ID_espacio_bb_vc" },
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

        // Buscar o crear el tipo de espacio
        let tipo_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_TipoEspacio_bb_vc FROM td_TipoEspacio_bb_vc WHERE tipo_bb_vc = ?",
          [tipoNombre_vc_bb]
        );
        if (!tipo_vc_bb) {
          const inserted_vc_bb = await db_vc_bb.run_vc_bb(
            `INSERT INTO td_TipoEspacio_bb_vc (tipo_bb_vc) VALUES (?)`,
            [tipoNombre_vc_bb]
          );
          tipo_vc_bb = { ID_TipoEspacio_bb_vc: inserted_vc_bb.lastID };
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
      { title_vc_bb: "ID Grado", key_vc_bb: "ID_grado_bb_vc" },
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
      { title_vc_bb: "ID Sección", key_vc_bb: "ID_seccion_bb_vc" },
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
// 📤 Descargar bloques en Excel
export const descargarBloquesExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Bloques",
    filePrefix_vc_bb: "bloques",
    headers_vc_bb: [
      { title_vc_bb: "ID Bloque", key_vc_bb: "ID_bloque_bb_vc" },
      { title_vc_bb: "Hora", key_vc_bb: "hora_bloque_bb_vc" },
      { title_vc_bb: "Turno", key_vc_bb: "turno_bloque_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const bloques_vc_bb = await db_vc_bb.all_vc_bb(
        `SELECT ID_bloque_bb_vc, hora_bloque_bb_vc, turno_bloque_bb_vc FROM td_Bloque_bb_vc ORDER BY ID_bloque_bb_vc`
      );
      return bloques_vc_bb;
    },
  });
};

// 📥 Subir bloques desde un Excel
export const subirBloquesExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const allowedHoras_vc_bb = [
      "7:00 am",
      "8:00 am",
      "9:00 am",
      "10:00 am",
      "11:00 am",
      "12:00 pm",
      "1:00 pm",
      "2:00 pm",
      "3:00 pm",
      "4:00 pm",
    ];

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "hora_bloque_bb_vc", required_vc_bb: true },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const hora_vc_bb = String(rowMap_vc_bb.hora_bloque_bb_vc || "").trim();
        if (!hora_vc_bb) throw new Error("Hora de bloque vacía");

        // Validar contra el CHECK del esquema
        if (!allowedHoras_vc_bb.includes(hora_vc_bb)) {
          throw new Error(`Hora de bloque inválida: '${hora_vc_bb}'`);
        }

        // Evitar duplicados por restricción UNIQUE
        const existing_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_bloque_bb_vc FROM td_Bloque_bb_vc WHERE hora_bloque_bb_vc = ?",
          [hora_vc_bb]
        );
        if (existing_vc_bb) {
          throw new Error(`El bloque '${hora_vc_bb}' ya existe`);
        }

        // Derivar turno según la hora (coherente con la lógica de BD)
        const turno_vc_bb = ["1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm"].includes(hora_vc_bb)
          ? "tarde"
          : "mañana";

        await db_vc_bb.run_vc_bb(
          `INSERT INTO td_Bloque_bb_vc (hora_bloque_bb_vc, turno_bloque_bb_vc) VALUES (?, ?)`,
          [hora_vc_bb, turno_vc_bb]
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

// 📤 Descargar días en Excel
export const descargarDiasExcel_vc_bb = async (req, res) => {
  return ExcelModel_vc_bb.generateAndSendExcel_vc_bb({
    res_vc_bb: res,
    sheetName_vc_bb: "Dias",
    filePrefix_vc_bb: "dias",
    headers_vc_bb: [
      { title_vc_bb: "ID Día", key_vc_bb: "ID_dia_bb_vc" },
      { title_vc_bb: "Día", key_vc_bb: "dia_bb_vc" },
    ],
    fetchRows_vc_bb: async () => {
      const dias_vc_bb = await db_vc_bb.all_vc_bb(
        `SELECT ID_dia_bb_vc, dia_bb_vc FROM td_Dia_bb_vc ORDER BY ID_dia_bb_vc`
      );
      return dias_vc_bb;
    },
  });
};

// 📥 Subir días desde un Excel
export const subirDiasExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      return res.status(400).json({ message: "Solo se permiten archivos .xlsx" });
    }

    const allowedDias_vc_bb = ["lunes", "martes", "miércoles", "jueves", "viernes"];

    // Normaliza entradas comunes sin tilde
    const normalizeDia_vc_bb = (dia_vc_bb) => {
      const d_vc_bb = String(dia_vc_bb || "").trim().toLowerCase();
      if (d_vc_bb === "miercoles") return "miércoles"; // mapear sin tilde
      return d_vc_bb;
    };

    const { successfulImports_vc_bb, errors_vc_bb } = await ExcelModel_vc_bb.parseAndProcessExcel_vc_bb({
      filePath_vc_bb,
      columns_vc_bb: [
        { key_vc_bb: "dia_bb_vc", required_vc_bb: true },
      ],
      processRow_vc_bb: async (rowMap_vc_bb) => {
        const diaRaw_vc_bb = rowMap_vc_bb.dia_bb_vc;
        const dia_vc_bb = normalizeDia_vc_bb(diaRaw_vc_bb);
        if (!dia_vc_bb) throw new Error("Día vacío");

        if (!allowedDias_vc_bb.includes(dia_vc_bb)) {
          throw new Error(`Día inválido: '${dia_vc_bb}'`);
        }

        const existing_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_dia_bb_vc FROM td_Dia_bb_vc WHERE dia_bb_vc = ?",
          [dia_vc_bb]
        );
        if (existing_vc_bb) {
          throw new Error(`El día '${dia_vc_bb}' ya existe`);
        }

        await db_vc_bb.run_vc_bb(
          `INSERT INTO td_Dia_bb_vc (dia_bb_vc) VALUES (?)`,
          [dia_vc_bb]
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

// ===============================================
// 📦 Excel combinado: Días + Bloques (una sola .xlsx)
// ===============================================

// 📤 Descargar Días y Bloques en un solo Excel (dos hojas)
export const descargarDiasBloquesExcel_vc_bb = async (req, res) => {
  try {
    const wb_vc_bb = new xl_vc_bb.Workbook();

    // Hoja: Días
    const wsDias_vc_bb = wb_vc_bb.addWorksheet("Dias");
    const dias_vc_bb = await db_vc_bb.all_vc_bb(
      `SELECT ID_dia_bb_vc, dia_bb_vc FROM td_Dia_bb_vc ORDER BY ID_dia_bb_vc`
    );
    // Headers
    wsDias_vc_bb.cell(1, 1).string("ID Día");
    wsDias_vc_bb.cell(1, 2).string("Día");
    dias_vc_bb.forEach((d_vc_bb, i_vc_bb) => {
      wsDias_vc_bb.cell(i_vc_bb + 2, 1).number(Number(d_vc_bb.ID_dia_bb_vc));
      wsDias_vc_bb.cell(i_vc_bb + 2, 2).string(String(d_vc_bb.dia_bb_vc));
    });

    // Hoja: Bloques
    const wsBloques_vc_bb = wb_vc_bb.addWorksheet("Bloques");
    const bloques_vc_bb = await db_vc_bb.all_vc_bb(
      `SELECT ID_bloque_bb_vc, hora_bloque_bb_vc, turno_bloque_bb_vc FROM td_Bloque_bb_vc ORDER BY ID_bloque_bb_vc`
    );
    wsBloques_vc_bb.cell(1, 1).string("ID Bloque");
    wsBloques_vc_bb.cell(1, 2).string("Hora");
    wsBloques_vc_bb.cell(1, 3).string("Turno");
    bloques_vc_bb.forEach((b_vc_bb, i_vc_bb) => {
      wsBloques_vc_bb.cell(i_vc_bb + 2, 1).number(Number(b_vc_bb.ID_bloque_bb_vc));
      wsBloques_vc_bb.cell(i_vc_bb + 2, 2).string(String(b_vc_bb.hora_bloque_bb_vc));
      wsBloques_vc_bb.cell(i_vc_bb + 2, 3).string(String(b_vc_bb.turno_bloque_bb_vc));
    });

    const tempDir_vc_bb = path_vc_bb.resolve("temp");
    if (!fs_vc_bb.existsSync(tempDir_vc_bb)) fs_vc_bb.mkdirSync(tempDir_vc_bb);
    const fileName_vc_bb = `dias_bloques_${Date.now()}.xlsx`;
    const filePath_vc_bb = path_vc_bb.join(tempDir_vc_bb, fileName_vc_bb);

    await new Promise((resolve_vc_bb, reject_vc_bb) => {
      wb_vc_bb.write(filePath_vc_bb, (err_vc_bb) => {
        if (err_vc_bb) return reject_vc_bb(err_vc_bb);
        resolve_vc_bb(true);
      });
    });

    res.download(filePath_vc_bb, "dias_bloques.xlsx", (err_vc_bb) => {
      if (fs_vc_bb.existsSync(filePath_vc_bb)) {
        try { fs_vc_bb.unlinkSync(filePath_vc_bb); } catch (_) {}
      }
      if (err_vc_bb) {
        console.error("Error enviando Excel combinado:", err_vc_bb);
        if (!res.headersSent) res.status(500).json({ message: "Error al enviar Excel." });
      }
    });
  } catch (error_vc_bb) {
    console.error("❌ Error al generar Excel combinado:", error_vc_bb);
    if (!res.headersSent) res.status(500).json({ message: "Error al generar Excel." });
  }
};

// 📥 Subir Días y Bloques desde un solo Excel (dos hojas)
export const subirDiasBloquesExcel_vc_bb = async (req, res) => {
  const filePath_vc_bb = req.file?.path;

  const allowedDias_vc_bb = ["lunes", "martes", "miércoles", "jueves", "viernes"];
  const normalizeDia_vc_bb = (dia_vc_bb) => {
    const d_vc_bb = String(dia_vc_bb || "").trim().toLowerCase();
    if (d_vc_bb === "miercoles") return "miércoles";
    return d_vc_bb;
  };
  const allowedHoras_vc_bb = [
    "7:00 am","8:00 am","9:00 am","10:00 am","11:00 am",
    "12:00 pm","1:00 pm","2:00 pm","3:00 pm","4:00 pm",
  ];

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

    // --- Procesar Días --- (hoja "Dias" o índice 1)
    try {
      const sheetDias_vc_bb = findSheet_vc_bb("Dias", 1);
      const rowsDias_vc_bb = sheetDias_vc_bb.usedRange().value();
      for (let i_vc_bb = 1; i_vc_bb < rowsDias_vc_bb.length; i_vc_bb++) {
        const row_vc_bb = rowsDias_vc_bb[i_vc_bb];
        if (!row_vc_bb || row_vc_bb.every((c_vc_bb) => c_vc_bb == null || c_vc_bb === "")) continue;
        const dia_vc_bb = normalizeDia_vc_bb(row_vc_bb[0]);
        if (!dia_vc_bb) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Dias): Día vacío`); continue; }
        if (!allowedDias_vc_bb.includes(dia_vc_bb)) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Dias): Día inválido '${dia_vc_bb}'`); continue; }
        const exists_vc_bb = await db_vc_bb.get_vc_bb("SELECT ID_dia_bb_vc FROM td_Dia_bb_vc WHERE dia_bb_vc = ?", [dia_vc_bb]);
        if (exists_vc_bb) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Dias): Día duplicado '${dia_vc_bb}'`); continue; }
        await db_vc_bb.run_vc_bb(`INSERT INTO td_Dia_bb_vc (dia_bb_vc) VALUES (?)`, [dia_vc_bb]);
        result_vc_bb.successfulImports_vc_bb++;
      }
    } catch (errDias_vc_bb) {
      result_vc_bb.errors_vc_bb.push(`Error procesando hoja 'Dias': ${errDias_vc_bb.message}`);
    }

    // --- Procesar Bloques --- (hoja "Bloques" o índice 2)
    try {
      const sheetBloques_vc_bb = findSheet_vc_bb("Bloques", 2);
      const rowsBloques_vc_bb = sheetBloques_vc_bb.usedRange().value();
      for (let i_vc_bb = 1; i_vc_bb < rowsBloques_vc_bb.length; i_vc_bb++) {
        const row_vc_bb = rowsBloques_vc_bb[i_vc_bb];
        if (!row_vc_bb || row_vc_bb.every((c_vc_bb) => c_vc_bb == null || c_vc_bb === "")) continue;
        const hora_vc_bb = String(row_vc_bb[0] || "").trim();
        if (!hora_vc_bb) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Bloques): Hora vacía`); continue; }
        if (!allowedHoras_vc_bb.includes(hora_vc_bb)) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Bloques): Hora inválida '${hora_vc_bb}'`); continue; }
        const exists_vc_bb = await db_vc_bb.get_vc_bb("SELECT ID_bloque_bb_vc FROM td_Bloque_bb_vc WHERE hora_bloque_bb_vc = ?", [hora_vc_bb]);
        if (exists_vc_bb) { result_vc_bb.errors_vc_bb.push(`Fila ${i_vc_bb + 1} (Bloques): Bloque duplicado '${hora_vc_bb}'`); continue; }
        const turno_vc_bb = ["1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm"].includes(hora_vc_bb) ? "tarde" : "mañana";
        await db_vc_bb.run_vc_bb(`INSERT INTO td_Bloque_bb_vc (hora_bloque_bb_vc, turno_bloque_bb_vc) VALUES (?, ?)`, [hora_vc_bb, turno_vc_bb]);
        result_vc_bb.successfulImports_vc_bb++;
      }
    } catch (errBloques_vc_bb) {
      result_vc_bb.errors_vc_bb.push(`Error procesando hoja 'Bloques': ${errBloques_vc_bb.message}`);
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

// ===============================================
// 📦 Excel combinado: Grados + Secciones (una sola .xlsx)
// ===============================================

// 📤 Descargar Grados y Secciones en un solo Excel (dos hojas)
export const descargarGradosSeccionesExcel_vc_bb = async (req, res) => {
  try {
    const wb_vc_bb = new xl_vc_bb.Workbook();

    // Hoja: Grados
    const wsGrados_vc_bb = wb_vc_bb.addWorksheet("Grados");
    const grados_vc_bb = await db_vc_bb.all_vc_bb(
      `SELECT ID_grado_bb_vc, nro_grado_bb_vc FROM td_Grados_bb_vc ORDER BY nro_grado_bb_vc`
    );
    wsGrados_vc_bb.cell(1, 1).string("ID Grado");
    wsGrados_vc_bb.cell(1, 2).string("Grado");
    grados_vc_bb.forEach((g_vc_bb, i_vc_bb) => {
      wsGrados_vc_bb.cell(i_vc_bb + 2, 1).number(Number(g_vc_bb.ID_grado_bb_vc));
      wsGrados_vc_bb.cell(i_vc_bb + 2, 2).number(Number(g_vc_bb.nro_grado_bb_vc));
    });

    // Hoja: Secciones
    const wsSecciones_vc_bb = wb_vc_bb.addWorksheet("Secciones");
    const secciones_vc_bb = await db_vc_bb.all_vc_bb(
      `SELECT ID_seccion_bb_vc, letra_seccion_bb_vc FROM td_Secciones_bb_vc ORDER BY letra_seccion_bb_vc`
    );
    wsSecciones_vc_bb.cell(1, 1).string("ID Sección");
    wsSecciones_vc_bb.cell(1, 2).string("Sección");
    secciones_vc_bb.forEach((s_vc_bb, i_vc_bb) => {
      wsSecciones_vc_bb.cell(i_vc_bb + 2, 1).number(Number(s_vc_bb.ID_seccion_bb_vc));
      wsSecciones_vc_bb.cell(i_vc_bb + 2, 2).string(String(s_vc_bb.letra_seccion_bb_vc));
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
