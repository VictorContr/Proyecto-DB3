import { modal_vc_bb } from "./modal.js";

export const admin_vc_bb = document.getElementById("admin");

export class ExcelHandler_vc_bb {
    constructor(apiBaseUrl_vc_bb = "http://localhost:3000") {
        this.apiBaseUrl_vc_bb = apiBaseUrl_vc_bb;
        this.inputExcel_vc_bb = document.getElementById("archivoExcel");
        this.btnUpload_vc_bb = document.getElementById("btnUpload");
        this.uploadText_vc_bb = document.getElementById("uploadText");
        this.uploadSpinner_vc_bb = document.getElementById("uploadSpinner");
        this.btnDownload_vc_bb = document.getElementById("btnDownloadReporte");
        this.downloadText_vc_bb = document.getElementById("downloadText");
        this.downloadSpinner_vc_bb = document.getElementById("downloadSpinner");
    }

    async uploadExcel_vc_bb(file_vc_bb) {
        if (!file_vc_bb) {
            await modal_vc_bb.showWarning_vc_bb(
                "Archivo no seleccionado",
                "Por favor, selecciona un archivo Excel antes de subirlo."
            );
            return false;
        }

        if (!this.validateFile_vc_bb(file_vc_bb)) {
            return false;
        }

        const confirm_vc_bb = await modal_vc_bb.showConfirm_vc_bb(
            "Confirmar carga",
            "¿Estás seguro de que deseas importar la lista de profesores? Esto podría sobrescribir registros existentes."
        );

        if (!confirm_vc_bb) return false;

        const formData_vc_bb = new FormData();
        formData_vc_bb.append("archivo", file_vc_bb);

        this.toggleUploadState_vc_bb(true);

        try {
            const response_vc_bb = await fetch(`${this.apiBaseUrl_vc_bb}/api/profesores/excel/upload`, {
                method: "POST",
                body: formData_vc_bb,
            });

            let data_vc_bb = {};
            try {
                data_vc_bb = await response_vc_bb.json();
            } catch (_) {
                data_vc_bb = {};
            }

            if (response_vc_bb.ok && data_vc_bb.exito) {
                const successMsg_vc_bb = data_vc_bb.message || "Los datos se importaron correctamente.";
                await modal_vc_bb.showSuccess_vc_bb("Importación exitosa", successMsg_vc_bb);

                if (Array.isArray(data_vc_bb.errors) && data_vc_bb.errors.length) {
                    const previewErrors_vc_bb = data_vc_bb.errors.slice(0, 10).join("\n");
                    await modal_vc_bb.showWarning_vc_bb(
                        "Observaciones",
                        `Se registraron ${data_vc_bb.errors.length} avisos.\n\n${previewErrors_vc_bb}`
                    );
                }
                return true;
            }

            const baseError_vc_bb = data_vc_bb.message
                || (response_vc_bb.status === 400 ? "Solicitud inválida." : "Ocurrió un error al procesar el archivo.");

            if (Array.isArray(data_vc_bb.errors) && data_vc_bb.errors.length) {
                const previewErrors_vc_bb = data_vc_bb.errors.slice(0, 10).join("\n");
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
            const response_vc_bb = await fetch(`${this.apiBaseUrl_vc_bb}/api/profesores/excel/download`);
            if (!response_vc_bb.ok) {
                let jsonError_vc_bb = null;
                try { jsonError_vc_bb = await response_vc_bb.json(); } catch (_) {}
                const msg_vc_bb = jsonError_vc_bb?.message || "Error al generar el Excel";
                throw new Error(msg_vc_bb);
            }

            const blob_vc_bb = await response_vc_bb.blob();
            const url_vc_bb = window.URL.createObjectURL(blob_vc_bb);

            const a_vc_bb = document.createElement("a");
            a_vc_bb.href = url_vc_bb;
            a_vc_bb.download = `profesores_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a_vc_bb);
            a_vc_bb.click();
            a_vc_bb.remove();
            window.URL.revokeObjectURL(url_vc_bb);

            await modal_vc_bb.showSuccess_vc_bb(
                "Descarga completada",
                "El archivo Excel se descargó correctamente."
            );
            return true;
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
        const maxSize_vc_bb = 5 * 1024 * 1024;
        const allowedTypes_vc_bb = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (file_vc_bb.size > maxSize_vc_bb) {
            modal_vc_bb.showError_vc_bb("Archivo muy grande", "Máximo 5MB permitido");
            return false;
        }
        
        if (!allowedTypes_vc_bb.includes(file_vc_bb.type)) {
            modal_vc_bb.showError_vc_bb("Tipo inválido", "Solo archivos .xlsx permitidos");
            return false;
        }
        
        return true;
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
