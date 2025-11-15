import XlsxPopulate_vc_bb from "xlsx-populate";
import xl_vc_bb from "excel4node";
import db_vc_bb from "../db.js";
import fs_vc_bb from "fs";
import path_vc_bb from "path";

// 📤 Descargar profesores en Excel
// 📤 Descargar profesores en Excel (CORREGIDO)
export const descargarProfesoresExcel_vc_bb = async (req, res) => {
  try {
    const profesores_vc_bb = await db_vc_bb.all_vc_bb(`
      SELECT p.ID_profesor_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.correo_bb_vc, u.telefono_bb_vc
      FROM td_Profesores_bb_vc p
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
    `);

    const wb_vc_bb = new xl_vc_bb.Workbook();
    const ws_vc_bb = wb_vc_bb.addWorksheet("Profesores");

    const headers_vc_bb = ["ID", "Nombre", "Apellido", "Correo", "Teléfono"];
    headers_vc_bb.forEach((h_vc_bb, i_vc_bb) => ws_vc_bb.cell(1, i_vc_bb + 1).string(h_vc_bb));

    profesores_vc_bb.forEach((prof_vc_bb, rowIndex_vc_bb) => {
      ws_vc_bb.cell(rowIndex_vc_bb + 2, 1).number(prof_vc_bb.ID_profesor_bb_vc);
      ws_vc_bb.cell(rowIndex_vc_bb + 2, 2).string(prof_vc_bb.nombre_bb_vc);
      ws_vc_bb.cell(rowIndex_vc_bb + 2, 3).string(prof_vc_bb.apellido_bb_vc);
      ws_vc_bb.cell(rowIndex_vc_bb + 2, 4).string(prof_vc_bb.correo_bb_vc);
      ws_vc_bb.cell(rowIndex_vc_bb + 2, 5).string(prof_vc_bb.telefono_bb_vc);
    });

    const tempDir_vc_bb = path_vc_bb.resolve("temp");
    if (!fs_vc_bb.existsSync(tempDir_vc_bb)) fs_vc_bb.mkdirSync(tempDir_vc_bb);

    const fileName_vc_bb = `profesores_${Date.now()}.xlsx`;
    const filePath_vc_bb = path_vc_bb.join(tempDir_vc_bb, fileName_vc_bb);

    await new Promise((resolve_vc_bb, reject_vc_bb) => {
      wb_vc_bb.write(filePath_vc_bb, (err_vc_bb, stats_vc_bb) => {
        if (err_vc_bb) return reject_vc_bb(err_vc_bb);
        resolve_vc_bb(stats_vc_bb);
      });
    });

    res.download(filePath_vc_bb, "profesores.xlsx", (err_vc_bb) => {
      if (err_vc_bb) {
        console.error("Error al enviar archivo:", err_vc_bb);
        if (fs_vc_bb.existsSync(filePath_vc_bb)) fs_vc_bb.unlinkSync(filePath_vc_bb);
      } else {
        fs_vc_bb.unlinkSync(filePath_vc_bb);
      }
    });
  } catch (error_vc_bb) {
    console.error("❌ Error al generar Excel:", error_vc_bb.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error al generar Excel." });
    }
  }
};
// 📥 Subir profesores desde un Excel
// 📥 Subir profesores desde un Excel (CORREGIDO y BLINDADO)
export const subirProfesoresExcel_vc_bb = async (req, res) => {
  let filePath_vc_bb = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      fs_vc_bb.unlinkSync(filePath_vc_bb);
      return res
        .status(400)
        .json({ message: "Solo se permiten archivos .xlsx" });
    }

    const workbook_vc_bb = await XlsxPopulate_vc_bb.fromFileAsync(filePath_vc_bb);
    const sheet_vc_bb = workbook_vc_bb.sheet(0);
    const rows_vc_bb = sheet_vc_bb.usedRange().value();

    if (!rows_vc_bb || rows_vc_bb.length < 2) {
      fs_vc_bb.unlinkSync(filePath_vc_bb);
      return res
        .status(400)
        .json({ message: "El archivo está vacío o no tiene formato válido." });
    }

    const headers_vc_bb = rows_vc_bb[0];
    let successfulImports_vc_bb = 0;
    let errors_vc_bb = [];

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

        if (!existingUser_vc_bb) {
          return username_vc_bb;
        }

        username_vc_bb = `${baseUsername_vc_bb}${counter_vc_bb}`;
        counter_vc_bb++;
        if (counter_vc_bb > 100) return `${baseUsername_vc_bb}${Date.now()}`;
      }
    };

    for (let i_vc_bb = 1; i_vc_bb < rows_vc_bb.length; i_vc_bb++) {
      const row_vc_bb = rows_vc_bb[i_vc_bb];

      if (
        !row_vc_bb ||
        row_vc_bb.every((cell_vc_bb) => cell_vc_bb === null || cell_vc_bb === undefined || cell_vc_bb === "")
      )
        continue;

      const [nombre_vc_bb, apellido_vc_bb, correo_vc_bb, telefono_vc_bb] = row_vc_bb;

      if (!nombre_vc_bb || !apellido_vc_bb || !correo_vc_bb) {
        errors_vc_bb.push(`Fila ${i_vc_bb + 1}: Faltan datos obligatorios.`);
        continue;
      }

      try {
        const existingUser_vc_bb = await db_vc_bb.get_vc_bb(
          "SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE correo_bb_vc = ?",
          [correo_vc_bb]
        );

        if (existingUser_vc_bb) {
          errors_vc_bb.push(`Fila ${i_vc_bb + 1}: El correo ${correo_vc_bb} ya existe`);
          continue;
        }

        const userNameGenerado_vc_bb = await generateUsername_vc_bb(nombre_vc_bb, apellido_vc_bb);

        const passwordDefault_vc_bb = "123456";

        console.log(
          `Insertando: User=${userNameGenerado_vc_bb}, Mail=${correo_vc_bb}, Pass=${passwordDefault_vc_bb}`
        );

        const userInsert_vc_bb = await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_Usuarios_bb_vc (
            nombre_bb_vc, 
            apellido_bb_vc, 
            correo_bb_vc, 
            telefono_bb_vc, 
            userName_bb_vc,
            password_bb_vc
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            nombre_vc_bb.toString().trim(),
            apellido_vc_bb.toString().trim(),
            correo_vc_bb.toString().trim(),
            telefono_vc_bb.toString().trim(),
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

        console.log(`ID UsuarioRol generado: ${newUserRolId_vc_bb}`);

        await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_Profesores_bb_vc (
            ID_usuarioRol_profesor_bb_vc
          ) VALUES (?)
        `,
          [newUserRolId_vc_bb]
        );

        successfulImports_vc_bb++;
        console.log(`✅ Éxito completo para ${nombre_vc_bb}`);

        successfulImports_vc_bb++;
      } catch (dbError_vc_bb) {
        console.error(`❌ Error detallado en fila ${i_vc_bb + 1}:`, dbError_vc_bb);
        errors_vc_bb.push(`Fila ${i_vc_bb + 1}: Error DB - ${dbError_vc_bb.message}`);
      }
    }

    if (fs_vc_bb.existsSync(filePath_vc_bb)) fs_vc_bb.unlinkSync(filePath_vc_bb);

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports_vc_bb}.`,
      errors: errors_vc_bb,
      exito: successfulImports_vc_bb > 0,
    });
  } catch (error_vc_bb) {
    console.error("❌ Error general:", error_vc_bb);
    if (filePath_vc_bb && fs_vc_bb.existsSync(filePath_vc_bb)) fs_vc_bb.unlinkSync(filePath_vc_bb);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};
