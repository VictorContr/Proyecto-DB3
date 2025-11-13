import { modal_vc_bb } from "./modal.js";

export const admin_vc_bb = document.getElementById("admin")

export class ExcelHandler_vc_bb {
    constructor(apiBaseUrl = "http://localhost:3000") {
        this.apiBaseUrl = apiBaseUrl;

        // Referencias del DOM
        this.formUpload = document.getElementById("formUploadProfesores");
        this.inputExcel = document.getElementById("archivoExcel");
        this.btnUpload = document.getElementById("btnUpload");
        this.uploadText = document.getElementById("uploadText");
        this.uploadSpinner = document.getElementById("uploadSpinner");

        this.btnDownload = document.getElementById("btnDownloadReporte");
        this.downloadText = document.getElementById("downloadText");
        this.downloadSpinner = document.getElementById("downloadSpinner");

        // Inicializa eventos
        this.initListeners_vc_bb();
    }

    /**
     * Enlaza los eventos del formulario y los botones a los métodos de la clase.
     * Ahora los handlers DISPATCHAN eventos personalizados antes de ejecutar la lógica interna.
     * Si algún listener externo previene el evento (e.preventDefault()), la acción interna se cancela.
     */
    initListeners_vc_bb() {
        if (this.formUpload) {
            this.formUpload.addEventListener("submit", async (e) => {
                e.preventDefault();

                // Preparamos el evento con detalle del archivo (si existe)
                const file = this.inputExcel.files[0] || null;
                const uploadEvent = new CustomEvent("excel:upload", {
                    detail: { file },
                    cancelable: true, // permite a listeners externos prevenir la acción interna
                });

                // Dispatch en document para que sea fácil escuchar desde otros módulos
                const proceed = document.dispatchEvent(uploadEvent);

                // Si algún listener llamó a preventDefault(), proceed === false -> no hacemos la subida interna
                if (!proceed) return;

                // Si nadie canceló, ejecutamos la subida interna
                await this.uploadExcel_vc_bb();
            });
        }

        if (this.btnDownload) {
            this.btnDownload.addEventListener("click", async () => {
                console.log("aaaaaa")
                const downloadEvent = new CustomEvent("excel:download", {
                    detail: {},
                    cancelable: true,
                });

                const proceed = document.dispatchEvent(downloadEvent);
                if (!proceed) return;

                await this.downloadExcel_vc_bb();
            });
        }
    }

    /**
     * Permite lanzar programáticamente el evento y la acción interna.
     * Útil para pruebas o integración desde otros módulos.
     */
    dispatchUploadEvent_vc_bb() {
        const file = this.inputExcel.files[0] || null;
        const evt = new CustomEvent("excel:upload", { detail: { file }, cancelable: true });
        return document.dispatchEvent(evt); // devuelve false si se llamó preventDefault()
    }

    dispatchDownloadEvent_vc_bb() {
        const evt = new CustomEvent("excel:download", { detail: {}, cancelable: true });
        return document.dispatchEvent(evt);
    }

    async triggerUpload_vc_bb() {
        const proceed = this.dispatchUploadEvent_vc_bb();
        if (!proceed) return;
        return this.uploadExcel_vc_bb();
    }

    async triggerDownload_vc_bb() {
        const proceed = this.dispatchDownloadEvent_vc_bb();
        if (!proceed) return;
        return this.downloadExcel_vc_bb();
    }

    /**
     * Envía el archivo Excel al backend para importar profesores.
     */
    async uploadExcel_vc_bb() {
        const file = this.inputExcel.files[0];
        if (!file) {
            await modal_vc_bb.showWarning_vc_bb(
                "Archivo no seleccionado",
                "Por favor, selecciona un archivo Excel antes de subirlo."
            );
            return;
        }

        const confirm = await modal_vc_bb.showConfirm_vc_bb(
            "Confirmar carga",
            "¿Estás seguro de que deseas importar la lista de profesores? Esto podría sobrescribir registros existentes."
        );

        if (!confirm) return;

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
            } else {
                await modal_vc_bb.showError_vc_bb(
                    "Error en la importación",
                    data.message || "Ocurrió un error al procesar el archivo."
                );
            }
        } catch (err) {
            console.error("❌ Error al subir Excel:", err);
            await modal_vc_bb.showError_vc_bb(
                "Error de conexión",
                "No se pudo conectar con el servidor para subir el archivo."
            );
        } finally {
            this.toggleUploadState_vc_bb(false);
            this.inputExcel.value = "";
        }
    }

    /**
     * Descarga el Excel actualizado con los datos actuales de la tabla profesores.
     */
    async downloadExcel_vc_bb() {
        const confirm = await modal_vc_bb.showConfirm_vc_bb(
            "Descargar reporte",
            "¿Deseas descargar el listado actualizado de profesores en formato Excel?"
        );

        if (!confirm) return;

        this.toggleDownloadState_vc_bb(true);

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/profesores/excel/download`);
            if (!response.ok) throw new Error("Error al generar el Excel");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "profesores.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            await modal_vc_bb.showSuccess_vc_bb(
                "Descarga completada",
                "El archivo Excel se descargó correctamente."
            );
        } catch (err) {
            console.error("❌ Error al descargar Excel:", err);
            await modal_vc_bb.showError_vc_bb(
                "Error de descarga",
                "No se pudo descargar el reporte de profesores."
            );
        } finally {
            this.toggleDownloadState_vc_bb(false);
        }
    }

    // 🔄 Helpers visuales para los botones

    toggleUploadState_vc_bb(loading) {
        this.btnUpload.disabled = loading;
        this.uploadSpinner.classList.toggle("hidden", !loading);
        this.uploadText.textContent = loading ? "Subiendo..." : "Subir Archivo";
    }

    toggleDownloadState_vc_bb(loading) {
        this.btnDownload.disabled = loading;
        this.downloadSpinner.classList.toggle("hidden", !loading);
        this.downloadText.textContent = loading ? "Descargando..." : "Descargar Reporte";
    }
}

