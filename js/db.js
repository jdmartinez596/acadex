// ============================================================
// ACADEX — Capa de Datos (Supabase + Caché local)
// ============================================================

const DB = {
  _data: {
    config: null,
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
      this._loadTable('config', this._mapConfig),
      this._loadTable('usuarios', this._mapRow),
      this._loadTable('periodos', this._mapRow),
      this._loadTable('grados', this._mapRow),
      this._loadTable('grupos', this._mapGrupo),
      this._loadTable('materias', this._mapRow),
      this._loadTable('estudiantes', this._mapEstudiante),
      this._loadTable('notas', this._mapRow),
      this._loadTable('asistencia', this._mapRow),
      this._loadTable('actividades', this._mapRow),
      this._loadTable('notificaciones', this._mapRow)
    ];
    const results = await Promise.allSettled(loaders);
    results.forEach((r, i) => { if (r.status === 'rejected') console.warn('DB load error:', r.reason); });
  },

  async _loadTable(name, mapper) {
    const { data, error } = await supabase.from(name).select('*');
    if (error) throw error;
    const key = name === 'config' ? name : name;
    if (name === 'config') {
      this._data.config = data?.[0] ? mapper(data[0]) : null;
      return;
    }
    this._data[name] = (data || []).map(mapper);
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
      if (k === 'authId' || k === 'estudianteId') {
        out[this._toSnake(k)] = v;
      } else {
        out[this._toSnake(k)] = v;
      }
    }
    return out;
  },

  // ---- Helpers ----
  _save() {},

  // ---- Config ----
  getConfig() { return this._data.config; },
  updateConfig(key, value) {
    this._data.config[key] = value;
    supabase.from('config').update({ [this._toSnake(key)]: typeof value === 'object' ? JSON.stringify(value) : value }).eq('id', 1).then();
  },
  updateInstitucion(data) {
    const inst = { ...this._data.config.institucion, ...data };
    this._data.config.institucion = inst;
    supabase.from('config').update({ institucion: JSON.stringify(inst) }).eq('id', 1).then();
  },
  updateEscala(data) {
    const esc = { ...this._data.config.escala, ...data };
    this._data.config.escala = esc;
    supabase.from('config').update({ escala: JSON.stringify(esc) }).eq('id', 1).then();
  },
  updateTiposActividad(tipos) {
    this._data.config.tiposActividad = tipos;
    supabase.from('config').update({ tipos_actividad: JSON.stringify(tipos) }).eq('id', 1).then();
  },

  // ---- Usuarios ----
  getUsuarios() { return this._data.usuarios; },
  getUsuario(id) { return this._data.usuarios.find(u => u.id === id); },
  getUsuarioByEmail(email) { return this._data.usuarios.find(u => u.email === email); },
  async addUsuario(u) {
    u.id = 'u' + Date.now();
    u.creado = new Date().toISOString().split('T')[0];
    this._data.usuarios.push(u);
    await supabase.from('usuarios').insert(this._snakeObj(u));
    return u;
  },
  async updateUsuario(id, data) {
    const idx = this._data.usuarios.findIndex(u => u.id === id);
    if (idx > -1) { this._data.usuarios[idx] = { ...this._data.usuarios[idx], ...data }; }
    await supabase.from('usuarios').update(this._snakeObj(data)).eq('id', id);
  },
  async deleteUsuario(id) {
    this._data.usuarios = this._data.usuarios.filter(u => u.id !== id);
    await supabase.from('usuarios').delete().eq('id', id);
  },

  // ---- Períodos ----
  getPeriodos() { return this._data.periodos; },
  getPeriodo(id) { return this._data.periodos.find(p => p.id === id); },
  getPeriodoActivo() { return this._data.periodos.find(p => p.activo); },
  async addPeriodo(p) {
    p.id = 'p' + Date.now();
    this._data.periodos.push(p);
    await supabase.from('periodos').insert(this._snakeObj(p));
    return p;
  },
  async updatePeriodo(id, data) {
    const idx = this._data.periodos.findIndex(p => p.id === id);
    if (idx > -1) { this._data.periodos[idx] = { ...this._data.periodos[idx], ...data }; }
    await supabase.from('periodos').update(this._snakeObj(data)).eq('id', id);
  },
  async deletePeriodo(id) {
    this._data.periodos = this._data.periodos.filter(p => p.id !== id);
    await supabase.from('periodos').delete().eq('id', id);
  },

  // ---- Grados ----
  getGrados() { return this._data.grados; },
  getGrado(id) { return this._data.grados.find(g => g.id === id); },
  async addGrado(g) {
    g.id = 'g' + Date.now();
    this._data.grados.push(g);
    await supabase.from('grados').insert(this._snakeObj(g));
    return g;
  },
  async updateGrado(id, data) {
    const idx = this._data.grados.findIndex(g => g.id === id);
    if (idx > -1) { this._data.grados[idx] = { ...this._data.grados[idx], ...data }; }
    await supabase.from('grados').update(this._snakeObj(data)).eq('id', id);
  },
  async deleteGrado(id) {
    this._data.grados = this._data.grados.filter(g => g.id !== id);
    this._data.grupos = this._data.grupos.filter(gr => gr.gradoId !== id);
    await supabase.from('grados').delete().eq('id', id);
    await supabase.from('grupos').delete().eq('grado_id', id);
  },

  // ---- Grupos ----
  getGrupos() { return this._data.grupos; },
  getGrupo(id) { return this._data.grupos.find(g => g.id === id); },
  getGruposByGrado(gradoId) { return this._data.grupos.filter(g => g.gradoId === gradoId); },
  async addGrupo(g) {
    g.id = 'gr' + Date.now();
    this._data.grupos.push(g);
    await supabase.from('grupos').insert(this._snakeObj(g));
    return g;
  },
  async updateGrupo(id, data) {
    const idx = this._data.grupos.findIndex(g => g.id === id);
    if (idx > -1) { this._data.grupos[idx] = { ...this._data.grupos[idx], ...data }; }
    await supabase.from('grupos').update(this._snakeObj(data)).eq('id', id);
  },
  async deleteGrupo(id) {
    this._data.grupos = this._data.grupos.filter(g => g.id !== id);
    await supabase.from('grupos').delete().eq('id', id);
  },

  // ---- Materias ----
  getMaterias() { return this._data.materias; },
  getMateria(id) { return this._data.materias.find(m => m.id === id); },
  getMateriasByGrado(gradoId) { return this._data.materias.filter(m => m.gradoId === gradoId); },
  getMateriasByDocente(docenteId) { return this._data.materias.filter(m => m.docenteId === docenteId); },
  async addMateria(m) {
    m.id = 'm' + Date.now();
    this._data.materias.push(m);
    await supabase.from('materias').insert(this._snakeObj(m));
    return m;
  },
  async updateMateria(id, data) {
    const idx = this._data.materias.findIndex(m => m.id === id);
    if (idx > -1) { this._data.materias[idx] = { ...this._data.materias[idx], ...data }; }
    await supabase.from('materias').update(this._snakeObj(data)).eq('id', id);
  },
  async deleteMateria(id) {
    this._data.materias = this._data.materias.filter(m => m.id !== id);
    await supabase.from('materias').delete().eq('id', id);
  },

  // ---- Estudiantes ----
  getEstudiantes() { return this._data.estudiantes; },
  getEstudiante(id) { return this._data.estudiantes.find(e => e.id === id); },
  getEstudiantesByGrupo(grupoId) { return this._data.estudiantes.filter(e => e.grupoId === grupoId && e.activo); },
  getEstudiantesByGrado(gradoId) { return this._data.estudiantes.filter(e => e.gradoId === gradoId && e.activo); },
  getEstudianteByDocumento(doc) { return this._data.estudiantes.find(e => e.documento === doc && e.activo); },
  async addEstudiante(e) {
    e.id = 'e' + Date.now();
    e.creado = new Date().toISOString().split('T')[0];
    e.activo = true;
    this._data.estudiantes.push(e);
    const snake = this._snakeObj(e);
    if (typeof e.acudiente === 'object') snake.acudiente = JSON.stringify(snake.acudiente);
    await supabase.from('estudiantes').insert(snake);
    return e;
  },
  async updateEstudiante(id, data) {
    const idx = this._data.estudiantes.findIndex(e => e.id === id);
    if (idx > -1) { this._data.estudiantes[idx] = { ...this._data.estudiantes[idx], ...data }; }
    const snake = this._snakeObj(data);
    if (typeof data.acudiente === 'object') snake.acudiente = JSON.stringify(data.acudiente);
    await supabase.from('estudiantes').update(snake).eq('id', id);
  },
  async deleteEstudiante(id) {
    const idx = this._data.estudiantes.findIndex(e => e.id === id);
    if (idx > -1) { this._data.estudiantes[idx].activo = false; }
    await supabase.from('estudiantes').update({ activo: false }).eq('id', id);
  },

  // ---- Notas ----
  getNotas() { return this._data.notas; },
  getNotasByEstudiante(estudianteId) { return this._data.notas.filter(n => n.estudianteId === estudianteId); },
  getNotasByGrupoMateriaPeriodo(grupoId, materiaId, periodoId) {
    const estudiantes = this.getEstudiantesByGrupo(grupoId).map(e => e.id);
    return this._data.notas.filter(n => estudiantes.includes(n.estudianteId) && n.materiaId === materiaId && n.periodoId === periodoId);
  },
  getNotasByEstudianteMateriaPeriodo(eId, mId, pId) {
    return this._data.notas.filter(n => n.estudianteId === eId && n.materiaId === mId && n.periodoId === pId);
  },
  async addNota(n) {
    n.id = 'n' + Date.now() + Math.random().toString(36).substr(2, 5);
    this._data.notas.push(n);
    await supabase.from('notas').insert(this._snakeObj(n));
    return n;
  },
  async updateNota(id, data) {
    const idx = this._data.notas.findIndex(n => n.id === id);
    if (idx > -1) { this._data.notas[idx] = { ...this._data.notas[idx], ...data }; }
    await supabase.from('notas').update(this._snakeObj(data)).eq('id', id);
  },
  async deleteNota(id) {
    this._data.notas = this._data.notas.filter(n => n.id !== id);
    await supabase.from('notas').delete().eq('id', id);
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
  getAsistencia() { return this._data.asistencia; },
  getAsistenciaByFechaGrupoMateria(fecha, grupoId, materiaId) {
    const estudiantes = this.getEstudiantesByGrupo(grupoId).map(e => e.id);
    return this._data.asistencia.filter(a => a.fecha === fecha && a.materiaId === materiaId && estudiantes.includes(a.estudianteId));
  },
  getAsistenciaByEstudiante(estudianteId) {
    return this._data.asistencia.filter(a => a.estudianteId === estudianteId);
  },
  async setAsistencia(estudianteId, materiaId, grupoId, fecha, estado, justificacion = null) {
    const existing = this._data.asistencia.find(a => a.estudianteId === estudianteId && a.materiaId === materiaId && a.fecha === fecha);
    if (existing) {
      existing.estado = estado;
      existing.justificacion = justificacion;
      await supabase.from('asistencia').update({ estado, justificacion }).eq('id', existing.id);
    } else {
      const id = 'a' + Date.now() + Math.random().toString(36).substr(2, 5);
      this._data.asistencia.push({ id, estudianteId, materiaId, grupoId, fecha, estado, justificacion });
      await supabase.from('asistencia').insert({ id, estudiante_id: estudianteId, materia_id: materiaId, grupo_id: grupoId, fecha, estado, justificacion });
    }
  },
  calcularPorcentajeAsistencia(estudianteId, materiaId) {
    const reg = materiaId ? this._data.asistencia.filter(a => a.estudianteId === estudianteId && a.materiaId === materiaId)
                          : this._data.asistencia.filter(a => a.estudianteId === estudianteId);
    if (!reg.length) return 100;
    const presentes = reg.filter(a => a.estado === 'presente' || a.estado === 'justificado').length;
    return Math.round((presentes / reg.length) * 100);
  },

  // ---- Actividades ----
  getActividades() { return this._data.actividades; },
  async addActividad(a) {
    a.id = 'act' + Date.now();
    this._data.actividades.push(a);
    await supabase.from('actividades').insert(this._snakeObj(a));
    return a;
  },
  async deleteActividad(id) {
    this._data.actividades = this._data.actividades.filter(a => a.id !== id);
    await supabase.from('actividades').delete().eq('id', id);
  },

  // ---- Notificaciones ----
  getNotificaciones(usuarioId) { return (this._data.notificaciones || []).filter(n => !usuarioId || n.usuarioId === usuarioId); },
  getNotificacionesNoLeidas(usuarioId) { return this.getNotificaciones(usuarioId).filter(n => !n.leida); },
  async marcarLeida(id) {
    const n = this._data.notificaciones.find(n => n.id === id);
    if (n) { n.leida = true; }
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
  },
  async marcarTodasLeidas(usuarioId) {
    this._data.notificaciones.filter(n => n.usuarioId === usuarioId).forEach(n => n.leida = true);
    await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', usuarioId);
  },
  async addNotificacion(n) {
    n.id = 'not' + Date.now();
    n.fecha = new Date().toISOString().split('T')[0];
    n.leida = false;
    if (!this._data.notificaciones) this._data.notificaciones = [];
    this._data.notificaciones.unshift(n);
    await supabase.from('notificaciones').insert(this._snakeObj(n));
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
