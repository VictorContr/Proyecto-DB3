/*
HorariosController (SQLite)
- generarHorarios_vc_bb: ejecuta generador y responde listado legible.
- obtenerHorariosProfesor_vc_bb: retorna horario por profesor.
*/
import { GeneradorHorarios_vc_bb } from "../models/index.js";

export async function generarHorarios_vc_bb(req_vc_bb, res_vc_bb) {
  try {
    const generador_vc_bb = new GeneradorHorarios_vc_bb();
    const solucion_vc_bb = await generador_vc_bb.generarLegibleAdmin_vc_bb();

    res_vc_bb.json({
      mensaje_vc_bb: "Horarios generados correctamente",
      cantidad_vc_bb: solucion_vc_bb.length,
      horarios_vc_bb: solucion_vc_bb
    });
  } catch (error_vc_bb) {
    console.error("Error al generar horarios:", error_vc_bb);
    res_vc_bb.status(500).json({
      mensaje_vc_bb: "Error al generar horarios",
      error_vc_bb: error_vc_bb.message
    });
  }
}

// controlador para horarios de un profesor
export async function obtenerHorariosProfesor_vc_bb(req_vc_bb, res_vc_bb) {
  try {
    const { idProfesor } = req_vc_bb.params;
    const generador_vc_bb = new GeneradorHorarios_vc_bb();
    const horariosProfesor = await generador_vc_bb.obtenerHorariosPorProfesor_vc_bb(idProfesor);

    res_vc_bb.json({
      mensaje_vc_bb: `Horarios del profesor ${idProfesor}`,
      cantidad_vc_bb: horariosProfesor.length,
      horarios_vc_bb: horariosProfesor
    });
  } catch (error_vc_bb) {
    console.error("Error al obtener horarios del profesor:", error_vc_bb);
    res_vc_bb.status(500).json({
      mensaje_vc_bb: "Error al obtener horarios del profesor",
      error_vc_bb: error_vc_bb.message
    });
  }
}
