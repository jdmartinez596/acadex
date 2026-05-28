// ============================================================
// ACADEX — Autenticación con Supabase Auth
// ============================================================

const Auth = {
  _session: null,

  async init() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await this._restoreSession(data.session);
    }
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) { this._session = null; }
    });
    return !!this._session;
  },

  async _restoreSession(supabaseSession) {
    const authId = supabaseSession.user.id;
    const { data: user } = await supabase.from('usuarios').select('id, nombre, apellido, email, rol, estudiante_id').eq('auth_id', authId).single();
    if (user) {
      this._session = { userId: user.id, rol: user.rol, nombre: user.nombre, apellido: user.apellido, email: user.email, estudianteId: user.estudiante_id, loginAt: Date.now() };
    }
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { ok: false, error: error.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : error.message };
    await this._restoreSession(data.session);
    return { ok: true, user: this._session };
  },

  async loginWithDocumento(documento, password) {
    return this.login(`${documento.trim()}@estudiante.acadex.app`, password);
  },

  async logout() {
    await supabase.auth.signOut();
    this._session = null;
  },

  getSession() { return this._session; },
  isLoggedIn() { return !!this._session; },

  can(action) {
    const s = this._session;
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
    const s = this._session;
    if (!s) return false;
    return roles.includes(s.rol);
  }
};

// ---- Login UI ----
async function initLogin() {
  await DB.init();
  const page = document.getElementById('login-page');
  const app  = document.getElementById('app-shell');

  const loggedIn = await Auth.init();
  if (loggedIn) {
    page.style.display = 'none';
    app.classList.add('visible');
    App.init();
    return;
  }

  let selectedRol = 'admin';
  const emailInput = document.getElementById('login-email');
  const emailLabel = document.getElementById('login-email-label');
  const demoBox   = document.getElementById('demo-credentials');

  function updateFormForRol(rol) {
    if (rol === 'estudiante') {
      emailLabel.textContent = 'Número de Documento';
      emailInput.type = 'text';
      emailInput.placeholder = 'ej: 1001234567';
      const est = DB.getEstudiantes();
      const primerEst = est.find(e => e.activo);
      if (primerEst) {
        emailInput.value = primerEst.documento;
        document.getElementById('login-password').value = primerEst.documento;
      }
      if (demoBox) {
        demoBox.innerHTML = est.filter(e => e.activo).slice(0, 3).map(e =>
          `<span style="display:block">${e.documento} / ${e.documento} — ${e.nombre} ${e.apellido}</span>`
        ).join('');
      }
    } else {
      emailLabel.textContent = 'Correo Electrónico';
      emailInput.type = 'email';
      const demos = {
        admin:   { email: 'admin@acadex.com',      pwd: 'admin123' },
        docente: { email: 'docente@acadex.com',    pwd: 'docente123' }
      };
      emailInput.placeholder = demos[rol].email;
      emailInput.value = demos[rol].email;
      document.getElementById('login-password').value = demos[rol].pwd;
      if (demoBox) {
        demoBox.innerHTML =
          `<span style="display:block">${demos.admin.email} / ${demos.admin.pwd}</span>` +
          `<span style="display:block">${demos.docente.email} / ${demos.docente.pwd}</span>`;
      }
    }
  }

  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRol = btn.dataset.rol;
      updateFormForRol(selectedRol);
    });
  });

  document.querySelector('.role-btn[data-rol="admin"]').classList.add('active');
  updateFormForRol('admin');

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const value = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-inline"></span> Ingresando...';

    const result = selectedRol === 'estudiante' ? await Auth.loginWithDocumento(value, password) : await Auth.login(value, password);
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
  });

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

  document.getElementById('toggle-password').addEventListener('click', () => {
    const input = document.getElementById('login-password');
    const btn = document.getElementById('toggle-password');
    if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
    else { input.type = 'password'; btn.textContent = '👁️'; }
  });
}

window.Auth = Auth;
window.initLogin = initLogin;
