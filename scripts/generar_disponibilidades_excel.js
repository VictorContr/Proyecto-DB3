import path from "path";
import fs from "fs";
import xl from "excel4node";
import db_vc_bb from "../src/api/db.js";

// Genera un Excel con dos hojas: DisponibilidadProfesor y DisponibilidadEspacio
// Basado en los datos reales de la BD SQLite en src/db/database.db
// Formato pensado para ser compatible con la subida: columnas [Día, Bloque, Usuario Profesor] y [Día, Bloque, Nombre Espacio]

async function fetchBaseData() {
  const dias = await db_vc_bb.all_vc_bb(
    "SELECT dia_bb_vc FROM td_Dia_bb_vc ORDER BY ID_dia_bb_vc"
  );
  const bloques = await db_vc_bb.all_vc_bb(
    "SELECT hora_bloque_bb_vc FROM td_Bloque_bb_vc ORDER BY ID_bloque_bb_vc"
  );
  const profesores = await db_vc_bb.all_vc_bb(
    `SELECT u.userName_bb_vc AS userName
     FROM td_Profesores_bb_vc p
     JOIN td_UsuarioRol_bb_vc ur ON p.ID_usuarioRol_profesor_bb_vc = ur.ID_usuarioRol_bb_vc
     JOIN td_Usuarios_bb_vc u ON ur.ID_usuario_usuarioRol_bb_vc = u.ID_usuario_bb_vc
     ORDER BY p.ID_profesor_bb_vc
     LIMIT 20`
  );
  const espacios = await db_vc_bb.all_vc_bb(
    `SELECT nombre_bb_vc AS nombre
     FROM td_Espacios_bb_vc
     ORDER BY ID_espacio_bb_vc
     LIMIT 13`
  );

  return {
    dias: dias.map((d) => d.dia_bb_vc),
    bloques: bloques.map((b) => b.hora_bloque_bb_vc),
    profesores: profesores.map((p) => p.userName),
    espacios: espacios.map((e) => e.nombre),
  };
}

function buildWorkbook(data) {
  const wb = new xl.Workbook();

  // Hoja: DisponibilidadProfesor
  const wsProf = wb.addWorksheet("DisponibilidadProfesor");
  wsProf.cell(1, 1).string("Día");
  wsProf.cell(1, 2).string("Bloque");
  wsProf.cell(1, 3).string("Usuario Profesor");

  // Patrones para no generar todas las combinaciones y mantenerlo manejable
  // Profesores pares: bloques pares; Profesores impares: bloques impares
  let rowProf = 2;
  data.profesores.forEach((userName, pIndex) => {
    data.dias.forEach((dia) => {
      data.bloques.forEach((bloque, bIndex) => {
        const shouldInclude = (pIndex % 2 === 0 && bIndex % 2 === 0) || (pIndex % 2 === 1 && bIndex % 2 === 1);
        if (shouldInclude) {
          wsProf.cell(rowProf, 1).string(String(dia));
          wsProf.cell(rowProf, 2).string(String(bloque));
          wsProf.cell(rowProf, 3).string(String(userName));
          rowProf++;
        }
      });
    });
  });

  // Hoja: DisponibilidadEspacio
  const wsEsp = wb.addWorksheet("DisponibilidadEspacio");
  wsEsp.cell(1, 1).string("Día");
  wsEsp.cell(1, 2).string("Bloque");
  wsEsp.cell(1, 3).string("Nombre Espacio");

  // Patrón de espacios: incluir combinación cuando (sIndex + bIndex) % 3 === 0
  let rowEsp = 2;
  data.espacios.forEach((nombreEspacio, sIndex) => {
    data.dias.forEach((dia) => {
      data.bloques.forEach((bloque, bIndex) => {
        const shouldInclude = ((sIndex + bIndex) % 3) === 0;
        if (shouldInclude) {
          wsEsp.cell(rowEsp, 1).string(String(dia));
          wsEsp.cell(rowEsp, 2).string(String(bloque));
          wsEsp.cell(rowEsp, 3).string(String(nombreEspacio));
          rowEsp++;
        }
      });
    });
  });

  return wb;
}

async function main() {
  try {
    const data = await fetchBaseData();
    if (data.profesores.length === 0) {
      console.warn("No se encontraron profesores en la BD.");
    }
    if (data.espacios.length === 0) {
      console.warn("No se encontraron espacios en la BD.");
    }

    const wb = buildWorkbook(data);

    const projectRoot = path.resolve(".");
    const tempDir = path.join(projectRoot, "Proyecto-DB3", "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const dateStr = new Date().toISOString().slice(0, 10);
    const filePath = path.join(tempDir, `disponibilidades_${dateStr}.xlsx`);

    await new Promise((resolve, reject) => {
      wb.write(filePath, (err, stats) => {
        if (err) return reject(err);
        resolve(stats);
      });
    });

    console.log("Excel generado:", filePath);
    console.log(
      `Resumen -> Profesores: ${data.profesores.length} | Espacios: ${data.espacios.length} | Días: ${data.dias.length} | Bloques: ${data.bloques.length}`
    );
  } catch (err) {
    console.error("Error generando disponibilidades:", err);
    process.exitCode = 1;
  }
}

main();