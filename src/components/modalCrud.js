export class ModalCrud_vc_bb {
  constructor() {
    this.container = document.getElementById('crudModalContainer');
    this.title = document.getElementById('crudModalTitle');
    this.message = document.getElementById('crudModalMessage');
    this.btnAction = document.getElementById('crudModalAction');
    this.btnCancel = document.getElementById('crudModalCancel');
    this.btnClose = document.getElementById('crudModalClose');
    this._onConfirm = null;
    const close = () => this.close();
    if (this.btnClose) this.btnClose.addEventListener('click', close);
    if (this.btnCancel) this.btnCancel.addEventListener('click', close);
    if (this.container) this.container.addEventListener('click', (e) => { if (e.target === this.container) this.close(); });
    if (this.btnAction) this.btnAction.addEventListener('click', async () => {
      if (this._onConfirm) await this._onConfirm();
    });
  }

  open(title, contentNode) {
    if (this.title) this.title.textContent = title || '';
    if (this.message) {
      this.message.innerHTML = '';
      if (contentNode) this.message.appendChild(contentNode);
    }
    if (this.container) {
      this.container.classList.remove('hidden');
      this.container.classList.add('flex');
    }
  }

  close() {
    if (this.container) {
      this.container.classList.add('hidden');
      this.container.classList.remove('flex');
    }
    if (this.message) this.message.innerHTML = '';
    this._onConfirm = null;
  }

  onConfirm(handler) {
    this._onConfirm = handler;
  }
}