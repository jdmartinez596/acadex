// ============================================================
// ACADEX — Capa de Datos (Supabase + Caché local)
// ============================================================

const DB = {
  _data: {
    config: null,
    instituciones: [],
    usuarios: [],
    periodos: [],
    grados: [],
    grupos: [],
    materias: [],
    estudiantes: [],
    notas: [],
    asistencia: [],
    actividades: [],
    notificaciones: []
  },

  async init() {
    if (this._data.config) return this;
    await this._loadAll();
    return this;
  },

  async _loadAll() {
    const loaders = [
      this._loadTable('config', r => this._mapConfig(r)),
      this._loadTable('instituciones', r => this._mapRow(r)),
      this._loadTable('usuarios', r => this._mapRow(r), 'id,nombre,apellido,email,documento,rol,avatar,activo,estudiante_id,creado'),
      this._loadTable('periodos', r => this._mapRow(r)),
      this._loadTable('grados', r => this._mapRow(r)),
      this._loadTable('grupos', r => this._mapGrupo(r)),
      this._loadTable('materias', r => this._mapRow(r)),
      this._loadTable('estudiantes', r => this._mapEstudiante(r)),
      this._loadTable('notas', r => this._mapRow(r)),
      this._loadTable('asistencia', r => this._mapRow(r)),
      this._loadTable('actividades', r => this._mapRow(r)),
      this._loadTable('notificaciones', r => this._mapRow(r))
    ];
    const results = await Promise.allSettled(loaders);
    results.forEach((r, i) => { if (r.status === 'rejected') console.warn('DB load error:', r.reason); });
    // Fallback a localStorage si alguna tabla quedó vacía
    this._loadFromLocalStorage();
    // Seed datos demo si no hay usuarios (primera carga)
    this._seedDefaults();
  },

  _seedDefaults() {
    if (this._data.usuarios.length > 0) return;
    const defs = [
      { id: 'admin', nombre: 'Admin', apellido: 'Sistema', email: 'admin@acadex.com', documento: 'ADMIN', password: 'admin123', rol: 'admin', activo: true, institucionId: null },
      { id: 'docente', nombre: 'Docente', apellido: 'Demo', email: 'docente@acadex.com', documento: 'DOCENTE', password: 'docente123', rol: 'docente', activo: true, institucionId: null }
    ];
    defs.forEach(u => {
      if (!this._data.usuarios.find(x => x.email === u.email)) {
        this._data.usuarios.push(u);
      }
    });
    if (!this._data.config) {
      this._data.config = {
        id: 1, institucion: { nombre: 'Mi Institución', direccion: '', telefono: '', email: '', logo: '', lema: '' },
        escala: { minAprobatorio: 3, maxValor: 5, decimales: 1 },
        tiposActividad: [
          { id: 'examen', nombre: 'Examen', porcentaje: 30, color: '#e74c3c' },
          { id: 'quiz', nombre: 'Quiz', porcentaje: 20, color: '#f39c12' },
          { id: 'tarea', nombre: 'Tarea', porcentaje: 20, color: '#3498db' },
          { id: 'proyecto', nombre: 'Proyecto', porcentaje: 30, color: '#2ecc71' }
        ],
        boletinTemplate: { mostrarLogo: true, mostrarEscala: true, mensajePersonalizado: '' },
        darkMode: false, creado: new Date().toISOString().split('T')[0]
      };
    }
    if (this._data.instituciones.length === 0) {
      this._data.instituciones.push({ id: 'inst_default', nombre: 'Institución Principal', direccion: '', telefono: '', email: '', activo: true });
    }
    this._persistLocal();
  },

  _loadFromLocalStorage() {
    const saved = localStorage.getItem('acadex_data');
    if (!saved) return;
    try {
      const backup = JSON.parse(saved);
      for (const key of Object.keys(this._data)) {
        if (key === 'config' && !this._data.config && backup.config) {
          this._data.config = backup.config;
        } else if (Array.isArray(this._data[key]) && Array.isArray(backup[key]) && backup[key].length > 0) {
          // Merge: mantener items de Supabase, agregar los que falten del backup local
          const existingIds = new Set(this._data[key].map(i => i.id));
          const missing = backup[key].filter(i => !existingIds.has(i.id));
          if (missing.length > 0) {
            this._data[key] = [...this._data[key], ...missing];
            console.log(`Restored ${missing.length} ${key} from localStorage backup`);
          }
        }
      }
    } catch (e) { console.warn('localStorage fallback error:', e); }
  },

  _persistLocal() {
    try { localStorage.setItem('acadex_data', JSON.stringify(this._data)); } catch (e) { /* quota exceeded, ignore */ }
  },

  _getInstId() {
    const s = Auth.getSession();
    if (!s || s.rol === 'super_admin') return s?.instVista || null;
    return s.institucionId || null;
  },

  _filterByInst(data) {
    const instId = this._getInstId();
    if (!instId) return data;
    return data.filter(d => d.institucionId === instId || !d.institucionId);
  },

  async _loadTable(name, mapper, columns = '*') {
    try {
      const { data, error } = await supabase.from(name).select(columns);
      if (error) throw error;
      const key = name === 'config' ? name : name;
      if (name === 'config') {
        this._data.config = data?.[0] ? mapper(data[0]) : null;
        return;
      }
      this._data[name] = (data || []).map(mapper);
    } catch (e) {
      if (e?.message?.includes('Could not find the table') || e?.code === '42P01') {
        console.warn(`Tabla '${name}' no existe en Supabase — usando solo caché local`);
        return;
      }
      throw e;
    }
  },

  _mapRow(row) {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[this._toCamel(k)] = v;
    }
    return out;
  },

  _mapConfig(row) {
    const c = this._mapRow(row);
    if (typeof c.institucion === 'string') c.institucion = JSON.parse(c.institucion);
    if (typeof c.escala === 'string') c.escala = JSON.parse(c.escala);
    if (typeof c.tiposActividad === 'string') c.tiposActividad = JSON.parse(c.tiposActividad);
    if (typeof c.boletinTemplate === 'string') c.boletinTemplate = JSON.parse(c.boletinTemplate);
    c.darkMode = false;
    return c;
  },

  _mapGrupo(row) {
    return { ...this._mapRow(row), director: row.director };
  },

  _mapEstudiante(row) {
    const e = this._mapRow(row);
    if (typeof e.acudiente === 'string') e.acudiente = JSON.parse(e.acudiente);
    return e;
  },

  _toCamel(str) { return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); },
  _toSnake(str) { return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase()); },

  _snakeObj(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[this._toSnake(k)] = v;
    }
    return out;
  },

  async reset() {
    const tables = ['config','instituciones','usuarios','periodos','grados','grupos','materias','estudiantes','notas','asistencia','actividades','notificaciones'];
    for (const t of tables) {
      try { await supabase.from(t).delete().neq('id', t === 'config' ? '0' : ''); } catch (e) { console.warn('DB reset error:', t, e); }
    }
    Object.keys(this._data).forEach(k => {
      if (Array.isArray(this._data[k])) this._data[k] = [];
      else this._data[k] = null;
    });
    this._persistLocal();
  },

  // ---- Helpers ----

  // ---- Config ----
  getConfig() { return this._data.config; },
  async updateConfig(key, value) {
    this._data.config[key] = value;
    try { await supabase.from('config').update({ [this._toSnake(key)]: typeof value === 'object' ? JSON.stringify(value) : value }).eq('id', 1); } catch (e) { console.warn('updateConfig error:', e); }
    this._persistLocal();
  },
  async updateInstitucion(data) {
    const inst = { ...this._data.config.institucion, ...data };
    this._data.config.institucion = inst;
    try { await supabase.from('config').update({ institucion: JSON.stringify(inst) }).eq('id', 1); } catch (e) { console.warn('updateInstitucion error:', e); }
    this._persistLocal();
  },
  async updateEscala(data) {
    const esc = { ...this._data.config.escala, ...data };
    this._data.config.escala = esc;
    try { await supabase.from('config').update({ escala: JSON.stringify(esc) }).eq('id', 1); } catch (e) { console.warn('updateEscala error:', e); }
    this._persistLocal();
  },
  async updateTiposActividad(tipos) {
    this._data.config.tiposActividad = tipos;
    try { await supabase.from('config').update({ tipos_actividad: JSON.stringify(tipos) }).eq('id', 1); } catch (e) { console.warn('updateTiposActividad error:', e); }
    this._persistLocal();
  },

  // ---- Instituciones ----
  getInstituciones() {
    if (!this._data.instituciones.length) {
      this._data.instituciones.push({ id: 'inst_default', nombre: 'Institución Principal', direccion: '', telefono: '', email: '', activo: true });
      this._persistLocal();
    }
    return this._data.instituciones;
  },
  getInstitucion(id) {
    if (!this._data.instituciones.length) this.getInstituciones();
    return this._data.instituciones.find(i => i.id === id);
  },
  async addInstitucion(data) {
    const id = 'inst_' + data.nombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (this._data.instituciones.find(i => i.id === id)) throw new Error('Ya existe una institución con ese nombre');
    const inst = { id, nombre: data.nombre, direccion: data.direccion || '', telefono: data.telefono || '', email: data.email || '', activo: true };
    await supabase.from('instituciones').insert(inst).catch(e => console.warn('No se pudo guardar en Supabase (tabla no existe?):', e.message));
    this._data.instituciones.push(inst);
    this._persistLocal();
    return inst;
  },
  async updateInstitucion(id, data) {
    await supabase.from('instituciones').update(data).eq('id', id).catch(e => console.warn('No se pudo actualizar en Supabase:', e.message));
    const idx = this._data.instituciones.findIndex(i => i.id === id);
    if (idx > -1) this._data.instituciones[idx] = { ...this._data.instituciones[idx], ...data };
    this._persistLocal();
  },
  async deleteInstitucion(id) {
    await supabase.from('instituciones').update({ activo: false }).eq('id', id).catch(e => console.warn('No se pudo desactivar en Supabase:', e.message));
    const idx = this._data.instituciones.findIndex(i => i.id === id);
    if (idx > -1) this._data.instituciones[idx].activo = false;
    this._persistLocal();
  },

  // ---- Usuarios ----
  getUsuarios() { return this._filterByInst(this._data.usuarios); },
  getUsuario(id) { return this._data.usuarios.find(u => u.id === id); },
  getUsuarioByEmail(email) { return this._filterByInst(this._data.usuarios).find(u => u.email === email); },
  async addUsuario(u) {
    u.id = 'u' + Date.now();
    u.creado = new Date().toISOString().split('T')[0];
    const s = Auth.getSession();
    if (s && s.institucionId && !u.institucionId) u.institucionId = s.institucionId;
    const { error } = await supabase.from('usuarios').insert(this._snakeObj(u));
    if (error) throw new Error('Error al crear usuario: ' + (error.message || JSON.stringify(error)));
    this._data.usuarios.push(u);
    this._persistLocal();
    return u;
  },
  async updateUsuario(id, data) {
    await supabase.from('usuarios').update(this._snakeObj(data)).eq('id', id);
    const idx = this._data.usuarios.findIndex(u => u.id === id);
    if (idx > -1) { this._data.usuarios[idx] = { ...this._data.usuarios[idx], ...data }; }
    this._persistLocal();
  },
  async deleteUsuario(id) {
    await supabase.from('usuarios').delete().eq('id', id);
    this._data.usuarios = this._data.usuarios.filter(u => u.id !== id);
    this._persistLocal();
  },

  // ---- Períodos ----
  getPeriodos() { return this._filterByInst(this._data.periodos); },
  getPeriodo(id) { return this._data.periodos.find(p => p.id === id); },
  getPeriodoActivo() { return this._filterByInst(this._data.periodos).find(p => p.activo); },
  async addPeriodo(p) {
    p.id = 'p' + Date.now();
    const { error } = await supabase.from('periodos').insert(this._snakeObj(p));
    if (error) throw new Error('Error al crear período: ' + (error.message || JSON.stringify(error)));
    this._data.periodos.push(p);
    this._persistLocal();
    return p;
  },
  async updatePeriodo(id, data) {
    await supabase.from('periodos').update(this._snakeObj(data)).eq('id', id);
    const idx = this._data.periodos.findIndex(p => p.id === id);
    if (idx > -1) { this._data.periodos[idx] = { ...this._data.periodos[idx], ...data }; }
    this._persistLocal();
  },
  async deletePeriodo(id) {
    await supabase.from('periodos').delete().eq('id', id);
    this._data.periodos = this._data.periodos.filter(p => p.id !== id);
    this._persistLocal();
  },

  // ---- Grados ----
  getGrados() { return this._filterByInst(this._data.grados); },
  getGrado(id) { return this._data.grados.find(g => g.id === id); },
  async addGrado(g) {
    g.id = 'g' + Date.now();
    const { error } = await supabase.from('grados').insert(this._snakeObj(g));
    if (error) throw new Error('Error al crear grado: ' + (error.message || JSON.stringify(error)));
    this._data.grados.push(g);
    this._persistLocal();
    return g;
  },
  async updateGrado(id, data) {
    await supabase.from('grados').update(this._snakeObj(data)).eq('id', id);
    const idx = this._data.grados.findIndex(g => g.id === id);
    if (idx > -1) { this._data.grados[idx] = { ...this._data.grados[idx], ...data }; }
    this._persistLocal();
  },
  async deleteGrado(id) {
    await supabase.from('grados').delete().eq('id', id);
    await supabase.from('grupos').delete().eq('grado_id', id);
    this._data.grados = this._data.grados.filter(g => g.id !== id);
    this._data.grupos = this._data.grupos.filter(gr => gr.gradoId !== id);
    this._persistLocal();
  },

  // ---- Grupos ----
  getGrupos() { return this._filterByInst(this._data.grupos); },
  getGrupo(id) { return this._data.grupos.find(g => g.id === id); },
  getGruposByGrado(gradoId) { return this._filterByInst(this._data.grupos).filter(g => g.gradoId === gradoId); },
  async addGrupo(g) {
    g.id = 'gr' + Date.now();
    const { error } = await supabase.from('grupos').insert(this._snakeObj(g));
    if (error) throw new Error('Error al crear grupo: ' + (error.message || JSON.stringify(error)));
    this._data.grupos.push(g);
    this._persistLocal();
    return g;
  },
  async updateGrupo(id, data) {
    await supabase.from('grupos').update(this._snakeObj(data)).eq('id', id);
    const idx = this._data.grupos.findIndex(g => g.id === id);
    if (idx > -1) { this._data.grupos[idx] = { ...this._data.grupos[idx], ...data }; }
    this._persistLocal();
  },
  async deleteGrupo(id) {
    await supabase.from('grupos').delete().eq('id', id);
    this._data.grupos = this._data.grupos.filter(g => g.id !== id);
    this._persistLocal();
  },

  // ---- Materias ----
  getMaterias() { return this._filterByInst(this._data.materias); },
  getMateria(id) { return this._data.materias.find(m => m.id === id); },
  getMateriasByGrado(gradoId) { return this._filterByInst(this._data.materias).filter(m => m.gradoId === gradoId); },
  getMateriasByDocente(docenteId) { return this._filterByInst(this._data.materias).filter(m => m.docenteId === docenteId); },
  async addMateria(m) {
    m.id = 'm' + Date.now();
    const { error } = await supabase.from('materias').insert(this._snakeObj(m));
    if (error) throw new Error('Error al crear materia: ' + (error.message || JSON.stringify(error)));
    this._data.materias.push(m);
    this._persistLocal();
    return m;
  },
  async updateMateria(id, data) {
    await supabase.from('materias').update(this._snakeObj(data)).eq('id', id);
    const idx = this._data.materias.findIndex(m => m.id === id);
    if (idx > -1) { this._data.materias[idx] = { ...this._data.materias[idx], ...data }; }
    this._persistLocal();
  },
  async deleteMateria(id) {
    await supabase.from('materias').delete().eq('id', id);
    this._data.materias = this._data.materias.filter(m => m.id !== id);
    this._persistLocal();
  },

  // ---- Estudiantes ----
  getEstudiantes() { return this._filterByInst(this._data.estudiantes); },
  getEstudiante(id) { return this._data.estudiantes.find(e => e.id === id); },
  getEstudiantesByGrupo(grupoId) { return this._filterByInst(this._data.estudiantes).filter(e => e.grupoId === grupoId && e.activo); },
  getEstudiantesByGrado(gradoId) { return this._filterByInst(this._data.estudiantes).filter(e => e.gradoId === gradoId && e.activo); },
  getEstudianteByDocumento(doc) { return this._filterByInst(this._data.estudiantes).find(e => e.documento === doc && e.activo); },
  async addEstudiante(e) {
    e.id = 'e' + Date.now();
    e.creado = new Date().toISOString().split('T')[0];
    e.activo = true;
    const s = Auth.getSession();
    if (s && s.institucionId) e.institucionId = s.institucionId;
    const snake = this._snakeObj(e);
    if (typeof e.acudiente === 'object') snake.acudiente = JSON.stringify(snake.acudiente);
    const { error: estError } = await supabase.from('estudiantes').insert(snake);
    if (estError) throw new Error('Error al guardar estudiante: ' + (estError.message || JSON.stringify(estError)));
    this._data.estudiantes.push(e);
    // Crear usuario automáticamente
    const usuario = {
      id: 'u_' + e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      email: e.email || `${e.documento}@estudiante.acadex.app`,
      documento: e.documento,
      password: e.documento,
      rol: 'estudiante',
      estudiante_id: e.id,
      activo: true
    };
    const { error: userError } = await supabase.from('usuarios').insert(this._snakeObj(usuario));
    if (userError) console.warn('Usuario creado en caché local pero error en Supabase:', userError);
    this._data.usuarios.push(usuario);
    this._persistLocal();
    return e;
  },
  async updateEstudiante(id, data) {
    const snake = this._snakeObj(data);
    if (typeof data.acudiente === 'object') snake.acudiente = JSON.stringify(data.acudiente);
    const { error } = await supabase.from('estudiantes').update(snake).eq('id', id);
    if (error) throw new Error('Error al actualizar: ' + (error.message || JSON.stringify(error)));
    const idx = this._data.estudiantes.findIndex(e => e.id === id);
    if (idx > -1) { this._data.estudiantes[idx] = { ...this._data.estudiantes[idx], ...data }; }
    // Sincronizar usuario del estudiante
    const usuario = this._data.usuarios.find(u => (u.estudiante_id || u.estudianteId) === id);
    if (usuario) {
      const syncData = {};
      if (data.nombre) syncData.nombre = data.nombre;
      if (data.apellido) syncData.apellido = data.apellido;
      if (data.documento) syncData.documento = data.documento;
      if (data.email) syncData.email = data.email;
      if (data.activo !== undefined) syncData.activo = data.activo;
      Object.assign(usuario, syncData);
      await supabase.from('usuarios').update(this._snakeObj(syncData)).eq('estudiante_id', id).catch(e => console.warn('Error syncing user:', e));
    }
    this._persistLocal();
  },
  async deleteEstudiante(id) {
    await supabase.from('estudiantes').update({ activo: false }).eq('id', id);
    const idx = this._data.estudiantes.findIndex(e => e.id === id);
    if (idx > -1) { this._data.estudiantes[idx].activo = false; }
    // Desactivar usuario del estudiante
    const usuario = this._data.usuarios.find(u => (u.estudiante_id || u.estudianteId) === id);
    if (usuario) {
      usuario.activo = false;
      await supabase.from('usuarios').update({ activo: false }).eq('estudiante_id', id).catch(e => console.warn('Error disabling user:', e));
    }
    this._persistLocal();
  },

  // ---- Notas ----
  getNotas() { return this._filterByInst(this._data.notas); },
  getNotasByEstudiante(estudianteId) { return this._filterByInst(this._data.notas).filter(n => n.estudianteId === estudianteId); },
  getNotasByGrupoMateriaPeriodo(grupoId, materiaId, periodoId) {
    const estudiantes = this.getEstudiantesByGrupo(grupoId).map(e => e.id);
    return this._filterByInst(this._data.notas).filter(n => estudiantes.includes(n.estudianteId) && n.materiaId === materiaId && n.periodoId === periodoId);
  },
  getNotasByEstudianteMateriaPeriodo(eId, mId, pId) {
    return this._filterByInst(this._data.notas).filter(n => n.estudianteId === eId && n.materiaId === mId && n.periodoId === pId);
  },
  async addNota(n) {
    n.id = 'n' + Date.now() + Math.random().toString(36).substr(2, 5);
    const { error } = await supabase.from('notas').insert(this._snakeObj(n));
    if (error) throw new Error('Error al guardar nota: ' + (error.message || JSON.stringify(error)));
    this._data.notas.push(n);
    this._persistLocal();
    return n;
  },
  async updateNota(id, data) {
    await supabase.from('notas').update(this._snakeObj(data)).eq('id', id);
    const idx = this._data.notas.findIndex(n => n.id === id);
    if (idx > -1) { this._data.notas[idx] = { ...this._data.notas[idx], ...data }; }
    this._persistLocal();
  },
  async deleteNota(id) {
    await supabase.from('notas').delete().eq('id', id);
    this._data.notas = this._data.notas.filter(n => n.id !== id);
    this._persistLocal();
  },

  calcularPromedioPeriodo(estudianteId, materiaId, periodoId) {
    const notas = this.getNotasByEstudianteMateriaPeriodo(estudianteId, materiaId, periodoId);
    if (!notas.length) return null;
    const tipos = this.getConfig().tiposActividad;
    let totalPeso = 0, sumaP = 0;
    tipos.forEach(t => {
      const ns = notas.filter(n => n.tipo === t.id);
      if (ns.length > 0) {
        const avg = ns.reduce((a, b) => a + b.valor, 0) / ns.length;
        sumaP += avg * (t.porcentaje / 100);
        totalPeso += t.porcentaje / 100;
      }
    });
    if (totalPeso === 0) return null;
    return Math.round((sumaP / totalPeso) * 100) / 100;
  },

  calcularPromedioFinal(estudianteId, materiaId) {
    const periodos = this.getPeriodos();
    let total = 0, count = 0;
    periodos.forEach(p => {
      const avg = this.calcularPromedioPeriodo(estudianteId, materiaId, p.id);
      if (avg !== null) { total += avg; count++; }
    });
    return count > 0 ? Math.round((total / count) * 100) / 100 : null;
  },

  // ---- Asistencia ----
  getAsistencia() { return this._filterByInst(this._data.asistencia); },
  getAsistenciaByFechaGrupoMateria(fecha, grupoId, materiaId) {
    const estudiantes = this.getEstudiantesByGrupo(grupoId).map(e => e.id);
    return this._filterByInst(this._data.asistencia).filter(a => a.fecha === fecha && a.materiaId === materiaId && estudiantes.includes(a.estudianteId));
  },
  getAsistenciaByEstudiante(estudianteId) {
    return this._filterByInst(this._data.asistencia).filter(a => a.estudianteId === estudianteId);
  },
  async setAsistencia(estudianteId, materiaId, grupoId, fecha, estado, justificacion = null) {
    const existing = this._data.asistencia.find(a => a.estudianteId === estudianteId && a.materiaId === materiaId && a.fecha === fecha);
    if (existing) {
      const { error } = await supabase.from('asistencia').update({ estado, justificacion }).eq('id', existing.id);
      if (error) throw new Error('Error al actualizar asistencia: ' + (error.message || JSON.stringify(error)));
      existing.estado = estado;
      existing.justificacion = justificacion;
    } else {
      const id = 'a' + Date.now() + Math.random().toString(36).substr(2, 5);
      const { error } = await supabase.from('asistencia').insert({ id, estudiante_id: estudianteId, materia_id: materiaId, grupo_id: grupoId, fecha, estado, justificacion });
      if (error) throw new Error('Error al guardar asistencia: ' + (error.message || JSON.stringify(error)));
      this._data.asistencia.push({ id, estudianteId, materiaId, grupoId, fecha, estado, justificacion });
    }
    this._persistLocal();
  },
  calcularPorcentajeAsistencia(estudianteId, materiaId) {
    const reg = materiaId ? this._data.asistencia.filter(a => a.estudianteId === estudianteId && a.materiaId === materiaId)
                          : this._data.asistencia.filter(a => a.estudianteId === estudianteId);
    if (!reg.length) return 100;
    const presentes = reg.filter(a => a.estado === 'presente' || a.estado === 'justificado').length;
    return Math.round((presentes / reg.length) * 100);
  },

  // ---- Actividades ----
  getActividades() { return this._filterByInst(this._data.actividades); },
  async addActividad(a) {
    a.id = 'act' + Date.now();
    const { error } = await supabase.from('actividades').insert(this._snakeObj(a));
    if (error) throw new Error('Error al crear actividad: ' + (error.message || JSON.stringify(error)));
    this._data.actividades.push(a);
    this._persistLocal();
    return a;
  },
  async deleteActividad(id) {
    await supabase.from('actividades').delete().eq('id', id);
    this._data.actividades = this._data.actividades.filter(a => a.id !== id);
    this._persistLocal();
  },

  // ---- Notificaciones ----
  getNotificaciones(usuarioId) { return this._filterByInst(this._data.notificaciones || []).filter(n => !usuarioId || n.usuarioId === usuarioId); },
  getNotificacionesNoLeidas(usuarioId) { return this.getNotificaciones(usuarioId).filter(n => !n.leida); },
  async marcarLeida(id) {
    const { error } = await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
    if (!error) { const n = this._data.notificaciones.find(n => n.id === id); if (n) n.leida = true; }
    this._persistLocal();
  },
  async marcarTodasLeidas(usuarioId) {
    await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', usuarioId);
    this._data.notificaciones.filter(n => n.usuarioId === usuarioId).forEach(n => n.leida = true);
    this._persistLocal();
  },
  async addNotificacion(n) {
    n.id = 'not' + Date.now();
    n.fecha = new Date().toISOString().split('T')[0];
    n.leida = false;
    if (!this._data.notificaciones) this._data.notificaciones = [];
    const { error } = await supabase.from('notificaciones').insert(this._snakeObj(n));
    if (error) throw new Error('Error al crear notificación: ' + (error.message || JSON.stringify(error)));
    this._data.notificaciones.unshift(n);
    this._persistLocal();
  },

  // ---- Sincronización Forzada ----
  async syncAll(onProgress) {
    const tables = ['instituciones','usuarios','periodos','grados','grupos','materias','estudiantes','notas','asistencia','actividades','notificaciones'];
    const total = tables.length;
    let done = 0;
    for (const t of tables) {
      try {
        const key = t === 'config' ? 'config' : t;
        const { data, error } = await supabase.from(t).select('*');
        if (error) throw error;
        if (t !== 'config') {
          const mapper = t === 'estudiantes' ? r => this._mapEstudiante(r)
                       : t === 'grupos' ? r => this._mapGrupo(r)
                       : r => this._mapRow(r);
          const supabaseItems = (data || []).map(mapper);
          const localItems = this._data[key] || [];
          const supabaseIds = new Set(supabaseItems.map(i => i.id));
          const localIds = new Set(localItems.map(i => i.id));
          const missingInLocal = supabaseItems.filter(i => !localIds.has(i.id));
          const missingInSupabase = localItems.filter(i => !supabaseIds.has(i.id));
          // Merge: Supabase items + local items not in Supabase
          this._data[key] = [...supabaseItems, ...missingInSupabase];
          // Push local-only items to Supabase
          for (const item of missingInSupabase) {
            await supabase.from(t).insert(this._snakeObj(item)).catch(() => {});
          }
        } else if (data?.[0]) {
          this._data.config = this._mapConfig(data[0]);
        }
      } catch (e) {
        console.warn(`Sync error for ${t}:`, e);
      }
      done++;
      if (onProgress) onProgress(done, total);
    }
    this._persistLocal();
  },

  async backfillInstId() {
    const session = Auth.getSession();
    if (!session) return;
    const instId = session.institucionId || 'inst_default';
    const tables = ['usuarios','periodos','grados','grupos','materias','estudiantes','notas','asistencia','actividades','notificaciones'];
    for (const t of tables) {
      const items = this._data[t] || [];
      for (const item of items) {
        if (!item.institucionId) {
          item.institucionId = instId;
          await supabase.from(t).update({ institucion_id: instId }).eq('id', item.id).catch(() => {});
        }
      }
    }
    this._persistLocal();
  },

  // ---- Stats para Dashboard ----
  getStats() {
    const estudiantes = this.getEstudiantes().filter(e => e.activo);
    const materias = this.getMaterias();
    const notas = this.getNotas();
    let totalProm = 0, countProm = 0;
    let totalAsist = 0, countAsist = 0;
    const minAprobatorio = this.getConfig().escala.minAprobatorio;
    estudiantes.forEach(est => {
      const asist = this.calcularPorcentajeAsistencia(est.id, null);
      totalAsist += asist;
      countAsist++;
      materias.forEach(mat => {
        const pf = this.calcularPromedioFinal(est.id, mat.id);
        if (pf !== null) { totalProm += pf; countProm++; }
      });
    });
    const enRiesgo = [];
    estudiantes.forEach(est => {
      materias.forEach(mat => {
        const pf = this.calcularPromedioFinal(est.id, mat.id);
        if (pf !== null && pf < minAprobatorio) {
          enRiesgo.push({ estudiante: est, materia: mat, promedio: pf, tipo: 'nota' });
        }
      });
      const asist = this.calcularPorcentajeAsistencia(est.id, null);
      if (asist < 80) { enRiesgo.push({ estudiante: est, materia: null, promedio: asist, tipo: 'asistencia' }); }
    });
    return {
      totalEstudiantes: estudiantes.length,
      promedioGeneral: countProm > 0 ? Math.round((totalProm / countProm) * 100) / 100 : 0,
      porcentajeAsistencia: countAsist > 0 ? Math.round(totalAsist / countAsist) : 0,
      materiasActivas: materias.length,
      estudiantesEnRiesgo: enRiesgo,
      totalDocentes: this.getUsuarios().filter(u => u.rol === 'docente').length
    };
  }
};

window.DB = DB;
