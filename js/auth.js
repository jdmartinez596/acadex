// ============================================================
// ACADEX — Autenticación (custom contra tabla usuarios)
// ============================================================

const Auth = {
  SESSION_KEY: 'acadex_session',

  async init() {
    const stored = this.getSession();
    if (stored) {
      // Verify user still exists in DB
      const { data } = await supabase.from('usuarios').select('id').eq('id', stored.userId).single();
      if (!data) { this.logout(); return false; }
      return true;
    }
    return false;
  },

  async login(email, password) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, rol, estudiante_id, password')
      .eq('email', email.trim().toLowerCase())
      .single();
    if (!error && data) {
      if (data.password !== password) return { ok: false, error: 'Contraseña incorrecta' };
      const session = {
        userId: data.id, rol: data.rol, nombre: data.nombre,
        apellido: data.apellido, email: data.email,
        estudianteId: data.estudiante_id,
        institucionId: data.institucion_id || null,
        loginAt: Date.now()
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return { ok: true, user: session };
    }
    // Fallback: buscar en caché local si Supabase falla
    const local = DB.getUsuarios().find(u => u.email === email.trim().toLowerCase() && u.activo !== false);
    if (!local) return { ok: false, error: 'Usuario no encontrado' };
    if (local.password !== password) return { ok: false, error: 'Contraseña incorrecta' };
    const session = {
      userId: local.id, rol: local.rol, nombre: local.nombre,
      apellido: local.apellido, email: local.email,
      estudianteId: local.estudiante_id || local.estudianteId,
      institucionId: local.institucionId || null,
      loginAt: Date.now()
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  },

  async loginWithDocumento(documento, password) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, rol, estudiante_id, password')
      .eq('documento', documento.trim())
      .single();
    if (!error && data) {
      if (data.password !== password) return { ok: false, error: 'Documento/contraseña incorrectos' };
      const session = {
        userId: data.id, rol: data.rol, nombre: data.nombre,
        apellido: data.apellido, email: data.email,
        estudianteId: data.estudiante_id,
        institucionId: data.institucion_id || null,
        loginAt: Date.now()
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return { ok: true, user: session };
    }
    // Fallback: buscar en caché local si Supabase falla
    let local = DB.getUsuarios().find(u => u.documento === documento.trim() && u.activo !== false);
    if (!local) {
      // Último recurso: el estudiante existe pero su usuario no fue creado; validar con password y crear sesión temporal
      const est = DB.getEstudiantes().find(e => e.documento === documento.trim() && e.activo !== false);
      if (est) {
        console.warn('Usuario no encontrado para estudiante', est.id, '- creando sesión temporal');
        local = { id: 'u_' + est.id, rol: 'estudiante', nombre: est.nombre, apellido: est.apellido, email: est.email, password: est.documento, estudianteId: est.id, institucionId: est.institucionId || null };
      }
    }
    if (!local) return { ok: false, error: 'Estudiante no encontrado' };
    if (local.password !== password) return { ok: false, error: 'Documento/contraseña incorrectos' };
    const session = {
      userId: local.id, rol: local.rol, nombre: local.nombre,
      apellido: local.apellido, email: local.email,
      estudianteId: local.estudiante_id || local.estudianteId,
      institucionId: local.institucionId || null,
      loginAt: Date.now()
    };
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
      super_admin: ['all'],
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
async function initLogin() {
  await DB.init();
  const page = document.getElementById('login-page');
  const app  = document.getElementById('app-shell');

  const loggedIn = await Auth.init();
  if (loggedIn) {
    page.style.display = 'none';
    app.classList.add('visible');
    await App.init();
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
      await App.init();
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
