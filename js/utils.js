// ============================================================
// ACADEX — Utilidades y Helpers
// ============================================================

const Utils = {
  // ---- Formateo ----
  formatFecha(dateStr, opts = {}) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', ...opts });
  },

  formatFechaCorta(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  formatNota(valor) {
    if (valor === null || valor === undefined) return '—';
    return parseFloat(valor).toFixed(1);
  },

  formatPorcentaje(valor) {
    return `${Math.round(valor)}%`;
  },

  calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '—';
    const hoy = new Date();
    const nac = new Date(fechaNacimiento + 'T00:00:00');
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  },

  // ---- Colores por estado/nota ----
  colorNota(valor, min = 6.0) {
    if (valor === null || valor === undefined) return 'var(--tx-3)';
    if (valor >= 9) return '#2ECC71';
    if (valor >= 7) return '#3498DB';
    if (valor >= min) return '#F39C12';
    return '#E74C3C';
  },

  classeNota(valor, min = 6.0) {
    if (valor === null || valor === undefined) return 'badge-neutral';
    if (valor >= 9) return 'badge-success';
    if (valor >= 7) return 'badge-info';
    if (valor >= min) return 'badge-warning';
    return 'badge-danger';
  },

  colorAsistencia(pct) {
    if (pct >= 90) return '#2ECC71';
    if (pct >= 80) return '#3498DB';
    if (pct >= 70) return '#F39C12';
    return '#E74C3C';
  },

  estadoAsistenciaConfig(estado) {
    const map = {
      presente:    { label: 'Presente',    icon: '✅', clase: 'badge-success', color: '#2ECC71' },
      ausente:     { label: 'Ausente',     icon: '❌', clase: 'badge-danger',  color: '#E74C3C' },
      tardanza:    { label: 'Tardanza',    icon: '⏰', clase: 'badge-warning', color: '#F39C12' },
      justificado: { label: 'Justificado', icon: '📄', clase: 'badge-info',    color: '#3498DB' }
    };
    return map[estado] || { label: estado, icon: '❓', clase: 'badge-neutral', color: '#999' };
  },

  // ---- Generación de IDs / colores ----
  randomId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  },

  colorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 45%)`;
  },

  avatarInitials(nombre, apellido) {
    const n = (nombre || '').charAt(0).toUpperCase();
    const a = (apellido || '').charAt(0).toUpperCase();
    return n + a;
  },

  // ---- Paginación ----
  paginar(array, pagina, porPagina = 10) {
    const inicio = (pagina - 1) * porPagina;
    return {
      items: array.slice(inicio, inicio + porPagina),
      total: array.length,
      pagina,
      totalPaginas: Math.ceil(array.length / porPagina),
      porPagina
    };
  },

  renderPaginacion(container, paginacion, onPageChange) {
    const { pagina, totalPaginas, total, porPagina } = paginacion;
    if (totalPaginas <= 1) { container.innerHTML = ''; return; }
    const inicio = (pagina - 1) * porPagina + 1;
    const fin = Math.min(pagina * porPagina, total);
    let html = `<div class="pagination">
      <span class="pag-info">Mostrando ${inicio}–${fin} de ${total}</span>
      <div class="pag-buttons">`;
    if (pagina > 1) html += `<button class="pag-btn" data-page="${pagina - 1}">‹</button>`;
    for (let i = Math.max(1, pagina - 2); i <= Math.min(totalPaginas, pagina + 2); i++) {
      html += `<button class="pag-btn ${i === pagina ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    if (pagina < totalPaginas) html += `<button class="pag-btn" data-page="${pagina + 1}">›</button>`;
    html += `</div></div>`;
    container.innerHTML = html;
    container.querySelectorAll('.pag-btn').forEach(btn => {
      btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
    });
  },

  // ---- Búsqueda ----
  buscar(array, query, campos) {
    if (!query || !query.trim()) return array;
    const q = query.toLowerCase().trim();
    return array.filter(item =>
      campos.some(campo => {
        const val = campo.split('.').reduce((o, k) => o?.[k], item);
        return val && String(val).toLowerCase().includes(q);
      })
    );
  },

  // ---- Modal ----
  showModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
  },
  hideModal(id) {
    const el = id ? document.getElementById(id) : document.querySelector('.modal.active');
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
  },
  initModals() {
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay') || e.target.closest('.modal-close')) {
        const m = e.target.closest('.modal') || e.target;
        if (m.classList.contains('modal')) m.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  },

  // ---- Toast ----
  toast(mensaje, tipo = 'success', duracion = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span class="toast-icon">${icons[tipo] || '•'}</span><span class="toast-msg">${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, duracion);
  },

  // ---- Confirmación ----
  confirm(mensaje, titulo = '¿Confirmar acción?') {
    return new Promise(resolve => {
      const id = 'confirm-modal-' + Date.now();
      const div = document.createElement('div');
      div.className = 'modal active';
      div.id = id;
      div.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h3>${titulo}</h3>
          </div>
          <div class="modal-body">
            <p>${mensaje}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="${id}-cancel">Cancelar</button>
            <button class="btn btn-danger" id="${id}-ok">Confirmar</button>
          </div>
        </div>`;
      document.body.appendChild(div);
      document.getElementById(`${id}-cancel`).addEventListener('click', () => { div.remove(); resolve(false); });
      document.getElementById(`${id}-ok`).addEventListener('click', () => { div.remove(); resolve(true); });
    });
  },

  // ---- Formularios ----
  serializeForm(form) {
    const data = {};
    new FormData(form).forEach((val, key) => { data[key] = val; });
    return data;
  },

  setFormValues(form, data) {
    Object.entries(data).forEach(([key, val]) => {
      const el = form.querySelector(`[name="${key}"]`);
      if (el) el.value = val || '';
    });
  },

  // ---- Tabla con ranking ----
  buildRankingBadge(pos) {
    if (pos === 1) return '<span class="rank rank-1">🥇 1°</span>';
    if (pos === 2) return '<span class="rank rank-2">🥈 2°</span>';
    if (pos === 3) return '<span class="rank rank-3">🥉 3°</span>';
    return `<span class="rank">${pos}°</span>`;
  },

  // ---- Fecha hoy ----
  hoy() {
    return new Date().toISOString().split('T')[0];
  },

  mesActual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  // ---- Debounce ----
  debounce(fn, delay = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  },

  // ---- Exportar CSV ----
  exportarCSV(data, filename) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename + '.csv'; a.click();
    URL.revokeObjectURL(url);
  },

  // ---- Validaciones ----
  validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // ---- Nombre completo ----
  nombreCompleto(obj) {
    if (!obj) return '—';
    return `${obj.nombre || ''} ${obj.apellido || ''}`.trim();
  }
};

window.Utils = Utils;
