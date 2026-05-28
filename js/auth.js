// ============================================================
// ACADEX — Autenticación y Sesión
// ============================================================

const Auth = {
  SESSION_KEY: 'acadex_session',

  login(email, password) {
    const user = DB.getUsuarioByEmail(email.trim().toLowerCase());
    if (!user) return { ok: false, error: 'Usuario no encontrado' };
    if (user.password !== password) return { ok: false, error: 'Contraseña incorrecta' };
    if (!user.activo) return { ok: false, error: 'Usuario desactivado' };
    const session = { userId: user.id, rol: user.rol, nombre: user.nombre, apellido: user.apellido, email: user.email, loginAt: Date.now() };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.reload();
  },

  getSession() {
    try { return JSON.parse(sessionStorage.getItem(this.SESSION_KEY)); } catch { return null; }
  },

  isLoggedIn() { return !!this.getSession(); },

  can(action) {
    const s = this.getSession();
    if (!s) return false;
    const perms = {
      admin:      ['all'],
      docente:    ['read_students','write_notas','write_asistencia','read_reports','read_academic'],
      estudiante: ['read_own']
    };
    const p = perms[s.rol] || [];
    return p.includes('all') || p.includes(action);
  },

  requireRole(roles) {
    const s = this.getSession();
    if (!s) return false;
    return roles.includes(s.rol);
  }
};

// ---- Login UI ----
function initLogin() {
  const page = document.getElementById('login-page');
  const app  = document.getElementById('app-shell');

  if (Auth.isLoggedIn()) {
    page.style.display = 'none';
    app.classList.add('visible');
    App.init();
    return;
  }

  let selectedRol = 'admin';

  // Role selector
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRol = btn.dataset.rol;
      // Auto fill demo credentials
      const demos = {
        admin:      { email: 'admin@acadex.com',    pwd: 'admin123' },
        docente:    { email: 'docente@acadex.com',  pwd: 'docente123' },
        estudiante: { email: 'estudiante@acadex.com', pwd: 'est123' }
      };
      document.getElementById('login-email').value = demos[selectedRol].email;
      document.getElementById('login-password').value = demos[selectedRol].pwd;
    });
  });

  // Activate admin by default
  document.querySelector('.role-btn[data-rol="admin"]').classList.add('active');
  document.getElementById('login-email').value = 'admin@acadex.com';
  document.getElementById('login-password').value = 'admin123';

  // Form submit
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-inline"></span> Ingresando...';

    setTimeout(() => {
      const result = Auth.login(email, password);
      if (result.ok) {
        page.style.display = 'none';
        app.classList.add('visible');
        App.init();
        Utils.toast(`¡Bienvenido/a, ${result.user.nombre}! 🎉`, 'success');
      } else {
        document.getElementById('login-error').textContent = result.error;
        document.getElementById('login-error').style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = 'Ingresar al Sistema';
      }
    }, 600);
  });

  // Password recovery modal
  document.getElementById('forgot-password-link').addEventListener('click', e => {
    e.preventDefault();
    Utils.showModal('modal-recovery');
  });

  document.getElementById('recovery-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('recovery-email').value;
    Utils.hideModal('modal-recovery');
    Utils.toast(`Se ha enviado un enlace de recuperación a ${email}`, 'info', 5000);
  });

  // Toggle password visibility
  document.getElementById('toggle-password').addEventListener('click', () => {
    const input = document.getElementById('login-password');
    const btn = document.getElementById('toggle-password');
    if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
    else { input.type = 'password'; btn.textContent = '👁️'; }
  });
}

window.Auth = Auth;
window.initLogin = initLogin;
