// ============================================================
// ACADEX — Módulo Gestión de Notas
// ============================================================

const Grades = {
  selectedGrupo: null,
  selectedMateria: null,
  selectedPeriodo: null,
  activeTab: 'registro', // 'registro' | 'actividades' | 'estadisticas'

  render(container, session) {
    this.session = session;
    const periodos = DB.getPeriodos();
    const periodoActivo = DB.getPeriodoActivo();
    const materias = session.rol === 'docente'
      ? DB.getMateriasByDocente(session.userId)
      : DB.getMaterias();
    const grupos = DB.getGrupos();
    const config = DB.getConfig();

    // Si es estudiante, mostrar sus notas directamente
    if (session.rol === 'estudiante') {
      this.renderEstudianteView(container, session, config, periodos, materias);
      return;
    }

    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">📝</span> Gestión de Notas</h2>
        </div>
        <div class="tabs">
          <button class="tab-btn ${this.activeTab==='registro'?'active':''}" data-tab="registro">📝 Registro de Notas</button>
          <button class="tab-btn ${this.activeTab==='actividades'?'active':''}" data-tab="actividades">📋 Actividades</button>
          <button class="tab-btn ${this.activeTab==='estadisticas'?'active':''}" data-tab="estadisticas">📊 Estadísticas</button>
        </div>

        <!-- Selector de contexto -->
        <div class="card" style="margin-bottom:20px">
          <div class="card-body" style="padding:16px">
            <div class="notas-selector">
              <div class="form-group">
                <label>Período</label>
                <select class="form-control" id="sel-periodo">
                  <option value="">Seleccionar período...</option>
                  ${periodos.map(p=>`<option value="${p.id}" ${(p.id===(this.selectedPeriodo||periodoActivo?.id))?'selected':''}>${p.nombre}${p.activo?' (Activo)':''}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Materia</label>
                <select class="form-control" id="sel-materia">
                  <option value="">Seleccionar materia...</option>
                  ${materias.map(m=>`<option value="${m.id}" ${m.id===this.selectedMateria?'selected':''}>${m.nombre} (${DB.getGrado(m.gradoId)?.nombre||''})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Grupo</label>
                <select class="form-control" id="sel-grupo">
                  <option value="">Seleccionar grupo...</option>
                  ${grupos.map(g=>`<option value="${g.id}" ${g.id===this.selectedGrupo?'selected':''}>${g.nombre} (${DB.getGrado(g.gradoId)?.nombre||''})</option>`).join('')}
                </select>
              </div>
              <button class="btn btn-primary" id="btn-cargar-notas">📋 Cargar Lista</button>
            </div>
          </div>
        </div>

        <div id="notas-content"></div>
      </div>`;

    // Restore selections
    if (this.selectedPeriodo) document.getElementById('sel-periodo').value = this.selectedPeriodo;
    if (this.selectedMateria) document.getElementById('sel-materia').value = this.selectedMateria;
    if (this.selectedGrupo) document.getElementById('sel-grupo').value = this.selectedGrupo;

    document.getElementById('btn-cargar-notas').addEventListener('click', () => {
      this.selectedPeriodo = document.getElementById('sel-periodo').value;
      this.selectedMateria = document.getElementById('sel-materia').value;
      this.selectedGrupo   = document.getElementById('sel-grupo').value;
      if (!this.selectedPeriodo || !this.selectedMateria || !this.selectedGrupo) {
        Utils.toast('Selecciona período, materia y grupo', 'warning');
        return;
      }
      this.renderNotasTable();
    });

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        if (this.activeTab !== 'registro') {
          this.renderTab(btn.dataset.tab, session);
        } else if (this.selectedPeriodo && this.selectedMateria && this.selectedGrupo) {
          this.renderNotasTable();
        }
      });
    });

    // Auto-load if selection exists
    if (this.selectedPeriodo && this.selectedMateria && this.selectedGrupo) {
      this.renderNotasTable();
    } else if (periodoActivo) {
      document.getElementById('sel-periodo').value = periodoActivo.id;
      this.selectedPeriodo = periodoActivo.id;
    }
  },

  renderEstudianteView(container, session, config, periodos, materias) {
    const user = DB.getUsuario(session.userId);
    const estId = user?.estudianteId;
    if (!estId) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><h3>Sin datos</h3><p>No se encontró información de estudiante</p></div>';
      return;
    }
    const est = DB.getEstudiante(estId);
    if (!est) { container.innerHTML = '<div class="empty-state"><h3>Estudiante no encontrado</h3></div>'; return; }
    const missMaterias = DB.getMateriasByGrado(est.gradoId);

    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header"><h2><span class="section-icon">📝</span> Mis Notas</h2></div>
        <table><thead><tr>
          <th>Materia</th>${periodos.map(p=>`<th>${p.nombre}</th>`).join('')}<th>Promedio Final</th><th>Estado</th>
        </tr></thead><tbody>
        ${missMaterias.map(m => {
          const proms = periodos.map(p => DB.calcularPromedioPeriodo(estId, m.id, p.id));
          const pf = DB.calcularPromedioFinal(estId, m.id);
          const aprobado = pf !== null && pf >= config.escala.minAprobatorio;
          return `<tr>
            <td><div style="display:flex;align-items:center;gap:8px"><div style="width:10px;height:10px;border-radius:50%;background:${m.color}"></div><strong>${m.nombre}</strong></div></td>
            ${proms.map(p=>`<td style="font-weight:700;color:${p!==null?Utils.colorNota(p,config.escala.minAprobatorio):'var(--text-muted)'}">${p!==null?Utils.formatNota(p):'—'}</td>`).join('')}
            <td style="font-size:18px;font-weight:800;color:${pf!==null?Utils.colorNota(pf,config.escala.minAprobatorio):'var(--text-muted)'}">${pf!==null?Utils.formatNota(pf):'—'}</td>
            <td>${pf!==null?(aprobado?'<span class="badge badge-success">✅ Aprobado</span>':'<span class="badge badge-danger">❌ Reprobado</span>'):'<span class="badge badge-neutral">Sin notas</span>'}</td>
          </tr>`;
        }).join('')}
        </tbody></table>
      </div>`;
  },

  renderNotasTable() {
    const content = document.getElementById('notas-content');
    if (!content) return;
    const config = DB.getConfig();
    const estudiantes = DB.getEstudiantesByGrupo(this.selectedGrupo);
    const materia = DB.getMateria(this.selectedMateria);
    const periodo = DB.getPeriodo(this.selectedPeriodo);
    const tiposActividad = config.tiposActividad;

    if (!estudiantes.length) {
      content.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><h3>Sin estudiantes</h3><p>El grupo seleccionado no tiene estudiantes registrados</p></div>';
      return;
    }

    // Notas actuales
    const notasData = {};
    estudiantes.forEach(e => {
      const notas = DB.getNotasByEstudianteMateriaPeriodo(e.id, this.selectedMateria, this.selectedPeriodo);
      notasData[e.id] = {};
      tiposActividad.forEach(t => {
        const ns = notas.filter(n => n.tipo === t.id);
        notasData[e.id][t.id] = ns.length ? ns[ns.length - 1] : null;
      });
    });

    const calcProm = (eId) => DB.calcularPromedioPeriodo(eId, this.selectedMateria, this.selectedPeriodo);

    content.innerHTML = `
      <div class="card animate-fadeIn">
        <div class="card-header">
          <h3>📝 ${materia?.nombre||'Materia'} · ${periodo?.nombre||'Período'}</h3>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline btn-sm" id="btn-add-nota">+ Agregar Actividad</button>
            <button class="btn btn-accent btn-sm" id="btn-save-notas">💾 Guardar Cambios</button>
            <button class="btn btn-outline btn-sm" id="btn-export-notas">📤 Exportar</button>
          </div>
        </div>
        <!-- Config porcentajes -->
        <div style="padding:12px 20px;background:var(--gray-light);border-bottom:1px solid var(--gray);display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Ponderaciones:</span>
          ${tiposActividad.map(t=>`<span style="font-size:12px;display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:${t.color};display:inline-block"></span>${t.nombre}: <strong>${t.porcentaje}%</strong></span>`).join('')}
          <span style="margin-left:auto;font-size:12px;color:var(--text-muted)">Nota mínima: <strong>${config.escala.minAprobatorio}</strong></span>
        </div>
        <div class="grade-table-wrap">
          <table id="notas-table">
            <thead>
              <tr>
                <th style="min-width:180px">Estudiante</th>
                ${tiposActividad.map(t=>`<th style="text-align:center"><div style="color:${t.color}">${t.nombre}</div><div class="pct-badge">${t.porcentaje}%</div></th>`).join('')}
                <th style="text-align:center;min-width:100px">Promedio</th>
                <th style="text-align:center">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${estudiantes.map((e, idx) => {
                const prom = calcProm(e.id);
                const aprobado = prom !== null && prom >= config.escala.minAprobatorio;
                const color = Utils.colorFromString(e.nombre + e.apellido);
                return `<tr data-est-id="${e.id}">
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="avatar" style="background:${color}">${Utils.avatarInitials(e.nombre,e.apellido)}</div>
                      <div>
                        <div style="font-weight:700;font-size:13px">${e.apellido}, ${e.nombre}</div>
                        <div style="font-size:11px;color:var(--text-muted)">${e.documento||''}</div>
                      </div>
                    </div>
                  </td>
                  ${tiposActividad.map(t => {
                    const nota = notasData[e.id][t.id];
                    const val = nota ? nota.valor : '';
                    const clss = nota ? (nota.valor >= config.escala.minAprobatorio ? 'nota-alta' : nota.valor >= config.escala.minAprobatorio - 1.5 ? 'nota-media' : 'nota-baja') : '';
                    return `<td style="text-align:center">
                      <input type="number" class="nota-input ${clss}" 
                        data-tipo="${t.id}" data-est="${e.id}"
                        value="${val}" placeholder="—" 
                        min="${config.escala.min}" max="${config.escala.max}" step="0.1"
                        onchange="Grades.onNotaChange(this, ${config.escala.minAprobatorio})">
                    </td>`;
                  }).join('')}
                  <td style="text-align:center">
                    <span class="prom-cell" style="font-size:18px;font-weight:800;color:${prom!==null?Utils.colorNota(prom,config.escala.minAprobatorio):'var(--text-muted)'}">${prom!==null?Utils.formatNota(prom):'—'}</span>
                  </td>
                  <td style="text-align:center">
                    <span class="estado-cell">${prom!==null?(aprobado?'<span class="badge badge-success">✅</span>':'<span class="badge badge-danger">❌</span>'):'<span class="badge badge-neutral">—</span>'}</span>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
            <!-- Resumen -->
            <tfoot>
              <tr class="grade-summary-row">
                <td><strong>📊 Promedio del Grupo</strong></td>
                ${tiposActividad.map(t => {
                  const vals = estudiantes.map(e => { const n = notasData[e.id][t.id]; return n ? n.valor : null; }).filter(v=>v!==null);
                  const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
                  return `<td style="text-align:center;font-weight:800">${avg!==null?Utils.formatNota(avg):'—'}</td>`;
                }).join('')}
                <td colspan="2" style="text-align:center;font-weight:800">
                  ${(() => {
                    const proms = estudiantes.map(e => calcProm(e.id)).filter(p=>p!==null);
                    const avg = proms.length ? proms.reduce((a,b)=>a+b,0)/proms.length : null;
                    return avg !== null ? Utils.formatNota(avg) : '—';
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;

    // Guardar notas
    document.getElementById('btn-save-notas').addEventListener('click', () => this.guardarNotas(config));
    document.getElementById('btn-add-nota').addEventListener('click', () => this.openAddActividad(config));
    document.getElementById('btn-export-notas').addEventListener('click', () => this.exportarNotas(estudiantes, tiposActividad, config, materia, periodo));
  },

  onNotaChange(input, minAprobatorio) {
    const val = parseFloat(input.value);
    input.classList.remove('nota-alta','nota-media','nota-baja');
    if (!isNaN(val)) {
      if (val >= minAprobatorio) input.classList.add('nota-alta');
      else if (val >= minAprobatorio - 1.5) input.classList.add('nota-media');
      else input.classList.add('nota-baja');
    }
    // Recalcular promedio de la fila
    const row = input.closest('tr');
    const estId = row.dataset.estId;
    const config = DB.getConfig();
    const tiposActividad = config.tiposActividad;
    // Collect current values from inputs (not yet saved)
    const tempNotas = {};
    row.querySelectorAll('.nota-input').forEach(inp => {
      const tipo = inp.dataset.tipo;
      const v = parseFloat(inp.value);
      if (!isNaN(v)) tempNotas[tipo] = v;
    });
    let sumaP = 0, totalP = 0;
    tiposActividad.forEach(t => {
      if (tempNotas[t.id] !== undefined) {
        sumaP += tempNotas[t.id] * (t.porcentaje / 100);
        totalP += t.porcentaje / 100;
      }
    });
    const prom = totalP > 0 ? Math.round((sumaP / totalP) * 100) / 100 : null;
    row.querySelector('.prom-cell').textContent = prom !== null ? Utils.formatNota(prom) : '—';
    row.querySelector('.prom-cell').style.color = prom !== null ? Utils.colorNota(prom, config.escala.minAprobatorio) : 'var(--text-muted)';
    const aprobado = prom !== null && prom >= config.escala.minAprobatorio;
    row.querySelector('.estado-cell').innerHTML = prom !== null ? (aprobado ? '<span class="badge badge-success">✅</span>' : '<span class="badge badge-danger">❌</span>') : '<span class="badge badge-neutral">—</span>';
  },

  guardarNotas(config) {
    const inputs = document.querySelectorAll('#notas-table .nota-input');
    let saved = 0;
    inputs.forEach(input => {
      const val = parseFloat(input.value);
      if (isNaN(val) || input.value === '') return;
      const estId = input.dataset.est;
      const tipo = input.dataset.tipo;
      // Check if exists
      const existing = DB.getNotasByEstudianteMateriaPeriodo(estId, this.selectedMateria, this.selectedPeriodo)
        .find(n => n.tipo === tipo);
      if (existing) {
        DB.updateNota(existing.id, { valor: val });
      } else {
        DB.addNota({
          estudianteId: estId, materiaId: this.selectedMateria,
          periodoId: this.selectedPeriodo, tipo, valor: val,
          descripcion: '', fecha: Utils.hoy(), docenteId: this.session.userId
        });
      }
      saved++;
    });
    Utils.toast(`${saved} notas guardadas correctamente`, 'success');
    // Check for risk students
    const estudiantes = DB.getEstudiantesByGrupo(this.selectedGrupo);
    estudiantes.forEach(est => {
      const prom = DB.calcularPromedioPeriodo(est.id, this.selectedMateria, this.selectedPeriodo);
      if (prom !== null && prom < config.escala.minAprobatorio) {
        DB.addNotificacion({ tipo: 'alerta', mensaje: `${Utils.nombreCompleto(est)} tiene promedio bajo en ${DB.getMateria(this.selectedMateria)?.nombre} (${Utils.formatNota(prom)})`, usuarioId: this.session.userId });
      }
    });
    App.updateNotifBadge(Auth.getSession());
  },

  openAddActividad(config) {
    const tiposActividad = config.tiposActividad;
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content modal-sm">
        <div class="modal-header"><h3>+ Agregar Nota Individual</h3><button class="modal-close">✕</button></div>
        <div class="modal-body">
          <form id="form-nota">
            <div class="form-group"><label>Estudiante</label>
              <select class="form-control" name="estudianteId" required>
                <option value="">Seleccionar...</option>
                ${DB.getEstudiantesByGrupo(this.selectedGrupo).map(e=>`<option value="${e.id}">${e.apellido}, ${e.nombre}</option>`).join('')}
              </select>
            </div>
            <div class="form-row col-2">
              <div class="form-group"><label>Tipo de Actividad</label>
                <select class="form-control" name="tipo" required>
                  ${tiposActividad.map(t=>`<option value="${t.id}">${t.nombre} (${t.porcentaje}%)</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label>Valor (${config.escala.min}–${config.escala.max})</label>
                <input class="form-control" type="number" name="valor" min="${config.escala.min}" max="${config.escala.max}" step="0.1" required>
              </div>
            </div>
            <div class="form-group"><label>Descripción</label><input class="form-control" name="descripcion" placeholder="ej: Examen Capítulo 3"></div>
            <div class="form-group"><label>Fecha</label><input class="form-control" type="date" name="fecha" value="${Utils.hoy()}"></div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close">Cancelar</button>
          <button class="btn btn-primary" id="save-nota-btn">💾 Guardar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-overlay,.modal-close').forEach(el => el.addEventListener('click', () => { modal.remove(); document.body.style.overflow=''; }));
    document.getElementById('save-nota-btn').addEventListener('click', () => {
      const form = document.getElementById('form-nota');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = Utils.serializeForm(form);
      DB.addNota({
        estudianteId: data.estudianteId, materiaId: this.selectedMateria,
        periodoId: this.selectedPeriodo, tipo: data.tipo,
        valor: parseFloat(data.valor), descripcion: data.descripcion,
        fecha: data.fecha, docenteId: this.session.userId
      });
      Utils.toast('Nota agregada', 'success');
      modal.remove();
      document.body.style.overflow='';
      this.renderNotasTable();
    });
  },

  renderTab(tab, session) {
    const content = document.getElementById('notas-content');
    if (!content) return;
    if (tab === 'actividades') {
      const notas = DB.getNotas().sort((a,b) => b.fecha.localeCompare(a.fecha));
      content.innerHTML = `<div class="table-wrapper animate-fadeIn">
        <div class="table-toolbar">
          <span style="font-size:13px;color:var(--text-muted)">Mostrando últimas ${Math.min(notas.length,50)} notas</span>
        </div>
        <table><thead><tr><th>Estudiante</th><th>Materia</th><th>Período</th><th>Tipo</th><th>Valor</th><th>Descripción</th><th>Fecha</th><th>Acciones</th></tr></thead>
        <tbody>${notas.slice(0,50).map(n => {
          const est = DB.getEstudiante(n.estudianteId);
          const mat = DB.getMateria(n.materiaId);
          const per = DB.getPeriodo(n.periodoId);
          const config = DB.getConfig();
          return `<tr>
            <td>${est?Utils.nombreCompleto(est):'—'}</td>
            <td>${mat?.nombre||'—'}</td>
            <td>${per?.nombre||'—'}</td>
            <td><span class="badge badge-neutral">${n.tipo}</span></td>
            <td><strong style="color:${Utils.colorNota(n.valor,config.escala.minAprobatorio)}">${Utils.formatNota(n.valor)}</strong></td>
            <td style="font-size:12px;color:var(--text-muted)">${n.descripcion||'—'}</td>
            <td>${Utils.formatFechaCorta(n.fecha)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="Grades.deleteNota('${n.id}')">🗑️</button></td>
          </tr>`;
        }).join('')}</tbody></table>
      </div>`;
    } else if (tab === 'estadisticas') {
      this.renderEstadisticas(content);
    }
  },

  async deleteNota(id) {
    if (!await Utils.confirm('¿Eliminar esta nota?')) return;
    DB.deleteNota(id);
    Utils.toast('Nota eliminada', 'warning');
    this.renderTab('actividades', this.session);
  },

  renderEstadisticas(content) {
    const materias = DB.getMaterias().slice(0, 6);
    const config = DB.getConfig();
    content.innerHTML = `<div class="grid-2 animate-fadeIn" style="gap:20px">
      <div class="chart-wrapper"><div class="chart-header"><h3>📊 Promedio por Materia</h3></div>
        <div class="chart-body"><canvas id="chart-notas-materias"></canvas></div>
      </div>
      <div class="chart-wrapper"><div class="chart-header"><h3>📈 Distribución de Notas</h3></div>
        <div class="chart-body"><canvas id="chart-dist-notas"></canvas></div>
      </div>
    </div>`;

    // Materias chart
    const promediosMat = materias.map(m => {
      const estudiantes = DB.getEstudiantesByGrado(m.gradoId);
      let total = 0, count = 0;
      estudiantes.forEach(e => {
        const pf = DB.calcularPromedioFinal(e.id, m.id);
        if (pf !== null) { total += pf; count++; }
      });
      return count > 0 ? Math.round((total/count)*100)/100 : 0;
    });
    setTimeout(() => {
      const ctx1 = document.getElementById('chart-notas-materias');
      if (ctx1) new Chart(ctx1, {
        type: 'horizontalBar',
        data: {
          labels: materias.map(m => m.nombre),
          datasets: [{ label: 'Promedio', data: promediosMat, backgroundColor: materias.map(m => m.color + 'CC'), borderColor: materias.map(m=>m.color), borderWidth: 2, borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 10 } } }
      });

      // Distribución de notas
      const notas = DB.getNotas().map(n=>n.valor).filter(v=>v!==null&&v!==undefined);
      const buckets = [0,0,0,0,0]; // <4, 4-6, 6-7.5, 7.5-9, 9-10
      notas.forEach(v => {
        if (v < 4) buckets[0]++;
        else if (v < 6) buckets[1]++;
        else if (v < 7.5) buckets[2]++;
        else if (v < 9) buckets[3]++;
        else buckets[4]++;
      });
      const ctx2 = document.getElementById('chart-dist-notas');
      if (ctx2) new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Muy Bajo (<4)', 'Bajo (4-6)', 'Regular (6-7.5)', 'Bueno (7.5-9)', 'Excelente (9-10)'],
          datasets: [{ data: buckets, backgroundColor: ['#E74C3C','#E67E22','#F39C12','#3498DB','#2ECC71'], borderWidth: 2, borderColor: 'var(--bg-card)' }]
        },
        options: { responsive: true, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }
      });
    }, 100);
  },

  exportarNotas(estudiantes, tipos, config, materia, periodo) {
    const data = estudiantes.map(e => {
      const row = { 'Estudiante': Utils.nombreCompleto(e), 'Documento': e.documento };
      tipos.forEach(t => {
        const n = DB.getNotasByEstudianteMateriaPeriodo(e.id, this.selectedMateria, this.selectedPeriodo).find(n=>n.tipo===t.id);
        row[t.nombre] = n ? n.valor : '';
      });
      row['Promedio'] = DB.calcularPromedioPeriodo(e.id, this.selectedMateria, this.selectedPeriodo) ?? '';
      return row;
    });
    Utils.exportarCSV(data, `notas_${materia?.nombre||'materia'}_${periodo?.nombre||'periodo'}`);
    Utils.toast('Notas exportadas', 'success');
  }
};

window.Grades = Grades;
