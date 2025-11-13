import XlsxPopulate from "xlsx-populate";
import xl from "excel4node";
import db_vc_bb from "../db.js";
import fs from "fs";
import path from "path";

// 📤 Descargar profesores en Excel
// 📤 Descargar profesores en Excel (CORREGIDO)
export const descargarProfesoresExcel_vc_bb = async (req, res) => {
  try {
    const profesores = await db_vc_bb.all_vc_bb(`
      SELECT p.ID_profesor_bb_vc, u.nombre_bb_vc, u.apellido_bb_vc, u.correo_bb_vc, u.telefono_bb_vc
      FROM td_Profesores_bb_vc p
      JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
      JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
    `);

    const wb = new xl.Workbook();
    const ws = wb.addWorksheet("Profesores");

    // Cabeceras
    const headers = ["ID", "Nombre", "Apellido", "Correo", "Teléfono"];
    headers.forEach((h, i) => ws.cell(1, i + 1).string(h));

    // Datos
    profesores.forEach((prof, rowIndex) => {
      ws.cell(rowIndex + 2, 1).number(prof.ID_profesor_bb_vc);
      ws.cell(rowIndex + 2, 2).string(prof.nombre_bb_vc);
      ws.cell(rowIndex + 2, 3).string(prof.apellido_bb_vc);
      ws.cell(rowIndex + 2, 4).string(prof.correo_bb_vc);
      ws.cell(rowIndex + 2, 5).string(prof.telefono_bb_vc);
    });

    // DEFINIR RUTA ABSOLUTA (Más seguro)
    const tempDir = path.resolve("temp"); 
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const fileName = `profesores_${Date.now()}.xlsx`;
    const filePath = path.join(tempDir, fileName);

    // 🔥 CORRECCIÓN CLAVE: Envolver wb.write en una Promesa
    await new Promise((resolve, reject) => {
      wb.write(filePath, (err, stats) => {
        if (err) return reject(err);
        resolve(stats);
      });
    });

    // Ahora sí estamos seguros de que el archivo existe
    res.download(filePath, "profesores.xlsx", (err) => {
      if (err) {
        console.error("Error al enviar archivo:", err);
        // Solo intentamos borrar si el archivo existe para evitar error doble
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
      } else {
        // Borrar después de enviar exitosamente
        fs.unlinkSync(filePath);
      }
    });

  } catch (error) {
    console.error("❌ Error al generar Excel:", error.message);
    // Evitar enviar respuesta si ya se enviaron cabeceras (por si acaso)
    if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar Excel." });
    }
  }
};
// 📥 Subir profesores desde un Excel
export const subirProfesoresExcel_vc_bb = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    const workbook = await XlsxPopulate.fromFileAsync(req.file.path);
    const sheet = workbook.sheet(0);
    const rows = sheet.usedRange().value();

    // Se espera el mismo orden de columnas: Nombre, Apellido, Correo, Teléfono
    for (let i = 1; i < rows.length; i++) {
      const [nombre, apellido, correo, telefono] = rows[i];

      if (!nombre || !apellido || !correo) continue;

      // Insertar usuario
      const userInsert = await db_vc_bb.run_vc_bb(`
        INSERT INTO td_Usuarios_bb_vc (nombre_bb_vc, apellido_bb_vc, correo_bb_vc, telefono_bb_vc)
        VALUES (?, ?, ?, ?)
      `, [nombre, apellido, correo, telefono]);

      const newUserId = userInsert.lastID;

      // Asignar rol de profesor (ID_rol = 2)
      const userRolInsert = await db_vc_bb.run_vc_bb(`
        INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
        VALUES (?, 2)
      `, [newUserId]);

      const newUserRolId = userRolInsert.lastID;

      // Insertar en tabla de profesores
      await db_vc_bb.run_vc_bb(`
        INSERT INTO td_Profesores_bb_vc (ID_usuarioRol_profesor_bb_vc)
        VALUES (?)
      `, [newUserRolId]);
    }

    // Borrar archivo temporal
    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: "Profesores cargados exitosamente." });
  } catch (error) {
    console.error("❌ Error al subir Excel:", error.message);
    res.status(500).json({ message: "Error al procesar el archivo." });
  }
};
