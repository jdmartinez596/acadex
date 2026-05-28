const Institutions = {
  render(container, session) {
    const insts = DB.getInstituciones();
    const activas = insts.filter(i => i.activo !== false);

    // Stats globales
    session.instVista = null;
    const totalEst = DB.getEstudiantes().filter(e => e.activo).length;
    const totalDoc = DB.getUsuarios().filter(u => u.rol === 'docente').length;
    const totalMat = DB.getMaterias().length;
    const totalGrp = DB.getGrupos().length;
    const totalNot = DB.getNotas().length;
    delete session.instVista;

    // Stats por institución
    const filas = activas.map(inst => {
      session.instVista = inst.id;
      const ests = DB.getEstudiantes().filter(e => e.activo).length;
      const docs = DB.getUsuarios().filter(u => u.rol === 'docente').length;
      const mats = DB.getMaterias().length;
      const grps = DB.getGrupos().length;
      delete session.instVista;
      return { ...inst, ests, docs, mats, grps };
    });

    const vistaActual = session.instVista
      ? DB.getInstitucion(session.instVista)?.nombre || 'Todas'
      : 'Todas las instituciones';

    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">${Icons.shield}</span> Panel de Control — Super Admin</h2>
          <span class="badge badge-primary" style="font-size:13px;padding:6px 14px">${vistaActual}</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:14px;margin-bottom:24px">
          <div style="background:var(--primary-light);padding:18px;border-radius:12px;text-align:center">
            <div style="font-size:30px;font-weight:800;color:var(--primary)">${activas.length}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Instituciones activas</div>
          </div>
          <div style="background:rgba(46,204,113,.08);padding:18px;border-radius:12px;text-align:center">
            <div style="font-size:30px;font-weight:800;color:var(--success)">${totalEst}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Estudiantes</div>
          </div>
          <div style="background:rgba(52,152,219,.08);padding:18px;border-radius:12px;text-align:center">
            <div style="font-size:30px;font-weight:800;color:var(--info)">${totalDoc}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Docentes</div>
          </div>
          <div style="background:rgba(155,89,182,.08);padding:18px;border-radius:12px;text-align:center">
            <div style="font-size:30px;font-weight:800;color:#9b59b6">${totalMat}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Materias</div>
          </div>
          <div style="background:rgba(243,156,18,.08);padding:18px;border-radius:12px;text-align:center">
            <div style="font-size:30px;font-weight:800;color:#f39c12">${totalGrp}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Grupos</div>
          </div>
          <div style="background:rgba(231,76,60,.08);padding:18px;border-radius:12px;text-align:center">
            <div style="font-size:30px;font-weight:800;color:#e74c3c">${totalNot}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Notas</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="card-header">
            <h3>${Icons.school} Instituciones</h3>
            <div style="display:flex;gap:8px">
              <button class="btn btn-accent btn-sm" id="btn-add-inst">+ Nueva</button>
              <button class="btn btn-outline btn-sm" id="btn-sync-inst">${Icons.refresh} Sync</button>
            </div>
          </div>
          <div class="card-body" style="padding:0">
            <table>
              <thead>
                <tr>
                  <th>Institución</th>
                  <th>Est.</th>
                  <th>Doc.</th>
                  <th>Mat.</th>
                  <th>Grp.</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th style="width:110px">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${filas.map(f => `
                  <tr>
                    <td><strong>${f.nombre}</strong></td>
                    <td>${f.ests}</td>
                    <td>${f.docs}</td>
                    <td>${f.mats}</td>
                    <td>${f.grps}</td>
                    <td style="font-size:12px;color:var(--text-muted)">${f.email || f.telefono || '—'}</td>
                    <td><span class="badge ${f.activo !== false ? 'badge-success' : 'badge-danger'}">${f.activo !== false ? 'Activa' : 'Inactiva'}</span></td>
                    <td class="td-actions" style="justify-content:center">
                      <button class="btn btn-outline btn-sm" onclick="Institutions.verInst('${f.id}')" title="Ver solo esta institución">${Icons.view}</button>
                      <button class="btn btn-outline btn-sm" onclick="Institutions.openForm('${f.id}')" title="Editar">${Icons.edit}</button>
                      ${f.id !== 'inst_default' ? `<button class="btn btn-danger btn-sm" onclick="Institutions.eliminar('${f.id}')" title="Desactivar">${Icons.trash}</button>` : ''}
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No hay instituciones. Creá la primera.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
          <div class="card">
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
              <h4 style="margin:0">${Icons.shield} Vista activa</h4>
              <select class="form-control" id="sa-inst-filter">
                <option value="">🌐 Todas las instituciones</option>
                ${activas.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('')}
              </select>
              <button class="btn btn-primary btn-sm" id="btn-apply-filter">Aplicar filtro</button>
              <p style="font-size:11px;color:var(--text-muted);margin:0">Al filtrar, ves solo los datos de esa institución en todos los módulos.</p>
            </div>
          </div>

          <div class="card">
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
              <h4 style="margin:0">${Icons.refresh} Sincronización</h4>
              <p style="font-size:12px;color:var(--text-muted);margin:0">Mergea datos entre Supabase y caché local.</p>
              <button class="btn btn-outline btn-sm" id="btn-sync-all">${Icons.refresh} Sincronizar todo</button>
              <button class="btn btn-outline btn-sm" id="btn-backfill">${Icons.school} Asignar institución a registros</button>
              <div id="sync-result-sa" style="font-size:12px"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
              <h4 style="margin:0">${Icons.settings} Acceso rápido</h4>
              <button class="btn btn-outline btn-sm" onclick="App.navigate('settings')">${Icons.settings} Configuración del sistema</button>
              <button class="btn btn-outline btn-sm" onclick="App.navigate('dashboard')">${Icons.chart} Dashboard general</button>
              <button class="btn btn-outline btn-sm" onclick="App.navigate('students')">${Icons.users} Estudiantes</button>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:20px;border:1px solid rgba(52,152,219,.3)">
          <div class="card-header" style="background:rgba(52,152,219,.05)">
            <h3 style="color:var(--info)">${Icons.info} Setup — Base de datos en Supabase</h3>
          </div>
          <div class="card-body">
            <p style="font-size:13px;margin:0 0 8px">Para que los datos se guarden en Supabase (no solo local), ejecutá este SQL en el <strong>SQL Editor</strong> de tu dashboard de Supabase:</p>
            <div style="background:var(--gray-dark);color:#fff;padding:16px;border-radius:8px;font-size:12px;font-family:monospace;white-space:pre-wrap;overflow-x:auto;max-height:200px;overflow-y:auto;margin-bottom:12px" id="sql-setup-text">${this.getSetupSQL()}</div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" id="btn-copy-sql">${Icons.plus} Copiar SQL</button>
              <a class="btn btn-outline btn-sm" href="https://supabase.com/dashboard/project/exmnrhgiawwdhvpaiale/sql/new" target="_blank">${Icons.export} Abrir SQL Editor</a>
            </div>
            <p style="font-size:11px;color:var(--text-muted);margin:12px 0 0">Mientras no ejecutes el SQL, todo funciona con almacenamiento local. Cuando lo ejecutes, usá el botón "Sync" para subir los datos existentes a Supabase.</p>
          </div>
        </div>
      </div>`;

    // Eventos
    const sel = document.getElementById('sa-inst-filter');
    if (sel) {
      if (session.instVista) sel.value = session.instVista;
      document.getElementById('btn-apply-filter').addEventListener('click', () => {
        session.instVista = sel.value || null;
        sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(session));
        Utils.toast(sel.value ? 'Filtrando: ' + sel.options[sel.selectedIndex].text : 'Mostrando todas', 'info');
        this.render(container, session);
      });
    }

    document.getElementById('btn-add-inst').addEventListener('click', () => this.openForm(null));
    document.getElementById('btn-sync-inst').addEventListener('click', () => this.ejecutarSync());

    const syncBtn = document.getElementById('btn-sync-all');
    if (syncBtn) syncBtn.addEventListener('click', () => this.ejecutarSync());
    const bfBtn = document.getElementById('btn-backfill');
    if (bfBtn) bfBtn.addEventListener('click', () => this.ejecutarBackfill());

    const copyBtn = document.getElementById('btn-copy-sql');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = document.getElementById('sql-setup-text')?.textContent;
        if (text) {
          navigator.clipboard.writeText(text).then(() => Utils.toast('SQL copiado al portapapeles', 'success')).catch(() => Utils.toast('No se pudo copiar', 'error'));
        }
      });
    }
    // Auto-sync silencioso al cargar la página (una vez por sesión)
    if (!sessionStorage.getItem('acadex_auto_synced')) {
      setTimeout(() => {
        const r = document.getElementById('sync-result-sa');
        if (r) {
          r.innerHTML = '<span style="color:var(--text-muted)">Sincronizando automáticamente...</span>';
          DB.syncAll().then(() => {
            r.innerHTML = `<span style="color:var(--success)">${Icons.check} Datos sincronizados</span>`;
            sessionStorage.setItem('acadex_auto_synced', '1');
          }).catch(() => {
            r.innerHTML = '';
          });
        } else {
          DB.syncAll().catch(() => {});
          sessionStorage.setItem('acadex_auto_synced', '1');
        }
      }, 500);
    }
  },

  getSetupSQL() {
    return `-- ACADEX — Migraci\\u00f3n Multi-Instituci\\u00f3n

CREATE TABLE IF NOT EXISTS instituciones (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  email TEXT DEFAULT '',
  activo BOOLEAN DEFAULT true,
  creado TIMESTAMP DEFAULT NOW()
);

INSERT INTO instituciones (id, nombre) VALUES ('inst_default', 'Instituci\\u00f3n Principal') ON CONFLICT (id) DO NOTHING;

-- Permitir rol super_admin en usuarios
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('super_admin','admin','docente','estudiante'));

ALTER TABLE config ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE periodos ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE grados ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE materias ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE notas ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);

UPDATE usuarios SET rol = 'super_admin' WHERE email = 'jdmartinez596@gmail.com';

INSERT INTO usuarios (id, nombre, apellido, email, documento, password, rol, institucion_id, activo)
SELECT 'super_admin', 'Jesus', 'Martinez', 'jdmartinez596@gmail.com', 'SUPERADMIN', 'Juni@r12', 'super_admin', 'inst_default', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'jdmartinez596@gmail.com');`;
  },

  verInst(id) {
    const session = Auth.getSession();
    session.instVista = id;
    sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(session));
    App.navigate('dashboard');
    Utils.toast('Vista cambiada a institución', 'info');
  },

  async ejecutarSync() {
    const result = document.getElementById('sync-result-sa') || document.getElementById('sync-result');
    if (!result) return;
    result.innerHTML = '<span style="color:var(--text-muted)">Sincronizando...</span>';
    try {
      await DB.syncAll((done, total) => {
        result.innerHTML = `<span style="color:var(--text-muted)">Tabla ${done} de ${total}...</span>`;
      });
      result.innerHTML = `<span style="color:var(--success)">${Icons.check} Sincronización completada</span>`;
      App.refresh();
    } catch (e) {
      result.innerHTML = `<span style="color:var(--danger)">${Icons.error} ${e.message}</span>`;
    }
  },

  async ejecutarBackfill() {
    const result = document.getElementById('sync-result-sa');
    if (!result) return;
    try {
      await DB.backfillInstId();
      result.innerHTML = `<span style="color:var(--success)">${Icons.check} institucion_id asignado a todos los registros</span>`;
    } catch (e) {
      result.innerHTML = `<span style="color:var(--danger)">${Icons.error} ${e.message}</span>`;
    }
  },

  openForm(instId) {
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
                <input type="text" class="form-control" name="telefono" value="${inst.telefono || ''}">
              </div>
            </div>
            <div class="form-row col-2" style="margin:14px 0">
              <div class="form-group">
                <label>Dirección</label>
                <input type="text" class="form-control" name="direccion" value="${inst.direccion || ''}">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control" name="email" value="${inst.email || ''}">
              </div>
            </div>
            <div class="form-group">
              <label><input type="checkbox" name="activo" ${inst.activo !== false ? 'checked' : ''} value="true"> Institución Activa</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
            <button type="submit" class="btn btn-primary">${Icons.save} ${isEdit ? 'Guardar' : 'Crear'}</button>
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
        if (isEdit) { await DB.updateInstitucion(instId, data); Utils.toast('Actualizada', 'success'); }
        else { await DB.addInstitucion(data); Utils.toast('Creada', 'success'); }
        div.remove();
        const session = Auth.getSession();
        const c = document.getElementById('page-content');
        if (c) this.render(c, session);
      } catch (err) { Utils.toast('Error: ' + err.message, 'error'); }
      finally { btn.disabled = false; }
    });
  },

  async eliminar(id) {
    if (!await Utils.confirm('¿Desactivar esta institución?', 'Desactivar')) return;
    try {
      await DB.deleteInstitucion(id);
      Utils.toast('Desactivada', 'warning');
      const session = Auth.getSession();
      const c = document.getElementById('page-content');
      if (c) this.render(c, session);
    } catch (err) { Utils.toast('Error: ' + err.message, 'error'); }
  }
};

window.Institutions = Institutions;
