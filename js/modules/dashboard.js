// ============================================================
// ACADEX — Módulo Dashboard
// ============================================================

const Dashboard = {
  charts: {},

  render(container, session) {
    const stats = DB.getStats();
    const config = DB.getConfig();
    const periodoActivo = DB.getPeriodoActivo();

    container.innerHTML = `
      <div class="animate-fadeIn">
        <!-- KPIs -->
        <div class="grid-4 stagger" style="margin-bottom:24px;">
          <div class="kpi-card kpi-blue card-hover animate-fadeIn">
            <div class="kpi-icon">${Icons.users}</div>
            <div class="kpi-value">${stats.totalEstudiantes}</div>
            <div class="kpi-label">Total Estudiantes</div>
            <div class="kpi-change up">▲ Activos este período</div>
          </div>
          <div class="kpi-card kpi-green card-hover animate-fadeIn">
            <div class="kpi-icon">${Icons.star}</div>
            <div class="kpi-value">${Utils.formatNota(stats.promedioGeneral)}</div>
            <div class="kpi-label">Promedio General</div>
            <div class="kpi-change ${stats.promedioGeneral >= config.escala.minAprobatorio ? 'up' : 'down'}">${stats.promedioGeneral >= config.escala.minAprobatorio ? '▲ Sobre el mínimo' : '▼ Bajo el mínimo'}</div>
          </div>
          <div class="kpi-card kpi-orange card-hover animate-fadeIn">
            <div class="kpi-icon">${Icons.calendar}</div>
            <div class="kpi-value">${stats.porcentajeAsistencia}%</div>
            <div class="kpi-label">% Asistencia General</div>
            <div class="kpi-change ${stats.porcentajeAsistencia >= 80 ? 'up' : 'down'}">${stats.porcentajeAsistencia >= 80 ? '▲ Dentro del rango' : '▼ Por debajo del 80%'}</div>
          </div>
          <div class="kpi-card kpi-purple card-hover animate-fadeIn">
            <div class="kpi-icon">${Icons.book}</div>
            <div class="kpi-value">${stats.materiasActivas}</div>
            <div class="kpi-label">Materias Activas</div>
            <div class="kpi-change up">${stats.totalDocentes} docentes</div>
          </div>
        </div>

        <!-- Charts + Calendar -->
        <div class="dashboard-grid">
          <!-- Rendimiento por período -->
          <div class="chart-wrapper animate-fadeIn">
            <div class="chart-header">
              <h3>${Icons.trendingUp} Rendimiento por Período</h3>
              <select id="chart-grado-filter" class="form-control" style="width:140px;padding:6px 10px;">
                <option value="">Todos los grados</option>
                ${DB.getGrados().map(g => `<option value="${g.id}">${g.nombre}</option>`).join('')}
              </select>
            </div>
            <div class="chart-body"><canvas id="chart-rendimiento"></canvas></div>
          </div>

          <!-- Materias comparison -->
          <div class="chart-wrapper animate-fadeIn">
            <div class="chart-header">
              <h3>${Icons.chart} Promedio por Materia</h3>
              <span class="badge badge-primary">${periodoActivo ? periodoActivo.nombre : 'General'}</span>
            </div>
            <div class="chart-body"><canvas id="chart-materias"></canvas></div>
          </div>

          <!-- Alertas -->
          <div class="card animate-fadeIn">
            <div class="card-header">
              <h3>${Icons.warning} Alertas Académicas</h3>
              <span class="badge badge-danger">${stats.estudiantesEnRiesgo.length}</span>
            </div>
            <div class="card-body" style="padding:12px;">
              ${this.renderAlertas(stats.estudiantesEnRiesgo, config.escala.minAprobatorio)}
            </div>
          </div>

          <!-- Calendario -->
          <div class="card animate-fadeIn">
            <div class="card-header">
              <h3>${Icons.calendar} Calendario Académico</h3>
            </div>
            <div class="card-body"><div id="mini-calendar"></div></div>
          </div>

          <!-- Próximas actividades -->
          <div class="card col-full animate-fadeIn">
            <div class="card-header">
              <h3>${Icons.bell} Próximas Actividades</h3>
              <button class="btn btn-accent btn-sm" onclick="App.navigate('academic')">+ Agregar</button>
            </div>
            <div class="card-body" style="padding:0;">
              ${this.renderActividades()}
            </div>
          </div>
        </div>
      </div>`;

    // Init charts
    this.initCharts(stats);
    this.renderCalendar();

    // Chart filter
    document.getElementById('chart-grado-filter')?.addEventListener('change', e => {
      this.updateRendimientoChart(e.target.value);
    });
  },

  renderAlertas(riesgo, minAprobatorio) {
    if (!riesgo.length) return `<div class="empty-state" style="padding:30px"><div class="empty-icon">${Icons.success}</div><p>Sin alertas académicas activas</p></div>`;
    const shown = riesgo.slice(0, 6);
    return `<div class="alert-list">${shown.map(r => {
      const isPeligro = r.tipo === 'nota' ? r.promedio < minAprobatorio - 1 : r.promedio < 70;
      const icon = r.tipo === 'nota' ? Icons.grades : Icons.present;
      const label = r.tipo === 'nota'
        ? `Promedio bajo en ${r.materia?.nombre || 'Materia'}`
        : 'Asistencia crítica';
      const val = r.tipo === 'nota' ? Utils.formatNota(r.promedio) : `${r.promedio}%`;
      const color = r.tipo === 'nota' ? Utils.colorNota(r.promedio, minAprobatorio) : Utils.colorAsistencia(r.promedio);
      return `<div class="alert-row ${isPeligro?'peligro':''}">
        <span style="font-size:20px">${icon}</span>
        <div class="alert-info">
          <div class="alert-name">${Utils.nombreCompleto(r.estudiante)}</div>
          <div class="alert-detail">${label}</div>
        </div>
        <div class="alert-value" style="color:${color}">${val}</div>
      </div>`;
    }).join('')}
    ${riesgo.length > 6 ? `<div style="text-align:center;padding:10px;font-size:13px;color:var(--text-muted)">+${riesgo.length-6} alertas más en Reportes</div>` : ''}
    </div>`;
  },

  renderActividades() {
    const actividades = DB.getActividades().sort((a,b) => a.fecha.localeCompare(b.fecha)).slice(0, 6);
    if (!actividades.length) return '<div class="empty-state" style="padding:30px"><p>No hay actividades programadas</p></div>';
    const tiposIcon = { examen: Icons.fileText, proyecto: Icons.file, exposicion: Icons.cap, quiz: Icons.edit, tarea: Icons.book };
    return `<table><thead><tr>
      <th>Actividad</th><th>Fecha</th><th>Tipo</th><th>Grado/Grupo</th><th>Materia</th>
    </tr></thead><tbody>${actividades.map(a => {
      const grado = DB.getGrado(a.gradoId);
      const grupo = DB.getGrupo(a.grupoId);
      const materia = DB.getMateria(a.materiaId);
      const hoy = Utils.hoy();
      const pronto = a.fecha <= new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
      return `<tr>
        <td><strong>${a.titulo}</strong> ${pronto ? '<span class="badge badge-warning">Próximo</span>' : ''}</td>
        <td>${Utils.formatFecha(a.fecha)}</td>
        <td>${tiposIcon[a.tipo]||Icons.mapPin} ${a.tipo}</td>
        <td>${grado?.nombre||''} ${grupo?.nombre||''}</td>
        <td>${materia?.nombre||'—'}</td>
      </tr>`;
    }).join('')}</tbody></table>`;
  },

  initCharts(stats) {
    this.updateRendimientoChart('');
    this.renderMateriasChart();
  },

  updateRendimientoChart(gradoId) {
    const periodos = DB.getPeriodos();
    const materias = gradoId ? DB.getMateriasByGrado(gradoId) : DB.getMaterias();
    const estudiantes = gradoId ? DB.getEstudiantesByGrado(gradoId) : DB.getEstudiantes().filter(e=>e.activo);

    const promediosPorPeriodo = periodos.map(p => {
      let total = 0, count = 0;
      estudiantes.forEach(est => {
        materias.forEach(mat => {
          const prom = DB.calcularPromedioPeriodo(est.id, mat.id, p.id);
          if (prom !== null) { total += prom; count++; }
        });
      });
      return count > 0 ? Math.round((total/count)*100)/100 : 0;
    });

    const ctx = document.getElementById('chart-rendimiento');
    if (!ctx) return;
    if (this.charts.rendimiento) this.charts.rendimiento.destroy();

    this.charts.rendimiento = new Chart(ctx, {
      type: 'line',
      data: {
        labels: periodos.map(p => p.nombre),
        datasets: [{
          label: 'Promedio General',
          data: promediosPorPeriodo,
          borderColor: '#1E3A5F',
          backgroundColor: 'rgba(30,58,95,.1)',
          borderWidth: 3,
          pointBackgroundColor: '#2ECC71',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: .4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `Promedio: ${ctx.parsed.y.toFixed(1)}` } } },
        scales: {
          y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  },

  renderMateriasChart() {
    const materias = DB.getMaterias().slice(0, 8);
    const promedios = materias.map(m => {
      const estudiantes = DB.getEstudiantes().filter(e => e.gradoId === m.gradoId && e.activo);
      if (!estudiantes.length) return 0;
      let total = 0, count = 0;
      estudiantes.forEach(e => {
        const pf = DB.calcularPromedioFinal(e.id, m.id);
        if (pf !== null) { total += pf; count++; }
      });
      return count > 0 ? Math.round((total/count)*100)/100 : 0;
    });

    const ctx = document.getElementById('chart-materias');
    if (!ctx) return;
    if (this.charts.materias) this.charts.materias.destroy();

    this.charts.materias = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: materias.map(m => m.nombre.length > 12 ? m.nombre.substring(0,12)+'...' : m.nombre),
        datasets: [{
          label: 'Promedio',
          data: promedios,
          backgroundColor: materias.map(m => m.color + 'CC'),
          borderColor: materias.map(m => m.color),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  },

  renderCalendar() {
    const container = document.getElementById('mini-calendar');
    if (!container) return;
    const hoy = new Date();
    let year = hoy.getFullYear(), month = hoy.getMonth();
    const render = (y, m) => {
      const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const firstDay = new Date(y, m, 1).getDay();
      const totalDays = new Date(y, m+1, 0).getDate();
      const actividades = DB.getActividades();
      const actFechas = {};
      actividades.forEach(a => { 
        const d = a.fecha.split('-'); 
        if (parseInt(d[0])===y && parseInt(d[1])-1===m) { 
          actFechas[parseInt(d[2])] = a.tipo; 
        } 
      });
      let html = `<div class="cal-month-nav">
        <button class="btn btn-ghost btn-sm" id="cal-prev">‹</button>
        <span>${meses[m]} ${y}</span>
        <button class="btn btn-ghost btn-sm" id="cal-next">›</button>
      </div>
      <div class="cal-grid">
        ${dias.map(d => `<div class="cal-day-header">${d}</div>`).join('')}
        ${Array(firstDay).fill('<div class="cal-day other-month"></div>').join('')}
        ${Array.from({length:totalDays},(_,i)=>{
          const day = i+1;
          const isHoy = day===hoy.getDate()&&m===hoy.getMonth()&&y===hoy.getFullYear();
          const hasEv = actFechas[day];
          return `<div class="cal-day ${isHoy?'today':''} ${hasEv?'has-event':''} ${hasEv==='examen'?'has-event-exam':''} ${hasEv==='quiz'?'has-event-quiz':''}" 
            data-tooltip="${hasEv?actFechas[day]:''}">${day}</div>`;
        }).join('')}
      </div>`;
      container.innerHTML = html;
      document.getElementById('cal-prev').addEventListener('click',()=>{if(m===0){year--;month=11;}else{month--;}render(year,month);});
      document.getElementById('cal-next').addEventListener('click',()=>{if(m===11){year++;month=0;}else{month++;}render(year,month);});
    };
    render(year, month);
  }
};

window.Dashboard = Dashboard;
