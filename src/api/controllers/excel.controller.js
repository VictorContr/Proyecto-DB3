import db_vc_bb from "../db.js";
import { ExcelModel_vc_bb } from "../services/excel.model.js";

// 📤 Descargar profesores en Excel
// 📤 Descargar profesores en Excel (CORREGIDO)
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
// 📥 Subir profesores desde un Excel (CORREGIDO y BLINDADO)
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
