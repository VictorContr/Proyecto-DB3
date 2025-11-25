import { ModalCrud_vc_bb } from "./modalCrud.js";
import { ApiGuide_vc_bb } from "../js/guide.js";

class CrudTable_vc_bb extends HTMLElement {
  constructor() {
    super();
    this.shadow_vc_bb = this.attachShadow({ mode: "open" });
    this.apiBase_vc_bb = null;
    this.modalCrud_vc_bb = new ModalCrud_vc_bb();
    this.data_vc_bb = [];
    this.filterField_vc_bb = null;
    this.filterValue_vc_bb = "";
    this.sortField_vc_bb = null;
    this.sortDir_vc_bb = "asc";

    this.shadow_vc_bb.innerHTML = `
    <link rel="stylesheet" href="../public/css/tailwind.css">
      <div class="p-6  dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
        <h2 id="title_vc_bb" class="text-2xl font-bold mb-4 text-white"></h2>
        <div id="tableTools_vc_bb" class="mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-4 flex flex-wrap gap-4 items-end">
          <div class="flex flex-col gap-2 w-full sm:w-56">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-200">Campo</label>
            <select id="fieldSelect_vc_bb" class="border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300"></select>
          </div>
          <div class="flex flex-col gap-2 w-full sm:w-64">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-200">Valor</label>
            <input id="filterInput_vc_bb" type="text" class="border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300" placeholder="Filtrar por campo">
          </div>
          <div class="flex items-center gap-2">
            <button id="clearFilters_vc_bb" class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded">Limpiar</button>
          </div>
        </div>
        <div id="formWrap_vc_bb" class="mb-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-4">
          <form id="form_vc_bb" class="mb-6 flex flex-wrap gap-4"></form>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse table-fixed text-gray-800 dark:text-gray-200">
            <thead class="bg-gray-100 dark:bg-gray-700" id="thead_vc_bb"></thead>
            <tbody id="tbody_vc_bb"></tbody>
          </table>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.init_vc_bb();
  }

  observeTheme_vc_bb() {
    const apply = () => {
      const isDark = document.documentElement.classList.contains('dark');
      this.shadow_vc_bb.host.setAttribute('data-theme', isDark ? 'dark' : 'light');
      const rootBox = this.shadow_vc_bb.querySelector('div');
      if (rootBox) rootBox.classList.toggle('dark', isDark);

      const modalMessage = document.getElementById('crudModalMessage');
      if (modalMessage) {
        // Ajustar colores de labels e inputs dentro del modal para buen contraste
        modalMessage.querySelectorAll('label').forEach(l => {
          l.classList.remove('text-gray-600', 'text-gray-200', 'text-gray-400', 'text-white', 'text-gray-800');
          l.classList.add(isDark ? 'text-gray-200' : 'text-gray-600');
        });
        modalMessage.querySelectorAll('input, select, textarea').forEach(el => {
          // Limpiar clases de color/placeholder/borde para re-aplicar de forma consistente
          el.classList.remove(
            'text-gray-600','text-gray-200','text-gray-400','text-white','text-gray-800',
            'bg-white','bg-gray-700','border-gray-300','border-gray-600',
            'placeholder-gray-500','placeholder-gray-300'
          );
          if (isDark) {
            el.classList.add('bg-gray-700','text-white','border-gray-600','placeholder-gray-300');
          } else {
            el.classList.add('bg-white','text-gray-800','border-gray-300','placeholder-gray-500');
          }
        });
      }
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  async init_vc_bb() {
    await ApiGuide_vc_bb.initialize();
    const params = new URLSearchParams(location.search);
    const qTable = params.get('table');
    const qSub = params.get('subTable');
    if (qTable) {
      this.table_vc_bb = qTable;
      this.subTable_vc_bb = qSub || null;
    } else {
      const parts = location.pathname.split('/').filter(Boolean);
      if (parts.length >= 3 && parts[0] === 'admin') {
        this.table_vc_bb = parts[1];
        this.subTable_vc_bb = parts[2];
      } else if (parts.length >= 2 && parts[0] === 'admin') {
        this.table_vc_bb = parts[1];
        this.subTable_vc_bb = null;
      } else {
        this.table_vc_bb = null;
        this.subTable_vc_bb = null;
      }
    }
    if (!this.table_vc_bb) {
      this.shadow_vc_bb.getElementById("title_vc_bb").innerText = "Error: tabla no definida.";
      return;
    }
    this.shadow_vc_bb.getElementById("title_vc_bb").innerText = `Administrar ${this.table_vc_bb}`;
    this.observeTheme_vc_bb();
    await this.loadData_vc_bb();
  }

  async loadData_vc_bb() {
    try {
      let path_vc_bb = `/api/${this.table_vc_bb}`;
      if (this.subTable_vc_bb) path_vc_bb = `${path_vc_bb}/${this.subTable_vc_bb}`;
      const res = await ApiGuide_vc_bb.json("GET", path_vc_bb);
      let data = res.ok ? (res.data || []) : [];

      // Enriquecer filas con nombre de tipo de espacio para mostrar en tabla
      if (Array.isArray(data) && (this.table_vc_bb === 'espacios' || this.table_vc_bb === 'asignaturas')) {
        try {
          const tiposRes = await ApiGuide_vc_bb.json('GET', '/api/espacios/tipos');
          const tipos = tiposRes.ok ? (tiposRes.data || []) : [];
          const mapTipos = {};
          tipos.forEach(t => { mapTipos[String(t.ID_TipoEspacio_bb_vc)] = t.tipo_bb_vc; });
          data = data.map(row => {
            const newRow = { ...row };
            if (this.table_vc_bb === 'espacios') {
              const idTipo = row.ID_TipoEspacio_espacio_bb_vc ?? row.id_tipoespacio_espacio_bb_vc ?? null;
              if (idTipo != null && mapTipos[String(idTipo)]) {
                newRow.tipo_espacio_bb_vc = mapTipos[String(idTipo)];
              }
            } else if (this.table_vc_bb === 'asignaturas') {
              const idTipoReq = row.ID_TipoEspacio_requerido_bb_vc ?? row.id_tipoespacio_requerido_bb_vc ?? null;
              if (idTipoReq != null && mapTipos[String(idTipoReq)]) {
                newRow.tipo_espacio_requerido_bb_vc = mapTipos[String(idTipoReq)];
              }
            }
            return newRow;
          });
        } catch (_) { /* ignore */ }
      }
      this.data_vc_bb = Array.isArray(data) ? data : [];
      await this.renderTable_vc_bb(this.data_vc_bb);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  }

  getCurrentUserId_vc_bb() {
    try {
      const v = sessionStorage.getItem('selectedUserId_vc_bb');
      if (!v) return null;
      return JSON.parse(v);
    } catch (e) {
      return null;
    }
  }

  async renderTable_vc_bb (data) {
    const thead_vc_bb = this.shadow_vc_bb.getElementById("thead_vc_bb");
    const tbody_vc_bb = this.shadow_vc_bb.getElementById("tbody_vc_bb");
    const tools_vc_bb = this.shadow_vc_bb.getElementById("tableTools_vc_bb");
    const fieldSelect_vc_bb = this.shadow_vc_bb.getElementById("fieldSelect_vc_bb");
    const filterInput_vc_bb = this.shadow_vc_bb.getElementById("filterInput_vc_bb");
    const clearFilters_vc_bb = this.shadow_vc_bb.getElementById("clearFilters_vc_bb");

    if (!Array.isArray(data) || data.length === 0) {
      // Si no hay datos, intentar obtener el esquema de la tabla para mostrar el formulario de creación
      try {
        const schemaRes = await ApiGuide_vc_bb.json('GET', `/api/schema/${this.table_vc_bb}`);
        if (schemaRes.ok) {
          const schema = schemaRes.data || {};
          const colsFromSchema = schema.columns || [];
          // Mostrar encabezados basados en schema (omitiendo id)
          const visibleColsFromSchema = colsFromSchema.filter(c => !/^id/i.test(c));
          thead.innerHTML = `\n      <tr>\n        ${visibleColsFromSchema.map(col => `<th class=\"border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200\">${this.prettyLabel_vc_bb(col)}</th>`).join("")}\n        <th class=\"border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200\">Acciones</th>\n      </tr>\n    `;
          // Renderizar formulario de creación usando columnas del schema
          await this.renderForm_vc_bb(colsFromSchema);
          tbody.innerHTML = "";
          return;
        }
      } catch (errSchema) {
        console.warn('No se pudo obtener schema:', errSchema);
      }

      thead_vc_bb.innerHTML = "<tr><th class='p-2 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'>No hay datos</th></tr>";
      tbody_vc_bb.innerHTML = "";
      return;
    }

    const cols = Object.keys(data[0]);
    let visibleCols = cols.filter(c => !/^id/i.test(c));
    if (this.table_vc_bb === 'espacios') {
      // Evitar columnas duplicadas de tipo de espacio: mostrar solo una
      visibleCols = visibleCols.filter(c => c.toLowerCase() !== 'tipoespacio_bb_vc');
    }
    if (this.table_vc_bb === 'asignaturas') {
      // Mantener solo "Espacio requerido" y ocultar alias duplicado
      visibleCols = visibleCols.filter(c => c.toLowerCase() !== 'tipoespacio_bb_vc');
    }

    if (tools_vc_bb && fieldSelect_vc_bb) {
      const currentField_vc_bb = this.filterField_vc_bb;
      fieldSelect_vc_bb.innerHTML = "";
      const emptyOpt_vc_bb = document.createElement('option');
      emptyOpt_vc_bb.value = "";
      emptyOpt_vc_bb.textContent = "Todos";
      fieldSelect_vc_bb.appendChild(emptyOpt_vc_bb);
      visibleCols.forEach(c => {
        const opt_vc_bb = document.createElement('option');
        opt_vc_bb.value = c;
        opt_vc_bb.textContent = this.prettyLabel_vc_bb(c);
        fieldSelect_vc_bb.appendChild(opt_vc_bb);
      });
      if (currentField_vc_bb) fieldSelect_vc_bb.value = currentField_vc_bb;
      if (filterInput_vc_bb) filterInput_vc_bb.value = this.filterValue_vc_bb || "";
      if (fieldSelect_vc_bb) fieldSelect_vc_bb.onchange = () => { this.filterField_vc_bb = fieldSelect_vc_bb.value || null; this.renderTable_vc_bb(this.data_vc_bb); };
      if (filterInput_vc_bb) filterInput_vc_bb.oninput = () => { this.filterValue_vc_bb = filterInput_vc_bb.value || ""; this.renderTable_vc_bb(this.data_vc_bb); };
      if (clearFilters_vc_bb) clearFilters_vc_bb.onclick = () => { this.filterField_vc_bb = null; this.filterValue_vc_bb = ""; if (fieldSelect_vc_bb) fieldSelect_vc_bb.value = ""; if (filterInput_vc_bb) filterInput_vc_bb.value = ""; this.renderTable_vc_bb(this.data_vc_bb); };
    }

    if (visibleCols.length === 0) {
      thead_vc_bb.innerHTML = "<tr><th class='p-2 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'>No hay campos para mostrar</th></tr>";
      tbody_vc_bb.innerHTML = "";
      return;
    }

    thead_vc_bb.innerHTML = `
      <tr>
        ${visibleCols.map(col => `<th class="border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer select-none">${this.prettyLabel_vc_bb(col)}${this.sortField_vc_bb === col ? (this.sortDir_vc_bb === 'asc' ? ' ▲' : ' ▼') : ''}</th>`).join("")}
        <th class="border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Acciones</th>
      </tr>
    `;

    await this.renderForm_vc_bb(cols);
    tbody_vc_bb.innerHTML = "";

    const processed_vc_bb = this.applyFiltersAndSort_vc_bb(data, visibleCols);
    processed_vc_bb.forEach(row_vc_bb => {
      const tr = document.createElement("tr");
      tr.className = 'group';
      visibleCols.forEach(col => {
        const td = document.createElement("td");
        td.className = "border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm align-top truncate transition-all group-hover:py-4 text-gray-700 dark:text-gray-300";
        td.title = row_vc_bb[col] != null ? String(row_vc_bb[col]) : "";
        td.textContent = row_vc_bb[col] != null ? String(row_vc_bb[col]) : "";
        tr.appendChild(td);
      });

      const tdActions = document.createElement("td");
      tdActions.className = "border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm whitespace-nowrap";

      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'flex flex-col gap-2 items-end';

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Editar";
      btnEdit.className = "bg-colegio-blue hover:bg-colegio-darkblue text-white px-3 py-1 rounded min-w-[64px] whitespace-nowrap flex-shrink-0 transition-colors duration-200";
      const pkId_vc_bb = this.findIdValue_vc_bb(row_vc_bb);
      btnEdit.dataset.id = pkId_vc_bb;

      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Eliminar";
      btnDelete.className = "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded min-w-[64px] whitespace-nowrap flex-shrink-0 transition-colors duration-200";
      btnDelete.dataset.id = pkId_vc_bb;

      // Deshabilitar eliminar solo cuando estemos en la tabla `usuarios`
      const currentUserId = this.getCurrentUserId_vc_bb();
      if (this.table_vc_bb === 'usuarios' && currentUserId && String(currentUserId) === String(pkId_vc_bb)) {
        btnDelete.disabled = true;
        btnDelete.classList.add('opacity-50', 'cursor-not-allowed');
        btnDelete.title = 'No puede eliminar el usuario en sesión';
      } else {
        btnDelete.addEventListener("click", async () => {
          const userId = this.getCurrentUserId_vc_bb();
          const headers = {};
          if (userId) headers['x-user-id'] = String(userId);
          // support subTable (e.g. /api/disponibilidad/profesor/:id)
          let deletePath_vc_bb = `/api/${this.table_vc_bb}`;
          if (this.subTable_vc_bb) deletePath_vc_bb += `/${this.subTable_vc_bb}`;
          deletePath_vc_bb += `/${pkId_vc_bb}`;
          await ApiGuide_vc_bb.request('DELETE', deletePath_vc_bb, { headers });
          this.loadData_vc_bb();
        });
      }

      btnEdit.addEventListener("click", () => {
        row_vc_bb._pk_vc_bb = pkId_vc_bb;
        this.openEditModal_vc_bb(row_vc_bb);
      });

      actionsWrap.appendChild(btnEdit);
      actionsWrap.appendChild(btnDelete);
      tdActions.appendChild(actionsWrap);
      tr.appendChild(tdActions);
      tbody_vc_bb.appendChild(tr);
    });

    const headerCells_vc_bb = Array.from(thead_vc_bb.querySelectorAll('th'));
    headerCells_vc_bb.slice(0, visibleCols.length).forEach((th_vc_bb, idx_vc_bb) => {
      th_vc_bb.onclick = () => {
        const col_vc_bb = visibleCols[idx_vc_bb];
        if (this.sortField_vc_bb === col_vc_bb) {
          this.sortDir_vc_bb = this.sortDir_vc_bb === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortField_vc_bb = col_vc_bb;
          this.sortDir_vc_bb = 'asc';
        }
        this.renderTable_vc_bb(this.data_vc_bb);
      };
    });
  }

  applyFiltersAndSort_vc_bb(data, visibleCols) {
    let arr_vc_bb = Array.isArray(data) ? data.slice() : [];
    const fField_vc_bb = this.filterField_vc_bb;
    const fValue_vc_bb = (this.filterValue_vc_bb || '').toLowerCase();
    if (fValue_vc_bb) {
      if (fField_vc_bb) {
        arr_vc_bb = arr_vc_bb.filter(r => {
          const v = r[fField_vc_bb];
          return v != null && String(v).toLowerCase().includes(fValue_vc_bb);
        });
      } else {
        arr_vc_bb = arr_vc_bb.filter(r => visibleCols.some(c => {
          const v = r[c];
          return v != null && String(v).toLowerCase().includes(fValue_vc_bb);
        }));
      }
    }
    if (this.sortField_vc_bb) {
      const sField_vc_bb = this.sortField_vc_bb;
      const dir_vc_bb = this.sortDir_vc_bb === 'desc' ? -1 : 1;
      arr_vc_bb.sort((a, b) => {
        const va = a[sField_vc_bb];
        const vb = b[sField_vc_bb];
        const at = va == null ? '' : String(va);
        const bt = vb == null ? '' : String(vb);
        const an = Number(at);
        const bn = Number(bt);
        const bothNum = !isNaN(an) && !isNaN(bn);
        if (bothNum) return (an - bn) * dir_vc_bb;
        return at.localeCompare(bt, undefined, { sensitivity: 'base' }) * dir_vc_bb;
      });
    }
    return arr_vc_bb;
  }

  async renderForm_vc_bb(cols) {
    const form = this.shadow_vc_bb.getElementById("form_vc_bb");
    form.innerHTML = "";
    // Clear any previous submit handler to avoid duplicates
    try { form.onsubmit = null; } catch (e) { /* ignore */ }
    // Special cases: disponibilidad/profesor and disponibilidad/espacio
    if (this.table_vc_bb === 'disponibilidad' && this.subTable_vc_bb === 'profesor') {
      // Construir formulario con selects para dia, bloque y profesor
        const wrapperFor = (labelText, el) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex flex-col gap-2 w-full sm:w-auto';
          const label = document.createElement('label');
          label.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
          label.textContent = labelText;
          wrapper.appendChild(label);
          wrapper.appendChild(el);
          return wrapper;
        };

        // Dia select
        let selectDia = document.createElement('select');
        selectDia.name = 'ID_dia_DispProfesor_bb_vc';
        selectDia.className = 'border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300';
        try {
          const r = await ApiGuide_vc_bb.json('GET', '/api/dias');
          if (r.ok) {
            const rows = r.data || [];
            rows.forEach(rw => {
              const opt = document.createElement('option');
              opt.value = rw.ID_dia_bb_vc ?? rw.id ?? Object.values(rw)[0];
              opt.textContent = rw.dia_bb_vc ?? rw.nombre ?? Object.values(rw)[1] ?? opt.value;
              selectDia.appendChild(opt);
            });
          }
        } catch (e) { console.warn('No se pudo cargar /api/dias', e); }
        form.appendChild(wrapperFor('Día', selectDia));

        // Bloque select
        let selectBloque = document.createElement('select');
        selectBloque.name = 'ID_bloque_DispProfesor_bb_vc';
        selectBloque.className = 'border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300';
        try {
          const r2 = await ApiGuide_vc_bb.json('GET', '/api/bloques');
          if (r2.ok) {
            const rows = r2.data || [];
            rows.forEach(rw => {
              const opt = document.createElement('option');
              opt.value = rw.ID_bloque_bb_vc ?? rw.id ?? Object.values(rw)[0];
              opt.textContent = rw.hora_bloque_bb_vc ?? rw.hora ?? Object.values(rw)[1] ?? opt.value;
              selectBloque.appendChild(opt);
            });
          }
        } catch (e) { console.warn('No se pudo cargar /api/bloques', e); }
        form.appendChild(wrapperFor('Bloque', selectBloque));

        // Profesor select
        let selectProfesor = document.createElement('select');
        selectProfesor.name = 'ID_profesor_DispProfesor_bb_vc';
        selectProfesor.className = 'border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300';
        try {
          const rp = await ApiGuide_vc_bb.json('GET', '/api/profesores');
          if (rp.ok) {
            const rows = rp.data || [];
            rows.forEach(rw => {
              const opt = document.createElement('option');
              // intentar usar nombre+apellido o userName
              const nombre = (rw.nombre_bb_vc || rw.nombre || rw.firstName || rw.nombre_profesor || '');
              const apellido = (rw.apellido_bb_vc || rw.apellido || rw.lastName || '');
              opt.value = rw.ID_profesor_bb_vc ?? rw.id ?? rw.ID_usuario_bb_vc ?? Object.values(rw)[0];
              opt.textContent = (nombre || apellido) ? `${nombre} ${apellido}`.trim() : (rw.userName_bb_vc || opt.value);
              selectProfesor.appendChild(opt);
            });
          }
        } catch (e) { console.warn('No se pudo cargar /api/profesores', e); }
        form.appendChild(wrapperFor('Profesor', selectProfesor));

        // Submit
        const btnSubmit = document.createElement('button');
        btnSubmit.type = 'submit';
        btnSubmit.textContent = 'Crear';
        btnSubmit.className = 'bg-green-500 text-white px-4 py-1 rounded';
        // Si faltan opciones dependientes, deshabilitar crear
        const canCreateProfes = selectDia.options.length > 0 && selectBloque.options.length > 0 && selectProfesor.options.length > 0;
        if (!canCreateProfes) {
          btnSubmit.disabled = true;
          btnSubmit.classList.add('opacity-50', 'cursor-not-allowed');
          btnSubmit.title = 'No hay datos suficientes para crear (dias/bloques/profesores).';
        }
        form.appendChild(btnSubmit);

        form.onsubmit = async (ev) => {
          ev.preventDefault();
          if (btnSubmit.disabled) return; // protección extra
          btnSubmit.disabled = true;
          const prevText = btnSubmit.textContent;
          btnSubmit.textContent = 'Creando...';
          const body = {
            ID_dia_DispProfesor_bb_vc: form['ID_dia_DispProfesor_bb_vc'].value,
            ID_bloque_DispProfesor_bb_vc: form['ID_bloque_DispProfesor_bb_vc'].value,
            ID_profesor_DispProfesor_bb_vc: form['ID_profesor_DispProfesor_bb_vc'].value,
          };
          const headers = { 'Content-Type': 'application/json' };
          const userId = this.getCurrentUserId_vc_bb();
          if (userId) headers['x-user-id'] = String(userId);
          try {
            await ApiGuide_vc_bb.json('POST', `/api/disponibilidad/profesor`, body, headers);
            form.reset();
            this.loadData_vc_bb();
          } catch (e) {
            console.error('Error creando disponibilidad profesor', e);
          } finally {
            btnSubmit.textContent = prevText;
            // re-enable solo si siguen existiendo opciones
            const stillCan = selectDia.options.length > 0 && selectBloque.options.length > 0 && selectProfesor.options.length > 0;
            btnSubmit.disabled = !stillCan;
            if (!stillCan) btnSubmit.classList.add('opacity-50', 'cursor-not-allowed');
            else btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed');
          }
        };
      return;
    }

    if (this.table_vc_bb === 'disponibilidad' && this.subTable_vc_bb === 'espacio') {
      const wrapperFor = (labelText, el) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-2 w-full sm:w-auto';
        const label = document.createElement('label');
        label.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
        label.textContent = labelText;
        wrapper.appendChild(label);
        wrapper.appendChild(el);
        return wrapper;
      };

      let selectDia = document.createElement('select');
      selectDia.name = 'ID_dia_DispEspacio_bb_vc';
      selectDia.className = 'border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300';
      try {
        const r = await ApiGuide_vc_bb.json('GET', '/api/dias');
        if (r.ok) (r.data || []).forEach(rw => { const opt = document.createElement('option'); opt.value = rw.ID_dia_bb_vc ?? Object.values(rw)[0]; opt.textContent = rw.dia_bb_vc || Object.values(rw)[1] || opt.value; selectDia.appendChild(opt); });
      } catch (e) { console.warn(e); }
      form.appendChild(wrapperFor('Día', selectDia));

      let selectBloque = document.createElement('select');
      selectBloque.name = 'ID_bloque_DispEspacio_bb_vc';
      selectBloque.className = 'border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300';
      try {
        const r2 = await ApiGuide_vc_bb.json('GET', '/api/bloques');
        if (r2.ok) (r2.data || []).forEach(rw => { const opt = document.createElement('option'); opt.value = rw.ID_bloque_bb_vc ?? Object.values(rw)[0]; opt.textContent = rw.hora_bloque_bb_vc || Object.values(rw)[1] || opt.value; selectBloque.appendChild(opt); });
      } catch (e) { console.warn(e); }
      form.appendChild(wrapperFor('Bloque', selectBloque));

      let selectEspacio = document.createElement('select');
      selectEspacio.name = 'ID_espacio_DispEspacio_bb_vc';
      selectEspacio.className = 'border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300';
      try {
        const re = await ApiGuide_vc_bb.json('GET', '/api/espacios');
        if (re.ok) {
          const rows = re.data || [];
          rows.forEach(rw => {
            const opt = document.createElement('option');
            opt.value = rw.ID_espacio_bb_vc ?? rw.id ?? Object.values(rw)[0];
            opt.textContent = rw.nombre_espacio_bb_vc ?? rw.nombre ?? Object.values(rw)[1] ?? opt.value;
            selectEspacio.appendChild(opt);
          });
        }
      } catch (e) { console.warn('No se pudo cargar /api/espacios', e); }
      form.appendChild(wrapperFor('Espacio', selectEspacio));

      const btnSubmit = document.createElement('button');
      btnSubmit.type = 'submit';
      btnSubmit.textContent = 'Crear';
      btnSubmit.className = 'bg-green-500 text-white px-4 py-1 rounded';
      // Deshabilitar si faltan opciones dependientes
      const canCreateEsp = selectDia.options.length > 0 && selectBloque.options.length > 0 && selectEspacio.options.length > 0;
      if (!canCreateEsp) {
        btnSubmit.disabled = true;
        btnSubmit.classList.add('opacity-50', 'cursor-not-allowed');
        btnSubmit.title = 'No hay datos suficientes para crear (dias/bloques/espacios).';
      }
      form.appendChild(btnSubmit);

      form.onsubmit = async (ev) => {
        ev.preventDefault();
        if (btnSubmit.disabled) return;
        btnSubmit.disabled = true;
        const prevText = btnSubmit.textContent;
        btnSubmit.textContent = 'Creando...';
        const body = {
          ID_dia_DispEspacio_bb_vc: form['ID_dia_DispEspacio_bb_vc'].value,
          ID_bloque_DispEspacio_bb_vc: form['ID_bloque_DispEspacio_bb_vc'].value,
          ID_espacio_DispEspacio_bb_vc: form['ID_espacio_DispEspacio_bb_vc'].value,
        };
        const headers = { 'Content-Type': 'application/json' };
        const userId = this.getCurrentUserId_vc_bb();
        if (userId) headers['x-user-id'] = String(userId);
        try {
          await ApiGuide_vc_bb.json('POST', `/api/disponibilidad/espacio`, body, headers);
          form.reset();
          this.loadData_vc_bb();
        } catch (e) {
          console.error('Error creando disponibilidad espacio', e);
        } finally {
          btnSubmit.textContent = prevText;
          const stillCan = selectDia.options.length > 0 && selectBloque.options.length > 0 && selectEspacio.options.length > 0;
          btnSubmit.disabled = !stillCan;
          if (!stillCan) btnSubmit.classList.add('opacity-50', 'cursor-not-allowed');
          else btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      };
      return;
    }

    const pkNames_vc_bb = [
      'ID_usuario_bb_vc','ID_espacio_bb_vc','ID_asignatura_bb_vc','ID_grado_bb_vc','ID_seccion_bb_vc','ID_DisponibilidadProfesor_bb_vc','ID_DisponibilidadEspacio_bb_vc','ID_clase_bb_vc'
    ];
    const isPk_vc_bb = (c) => pkNames_vc_bb.includes(c) || /^id$/i.test(c) || (this.table_vc_bb && c.toLowerCase() === (`id_${this.table_vc_bb}_bb_vc`).toLowerCase());
    let createCols = cols.filter(col => !isPk_vc_bb(col));
    if (this.table_vc_bb === 'espacios') {
      // Solo permitir el campo FK, ocultar derivados/alias
      createCols = createCols.filter(c => {
        const k = String(c).toLowerCase();
        if (k === 'tipoespacio_bb_vc' || k === 'tipo_espacio_bb_vc') return false;
        return true;
      });
    }
    if (this.table_vc_bb === 'asignaturas') {
      // Ocultar alias de tipo espacio y campos de grado duplicados (ID y nro)
      createCols = createCols.filter(c => {
        const k = String(c).toLowerCase();
        if (k === 'tipoespacio_bb_vc' || k === 'tipo_espacio_requerido_bb_vc') return false;
        if (k === 'id_grado_bb_vc' || k === 'nro_grado_bb_vc') return false;
        return true;
      });
    }
    createCols.forEach(col => {
      const keyLower = col.toLowerCase();
      let field;

      const wrapper = document.createElement('div');
      wrapper.className = 'flex flex-col gap-2 w-full sm:w-auto';

      const label = document.createElement('label');
      label.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
      label.textContent = this.prettyLabel_vc_bb(col);

      if (keyLower.includes("rol") || keyLower.includes("role")) {
        field = document.createElement("select");
        field.name = col;
        field.className = "border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300";
        const opciones = [
          { v: "profesor", t: "Profesor" },
          { v: "admin", t: "Administrador" }
        ];
        opciones.forEach(o => {
          const opt = document.createElement("option");
          opt.value = o.v;
          opt.textContent = o.t;
          field.appendChild(opt);
        });
      } else if (this.table_vc_bb === 'espacios' && (keyLower === 'id_tipoespacio_espacio_bb_vc' || keyLower.includes('tipoespacio'))) {
        field = document.createElement('select');
        field.name = col;
        field.className = "border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300";
        ApiGuide_vc_bb.json('GET', '/api/espacios/tipos')
          .then(r => r.ok ? (r.data || []) : [])
          .then(rows => {
            rows.forEach(rw => { const opt = document.createElement('option'); opt.value = rw.ID_TipoEspacio_bb_vc ?? Object.values(rw)[0]; opt.textContent = rw.tipo_bb_vc ?? Object.values(rw)[1] ?? opt.value; field.appendChild(opt); });
          })
          .catch(() => {});
      } else if (this.table_vc_bb === 'asignaturas' && (keyLower === 'id_tipoespacio_requerido_bb_vc' || keyLower.includes('tipoespacio'))) {
        field = document.createElement('select');
        field.name = col;
        field.className = "border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300";
        ApiGuide_vc_bb.json('GET', '/api/espacios/tipos')
          .then(r => r.ok ? (r.data || []) : [])
          .then(rows => {
            rows.forEach(rw => { const opt = document.createElement('option'); opt.value = rw.ID_TipoEspacio_bb_vc ?? Object.values(rw)[0]; opt.textContent = rw.tipo_bb_vc ?? Object.values(rw)[1] ?? opt.value; field.appendChild(opt); });
          })
          .catch(() => {});
      } else {
        field = document.createElement("input");
        field.name = col;
        field.placeholder = this.prettyLabel_vc_bb(col);
        field.required = true;
        if (this.table_vc_bb === 'usuarios' && keyLower.includes('password')) {
          field.type = 'password';
          field.placeholder = 'Clave';
        }
        field.className = "border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300";
      }

      wrapper.appendChild(label);
      wrapper.appendChild(field);
      form.appendChild(wrapper);
    });

    if (this.table_vc_bb === 'asignaturas') {
      const wrapGrado = document.createElement('div');
      wrapGrado.className = 'flex flex-col gap-2 w-full sm:w-auto';
      const labelGrado = document.createElement('label');
      labelGrado.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
      labelGrado.textContent = 'Grado';
      const selectGrado = document.createElement('select');
      selectGrado.name = 'nro_grado_bb_vc';
      selectGrado.className = 'border rounded px-3 py-2 h-11 w-full sm:w-auto bg-white text-gray-800 border-gray-300 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-300';
      ApiGuide_vc_bb.json('GET', '/api/grados')
        .then(r => r.ok ? (r.data || []) : [])
        .then(rows => {
          rows.forEach(rw => { const opt = document.createElement('option'); opt.value = rw.nro_grado_bb_vc ?? Object.values(rw)[1]; opt.textContent = String(opt.value); selectGrado.appendChild(opt); });
        })
        .catch(() => {});
      wrapGrado.appendChild(labelGrado);
      wrapGrado.appendChild(selectGrado);
      form.appendChild(wrapGrado);
    }

    const btnSubmit = document.createElement("button");
    btnSubmit.type = "submit";
    btnSubmit.textContent = "Crear";
    btnSubmit.className = "bg-green-500 text-white px-4 py-1 rounded";
    form.appendChild(btnSubmit);

    form.onsubmit = async (e) => {
      e.preventDefault();
      const body = {};
      createCols.forEach(col => {
        body[col] = form[col].value;
      });
      if (this.table_vc_bb === 'asignaturas' && form['nro_grado_bb_vc']) {
        body['nro_grado_bb_vc'] = form['nro_grado_bb_vc'].value;
      }

      // Decide endpoint (soporta subTable para entidades como disponibilidad)
      let postPath_vc_bb = `/api/${this.table_vc_bb}`;
      if (this.subTable_vc_bb) postPath_vc_bb = `${postPath_vc_bb}/${this.subTable_vc_bb}`;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn && submitBtn.disabled) return;
      if (submitBtn) {
        submitBtn.disabled = true;
        var prev = submitBtn.textContent;
        submitBtn.textContent = 'Creando...';
      }

      const userId_vc_bb = this.getCurrentUserId_vc_bb();
      const headers_vc_bb = { "Content-Type": "application/json" };
      if (userId_vc_bb) headers_vc_bb['x-user-id'] = String(userId_vc_bb);

      try {
        await ApiGuide_vc_bb.json("POST", postPath_vc_bb, body, headers_vc_bb);
        form.reset();
        this.loadData_vc_bb();
      } catch (err) {
        console.error('Error creando registro', err);
      } finally {
        if (submitBtn) {
          submitBtn.textContent = prev || 'Crear';
          submitBtn.disabled = false;
        }
      }
    };
  }

  openEditModal_vc_bb(row_vc_bb) {
    const modalInstance = this.modalCrud_vc_bb;
    const modalTitleText = `Editar ${this.table_vc_bb}`;

    const form_vc_bb = document.createElement("form");
    form_vc_bb.id = "editForm_vc_bb";
    form_vc_bb.className = "flex flex-col gap-4";

    // Special edit form for disponibilidad to send proper ID fields
    if (this.table_vc_bb === 'disponibilidad' && this.subTable_vc_bb === 'profesor') {
      (async () => {
        const wrapperFor = (labelText, el) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex flex-col gap-2';
          const label = document.createElement('label');
          label.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
          label.textContent = labelText;
          wrapper.appendChild(label);
          wrapper.appendChild(el);
          return wrapper;
        };

        const selectDia = document.createElement('select');
        selectDia.name = 'ID_dia_DispProfesor_bb_vc';
        selectDia.className = 'border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600';
        try {
          const r = await ApiGuide_vc_bb.json('GET', '/api/dias');
          if (r.ok) (r.data || []).forEach(rw => { const opt = document.createElement('option'); opt.value = rw.ID_dia_bb_vc ?? Object.values(rw)[0]; opt.textContent = rw.dia_bb_vc ?? Object.values(rw)[1] ?? opt.value; selectDia.appendChild(opt); });
        } catch (e) { console.warn('No se pudo cargar /api/dias', e); }
        // preselect by matching text if ID not present
        if (row_vc_bb.dia_bb_vc) Array.from(selectDia.options).forEach(o => { if (o.textContent === row_vc_bb.dia_bb_vc) o.selected = true; });
        form_vc_bb.appendChild(wrapperFor('Día', selectDia));

        const selectBloque = document.createElement('select');
        selectBloque.name = 'ID_bloque_DispProfesor_bb_vc';
        selectBloque.className = selectDia.className;
        try {
          const r2 = await ApiGuide_vc_bb.json('GET', '/api/bloques');
          if (r2.ok) (r2.data || []).forEach(rw => { const opt = document.createElement('option'); opt.value = rw.ID_bloque_bb_vc ?? Object.values(rw)[0]; opt.textContent = rw.hora_bloque_bb_vc ?? Object.values(rw)[1] ?? opt.value; selectBloque.appendChild(opt); });
        } catch (e) { console.warn('No se pudo cargar /api/bloques', e); }
        if (row_vc_bb.hora_bloque_bb_vc || row_vc_bb.hora_bloque) Array.from(selectBloque.options).forEach(o => { if (o.textContent === (row_vc_bb.hora_bloque_bb_vc || row_vc_bb.hora_bloque)) o.selected = true; });
        form_vc_bb.appendChild(wrapperFor('Bloque', selectBloque));

        const selectProfesor = document.createElement('select');
        selectProfesor.name = 'ID_profesor_DispProfesor_bb_vc';
        selectProfesor.className = selectDia.className;
        try {
          const rp = await ApiGuide_vc_bb.json('GET', '/api/profesores');
          if (rp.ok) {
            const rows = rp.data || [];
            rows.forEach(rw => {
              const opt = document.createElement('option');
              opt.value = rw.ID_profesor_bb_vc ?? rw.id ?? rw.ID_usuario_bb_vc ?? Object.values(rw)[0];
              const nombre = (rw.nombre_bb_vc || rw.nombre || rw.firstName || '');
              const apellido = (rw.apellido_bb_vc || rw.apellido || rw.lastName || '');
              opt.textContent = (nombre || apellido) ? `${nombre} ${apellido}`.trim() : (rw.userName_bb_vc || opt.value);
              selectProfesor.appendChild(opt);
            });
          }
        } catch (e) { console.warn('No se pudo cargar /api/profesores', e); }
        // preselect by ID if present in row
        if (row_vc_bb.ID_profesor_bb_vc) Array.from(selectProfesor.options).forEach(o => { if (String(o.value) === String(row_vc_bb.ID_profesor_bb_vc)) o.selected = true; });
        form_vc_bb.appendChild(wrapperFor('Profesor', selectProfesor));

        // modal action will send proper ID fields
        modalInstance.open_vc_bb(modalTitleText, form_vc_bb);
        modalInstance.onConfirm_vc_bb(async () => {
          const body = {
            ID_dia_DispProfesor_bb_vc: selectDia.value,
            ID_bloque_DispProfesor_bb_vc: selectBloque.value,
            ID_profesor_DispProfesor_bb_vc: selectProfesor.value
          };
          const id = row_vc_bb.ID_DisponibilidadProfesor_bb_vc || row_vc_bb.ID_DisponibilidadProfesor_bb_vc;
          await ApiGuide_vc_bb.json('PUT', `/api/disponibilidad/profesor/${id}`, body, Object.assign({ 'Content-Type': 'application/json' }, (this.getCurrentUserId_vc_bb() ? { 'x-user-id': String(this.getCurrentUserId_vc_bb()) } : {})));
          modalInstance.close_vc_bb();
          this.loadData_vc_bb();
        });
        return;
      })();
      return;
    }

    if (this.table_vc_bb === 'disponibilidad' && this.subTable_vc_bb === 'espacio') {
      (async () => {
        const wrapperFor = (labelText, el) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex flex-col gap-2';
          const label = document.createElement('label');
          label.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
          label.textContent = labelText;
          wrapper.appendChild(label);
          wrapper.appendChild(el);
          return wrapper;
        };

        const selectDia = document.createElement('select');
        selectDia.name = 'ID_dia_DispEspacio_bb_vc';
        selectDia.className = 'border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600';
        try { const r = await ApiGuide_vc_bb.json('GET', '/api/dias'); if (r.ok) (r.data || []).forEach(rw=>{ const opt=document.createElement('option'); opt.value=rw.ID_dia_bb_vc??Object.values(rw)[0]; opt.textContent=rw.dia_bb_vc||Object.values(rw)[1]||opt.value; selectDia.appendChild(opt); }); } catch(e){console.warn(e)}
        if (row_vc_bb.dia_bb_vc) Array.from(selectDia.options).forEach(o=>{ if (o.textContent === row_vc_bb.dia_bb_vc) o.selected = true; });
        form_vc_bb.appendChild(wrapperFor('Día', selectDia));

        const selectBloque = document.createElement('select');
        selectBloque.name = 'ID_bloque_DispEspacio_bb_vc';
        selectBloque.className = selectDia.className;
        try { const r2 = await ApiGuide_vc_bb.json('GET', '/api/bloques'); if (r2.ok) (r2.data || []).forEach(rw=>{ const opt=document.createElement('option'); opt.value=rw.ID_bloque_bb_vc??Object.values(rw)[0]; opt.textContent=rw.hora_bloque_bb_vc||Object.values(rw)[1]||opt.value; selectBloque.appendChild(opt); }); } catch(e){console.warn(e)}
        if (row_vc_bb.hora_bloque_bb_vc) Array.from(selectBloque.options).forEach(o=>{ if (o.textContent === row_vc_bb.hora_bloque_bb_vc) o.selected = true; });
        form_vc_bb.appendChild(wrapperFor('Bloque', selectBloque));

        const selectEspacio = document.createElement('select');
        selectEspacio.name = 'ID_espacio_DispEspacio_bb_vc';
        selectEspacio.className = selectDia.className;
        try { const re = await ApiGuide_vc_bb.json('GET', '/api/espacios'); if (re.ok) (re.data || []).forEach(rw=>{ const opt=document.createElement('option'); opt.value = rw.ID_espacio_bb_vc ?? rw.id ?? Object.values(rw)[0]; opt.textContent = rw.nombre_bb_vc ?? rw.nombre ?? Object.values(rw)[1] ?? opt.value; selectEspacio.appendChild(opt); }); } catch(e){console.warn(e)}
        if (row_vc_bb.ID_espacio_bb_vc) Array.from(selectEspacio.options).forEach(o=>{ if (String(o.value) === String(row_vc_bb.ID_espacio_bb_vc)) o.selected = true; });
        form_vc_bb.appendChild(wrapperFor('Espacio', selectEspacio));

        modalInstance.open_vc_bb(modalTitleText, form_vc_bb);
        modalInstance.onConfirm_vc_bb(async () => {
          const body = {
            ID_dia_DispEspacio_bb_vc: selectDia.value,
            ID_bloque_DispEspacio_bb_vc: selectBloque.value,
            ID_espacio_DispEspacio_bb_vc: selectEspacio.value
          };
          const id = row_vc_bb.ID_DisponibilidadEspacio_bb_vc || row_vc_bb.ID_DisponibilidadEspacio_bb_vc;
          await ApiGuide_vc_bb.json('PUT', `/api/disponibilidad/espacio/${id}`, body, Object.assign({ 'Content-Type': 'application/json' }, (this.getCurrentUserId_vc_bb() ? { 'x-user-id': String(this.getCurrentUserId_vc_bb()) } : {})));
          modalInstance.close_vc_bb();
          this.loadData_vc_bb();
        });
        return;
      })();
      return;
    }

    const pkNames2_vc_bb = [
      'ID_usuario_bb_vc','ID_espacio_bb_vc','ID_asignatura_bb_vc','ID_grado_bb_vc','ID_seccion_bb_vc','ID_DisponibilidadProfesor_bb_vc','ID_DisponibilidadEspacio_bb_vc','ID_clase_bb_vc'
    ];
    const isPk2_vc_bb = (c) => pkNames2_vc_bb.includes(c) || /^id$/i.test(c) || (this.table_vc_bb && c.toLowerCase() === (`id_${this.table_vc_bb}_bb_vc`).toLowerCase());
    let editableKeys = Object.keys(row_vc_bb).filter(k => !isPk2_vc_bb(k));
    if (this.table_vc_bb === 'espacios') {
      editableKeys = editableKeys.filter(k => {
        const kk = String(k).toLowerCase();
        return kk !== 'tipoespacio_bb_vc' && kk !== 'tipo_espacio_bb_vc';
      });
    }
    if (this.table_vc_bb === 'asignaturas') {
      editableKeys = editableKeys.filter(k => {
        const kk = String(k).toLowerCase();
        if (kk === 'tipoespacio_bb_vc' || kk === 'tipo_espacio_requerido_bb_vc') return false;
        if (kk === 'id_grado_bb_vc' || kk === 'nro_grado_bb_vc') return false;
        return true;
      });
    }
    editableKeys.forEach(async col => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex flex-col gap-2';
      const label = document.createElement('label');
      label.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
      label.textContent = this.prettyLabel_vc_bb(col);
      const keyLower = col.toLowerCase();
      if ((this.table_vc_bb === 'espacios' && (keyLower === 'id_tipoespacio_espacio_bb_vc' || keyLower.includes('tipoespacio'))) || (this.table_vc_bb === 'asignaturas' && (keyLower === 'id_tipoespacio_requerido_bb_vc' || keyLower.includes('tipoespacio')))) {
        const select = document.createElement('select');
        select.name = col;
        select.className = 'border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600';
        try {
          const r = await ApiGuide_vc_bb.json('GET', '/api/espacios/tipos');
          if (r.ok) {
            const rows = r.data || [];
            rows.forEach(rw => {
              const opt = document.createElement('option');
              opt.value = rw.ID_TipoEspacio_bb_vc ?? Object.values(rw)[0];
              opt.textContent = rw.tipo_bb_vc ?? Object.values(rw)[1] ?? opt.value;
              select.appendChild(opt);
            });
            const currentVal = row_vc_bb[col];
            Array.from(select.options).forEach(o => { if (String(o.value) === String(currentVal)) o.selected = true; });
          }
        } catch (_) {}
        wrapper.appendChild(label);
        wrapper.appendChild(select);
      } else if (this.table_vc_bb === 'usuarios' && (keyLower.includes('rol') || keyLower.includes('role'))) {
        const select = document.createElement('select');
        select.name = col;
        select.className = 'border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600';
        const opciones = [ 'Administrador', 'Profesor' ];
        opciones.forEach(t => { const opt = document.createElement('option'); opt.value = t; opt.textContent = t; select.appendChild(opt); });
        const currentVal = row_vc_bb[col];
        Array.from(select.options).forEach(o => { if (String(o.value).toLowerCase() === String(currentVal || '').toLowerCase()) o.selected = true; });
        wrapper.appendChild(label);
        wrapper.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.name = col;
        input.value = row_vc_bb[col] != null ? String(row_vc_bb[col]) : '';
        if (this.table_vc_bb === 'usuarios' && keyLower.includes('password')) {
          input.type = 'password';
          input.placeholder = 'Nueva clave';
          input.value = '';
        }
        input.className = 'border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600';
        wrapper.appendChild(label);
        wrapper.appendChild(input);
      }
      form_vc_bb.appendChild(wrapper);
    });

    if (this.table_vc_bb === 'asignaturas') {
      (async () => {
        const wrapGrado = document.createElement('div');
        wrapGrado.className = 'flex flex-col gap-2';
        const labelGrado = document.createElement('label');
        labelGrado.className = 'text-sm font-medium text-gray-600 dark:text-gray-200';
        labelGrado.textContent = 'Grado';
        const selectGrado = document.createElement('select');
        selectGrado.name = 'nro_grado_bb_vc';
        selectGrado.className = 'border rounded px-3 py-2 h-11 w-full bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600';
        try {
          const r = await ApiGuide_vc_bb.json('GET', '/api/grados');
          if (r.ok) (r.data || []).forEach(rw => { const opt = document.createElement('option'); opt.value = rw.nro_grado_bb_vc ?? Object.values(rw)[1]; opt.textContent = String(opt.value); selectGrado.appendChild(opt); });
        } catch (_) {}
        wrapGrado.appendChild(labelGrado);
        wrapGrado.appendChild(selectGrado);
        form_vc_bb.appendChild(wrapGrado);
      })();
    }

    modalInstance.open_vc_bb(modalTitleText, form_vc_bb);
    modalInstance.onConfirm_vc_bb(async () => {
      const formData_vc_bb = new FormData(form_vc_bb);
      const updated_vc_bb = {};
      for (let [key_vc_bb, value_vc_bb] of formData_vc_bb.entries()) {
        updated_vc_bb[key_vc_bb] = value_vc_bb;
      }
      if (this.table_vc_bb === 'asignaturas' && form_vc_bb['nro_grado_bb_vc']) {
        updated_vc_bb['nro_grado_bb_vc'] = form_vc_bb['nro_grado_bb_vc'].value;
      }
      const resolvedId_vc_bb = row_vc_bb._pk_vc_bb || this.findIdValue_vc_bb(row_vc_bb);
      let putPath_vc_bb = `/api/${this.table_vc_bb}`;
      if (this.subTable_vc_bb) putPath_vc_bb += `/${this.subTable_vc_bb}`;
      putPath_vc_bb += `/${resolvedId_vc_bb}`;
      await ApiGuide_vc_bb.json("PUT", putPath_vc_bb, updated_vc_bb, Object.assign({ "Content-Type": "application/json" }, (this.getCurrentUserId_vc_bb() ? { 'x-user-id': String(this.getCurrentUserId_vc_bb()) } : {})));
      modalInstance.close_vc_bb();
      this.loadData_vc_bb();
    });
  }

  findIdValue_vc_bb(obj) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.id) return obj.id;
    if (obj._pk_vc_bb) return obj._pk_vc_bb;

    const candidates = [
      'ID_DisponibilidadProfesor_bb_vc',
      'ID_DisponibilidadEspacio_bb_vc',
      'ID_clase_bb_vc',
      'ID_espacio_bb_vc',
      'ID_asignatura_bb_vc',
      'ID_grado_bb_vc',
      'ID_seccion_bb_vc',
      'ID_usuario_bb_vc',
      'ID_profesor_bb_vc',
      'ID', 'Id', 'id_usuario', 'id_profesor'
    ];
    for (const c of candidates) {
      if (Object.prototype.hasOwnProperty.call(obj, c)) return obj[c];
    }

    for (const k of Object.keys(obj)) {
      if (/^id_|^ID_/i.test(k)) return obj[k];
    }
    return null;
  }

  prettyLabel_vc_bb(col) {
    if (!col) return '';
    const map = {
      'userName_bb_vc': 'Usuario',
      'nombre_bb_vc': 'Nombre',
      'apellido_bb_vc': 'Apellido',
      'correo_bb_vc': 'Correo',
      'telefono_bb_vc': 'Teléfono',
      'rol_bb_vc': 'Rol',
      'password_bb_vc': 'Clave',
      'ID_usuario_bb_vc': 'ID',
      'ID_profesor_bb_vc': 'ID_profesor',
      'tipo_espacio_bb_vc': 'Tipo de espacio',
      'tipo_espacio_requerido_bb_vc': 'Espacio requerido'
    };
    if (map[col]) return map[col];

    let s = String(col).replace(/_bb_vc$/i, '');
    s = s.replace(/^ID_/, '');
    s = s.replace(/^id_/, '');
    s = s.replace(/_/g, ' ');
    s = s.replace(/\b\w/g, c => c.toUpperCase());
    return s;
  }
}

customElements.define("crud-table-vc-bb", CrudTable_vc_bb);


