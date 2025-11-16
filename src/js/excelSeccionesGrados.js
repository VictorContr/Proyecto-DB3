import { ExcelManager_vc_bb } from "./excel.js";
import { modal_vc_bb } from "./modal.js";

// Handler para subir/descargar Pensum (Grados + Secciones) en un solo Excel
export class ExcelSeccionesGradosHandler_vc_bb {
  constructor(apiBaseUrl_vc_bb = "http://localhost:3000") {
    this.manager_vc_bb = new ExcelManager_vc_bb(apiBaseUrl_vc_bb);
    this.uploadPath_vc_bb = "/api/pensum/excel/upload";
    this.downloadPath_vc_bb = "/api/pensum/excel/download";
    this.ids_vc_bb = {
      input: "archivoExcelSecciones",
      uploadBtn: "btnUploadSecciones",
      uploadText: "uploadTextSecciones",
      uploadSpinner: "uploadSpinnerSecciones",
      downloadBtn: "btnDownloadReporteSecciones",
      downloadText: "downloadTextSecciones",
      downloadSpinner: "downloadSpinnerSecciones",
    };
  }

  getCurrentFile_vc_bb() {
    const input_vc_bb = document.getElementById(this.ids_vc_bb.input);
    return input_vc_bb?.files?.[0] || null;
  }

  setLoading_vc_bb(type_vc_bb, isLoading_vc_bb) {
    const textId_vc_bb = type_vc_bb === "upload" ? this.ids_vc_bb.uploadText : this.ids_vc_bb.downloadText;
    const spinnerId_vc_bb = type_vc_bb === "upload" ? this.ids_vc_bb.uploadSpinner : this.ids_vc_bb.downloadSpinner;
    const btnId_vc_bb = type_vc_bb === "upload" ? this.ids_vc_bb.uploadBtn : this.ids_vc_bb.downloadBtn;
    const textEl_vc_bb = document.getElementById(textId_vc_bb);
    const spinnerEl_vc_bb = document.getElementById(spinnerId_vc_bb);
    const btnEl_vc_bb = document.getElementById(btnId_vc_bb);
    if (textEl_vc_bb) textEl_vc_bb.textContent = isLoading_vc_bb
      ? (type_vc_bb === "upload" ? "Subiendo..." : "Descargando...")
      : (type_vc_bb === "upload" ? "Subir Archivo" : "Descargar Reporte");
    if (spinnerEl_vc_bb) spinnerEl_vc_bb.classList.toggle("hidden", !isLoading_vc_bb);
    if (btnEl_vc_bb) btnEl_vc_bb.disabled = isLoading_vc_bb;
  }

  async uploadExcel_vc_bb(file_vc_bb) {
    const confirm_vc_bb = await modal_vc_bb.showConfirm_vc_bb(
      "Subir Pensum",
      "Se procesarán las hojas 'Grados' y 'Secciones' de tu Excel. ¿Deseas continuar?"
    );
    if (!confirm_vc_bb) return false;

    this.setLoading_vc_bb("upload", true);
    try {
      const result_vc_bb = await this.manager_vc_bb.subir_vc_bb({
        file_vc_bb,
        uploadPath_vc_bb: this.uploadPath_vc_bb,
        fieldName_vc_bb: "archivo",
      });

      if (result_vc_bb.ok_vc_bb && result_vc_bb.exito_vc_bb) {
        const errorsCount_vc_bb = Array.isArray(result_vc_bb.errors_vc_bb) ? result_vc_bb.errors_vc_bb.length : 0;
        const previewErrors_vc_bb = errorsCount_vc_bb ? result_vc_bb.errors_vc_bb.slice(0, 10).join("\n") : "";
        await modal_vc_bb.showSuccess_vc_bb(
          "Importación completada",
          `${result_vc_bb.message_vc_bb || "Se procesó el archivo correctamente."}\n\n` +
          (errorsCount_vc_bb ? `Se registraron ${errorsCount_vc_bb} avisos.\n\n${previewErrors_vc_bb}` : "")
        );
        return true;
      }

      const baseError_vc_bb = result_vc_bb.message_vc_bb
        || (result_vc_bb.ok_vc_bb === false ? "Ocurrió un error al procesar el archivo." : "Solicitud inválida.");

      if (Array.isArray(result_vc_bb.errors_vc_bb) && result_vc_bb.errors_vc_bb.length) {
        const previewErrors_vc_bb = result_vc_bb.errors_vc_bb.slice(0, 10).join("\n");
        await modal_vc_bb.showError_vc_bb("Error en la importación", `${baseError_vc_bb}\n\nDetalles:\n${previewErrors_vc_bb}`);
      } else {
        await modal_vc_bb.showError_vc_bb("Error en la importación", baseError_vc_bb);
      }
      return false;
    } catch (err_vc_bb) {
      console.error("❌ Error al subir Excel (Pensum):", err_vc_bb);
      const message_vc_bb = err_vc_bb.name === "TypeError"
        ? "Error de conexión con el servidor"
        : "Error inesperado al procesar el archivo";
      await modal_vc_bb.showError_vc_bb("Error de subida", message_vc_bb);
      return false;
    } finally {
      this.setLoading_vc_bb("upload", false);
      const input_vc_bb = document.getElementById(this.ids_vc_bb.input);
      if (input_vc_bb) input_vc_bb.value = "";
    }
  }

  async downloadExcel_vc_bb() {
    const confirm_vc_bb = await modal_vc_bb.showConfirm_vc_bb(
      "Descargar Pensum",
      "Se descargará un Excel con las hojas 'Grados' y 'Secciones'."
    );
    if (!confirm_vc_bb) return false;

    this.setLoading_vc_bb("download", true);
    try {
      const result_vc_bb = await this.manager_vc_bb.descargar_vc_bb({
        downloadPath_vc_bb: this.downloadPath_vc_bb,
        fileNamePrefix_vc_bb: "pensum",
      });

      if (result_vc_bb.ok_vc_bb) {
        await modal_vc_bb.showSuccess_vc_bb("Descarga completada", "El archivo Excel se descargó correctamente.");
        return true;
      }

      await modal_vc_bb.showError_vc_bb(
        "Error de descarga",
        result_vc_bb.message_vc_bb || "No se pudo descargar el reporte de pensum."
      );
      return false;
    } catch (err_vc_bb) {
      console.error("❌ Error al descargar Excel (Pensum):", err_vc_bb);
      await modal_vc_bb.showError_vc_bb(
        "Error de descarga",
        err_vc_bb?.message || "No se pudo descargar el reporte de pensum."
      );
      return false;
    } finally {
      this.setLoading_vc_bb("download", false);
    }
  }
}