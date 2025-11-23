export const initStepAndStep_vc_bb = () => {
  const sections_vc_bb = Array.from(document.querySelectorAll('section[data-step]'));
  if (!sections_vc_bb.length) return;
  let current_vc_bb = 0;
  const progressEl_vc_bb = document.getElementById('wizardProgress');
  const labelEl_vc_bb = document.getElementById('wizardStepLabel');
  const prevBtn_vc_bb = document.getElementById('wizardPrev');
  const nextBtn_vc_bb = document.getElementById('wizardNext');

  const updateView_vc_bb = () => {
    sections_vc_bb.forEach((s_vc_bb, i_vc_bb) => { s_vc_bb.classList.toggle('hidden', i_vc_bb !== current_vc_bb); });
    const pct_vc_bb = Math.round(((current_vc_bb + 1) / sections_vc_bb.length) * 100);
    if (progressEl_vc_bb) progressEl_vc_bb.style.width = pct_vc_bb + '%';
    if (labelEl_vc_bb) labelEl_vc_bb.textContent = (current_vc_bb + 1) + ' / ' + sections_vc_bb.length;
    const lockIcon_vc_bb = sections_vc_bb[current_vc_bb].querySelector('.lock-btn i');
    const locked_vc_bb = lockIcon_vc_bb ? lockIcon_vc_bb.classList.contains('fa-lock') : false;
    sections_vc_bb[current_vc_bb].querySelectorAll('input,button[type=submit]').forEach(el_vc_bb => { el_vc_bb.disabled = locked_vc_bb; });
  };

  if (prevBtn_vc_bb) prevBtn_vc_bb.addEventListener('click', () => { if (current_vc_bb > 0) { current_vc_bb--; updateView_vc_bb(); } });
  if (nextBtn_vc_bb) nextBtn_vc_bb.addEventListener('click', () => { if (current_vc_bb < sections_vc_bb.length - 1) { current_vc_bb++; updateView_vc_bb(); } });

  sections_vc_bb.forEach(sec_vc_bb => {
    const btn_vc_bb = sec_vc_bb.querySelector('.lock-btn');
    if (!btn_vc_bb) return;
    btn_vc_bb.addEventListener('click', () => {
      const icon_vc_bb = btn_vc_bb.querySelector('i');
      if (!icon_vc_bb) return;
      if (icon_vc_bb.classList.contains('fa-lock')) { icon_vc_bb.classList.replace('fa-lock', 'fa-lock-open'); }
      else { icon_vc_bb.classList.replace('fa-lock-open', 'fa-lock'); }
      updateView_vc_bb();
    });
  });

  updateView_vc_bb();
};
