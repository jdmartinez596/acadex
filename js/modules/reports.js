// ============================================================
// ACADEX — Módulo Reportes y Boletines
// ============================================================

const Reports = {
  activeTab: 'boletin',

  render(container, session) {
    this.session = session;
    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">📊</span> Reportes y Boletines</h2>
        </div>
        <div class="tabs">
          <button class="tab-btn active" data-tab="boletin">📄 Boletín de Notas</button>
          <button class="tab-btn" data-tab="ranking">🏆 Ranking</button>
          <button class="tab-btn" data-tab="riesgo">⚠️ Riesgo Académico</button>
          <button class="tab-btn" data-tab="estadisticas">📊 Estadísticas</button>
        </div>
        <div id="reports-content" class="animate-fadeIn"></div>
      </div>`;

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.renderTab(btn.dataset.tab);
      });
    });

    this.renderTab('boletin');
  },

  renderTab(tab) {
    const content = document.getElementById('reports-content');
    switch(tab) {
      case 'boletin':      this.renderBoletin(content); break;
      case 'ranking':      this.renderRanking(content); break;
      case 'riesgo':       this.renderRiesgo(content); break;
      case 'estadisticas': this.renderEstadisticas(content); break;
    }
  },

  renderBoletin(content) {
    const estudiantes = DB.getEstudiantes().filter(e => e.activo);
    const periodos = DB.getPeriodos();
    const config = DB.getConfig();
    const inst = config.institucion;

    // Si es estudiante, auto-seleccionar
    let estPresel = null;
    if (this.session.rol === 'estudiante') {
      const user = DB.getUsuario(this.session.userId);
      estPresel = user?.estudianteId;
    }

    content.innerHTML = `
      <div class="animate-fadeIn">
        <div class="card" style="margin-bottom:20px">
          <div class="card-body" style="padding:16px">
            <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
              ${this.session.rol !== 'estudiante' ? `
              <div class="form-group" style="margin:0;min-width:260px">
                <label>Estudiante</label>
                <select class="form-control" id="rep-estudiante">
                  <option value="">Seleccionar estudiante...</option>
                  ${estudiantes.map(e=>`<option value="${e.id}">${e.apellido}, ${e.nombre} — ${DB.getGrupo(e.grupoId)?.nombre||''}</option>`).join('')}
                </select>
              </div>` : ''}
              <div class="form-group" style="margin:0">
                <label>Período</label>
                <select class="form-control" id="rep-periodo">
                  <option value="todos">Todos los períodos</option>
                  ${periodos.map(p=>`<option value="${p.id}">${p.nombre}</option>`).join('')}
                </select>
              </div>
              <button class="btn btn-primary" id="btn-generar-boletin">📄 Generar Boletín</button>
            </div>
          </div>
        </div>
        <div id="boletin-display"></div>
      </div>`;

    if (estPresel) {
      setTimeout(() => { this.generarBoletin(estPresel, 'todos', config, inst, periodos); }, 100);
    }

    document.getElementById('btn-generar-boletin').addEventListener('click', () => {
      const estId = estPresel || document.getElementById('rep-estudiante')?.value;
      const periodoId = document.getElementById('rep-periodo').value;
      if (!estId) { Utils.toast('Selecciona un estudiante', 'warning'); return; }
      this.generarBoletin(estId, periodoId, config, inst, periodos);
    });
  },

  generarBoletin(estId, periodoId, config, inst, periodos) {
    const est = DB.getEstudiante(estId);
    if (!est) return;
    const grado = DB.getGrado(est.gradoId);
    const grupo = DB.getGrupo(est.grupoId);
    const materias = DB.getMateriasByGrado(est.gradoId);
    const periodosAMostrar = periodoId === 'todos' ? periodos : periodos.filter(p=>p.id===periodoId);

    let promedioFinal = 0, materiaCount = 0, reprobadas = 0;
    const rows = materias.map(m => {
      const promedios = periodoId === 'todos'
        ? periodosAMostrar.map(p => DB.calcularPromedioPeriodo(estId, m.id, p.id))
        : [DB.calcularPromedioPeriodo(estId, m.id, periodoId)];
      const pf = DB.calcularPromedioFinal(estId, m.id);
      const aprobado = pf !== null && pf >= config.escala.minAprobatorio;
      if (pf !== null) { promedioFinal += pf; materiaCount++; if (!aprobado) reprobadas++; }
      return { materia: m, promedios, pf, aprobado };
    });

    promedioFinal = materiaCount > 0 ? Math.round((promedioFinal/materiaCount)*100)/100 : null;

    const display = document.getElementById('boletin-display');
    display.innerHTML = `
      <div class="boletin-preview" id="boletin-to-print">
        <!-- Header -->
        <div class="boletin-header-bg">
          <div style="font-size:24px;margin-bottom:8px">🎓</div>
          <h2>${inst.nombre}</h2>
          <p>${inst.direccion} · ${inst.telefono}</p>
          <div style="margin-top:12px;font-size:18px;font-weight:800;letter-spacing:2px">BOLETÍN DE CALIFICACIONES</div>
          <div style="font-size:14px;opacity:.8;margin-top:4px">${periodosAMostrar.map(p=>p.nombre).join(' · ')} · ${periodosAMostrar[0]?.año||new Date().getFullYear()}</div>
        </div>

        <!-- Info estudiante -->
        <div class="boletin-student-info">
          <div style="width:70px;height:70px;border-radius:50%;background:${Utils.colorFromString(est.nombre+est.apellido)};display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:800">
            ${Utils.avatarInitials(est.nombre, est.apellido)}
          </div>
          <div>
            <div style="font-size:20px;font-weight:800">${est.nombre} ${est.apellido}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px">
              ${grado?.nombre||'—'} · ${grupo?.nombre||'—'} · Doc: ${est.documento||'—'}
            </div>
            <div style="display:flex;gap:16px;margin-top:12px">
              <div style="text-align:center">
                <div style="font-size:24px;font-weight:800;color:${Utils.colorNota(promedioFinal,config.escala.minAprobatorio)}">${promedioFinal!==null?Utils.formatNota(promedioFinal):'—'}</div>
                <div style="font-size:11px;color:var(--text-muted)">Promedio General</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:24px;font-weight:800;color:${reprobadas>0?'var(--danger)':'var(--success)'}">${reprobadas}</div>
                <div style="font-size:11px;color:var(--text-muted)">Materias Reprobadas</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:24px;font-weight:800;color:${DB.calcularPorcentajeAsistencia(estId,null)>=80?'var(--success)':'var(--danger)'}">${DB.calcularPorcentajeAsistencia(estId,null)}%</div>
                <div style="font-size:11px;color:var(--text-muted)">Asistencia</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de notas -->
        <div class="boletin-table">
          <table>
            <thead><tr>
              <th>MATERIA</th>
              ${periodosAMostrar.map(p=>`<th style="text-align:center">${p.nombre.toUpperCase()}</th>`).join('')}
              <th style="text-align:center">PROMEDIO FINAL</th>
              <th style="text-align:center">ESTADO</th>
            </tr></thead>
            <tbody>
              ${rows.map(r => `<tr ${!r.aprobado&&r.pf!==null?'style="background:rgba(231,76,60,.04)"':''}>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:8px;height:8px;border-radius:50%;background:${r.materia.color}"></div>
                    <strong>${r.materia.nombre}</strong>
                  </div>
                </td>
                ${r.promedios.map(p=>`<td style="text-align:center;font-weight:700;color:${p!==null?Utils.colorNota(p,config.escala.minAprobatorio):'var(--text-muted)'}">${p!==null?Utils.formatNota(p):'—'}</td>`).join('')}
                <td style="text-align:center;font-size:18px;font-weight:800;color:${r.pf!==null?Utils.colorNota(r.pf,config.escala.minAprobatorio):'var(--text-muted)'}">${r.pf!==null?Utils.formatNota(r.pf):'—'}</td>
                <td style="text-align:center">${r.pf!==null?(r.aprobado?'<span class="badge badge-success">✅ Aprobado</span>':'<span class="badge badge-danger">❌ Reprobado</span>'):'<span class="badge badge-neutral">Sin notas</span>'}</td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr style="background:var(--primary);color:white">
                <td colspan="${periodosAMostrar.length+1}"><strong>PROMEDIO GENERAL</strong></td>
                <td style="text-align:center;font-size:18px;font-weight:800">${promedioFinal!==null?Utils.formatNota(promedioFinal):'—'}</td>
                <td style="text-align:center">${promedioFinal!==null?(promedioFinal>=config.escala.minAprobatorio?'<span style="background:rgba(46,204,113,.3);padding:3px 8px;border-radius:10px;font-size:12px">✅ Promovido</span>':'<span style="background:rgba(231,76,60,.3);padding:3px 8px;border-radius:10px;font-size:12px">❌ En riesgo</span>'):'—'}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Footer -->
        <div class="boletin-footer">
          <div style="text-align:center">
            <div style="border-top:1px solid var(--gray);padding-top:8px;width:150px;font-size:12px">Firma Director/a</div>
          </div>
          <div style="text-align:center;font-size:12px;color:var(--text-muted)">
            <div>Generado: ${Utils.formatFecha(Utils.hoy())}</div>
            <div style="margin-top:4px">Acadex · Sistema de Gestión Académica</div>
          </div>
          <div style="text-align:center">
            <div style="border-top:1px solid var(--gray);padding-top:8px;width:150px;font-size:12px">Firma Rector/a</div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div style="display:flex;gap:12px;justify-content:center;margin-top:20px">
        <button class="btn btn-primary" onclick="Reports.exportarPDF('${estId}')">📄 Exportar PDF</button>
        <button class="btn btn-outline" onclick="window.print()">🖨️ Imprimir</button>
      </div>`;
  },

  exportarPDF(estId) {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      Utils.toast('Generando PDF...', 'info');
      // Fallback: print
      window.print();
      return;
    }
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const est = DB.getEstudiante(estId);
      const config = DB.getConfig();
      const inst = config.institucion;
      const materias = DB.getMateriasByGrado(est.gradoId);
      const periodos = DB.getPeriodos();

      // Header
      doc.setFillColor(30, 58, 95);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(inst.nombre, 105, 12, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(inst.direccion + ' · ' + inst.telefono, 105, 19, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('BOLETÍN DE CALIFICACIONES', 105, 28, { align: 'center' });

      // Student info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${est.nombre} ${est.apellido}`, 15, 45);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const grado = DB.getGrado(est.gradoId);
      const grupo = DB.getGrupo(est.grupoId);
      doc.text(`${grado?.nombre||'—'} · ${grupo?.nombre||'—'} · Doc: ${est.documento||'—'}`, 15, 52);

      // Table
      const headers = [['MATERIA', ...periodos.map(p=>p.nombre), 'PROMEDIO FINAL', 'ESTADO']];
      const rows = materias.map(m => {
        const promedios = periodos.map(p => {
          const p2 = DB.calcularPromedioPeriodo(estId, m.id, p.id);
          return p2 !== null ? Utils.formatNota(p2) : '—';
        });
        const pf = DB.calcularPromedioFinal(estId, m.id);
        const aprobado = pf !== null && pf >= config.escala.minAprobatorio;
        return [m.nombre, ...promedios, pf !== null ? Utils.formatNota(pf) : '—', aprobado ? 'Aprobado' : pf !== null ? 'Reprobado' : 'Sin notas'];
      });

      if (doc.autoTable) {
        doc.autoTable({
          head: headers, body: rows,
          startY: 60, styles: { fontSize: 9 },
          headStyles: { fillColor: [30, 58, 95], textColor: [255,255,255] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });
      }

      doc.save(`boletin_${est.apellido}_${est.nombre}.pdf`);
      Utils.toast('PDF generado exitosamente', 'success');
    } catch(e) {
      console.error(e);
      window.print();
    }
  },

  renderRanking(content) {
    const grupos = DB.getGrupos();
    const config = DB.getConfig();
    content.innerHTML = `
      <div class="animate-fadeIn">
        <div class="card" style="margin-bottom:20px">
          <div class="card-body" style="padding:16px">
            <div style="display:flex;gap:12px;align-items:flex-end">
              <div class="form-group" style="margin:0">
                <label>Grupo</label>
                <select class="form-control" id="rank-grupo">
                  <option value="">Todos los estudiantes</option>
                  ${grupos.map(g=>`<option value="${g.id}">${g.nombre} (${DB.getGrado(g.gradoId)?.nombre||''})</option>`).join('')}
                </select>
              </div>
              <button class="btn btn-primary" id="btn-generar-ranking">🏆 Generar Ranking</button>
            </div>
          </div>
        </div>
        <div id="ranking-display"></div>
      </div>`;

    const genRanking = (grupoId) => {
      const estudiantes = grupoId ? DB.getEstudiantesByGrupo(grupoId) : DB.getEstudiantes().filter(e=>e.activo);
      const materias = DB.getMaterias();
      const ranked = estudiantes.map(e => {
        let total = 0, count = 0;
        materias.forEach(m => {
          const pf = DB.calcularPromedioFinal(e.id, m.id);
          if (pf !== null) { total += pf; count++; }
        });
        const prom = count > 0 ? Math.round((total/count)*100)/100 : null;
        const asist = DB.calcularPorcentajeAsistencia(e.id, null);
        return { ...e, promedio: prom, asistencia: asist };
      }).filter(e => e.promedio !== null).sort((a,b) => (b.promedio||0) - (a.promedio||0));

      const display = document.getElementById('ranking-display');
      display.innerHTML = `<div class="table-wrapper animate-fadeIn">
        <table><thead><tr><th>Posición</th><th>Estudiante</th><th>Grado/Grupo</th><th>Promedio General</th><th>Asistencia</th><th>Estado</th></tr></thead>
        <tbody>${ranked.map((e, idx) => {
          const grado = DB.getGrado(e.gradoId);
          const grupo = DB.getGrupo(e.grupoId);
          const color = Utils.colorFromString(e.nombre + e.apellido);
          return `<tr ${idx<3?'style="background:rgba(46,204,113,.04)"':''}>
            <td>${Utils.buildRankingBadge(idx+1)}</td>
            <td><div style="display:flex;align-items:center;gap:10px">
              <div class="avatar" style="background:${color}">${Utils.avatarInitials(e.nombre,e.apellido)}</div>
              <strong>${e.apellido}, ${e.nombre}</strong>
            </div></td>
            <td>${grado?.nombre||'—'} · ${grupo?.nombre||'—'}</td>
            <td>
              <div style="display:flex;align-items:center;gap:10px">
                <strong style="font-size:20px;color:${Utils.colorNota(e.promedio,config.escala.minAprobatorio)}">${Utils.formatNota(e.promedio)}</strong>
                <div class="progress-bar-wrapper" style="width:80px;flex-shrink:0"><div class="progress-bar" style="width:${(e.promedio/10)*100}%;background:${Utils.colorNota(e.promedio,config.escala.minAprobatorio)}"></div></div>
              </div>
            </td>
            <td><strong style="color:${Utils.colorAsistencia(e.asistencia)}">${e.asistencia}%</strong></td>
            <td>${e.promedio>=config.escala.minAprobatorio?'<span class="badge badge-success">✅ Aprobado</span>':'<span class="badge badge-danger">❌ Reprobado</span>'}</td>
          </tr>`;
        }).join('')}
        ${!ranked.length?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Sin datos de notas disponibles</td></tr>':''}
        </tbody></table>
      </div>`;
    };

    document.getElementById('btn-generar-ranking').addEventListener('click', () => genRanking(document.getElementById('rank-grupo').value));
    genRanking('');
  },

  renderRiesgo(content) {
    const config = DB.getConfig();
    const stats = DB.getStats();
    const riesgo = stats.estudiantesEnRiesgo;

    content.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header" style="margin-bottom:20px">
          <h3>⚠️ ${riesgo.length} estudiante(s) en situación de riesgo</h3>
          <button class="btn btn-outline btn-sm" onclick="Reports.exportarRiesgo()">📤 Exportar</button>
        </div>
        ${!riesgo.length ? `<div class="empty-state"><div class="empty-icon">✅</div><h3>¡Excelente!</h3><p>No hay estudiantes en riesgo académico actualmente</p></div>` : `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${riesgo.map(r => {
            const e = r.estudiante;
            const grado = DB.getGrado(e.gradoId);
            const grupo = DB.getGrupo(e.grupoId);
            const color = Utils.colorFromString(e.nombre + e.apellido);
            const isNota = r.tipo === 'nota';
            return `<div class="card card-hover" style="border-left:4px solid ${isNota&&r.promedio<4?'var(--danger)':'var(--warning)'}">
              <div class="card-body" style="padding:16px;display:flex;align-items:center;gap:16px">
                <div class="avatar avatar-lg" style="background:${color}">${Utils.avatarInitials(e.nombre,e.apellido)}</div>
                <div style="flex:1">
                  <h4 style="font-size:16px">${e.nombre} ${e.apellido}</h4>
                  <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${grado?.nombre||'—'} · ${grupo?.nombre||'—'}</div>
                  <div style="margin-top:8px">
                    ${isNota
                      ? `<span class="badge badge-danger">📝 Nota baja en ${r.materia?.nombre}: <strong>${Utils.formatNota(r.promedio)}</strong></span>`
                      : `<span class="badge badge-warning">📅 Asistencia crítica: <strong>${r.promedio}%</strong></span>`
                    }
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:32px;font-weight:800;color:${isNota?Utils.colorNota(r.promedio,config.escala.minAprobatorio):Utils.colorAsistencia(r.promedio)}">${isNota?Utils.formatNota(r.promedio):`${r.promedio}%`}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${isNota?'Promedio':'Asistencia'}</div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="Students.verPerfil('${e.id}', Auth.getSession())">👁️ Ver perfil</button>
              </div>
            </div>`;
          }).join('')}
        </div>`}
      </div>`;
  },

  exportarRiesgo() {
    const config = DB.getConfig();
    const riesgo = DB.getStats().estudiantesEnRiesgo;
    const data = riesgo.map(r => ({
      'Nombre': Utils.nombreCompleto(r.estudiante),
      'Grado': DB.getGrado(r.estudiante.gradoId)?.nombre||'',
      'Grupo': DB.getGrupo(r.estudiante.grupoId)?.nombre||'',
      'Tipo': r.tipo === 'nota' ? 'Nota baja' : 'Asistencia baja',
      'Materia': r.materia?.nombre||'General',
      'Valor': r.tipo === 'nota' ? Utils.formatNota(r.promedio) : `${r.promedio}%`,
      'Acudiente': r.estudiante.acudiente?.nombre||'',
      'Tel. Acudiente': r.estudiante.acudiente?.telefono||''
    }));
    Utils.exportarCSV(data, 'reporte_riesgo_academico');
    Utils.toast('Reporte exportado', 'success');
  },

  renderEstadisticas(content) {
    const config = DB.getConfig();
    const materias = DB.getMaterias();
    const grados = DB.getGrados();

    content.innerHTML = `
      <div class="grid-2 animate-fadeIn" style="gap:20px">
        <div class="chart-wrapper">
          <div class="chart-header"><h3>📊 Promedio por Grado</h3></div>
          <div class="chart-body"><canvas id="chart-por-grado"></canvas></div>
        </div>
        <div class="chart-wrapper">
          <div class="chart-header"><h3>📈 Distribución General</h3></div>
          <div class="chart-body"><canvas id="chart-dist-general"></canvas></div>
        </div>
        <div class="chart-wrapper col-full">
          <div class="chart-header"><h3>📋 Comparativo de Materias por Grado</h3></div>
          <div class="chart-body"><canvas id="chart-comparativo"></canvas></div>
        </div>
      </div>`;

    setTimeout(() => {
      // Por grado
      const promediosGrado = grados.map(g => {
        const ests = DB.getEstudiantesByGrado(g.id);
        const mats = DB.getMateriasByGrado(g.id);
        let total = 0, count = 0;
        ests.forEach(e => mats.forEach(m => {
          const pf = DB.calcularPromedioFinal(e.id, m.id);
          if (pf !== null) { total += pf; count++; }
        }));
        return count > 0 ? Math.round((total/count)*100)/100 : 0;
      });

      new Chart(document.getElementById('chart-por-grado'), {
        type: 'bar',
        data: {
          labels: grados.map(g=>g.nombre),
          datasets: [{ label: 'Promedio', data: promediosGrado, backgroundColor: 'rgba(30,58,95,.7)', borderColor: '#1E3A5F', borderWidth: 2, borderRadius: 8 }]
        },
        options: { responsive: true, plugins: { legend: {display:false} }, scales: { y: { min:0, max:10 } } }
      });

      // Distribución
      const todos = DB.getEstudiantes().filter(e=>e.activo);
      const promediosTodos = todos.map(e => {
        let t=0,c=0;
        DB.getMaterias().forEach(m => { const pf=DB.calcularPromedioFinal(e.id,m.id); if(pf!==null){t+=pf;c++;} });
        return c>0?t/c:null;
      }).filter(p=>p!==null);

      const buckets = [0,0,0,0,0];
      promediosTodos.forEach(v => {
        if(v<4) buckets[0]++;
        else if(v<6) buckets[1]++;
        else if(v<7.5) buckets[2]++;
        else if(v<9) buckets[3]++;
        else buckets[4]++;
      });

      new Chart(document.getElementById('chart-dist-general'), {
        type: 'pie',
        data: {
          labels: ['Muy Bajo (<4)','Bajo (4-6)','Regular (6-7.5)','Bueno (7.5-9)','Excelente (9-10)'],
          datasets: [{ data: buckets, backgroundColor: ['#E74C3C','#E67E22','#F39C12','#3498DB','#2ECC71'], borderWidth: 2, borderColor: 'var(--bg-card)' }]
        },
        options: { responsive: true, plugins: { legend: { position:'right', labels: { font:{size:11} } } } }
      });

      // Comparativo materias
      const mats10 = DB.getMateriasByGrado('g10').slice(0,6);
      const per = DB.getPeriodos();
      const datasets = per.map((p, i) => {
        const colors = ['rgba(30,58,95,.8)','rgba(46,204,113,.8)','rgba(243,156,18,.8)'];
        return {
          label: p.nombre,
          data: mats10.map(m => {
            const ests = DB.getEstudiantesByGrupo('gr10A');
            let t=0,c=0;
            ests.forEach(e => { const pv=DB.calcularPromedioPeriodo(e.id,m.id,p.id); if(pv!==null){t+=pv;c++;} });
            return c>0?Math.round((t/c)*100)/100:0;
          }),
          backgroundColor: colors[i]||'rgba(52,152,219,.8)',
          borderRadius: 6
        };
      });

      new Chart(document.getElementById('chart-comparativo'), {
        type: 'bar',
        data: { labels: mats10.map(m=>m.nombre), datasets },
        options: { responsive: true, scales: { y: { min:0, max:10 } } }
      });
    }, 150);
  }
};

window.Reports = Reports;
