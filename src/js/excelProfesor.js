import { modal_vc_bb } from "./modal.js";
import { ExcelManager_vc_bb } from "./excel.js";
import { getApiBaseUrl_vc_bb } from "./guide.js";

export const admin_vc_bb = document.getElementById("admin");

export class ExcelHandler_vc_bb {
    constructor(apiBaseUrl_vc_bb = getApiBaseUrl_vc_bb()) {
        this.apiBaseUrl_vc_bb = apiBaseUrl_vc_bb;
        this.excelManager_vc_bb = new ExcelManager_vc_bb(this.apiBaseUrl_vc_bb);
        this.inputExcel_vc_bb = document.getElementById("archivoExcelProfesores");
        this.btnUpload_vc_bb = document.getElementById("btnUploadProfesores");
        this.uploadText_vc_bb = document.getElementById("uploadTextProfesores");
        this.uploadSpinner_vc_bb = document.getElementById("uploadSpinnerProfesores");
        this.btnDownload_vc_bb = document.getElementById("btnDownloadReporteProfesores");
        this.downloadText_vc_bb = document.getElementById("downloadTextProfesores");
        this.downloadSpinner_vc_bb = document.getElementById("downloadSpinnerProfesores");
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
            return false;
        }

        const confirm_vc_bb = await modal_vc_bb.showConfirm_vc_bb(
            "Confirmar carga",
            "¿Estás seguro de importar profesores y (opcional) sus asignaturas?\n\nFormato esperado de columnas: Nombre, Apellido, Correo, Teléfono, Asignaturas.\n\nNota: 'Asignaturas' puede ir separada por coma, punto y coma o '|'."
        );

        if (!confirm_vc_bb) return false;

        this.toggleUploadState_vc_bb(true);

        try {
            const result_vc_bb = await this.excelManager_vc_bb.subir_vc_bb({
                file_vc_bb,
                uploadPath_vc_bb: "/api/profesores/excel/upload",
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
            console.error("❌ Error al subir Excel:", err_vc_bb);
            const message_vc_bb = err_vc_bb.name === 'TypeError' 
                ? "Error de conexión con el servidor"
                : "Error inesperado al procesar el archivo";
                
            await modal_vc_bb.showError_vc_bb("Error de subida", message_vc_bb);
            return false;
        } finally {
            this.toggleUploadState_vc_bb(false);
            this.inputExcel_vc_bb.value = "";
        }
    }

    async downloadExcel_vc_bb() {
        const confirm_vc_bb = await modal_vc_bb.showConfirm_vc_bb(
            "Descargar reporte",
            "¿Deseas descargar el listado actualizado de profesores en formato Excel?"
        );

        if (!confirm_vc_bb) return false;

        this.toggleDownloadState_vc_bb(true);

        try {
            const result_vc_bb = await this.excelManager_vc_bb.descargar_vc_bb({
                downloadPath_vc_bb: "/api/profesores/excel/download",
                fileNamePrefix_vc_bb: "profesores",
            });

            if (result_vc_bb.ok_vc_bb) {
                await modal_vc_bb.showSuccess_vc_bb(
                    "Descarga completada",
                    "El archivo Excel se descargó correctamente."
                );
                return true;
            }

            await modal_vc_bb.showError_vc_bb(
                "Error de descarga",
                result_vc_bb.message_vc_bb || "No se pudo descargar el reporte de profesores."
            );
            return false;
        } catch (err_vc_bb) {
            console.error("❌ Error al descargar Excel:", err_vc_bb);
            await modal_vc_bb.showError_vc_bb(
                "Error de descarga",
                err_vc_bb?.message || "No se pudo descargar el reporte de profesores."
            );
            return false;
        } finally {
            this.toggleDownloadState_vc_bb(false);
        }
    }

    validateFile_vc_bb(file_vc_bb) {
        const isValid_vc_bb = this.excelManager_vc_bb.validateFile_vc_bb(file_vc_bb);
        if (!isValid_vc_bb) {
            const maxMsg_vc_bb = file_vc_bb && file_vc_bb.size > 5 * 1024 * 1024 ? "Máximo 5MB permitido" : null;
            const typeMsg_vc_bb = file_vc_bb && file_vc_bb.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ? "Solo archivos .xlsx permitidos"
                : null;
            const finalMsg_vc_bb = maxMsg_vc_bb || typeMsg_vc_bb || "Archivo inválido";
            modal_vc_bb.showError_vc_bb("Validación de archivo", finalMsg_vc_bb);
        }
        return isValid_vc_bb;
    }

    toggleUploadState_vc_bb(loading_vc_bb) {
        if (this.btnUpload_vc_bb) {
            this.btnUpload_vc_bb.disabled = loading_vc_bb;
            this.uploadSpinner_vc_bb.classList.toggle("hidden", !loading_vc_bb);
            this.uploadText_vc_bb.textContent = loading_vc_bb ? "Subiendo..." : "Subir Archivo";
        }
    }

    toggleDownloadState_vc_bb(loading_vc_bb) {
        if (this.btnDownload_vc_bb) {
            this.btnDownload_vc_bb.disabled = loading_vc_bb;
            this.downloadSpinner_vc_bb.classList.toggle("hidden", !loading_vc_bb);
            this.downloadText_vc_bb.textContent = loading_vc_bb ? "Descargando..." : "Descargar Reporte";
        }
    }

    getCurrentFile_vc_bb() {
        return this.inputExcel_vc_bb?.files[0] || null;
    }
}
