// Módulo genérico para manejar subida y descarga de Excel
// Provee métodos reutilizables para evitar redundancias en los manejadores específicos
import { getApiBaseUrl_vc_bb, ApiGuide_vc_bb } from "./guide.js";

export class ExcelManager_vc_bb {
  constructor(apiBaseUrl_vc_bb = getApiBaseUrl_vc_bb()) {
    this.apiBaseUrl_vc_bb = apiBaseUrl_vc_bb;
  }

  validateFile_vc_bb(file_vc_bb) {
    const maxSize_vc_bb = 5 * 1024 * 1024; // 5MB
    const allowedTypes_vc_bb = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!file_vc_bb) return false;
    if (file_vc_bb.size > maxSize_vc_bb) return false;
    if (!allowedTypes_vc_bb.includes(file_vc_bb.type)) return false;
    return true;
  }

  async subir_vc_bb({ file_vc_bb, uploadPath_vc_bb, fieldName_vc_bb = "archivo" }) {
    if (!file_vc_bb) {
      return { ok_vc_bb: false, exito_vc_bb: false, message_vc_bb: "Archivo no seleccionado" };
    }

    if (!this.validateFile_vc_bb(file_vc_bb)) {
      return { ok_vc_bb: false, exito_vc_bb: false, message_vc_bb: "Archivo inválido o muy grande" };
    }

    const formData_vc_bb = new FormData();
    formData_vc_bb.append(fieldName_vc_bb, file_vc_bb);

    try {
      const response_vc_bb = await ApiGuide_vc_bb.request("POST", uploadPath_vc_bb, {
        body: formData_vc_bb,
      });

      let data_vc_bb = {};
      try {
        data_vc_bb = await response_vc_bb.json();
      } catch (_) {
        data_vc_bb = {};
      }

      return {
        ok_vc_bb: response_vc_bb.ok,
        exito_vc_bb: !!data_vc_bb.exito,
        message_vc_bb: data_vc_bb.message || (response_vc_bb.ok ? "Operación completada" : "Error en la operación"),
        errors_vc_bb: Array.isArray(data_vc_bb.errors) ? data_vc_bb.errors : [],
        raw_vc_bb: data_vc_bb,
      };
    } catch (err_vc_bb) {
      return {
        ok_vc_bb: false,
        exito_vc_bb: false,
        message_vc_bb: err_vc_bb?.name === "TypeError" ? "Error de conexión con el servidor" : "Error inesperado",
        errors_vc_bb: [],
        raw_vc_bb: null,
      };
    }
  }

  async descargar_vc_bb({ downloadPath_vc_bb, fileNamePrefix_vc_bb = "reporte" }) {
    try {
      const response_vc_bb = await ApiGuide_vc_bb.request("GET", downloadPath_vc_bb);
      if (!response_vc_bb.ok) {
        let jsonError_vc_bb = null;
        try {
          jsonError_vc_bb = await response_vc_bb.json();
        } catch (_) {}
        const msg_vc_bb = jsonError_vc_bb?.message || "Error al generar el Excel";
        throw new Error(msg_vc_bb);
      }

      const blob_vc_bb = await response_vc_bb.blob();
      const url_vc_bb = URL.createObjectURL(blob_vc_bb);

      const a_vc_bb = document.createElement("a");
      a_vc_bb.href = url_vc_bb;
      a_vc_bb.download = `${fileNamePrefix_vc_bb}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a_vc_bb);
      a_vc_bb.click();
      a_vc_bb.remove();
      URL.revokeObjectURL(url_vc_bb);

      return { ok_vc_bb: true, message_vc_bb: "Descarga completada" };
    } catch (err_vc_bb) {
      return { ok_vc_bb: false, message_vc_bb: err_vc_bb?.message || "No se pudo descargar" };
    }
  }
}
