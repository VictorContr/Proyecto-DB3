import { modal_vc_bb } from "./modal.js";
import { ExcelManager_vc_bb } from "./excel.js";

export class ExcelEspaciosHandler_vc_bb {
  constructor() {
    this.excelManager_vc_bb = new ExcelManager_vc_bb();

    // Referencias a DOM de la sección Espacios
    this.inputExcel_vc_bb = document.getElementById("archivoExcelEspacios");
    this.btnUpload_vc_bb = document.getElementById("btnUploadEspacios");
    this.uploadText_vc_bb = document.getElementById("uploadTextEspacios");
    this.uploadSpinner_vc_bb = document.getElementById("uploadSpinnerEspacios");
    this.btnDownload_vc_bb = document.getElementById("btnDownloadReporteEspacios");
    this.downloadText_vc_bb = document.getElementById("downloadTextEspacios");
    this.downloadSpinner_vc_bb = document.getElementById("downloadSpinnerEspacios");
  }

  async uploadExcel_vc_bb(file_vc_bb) {
    if (!file_vc_bb) {
      await modal_vc_bb.showWarning_vc_bb(
        "Archivo no seleccionado",
        "Por favor, selecciona un archivo Excel antes de subirlo."
      );
      return false;
    }

    if (!this.excelManager_vc_bb.validateFile_vc_bb(file_vc_bb)) {
      await modal_vc_bb.showError_vc_bb("Validación de archivo", "Archivo inválido o muy grande");
      return false;
    }

    const confirm_vc_bb = await modal_vc_bb.showConfirm_vc_bb(
      "Confirmar carga",
      "¿Estás seguro de que deseas importar la lista de espacios? Esto podría sobrescribir registros existentes."
    );
    if (!confirm_vc_bb) return false;

    this.toggleUploadState_vc_bb(true);

    try {
      const result_vc_bb = await this.excelManager_vc_bb.subir_vc_bb({
        file_vc_bb,
        uploadPath_vc_bb: "/api/espacios/excel/upload",
        fieldName_vc_bb: "archivo",
      });

      if (result_vc_bb.ok_vc_bb && result_vc_bb.exito_vc_bb) {
        const successMsg_vc_bb = result_vc_bb.message_vc_bb || "Los datos se importaron correctamente.";
        await modal_vc_bb.showSuccess_vc_bb("Importación exitosa", successMsg_vc_bb);

        if (Array.isArray(result_vc_bb.errors_vc_bb) && result_vc_bb.errors_vc_bb.length) {
          const previewErrors_vc_bb = result_vc_bb.errors_vc_bb.slice(0, 10).join("\n");
          await modal_vc_bb.showWarning_vc_bb(
            "Observaciones",
            `Se registraron ${result_vc_bb.errors_vc_bb.length} avisos.\n\n${previewErrors_vc_bb}`
          );
        }
        return true;
      }

      const baseError_vc_bb = result_vc_bb.message_vc_bb
        || (result_vc_bb.ok_vc_bb === false ? "Ocurrió un error al procesar el archivo." : "Solicitud inválida.");

      if (Array.isArray(result_vc_bb.errors_vc_bb) && result_vc_bb.errors_vc_bb.length) {
        const previewErrors_vc_bb = result_vc_bb.errors_vc_bb.slice(0, 10).join("\n");
        await modal_vc_bb.showError_vc_bb(
          "Error en la importación",
          `${baseError_vc_bb}\n\nDetalles:\n${previewErrors_vc_bb}`
        );
      } else {
        await modal_vc_bb.showError_vc_bb("Error en la importación", baseError_vc_bb);
      }
      return false;
    } catch (err_vc_bb) {
      console.error("❌ Error al subir Excel (Espacios):", err_vc_bb);
      const message_vc_bb = err_vc_bb.name === "TypeError"
        ? "Error de conexión con el servidor"
        : "Error inesperado al procesar el archivo";
      await modal_vc_bb.showError_vc_bb("Error de subida", message_vc_bb);
      return false;
    } finally {
      this.toggleUploadState_vc_bb(false);
      if (this.inputExcel_vc_bb) this.inputExcel_vc_bb.value = "";
    }
  }

  async downloadExcel_vc_bb() {
    const confirm_vc_bb = await modal_vc_bb.showConfirm_vc_bb(
      "Descargar reporte",
      "¿Deseas descargar el listado actualizado de espacios en formato Excel?"
    );
    if (!confirm_vc_bb) return false;

    this.toggleDownloadState_vc_bb(true);

    try {
      const result_vc_bb = await this.excelManager_vc_bb.descargar_vc_bb({
        downloadPath_vc_bb: "/api/espacios/excel/download",
        fileNamePrefix_vc_bb: "espacios",
      });

      if (result_vc_bb.ok_vc_bb) {
        await modal_vc_bb.showSuccess_vc_bb("Descarga completada", "El archivo Excel se descargó correctamente.");
        return true;
      }

      await modal_vc_bb.showError_vc_bb(
        "Error de descarga",
        result_vc_bb.message_vc_bb || "No se pudo descargar el reporte de espacios."
      );
      return false;
    } catch (err_vc_bb) {
      console.error("❌ Error al descargar Excel (Espacios):", err_vc_bb);
      await modal_vc_bb.showError_vc_bb(
        "Error de descarga",
        err_vc_bb?.message || "No se pudo descargar el reporte de espacios."
      );
      return false;
    } finally {
      this.toggleDownloadState_vc_bb(false);
    }
  }

  toggleUploadState_vc_bb(loading_vc_bb) {
    if (this.btnUpload_vc_bb) {
      this.btnUpload_vc_bb.disabled = loading_vc_bb;
      this.uploadSpinner_vc_bb?.classList.toggle("hidden", !loading_vc_bb);
      if (this.uploadText_vc_bb) this.uploadText_vc_bb.textContent = loading_vc_bb ? "Subiendo..." : "Subir Archivo";
    }
  }

  toggleDownloadState_vc_bb(loading_vc_bb) {
    if (this.btnDownload_vc_bb) {
      this.btnDownload_vc_bb.disabled = loading_vc_bb;
      this.downloadSpinner_vc_bb?.classList.toggle("hidden", !loading_vc_bb);
      if (this.downloadText_vc_bb) this.downloadText_vc_bb.textContent = loading_vc_bb ? "Descargando..." : "Descargar Reporte";
    }
  }

  getCurrentFile_vc_bb() {
    return this.inputExcel_vc_bb?.files[0] || null;
  }
}
