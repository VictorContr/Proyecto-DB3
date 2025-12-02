//
// Horarios Frontend (SQLite)
// - generarHorarios_vc_bb: ejecuta API y renderiza tabla.
// - mostrarHorarioProfesor_vc_bb: construye cuadrícula semanal para el profesor.
//
import { ApiGuide_vc_bb } from "./guide.js";
import { modal_vc_bb } from "./modal.js";

export async function generarHorarios_vc_bb() {
  const contenedor = document.getElementById("resultadoHorarios");
  const boton = document.getElementById("btnGenerarHorarios"); // referencia al botón

  try {
    // Deshabilitar botón y mostrar mensaje
    if (boton) {
      boton.disabled = true;
      boton.classList.add("opacity-50", "cursor-not-allowed");
    }

    contenedor.innerHTML = `
      <p class="text-blue-600 dark:text-blue-400 font-semibold mb-4 flex items-center gap-2">
        <span class="animate-spin border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4"></span>
        Generando horarios, por favor no se vaya...
      </p>
    `;

    const resp = await ApiGuide_vc_bb.json("POST", "/api/horarios/generar");
    if (!resp.ok) {
      modal_vc_bb.showError_vc_bb("Error", resp?.data?.mensaje_vc_bb || "Error al generar horarios");
      return;
    }

    const { mensaje_vc_bb, cantidad_vc_bb, horarios_vc_bb } = resp.data;
    modal_vc_bb.showSuccess_vc_bb("Éxito", mensaje_vc_bb);

    // Renderizar tabla con Tailwind
    contenedor.innerHTML = `
      <p class="text-gray-800 dark:text-gray-200 font-semibold mb-4">
        Se generaron ${cantidad_vc_bb || horarios_vc_bb.length} horarios.
      </p>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-600">
              <th class="px-3 py-2">Día</th>
              <th class="px-3 py-2">Bloque</th>
              <th class="px-3 py-2">Asignatura</th>
              <th class="px-3 py-2">Profesor</th>
              <th class="px-3 py-2">Grado</th>
              <th class="px-3 py-2">Sección</th>
              <th class="px-3 py-2">Espacio</th>
            </tr>
          </thead>
          <tbody>
            ${horarios_vc_bb.map(h => `
              <tr class="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                <td class="px-3 py-2">${h.dia}</td>
                <td class="px-3 py-2">${h.bloque}</td>
                <td class="px-3 py-2">${h.asignatura}</td>
                <td class="px-3 py-2">${h.profesor}</td>
                <td class="px-3 py-2">${h.grado}</td>
                <td class="px-3 py-2">${h.seccion}</td>
                <td class="px-3 py-2">${h.espacio}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error("Error al generar horarios:", error);
    modal_vc_bb.showError_vc_bb("Error", "Error de conexión con el servidor");
  } finally {
    // Rehabilitar botón
    if (boton) {
      boton.disabled = false;
      boton.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }
}

export async function mostrarHorarioProfesor_vc_bb() {
  const contenedor = document.getElementById("horarioProfesor");
  let idProfesor = sessionStorage.getItem("idProfesor");
  if (!idProfesor) {
    try {
      const rawUserId = sessionStorage.getItem("selectedUserId_vc_bb");
      const idUsuario = rawUserId ? JSON.parse(rawUserId) : null;
      if (idUsuario) {
        const respMap = await ApiGuide_vc_bb.json("GET", `/api/horarios/profesor-por-usuario/${idUsuario}`);
        if (respMap.ok && respMap.data && respMap.data.ID_profesor) {
          idProfesor = String(respMap.data.ID_profesor);
          sessionStorage.setItem("idProfesor", idProfesor);
        }
      }
    } catch (_) {
      // ignorar error y continuar
    }
  }

  if (!idProfesor || !contenedor) return;

  contenedor.innerHTML = `
    <p class="text-blue-600 dark:text-blue-400 font-semibold mb-4 flex items-center gap-2">
      <span class="animate-spin border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4"></span>
      Cargando horario del profesor...
    </p>
  `;

  try {
    // 1. Obtener bloques desde la BD
    const respBloques = await ApiGuide_vc_bb.json("GET", "/api/bloques");
    if (!respBloques.ok) {
      modal_vc_bb.showError_vc_bb("Error", "No se pudieron cargar los bloques");
      return;
    }
    const bloques = respBloques.data.map(b => b.hora_bloque_bb_vc);

    // 2. Obtener horario del profesor
    const respHorario = await ApiGuide_vc_bb.json("GET", `/api/horarios/profesor/${idProfesor}`);
    if (!respHorario.ok) {
      modal_vc_bb.showError_vc_bb("Error", respHorario?.data?.mensaje_vc_bb || "No se pudo cargar el horario");
      return;
    }

    const { horarios_vc_bb } = respHorario.data;
    if (!horarios_vc_bb || horarios_vc_bb.length === 0) {
      contenedor.innerHTML = `
        <p class="text-gray-600 dark:text-gray-300">
          Todavía no tienes horarios asignados. Espera a que el administrador los genere.
        </p>
      `;
      return;
    }

    const dias = ["lunes", "martes", "miércoles", "jueves", "viernes"];

    // 3. Construir tabla
    const tabla = document.createElement("table");
    tabla.className = "table-auto w-full text-sm text-center border border-gray-300 dark:border-gray-600";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr class="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
        <th class="border px-2 py-1">Bloque</th>
        ${dias.map(d => `<th class="border px-2 py-1">${d.charAt(0).toUpperCase() + d.slice(1)}</th>`).join("")}
      </tr>
    `;
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (let i = 0; i < bloques.length; i++) {
      const bloque = bloques[i];
      const bloqueSiguiente = bloques[i + 1] || "Fin";

      const fila = document.createElement("tr");

      const celdaBloque = document.createElement("td");
      celdaBloque.textContent = `${bloque} - ${bloqueSiguiente}`;
      celdaBloque.className = "border px-2 py-1 font-semibold bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
      fila.appendChild(celdaBloque);

      for (const dia of dias) {
        const celda = document.createElement("td");
        celda.className = "border px-2 py-1 align-top bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300";

        const clase = horarios_vc_bb.find(h => h.dia === dia && h.bloque === bloque);
        if (clase) {
          celda.innerHTML = `
            <div class="font-bold text-colegio-blue dark:text-white">${clase.asignatura}</div>
            <div>${clase.grado}º ${clase.seccion}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${clase.espacio}</div>
          `;
        }

        fila.appendChild(celda);
      }

      tbody.appendChild(fila);
    }

    tabla.appendChild(tbody);
    contenedor.innerHTML = "";
    contenedor.appendChild(tabla);
  } catch (error) {
    console.error("Error al cargar horario del profesor:", error);
    modal_vc_bb.showError_vc_bb("Error", "Error de conexión con el servidor");
  }
}
