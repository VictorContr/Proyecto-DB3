export class StepAndStep_vc_bb {
  constructor() {
    this.sections_vc_bb = Array.from(document.querySelectorAll('section[data-step]'));
    this.current_vc_bb = 0;
    this.progressEl_vc_bb = document.getElementById('wizardProgress');
    this.labelEl_vc_bb = document.getElementById('wizardStepLabel');
    this.prevBtn_vc_bb = document.getElementById('wizardPrev');
    this.nextBtn_vc_bb = document.getElementById('wizardNext');
  }

  updateView_vc_bb() {
    if (!this.sections_vc_bb.length) return;
    this.sections_vc_bb.forEach((s_vc_bb, i_vc_bb) => { s_vc_bb.classList.toggle('hidden', i_vc_bb !== this.current_vc_bb); });
    const pct_vc_bb = Math.round(((this.current_vc_bb + 1) / this.sections_vc_bb.length) * 100);
    if (this.progressEl_vc_bb) this.progressEl_vc_bb.style.width = pct_vc_bb + '%';
    if (this.labelEl_vc_bb) this.labelEl_vc_bb.textContent = (this.current_vc_bb + 1) + ' / ' + this.sections_vc_bb.length;
    const lockIcon_vc_bb = this.sections_vc_bb[this.current_vc_bb].querySelector('.lock-btn i');
    const locked_vc_bb = lockIcon_vc_bb ? lockIcon_vc_bb.classList.contains('fa-lock') : false;
    this.sections_vc_bb[this.current_vc_bb].querySelectorAll('input,button[type=submit]').forEach(el_vc_bb => { el_vc_bb.disabled = locked_vc_bb; });
  }

  init_vc_bb() {
    if (!this.sections_vc_bb.length) return;
    if (this.prevBtn_vc_bb) this.prevBtn_vc_bb.addEventListener('click', () => { if (this.current_vc_bb > 0) { this.current_vc_bb--; this.updateView_vc_bb(); } });
    if (this.nextBtn_vc_bb) this.nextBtn_vc_bb.addEventListener('click', () => { if (this.current_vc_bb < this.sections_vc_bb.length - 1) { this.current_vc_bb++; this.updateView_vc_bb(); } });

    this.sections_vc_bb.forEach(sec_vc_bb => {
      const btn_vc_bb = sec_vc_bb.querySelector('.lock-btn');
      if (!btn_vc_bb) return;
      btn_vc_bb.addEventListener('click', () => {
        const icon_vc_bb = btn_vc_bb.querySelector('i');
        if (!icon_vc_bb) return;
        if (icon_vc_bb.classList.contains('fa-lock')) { icon_vc_bb.classList.replace('fa-lock', 'fa-lock-open'); }
        else { icon_vc_bb.classList.replace('fa-lock-open', 'fa-lock'); }
        this.updateView_vc_bb();
      });
    });

    this.updateView_vc_bb();
  }
}
