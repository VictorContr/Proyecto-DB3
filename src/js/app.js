import { setupThemeToggle_vc_bb } from "./dark-mode.js";
import { admin_vc_bb, ExcelHandler_vc_bb } from "./excelProfesor.js";
import { ExcelEspaciosHandler_vc_bb } from "./excelEspacios.js";
import { ExcelAsignaturaHandler_vc_bb } from "./excelAsignatura.js";
import { ExcelSeccionesGradosHandler_vc_bb } from "./excelSeccionesGrados.js";
import { ExcelDisponibilidadHandler_vc_bb } from "./excelDisponibilidad.js";
import { GestorSesion_vc_bb, loginForm_vc_bb, logoutButton_vc_bb } from "./login.js";
import "../components/crudTable.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("cargado el app_vc_bb");
  // Inicializar toggle de tema siempre para que páginas sin login/logout también funcionen
  setupThemeToggle_vc_bb();

  if (GestorSesion_vc_bb.verificarAcceso_vc_bb()) {
  // El método ya maneja la redirección automáticamente
  console.log("Verificando ...")
}
  // VARIABLES

  // EVENTOS

  // Validar formulario de login
  if (loginForm_vc_bb) {
    loginForm_vc_bb.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evita recargar la página
      GestorSesion_vc_bb.iniciarSesion_vc_bb();
    });
  }

  // Cerrar sesión
  if (logoutButton_vc_bb) {
    logoutButton_vc_bb.addEventListener("click", () => {
      GestorSesion_vc_bb.cerrarSesion_vc_bb();
    });
  }

  if (admin_vc_bb) {
    const excelHandler = new ExcelHandler_vc_bb();
    const excelEspaciosHandler_vc_bb = new ExcelEspaciosHandler_vc_bb();
    const excelAsignaturaHandler_vc_bb = new ExcelAsignaturaHandler_vc_bb();
    const excelSeccionesGradosHandler_vc_bb = new ExcelSeccionesGradosHandler_vc_bb();
    const excelDisponibilidadHandler_vc_bb = new ExcelDisponibilidadHandler_vc_bb();
    
    // Evento para subir (submit o click)
    const btnUpload = document.getElementById('btnUploadProfesores');
    const formExcel = document.getElementById('formUploadProfesores');
    
    if (formExcel) {
        formExcel.addEventListener('submit', async (e) => {
            e.preventDefault();
            const file = excelHandler.getCurrentFile_vc_bb();
            await excelHandler.uploadExcel_vc_bb(file);
        });
    } else if (btnUpload) {
        
        btnUpload.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("subir")
            const file = excelHandler.getCurrentFile_vc_bb();
            await excelHandler.uploadExcel_vc_bb(file);
        });
    }
    
    // Evento para descargar (click)
    const btnDownload = document.getElementById('btnDownloadReporteProfesores');
    if (btnDownload) {
        btnDownload.addEventListener('click', async () => {
            await excelHandler.downloadExcel_vc_bb();
        });
    }

    // ====== Espacios: Upload/Download ======
    const formEspacios_vc_bb = document.getElementById('formUploadEspacios');
    const btnUploadEspacios_vc_bb = document.getElementById('btnUploadEspacios');
    const btnDownloadEspacios_vc_bb = document.getElementById('btnDownloadReporteEspacios');

    if (formEspacios_vc_bb) {
      formEspacios_vc_bb.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelEspaciosHandler_vc_bb.getCurrentFile_vc_bb();
        await excelEspaciosHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    } else if (btnUploadEspacios_vc_bb) {
      btnUploadEspacios_vc_bb.addEventListener('click', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelEspaciosHandler_vc_bb.getCurrentFile_vc_bb();
        await excelEspaciosHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    }

    if (btnDownloadEspacios_vc_bb) {
      btnDownloadEspacios_vc_bb.addEventListener('click', async () => {
        await excelEspaciosHandler_vc_bb.downloadExcel_vc_bb();
      });
    }

    // (Eliminados eventos de Calendario Bloques/Días)

    // ====== Pensum (Grados + Secciones) usando formulario de Secciones ======
    const formSecciones_vc_bb = document.getElementById('formUploadSecciones');
    const btnUploadSecciones_vc_bb = document.getElementById('btnUploadSecciones');
    const btnDownloadSecciones_vc_bb = document.getElementById('btnDownloadReporteSecciones');

    if (formSecciones_vc_bb) {
      formSecciones_vc_bb.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelSeccionesGradosHandler_vc_bb.getCurrentFile_vc_bb();
        await excelSeccionesGradosHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    } else if (btnUploadSecciones_vc_bb) {
      btnUploadSecciones_vc_bb.addEventListener('click', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelSeccionesGradosHandler_vc_bb.getCurrentFile_vc_bb();
        await excelSeccionesGradosHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    }

    if (btnDownloadSecciones_vc_bb) {
      btnDownloadSecciones_vc_bb.addEventListener('click', async () => {
        await excelSeccionesGradosHandler_vc_bb.downloadExcel_vc_bb();
      });
    }

    // ====== Asignaturas usando formulario de Asignaturas ======
    const formAsignaturas_vc_bb = document.getElementById('formUploadAsignaturas');
    const btnUploadAsignaturas_vc_bb = document.getElementById('btnUploadAsignaturas');
    const btnDownloadAsignaturas_vc_bb = document.getElementById('btnDownloadReporteAsignaturas');

    if (formAsignaturas_vc_bb) {
      console.log('[App] Bind submit -> Asignaturas upload');
      formAsignaturas_vc_bb.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelAsignaturaHandler_vc_bb.getCurrentFile_vc_bb();
        console.log('[App] Click submit Asignaturas: preparando subida');
        await excelAsignaturaHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    } else if (btnUploadAsignaturas_vc_bb) {
      console.log('[App] Bind click -> Asignaturas upload');
      btnUploadAsignaturas_vc_bb.addEventListener('click', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelAsignaturaHandler_vc_bb.getCurrentFile_vc_bb();
        console.log('[App] Click btnUploadAsignaturas: preparando subida');
        await excelAsignaturaHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    }

    if (btnDownloadAsignaturas_vc_bb) {
      console.log('[App] Bind click -> Asignaturas download');
      btnDownloadAsignaturas_vc_bb.addEventListener('click', async () => {
        console.log('[App] Click btnDownloadAsignaturas: iniciando descarga');
        await excelAsignaturaHandler_vc_bb.downloadExcel_vc_bb();
      });
    }

    // ====== Disponibilidades: Upload/Download ======
    const formDisponibilidad_vc_bb = document.getElementById('formUploadDisponibilidad');
    const btnUploadDisponibilidad_vc_bb = document.getElementById('btnUploadDisponibilidad');
    const btnDownloadDisponibilidad_vc_bb = document.getElementById('btnDownloadReporteDisponibilidad');

    if (formDisponibilidad_vc_bb) {
      formDisponibilidad_vc_bb.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelDisponibilidadHandler_vc_bb.getCurrentFile_vc_bb();
        await excelDisponibilidadHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    } else if (btnUploadDisponibilidad_vc_bb) {
      btnUploadDisponibilidad_vc_bb.addEventListener('click', async (e) => {
        e.preventDefault();
        const file_vc_bb = excelDisponibilidadHandler_vc_bb.getCurrentFile_vc_bb();
        await excelDisponibilidadHandler_vc_bb.uploadExcel_vc_bb(file_vc_bb);
      });
    }

    if (btnDownloadDisponibilidad_vc_bb) {
      btnDownloadDisponibilidad_vc_bb.addEventListener('click', async () => {
        await excelDisponibilidadHandler_vc_bb.downloadExcel_vc_bb();
      });
    }
  }
});
