// ============================================================
// ACADEX — Cliente Supabase (fetch directo, sin librería externa)
// ============================================================

const AUTH_KEY = 'sb-auth-token';

const supabase = (() => {
  const BASE = SUPABASE_URL;
  const ANON = SUPABASE_ANON_KEY;

  // ---- Tokens ----
  // Limpiar cualquier token viejo de Supabase Auth (ahora usamos auth custom)
  localStorage.removeItem(AUTH_KEY);

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
  }
  function saveSession(s) { localStorage.setItem(AUTH_KEY, JSON.stringify(s)); }
  function clearSession() { localStorage.removeItem(AUTH_KEY); }

  async function ensureToken() {
    const s = loadSession();
    if (!s) return null;
    if (s.expires_at && Date.now() > s.expires_at) {
      return refreshToken(s.refresh_token);
    }
    return s;
  }

  async function refreshToken(rt) {
    const res = await fetch(`${BASE}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON },
      body: JSON.stringify({ refresh_token: rt })
    });
    if (!res.ok) { clearSession(); return null; }
    const d = await res.json();
    const s = { access_token: d.access_token, refresh_token: d.refresh_token, user: d.user, expires_at: Date.now() + (d.expires_in || 3600) * 1000 };
    saveSession(s);
    return s;
  }

  function headers(token) {
    const h = { apikey: ANON, 'Content-Type': 'application/json' };
    if (token?.access_token) h['Authorization'] = 'Bearer ' + token.access_token;
    return h;
  }

  // ---- Auth state listeners ----
  const listeners = [];
  function emit(event, session) { listeners.forEach(l => l(event, session)); }

  // ---- Query builder para REST ----
  function buildUrl(table, opts) {
    const params = new URLSearchParams();
    params.set('select', opts.select || '*');
    if (opts.filters) opts.filters.forEach(f => params.set(f.col, f.op + '.' + f.val));
    if (opts.order) params.set('order', opts.order);
    if (opts.limit) params.set('limit', opts.limit);
    return `${BASE}/rest/v1/${table}?${params}`;
  }

  return {
    auth: {
      async getSession() {
        const s = loadSession();
        if (s && s.expires_at && Date.now() > s.expires_at) {
          const ns = await refreshToken(s.refresh_token);
          return { data: { session: ns } };
        }
        return { data: { session: s || null } };
      },

      async signInWithPassword({ email, password }) {
        const res = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: ANON },
          body: JSON.stringify({ email, password })
        });
        const d = await res.json();
        if (!res.ok) return { data: null, error: new Error(d.error_description || d.msg || 'Credenciales incorrectas') };
        const session = { access_token: d.access_token, refresh_token: d.refresh_token, user: d.user, expires_at: Date.now() + (d.expires_in || 3600) * 1000 };
        saveSession(session);
        emit('SIGNED_IN', session);
        return { data: { session, user: d.user }, error: null };
      },

      async signOut() {
        const s = loadSession();
        if (s?.access_token) {
          await fetch(`${BASE}/auth/v1/logout`, {
            method: 'POST', headers: headers(s)
          }).catch(() => {});
        }
        clearSession();
        emit('SIGNED_OUT', null);
      },

      onAuthStateChange(cb) {
        listeners.push(cb);
        // fire initial state
        const s = loadSession();
        cb('INITIAL_SESSION', s);
        return {
          data: {
            subscription: {
              unsubscribe: () => { const i = listeners.indexOf(cb); if (i > -1) listeners.splice(i, 1); }
            }
          }
        };
      }
    },

    from(table) {
      const opts = { select: '*', filters: [], order: null, limit: null, single: false };
      const chain = {
        select(cols) { opts.select = cols || '*'; return chain; },
        eq(col, val) { opts.filters.push({ col, op: 'eq', val: String(val) }); return chain; },
        neq(col, val) { opts.filters.push({ col, op: 'neq', val: String(val) }); return chain; },
        is(col, val) { opts.filters.push({ col, op: 'is', val: String(val) }); return chain; },
        in(col, vals) { opts.filters.push({ col, op: 'in', val: '(' + vals.map(String).join(',') + ')' }); return chain; },
        order(col, dir) { opts.order = col + '.' + (dir || 'asc'); return chain; },
        single() { opts.single = true; return chain; },
        then(onFulfilled, onRejected) {
          const promise = (async () => {
            const token = await ensureToken();
            const url = buildUrl(table, opts);
            const res = await fetch(url, { headers: headers(token) });
            if (!res.ok) {
              const e = await res.json().catch(() => ({ message: res.statusText }));
              return { data: null, error: e };
            }
            let data = await res.json();
            if (opts.single) data = data?.[0] || null;
            return { data, error: null };
          })();
          return promise.then(onFulfilled, onRejected);
        }
      };
      // Make it also work as a real Promise for chaining
      chain.catch = function(fn) { return Promise.resolve(this).catch(fn); };
      return chain;
    },

    storage: {
      from(bucket) {
        return {
          async upload(path, file) {
            const token = await ensureToken();
            const h = { apikey: ANON };
            if (token?.access_token) h['Authorization'] = 'Bearer ' + token.access_token;
            const res = await fetch(`${BASE}/storage/v1/object/${bucket}/${path}`, {
              method: 'POST', headers: h, body: file
            });
            if (!res.ok) { const e = await res.json().catch(() => ({ message: res.statusText })); return { data: null, error: e }; }
            return { data: { path }, error: null };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `${BASE}/storage/v1/object/public/${bucket}/${path}` } };
          },
          async remove(paths) {
            const token = await ensureToken();
            const res = await fetch(`${BASE}/storage/v1/object/${bucket}`, {
              method: 'DELETE',
              headers: { ...headers(token), 'Content-Type': 'application/json' },
              body: JSON.stringify({ prefixes: paths })
            });
            if (!res.ok) { const e = await res.json().catch(() => ({})); return { data: null, error: e }; }
            return { data: {}, error: null };
          }
        };
      }
    }
  };
})();
