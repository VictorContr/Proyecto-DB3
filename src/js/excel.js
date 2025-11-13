import { modal_vc_bb } from "./modal.js";

export const admin_vc_bb = document.getElementById("admin");

export class ExcelHandler_vc_bb {
    constructor(apiBaseUrl = "http://localhost:3000") {
        this.apiBaseUrl = apiBaseUrl;
        this.inputExcel = document.getElementById("archivoExcel");
        this.btnUpload = document.getElementById("btnUpload");
        this.uploadText = document.getElementById("uploadText");
        this.uploadSpinner = document.getElementById("uploadSpinner");
        this.btnDownload = document.getElementById("btnDownloadReporte");
        this.downloadText = document.getElementById("downloadText");
        this.downloadSpinner = document.getElementById("downloadSpinner");
    }

    async uploadExcel_vc_bb(file) {
        if (!file) {
            await modal_vc_bb.showWarning_vc_bb(
                "Archivo no seleccionado",
                "Por favor, selecciona un archivo Excel antes de subirlo."
            );
            return false;
        }

        if (!this.validateFile_vc_bb(file)) {
            return false;
        }

        const confirm = await modal_vc_bb.showConfirm_vc_bb(
            "Confirmar carga",
            "¿Estás seguro de que deseas importar la lista de profesores? Esto podría sobrescribir registros existentes."
        );

        if (!confirm) return false;

        const formData = new FormData();
        formData.append("archivo", file);

        this.toggleUploadState_vc_bb(true);

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/profesores/excel/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                await modal_vc_bb.showSuccess_vc_bb(
                    "Importación exitosa",
                    data.message || "Los datos se importaron correctamente."
                );
                return true;
            } else {
                await modal_vc_bb.showError_vc_bb(
                    "Error en la importación",
                    data.message || "Ocurrió un error al procesar el archivo."
                );
                return false;
            }
        } catch (err) {
            console.error("❌ Error al subir Excel:", err);
            const message = err.name === 'TypeError' 
                ? "Error de conexión con el servidor"
                : "Error inesperado al procesar el archivo";
                
            await modal_vc_bb.showError_vc_bb("Error de subida", message);
            return false;
        } finally {
            this.toggleUploadState_vc_bb(false);
            this.inputExcel.value = "";
        }
    }

    async downloadExcel_vc_bb() {
        const confirm = await modal_vc_bb.showConfirm_vc_bb(
            "Descargar reporte",
            "¿Deseas descargar el listado actualizado de profesores en formato Excel?"
        );

        if (!confirm) return false;

        this.toggleDownloadState_vc_bb(true);

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/profesores/excel/download`);
            if (!response.ok) throw new Error("Error al generar el Excel");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `profesores_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            await modal_vc_bb.showSuccess_vc_bb(
                "Descarga completada",
                "El archivo Excel se descargó correctamente."
            );
            return true;
        } catch (err) {
            console.error("❌ Error al descargar Excel:", err);
            await modal_vc_bb.showError_vc_bb(
                "Error de descarga",
                "No se pudo descargar el reporte de profesores."
            );
            return false;
        } finally {
            this.toggleDownloadState_vc_bb(false);
        }
    }

    validateFile_vc_bb(file) {
        const maxSize = 5 * 1024 * 1024;
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (file.size > maxSize) {
            modal_vc_bb.showError_vc_bb("Archivo muy grande", "Máximo 5MB permitido");
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            modal_vc_bb.showError_vc_bb("Tipo inválido", "Solo archivos .xlsx permitidos");
            return false;
        }
        
        return true;
    }

    toggleUploadState_vc_bb(loading) {
        if (this.btnUpload) {
            this.btnUpload.disabled = loading;
            this.uploadSpinner.classList.toggle("hidden", !loading);
            this.uploadText.textContent = loading ? "Subiendo..." : "Subir Archivo";
        }
    }

    toggleDownloadState_vc_bb(loading) {
        if (this.btnDownload) {
            this.btnDownload.disabled = loading;
            this.downloadSpinner.classList.toggle("hidden", !loading);
            this.downloadText.textContent = loading ? "Descargando..." : "Descargar Reporte";
        }
    }

    getCurrentFile_vc_bb() {
        return this.inputExcel?.files[0] || null;
    }
}
