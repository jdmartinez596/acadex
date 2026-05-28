// ============================================================
// ACADEX — Módulo Gestión de Estudiantes
// ============================================================

const Students = {
  page: 1,
  query: '',
  gradoFilter: '',
  grupoFilter: '',
  viewMode: 'tabla', // 'tabla' | 'cards' | 'perfil'
  currentEstId: null,

  render(container, session) {
    this.session = session;
    this.viewMode = 'tabla';
    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">👥</span> Estudiantes</h2>
          <div class="section-actions">
            <button class="btn btn-outline btn-sm" id="btn-import-est" title="Importar CSV">📥 Importar</button>
            <button class="btn btn-outline btn-sm" id="btn-export-est">📤 Exportar</button>
            ${session.rol !== 'estudiante' ? `<button class="btn btn-accent" id="btn-add-est">+ Nuevo Estudiante</button>` : ''}
          </div>
        </div>
        ${this.renderToolbar()}
        <div id="students-content" class="animate-fadeIn"></div>
      </div>`;

    this.setupToolbar(container, session);
    this.renderList(session);

    document.getElementById('btn-add-est')?.addEventListener('click', () => this.openForm(null, session));
    document.getElementById('btn-export-est')?.addEventListener('click', () => this.exportarCSV());
    document.getElementById('btn-import-est')?.addEventListener('click', () => this.openImport(session));
  },

  renderToolbar() {
    const grados = DB.getGrados();
    const grupos = DB.getGrupos();
    return `<div class="table-wrapper" style="margin-bottom:0;border-bottom:none;border-radius:12px 12px 0 0">
      <div class="table-toolbar">
        <div class="table-search"><span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar por nombre, apellido o documento..." id="search-est" value="${this.query}">
        </div>
        <div class="table-filters">
          <select id="filter-grado-est">
            <option value="">Todos los grados</option>
            ${grados.map(g=>`<option value="${g.id}" ${g.id===this.gradoFilter?'selected':''}>${g.nombre}</option>`).join('')}
          </select>
          <select id="filter-grupo-est">
            <option value="">Todos los grupos</option>
            ${grupos.map(g=>`<option value="${g.id}" ${g.id===this.grupoFilter?'selected':''}>${g.nombre}</option>`).join('')}
          </select>
          <button class="btn ${this.viewMode==='tabla'?'btn-primary':'btn-outline'} btn-sm" id="view-tabla">☰ Tabla</button>
          <button class="btn ${this.viewMode==='cards'?'btn-primary':'btn-outline'} btn-sm" id="view-cards">⊞ Cards</button>
        </div>
      </div>
    </div>`;
  },

  setupToolbar(container, session) {
    const searchIn = document.getElementById('search-est');
    const gradoSel = document.getElementById('filter-grado-est');
    const grupoSel = document.getElementById('filter-grupo-est');

    searchIn?.addEventListener('input', Utils.debounce(e => { this.query = e.target.value; this.page = 1; this.renderList(session); }, 300));
    gradoSel?.addEventListener('change', e => { this.gradoFilter = e.target.value; this.page = 1; this.renderGrupoFilter(); this.renderList(session); });
    grupoSel?.addEventListener('change', e => { this.grupoFilter = e.target.value; this.page = 1; this.renderList(session); });
    document.getElementById('view-tabla')?.addEventListener('click', () => { this.viewMode = 'tabla'; App.navigate('students'); });
    document.getElementById('view-cards')?.addEventListener('click', () => { this.viewMode = 'cards'; App.navigate('students'); });
  },

  renderGrupoFilter() {
    const sel = document.getElementById('filter-grupo-est');
    if (!sel) return;
    const grupos = this.gradoFilter ? DB.getGruposByGrado(this.gradoFilter) : DB.getGrupos();
    sel.innerHTML = `<option value="">Todos los grupos</option>${grupos.map(g=>`<option value="${g.id}">${g.nombre}</option>`).join('')}`;
    this.grupoFilter = '';
  },

  getData() {
    let data = DB.getEstudiantes().filter(e => e.activo);
    if (this.query) data = Utils.buscar(data, this.query, ['nombre','apellido','documento','email']);
    if (this.gradoFilter) data = data.filter(e => e.gradoId === this.gradoFilter);
    if (this.grupoFilter) data = data.filter(e => e.grupoId === this.grupoFilter);
    return data.sort((a,b) => a.apellido.localeCompare(b.apellido));
  },

  renderList(session) {
    const content = document.getElementById('students-content');
    if (!content) return;
    const data = this.getData();
    const config = DB.getConfig();

    if (this.viewMode === 'cards') {
      const pag = Utils.paginar(data, this.page, 12);
      content.innerHTML = `
        <div class="grid-auto stagger animate-fadeIn" style="margin-top:0;border-top:1px solid var(--gray)">
          ${pag.items.map(e => this.renderCard(e, config)).join('')}
          ${!pag.items.length ? '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">👥</div><h3>Sin estudiantes</h3><p>Agrega el primer estudiante o ajusta los filtros</p></div>' : ''}
        </div>
        <div id="students-pag"></div>`;
      content.querySelectorAll('.student-card').forEach(card => {
        card.addEventListener('click', () => this.verPerfil(card.dataset.id, session));
      });
      Utils.renderPaginacion(document.getElementById('students-pag'), pag, p => { this.page = p; this.renderList(session); });
    } else {
      const pag = Utils.paginar(data, this.page, 15);
      content.innerHTML = `
        <div class="table-wrapper animate-fadeIn" style="border-radius:0 0 12px 12px">
          <table><thead><tr>
            <th>Estudiante</th><th>Documento</th><th>Grado / Grupo</th><th>Edad</th>
            <th>Promedio</th><th>Asistencia</th><th>Acudiente</th>
            <th>Acciones</th>
          </tr></thead><tbody id="students-tbody"></tbody></table>
          <div id="students-pag"></div>
        </div>`;
      document.getElementById('students-tbody').innerHTML = pag.items.map(e => {
        const grado = DB.getGrado(e.gradoId);
        const grupo = DB.getGrupo(e.grupoId);
        const color = Utils.colorFromString(e.nombre + e.apellido);
        const pf = this.calcPromedioGeneral(e.id);
        const asist = DB.calcularPorcentajeAsistencia(e.id, null);
        return `<tr style="cursor:pointer" onclick="Students.verPerfil('${e.id}', Auth.getSession())">
          <td><div style="display:flex;align-items:center;gap:12px">
            ${e.foto ? `<div class="avatar" style="background:${color}"><img src="${e.foto}" alt=""></div>` : `<div class="avatar" style="background:${color}">${Utils.avatarInitials(e.nombre,e.apellido)}</div>`}
            <div><div style="font-weight:700">${e.apellido}, ${e.nombre}</div><div style="font-size:12px;color:var(--text-muted)">${e.email||''}</div></div>
          </div></td>
          <td><span style="font-size:12px">${e.tipoDoc||'CC'}: ${e.documento||'—'}</span></td>
          <td><span class="badge badge-primary">${grado?.nombre||'—'}</span> <span class="badge badge-info">${grupo?.nombre||'—'}</span></td>
          <td>${Utils.calcularEdad(e.fechaNacimiento)} años</td>
          <td><span style="font-weight:700;color:${Utils.colorNota(pf, config.escala.minAprobatorio)}">${pf !== null ? Utils.formatNota(pf) : '—'}</span></td>
          <td><span style="font-weight:700;color:${Utils.colorAsistencia(asist)}">${asist}%</span></td>
          <td><div style="font-size:12px"><div style="font-weight:600">${e.acudiente?.nombre||'—'}</div><div style="color:var(--text-muted)">${e.acudiente?.telefono||''}</div></div></td>
          <td onclick="event.stopPropagation()" class="td-actions">
            <button class="btn btn-outline btn-sm" onclick="Students.openForm('${e.id}', Auth.getSession())">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="Students.eliminar('${e.id}')">🗑️</button>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Sin estudiantes que coincidan</td></tr>';
      Utils.renderPaginacion(document.getElementById('students-pag'), pag, p => { this.page = p; this.renderList(session); });
    }
  },

  renderCard(e, config) {
    const color = Utils.colorFromString(e.nombre + e.apellido);
    const grado = DB.getGrado(e.gradoId);
    const grupo = DB.getGrupo(e.grupoId);
    const pf = this.calcPromedioGeneral(e.id);
    const asist = DB.calcularPorcentajeAsistencia(e.id, null);
    return `<div class="student-card" data-id="${e.id}" style="margin-top:0">
      ${e.foto ? `<div class="avatar avatar-lg"><img src="${e.foto}" alt=""></div>` : `<div class="avatar avatar-lg" style="background:${color}">${Utils.avatarInitials(e.nombre,e.apellido)}</div>`}
      <div class="student-info">
        <h4>${e.nombre} ${e.apellido}</h4>
        <p>${grado?.nombre||'—'} · ${grupo?.nombre||'—'}</p>
        <div style="display:flex;gap:6px;margin-top:6px">
          <span class="badge badge-neutral" style="font-size:10px">📅 ${asist}%</span>
        </div>
      </div>
      <div class="student-stats">
        <div class="student-nota" style="color:${Utils.colorNota(pf, config.escala.minAprobatorio)}">${pf !== null ? Utils.formatNota(pf) : '—'}</div>
        <div class="student-nota-label">Promedio</div>
      </div>
    </div>`;
  },

  calcPromedioGeneral(estudianteId) {
    const materias = DB.getMaterias();
    let total = 0, count = 0;
    materias.forEach(m => {
      const pf = DB.calcularPromedioFinal(estudianteId, m.id);
      if (pf !== null) { total += pf; count++; }
    });
    return count > 0 ? Math.round((total/count)*100)/100 : null;
  },

  verPerfil(id, session) {
    const est = DB.getEstudiante(id);
    if (!est) return;
    const grado = DB.getGrado(est.gradoId);
    const grupo = DB.getGrupo(est.grupoId);
    const color = Utils.colorFromString(est.nombre + est.apellido);
    const config = DB.getConfig();
    const pf = this.calcPromedioGeneral(id);
    const asist = DB.calcularPorcentajeAsistencia(id, null);
    const materias = DB.getMateriasByGrado(est.gradoId);
    const periodos = DB.getPeriodos();

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content modal-xl" style="max-height:90vh">
        <div class="modal-header">
          <h3>Perfil del Estudiante</h3>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body" style="padding:0">
          <!-- Header del perfil -->
          <div class="student-profile-header" style="margin:0;border-radius:0">
            ${est.foto ? `<div class="profile-avatar"><img src="${est.foto}"></div>` : `<div class="profile-avatar">${Utils.avatarInitials(est.nombre,est.apellido)}</div>`}
            <div class="profile-info">
              <h2>${est.nombre} ${est.apellido}</h2>
              <div class="profile-meta">
                <div class="profile-meta-item">📋 ${est.tipoDoc||'TI'}: ${est.documento||'—'}</div>
                <div class="profile-meta-item">🎓 ${grado?.nombre||'—'} · ${grupo?.nombre||'—'}</div>
                <div class="profile-meta-item">🎂 ${Utils.calcularEdad(est.fechaNacimiento)} años</div>
                <div class="profile-meta-item">📧 ${est.email||'—'}</div>
              </div>
              <div style="display:flex;gap:16px;margin-top:16px">
                <div style="text-align:center;background:rgba(255,255,255,.15);padding:12px 20px;border-radius:12px">
                  <div style="font-size:28px;font-weight:800">${pf !== null ? Utils.formatNota(pf) : '—'}</div>
                  <div style="font-size:12px;opacity:.8">Promedio General</div>
                </div>
                <div style="text-align:center;background:rgba(255,255,255,.15);padding:12px 20px;border-radius:12px">
                  <div style="font-size:28px;font-weight:800">${asist}%</div>
                  <div style="font-size:12px;opacity:.8">Asistencia</div>
                </div>
                <div style="text-align:center;background:rgba(255,255,255,.15);padding:12px 20px;border-radius:12px">
                  <div style="font-size:28px;font-weight:800">${materias.length}</div>
                  <div style="font-size:12px;opacity:.8">Materias</div>
                </div>
              </div>
            </div>
            ${session.rol !== 'estudiante' ? `<button class="btn btn-accent" onclick="Students.openForm('${id}', Auth.getSession())">✏️ Editar</button>` : ''}
          </div>

          <!-- Pestañas del perfil -->
          <div style="padding:20px 24px">
            <div class="tabs" style="margin-bottom:20px">
              <button class="tab-btn active" data-ptab="notas">📝 Notas</button>
              <button class="tab-btn" data-ptab="asistencia">✅ Asistencia</button>
              <button class="tab-btn" data-ptab="info">👤 Información</button>
            </div>
            <div id="profile-tab-content"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-overlay, .modal-close').forEach(el => el.addEventListener('click', () => { modal.remove(); document.body.style.overflow=''; }));

    const renderProfileTab = (tab) => {
      const c = document.getElementById('profile-tab-content');
      modal.querySelectorAll('[data-ptab]').forEach(b => b.classList.toggle('active', b.dataset.ptab===tab));
      if (tab === 'notas') {
        c.innerHTML = `<table><thead><tr><th>Materia</th>${periodos.map(p=>`<th>${p.nombre}</th>`).join('')}<th>Promedio Final</th><th>Estado</th></tr></thead>
          <tbody>${materias.map(m => {
            const promedios = periodos.map(p => DB.calcularPromedioPeriodo(id, m.id, p.id));
            const prom = DB.calcularPromedioFinal(id, m.id);
            const aprobado = prom !== null && prom >= config.escala.minAprobatorio;
            return `<tr>
              <td><div style="display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:${m.color}"></div><strong>${m.nombre}</strong></div></td>
              ${promedios.map(p => `<td style="font-weight:600;color:${p!==null?Utils.colorNota(p,config.escala.minAprobatorio):'var(--text-muted)'}">${p!==null?Utils.formatNota(p):'—'}</td>`).join('')}
              <td style="font-weight:800;font-size:16px;color:${prom!==null?Utils.colorNota(prom,config.escala.minAprobatorio):'var(--text-muted)'}">${prom!==null?Utils.formatNota(prom):'—'}</td>
              <td>${prom!==null ? (aprobado?'<span class="badge badge-success">✅ Aprobado</span>':'<span class="badge badge-danger">❌ Reprobado</span>') : '<span class="badge badge-neutral">Sin notas</span>'}</td>
            </tr>`;
          }).join('')}</tbody></table>`;
      } else if (tab === 'asistencia') {
        const registros = DB.getAsistenciaByEstudiante(id);
        const stats = { presente:0, ausente:0, tardanza:0, justificado:0 };
        registros.forEach(r => { if (stats[r.estado]!==undefined) stats[r.estado]++; });
        const total = registros.length;
        c.innerHTML = `<div class="attendance-stats-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
          ${['presente','ausente','tardanza','justificado'].map(s => {
            const cfg = Utils.estadoAsistenciaConfig(s);
            return `<div class="att-stat"><div class="att-num" style="color:${cfg.color}">${stats[s]}</div><div class="att-label">${cfg.icon} ${cfg.label}</div></div>`;
          }).join('')}
        </div>
        <div style="margin-top:12px">
          <div style="margin-bottom:8px;font-weight:600;font-size:13px;color:var(--text-muted)">Historial reciente</div>
          ${registros.slice(-20).reverse().map(r => {
            const m = DB.getMateria(r.materiaId);
            const cfg = Utils.estadoAsistenciaConfig(r.estado);
            return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-light);font-size:13px">
              <span>${cfg.icon}</span>
              <span style="min-width:100px">${Utils.formatFechaCorta(r.fecha)}</span>
              <span style="font-weight:600">${m?.nombre||'—'}</span>
              <span class="badge ${cfg.clase}">${cfg.label}</span>
              ${r.justificacion ? `<span style="color:var(--text-muted)">${r.justificacion}</span>` : ''}
            </div>`;
          }).join('') || '<p style="color:var(--text-muted);text-align:center;padding:20px">Sin registros de asistencia</p>'}
        </div>`;
      } else {
        c.innerHTML = `<div class="grid-2" style="gap:20px">
          <div class="card"><div class="card-body">
            <h4 style="margin-bottom:16px;color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:.5px">Datos Personales</h4>
            ${[['📋','Documento',`${est.tipoDoc||'TI'}: ${est.documento}`],['🎂','Nacimiento',Utils.formatFecha(est.fechaNacimiento)],
               ['📱','Teléfono',est.telefono],['🏠','Dirección',est.direccion],['📧','Email',est.email]]
               .map(([ico,lbl,val]) => `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-light);font-size:13px">
                  <span>${ico}</span><span style="color:var(--text-muted);min-width:90px">${lbl}:</span><strong>${val||'—'}</strong>
               </div>`).join('')}
          </div></div>
          <div class="card"><div class="card-body">
            <h4 style="margin-bottom:16px;color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:.5px">Datos del Acudiente</h4>
            ${est.acudiente ? [['👤','Nombre',est.acudiente.nombre],['👨‍👩‍👧','Parentesco',est.acudiente.parentesco],
               ['📱','Teléfono',est.acudiente.telefono],['📧','Email',est.acudiente.email]]
               .map(([ico,lbl,val]) => `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-light);font-size:13px">
                  <span>${ico}</span><span style="color:var(--text-muted);min-width:90px">${lbl}:</span><strong>${val||'—'}</strong>
               </div>`).join('') : '<p style="color:var(--text-muted)">Sin datos de acudiente</p>'}
          </div></div>
        </div>`;
      }
    };

    renderProfileTab('notas');
    modal.querySelectorAll('[data-ptab]').forEach(btn => btn.addEventListener('click', () => renderProfileTab(btn.dataset.ptab)));
  },

  openForm(id, session) {
    const est = id ? DB.getEstudiante(id) : null;
    const grados = DB.getGrados();
    const grupos = DB.getGrupos();
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content modal-lg">
        <div class="modal-header"><h3>${est ? 'Editar' : 'Nuevo'} Estudiante</h3><button class="modal-close">✕</button></div>
        <div class="modal-body">
          <form id="form-estudiante">
            <!-- Foto -->
            <div style="display:flex;justify-content:center;margin-bottom:24px">
              <div>
                <div class="photo-preview" id="photo-prev" onclick="document.getElementById('foto-input').click()">
                  ${est?.foto ? `<img src="${est.foto}" id="foto-img">` : `<span id="foto-icon">📷</span>`}
                </div>
                <input type="file" id="foto-input" accept="image/*" style="display:none">
                <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:6px">Clic para agregar foto</div>
              </div>
            </div>
            <!-- Datos personales -->
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">👤 Datos Personales</div>
            <div class="form-row col-2">
              <div class="form-group"><label>Nombre <span class="required">*</span></label><input class="form-control" name="nombre" value="${est?.nombre||''}" required></div>
              <div class="form-group"><label>Apellido <span class="required">*</span></label><input class="form-control" name="apellido" value="${est?.apellido||''}" required></div>
            </div>
            <div class="form-row col-3">
              <div class="form-group"><label>Tipo Documento</label>
                <select class="form-control" name="tipoDoc">
                  <option ${est?.tipoDoc==='TI'?'selected':''}>TI</option>
                  <option ${est?.tipoDoc==='CC'?'selected':''}>CC</option>
                  <option ${est?.tipoDoc==='PEP'?'selected':''}>PEP</option>
                </select>
              </div>
              <div class="form-group"><label>Número Documento <span class="required">*</span></label><input class="form-control" name="documento" value="${est?.documento||''}" required></div>
              <div class="form-group"><label>Fecha Nacimiento</label><input class="form-control" type="date" name="fechaNacimiento" value="${est?.fechaNacimiento||''}"></div>
            </div>
            <div class="form-row col-2">
              <div class="form-group"><label>Email</label><input class="form-control" type="email" name="email" value="${est?.email||''}"></div>
              <div class="form-group"><label>Teléfono</label><input class="form-control" name="telefono" value="${est?.telefono||''}"></div>
            </div>
            <div class="form-group"><label>Dirección</label><input class="form-control" name="direccion" value="${est?.direccion||''}"></div>
            
            <!-- Académico -->
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px">🎓 Información Académica</div>
            <div class="form-row col-2">
              <div class="form-group"><label>Grado <span class="required">*</span></label>
                <select class="form-control" name="gradoId" id="form-grado-sel" required>
                  <option value="">Seleccionar...</option>
                  ${grados.map(g=>`<option value="${g.id}" ${g.id===est?.gradoId?'selected':''}>${g.nombre}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label>Grupo <span class="required">*</span></label>
                <select class="form-control" name="grupoId" id="form-grupo-sel" required>
                  <option value="">Seleccionar...</option>
                  ${grupos.filter(g=>!est?.gradoId||g.gradoId===est?.gradoId).map(g=>`<option value="${g.id}" ${g.id===est?.grupoId?'selected':''}>${g.nombre}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Acudiente -->
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px">👨‍👩‍👧 Datos del Acudiente</div>
            <div class="form-row col-2">
              <div class="form-group"><label>Nombre del Acudiente</label><input class="form-control" name="acudiente_nombre" value="${est?.acudiente?.nombre||''}"></div>
              <div class="form-group"><label>Parentesco</label>
                <select class="form-control" name="acudiente_parentesco">
                  ${['Padre','Madre','Hermano/a','Abuelo/a','Tío/a','Tutor/a'].map(p=>`<option ${est?.acudiente?.parentesco===p?'selected':''}>${p}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row col-2">
              <div class="form-group"><label>Teléfono Acudiente</label><input class="form-control" name="acudiente_telefono" value="${est?.acudiente?.telefono||''}"></div>
              <div class="form-group"><label>Email Acudiente</label><input class="form-control" type="email" name="acudiente_email" value="${est?.acudiente?.email||''}"></div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close">Cancelar</button>
          <button class="btn btn-primary" id="save-est-btn">💾 Guardar Estudiante</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-overlay, .modal-close').forEach(el => el.addEventListener('click', () => { modal.remove(); document.body.style.overflow=''; }));

    // Grado → Grupos
    document.getElementById('form-grado-sel').addEventListener('change', e => {
      const gs = DB.getGruposByGrado(e.target.value);
      document.getElementById('form-grupo-sel').innerHTML = `<option value="">Seleccionar...</option>${gs.map(g=>`<option value="${g.id}">${g.nombre}</option>`).join('')}`;
    });

    // Foto preview
    let fotoData = est?.foto || null;
    let fotoFile = null;
    document.getElementById('foto-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      fotoFile = file;
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('photo-prev').innerHTML = `<img src="${ev.target.result}" id="foto-img">`;
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('save-est-btn').addEventListener('click', async () => {
      const form = document.getElementById('form-estudiante');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = Utils.serializeForm(form);

      // Subir foto a Supabase Storage si hay archivo nuevo
      if (fotoFile) {
        try {
          const tmpId = 'tmp_' + Date.now();
          fotoData = await Storage.uploadStudentPhoto(tmpId, fotoFile);
        } catch (err) { console.error('Upload error:', err); }
      }

      const estData = {
        nombre: data.nombre, apellido: data.apellido,
        documento: data.documento, tipoDoc: data.tipoDoc,
        fechaNacimiento: data.fechaNacimiento,
        gradoId: data.gradoId, grupoId: data.grupoId,
        email: data.email, telefono: data.telefono,
        direccion: data.direccion, foto: fotoData,
        acudiente: {
          nombre: data.acudiente_nombre,
          parentesco: data.acudiente_parentesco,
          telefono: data.acudiente_telefono,
          email: data.acudiente_email
        }
      };
      if (est) {
        await DB.updateEstudiante(id, estData);
        if (fotoFile && fotoData) {
          const newUrl = await Storage.uploadStudentPhoto(id, fotoFile);
          await DB.updateEstudiante(id, { foto: newUrl });
        }
        Utils.toast('Estudiante actualizado', 'success');
      } else {
        const newEst = await DB.addEstudiante(estData);
        if (fotoFile && fotoData) {
          const newUrl = await Storage.uploadStudentPhoto(newEst.id, fotoFile);
          await DB.updateEstudiante(newEst.id, { foto: newUrl });
        }
        Utils.toast('Estudiante registrado exitosamente', 'success');
      }
      modal.remove();
      document.body.style.overflow='';
      this.renderList(session);
    });
  },

  async eliminar(id) {
    const est = DB.getEstudiante(id);
    if (!await Utils.confirm(`¿Eliminar a ${Utils.nombreCompleto(est)}? Sus notas y asistencias se conservarán.`)) return;
    DB.deleteEstudiante(id);
    Utils.toast('Estudiante eliminado', 'warning');
    this.renderList(Auth.getSession());
  },

  exportarCSV() {
    const data = this.getData().map(e => {
      const grado = DB.getGrado(e.gradoId);
      const grupo = DB.getGrupo(e.grupoId);
      return {
        'Apellido': e.apellido, 'Nombre': e.nombre, 'Documento': e.documento,
        'Grado': grado?.nombre||'', 'Grupo': grupo?.nombre||'',
        'Email': e.email||'', 'Teléfono': e.telefono||'',
        'Acudiente': e.acudiente?.nombre||''
      };
    });
    Utils.exportarCSV(data, 'estudiantes_acadex');
    Utils.toast('Archivo exportado correctamente', 'success');
  },

  openImport(session) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header"><h3>📥 Importar Estudiantes</h3><button class="modal-close">✕</button></div>
        <div class="modal-body">
          <div class="import-steps">
            <div class="import-step active"><span class="import-step-num">1</span>Descargar plantilla</div>
            <div class="import-step"><span class="import-step-num">2</span>Completar datos</div>
            <div class="import-step"><span class="import-step-num">3</span>Subir archivo</div>
          </div>
          <div class="alert alert-info"><span class="alert-icon">ℹ️</span>
            <div class="alert-text"><strong>Formato requerido</strong>Las columnas deben ser: Apellido, Nombre, Documento, Grado, Grupo, Email, Teléfono, Acudiente</div>
          </div>
          <div class="file-drop-zone" id="import-zone">
            <div class="drop-icon">📄</div>
            <p>Arrastra tu archivo CSV aquí o <span onclick="document.getElementById('import-file').click()">haz clic para seleccionar</span></p>
            <p style="font-size:12px;margin-top:4px;color:var(--text-muted)">Formatos: .csv</p>
            <input type="file" id="import-file" accept=".csv" style="display:none">
          </div>
          <div id="import-preview" style="margin-top:16px"></div>
          <button class="btn btn-outline btn-sm" style="margin-top:12px" onclick="Students.descargarPlantilla()">⬇️ Descargar plantilla CSV</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close">Cancelar</button>
          <button class="btn btn-primary" id="btn-do-import" disabled>📥 Importar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-overlay, .modal-close').forEach(el => el.addEventListener('click', () => { modal.remove(); document.body.style.overflow=''; }));

    let importData = [];
    const processFile = (file) => {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
        importData = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
          const obj = {};
          headers.forEach((h,i) => obj[h] = vals[i]||'');
          return obj;
        }).filter(r => r['Nombre']);
        document.getElementById('import-preview').innerHTML = `
          <div class="alert alert-success"><span>✅</span><div><strong>${importData.length} registros detectados</strong></div></div>
          <div style="max-height:200px;overflow-y:auto;font-size:12px">${importData.slice(0,5).map(r=>
            `<div style="padding:4px 0;border-bottom:1px solid var(--gray-light)">${r['Apellido']||''}, ${r['Nombre']||''} — ${r['Grado']||''} ${r['Grupo']||''}</div>`
          ).join('')}${importData.length>5?`<div style="padding:4px 0;color:var(--text-muted)">...y ${importData.length-5} más</div>`:''}</div>`;
        document.getElementById('btn-do-import').disabled = false;
      };
      reader.readAsText(file);
    };

    document.getElementById('import-file').addEventListener('change', e => { if(e.target.files[0]) processFile(e.target.files[0]); });
    document.getElementById('import-zone').addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); });
    document.getElementById('import-zone').addEventListener('dragleave', e => { e.currentTarget.classList.remove('drag-over'); });
    document.getElementById('import-zone').addEventListener('drop', e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); });

    document.getElementById('btn-do-import').addEventListener('click', () => {
      const grados = DB.getGrados();
      const grupos = DB.getGrupos();
      let added = 0;
      importData.forEach(r => {
        const grado = grados.find(g => g.nombre.replace('°','') === r['Grado'].replace('°',''));
        const grupo = grupos.find(g => g.nombre === r['Grupo']);
        DB.addEstudiante({
          nombre: r['Nombre'], apellido: r['Apellido'],
          documento: r['Documento']||'', tipoDoc: 'TI',
          gradoId: grado?.id||'', grupoId: grupo?.id||'',
          email: r['Email']||'', telefono: r['Teléfono']||'',
          acudiente: { nombre: r['Acudiente']||'', parentesco: 'Tutor/a', telefono: '', email: '' },
          foto: null, direccion: '', fechaNacimiento: ''
        });
        added++;
      });
      modal.remove();
      document.body.style.overflow='';
      Utils.toast(`${added} estudiantes importados exitosamente`, 'success');
      this.renderList(session);
    });
  },

  descargarPlantilla() {
    Utils.exportarCSV([
      { 'Apellido':'García','Nombre':'Juan','Documento':'1001234567','Grado':'10°','Grupo':'10A','Email':'juan@email.com','Teléfono':'3001234567','Acudiente':'María García' }
    ], 'plantilla_estudiantes');
  }
};

window.Students = Students;
