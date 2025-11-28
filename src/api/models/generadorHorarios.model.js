import db_vc_bb from "../db.js";

export class GeneradorHorarios_vc_bb {
  constructor() {
    this.db_vc_bb = db_vc_bb;
    this.asignaturas_vc_bb = [];
    this.profesores_vc_bb = [];
    this.espacios_vc_bb = [];
    this.disponibilidadProf_vc_bb = [];
    this.disponibilidadEsp_vc_bb = [];
    this.gradosAsignaturas_vc_bb = [];
    this.secciones_vc_bb = [];

    this.ocupacionProf_vc_bb = {};
    this.ocupacionEsp_vc_bb = {};
    this.ocupacionGrupo_vc_bb = {};

    this.solucion_vc_bb = [];
    this.dominios_vc_bb = {};
    this.mejorSolucion_vc_bb = [];
    this.mejorCosto_vc_bb = Infinity;

    // Índice de disponibilidad real (dia|bloque|espacio) => true
    this._dispRealIndex_vc_bb = new Set();
  }

  // Helper: intenta elegir la primera propiedad existente entre candidatos
  _pickField(obj, candidates) {
    for (const c of candidates) {
      if (Object.prototype.hasOwnProperty.call(obj, c)) return obj[c];
    }
    return undefined;
  }

  async cargarDatos_vc_bb() {
    try {
      const [
        asignaturas,
        profesores,
        espacios,
        disponibilidadProf,
        disponibilidadEsp,
        gradosAsignaturas,
        secciones, 
        clases
      ] = await Promise.all([
        this.db_vc_bb.all_vc_bb("SELECT * FROM td_Asignaturas_bb_vc"),
        this.db_vc_bb.all_vc_bb("SELECT * FROM td_ProfesorAsignaturas_bb_vc"),
        this.db_vc_bb.all_vc_bb("SELECT * FROM td_Espacios_bb_vc"),
        this.db_vc_bb.all_vc_bb("SELECT * FROM td_DisponibilidadProfesor_bb_vc"),
        this.db_vc_bb.all_vc_bb("SELECT * FROM vista_DisponibilidadRealEspacio_bb_vc"),
        this.db_vc_bb.all_vc_bb("SELECT * FROM td_GradosAsignaturas_bb_vc"),
        this.db_vc_bb.all_vc_bb("SELECT * FROM td_Secciones_bb_vc"),
        this.db_vc_bb.all_vc_bb("SELECT * FROM td_Clases_bb_vc")
      ]);

      this.asignaturas_vc_bb = asignaturas;
      this.profesores_vc_bb = profesores;
      this.espacios_vc_bb = espacios;
      this.disponibilidadProf_vc_bb = disponibilidadProf;
      this.disponibilidadEsp_vc_bb = disponibilidadEsp;
      this.gradosAsignaturas_vc_bb = gradosAsignaturas;
      this.secciones_vc_bb = secciones;
      this.clases_vc_bb = clases;

      // Construir índice de disponibilidad real a partir de disponibilidadEsp
      this._dispRealIndex_vc_bb = new Set();
      for (const row of this.disponibilidadEsp_vc_bb) {
        const dia = this._pickField(row, [
          "ID_dia_DisponEspacio_bb_vc",
          "ID_dia_OcupEspacio_bb_vc",
          "ID_dia",
          "ID_dia_DisponibilidadEspacio_bb_vc",
          "ID_dia_vista",
          "ID_dia_DisponEspacio"
        ]);
        const bloque = this._pickField(row, [
          "ID_bloque_DisponEspacio_bb_vc",
          "ID_bloque_OcupEspacio_bb_vc",
          "ID_bloque",
          "ID_bloque_DisponibilidadEspacio_bb_vc",
          "ID_bloque_vista"
        ]);
        const espacio = this._pickField(row, [
          "ID_espacio_DisponEspacio_bb_vc",
          "ID_espacio_OcupEspacio_bb_vc",
          "ID_espacio",
          "ID_espacio_bb_vc",
          "ID_espacio_vista"
        ]);

        if (typeof dia !== "undefined" && typeof bloque !== "undefined" && typeof espacio !== "undefined") {
          const key = `${dia}|${bloque}|${espacio}`;
          this._dispRealIndex_vc_bb.add(key);
        } else {
          console.warn("[WARN] fila disponibilidadEsp sin campos dia/bloque/espacio detectables:", row);
        }
      }

      console.log(`[INFO] Índice de disponibilidad real construido: ${this._dispRealIndex_vc_bb.size} entradas.`);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      throw new Error("Error al cargar los datos de la base de datos");
    }
  }

  // Método de validación de disponibilidades
  async validarDisponibilidades_vc_bb() {
    try {
      const countProf = await this.db_vc_bb.get_vc_bb("SELECT COUNT(*) AS total FROM td_DisponibilidadProfesor_bb_vc");
      const countDias = await this.db_vc_bb.get_vc_bb("SELECT COUNT(*) AS total FROM td_Dia_bb_vc");
      const countBloques = await this.db_vc_bb.get_vc_bb("SELECT COUNT(*) AS total FROM td_Bloque_bb_vc");
      const countEspacios = await this.db_vc_bb.get_vc_bb("SELECT COUNT(*) AS total FROM td_Espacios_bb_vc");

      if (countProf.total === 0) throw new Error("No hay disponibilidad de profesores registrada.");
      if (countDias.total === 0 || countBloques.total === 0 || countEspacios.total === 0)
        throw new Error("Faltan días, bloques o espacios para calcular la disponibilidad real.");
    } catch (error) {
      console.error("Error al validar disponibilidades:", error);
      throw new Error("Error en la validación de disponibilidades");
    }
  }

construirDominios_vc_bb() {
  this.asignaturasExpand_vc_bb = [];

  for (const asig of this.asignaturas_vc_bb) {
    const profIdoneos = this.getProfesoresIdoneos_vc_bb(asig.ID_asignatura_bb_vc);

    // Inicializar dominio
    this.dominios_vc_bb[asig.ID_asignatura_bb_vc] = [];

    for (const prof of profIdoneos) {
      const slots = this.getSlotsDisponibles_vc_bb(
        prof,
        asig.ID_TipoEspacio_requerido_bb_vc,
        asig.ID_asignatura_bb_vc
      );

      // Preordenar slots por disponibilidad: menos ocupados primero
      slots.sort((a, b) => {
        const cargaA = (this.ocupacionProf_vc_bb[a.profesor]?.[a.dia]?.size || 0) +
                       (this.ocupacionEsp_vc_bb[a.espacio]?.[a.dia]?.size || 0);
        const cargaB = (this.ocupacionProf_vc_bb[b.profesor]?.[b.dia]?.size || 0) +
                       (this.ocupacionEsp_vc_bb[b.espacio]?.[b.dia]?.size || 0);
        return cargaA - cargaB;
      });

      this.dominios_vc_bb[asig.ID_asignatura_bb_vc].push(...slots);
    }

    // Expandir asignaturas según horas académicas
    const repeticiones = Math.max(1, asig.horas_academicas_bb_vc || 1);
    for (let i = 0; i < repeticiones; i++) {
      this.asignaturasExpand_vc_bb.push(asig);
    }
  }

  // Ordenar asignaturasExpand_vc_bb por dominio más pequeño primero
  this.asignaturasExpand_vc_bb.sort((a, b) => {
    const domA = this.dominios_vc_bb[a.ID_asignatura_bb_vc]?.length || 0;
    const domB = this.dominios_vc_bb[b.ID_asignatura_bb_vc]?.length || 0;
    return domA - domB;
  });
}


  getProfesoresIdoneos_vc_bb(idAsignatura) {
    return this.profesores_vc_bb
      .filter(p => p.ID_asignatura_profAsig_bb_vc === idAsignatura)
      .map(p => p.ID_profesor_profAsig_bb_vc);
  }

// Generar slots disponibles para cada profesor y asignatura
getSlotsDisponibles_vc_bb(profesorId, tipoEspacio, asignaturaId) {
  const candidatos = [];
  const seen = new Set();

  // Índice rápido de disponibilidad del profesor
  const dispProfIndex = new Map();
  for (const dp of this.disponibilidadProf_vc_bb) {
    if (dp.ID_profesor_DispProfesor_bb_vc === profesorId) {
      dispProfIndex.set(`${dp.ID_dia_DispProfesor_bb_vc}|${dp.ID_bloque_DispProfesor_bb_vc}`, dp);
    }
  }
  if (dispProfIndex.size === 0) return candidatos;

  // Espacios compatibles
  const espaciosCompatibles = tipoEspacio
    ? this.espacios_vc_bb.filter(e => e.ID_TipoEspacio_espacio_bb_vc === tipoEspacio)
    : this.espacios_vc_bb;
  if (espaciosCompatibles.length === 0) return candidatos;

  // Grados asignados
  const gradosAsignatura = this.gradosAsignaturas_vc_bb.filter(
    ga => ga.ID_asignatura_gradoAsig_bb_vc === asignaturaId
  );
  if (gradosAsignatura.length === 0) return candidatos;

  // Precomputar secciones por grado
  const seccionesPorGrado = {};
  for (const grado of gradosAsignatura) {
    const claseRows = this.clases_vc_bb.filter(c => c.ID_grado_clase_bb_vc === grado.ID_grado_gradoAsig_bb_vc);
    seccionesPorGrado[grado.ID_grado_gradoAsig_bb_vc] = claseRows
      .map(c => this.secciones_vc_bb.find(s => s.ID_seccion_bb_vc === c.ID_seccion_clase_bb_vc))
      .filter(Boolean);
  }

  // Generar slots
  for (const [diaBloque] of dispProfIndex.entries()) {
    const [dia, bloque] = diaBloque.split("|");

    for (const espacio of espaciosCompatibles) {
      const keyEsp = `${dia}|${bloque}|${espacio.ID_espacio_bb_vc}`;
      if (!this._dispRealIndex_vc_bb.has(keyEsp)) continue;

      for (const grado of gradosAsignatura) {
        const seccionesGrado = seccionesPorGrado[grado.ID_grado_gradoAsig_bb_vc];
        if (!seccionesGrado || seccionesGrado.length === 0) continue;

        for (const seccion of seccionesGrado) {
          const slot = {
            dia: parseInt(dia),
            bloque: parseInt(bloque),
            profesor: profesorId,
            espacio: espacio.ID_espacio_bb_vc,
            asignatura: asignaturaId,
            grado: grado.ID_grado_gradoAsig_bb_vc,
            seccion: seccion.ID_seccion_bb_vc
          };
          const k = `${slot.dia}|${slot.bloque}|${slot.espacio}|${slot.profesor}|${slot.grado}|${slot.seccion}`;
          if (!seen.has(k)) {
            seen.add(k);
            candidatos.push(slot);
          }
        }
      }
    }
  }

  return candidatos;
}

  buscarHorario_vc_bb() {
    this.ocupacionProf_vc_bb = {};
    this.ocupacionEsp_vc_bb = {};
    this.ocupacionGrupo_vc_bb = {};
    this.solucion_vc_bb = [];
    this.mejorSolucion_vc_bb = [];
    this.mejorCosto_vc_bb = Infinity;

    const listaTrabajo = this.asignaturasExpand_vc_bb.length
      ? this.asignaturasExpand_vc_bb
      : this.asignaturas_vc_bb;

    listaTrabajo.sort((a, b) => {
      const domA = this.dominios_vc_bb[a.ID_asignatura_bb_vc]?.length || 0;
      const domB = this.dominios_vc_bb[b.ID_asignatura_bb_vc]?.length || 0;
      if (domA === domB) return (b.horas_academicas_bb_vc || 1) - (a.horas_academicas_bb_vc || 1);
      return domA - domB;
    });

    this._listaTrabajo_vc_bb = listaTrabajo;
    this.buscarSoluciones_vc_bb(0);

    this.solucion_vc_bb = this.mejorSolucion_vc_bb;
    return this.mejorSolucion_vc_bb.length > 0;
  }

// Método de búsqueda con límite de tiempo
buscarSoluciones_vc_bb(idx) {
  const timeLimit = 180000; // 3min
  const startTime = Date.now();

  const listaTrabajo = this._listaTrabajo_vc_bb || this.asignaturas_vc_bb;

  if (idx >= listaTrabajo.length) {
    const costo = this.calcularCosto_vc_bb(this.solucion_vc_bb);
    if (costo < this.mejorCosto_vc_bb) {
      this.mejorCosto_vc_bb = costo;
      this.mejorSolucion_vc_bb = [...this.solucion_vc_bb];
    }
    return;
  }

  const asig = listaTrabajo[idx];
  let candidatos = this.dominios_vc_bb[asig.ID_asignatura_bb_vc] || [];

  if (candidatos.length === 0) return this.buscarSoluciones_vc_bb(idx + 1);

  candidatos.sort((a, b) => {
    const cargaA = (this.ocupacionProf_vc_bb[a.profesor]?.[a.dia]?.length || 0) +
      (this.ocupacionEsp_vc_bb[a.espacio]?.[a.dia]?.length || 0);
    const cargaB = (this.ocupacionProf_vc_bb[b.profesor]?.[b.dia]?.length || 0) +
      (this.ocupacionEsp_vc_bb[b.espacio]?.[b.dia]?.length || 0);
    return cargaA - cargaB;
  });

  for (const slot of candidatos) {
    if (Date.now() - startTime > timeLimit) {
      console.error("[ERROR] Tiempo límite excedido.");
      return;
    }

    if (this.esFactible_vc_bb(slot)) {
      this.solucion_vc_bb.push(slot);
      this._marcarOcupacion_vc_bb(slot);

      this.buscarSoluciones_vc_bb(idx + 1);

      this._desmarcarOcupacion_vc_bb(slot);
      this.solucion_vc_bb.pop();
    }
  }
}


esFactible_vc_bb(slot) {
  const { profesor, dia, bloque, espacio, grado, seccion } = slot;

  if (this.ocupacionProf_vc_bb[profesor]?.[dia]?.has(bloque)) return false;
  if (this.ocupacionEsp_vc_bb[espacio]?.[dia]?.has(bloque)) return false;
  if (this.ocupacionGrupo_vc_bb[grado]?.[seccion]?.[dia]?.has(bloque)) return false;

  return true;
}



_marcarOcupacion_vc_bb(slot) {
  const { profesor, dia, bloque, espacio, grado, seccion } = slot;

  if (!this.ocupacionProf_vc_bb[profesor]) this.ocupacionProf_vc_bb[profesor] = {};
  if (!this.ocupacionProf_vc_bb[profesor][dia]) this.ocupacionProf_vc_bb[profesor][dia] = new Set();
  this.ocupacionProf_vc_bb[profesor][dia].add(bloque);

  if (!this.ocupacionEsp_vc_bb[espacio]) this.ocupacionEsp_vc_bb[espacio] = {};
  if (!this.ocupacionEsp_vc_bb[espacio][dia]) this.ocupacionEsp_vc_bb[espacio][dia] = new Set();
  this.ocupacionEsp_vc_bb[espacio][dia].add(bloque);

  if (!this.ocupacionGrupo_vc_bb[grado]) this.ocupacionGrupo_vc_bb[grado] = {};
  if (!this.ocupacionGrupo_vc_bb[grado][seccion]) this.ocupacionGrupo_vc_bb[grado][seccion] = {};
  if (!this.ocupacionGrupo_vc_bb[grado][seccion][dia]) this.ocupacionGrupo_vc_bb[grado][seccion][dia] = new Set();
  this.ocupacionGrupo_vc_bb[grado][seccion][dia].add(bloque);

  const key = `${dia}|${bloque}|${espacio}`;
  this._dispRealIndex_vc_bb.delete(key);
}

_desmarcarOcupacion_vc_bb(slot) {
  const { profesor, dia, bloque, espacio, grado, seccion } = slot;

  this.ocupacionProf_vc_bb[profesor]?.[dia]?.delete(bloque);
  this.ocupacionEsp_vc_bb[espacio]?.[dia]?.delete(bloque);
  this.ocupacionGrupo_vc_bb[grado]?.[seccion]?.[dia]?.delete(bloque);

  const key = `${dia}|${bloque}|${espacio}`;
  this._dispRealIndex_vc_bb.add(key);
}



// Calcular costo de la solución actual
calcularCosto_vc_bb(solucion) {
  let costo = 0;

  // Penalización por horas seguidas y huecos por profesor
  const horasPorProfesor = {};

  for (const s of solucion) {
    if (!horasPorProfesor[s.profesor]) horasPorProfesor[s.profesor] = {};
    if (!horasPorProfesor[s.profesor][s.dia]) horasPorProfesor[s.profesor][s.dia] = [];
    horasPorProfesor[s.profesor][s.dia].push(s.bloque);
  }

  for (const prof in horasPorProfesor) {
    for (const dia in horasPorProfesor[prof]) {
      const horas = horasPorProfesor[prof][dia].sort((a, b) => a - b);

      let consecutivas = 1;
      for (let i = 1; i < horas.length; i++) {
        if (horas[i] === horas[i - 1] + 1) {
          consecutivas++;
          if (consecutivas > 3) costo += 2; // penalización por más de 3 horas consecutivas
        } else {
          consecutivas = 1;
        }

        if (horas[i] - horas[i - 1] > 2) costo += 1; // penalización por huecos grandes
      }
    }
  }

  // Penalización por distribuir la misma asignatura en demasiados días
  const diasPorAsignatura = {};

  for (const s of solucion) {
    if (!diasPorAsignatura[s.asignatura]) diasPorAsignatura[s.asignatura] = new Set();
    diasPorAsignatura[s.asignatura].add(s.dia);
  }

  for (const asig in diasPorAsignatura) {
    const dias = diasPorAsignatura[asig].size;
    if (dias > 3) costo += (dias - 3) * 2; // penalización por demasiada dispersión
  }

  return costo;
}

  // Guardar solución final
  async guardarEnBaseDeDatos_vc_bb() {
    try {
      await this.db_vc_bb.run_vc_bb("DELETE FROM td_Horario_bb_vc");

      const query = `
        INSERT INTO td_Horario_bb_vc
        (ID_asignatura_horario_bb_vc, ID_profesor_horario_bb_vc, ID_espacio_horario_bb_vc, 
        ID_grado_horario_bb_vc, ID_seccion_horario_bb_vc, ID_dia_horario_bb_vc, ID_bloque_horario_bb_vc)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      for (const s of this.solucion_vc_bb) {
        await this.db_vc_bb.run_vc_bb(query, [
          s.asignatura,
          s.profesor,
          s.espacio,
          s.grado,
          s.seccion,
          s.dia,
          s.bloque
        ]);
      }

      console.log("[INFO] Horario guardado exitosamente en la BD.");
    } catch (error) {
      console.error("[ERROR] No se pudo guardar el horario:", error);
      throw new Error("Error al guardar la solución en la base de datos");
    }
  }

  // Exportar solución como arreglo estructurado
  exportarSolucion_vc_bb() {
    return this.solucion_vc_bb.map(s => ({
      asignatura: s.asignatura,
      profesor: s.profesor,
      espacio: s.espacio,
      grado: s.grado,
      seccion: s.seccion,
      dia: s.dia,
      bloque: s.bloque
    }));
  }

  // Función principal: coordina todo
// Función principal: coordina todo
async generar_vc_bb() {
  try {
    // 1. Verificar si ya existen horarios
    const count = await this.db_vc_bb.get_vc_bb("SELECT COUNT(*) AS total FROM td_Horario_bb_vc");
    if (count.total > 0) {
      console.log("Horarios ya generados previamente, devolviendo existentes...");
      // Si existen, obtener los horarios legibles para admin
      return this.obtenerHorariosLegiblesAdmin_vc_bb();
    }

    // 2. Si no existen, ejecutar el generador
    console.log("[INFO] Cargando datos...");
    await this.cargarDatos_vc_bb();

    console.log("[INFO] Validando disponibilidades...");
    await this.validarDisponibilidades_vc_bb();

    console.log("[INFO] Construyendo dominios...");
    this.construirDominios_vc_bb();

    console.log("[INFO] Buscando solución...");
    const exito = this.buscarHorario_vc_bb();

    if (!exito) {
      throw new Error("No se pudo generar un horario válido.");
    }

    console.log("[INFO] Solución encontrada, guardando...");
    await this.guardarEnBaseDeDatos_vc_bb();

    console.log("[INFO] Proceso completado.");
    // Retorna la versión legible para el admin
    return this.obtenerHorariosLegiblesAdmin_vc_bb();
  } catch (error) {
    console.error("[ERROR] No se pudo generar el horario:", error);
    throw error;
  }
}


  /**
   * Obtener horario completo de un profesor con valores legibles
   */
  async obtenerHorariosPorProfesor_vc_bb(idProfesor) {
    try {
      const horariosProfesor = await this.db_vc_bb.all_vc_bb(
        "SELECT * FROM vista_horarios_profesor_bb_vc WHERE ID_profesor = ?",
        [idProfesor]
      );
      return horariosProfesor;
    } catch (error) {
      console.error("Error al obtener horarios del profesor:", error);
      throw new Error("Error interno al consultar horarios del profesor");
    }
  }

  /**
   * Obtener horarios completos para admin, con valores legibles
   */
  async obtenerHorariosLegiblesAdmin_vc_bb() {
    try {
      const horariosLegibles = await this.db_vc_bb.all_vc_bb(
        "SELECT * FROM vista_horarios_admin_bb_vc"
      );
      return horariosLegibles;
    } catch (error) {
      console.error("Error al obtener horarios legibles para admin:", error);
      throw new Error("Error interno al consultar horarios legibles para admin");
    }
  }

  /**
   * Función principal: generar horario y retornar la versión legible para admin
   */
  async generarLegibleAdmin_vc_bb() {
    // Genera primero el horario normal
    await this.generar_vc_bb();

    // Retorna la versión legible desde la vista
    return this.obtenerHorariosLegiblesAdmin_vc_bb();
  }
}

