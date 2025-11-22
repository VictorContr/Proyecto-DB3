export class ModalCrud_vc_bb {
  constructor() {
    this.container_vc_bb = document.getElementById('crudModalContainer');
    this.title_vc_bb = document.getElementById('crudModalTitle');
    this.message_vc_bb = document.getElementById('crudModalMessage');
    this.btnAction_vc_bb = document.getElementById('crudModalAction');
    this.btnCancel_vc_bb = document.getElementById('crudModalCancel');
    this.btnClose_vc_bb = document.getElementById('crudModalClose');
    this._onConfirm_vc_bb = null;
    const close_vc_bb = () => this.close_vc_bb();
    if (this.btnClose_vc_bb) this.btnClose_vc_bb.addEventListener('click', close_vc_bb);
    if (this.btnCancel_vc_bb) this.btnCancel_vc_bb.addEventListener('click', close_vc_bb);
    if (this.container_vc_bb) this.container_vc_bb.addEventListener('click', (e_vc_bb) => { if (e_vc_bb.target === this.container_vc_bb) this.close_vc_bb(); });
    if (this.btnAction_vc_bb) this.btnAction_vc_bb.addEventListener('click', async () => {
      if (this._onConfirm_vc_bb) await this._onConfirm_vc_bb();
    });
  }

  open_vc_bb(title_vc_bb, contentNode_vc_bb) {
    if (this.title_vc_bb) this.title_vc_bb.textContent = title_vc_bb || '';
    if (this.message_vc_bb) {
      this.message_vc_bb.innerHTML = '';
      if (contentNode_vc_bb) this.message_vc_bb.appendChild(contentNode_vc_bb);
    }
    if (this.container_vc_bb) {
      this.container_vc_bb.classList.remove('hidden');
      this.container_vc_bb.classList.add('flex');
    }
  }

  close_vc_bb() {
    if (this.container_vc_bb) {
      this.container_vc_bb.classList.add('hidden');
      this.container_vc_bb.classList.remove('flex');
    }
    if (this.message_vc_bb) this.message_vc_bb.innerHTML = '';
    this._onConfirm_vc_bb = null;
  }

  onConfirm_vc_bb(handler_vc_bb) {
    this._onConfirm_vc_bb = handler_vc_bb;
  }
}
