const Institutions = {
  activeTab: 'dashboard',

  render(container, session) {
    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">${Icons.school}</span> Panel Super Admin</h2>
          <span class="badge badge-primary">Super Admin</span>
        </div>

        <div class="tabs" style="margin-bottom:20px">
          <button class="tab-btn ${this.activeTab === 'dashboard' ? 'active' : ''}" data-ptab="dashboard">${Icons.chart} Dashboard Global</button>
          <button class="tab-btn ${this.activeTab === 'instituciones' ? 'active' : ''}" data-ptab="instituciones">${Icons.school} Instituciones</button>
          <button class="tab-btn ${this.activeTab === 'sync' ? 'active' : ''}" data-ptab="sync">${Icons.refresh} Sincronización</button>
        </div>

        <div id="inst-content" class="animate-fadeIn"></div>
      </div>`;

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.ptab;
        this.renderTab(session);
      });
    });

    this.renderTab(session);
  },

  renderTab(session) {
    const el = document.getElementById('inst-content');
    if (!el) return;
    switch (this.activeTab) {
      case 'dashboard': this.renderDashboard(el, session); break;
      case 'instituciones': this.renderInstituciones(el, session); break;
      case 'sync': this.renderSync(el, session); break;
    }
  },

  // ---- TAB: DASHBOARD GLOBAL ----
  renderDashboard(el, session) {
    const insts = DB.getInstituciones();
    const totalInst = insts.length;
    const activas = insts.filter(i => i.activo !== false).length;

    // Stats por institución
    const filas = insts.filter(i => i.activo !== false).map(inst => {
      session.instVista = inst.id;
      const ests = DB.getEstudiantes().filter(e => e.activo);
      const docs = DB.getUsuarios().filter(u => u.rol === 'docente');
      const mats = DB.getMaterias();
      const grps = DB.getGrupos();
      delete session.instVista;
      return { ...inst, estudiantes: ests.length, docentes: docs.length, materias: mats.length, grupos: grps.length };
    });

    // Totales globales
    session.instVista = null;
    const totalEst = DB.getEstudiantes().filter(e => e.activo).length;
    const totalDoc = DB.getUsuarios().filter(u => u.rol === 'docente').length;
    const totalMat = DB.getMaterias().length;
    const totalGrp = DB.getGrupos().length;
    const totalNotas = DB.getNotas().length;
    delete session.instVista;

    el.innerHTML = `
      <div class="dashboard-grid">
        <div class="card animate-fadeIn col-full">
          <div class="card-header">
            <h3>${Icons.chart} Resumen Global del Sistema</h3>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px">
              <div class="stat-card" style="padding:20px;background:var(--primary-light);border-radius:var(--border-radius-sm);text-align:center">
                <div style="font-size:28px;font-weight:700;color:var(--primary)">${activas}</div>
                <div style="font-size:12px;color:var(--text-muted)">Instituciones activas</div>
              </div>
              <div class="stat-card" style="padding:20px;background:rgba(46,204,113,.1);border-radius:var(--border-radius-sm);text-align:center">
                <div style="font-size:28px;font-weight:700;color:var(--success)">${totalEst}</div>
                <div style="font-size:12px;color:var(--text-muted)">Estudiantes</div>
              </div>
              <div class="stat-card" style="padding:20px;background:rgba(52,152,219,.1);border-radius:var(--border-radius-sm);text-align:center">
                <div style="font-size:28px;font-weight:700;color:var(--info)">${totalDoc}</div>
                <div style="font-size:12px;color:var(--text-muted)">Docentes</div>
              </div>
              <div class="stat-card" style="padding:20px;background:rgba(155,89,182,.1);border-radius:var(--border-radius-sm);text-align:center">
                <div style="font-size:28px;font-weight:700;color:#9b59b6">${totalMat}</div>
                <div style="font-size:12px;color:var(--text-muted)">Materias</div>
              </div>
              <div class="stat-card" style="padding:20px;background:rgba(243,156,18,.1);border-radius:var(--border-radius-sm);text-align:center">
                <div style="font-size:28px;font-weight:700;color:#f39c12">${totalGrp}</div>
                <div style="font-size:12px;color:var(--text-muted)">Grupos</div>
              </div>
              <div class="stat-card" style="padding:20px;background:rgba(231,76,60,.1);border-radius:var(--border-radius-sm);text-align:center">
                <div style="font-size:28px;font-weight:700;color:#e74c3c">${totalNotas}</div>
                <div style="font-size:12px;color:var(--text-muted)">Notas registradas</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card animate-fadeIn col-full">
          <div class="card-header">
            <h3>${Icons.school} Detalle por Institución</h3>
          </div>
          <div class="card-body" style="padding:0">
            <table>
              <thead>
                <tr>
                  <th>Institución</th>
                  <th>Estudiantes</th>
                  <th>Docentes</th>
                  <th>Materias</th>
                  <th>Grupos</th>
                  <th style="width:100px">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${filas.map(f => `
                  <tr>
                    <td><strong>${f.nombre}</strong></td>
                    <td>${f.estudiantes}</td>
                    <td>${f.docentes}</td>
                    <td>${f.materias}</td>
                    <td>${f.grupos}</td>
                    <td><button class="btn btn-outline btn-sm" onclick="Institutions.verInst('${f.id}')">${Icons.view} Ver</button></td>
                  </tr>
                `).join('') || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">Sin instituciones activas</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card animate-fadeIn">
          <div class="card-header">
            <h3>${Icons.shield} Vista de Super Admin</h3>
          </div>
          <div class="card-body">
            <p style="font-size:13px;color:var(--text-secondary);margin:0 0 12px">
              Seleccioná una institución para ver SOLO los datos de esa institución en todos los módulos.
            </p>
            <div class="form-group">
              <label>Institución activa</label>
              <select class="form-control" id="sa-inst-select-dash">
                <option value="">Todas las instituciones</option>
              </select>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-switch-inst-dash" style="margin-top:8px">${Icons.refresh} Cambiar vista</button>
          </div>
        </div>

        <div class="card animate-fadeIn">
          <div class="card-header">
            <h3>${Icons.settings} Acciones Rápidas</h3>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <button class="btn btn-outline" onclick="Institutions.irATab('sync')">${Icons.refresh} Sincronizar todas las tablas</button>
            <button class="btn btn-outline" onclick="Institutions.irATab('instituciones')">${Icons.school} Gestionar instituciones</button>
            <button class="btn btn-outline" onclick="App.navigate('settings')">${Icons.settings} Ir a Configuración</button>
          </div>
        </div>
      </div>`;

    const sel = document.getElementById('sa-inst-select-dash');
    if (sel) {
      const insts = DB.getInstituciones().filter(i => i.activo !== false);
      sel.innerHTML = '<option value="">Todas las instituciones</option>' +
        insts.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
      if (session.instVista) sel.value = session.instVista;
      document.getElementById('btn-switch-inst-dash').addEventListener('click', () => {
        session.instVista = sel.value || null;
        sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(session));
        Utils.toast(sel.value ? 'Vista cambiada' : 'Mostrando todas', 'info');
        App.refresh();
      });
    }
  },

  verInst(id) {
    const session = Auth.getSession();
    session.instVista = id;
    sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(session));
    App.navigate('dashboard');
    Utils.toast('Vista cambiada a institución', 'info');
  },

  // ---- TAB: INSTITUCIONES CRUD ----
  renderInstituciones(el, session) {
    const insts = DB.getInstituciones();
    el.innerHTML = `
      <div class="card animate-fadeIn col-full">
        <div class="card-header">
          <h3>${Icons.school} Instituciones Registradas</h3>
          <button class="btn btn-accent btn-sm" id="btn-add-institucion">+ Nueva Institución</button>
        </div>
        <div class="card-body" style="padding:0">
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
              <tbody id="inst-tbody-crud">
                ${insts.map(inst => `
                  <tr>
                    <td><strong>${inst.nombre}</strong></td>
                    <td>${inst.direccion || '—'}</td>
                    <td>${inst.telefono || '—'}</td>
                    <td>${inst.email || '—'}</td>
                    <td><span class="badge ${inst.activo !== false ? 'badge-success' : 'badge-danger'}">${inst.activo !== false ? 'Activa' : 'Inactiva'}</span></td>
                    <td class="td-actions" style="justify-content:center">
                      <button class="btn btn-outline btn-sm" onclick="Institutions.openForm('${inst.id}')">${Icons.edit}</button>
                      ${inst.id !== 'inst_default' ? `<button class="btn btn-danger btn-sm" onclick="Institutions.eliminar('${inst.id}')">${Icons.trash}</button>` : ''}
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">No hay instituciones</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    document.getElementById('btn-add-institucion').addEventListener('click', () => this.openForm(null));
  },

  // ---- TAB: SINCRONIZACIÓN ----
  renderSync(el, session) {
    el.innerHTML = `
      <div class="dashboard-grid">
        <div class="card animate-fadeIn col-full">
          <div class="card-header">
            <h3>${Icons.refresh} Sincronización de Datos</h3>
          </div>
          <div class="card-body">
            <p style="font-size:13px;color:var(--text-secondary);margin:0 0 16px">
              Este proceso sincroniza todos los datos entre Supabase (servidor) y el caché local (navegador).
              Los registros que falten en un lado se copian al otro. No se pierde información.
            </p>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
              <button class="btn btn-primary" id="btn-sync-all">${Icons.refresh} Sincronizar todo</button>
              <button class="btn btn-outline" id="btn-backfill-inst">${Icons.school} Asignar institución a registros huérfanos</button>
              <button class="btn btn-outline" id="btn-reload-local">${Icons.refresh} Recargar desde Supabase</button>
            </div>
            <div id="sync-progress" style="margin-top:16px;display:none">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px" id="sync-status">Iniciando...</div>
              <div class="progress-bar" style="height:8px;background:var(--gray);border-radius:4px;overflow:hidden">
                <div id="sync-bar" style="height:100%;width:0%;background:var(--primary);border-radius:4px;transition:width .3s"></div>
              </div>
            </div>
            <div id="sync-result" style="margin-top:12px"></div>
          </div>
        </div>

        <div class="card animate-fadeIn col-full">
          <div class="card-header">
            <h3>${Icons.info} Estado de las tablas</h3>
          </div>
          <div class="card-body" style="padding:0">
            <table>
              <thead>
                <tr>
                  <th>Tabla</th>
                  <th>Caché local</th>
                  <th>Total IDs</th>
                </tr>
              </thead>
              <tbody>
                ${['instituciones','usuarios','periodos','grados','grupos','materias','estudiantes','notas','asistencia','actividades','notificaciones'].map(t => `
                  <tr>
                    <td><strong>${t}</strong></td>
                    <td><span class="badge badge-success">${(DB._data[t]||[]).length} registros</span></td>
                    <td style="font-size:12px;color:var(--text-muted)">${(DB._data[t]||[]).map(i=>i.id).join(', ').substring(0,80)||'—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    document.getElementById('btn-sync-all').addEventListener('click', () => this.ejecutarSync());
    document.getElementById('btn-backfill-inst').addEventListener('click', () => this.ejecutarBackfill());
    document.getElementById('btn-reload-local').addEventListener('click', () => {
      DB._loadAll().then(() => {
        Utils.toast('Datos recargados desde Supabase', 'success');
        this.renderSync(Auth.getSession());
      }).catch(e => Utils.toast('Error: ' + e.message, 'error'));
    });
  },

  async ejecutarSync() {
    const bar = document.getElementById('sync-bar');
    const status = document.getElementById('sync-status');
    const progress = document.getElementById('sync-progress');
    const result = document.getElementById('sync-result');
    if (!bar || !status) return;
    progress.style.display = 'block';
    result.innerHTML = '';
    const btn = document.getElementById('btn-sync-all');
    btn.disabled = true;

    try {
      await DB.syncAll((done, total) => {
        const pct = Math.round((done / total) * 100);
        bar.style.width = pct + '%';
        status.textContent = `Sincronizando tabla ${done} de ${total}...`;
      });
      bar.style.width = '100%';
      status.textContent = '¡Sincronización completada!';
      result.innerHTML = `<div class="alert alert-success" style="margin:0">${Icons.check} Todos los datos están sincronizados entre Supabase y el caché local.</div>`;
      // Refresh the tab to show updated counts
      setTimeout(() => this.renderSync(Auth.getSession()), 1500);
    } catch (e) {
      result.innerHTML = `<div class="alert alert-danger" style="margin:0">${Icons.error} Error: ${e.message}</div>`;
    } finally {
      btn.disabled = false;
    }
  },

  async ejecutarBackfill() {
    const result = document.getElementById('sync-result');
    if (!result) return;
    try {
      await DB.backfillInstId();
      result.innerHTML = `<div class="alert alert-success" style="margin:0">${Icons.check} institucion_id asignado a todos los registros que lo necesitaban.</div>`;
    } catch (e) {
      result.innerHTML = `<div class="alert alert-danger" style="margin:0">${Icons.error} Error: ${e.message}</div>`;
    }
  },

  irATab(tab) {
    this.activeTab = tab;
    const session = Auth.getSession();
    const container = document.getElementById('page-content');
    if (container) this.render(container, session);
  },

  // ---- FORM ----
  openForm(instId) {
    const session = Auth.getSession();
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
    div.querySelectorAll('.modal-close, .modal-overlay').forEach(el => el.addEventListener('click', () => div.remove()));
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
        Institutions.renderTab(Auth.getSession());
      } catch (err) {
        Utils.toast('Error: ' + err.message, 'error');
      } finally { btn.disabled = false; }
    });
  },

  async eliminar(id) {
    if (!await Utils.confirm('¿Desactivar esta institución? Los datos se conservarán pero dejará de estar visible.', 'Desactivar')) return;
    try {
      await DB.deleteInstitucion(id);
      Utils.toast('Institución desactivada', 'warning');
      this.renderTab(Auth.getSession());
    } catch (err) { Utils.toast('Error: ' + err.message, 'error'); }
  }
};

window.Institutions = Institutions;
