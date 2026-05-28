// ============================================================
// ACADEX — Módulo Asistencia
// ============================================================

const Attendance = {
  selectedGrupo: null,
  selectedMateria: null,
  selectedFecha: null,
  activeTab: 'pasar',

  render(container, session) {
    this.session = session;
    const grupos = session.rol === 'docente'
      ? DB.getGrupos().filter(g => {
          const mats = DB.getMateriasByDocente(session.userId);
          return mats.some(m => m.gradoId === g.gradoId);
        })
      : DB.getGrupos();
    const materias = session.rol === 'docente'
      ? DB.getMateriasByDocente(session.userId)
      : DB.getMaterias();

    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">✅</span> Control de Asistencia</h2>
        </div>
        <div class="tabs">
          <button class="tab-btn ${this.activeTab==='pasar'?'active':''}" data-tab="pasar">📋 Pasar Lista</button>
          <button class="tab-btn ${this.activeTab==='reporte'?'active':''}" data-tab="reporte">📊 Reportes</button>
          <button class="tab-btn ${this.activeTab==='calendario'?'active':''}" data-tab="calendario">📅 Calendario</button>
        </div>

        <!-- Selector -->
        <div class="card" style="margin-bottom:20px">
          <div class="card-body" style="padding:16px">
            <div class="attendance-header">
              <div class="form-group">
                <label>Grupo</label>
                <select class="form-control" id="att-grupo">
                  <option value="">Seleccionar grupo...</option>
                  ${grupos.map(g=>`<option value="${g.id}" ${g.id===this.selectedGrupo?'selected':''}>${g.nombre} (${DB.getGrado(g.gradoId)?.nombre||''})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Materia</label>
                <select class="form-control" id="att-materia">
                  <option value="">Seleccionar materia...</option>
                  ${materias.map(m=>`<option value="${m.id}" ${m.id===this.selectedMateria?'selected':''}>${m.nombre}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Fecha</label>
                <input type="date" class="form-control" id="att-fecha" value="${this.selectedFecha||Utils.hoy()}">
              </div>
              <button class="btn btn-primary" id="btn-cargar-asist">📋 Cargar Lista</button>
            </div>
          </div>
        </div>

        <div id="attendance-content"></div>
      </div>`;

    // Restore
    if (this.selectedGrupo) document.getElementById('att-grupo').value = this.selectedGrupo;
    if (this.selectedMateria) document.getElementById('att-materia').value = this.selectedMateria;
    if (!this.selectedFecha) this.selectedFecha = Utils.hoy();

    document.getElementById('btn-cargar-asist').addEventListener('click', () => {
      this.selectedGrupo   = document.getElementById('att-grupo').value;
      this.selectedMateria = document.getElementById('att-materia').value;
      this.selectedFecha   = document.getElementById('att-fecha').value;
      if (!this.selectedGrupo || !this.selectedMateria) {
        Utils.toast('Selecciona grupo y materia', 'warning');
        return;
      }
      this.renderTab(this.activeTab);
    });

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.renderTab(this.activeTab);
      });
    });

    if (this.selectedGrupo && this.selectedMateria) this.renderTab(this.activeTab);
  },

  renderTab(tab) {
    const content = document.getElementById('attendance-content');
    if (!content) return;
    switch(tab) {
      case 'pasar':      this.renderPasarLista(content); break;
      case 'reporte':    this.renderReporte(content); break;
      case 'calendario': this.renderCalendario(content); break;
    }
  },

  renderPasarLista(content) {
    if (!this.selectedGrupo || !this.selectedMateria) {
      content.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><h3>Selecciona grupo y materia</h3><p>Usa el selector de arriba para cargar la lista</p></div>';
      return;
    }
    const estudiantes = DB.getEstudiantesByGrupo(this.selectedGrupo);
    const materia = DB.getMateria(this.selectedMateria);
    const grupo = DB.getGrupo(this.selectedGrupo);
    const fecha = this.selectedFecha;

    // Cargar asistencia existente
    const asistExistente = DB.getAsistenciaByFechaGrupoMateria(fecha, this.selectedGrupo, this.selectedMateria);
    const asistMap = {};
    asistExistente.forEach(a => { asistMap[a.estudianteId] = a; });

    // Estadísticas del día
    const presente = Object.values(asistMap).filter(a=>a.estado==='presente').length;
    const ausente  = Object.values(asistMap).filter(a=>a.estado==='ausente').length;
    const tardanza = Object.values(asistMap).filter(a=>a.estado==='tardanza').length;
    const justificado = Object.values(asistMap).filter(a=>a.estado==='justificado').length;

    content.innerHTML = `
      <div class="animate-fadeIn">
        <!-- Stats rápidas -->
        <div class="attendance-stats-row" style="margin-bottom:20px">
          <div class="att-stat"><div class="att-num" style="color:var(--success)">${presente}</div><div class="att-label">✅ Presentes</div></div>
          <div class="att-stat"><div class="att-num" style="color:var(--danger)">${ausente}</div><div class="att-label">❌ Ausentes</div></div>
          <div class="att-stat"><div class="att-num" style="color:var(--warning)">${tardanza}</div><div class="att-label">⏰ Tardanzas</div></div>
          <div class="att-stat"><div class="att-num" style="color:var(--info)">${justificado}</div><div class="att-label">📄 Justificados</div></div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3>📋 Lista: ${grupo?.nombre} · ${materia?.nombre}</h3>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${Utils.formatFecha(fecha)} · ${estudiantes.length} estudiantes</div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-outline btn-sm" id="btn-todos-presente">✅ Todos Presentes</button>
              <button class="btn btn-accent btn-sm" id="btn-guardar-asist">💾 Guardar Asistencia</button>
            </div>
          </div>
          <table>
            <thead><tr>
              <th>#</th><th>Estudiante</th>
              <th style="text-align:center">✅ Presente</th>
              <th style="text-align:center">❌ Ausente</th>
              <th style="text-align:center">⏰ Tardanza</th>
              <th style="text-align:center">📄 Justificado</th>
              <th>Observación</th>
            </tr></thead>
            <tbody>
              ${estudiantes.map((e, idx) => {
                const a = asistMap[e.id];
                const estado = a?.estado || 'presente';
                const justif = a?.justificacion || '';
                const color = Utils.colorFromString(e.nombre + e.apellido);
                return `<tr id="att-row-${e.id}" data-est-id="${e.id}" data-estado="${estado}">
                  <td style="color:var(--text-muted);font-weight:700">${String(idx+1).padStart(2,'0')}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="avatar" style="background:${color}">${Utils.avatarInitials(e.nombre,e.apellido)}</div>
                      <div>
                        <div style="font-weight:700">${e.apellido}, ${e.nombre}</div>
                        <div style="font-size:11px;color:var(--text-muted)">${e.documento||''}</div>
                      </div>
                    </div>
                  </td>
                  ${['presente','ausente','tardanza','justificado'].map(s => {
                    const cfg = Utils.estadoAsistenciaConfig(s);
                    return `<td style="text-align:center">
                      <input type="radio" name="att-${e.id}" value="${s}" ${estado===s?'checked':''}
                        class="att-radio" data-est="${e.id}" data-estado="${s}"
                        onchange="Attendance.onEstadoChange('${e.id}', '${s}')"
                        style="width:18px;height:18px;accent-color:${cfg.color};cursor:pointer">
                    </td>`;
                  }).join('')}
                  <td>
                    <input type="text" class="form-control justif-input" placeholder="${estado==='justificado'?'Motivo requerido...':'Observación...'}"
                      id="justif-${e.id}" value="${justif}" style="padding:6px 10px;font-size:12px"
                      ${estado==='ausente'||estado==='justificado'?'':'style="opacity:.5"'}>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    document.getElementById('btn-todos-presente').addEventListener('click', () => {
      document.querySelectorAll('.att-radio[data-estado="presente"]').forEach(r => {
        r.checked = true;
        this.onEstadoChange(r.dataset.est, 'presente');
      });
    });

    document.getElementById('btn-guardar-asist').addEventListener('click', () => this.guardarAsistencia(estudiantes));
  },

  onEstadoChange(estId, estado) {
    const row = document.getElementById(`att-row-${estId}`);
    if (!row) return;
    row.dataset.estado = estado;
    const justifInput = document.getElementById(`justif-${estId}`);
    if (justifInput) {
      justifInput.placeholder = estado === 'justificado' ? 'Motivo requerido...' : 'Observación...';
      justifInput.style.opacity = (estado === 'ausente' || estado === 'justificado') ? '1' : '0.6';
    }
    // Update row background
    row.style.background = estado === 'presente' ? 'rgba(46,204,113,.04)' :
                           estado === 'ausente' ? 'rgba(231,76,60,.04)' :
                           estado === 'tardanza' ? 'rgba(243,156,18,.04)' :
                           estado === 'justificado' ? 'rgba(52,152,219,.04)' : '';
  },

  guardarAsistencia(estudiantes) {
    let guardados = 0;
    estudiantes.forEach(e => {
      const row = document.getElementById(`att-row-${e.id}`);
      if (!row) return;
      const estado = row.dataset.estado || 'presente';
      const justificacion = document.getElementById(`justif-${e.id}`)?.value || null;
      DB.setAsistencia(e.id, this.selectedMateria, this.selectedGrupo, this.selectedFecha, estado, justificacion);
      guardados++;
      // Alerta si ausente
      if (estado === 'ausente') {
        const materia = DB.getMateria(this.selectedMateria);
        DB.addNotificacion({ tipo: 'asistencia', mensaje: `${Utils.nombreCompleto(e)} faltó a ${materia?.nombre||'clase'} el ${Utils.formatFechaCorta(this.selectedFecha)}. Se notificará al acudiente.`, usuarioId: this.session.userId });
      }
    });
    Utils.toast(`Asistencia guardada para ${guardados} estudiantes`, 'success');
    App.updateNotifBadge(Auth.getSession());
    // Re-render stats
    this.renderPasarLista(document.getElementById('attendance-content'));
  },

  renderReporte(content) {
    const estudiantes = this.selectedGrupo ? DB.getEstudiantesByGrupo(this.selectedGrupo) : DB.getEstudiantes().filter(e=>e.activo);
    const grupo = this.selectedGrupo ? DB.getGrupo(this.selectedGrupo) : null;
    const materia = this.selectedMateria ? DB.getMateria(this.selectedMateria) : null;

    content.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header" style="margin-bottom:20px">
          <h3>📊 Reporte de Asistencia ${grupo ? `· ${grupo.nombre}` : ''} ${materia ? `· ${materia.nombre}` : ''}</h3>
          <button class="btn btn-outline btn-sm" id="btn-export-asist">📤 Exportar</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Estudiante</th><th>Grado/Grupo</th>
              <th style="text-align:center">✅ Presentes</th>
              <th style="text-align:center">❌ Ausentes</th>
              <th style="text-align:center">⏰ Tardanzas</th>
              <th style="text-align:center">📄 Justificados</th>
              <th style="text-align:center">% Asistencia</th>
              <th>Estado</th>
            </tr></thead>
            <tbody>
              ${estudiantes.map(e => {
                const reg = this.selectedMateria
                  ? DB.getAsistenciaByEstudiante(e.id).filter(a => a.materiaId === this.selectedMateria)
                  : DB.getAsistenciaByEstudiante(e.id);
                const stats = { presente:0, ausente:0, tardanza:0, justificado:0 };
                reg.forEach(r => { if(stats[r.estado]!==undefined) stats[r.estado]++; });
                const total = reg.length;
                const pct = total > 0 ? Math.round(((stats.presente + stats.justificado) / total) * 100) : 100;
                const grado = DB.getGrado(e.gradoId);
                const grupo = DB.getGrupo(e.grupoId);
                const color = Utils.colorFromString(e.nombre + e.apellido);
                return `<tr>
                  <td><div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar" style="background:${color}">${Utils.avatarInitials(e.nombre,e.apellido)}</div>
                    <span style="font-weight:700">${e.apellido}, ${e.nombre}</span>
                  </div></td>
                  <td>${grado?.nombre||'—'} · ${grupo?.nombre||'—'}</td>
                  <td style="text-align:center;color:var(--success);font-weight:700">${stats.presente}</td>
                  <td style="text-align:center;color:var(--danger);font-weight:700">${stats.ausente}</td>
                  <td style="text-align:center;color:var(--warning);font-weight:700">${stats.tardanza}</td>
                  <td style="text-align:center;color:var(--info);font-weight:700">${stats.justificado}</td>
                  <td style="text-align:center">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                      <strong style="color:${Utils.colorAsistencia(pct)};font-size:16px">${pct}%</strong>
                      <div class="progress-bar-wrapper" style="width:80px"><div class="progress-bar" style="width:${pct}%;background:${Utils.colorAsistencia(pct)}"></div></div>
                    </div>
                  </td>
                  <td>${pct >= 80 ? '<span class="badge badge-success">Normal</span>' : pct >= 70 ? '<span class="badge badge-warning">Alerta</span>' : '<span class="badge badge-danger">Crítico</span>'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    document.getElementById('btn-export-asist')?.addEventListener('click', () => {
      const data = estudiantes.map(e => {
        const reg = this.selectedMateria
          ? DB.getAsistenciaByEstudiante(e.id).filter(a => a.materiaId === this.selectedMateria)
          : DB.getAsistenciaByEstudiante(e.id);
        const stats = { presente:0, ausente:0, tardanza:0, justificado:0 };
        reg.forEach(r => { if(stats[r.estado]!==undefined) stats[r.estado]++; });
        const total = reg.length;
        const pct = total > 0 ? Math.round(((stats.presente + stats.justificado) / total) * 100) : 100;
        const grado = DB.getGrado(e.gradoId);
        const grupo = DB.getGrupo(e.grupoId);
        return {
          'Apellido': e.apellido, 'Nombre': e.nombre, 'Documento': e.documento,
          'Grado': grado?.nombre||'', 'Grupo': grupo?.nombre||'',
          'Presentes': stats.presente, 'Ausentes': stats.ausente,
          'Tardanzas': stats.tardanza, 'Justificados': stats.justificado,
          '% Asistencia': pct
        };
      });
      Utils.exportarCSV(data, 'reporte_asistencia');
      Utils.toast('Reporte exportado', 'success');
    });
  },

  renderCalendario(content) {
    const estudiantes = this.selectedGrupo ? DB.getEstudiantesByGrupo(this.selectedGrupo) : DB.getEstudiantes().filter(e=>e.activo).slice(0, 10);
    if (!estudiantes.length) {
      content.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><h3>Selecciona un grupo</h3><p>Carga un grupo para ver el calendario</p></div>';
      return;
    }

    // Obtener todas las fechas únicas
    const allRegistros = DB.getAsistencia();
    const fechasSet = new Set();
    allRegistros.filter(a => {
      if (this.selectedMateria && a.materiaId !== this.selectedMateria) return false;
      return true;
    }).forEach(a => fechasSet.add(a.fecha));
    const fechas = Array.from(fechasSet).sort();

    content.innerHTML = `
      <div class="card animate-fadeIn">
        <div class="card-header">
          <h3>📅 Calendario de Asistencia</h3>
          <div style="display:flex;gap:12px;font-size:12px;align-items:center">
            ${['presente','ausente','tardanza','justificado'].map(s => {
              const cfg = Utils.estadoAsistenciaConfig(s);
              return `<span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:${cfg.color};display:inline-block"></span>${cfg.label}</span>`;
            }).join('')}
          </div>
        </div>
        <div style="overflow-x:auto;padding:20px">
          ${!fechas.length ? '<p style="text-align:center;color:var(--text-muted);padding:30px">No hay registros de asistencia</p>' : `
          <table style="min-width:100%">
            <thead><tr>
              <th style="min-width:160px">Estudiante</th>
              ${fechas.map(f=>`<th style="text-align:center;font-size:11px;min-width:36px">${Utils.formatFechaCorta(f).split('/').slice(0,2).join('/')}</th>`).join('')}
              <th style="text-align:center">%</th>
            </tr></thead>
            <tbody>
              ${estudiantes.map(e => {
                const regEst = allRegistros.filter(a => a.estudianteId === e.id && (!this.selectedMateria || a.materiaId === this.selectedMateria));
                const regMap = {};
                regEst.forEach(a => { regMap[a.fecha] = a.estado; });
                const total = fechas.length;
                const presentes = fechas.filter(f => regMap[f]==='presente'||regMap[f]==='justificado').length;
                const pct = total > 0 ? Math.round((presentes/total)*100) : 100;
                const color = Utils.colorFromString(e.nombre + e.apellido);
                return `<tr>
                  <td><div style="display:flex;align-items:center;gap:8px;white-space:nowrap">
                    <div class="avatar" style="background:${color};width:28px;height:28px;font-size:11px">${Utils.avatarInitials(e.nombre,e.apellido)}</div>
                    <span style="font-size:13px;font-weight:600">${e.apellido}, ${e.nombre}</span>
                  </div></td>
                  ${fechas.map(f => {
                    const estado = regMap[f];
                    if (!estado) return '<td style="text-align:center"><span style="color:var(--text-muted);font-size:12px">—</span></td>';
                    const cfg = Utils.estadoAsistenciaConfig(estado);
                    return `<td style="text-align:center"><div class="cal-cell ${estado}" data-tooltip="${cfg.label}: ${Utils.formatFechaCorta(f)}" style="margin:0 auto"></div></td>`;
                  }).join('')}
                  <td style="text-align:center;font-weight:800;color:${Utils.colorAsistencia(pct)}">${pct}%</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`}
        </div>
      </div>`;
  }
};

window.Attendance = Attendance;
