// ============================================================
// ACADEX — Router / App Principal SPA
// ============================================================

const App = {
  currentRoute: null,

  routes: {
    dashboard:    { label: 'Dashboard',          icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>', module: 'Dashboard',   roles: ['admin','docente','estudiante'] },
    academic:     { label: 'Estructura Académica', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>', module: 'Academic',    roles: ['admin','docente'] },
    students:     { label: 'Estudiantes',          icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>', module: 'Students',    roles: ['admin','docente'] },
    grades:       { label: 'Notas',                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', module: 'Grades',      roles: ['admin','docente','estudiante'] },
    attendance:   { label: 'Asistencia',           icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', module: 'Attendance',  roles: ['admin','docente'] },
    reports:      { label: 'Reportes',             icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>', module: 'Reports',     roles: ['admin','docente','estudiante'] },
    settings:     { label: 'Configuración',        icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>', module: 'Settings',    roles: ['admin','super_admin'] },
    institutions: { label: 'Instituciones',        icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>', module: 'Institutions', roles: ['super_admin'] }
  },

  navGroups: {
    super_admin: [
      { label: 'Principal',   items: ['dashboard'] },
      { label: 'Académico',   items: ['academic', 'students', 'grades', 'attendance'] },
      { label: 'Análisis',    items: ['reports'] },
      { label: 'Admin Global', items: ['institutions', 'settings'] }
    ],
    admin: [
      { label: 'Principal',   items: ['dashboard'] },
      { label: 'Académico',   items: ['academic', 'students', 'grades', 'attendance'] },
      { label: 'Análisis',    items: ['reports'] },
      { label: 'Sistema',     items: ['settings'] }
    ],
    docente: [
      { label: 'Principal',   items: ['dashboard'] },
      { label: 'Mi Trabajo',  items: ['students', 'grades', 'attendance'] },
      { label: 'Análisis',    items: ['reports'] }
    ],
    estudiante: [
      { label: 'Principal',   items: ['dashboard'] },
      { label: 'Mi Académico', items: ['grades', 'reports'] }
    ]
  },

  async init() {
    await DB.init();
    const session = Auth.getSession();
    if (!session) return;

    this.buildSidebar(session);
    this.buildHeader(session);
    this.setupSidebarToggle();
    this.setupDarkMode();
    this.setupNotifications(session);
    Utils.initModals();

    // Navigate to dashboard
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(hash.replace('/', ''));

    window.addEventListener('hashchange', () => {
      const route = window.location.hash.replace('#', '').replace('/', '') || 'dashboard';
      this.navigate(route);
    });
  },

  buildSidebar(session) {
    const sidebar = document.getElementById('sidebar');
    const groups = this.navGroups[session.rol] || this.navGroups.admin;
    const user = DB.getUsuario(session.userId);

    // User info
    const color = Utils.colorFromString(session.nombre + session.apellido);
    document.getElementById('sidebar-user-avatar').style.background = color;
    document.getElementById('sidebar-user-avatar').textContent = Utils.avatarInitials(session.nombre, session.apellido);
    document.getElementById('sidebar-user-name').textContent = `${session.nombre} ${session.apellido}`;
    document.getElementById('sidebar-user-role').textContent = session.rol;

    // Nav
    const nav = document.getElementById('sidebar-nav');
    let html = '';
    groups.forEach(group => {
      html += `<div class="nav-section">${group.label}</div>`;
      group.items.forEach(routeKey => {
        const route = this.routes[routeKey];
        if (!route) return;
        html += `<div class="nav-item" data-route="${routeKey}" id="nav-${routeKey}">
          <span class="nav-icon">${route.icon}</span>
          <span class="nav-label">${route.label}</span>
        </div>`;
      });
    });
    nav.innerHTML = html;

    nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.navigate(item.dataset.route);
        // Close mobile
        sidebar.classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
      });
    });
  },

  buildHeader(session) {
    document.getElementById('header-user-avatar').style.background = Utils.colorFromString(session.nombre + session.apellido);
    document.getElementById('header-user-avatar').textContent = Utils.avatarInitials(session.nombre, session.apellido);
    document.getElementById('header-user-name').textContent = session.nombre;

    document.getElementById('logout-btn').addEventListener('click', async () => {
      const ok = await Utils.confirm('¿Deseas cerrar sesión?', 'Cerrar sesión');
      if (ok) Auth.logout();
    });

    // Search - global filter
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(e => {
        const q = e.target.value.trim();
        if (q.length > 1) this.globalSearch(q);
      }, 300));
    }

    // Mobile menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebar-overlay').classList.toggle('open');
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('open');
    });
  },

  setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebar-toggle-btn').addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('acadex_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });
    if (localStorage.getItem('acadex_sidebar_collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }
  },

  setupDarkMode() {
    const config = DB.getConfig();
    if (config?.darkMode) document.documentElement.setAttribute('data-theme','dark');
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
      if (config?.darkMode) toggleBtn.classList.add('on');
      toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          toggleBtn.classList.remove('on');
          DB.updateConfig('darkMode', false);
        } else {
          document.documentElement.setAttribute('data-theme','dark');
          toggleBtn.classList.add('on');
          DB.updateConfig('darkMode', true);
        }
      });
    }
  },

  setupNotifications(session) {
    this.updateNotifBadge(session);
    const btn = document.getElementById('notif-btn');
    const dropdown = document.getElementById('notif-dropdown');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) this.renderNotifications(session);
    });

    document.addEventListener('click', (e) => {
      if (!btn?.contains(e.target) && !dropdown?.contains(e.target)) {
        if (dropdown) dropdown.style.display = 'none';
      }
    });
  },

  renderNotifications(session) {
    const dropdown = document.getElementById('notif-dropdown');
    const notifs = DB.getNotificaciones(session.userId).slice(0, 8);
    const icons = { alerta: Icons.warning, asistencia: Icons.clipboard, sistema: Icons.info };
    let html = `<div class="notif-header">
      <span>Notificaciones</span>
      <a href="#" onclick="DB.marcarTodasLeidas('${session.userId}'); App.updateNotifBadge(Auth.getSession()); return false;" style="font-size:12px;color:var(--primary);">Marcar todas</a>
    </div>
    <div class="notif-list">`;
    if (!notifs.length) html += '<div style="padding:24px;text-align:center;color:var(--text-muted);">Sin notificaciones</div>';
    notifs.forEach(n => {
      html += `<div class="notif-item ${n.leida?'':'unread'}" onclick="DB.marcarLeida('${n.id}'); App.updateNotifBadge(Auth.getSession())">
        <span class="notif-icon">${icons[n.tipo]||Icons.mapPin}</span>
        <div class="notif-text">
          <div class="notif-msg">${n.mensaje}</div>
          <div class="notif-time">${Utils.formatFechaCorta(n.fecha)}</div>
        </div>
      </div>`;
    });
    html += '</div><div class="notif-footer"><a href="#">Ver todas</a></div>';
    dropdown.innerHTML = html;
  },

  updateNotifBadge(session) {
    if (!session) return;
    const count = DB.getNotificacionesNoLeidas(session.userId).length;
    const badge = document.getElementById('notif-badge');
    if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  },

  navigate(route) {
    const session = Auth.getSession();
    if (!session) return;

    const routeConfig = this.routes[route];
    if (!routeConfig) { this.navigate('dashboard'); return; }
    if (!routeConfig.roles.includes(session.rol)) { this.navigate('dashboard'); return; }

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.getElementById(`nav-${route}`);
    if (navEl) navEl.classList.add('active');

    // Update header title
    document.getElementById('header-page-title').textContent = routeConfig.label;
    document.getElementById('header-page-subtitle').textContent = this.getSubtitle(route, session);

    // Update hash
    window.location.hash = route;
    this.currentRoute = route;

    // Load module
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    content.style.animation = 'none';

    setTimeout(() => {
      content.style.animation = '';
      const mod = window[routeConfig.module];
      if (mod && mod.render) {
        mod.render(content, session);
      } else {
        content.innerHTML = `<div class="empty-state"><div class="empty-icon">${Icons.warning}</div><h3>Módulo en construcción</h3><p>Este módulo estará disponible pronto.</p></div>`;
      }
    }, 80);
  },

  getSubtitle(route, session) {
    const subtitles = {
      dashboard:  `Panel principal · ${new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}`,
      academic:   'Grados, grupos, materias y períodos',
      students:   'Registro y gestión de estudiantes',
      grades:     'Ingreso y seguimiento de calificaciones',
      attendance: 'Control de asistencia diaria',
      reports:    'Boletines, reportes y estadísticas',
      settings:   'Configuración del sistema',
      institutions: 'Gestión de instituciones educativas'
    };
    return subtitles[route] || '';
  },

  globalSearch(q) {
    const estudiantes = DB.getEstudiantes().filter(e => e.activo && 
      (`${e.nombre} ${e.apellido} ${e.documento}`).toLowerCase().includes(q.toLowerCase()));
    if (estudiantes.length) {
      Utils.toast(`${estudiantes.length} estudiante(s) encontrado(s). Ve a Estudiantes.`, 'info');
    }
  },

  refresh() {
    if (this.currentRoute) this.navigate(this.currentRoute);
  }
};

window.App = App;
