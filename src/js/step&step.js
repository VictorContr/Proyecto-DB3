import { modal_vc_bb } from "./modal.js";
import { getApiBaseUrl_vc_bb, ApiGuide_vc_bb } from "./guide.js";

export class StepAndStep_vc_bb {
  constructor() {
    this.sections_vc_bb = Array.from(document.querySelectorAll('section[data-step]'));
    this.current_vc_bb = 0;
    this.progressEl_vc_bb = document.getElementById('wizardProgress');
    this.labelEl_vc_bb = document.getElementById('wizardStepLabel');
    this.prevBtn_vc_bb = document.getElementById('wizardPrev');
    this.nextBtn_vc_bb = document.getElementById('wizardNext');
    this.apiBaseUrl_vc_bb = getApiBaseUrl_vc_bb();
  }

  updateView_vc_bb() {
    if (!this.sections_vc_bb.length) return;
    this.sections_vc_bb.forEach((s_vc_bb, i_vc_bb) => { s_vc_bb.classList.toggle('hidden', i_vc_bb !== this.current_vc_bb); });
    const pct_vc_bb = Math.round(((this.current_vc_bb + 1) / this.sections_vc_bb.length) * 100);
    if (this.progressEl_vc_bb) this.progressEl_vc_bb.style.width = pct_vc_bb + '%';
    if (this.labelEl_vc_bb) this.labelEl_vc_bb.textContent = (this.current_vc_bb + 1) + ' / ' + this.sections_vc_bb.length;
    const lockIcon_vc_bb = this.sections_vc_bb[this.current_vc_bb].querySelector('.lock-btn i');
    const locked_vc_bb = lockIcon_vc_bb ? lockIcon_vc_bb.classList.contains('fa-lock') : false;
    this.sections_vc_bb[this.current_vc_bb].querySelectorAll('input,select,textarea,button:not(.lock-btn):not([id^="btnDownloadReporte"])').forEach(el_vc_bb => { el_vc_bb.disabled = locked_vc_bb; });
  }

  init_vc_bb() {
    if (!this.sections_vc_bb.length) return;
    if (this.prevBtn_vc_bb) this.prevBtn_vc_bb.addEventListener('click', () => { if (this.current_vc_bb > 0) { this.current_vc_bb--; this.updateView_vc_bb(); } });
    if (this.nextBtn_vc_bb) this.nextBtn_vc_bb.addEventListener('click', () => { if (this.current_vc_bb < this.sections_vc_bb.length - 1) { this.current_vc_bb++; this.updateView_vc_bb(); } });

    this.sections_vc_bb.forEach(sec_vc_bb => {
      const btn_vc_bb = sec_vc_bb.querySelector('.lock-btn');
      if (!btn_vc_bb) return;
      btn_vc_bb.addEventListener('click', async () => {
        const icon_vc_bb = btn_vc_bb.querySelector('i');
        if (!icon_vc_bb) return;
        const isLocked_vc_bb = icon_vc_bb.classList.contains('fa-lock');
        const stepIndex_vc_bb = Number(sec_vc_bb.getAttribute('data-step'));
        const tipoCarga_vc_bb = this.mapTipoPorStep_vc_bb(stepIndex_vc_bb);
        if (!tipoCarga_vc_bb) return;
        if (isLocked_vc_bb) {
          try {
            const verify_vc_bb = await ApiGuide_vc_bb.json("GET", `/api/lock/verificar/${tipoCarga_vc_bb}`);
            const data_vc_bb = verify_vc_bb.data;
            if (!verify_vc_bb.ok) {
              await modal_vc_bb.showError_vc_bb('Verificación', data_vc_bb?.mensaje_vc_bb || 'Error al verificar');
              return;
            }
            if (data_vc_bb?.tieneDatos_vc_bb) {
              const confirmed_vc_bb = await modal_vc_bb.showConfirm_vc_bb('Verificación', data_vc_bb?.mensaje_vc_bb || 'Existen datos. ¿Desea continuar y limpiar?');
              if (!confirmed_vc_bb) return;
              const headers_vc_bb = { 'Content-Type': 'application/json' };
              const userId_vc_bb = this.getCurrentUserId_vc_bb();
              if (userId_vc_bb) headers_vc_bb['x-user-id'] = String(userId_vc_bb);
              const rb_vc_bb = await ApiGuide_vc_bb.json("POST", `/api/lock/rollback/${tipoCarga_vc_bb}`, { confirmar: true }, headers_vc_bb);
              const rbData_vc_bb = rb_vc_bb.data;
              if (!rb_vc_bb.ok) {
                await modal_vc_bb.showError_vc_bb('Rollback', rbData_vc_bb?.mensaje_vc_bb || 'Error al ejecutar rollback');
                return;
              }
              await modal_vc_bb.showSuccess_vc_bb('Rollback', rbData_vc_bb?.mensaje_vc_bb || 'Rollback ejecutado');
            } else {
              await modal_vc_bb.showSuccess_vc_bb('Verificación', data_vc_bb?.mensaje_vc_bb || 'No hay datos existentes');
            }
            icon_vc_bb.classList.replace('fa-lock', 'fa-lock-open');
            this.updateView_vc_bb();
          } catch (e_vc_bb) {
            await modal_vc_bb.showError_vc_bb('Error', 'No se pudo contactar al servidor');
          }
        } else {
          icon_vc_bb.classList.replace('fa-lock-open', 'fa-lock');
          this.updateView_vc_bb();
        }
      });
    });

    this.updateView_vc_bb();
  }

  mapTipoPorStep_vc_bb(i_vc_bb) {
    if (i_vc_bb === 0) return 'secciones';
    if (i_vc_bb === 1) return 'espacios';
    if (i_vc_bb === 2) return 'asignaturas';
    if (i_vc_bb === 3) return 'profesores';
    if (i_vc_bb === 4) return 'disponibilidades';
    return null;
  }

  getCurrentUserId_vc_bb() {
    try {
      const v_vc_bb = sessionStorage.getItem('selectedUserId_vc_bb');
      if (!v_vc_bb) return null;
      return JSON.parse(v_vc_bb);
    } catch (_) {
      return null;
    }
  }
}
