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
// 📥 Subir profesores desde un Excel (CORREGIDO y BLINDADO)
export const subirProfesoresExcel_vc_bb = async (req, res) => {
  let filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    // Validar extensión del archivo
    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "Solo se permiten archivos .xlsx" });
    }

    const workbook = await XlsxPopulate.fromFileAsync(filePath);
    const sheet = workbook.sheet(0);
    const rows = sheet.usedRange().value();

    if (!rows || rows.length < 2) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "El archivo está vacío o no tiene formato válido." });
    }

    const headers = rows[0];
    let successfulImports = 0;
    let errors = [];

    // Función interna para generar username único
    const generateUsername = async (nombre, apellido) => {
      // Limpieza agresiva para evitar nulos
      const cleanNombre = nombre ? nombre.toString().toLowerCase().trim() : "u";
      const cleanApellido = apellido
        ? apellido.toString().toLowerCase().replace(/\s/g, "").trim()
        : "user";

      const baseUsername = `${cleanNombre.charAt(0)}${cleanApellido}`;
      let username = baseUsername;
      let counter = 1;

      while (true) {
        const existingUser = await db_vc_bb.get_vc_bb(
          "SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE userName_bb_vc = ?",
          [username]
        );

        if (!existingUser) {
          return username; // Retorna el string libre
        }

        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 100) return `${baseUsername}${Date.now()}`; // Fallback de seguridad
      }
    };

    // Procesar filas (empezando desde la fila 1)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      if (
        !row ||
        row.every((cell) => cell === null || cell === undefined || cell === "")
      )
        continue;

      const [nombre, apellido, correo, telefono] = row;

      if (!nombre || !apellido || !correo) {
        errors.push(`Fila ${i + 1}: Faltan datos obligatorios.`);
        continue;
      }

      try {
        // 1. Verificar si el correo ya existe
        const existingUser = await db_vc_bb.get_vc_bb(
          "SELECT ID_usuario_bb_vc FROM td_Usuarios_bb_vc WHERE correo_bb_vc = ?",
          [correo]
        );

        if (existingUser) {
          errors.push(`Fila ${i + 1}: El correo ${correo} ya existe`);
          continue;
        }

        // 2. Generar Username
        const userNameGenerado = await generateUsername(nombre, apellido);

        // 3. Definir contraseña por defecto (IMPORTANTE: suele ser obligatoria)
        const passwordDefault = "123456";

        // LOG DE DEPURACIÓN: Mira esto en tu consola si vuelve a fallar
        console.log(
          `Insertando: User=${userNameGenerado}, Mail=${correo}, Pass=${passwordDefault}`
        );

        // 4. Insertar usuario (Agregué password_bb_vc por si acaso)
        // Si tu tabla NO tiene columna password, borra esa línea, pero es probable que sí la tenga.
        const userInsert = await db_vc_bb.run_vc_bb(
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
            nombre.toString().trim(),
            apellido.toString().trim(),
            correo.toString().trim(),
            telefono.toString().trim(),
            userNameGenerado, // Aquí va el username garantizado
            passwordDefault, // Contraseña por defecto
          ]
        );

        const newUserId = userInsert.lastID;
        if (!newUserId) {
          throw new Error("No se pudo obtener el ID del usuario nuevo");
        }
        // 5. Asignar Rol (Profesor = 2)
        const userRolInsert = await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_UsuarioRol_bb_vc (ID_usuario_usuarioRol_bb_vc, ID_rol_usuarioRol_bb_vc)
          VALUES (?, 2)
        `,
          [newUserId]
        );

        // 6. Crear registro de Profesor
        const newUserRolId = userRolInsert.lastID;

        if (!newUserRolId) {
          throw new Error(`Error al crear rol para usuario ID ${newUserId}`);
        }

        console.log(`ID UsuarioRol generado: ${newUserRolId}`);

        // 3. Insertar Profesor
        await db_vc_bb.run_vc_bb(
          `
          INSERT INTO td_Profesores_bb_vc (
            ID_usuarioRol_profesor_bb_vc
          ) VALUES (?)
        `,
          [newUserRolId]
        ); // Usamos el ID de rol validado

        successfulImports++;
        console.log(`✅ Éxito completo para ${nombre}`);

        successfulImports++;
      } catch (dbError) {
        console.error(`❌ Error detallado en fila ${i + 1}:`, dbError);
        errors.push(`Fila ${i + 1}: Error DB - ${dbError.message}`);
      }
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(200).json({
      message: `Proceso finalizado. Importados: ${successfulImports}.`,
      errors: errors,
      exito: successfulImports > 0,
    });
  } catch (error) {
    console.error("❌ Error general:", error);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: "Error crítico al procesar Excel." });
  }
};
