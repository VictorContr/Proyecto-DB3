class ModalDialog_vc_bb {
    constructor() {
        this.modalContainer_vc_bb = document.getElementById('modalContainer');
        this.modalContent_vc_bb = document.getElementById('modalContent');
        this.modalHeader_vc_bb = document.getElementById('modalHeader');
        this.modalIcon_vc_bb = document.getElementById('modalIcon');
        this.modalTitle_vc_bb = document.getElementById('modalTitle');
        this.modalMessage_vc_bb = document.getElementById('modalMessage');
        this.modalClose_vc_bb = document.getElementById('modalClose');
        this.modalAction_vc_bb = document.getElementById('modalAction');
        this.modalCancel_vc_bb = document.getElementById('modalCancel');

        this.resolvePromise = null;
        this.rejectPromise = null;

        this.modalClose_vc_bb.addEventListener('click', () => this.cancel_vc_bb());
        this.modalAction_vc_bb.addEventListener('click', () => this.confirm_vc_bb());
        this.modalCancel_vc_bb.addEventListener('click', () => this.cancel_vc_bb());

        this.modalContainer_vc_bb.addEventListener('click', (e_vc_bb) => {
            if (e_vc_bb.target === this.modalContainer_vc_bb) {
                this.cancel_vc_bb();
            }
        });
    }

    /**
     * Muestra un modal genérico o contextual (como reportes).
     * @param {string} title_vc_bb 
     * @param {string|Array} message_vc_bb 
     * @param {string} type_vc_bb 
     * @param {boolean} isConfirm 
     * @returns {Promise<boolean>}
     */
    show_vc_bb(title_vc_bb, message_vc_bb, type_vc_bb, isConfirm = false) {
        // Tipo de modal
        switch(type_vc_bb) {
            case 'success':
                this.modalHeader_vc_bb.className = 'modal-header success-bg';
                this.modalIcon_vc_bb.className = 'modal-icon fas fa-check-circle';
                this.modalAction_vc_bb.className = 'px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700';
                break;
            case 'error':
                this.modalHeader_vc_bb.className = 'modal-header error';
                this.modalIcon_vc_bb.className = 'modal-icon fas fa-times-circle';
                this.modalAction_vc_bb.className = 'px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700';
                break;
            case 'warning':
                this.modalHeader_vc_bb.className = 'modal-header warning-bg';
                this.modalIcon_vc_bb.className = 'modal-icon fas fa-exclamation-triangle';
                this.modalAction_vc_bb.className = 'px-4 py-2 rounded-lg font-medium text-white bg-yellow-600 hover:bg-yellow-700';
                break;
            case 'reportes':
                this.modalHeader_vc_bb.className = 'modal-header success-bg';
                this.modalIcon_vc_bb.className = 'modal-icon fas fa-file-alt';
                this.modalAction_vc_bb.className = 'px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700';
                break;
        }

        this.modalTitle_vc_bb.textContent = title_vc_bb;

        if (type_vc_bb === 'reportes' && Array.isArray(message_vc_bb)) {
            const html_vc_bb = message_vc_bb.length > 0
                ? message_vc_bb.map(r => `
                    <div class="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <h4 class="font-semibold text-gray-800 dark:text-white mb-1">
                        ${r.tipo === 'reporte_banco' ? 'Reporte Bancario' : 'Reporte Contable'} #${r.id}
                      </h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Fecha: ${new Date(r.fecha).toLocaleDateString('es-ES')}
                      </p>
                      <pre class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
${r.info}
                      </pre>
                    </div>
                  `).join('')
                : `<p class="text-gray-600 dark:text-gray-400">No hay reportes para mostrar.</p>`;
            this.modalMessage_vc_bb.innerHTML = html_vc_bb;
        } else {
            this.modalMessage_vc_bb.textContent = message_vc_bb;
        }

        this.modalAction_vc_bb.textContent = type_vc_bb === 'error' ? 'Reintentar' : 'Aceptar';
        this.modalCancel_vc_bb.style.display = isConfirm ? 'block' : 'none';

        this.modalContainer_vc_bb.classList.add('active');
        document.body.style.overflow = 'hidden';

        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    showConfirm_vc_bb(title_vc_bb, message_vc_bb) {
        return this.show_vc_bb(title_vc_bb, message_vc_bb, 'warning', true);
    }

    showSuccess_vc_bb(title_vc_bb, message_vc_bb) {
        return this.show_vc_bb(title_vc_bb, message_vc_bb, 'success');
    }

    showError_vc_bb(title_vc_bb, message_vc_bb) {
        return this.show_vc_bb(title_vc_bb, message_vc_bb, 'error');
    }

    showWarning_vc_bb(title_vc_bb, message_vc_bb) {
        return this.show_vc_bb(title_vc_bb, message_vc_bb, 'warning');
    }

    /**
     * Modal especializado para reportes: invoca show_vc_bb con tipo 'reportes'.
     * @param {string} titulo 
     * @param {Array} arrayReportes 
     * @returns {Promise<boolean>}
     */
    showReportes_vc_bb(titulo, arrayReportes) {
        return this.show_vc_bb(titulo, arrayReportes, 'reportes');
    }

    confirm_vc_bb() {
        this.hide_vc_bb();
        if (this.resolvePromise) {
            this.resolvePromise(true);
        }
    }

    cancel_vc_bb() {
        this.hide_vc_bb();
        if (this.resolvePromise) {
            this.resolvePromise(false);
        }
    }

    hide_vc_bb() {
        this.modalContainer_vc_bb.classList.remove('active');
        document.body.style.overflow = '';
    }
}

export const modal_vc_bb = new ModalDialog_vc_bb();

