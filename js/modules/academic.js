// ============================================================
// ACADEX — Módulo Estructura Académica
// ============================================================

const Academic = {
  activeTab: 'grados',

  render(container, session) {
    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">${Icons.school}</span> Estructura Académica</h2>
          <div class="section-actions">
            <button class="btn btn-accent" id="btn-add-main">+ Agregar</button>
          </div>
        </div>
        <div class="tabs">
          <button class="tab-btn ${this.activeTab==='grados'?'active':''}" data-tab="grados">${Icons.cap} Grados</button>
          <button class="tab-btn ${this.activeTab==='grupos'?'active':''}" data-tab="grupos">${Icons.users} Grupos</button>
          <button class="tab-btn ${this.activeTab==='materias'?'active':''}" data-tab="materias">${Icons.book} Materias</button>
          <button class="tab-btn ${this.activeTab==='periodos'?'active':''}" data-tab="periodos">${Icons.calendar} Períodos</button>
          <button class="tab-btn ${this.activeTab==='actividades'?'active':''}" data-tab="actividades">${Icons.bell} Actividades</button>
        </div>
        <div id="academic-content"></div>
      </div>`;

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.renderTab(session);
      });
    });

    document.getElementById('btn-add-main').addEventListener('click', () => {
      this.openAddModal(this.activeTab, session);
    });

    this.renderTab(session);
  },

  renderTab(session) {
    const content = document.getElementById('academic-content');
    switch(this.activeTab) {
      case 'grados':     this.renderGrados(content, session); break;
      case 'grupos':     this.renderGrupos(content, session); break;
      case 'materias':   this.renderMaterias(content, session); break;
      case 'periodos':   this.renderPeriodos(content, session); break;
      case 'actividades':this.renderActividades(content, session); break;
    }
  },

  renderGrados(container, session) {
    const grados = DB.getGrados().sort((a,b) => a.orden - b.orden);
    container.innerHTML = `
      <div class="grade-tree animate-fadeIn">
        ${grados.map(g => {
          const grupos = DB.getGruposByGrado(g.id);
          const materias = DB.getMateriasByGrado(g.id);
          return `<div class="grade-node">
            <div class="grade-node-header" onclick="this.nextElementSibling.classList.toggle('open')">
              <span style="font-size:24px">${Icons.cap}</span>
              <span class="grade-name">${g.nombre} — ${g.nivel}</span>
              <span class="grade-badge">${grupos.length} grupos</span>
              <span class="grade-badge" style="margin-left:4px">${materias.length} materias</span>
              ${session.rol === 'admin' ? `
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); Academic.editGrado('${g.id}')" style="color:white">${Icons.edit}</button>
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); Academic.deleteGrado('${g.id}')" style="color:white">${Icons.trash}</button>` : ''}
              <span style="margin-left:auto;color:rgba(255,255,255,.6);font-size:20px">⌄</span>
            </div>
            <div class="grade-node-body">
              <h4 style="margin-bottom:10px;font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Grupos</h4>
              <div class="group-chips">
                ${grupos.map(gr => {
                  const director = DB.getUsuario(gr.director);
                  const count = DB.getEstudiantesByGrupo(gr.id).length;
                  return `<div class="group-chip">
                    <span>${Icons.users} ${gr.nombre}</span>
                    <span class="chip-count">${count} est.</span>
                    ${director ? `<span class="chip-count">· ${director.nombre}</span>` : ''}
                    ${session.rol==='admin' ? `<button onclick="Academic.deleteGrupo('${gr.id}')" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--danger)">${Icons.close}</button>` : ''}
                  </div>`;
                }).join('')}
                ${session.rol==='admin' ? `<div class="group-chip" onclick="Academic.openAddGrupo('${g.id}')" style="border-style:dashed;color:var(--primary);cursor:pointer">+ Grupo</div>` : ''}
              </div>
              <h4 style="margin:14px 0 10px;font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Materias</h4>
              <div class="materia-list">
                ${materias.map(m => {
                  const docente = DB.getUsuario(m.docenteId);
                  return `<div class="materia-chip" style="border-left-color:${m.color}">
                    <div>
                      <div class="materia-name">${m.nombre}</div>
                      <div class="materia-docente">${docente ? Utils.nombreCompleto(docente) : 'Sin docente'} · ${m.horas}h/sem</div>
                    </div>
                    ${session.rol==='admin' ? `<button onclick="Academic.deleteMateria('${m.id}')" class="btn btn-ghost btn-sm btn-icon-sm" style="color:var(--danger)">${Icons.trash}</button>` : ''}
                  </div>`;
                }).join('')}
              </div>
            </div>
          </div>`;
        }).join('')}
        ${!grados.length ? '<div class="empty-state"><div class="empty-icon">${Icons.cap}</div><h3>Sin grados</h3><p>Agrega el primer grado académico</p></div>' : ''}
      </div>`;
  },

  renderGrupos(container, session) {
    const grupos = DB.getGrupos();
    const grados = DB.getGrados();
    container.innerHTML = `
      <div class="table-wrapper animate-fadeIn">
        <div class="table-toolbar">
          <div class="table-search"><span class="search-icon">${Icons.search}</span><input type="text" placeholder="Buscar grupo..." id="search-grupos"></div>
          <div class="table-filters">
            <select id="filter-grado-grupos">
              <option value="">Todos los grados</option>
              ${grados.map(g=>`<option value="${g.id}">${g.nombre}</option>`).join('')}
            </select>
          </div>
        </div>
        <table><thead><tr>
          <th>Grupo</th><th>Grado</th><th>Director de Grupo</th><th>Estudiantes</th>${session.rol==='admin'?'<th>Acciones</th>':''}
        </tr></thead><tbody id="grupos-tbody"></tbody></table>
        <div id="grupos-pag"></div>
      </div>`;
    let page = 1;
    const renderRows = () => {
      let data = grupos;
      const q = document.getElementById('search-grupos').value;
      const gf = document.getElementById('filter-grado-grupos').value;
      if (q) data = data.filter(g => g.nombre.toLowerCase().includes(q.toLowerCase()));
      if (gf) data = data.filter(g => g.gradoId === gf);
      const pag = Utils.paginar(data, page, 15);
      document.getElementById('grupos-tbody').innerHTML = pag.items.map(g => {
        const grado = DB.getGrado(g.gradoId);
        const director = DB.getUsuario(g.director);
        const count = DB.getEstudiantesByGrupo(g.id).length;
        return `<tr>
          <td><strong>${g.nombre}</strong></td>
          <td>${grado?.nombre||'—'}</td>
          <td>${director ? Utils.nombreCompleto(director) : '<span class="badge badge-neutral">Sin asignar</span>'}</td>
          <td><span class="badge badge-primary">${count} estudiantes</span></td>
          ${session.rol==='admin'?`<td class="td-actions">
            <button class="btn btn-outline btn-sm" onclick="Academic.editGrupo('${g.id}')">${Icons.edit} Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Academic.deleteGrupo('${g.id}')">${Icons.trash}</button>
          </td>`:''}
        </tr>`;
      }).join('') || '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted)">Sin grupos</td></tr>';
      Utils.renderPaginacion(document.getElementById('grupos-pag'), pag, p => { page=p; renderRows(); });
    };
    document.getElementById('search-grupos').addEventListener('input', Utils.debounce(()=>{page=1;renderRows()},300));
    document.getElementById('filter-grado-grupos').addEventListener('change', ()=>{page=1;renderRows();});
    renderRows();
  },

  renderMaterias(container, session) {
    const materias = DB.getMaterias();
    const grados = DB.getGrados();
    const docentes = DB.getUsuarios().filter(u => u.rol === 'docente' || u.rol === 'admin');
    container.innerHTML = `
      <div class="table-wrapper animate-fadeIn">
        <div class="table-toolbar">
          <div class="table-search"><span class="search-icon">${Icons.search}</span><input type="text" placeholder="Buscar materia..." id="search-materias"></div>
          <div class="table-filters">
            <select id="filter-grado-mat"><option value="">Todos los grados</option>${grados.map(g=>`<option value="${g.id}">${g.nombre}</option>`).join('')}</select>
            <select id="filter-doc-mat"><option value="">Todos los docentes</option>${docentes.map(d=>`<option value="${d.id}">${Utils.nombreCompleto(d)}</option>`).join('')}</select>
          </div>
        </div>
        <table><thead><tr>
          <th>Materia</th><th>Código</th><th>Grado</th><th>Docente</th><th>Horas/sem</th>${session.rol==='admin'?'<th>Acciones</th>':''}
        </tr></thead><tbody id="materias-tbody"></tbody></table>
        <div id="materias-pag"></div>
      </div>`;
    let page = 1;
    const renderRows = () => {
      let data = materias;
      const q = document.getElementById('search-materias').value;
      const gf = document.getElementById('filter-grado-mat').value;
      const df = document.getElementById('filter-doc-mat').value;
      if (q) data = data.filter(m => m.nombre.toLowerCase().includes(q.toLowerCase()));
      if (gf) data = data.filter(m => m.gradoId === gf);
      if (df) data = data.filter(m => m.docenteId === df);
      const pag = Utils.paginar(data, page, 10);
      document.getElementById('materias-tbody').innerHTML = pag.items.map(m => {
        const grado = DB.getGrado(m.gradoId);
        const docente = DB.getUsuario(m.docenteId);
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:10px"><div style="width:10px;height:10px;border-radius:50%;background:${m.color};flex-shrink:0"></div><strong>${m.nombre}</strong></div></td>
          <td><code style="background:var(--gray-light);padding:3px 8px;border-radius:4px;font-size:12px">${m.codigo||'—'}</code></td>
          <td>${grado?.nombre||'—'}</td>
          <td>${docente ? Utils.nombreCompleto(docente) : '<span class="badge badge-neutral">Sin asignar</span>'}</td>
          <td><span class="badge badge-info">${m.horas}h</span></td>
          ${session.rol==='admin'?`<td class="td-actions">
            <button class="btn btn-outline btn-sm" onclick="Academic.editMateria('${m.id}')">${Icons.edit}</button>
            <button class="btn btn-danger btn-sm" onclick="Academic.deleteMateria('${m.id}')">${Icons.trash}</button>
          </td>`:''}
        </tr>`;
      }).join('') || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">Sin materias</td></tr>';
      Utils.renderPaginacion(document.getElementById('materias-pag'), pag, p=>{page=p;renderRows();});
    };
    document.getElementById('search-materias').addEventListener('input', Utils.debounce(()=>{page=1;renderRows()},300));
    document.getElementById('filter-grado-mat').addEventListener('change', ()=>{page=1;renderRows();});
    document.getElementById('filter-doc-mat').addEventListener('change', ()=>{page=1;renderRows();});
    renderRows();
  },

  renderPeriodos(container, session) {
    const periodos = DB.getPeriodos();
    container.innerHTML = `
      <div class="grid-3 animate-fadeIn stagger">
        ${periodos.map(p => {
          const inicio = Utils.formatFecha(p.fechaInicio);
          const fin = Utils.formatFecha(p.fechaFin);
          return `<div class="card card-hover">
            <div class="card-body">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <span style="font-size:32px">${Icons.calendar}</span>
                ${p.activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-neutral">Inactivo</span>'}
              </div>
              <h3 style="font-size:20px;margin-bottom:8px">${p.nombre}</h3>
              <p style="font-size:13px;color:var(--text-muted)">Año ${p.año}</p>
              <div style="margin-top:12px;font-size:13px;display:flex;flex-direction:column;gap:4px">
                <div><strong>Inicio:</strong> ${inicio}</div>
                <div><strong>Fin:</strong> ${fin}</div>
              </div>
              ${session.rol==='admin'?`<div style="margin-top:16px;display:flex;gap:8px">
                ${!p.activo ? `<button class="btn btn-accent btn-sm" onclick="Academic.activarPeriodo('${p.id}')">${Icons.check} Activar</button>` : ''}
                <button class="btn btn-outline btn-sm" onclick="Academic.editPeriodo('${p.id}')">${Icons.edit} Editar</button>
                <button class="btn btn-danger btn-sm" onclick="Academic.deletePeriodo('${p.id}')">${Icons.trash}</button>
              </div>`:''}
            </div>
          </div>`;
        }).join('')}
        ${!periodos.length ? '<div class="empty-state"><div class="empty-icon">${Icons.calendar}</div><h3>Sin períodos</h3><p>Crea el primer período académico</p></div>' : ''}
      </div>`;
  },

  renderActividades(container, session) {
    const actividades = DB.getActividades().sort((a,b) => a.fecha.localeCompare(b.fecha));
    const tiposIcon = { examen:'${Icons.fileText}', proyecto:'🗂️', exposicion:'${Icons.cap}', quiz:'${Icons.edit}', tarea:'${Icons.mapPin}' };
    container.innerHTML = `
      <div class="table-wrapper animate-fadeIn">
        <table><thead><tr>
          <th>Actividad</th><th>Fecha</th><th>Tipo</th><th>Grado</th><th>Grupo</th><th>Materia</th>${session.rol==='admin'?'<th>Acciones</th>':''}
        </tr></thead><tbody>
        ${actividades.map(a => {
          const grado = DB.getGrado(a.gradoId);
          const grupo = DB.getGrupo(a.grupoId);
          const materia = DB.getMateria(a.materiaId);
          return `<tr>
            <td><strong>${a.titulo}</strong><div style="font-size:12px;color:var(--text-muted)">${a.descripcion||''}</div></td>
            <td>${Utils.formatFecha(a.fecha)}</td>
            <td>${tiposIcon[a.tipo]||'${Icons.mapPin}'} ${a.tipo}</td>
            <td>${grado?.nombre||'—'}</td>
            <td>${grupo?.nombre||'—'}</td>
            <td>${materia?.nombre||'—'}</td>
            ${session.rol==='admin'?`<td><button class="btn btn-danger btn-sm" onclick="Academic.deleteActividad('${a.id}')">${Icons.trash}</button></td>`:''}
          </tr>`;
        }).join('')}
        ${!actividades.length ? '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Sin actividades</td></tr>' : ''}
        </tbody></table>
      </div>`;
  },

  // ---- Modals ----
  openAddModal(tab, session) {
    switch(tab) {
      case 'grados':     this.openAddGrado(session); break;
      case 'grupos':     this.openAddGrupo(null, session); break;
      case 'materias':   this.openAddMateria(session); break;
      case 'periodos':   this.openAddPeriodo(session); break;
      case 'actividades':this.openAddActividad(session); break;
    }
  },

  openAddGrado(session) {
    const modal = this._createModal('Agregar Grado', `
      <form id="form-grado">
        <div class="form-row col-2">
          <div class="form-group"><label>Nombre <span class="required">*</span></label><input class="form-control" name="nombre" placeholder="ej: 6°" required></div>
          <div class="form-group"><label>Nivel <span class="required">*</span></label>
            <select class="form-control" name="nivel" required>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria" selected>Secundaria</option>
              <option value="Media">Media</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>Orden</label><input class="form-control" type="number" name="orden" value="${DB.getGrados().length+1}"></div>
      </form>`, () => {
      const form = document.getElementById('form-grado');
      if (!form.checkValidity()) { form.reportValidity(); return false; }
      const data = Utils.serializeForm(form);
      DB.addGrado({ nombre: data.nombre, nivel: data.nivel, orden: parseInt(data.orden)||99 });
      Utils.toast('Grado creado exitosamente', 'success');
      return true;
    });
  },

  editGrado(id) {
    const g = DB.getGrado(id);
    if (!g) return;
    const modal = this._createModal('Editar Grado', `
      <form id="form-grado">
        <div class="form-row col-2">
          <div class="form-group"><label>Nombre</label><input class="form-control" name="nombre" value="${g.nombre}" required></div>
          <div class="form-group"><label>Nivel</label>
            <select class="form-control" name="nivel">
              <option ${g.nivel==='Primaria'?'selected':''}>Primaria</option>
              <option ${g.nivel==='Secundaria'?'selected':''}>Secundaria</option>
              <option ${g.nivel==='Media'?'selected':''}>Media</option>
            </select>
          </div>
        </div>
      </form>`, () => {
      const data = Utils.serializeForm(document.getElementById('form-grado'));
      DB.updateGrado(id, data);
      Utils.toast('Grado actualizado', 'success');
      return true;
    });
  },

  async deleteGrado(id) {
    const g = DB.getGrado(id);
    if (!await Utils.confirm(`¿Eliminar el grado ${g?.nombre}? Se eliminarán sus grupos.`, 'Eliminar Grado')) return;
    DB.deleteGrado(id);
    Utils.toast('Grado eliminado', 'warning');
    this.renderTab(Auth.getSession());
  },

  openAddGrupo(gradoId, session) {
    const grados = DB.getGrados();
    const docentes = DB.getUsuarios().filter(u => u.rol === 'docente' || u.rol === 'admin');
    const modal = this._createModal('Agregar Grupo', `
      <form id="form-grupo">
        <div class="form-group"><label>Nombre del Grupo <span class="required">*</span></label><input class="form-control" name="nombre" placeholder="ej: 10A" required></div>
        <div class="form-group"><label>Grado <span class="required">*</span></label>
          <select class="form-control" name="gradoId" required>
            ${grados.map(g=>`<option value="${g.id}" ${g.id===gradoId?'selected':''}>${g.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Director de Grupo</label>
          <select class="form-control" name="director">
            <option value="">Sin asignar</option>
            ${docentes.map(d=>`<option value="${d.id}">${Utils.nombreCompleto(d)}</option>`).join('')}
          </select>
        </div>
      </form>`, () => {
      const form = document.getElementById('form-grupo');
      if (!form.checkValidity()) { form.reportValidity(); return false; }
      DB.addGrupo(Utils.serializeForm(form));
      Utils.toast('Grupo creado exitosamente', 'success');
      return true;
    });
  },

  editGrupo(id) {
    const g = DB.getGrupo(id);
    if (!g) return;
    const grados = DB.getGrados();
    const docentes = DB.getUsuarios().filter(u => u.rol === 'docente' || u.rol === 'admin');
    this._createModal('Editar Grupo', `
      <form id="form-grupo">
        <div class="form-group"><label>Nombre</label><input class="form-control" name="nombre" value="${g.nombre}" required></div>
        <div class="form-group"><label>Grado</label>
          <select class="form-control" name="gradoId">
            ${grados.map(gr=>`<option value="${gr.id}" ${gr.id===g.gradoId?'selected':''}>${gr.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Director</label>
          <select class="form-control" name="director">
            <option value="">Sin asignar</option>
            ${docentes.map(d=>`<option value="${d.id}" ${d.id===g.director?'selected':''}>${Utils.nombreCompleto(d)}</option>`).join('')}
          </select>
        </div>
      </form>`, () => {
      DB.updateGrupo(id, Utils.serializeForm(document.getElementById('form-grupo')));
      Utils.toast('Grupo actualizado', 'success');
      return true;
    });
  },

  async deleteGrupo(id) {
    const g = DB.getGrupo(id);
    if (!await Utils.confirm(`¿Eliminar el grupo ${g?.nombre}?`)) return;
    DB.deleteGrupo(id);
    Utils.toast('Grupo eliminado', 'warning');
    this.renderTab(Auth.getSession());
  },

  openAddMateria(session) {
    const grados = DB.getGrados();
    const docentes = DB.getUsuarios().filter(u => u.rol === 'docente' || u.rol === 'admin');
    const colors = ['#3498DB','#9B59B6','#2ECC71','#E67E22','#E74C3C','#1ABC9C','#F39C12','#8E44AD','#D35400','#2980B9'];
    this._createModal('Agregar Materia', `
      <form id="form-materia">
        <div class="form-row col-2">
          <div class="form-group"><label>Nombre <span class="required">*</span></label><input class="form-control" name="nombre" placeholder="ej: Matemáticas" required></div>
          <div class="form-group"><label>Código</label><input class="form-control" name="codigo" placeholder="ej: MAT10"></div>
        </div>
        <div class="form-row col-2">
          <div class="form-group"><label>Grado <span class="required">*</span></label>
            <select class="form-control" name="gradoId" required><option value="">Seleccionar...</option>${grados.map(g=>`<option value="${g.id}">${g.nombre}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Horas semanales</label><input class="form-control" type="number" name="horas" value="4" min="1" max="10"></div>
        </div>
        <div class="form-group"><label>Docente</label>
          <select class="form-control" name="docenteId"><option value="">Sin asignar</option>${docentes.map(d=>`<option value="${d.id}">${Utils.nombreCompleto(d)}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Color identificador</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
            ${colors.map((c,i) => `<label style="cursor:pointer"><input type="radio" name="color" value="${c}" ${i===0?'checked':''} style="display:none">
              <div style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:3px solid transparent;transition:.2s" onclick="this.parentElement.querySelector('input').checked=true;document.querySelectorAll('.color-opt').forEach(x=>x.style.borderColor='transparent');this.style.borderColor='var(--text)';" class="color-opt"></div>
            </label>`).join('')}
          </div>
        </div>
      </form>`, () => {
      const form = document.getElementById('form-materia');
      if (!form.checkValidity()) { form.reportValidity(); return false; }
      const data = Utils.serializeForm(form);
      data.horas = parseInt(data.horas)||4;
      DB.addMateria(data);
      Utils.toast('Materia creada exitosamente', 'success');
      return true;
    });
  },

  editMateria(id) {
    const m = DB.getMateria(id);
    if (!m) return;
    const grados = DB.getGrados();
    const docentes = DB.getUsuarios().filter(u => u.rol === 'docente' || u.rol === 'admin');
    this._createModal('Editar Materia', `
      <form id="form-materia">
        <div class="form-row col-2">
          <div class="form-group"><label>Nombre</label><input class="form-control" name="nombre" value="${m.nombre}" required></div>
          <div class="form-group"><label>Código</label><input class="form-control" name="codigo" value="${m.codigo||''}"></div>
        </div>
        <div class="form-row col-2">
          <div class="form-group"><label>Grado</label>
            <select class="form-control" name="gradoId">${grados.map(g=>`<option value="${g.id}" ${g.id===m.gradoId?'selected':''}>${g.nombre}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Horas</label><input class="form-control" type="number" name="horas" value="${m.horas}"></div>
        </div>
        <div class="form-group"><label>Docente</label>
          <select class="form-control" name="docenteId"><option value="">Sin asignar</option>${docentes.map(d=>`<option value="${d.id}" ${d.id===m.docenteId?'selected':''}>${Utils.nombreCompleto(d)}</option>`).join('')}</select>
        </div>
      </form>`, () => {
      const data = Utils.serializeForm(document.getElementById('form-materia'));
      data.horas = parseInt(data.horas)||4;
      DB.updateMateria(id, data);
      Utils.toast('Materia actualizada', 'success');
      return true;
    });
  },

  async deleteMateria(id) {
    const m = DB.getMateria(id);
    if (!await Utils.confirm(`¿Eliminar la materia "${m?.nombre}"?`)) return;
    DB.deleteMateria(id);
    Utils.toast('Materia eliminada', 'warning');
    this.renderTab(Auth.getSession());
  },

  openAddPeriodo(session) {
    this._createModal('Agregar Período', `
      <form id="form-periodo">
        <div class="form-group"><label>Nombre <span class="required">*</span></label><input class="form-control" name="nombre" placeholder="ej: 1er Trimestre" required></div>
        <div class="form-row col-2">
          <div class="form-group"><label>Fecha Inicio</label><input class="form-control" type="date" name="fechaInicio"></div>
          <div class="form-group"><label>Fecha Fin</label><input class="form-control" type="date" name="fechaFin"></div>
        </div>
        <div class="form-row col-2">
          <div class="form-group"><label>Año</label><input class="form-control" type="number" name="año" value="${new Date().getFullYear()}"></div>
          <div class="form-group"><label>Activo</label>
            <select class="form-control" name="activo">
              <option value="false">No</option><option value="true">Sí</option>
            </select>
          </div>
        </div>
      </form>`, () => {
      const form = document.getElementById('form-periodo');
      if (!form.checkValidity()) { form.reportValidity(); return false; }
      const data = Utils.serializeForm(form);
      data.activo = data.activo === 'true';
      data.año = parseInt(data.año);
      DB.addPeriodo(data);
      Utils.toast('Período creado exitosamente', 'success');
      return true;
    });
  },

  editPeriodo(id) {
    const p = DB.getPeriodo(id);
    if (!p) return;
    this._createModal('Editar Período', `
      <form id="form-periodo">
        <div class="form-group"><label>Nombre</label><input class="form-control" name="nombre" value="${p.nombre}" required></div>
        <div class="form-row col-2">
          <div class="form-group"><label>Fecha Inicio</label><input class="form-control" type="date" name="fechaInicio" value="${p.fechaInicio}"></div>
          <div class="form-group"><label>Fecha Fin</label><input class="form-control" type="date" name="fechaFin" value="${p.fechaFin}"></div>
        </div>
      </form>`, () => {
      DB.updatePeriodo(id, Utils.serializeForm(document.getElementById('form-periodo')));
      Utils.toast('Período actualizado', 'success');
      return true;
    });
  },

  activarPeriodo(id) {
    DB.getPeriodos().forEach(p => DB.updatePeriodo(p.id, { activo: false }));
    DB.updatePeriodo(id, { activo: true });
    Utils.toast('Período activado', 'success');
    this.renderTab(Auth.getSession());
  },

  async deletePeriodo(id) {
    const p = DB.getPeriodo(id);
    if (!await Utils.confirm(`¿Eliminar el período "${p?.nombre}"?`)) return;
    DB.deletePeriodo(id);
    Utils.toast('Período eliminado', 'warning');
    this.renderTab(Auth.getSession());
  },

  openAddActividad(session) {
    const grados = DB.getGrados();
    const grupos = DB.getGrupos();
    const materias = DB.getMaterias();
    this._createModal('Agregar Actividad', `
      <form id="form-actividad">
        <div class="form-group"><label>Título <span class="required">*</span></label><input class="form-control" name="titulo" placeholder="ej: Examen Final Matemáticas" required></div>
        <div class="form-row col-2">
          <div class="form-group"><label>Fecha</label><input class="form-control" type="date" name="fecha" value="${Utils.hoy()}"></div>
          <div class="form-group"><label>Tipo</label>
            <select class="form-control" name="tipo">
              <option value="examen">${Icons.fileText} Examen</option>
              <option value="quiz">${Icons.edit} Quiz</option>
              <option value="proyecto">🗂️ Proyecto</option>
              <option value="exposicion">${Icons.cap} Exposición</option>
              <option value="tarea">${Icons.mapPin} Tarea</option>
            </select>
          </div>
        </div>
        <div class="form-row col-3">
          <div class="form-group"><label>Grado</label><select class="form-control" name="gradoId"><option value="">Todos</option>${grados.map(g=>`<option value="${g.id}">${g.nombre}</option>`).join('')}</select></div>
          <div class="form-group"><label>Grupo</label><select class="form-control" name="grupoId"><option value="">Todos</option>${grupos.map(g=>`<option value="${g.id}">${g.nombre}</option>`).join('')}</select></div>
          <div class="form-group"><label>Materia</label><select class="form-control" name="materiaId"><option value="">General</option>${materias.map(m=>`<option value="${m.id}">${m.nombre}</option>`).join('')}</select></div>
        </div>
        <div class="form-group"><label>Descripción</label><textarea class="form-control" name="descripcion" rows="2" placeholder="Descripción opcional..."></textarea></div>
      </form>`, () => {
      const form = document.getElementById('form-actividad');
      if (!form.checkValidity()) { form.reportValidity(); return false; }
      DB.addActividad(Utils.serializeForm(form));
      Utils.toast('Actividad agregada', 'success');
      return true;
    });
  },

  async deleteActividad(id) {
    if (!await Utils.confirm('¿Eliminar esta actividad?')) return;
    DB.deleteActividad(id);
    Utils.toast('Actividad eliminada', 'warning');
    this.renderTab(Auth.getSession());
  },

  // Helper: crear modal genérico
  _createModal(titulo, bodyHTML, onSave) {
    const id = 'modal-academic-' + Date.now();
    const div = document.createElement('div');
    div.className = 'modal active';
    div.id = id;
    div.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header"><h3>${titulo}</h3><button class="modal-close">${Icons.close}</button></div>
        <div class="modal-body">${bodyHTML}</div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close">Cancelar</button>
          <button class="btn btn-primary" id="${id}-save">${Icons.save} Guardar</button>
        </div>
      </div>`;
    document.body.appendChild(div);
    div.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', () => { div.remove(); document.body.style.overflow=''; });
    });
    document.getElementById(`${id}-save`).addEventListener('click', () => {
      if (onSave()) {
        div.remove();
        document.body.style.overflow='';
        this.renderTab(Auth.getSession());
      }
    });
    return div;
  }
};

window.Academic = Academic;
