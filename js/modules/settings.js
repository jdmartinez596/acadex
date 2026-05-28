// ============================================================
// ACADEX — Módulo de Configuración del Sistema
// ============================================================

const Settings = {
  activeTab: 'institucion',

  render(container, session) {
    container.innerHTML = `
      <div class="animate-fadeIn">
        <div class="section-header">
          <h2><span class="section-icon">${Icons.settings}</span> Configuración del Sistema</h2>
        </div>
        
        <div class="tabs">
          <button class="tab-btn ${this.activeTab === 'institucion' ? 'active' : ''}" data-tab="institucion">${Icons.school} Institución</button>
          <button class="tab-btn ${this.activeTab === 'escala' ? 'active' : ''}" data-tab="escala">${Icons.chart} Escala y Evaluación</button>
          <button class="tab-btn ${this.activeTab === 'usuarios' ? 'active' : ''}" data-tab="usuarios">${Icons.users} Gestión de Usuarios</button>
          <button class="tab-btn ${this.activeTab === 'sistema' ? 'active' : ''}" data-tab="sistema">${Icons.settings} Sistema y Plantilla</button>
        </div>
        
        <div id="settings-content" class="animate-fadeIn"></div>
      </div>`;

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.renderTab(session);
      });
    });

    this.renderTab(session);
  },

  renderTab(session) {
    const content = document.getElementById('settings-content');
    switch (this.activeTab) {
      case 'institucion':
        this.renderInstitucion(content, session);
        break;
      case 'escala':
        this.renderEscala(content, session);
        break;
      case 'usuarios':
        this.renderUsuarios(content, session);
        break;
      case 'sistema':
        this.renderSistema(content, session);
        break;
    }
  },

  // 1. PESTAÑA: INSTITUCIÓN
  renderInstitucion(container, session) {
    const config = DB.getConfig();
    const inst = config.institucion;

    container.innerHTML = `
      <div class="card animate-fadeIn">
        <div class="card-header">
          <h3>${Icons.school} Información de la Institución Educativa</h3>
        </div>
        <div class="card-body">
          <form id="form-settings-institucion">
            <div class="form-row col-2">
              <div class="form-group">
                <label>Nombre de la Institución <span class="required">*</span></label>
                <input type="text" class="form-control" name="nombre" value="${inst.nombre || ''}" required>
              </div>
              <div class="form-group">
                <label>NIT / Identificación Registro <span class="required">*</span></label>
                <input type="text" class="form-control" name="nit" value="${inst.nit || ''}" required>
              </div>
            </div>
            
            <div class="form-row col-2">
              <div class="form-group">
                <label>Dirección <span class="required">*</span></label>
                <input type="text" class="form-control" name="direccion" value="${inst.direccion || ''}" required>
              </div>
              <div class="form-group">
                <label>Teléfono de Contacto <span class="required">*</span></label>
                <input type="text" class="form-control" name="telefono" value="${inst.telefono || ''}" required>
              </div>
            </div>

            <div class="form-row col-2">
              <div class="form-group">
                <label>Correo Electrónico Institucional <span class="required">*</span></label>
                <input type="email" class="form-control" name="email" value="${inst.email || ''}" required>
              </div>
              <div class="form-group">
                <label>Nombre del Rector / Director <span class="required">*</span></label>
                <input type="text" class="form-control" name="rector" value="${inst.rector || ''}" required>
              </div>
            </div>

            <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary">${Icons.save} Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>`;

    document.getElementById('form-settings-institucion').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = Utils.serializeForm(form);
      DB.updateInstitucion(data);
      Utils.toast('Información de la institución guardada con éxito', 'success');
    });
  },

  // 2. PESTAÑA: ESCALA Y EVALUACIÓN
  renderEscala(container, session) {
    const config = DB.getConfig();
    const escala = config.escala;
    const tipos = config.tiposActividad;

    container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Escala Numérica -->
        <div class="card animate-fadeIn">
          <div class="card-header">
            <h3>${Icons.trendingUp} Escala de Calificaciones</h3>
          </div>
          <div class="card-body">
            <form id="form-settings-escala">
              <div class="form-group">
                <label>Nota Mínima</label>
                <input type="number" step="0.1" class="form-control" name="min" value="${escala.min}" required min="0">
              </div>
              <div class="form-group" style="margin: 16px 0;">
                <label>Nota Máxima</label>
                <input type="number" step="0.1" class="form-control" name="max" value="${escala.max}" required min="1">
              </div>
              <div class="form-group" style="margin-bottom: 24px;">
                <label>Nota Mínima Aprobatoria <span class="required">*</span></label>
                <input type="number" step="0.1" class="form-control" name="minAprobatorio" value="${escala.minAprobatorio}" required min="0">
              </div>
              
              <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">${Icons.save} Guardar Escala</button>
            </form>
          </div>
        </div>

        <!-- Tipos de Actividad y Porcentajes -->
        <div class="card animate-fadeIn">
          <div class="card-header">
            <h3>${Icons.chart} Tipos de Actividades y Ponderación</h3>
            <button class="btn btn-accent btn-sm" id="btn-add-actividad-tipo">+ Nuevo Tipo</button>
          </div>
          <div class="card-body" style="padding:0;">
            <table style="margin: 0;">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Porcentaje</th>
                  <th>Color</th>
                  <th style="width: 80px; text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody id="actividades-ponderacion-tbody">
                ${tipos.map((t, idx) => `
                  <tr>
                    <td><strong>${t.nombre}</strong></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <input type="number" class="form-control val-porcentaje" data-id="${t.id}" value="${t.porcentaje}" style="width: 80px; padding: 4px 8px;" min="0" max="100">%
                      </div>
                    </td>
                    <td>
                      <input type="color" class="val-color" data-id="${t.id}" value="${t.color}" style="border: none; background: none; width: 32px; height: 32px; cursor: pointer;">
                    </td>
                    <td style="text-align: center;">
                      <button class="btn btn-danger btn-sm btn-icon" onclick="Settings.deleteTipoActividad('${t.id}')">${Icons.trash}</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--gray);">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px;">
                <span>Total Ponderación:</span>
                <span id="ponderacion-total-badge" class="badge">0%</span>
              </div>
              <div id="ponderacion-error-msg" class="alert alert-danger" style="display: none; font-size: 12px; margin: 0; padding: 8px 12px;">
                ${Icons.warning} La ponderación total debe sumar exactamente 100%.
              </div>
              <button class="btn btn-primary" id="btn-save-ponderaciones" style="width: 100%; justify-content: center;">${Icons.save} Guardar Ponderaciones</button>
            </div>
          </div>
        </div>
      </div>`;

    // Escala onSubmit
    document.getElementById('form-settings-escala').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      const data = Utils.serializeForm(form);
      const min = parseFloat(data.min);
      const max = parseFloat(data.max);
      const minAp = parseFloat(data.minAprobatorio);

      if (min >= max) {
        Utils.toast('La nota mínima debe ser menor a la nota máxima', 'error');
        return;
      }
      if (minAp < min || minAp > max) {
        Utils.toast('La nota aprobatoria debe estar dentro del rango mínimo y máximo', 'error');
        return;
      }

      DB.updateEscala({ min, max, minAprobatorio: minAp });
      Utils.toast('Escala de calificaciones actualizada', 'success');
    });

    // Calcular ponderación total en tiempo real
    const calcTotalPond = () => {
      let total = 0;
      document.querySelectorAll('.val-porcentaje').forEach(input => {
        total += parseInt(input.value) || 0;
      });
      const badge = document.getElementById('ponderacion-total-badge');
      const err = document.getElementById('ponderacion-error-msg');
      badge.textContent = `${total}%`;
      if (total === 100) {
        badge.className = 'badge badge-success';
        err.style.display = 'none';
      } else {
        badge.className = 'badge badge-danger';
      }
    };

    document.querySelectorAll('.val-porcentaje').forEach(input => {
      input.addEventListener('input', calcTotalPond);
    });

    calcTotalPond();

    // Guardar ponderaciones
    document.getElementById('btn-save-ponderaciones').addEventListener('click', () => {
      let total = 0;
      const updatedTipos = [];
      let hasError = false;

      document.querySelectorAll('.val-porcentaje').forEach(input => {
        const id = input.dataset.id;
        const pct = parseInt(input.value) || 0;
        const color = document.querySelector(`.val-color[data-id="${id}"]`).value;
        const original = tipos.find(t => t.id === id);

        if (pct < 0 || pct > 100) hasError = true;
        total += pct;

        updatedTipos.push({
          id,
          nombre: original.nombre,
          porcentaje: pct,
          color
        });
      });

      if (hasError) {
        Utils.toast('Los porcentajes deben estar entre 0% y 100%', 'error');
        return;
      }

      if (total !== 100) {
        document.getElementById('ponderacion-error-msg').style.display = 'block';
        Utils.toast('La ponderación total debe ser exactamente 100%', 'error');
        return;
      }

      DB.updateTiposActividad(updatedTipos);
      Utils.toast('Ponderaciones de evaluación guardadas', 'success');
    });

    // Nuevo Tipo
    document.getElementById('btn-add-actividad-tipo').addEventListener('click', () => {
      this.openAddTipoActividadModal(session);
    });
  },

  openAddTipoActividadModal(session) {
    const id = 'modal-settings-tipo-' + Date.now();
    const div = document.createElement('div');
    div.className = 'modal active';
    div.id = id;
    div.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h3>Nuevo Tipo de Actividad</h3>
          <button class="modal-close">${Icons.close}</button>
        </div>
        <form id="form-new-tipo-act">
          <div class="modal-body">
            <div class="form-group" style="margin-bottom: 12px;">
              <label>Nombre del Tipo <span class="required">*</span></label>
              <input type="text" class="form-control" name="nombre" placeholder="ej: Taller" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label>Color Identificador</label>
              <input type="color" class="form-control" name="color" value="#3498db" style="height: 40px; cursor: pointer;">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
            <button type="submit" class="btn btn-primary">${Icons.plus} Agregar</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(div);

    div.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', () => div.remove());
    });

    div.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const data = Utils.serializeForm(e.target);
      const config = DB.getConfig();
      const tipos = [...config.tiposActividad];

      const newId = data.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (tipos.some(t => t.id === newId)) {
        Utils.toast('Ya existe un tipo con ese nombre o similar', 'error');
        return;
      }

      tipos.push({
        id: newId,
        nombre: data.nombre,
        porcentaje: 0,
        color: data.color
      });

      DB.updateTiposActividad(tipos);
      Utils.toast('Tipo de actividad creado. Asigna su porcentaje para activarlo.', 'info', 5000);
      div.remove();
      this.renderTab(session);
    });
  },

  deleteTipoActividad(id) {
    const config = DB.getConfig();
    const tipos = config.tiposActividad.filter(t => t.id !== id);
    DB.updateTiposActividad(tipos);
    Utils.toast('Tipo de actividad eliminado', 'warning');
    this.renderTab(Auth.getSession());
  },

  // 3. PESTAÑA: GESTIÓN DE USUARIOS
  renderUsuarios(container, session) {
    const usuarios = DB.getUsuarios();
    const estudiantes = DB.getEstudiantes().filter(e => e.activo);

    container.innerHTML = `
      <div class="table-wrapper animate-fadeIn">
        <div class="table-toolbar">
          <div class="table-search">
            <span class="search-icon">${Icons.search}</span>
            <input type="text" placeholder="Buscar usuario..." id="search-usuarios">
          </div>
          <div class="table-filters">
            <select id="filter-rol-usuarios">
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="docente">Docente</option>
              <option value="estudiante">Estudiante</option>
            </select>
            <button class="btn btn-accent btn-sm" id="btn-add-usuario">+ Nuevo Usuario</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Creación</th>
              <th style="width: 140px; text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody id="usuarios-tbody"></tbody>
        </table>
        <div id="usuarios-pag"></div>
      </div>`;

    let page = 1;
    const renderRows = () => {
      let data = usuarios;
      const q = document.getElementById('search-usuarios').value;
      const rf = document.getElementById('filter-rol-usuarios').value;

      if (q) {
        data = data.filter(u => 
          (`${u.nombre} ${u.apellido} ${u.email}`).toLowerCase().includes(q.toLowerCase())
        );
      }
      if (rf) {
        data = data.filter(u => u.rol === rf);
      }

      const pag = Utils.paginar(data, page, 8);
      document.getElementById('usuarios-tbody').innerHTML = pag.items.map(u => {
        const badgeClass = u.activo ? 'badge-success' : 'badge-danger';
        const badgeText = u.activo ? 'Activo' : 'Inactivo';
        
        let rolBadge = 'badge-primary';
        if (u.rol === 'docente') rolBadge = 'badge-info';
        if (u.rol === 'estudiante') rolBadge = 'badge-warning';

        return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:10px">
                <div class="avatar" style="background:${Utils.colorFromString(u.nombre+u.apellido)}">
                  ${Utils.avatarInitials(u.nombre, u.apellido)}
                </div>
                <div>
                  <strong>${Utils.nombreCompleto(u)}</strong>
                  ${u.estudianteId ? `<div style="font-size:11px;color:var(--text-muted)">Vinculado a Estudiante</div>` : ''}
                </div>
              </div>
            </td>
            <td>${u.email}</td>
            <td><span class="badge ${rolBadge}">${u.rol.toUpperCase()}</span></td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td>${Utils.formatFecha(u.creado)}</td>
            <td class="td-actions" style="justify-content: center;">
              <button class="btn btn-outline btn-sm" onclick="Settings.openEditUsuarioModal('${u.id}')">${Icons.edit}</button>
              ${u.id !== session.userId ? `<button class="btn btn-danger btn-sm" onclick="Settings.deleteUsuario('${u.id}')">${Icons.trash}</button>` : ''}
            </td>
          </tr>`;
      }).join('') || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">Sin usuarios</td></tr>';

      Utils.renderPaginacion(document.getElementById('usuarios-pag'), pag, p => {
        page = p;
        renderRows();
      });
    };

    document.getElementById('search-usuarios').addEventListener('input', Utils.debounce(() => {
      page = 1;
      renderRows();
    }, 300));

    document.getElementById('filter-rol-usuarios').addEventListener('change', () => {
      page = 1;
      renderRows();
    });

    document.getElementById('btn-add-usuario').addEventListener('click', () => {
      this.openAddUsuarioModal(session);
    });

    renderRows();
  },

  openAddUsuarioModal(session) {
    const estudiantes = DB.getEstudiantes().filter(e => e.activo);
    const modalId = 'modal-settings-user-' + Date.now();
    const div = document.createElement('div');
    div.className = 'modal active';
    div.id = modalId;
    div.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Crear Nuevo Usuario</h3>
          <button class="modal-close">${Icons.close}</button>
        </div>
        <form id="form-new-usuario">
          <div class="modal-body">
            <div class="form-row col-2">
              <div class="form-group">
                <label>Nombre <span class="required">*</span></label>
                <input type="text" class="form-control" name="nombre" required placeholder="ej: Juan">
              </div>
              <div class="form-group">
                <label>Apellido <span class="required">*</span></label>
                <input type="text" class="form-control" name="apellido" required placeholder="ej: Pérez">
              </div>
            </div>
            
            <div class="form-row col-2" style="margin: 14px 0;">
              <div class="form-group">
                <label>Correo Electrónico <span class="required">*</span></label>
                <input type="email" class="form-control" name="email" required placeholder="ej: juan@email.com">
              </div>
              <div class="form-group">
                <label>Contraseña <span class="required">*</span></label>
                <input type="password" class="form-control" name="password" required placeholder="mínimo 6 caracteres" minlength="4">
              </div>
            </div>

            <div class="form-row col-2">
              <div class="form-group">
                <label>Rol del Sistema <span class="required">*</span></label>
                <select class="form-control" name="rol" id="select-new-user-rol" required>
                  <option value="docente" selected>Docente</option>
                  <option value="admin">Administrador</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>
              <div class="form-group" id="group-vinculo-estudiante" style="display: none;">
                <label>Vincular Estudiante</label>
                <select class="form-control" name="estudianteId">
                  <option value="">Seleccionar estudiante...</option>
                  ${estudiantes.map(e => `<option value="${e.id}">${Utils.nombreCompleto(e)} (${e.documento})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top: 14px;">
              <label>
                <input type="checkbox" name="activo" checked value="true"> Usuario Activo
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
            <button type="submit" class="btn btn-primary">${Icons.save} Guardar Usuario</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(div);

    div.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', () => div.remove());
    });

    const selectRol = document.getElementById('select-new-user-rol');
    const groupVinculo = document.getElementById('group-vinculo-estudiante');
    selectRol.addEventListener('change', () => {
      if (selectRol.value === 'estudiante') {
        groupVinculo.style.display = 'block';
      } else {
        groupVinculo.style.display = 'none';
      }
    });

    div.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = Utils.serializeForm(form);
      
      // Validar si el email ya existe
      if (DB.getUsuarioByEmail(data.email)) {
        Utils.toast('Ya existe un usuario con este correo electrónico', 'error');
        return;
      }

      const u = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        rol: data.rol,
        estudianteId: data.rol === 'estudiante' ? data.estudianteId : null,
        activo: data.activo === 'true'
      };

      DB.addUsuario(u);
      Utils.toast('Usuario creado exitosamente', 'success');
      div.remove();
      this.renderTab(session);
    });
  },

  openEditUsuarioModal(id) {
    const u = DB.getUsuario(id);
    if (!u) return;
    const estudiantes = DB.getEstudiantes().filter(e => e.activo);
    const modalId = 'modal-settings-user-' + Date.now();
    const div = document.createElement('div');
    div.className = 'modal active';
    div.id = modalId;
    div.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Editar Usuario</h3>
          <button class="modal-close">${Icons.close}</button>
        </div>
        <form id="form-edit-usuario">
          <div class="modal-body">
            <div class="form-row col-2">
              <div class="form-group">
                <label>Nombre <span class="required">*</span></label>
                <input type="text" class="form-control" name="nombre" value="${u.nombre}" required>
              </div>
              <div class="form-group">
                <label>Apellido <span class="required">*</span></label>
                <input type="text" class="form-control" name="apellido" value="${u.apellido}" required>
              </div>
            </div>
            
            <div class="form-row col-2" style="margin: 14px 0;">
              <div class="form-group">
                <label>Correo Electrónico <span class="required">*</span></label>
                <input type="email" class="form-control" name="email" value="${u.email}" required>
              </div>
              <div class="form-group">
                <label>Contraseña (dejar en blanco para no cambiar)</label>
                <input type="password" class="form-control" name="password" placeholder="••••••••">
              </div>
            </div>

            <div class="form-row col-2">
              <div class="form-group">
                <label>Rol del Sistema</label>
                <select class="form-control" name="rol" id="select-edit-user-rol" required>
                  <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                  <option value="docente" ${u.rol === 'docente' ? 'selected' : ''}>Docente</option>
                  <option value="estudiante" ${u.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
                </select>
              </div>
              <div class="form-group" id="group-vinculo-estudiante-edit" style="display: ${u.rol === 'estudiante' ? 'block' : 'none'};">
                <label>Vincular Estudiante</label>
                <select class="form-control" name="estudianteId">
                  <option value="">Seleccionar estudiante...</option>
                  ${estudiantes.map(e => `<option value="${e.id}" ${e.id === u.estudianteId ? 'selected' : ''}>${Utils.nombreCompleto(e)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top: 14px;">
              <label>
                <input type="checkbox" name="activo" ${u.activo ? 'checked' : ''} value="true"> Usuario Activo
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
            <button type="submit" class="btn btn-primary">${Icons.save} Guardar Cambios</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(div);

    div.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', () => div.remove());
    });

    const selectRol = document.getElementById('select-edit-user-rol');
    const groupVinculo = document.getElementById('group-vinculo-estudiante-edit');
    selectRol.addEventListener('change', () => {
      if (selectRol.value === 'estudiante') {
        groupVinculo.style.display = 'block';
      } else {
        groupVinculo.style.display = 'none';
      }
    });

    div.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      const data = Utils.serializeForm(form);

      // Validar email único si cambió
      if (data.email.trim().toLowerCase() !== u.email) {
        if (DB.getUsuarioByEmail(data.email)) {
          Utils.toast('Ya existe otro usuario con este correo electrónico', 'error');
          return;
        }
      }

      const updateData = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email.trim().toLowerCase(),
        rol: data.rol,
        estudianteId: data.rol === 'estudiante' ? data.estudianteId : null,
        activo: data.activo === 'true'
      };

      if (data.password) {
        updateData.password = data.password;
      }

      DB.updateUsuario(id, updateData);
      Utils.toast('Usuario actualizado', 'success');
      div.remove();
      this.renderTab(Auth.getSession());
    });
  },

  async deleteUsuario(id) {
    if (!await Utils.confirm('¿Está seguro de que desea eliminar permanentemente este usuario? Esta acción no se puede deshacer.', 'Eliminar Usuario')) return;
    DB.deleteUsuario(id);
    Utils.toast('Usuario eliminado del sistema', 'warning');
    this.renderTab(Auth.getSession());
  },

  // 4. PESTAÑA: CONFIGURACIÓN SISTEMA Y PLANTILLA
  renderSistema(container, session) {
    const config = DB.getConfig();
    const temp = config.boletinTemplate || { encabezado: 'BOLETÍN ACADÉMICO DE CALIFICACIONES', pie: 'Firma del Rector', colorPrimario: '#1E3A5F' };

    container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Plantilla Boletín -->
        <div class="card animate-fadeIn col-full" style="grid-column: span 2;">
          <div class="card-header">
            <h3>${Icons.file} Configuración de la Plantilla de Boletín de Notas</h3>
          </div>
          <div class="card-body">
            <form id="form-settings-boletin">
              <div class="form-row col-2">
                <div class="form-group">
                  <label>Encabezado del Boletín</label>
                  <input type="text" class="form-control" name="encabezado" value="${temp.encabezado}" required placeholder="ej: INFORME ACADÉMICO">
                </div>
                <div class="form-group">
                  <label>Pie de Firma del Documento</label>
                  <input type="text" class="form-control" name="pie" value="${temp.pie}" required placeholder="ej: Firma del Coordinador Académico">
                </div>
              </div>
              
              <div class="form-row col-2" style="margin: 16px 0;">
                <div class="form-group">
                  <label>Color Temático Primario Boletín (PDF)</label>
                  <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="color" name="colorPrimario" value="${temp.colorPrimario || '#1E3A5F'}" style="width: 48px; height: 48px; border: none; background: none; cursor: pointer;">
                    <span style="font-size: 13px; color: var(--text-muted);">Define el color corporativo que tendrán las tablas en la exportación PDF.</span>
                  </div>
                </div>
              </div>
              
              <button type="submit" class="btn btn-primary">${Icons.save} Guardar Configuración de Boletín</button>
            </form>
          </div>
        </div>

        <!-- Mantenimiento de Datos -->
        <div class="card animate-fadeIn col-full" style="grid-column: span 2; border: 1px solid rgba(231, 76, 60, 0.2);">
          <div class="card-header" style="background: rgba(231, 76, 60, 0.05);">
            <h3 class="text-danger">${Icons.warning} Zona de Peligro / Mantenimiento</h3>
          </div>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 16px;">
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
              Las siguientes acciones modifican los datos maestros de la plataforma. Procede con total cautela.
            </p>
            
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border: 1px solid var(--gray); border-radius: var(--border-radius-sm); background: var(--gray-light);">
              <div>
                <h4 style="margin-bottom: 4px;">Restablecer Datos de Demostración</h4>
                <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Restaura la base de datos de localStorage con toda la información mock/demo inicial.</p>
              </div>
              <button class="btn btn-danger" id="btn-danger-reset">${Icons.refresh} Restablecer BD</button>
            </div>
          </div>
        </div>
      </div>`;

    // Boletin onSubmit
    document.getElementById('form-settings-boletin').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      const data = Utils.serializeForm(form);
      
      DB.updateConfig('boletinTemplate', {
        encabezado: data.encabezado,
        pie: data.pie,
        colorPrimario: data.colorPrimario
      });
      Utils.toast('Diseño de la plantilla de boletín guardado con éxito', 'success');
    });

    // Reset BD
    document.getElementById('btn-danger-reset').addEventListener('click', async () => {
      const ok1 = await Utils.confirm('¿Está absolutamente seguro de que desea restablecer la base de datos a sus valores iniciales? Se perderán todas las notas, estudiantes y cambios que haya ingresado.', '¡Alerta de Re-inicialización!');
      if (!ok1) return;
      
      const ok2 = await Utils.confirm('Esta acción eliminará TODO lo guardado en el navegador y recargará Acadex. ¿Continuar?', 'Confirmar Acción Crítica');
      if (!ok2) return;

      DB.reset();
      Utils.toast('Base de datos restablecida correctamente. Recargando Acadex...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    });
  }
};

window.Settings = Settings;
