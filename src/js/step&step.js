export const initStepAndStep_vc_bb = () => {
  const sections = Array.from(document.querySelectorAll('section[data-step]'));
  if (!sections.length) return;
  let current = 0;
  const progressEl = document.getElementById('wizardProgress');
  const labelEl = document.getElementById('wizardStepLabel');
  const prevBtn = document.getElementById('wizardPrev');
  const nextBtn = document.getElementById('wizardNext');

  const updateView = () => {
    sections.forEach((s, i) => { s.classList.toggle('hidden', i !== current); });
    const pct = Math.round(((current + 1) / sections.length) * 100);
    if (progressEl) progressEl.style.width = pct + '%';
    if (labelEl) labelEl.textContent = (current + 1) + ' / ' + sections.length;
    const lockIcon = sections[current].querySelector('.lock-btn i');
    const locked = lockIcon ? lockIcon.classList.contains('fa-lock') : false;
    sections[current].querySelectorAll('input,button[type=submit]').forEach(el => { el.disabled = locked; });
  };

  if (prevBtn) prevBtn.addEventListener('click', () => { if (current > 0) { current--; updateView(); } });
  if (nextBtn) nextBtn.addEventListener('click', () => { if (current < sections.length - 1) { current++; updateView(); } });

  sections.forEach(sec => {
    const btn = sec.querySelector('.lock-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('i');
      if (!icon) return;
      if (icon.classList.contains('fa-lock')) { icon.classList.replace('fa-lock', 'fa-lock-open'); }
      else { icon.classList.replace('fa-lock-open', 'fa-lock'); }
      updateView();
    });
  });

  updateView();
};
