const Institutions = {
  render(container, session) {
    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">${Icons.school}</span> Gestión de Instituciones</h2>
        </div>

        <div class="dashboard-grid">
          <div class="card animate-fadeIn col-full">
            <div class="card-header">
              <h3>${Icons.school} Instituciones Registradas</h3>
              <button class="btn btn-accent btn-sm" id="btn-add-institucion">+ Nueva Institución</button>
            </div>
            <div class="card-body" style="padding:0;">
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th style="width:120px;text-align:center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="instituciones-tbody"></tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card animate-fadeIn">
            <div class="card-header">
              <h3>${Icons.info} Resumen</h3>
            </div>
            <div class="card-body" id="instituciones-resumen">
              <p style="color:var(--text-muted);font-size:14px">Cargando...</p>
            </div>
          </div>

          <div class="card animate-fadeIn">
            <div class="card-header">
              <h3>${Icons.shield} Acceso Super Admin</h3>
            </div>
            <div class="card-body">
              <p style="font-size:13px;color:var(--text-secondary);margin:0 0 12px">
                Como super admin podés iniciar sesión en cualquier institución.
                Al seleccionar una institución, ves únicamente los datos de esa institución.
              </p>
              <div class="form-group">
                <label>Institución activa para esta sesión</label>
                <select class="form-control" id="super-admin-inst-select">
                  <option value="">Todas las instituciones</option>
                </select>
              </div>
              <button class="btn btn-outline btn-sm" id="btn-switch-inst" style="margin-top:8px">${Icons.refresh} Cambiar vista</button>
            </div>
          </div>
        </div>
      </div>`;

    this.renderTable();
    this.renderResumen();
    this.cargarSelectorInstituciones();

    document.getElementById('btn-add-institucion').addEventListener('click', () => this.openForm(null, session));
    document.getElementById('btn-switch-inst').addEventListener('click', () => {
      const instId = document.getElementById('super-admin-inst-select').value;
      const session = Auth.getSession();
      session.instVista = instId || null;
      sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(session));
      Utils.toast(instId ? 'Vista cambiada a institución específica' : 'Mostrando todas las instituciones', 'info');
      App.refresh();
    });
  },

  renderTable() {
    const instituciones = DB.getInstituciones();
    const tbody = document.getElementById('instituciones-tbody');
    if (!tbody) return;

    tbody.innerHTML = instituciones.map(inst => `
      <tr>
        <td><strong>${inst.nombre}</strong></td>
        <td>${inst.direccion || '—'}</td>
        <td>${inst.telefono || '—'}</td>
        <td>${inst.email || '—'}</td>
        <td><span class="badge ${inst.activo !== false ? 'badge-success' : 'badge-danger'}">${inst.activo !== false ? 'Activa' : 'Inactiva'}</span></td>
        <td class="td-actions" style="justify-content:center">
          <button class="btn btn-outline btn-sm" onclick="Institutions.openForm('${inst.id}', Auth.getSession())">${Icons.edit}</button>
          ${inst.id !== 'inst_default' ? `<button class="btn btn-danger btn-sm" onclick="Institutions.eliminar('${inst.id}')">${Icons.trash}</button>` : ''}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">No hay instituciones registradas</td></tr>';
  },

  renderResumen() {
    const insts = DB.getInstituciones();
    const total = insts.length;
    const activas = insts.filter(i => i.activo !== false).length;

    const stats = {
      estudiantes: 0,
      docentes: 0
    };

    const session = Auth.getSession();
    insts.forEach(inst => {
      if (inst.activo === false) return;
      session.instVista = inst.id;
      const usuarios = DB.getUsuarios().filter(u => u.institucionId === inst.id || !u.institucionId);
      stats.estudiantes += usuarios.filter(u => u.rol === 'estudiante').length;
      stats.docentes += usuarios.filter(u => u.rol === 'docente').length;
    });
    delete session.instVista;

    const el = document.getElementById('instituciones-resumen');
    if (!el) return;
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="stat-card" style="padding:16px;background:var(--gray-light);border-radius:var(--border-radius-sm)">
          <div style="font-size:24px;font-weight:700">${total}</div>
          <div style="font-size:12px;color:var(--text-muted)">Total</div>
        </div>
        <div class="stat-card" style="padding:16px;background:var(--gray-light);border-radius:var(--border-radius-sm)">
          <div style="font-size:24px;font-weight:700">${activas}</div>
          <div style="font-size:12px;color:var(--text-muted)">Activas</div>
        </div>
        <div class="stat-card" style="padding:16px;background:var(--gray-light);border-radius:var(--border-radius-sm)">
          <div style="font-size:24px;font-weight:700">${stats.estudiantes}</div>
          <div style="font-size:12px;color:var(--text-muted)">Estudiantes</div>
        </div>
        <div class="stat-card" style="padding:16px;background:var(--gray-light);border-radius:var(--border-radius-sm)">
          <div style="font-size:24px;font-weight:700">${stats.docentes}</div>
          <div style="font-size:12px;color:var(--text-muted)">Docentes</div>
        </div>
      </div>`;
  },

  cargarSelectorInstituciones() {
    const sel = document.getElementById('super-admin-inst-select');
    if (!sel) return;
    const insts = DB.getInstituciones().filter(i => i.activo !== false);
    sel.innerHTML = '<option value="">Todas las instituciones</option>' +
      insts.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
    const session = Auth.getSession();
    if (session.instVista) sel.value = session.instVista;
  },

  openForm(instId, session) {
    const isEdit = !!instId;
    const inst = isEdit ? DB.getInstitucion(instId) : { nombre: '', direccion: '', telefono: '', email: '', activo: true };

    const modalId = 'modal-inst-' + Date.now();
    const div = document.createElement('div');
    div.className = 'modal active';
    div.id = modalId;
    div.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar' : 'Nueva'} Institución</h3>
          <button class="modal-close">${Icons.close}</button>
        </div>
        <form id="form-inst">
          <div class="modal-body">
            <div class="form-row col-2">
              <div class="form-group">
                <label>Nombre <span class="required">*</span></label>
                <input type="text" class="form-control" name="nombre" value="${inst.nombre}" required placeholder="ej: Colegio San José">
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="text" class="form-control" name="telefono" value="${inst.telefono || ''}" placeholder="ej: 3001234567">
              </div>
            </div>
            <div class="form-row col-2" style="margin:14px 0">
              <div class="form-group">
                <label>Dirección</label>
                <input type="text" class="form-control" name="direccion" value="${inst.direccion || ''}" placeholder="ej: Calle 123 #45-67">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control" name="email" value="${inst.email || ''}" placeholder="ej: contacto@institucion.edu">
              </div>
            </div>
            <div class="form-group">
              <label><input type="checkbox" name="activo" ${inst.activo !== false ? 'checked' : ''} value="true"> Institución Activa</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
            <button type="submit" class="btn btn-primary">${Icons.save} ${isEdit ? 'Guardar Cambios' : 'Crear Institución'}</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(div);

    div.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', () => div.remove());
    });

    div.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const data = Utils.serializeForm(e.target);
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;

      try {
        if (isEdit) {
          await DB.updateInstitucion(instId, data);
          Utils.toast('Institución actualizada', 'success');
        } else {
          await DB.addInstitucion(data);
          Utils.toast('Institución creada', 'success');
        }
        div.remove();
        this.render(Auth.getSession());
      } catch (err) {
        Utils.toast('Error: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
      }
    });
  },

  async eliminar(id) {
    if (!await Utils.confirm('¿Desactivar esta institución? Los datos se conservarán pero la institución dejará de estar visible.', 'Desactivar Institución')) return;
    try {
      await DB.deleteInstitucion(id);
      Utils.toast('Institución desactivada', 'warning');
      this.render(Auth.getSession());
    } catch (err) {
      Utils.toast('Error: ' + err.message, 'error');
    }
  }
};

window.Institutions = Institutions;
