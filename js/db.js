// ============================================================
// ACADEX — Capa de Datos (localStorage)
// ============================================================

const DB_KEY = 'acadex_db';

const DEMO_DATA = {
  config: {
    institucion: {
      nombre: 'Institución Educativa Ejemplo',
      nit: '900.123.456-7',
      direccion: 'Calle 123 #45-67, Ciudad',
      telefono: '(601) 234-5678',
      email: 'info@institucion.edu.co',
      rector: 'Dr. Carlos Mendoza',
      logo: null
    },
    escala: { min: 0, max: 10, minAprobatorio: 6.0 },
    tiposActividad: [
      { id: 'examen', nombre: 'Examen', porcentaje: 40, color: '#E74C3C' },
      { id: 'tarea', nombre: 'Tarea', porcentaje: 20, color: '#3498DB' },
      { id: 'quiz', nombre: 'Quiz', porcentaje: 15, color: '#9B59B6' },
      { id: 'proyecto', nombre: 'Proyecto', porcentaje: 15, color: '#E67E22' },
      { id: 'participacion', nombre: 'Participación', porcentaje: 10, color: '#2ECC71' }
    ],
    darkMode: false,
    boletinTemplate: {
      encabezado: 'BOLETÍN DE CALIFICACIONES',
      pie: 'Firma del Director',
      colorPrimario: '#1E3A5F'
    }
  },

  usuarios: [
    { id: 'u1', nombre: 'Admin', apellido: 'Sistema', email: 'admin@acadex.com', password: 'admin123', rol: 'admin', avatar: null, activo: true, creado: '2024-01-15' },
    { id: 'u2', nombre: 'María', apellido: 'González', email: 'docente@acadex.com', password: 'docente123', rol: 'docente', avatar: null, activo: true, creado: '2024-01-15' },
    { id: 'u3', nombre: 'Pedro', apellido: 'Ramírez', email: 'pedro.ramirez@acadex.com', password: 'docente123', rol: 'docente', avatar: null, activo: true, creado: '2024-01-20' },
    { id: 'u4', nombre: 'Ana', apellido: 'Martínez', email: 'ana.martinez@acadex.com', password: 'docente123', rol: 'docente', avatar: null, activo: true, creado: '2024-02-01' },
    { id: 'u5', nombre: 'Sofía', apellido: 'López', email: 'estudiante@acadex.com', password: 'est123', rol: 'estudiante', estudianteId: 'e1', avatar: null, activo: true, creado: '2024-02-10' }
  ],

  periodos: [
    { id: 'p1', nombre: '1er Trimestre', fechaInicio: '2024-02-05', fechaFin: '2024-04-26', activo: false, año: 2024 },
    { id: 'p2', nombre: '2do Trimestre', fechaInicio: '2024-04-29', fechaFin: '2024-07-26', activo: false, año: 2024 },
    { id: 'p3', nombre: '3er Trimestre', fechaInicio: '2024-07-29', fechaFin: '2024-11-22', activo: true, año: 2024 }
  ],

  grados: [
    { id: 'g6', nombre: '6°', nivel: 'Secundaria', orden: 1 },
    { id: 'g7', nombre: '7°', nivel: 'Secundaria', orden: 2 },
    { id: 'g8', nombre: '8°', nivel: 'Secundaria', orden: 3 },
    { id: 'g9', nombre: '9°', nivel: 'Secundaria', orden: 4 },
    { id: 'g10', nombre: '10°', nivel: 'Media', orden: 5 },
    { id: 'g11', nombre: '11°', nivel: 'Media', orden: 6 }
  ],

  grupos: [
    { id: 'gr10A', nombre: '10A', gradoId: 'g10', director: 'u2' },
    { id: 'gr10B', nombre: '10B', gradoId: 'g10', director: 'u3' },
    { id: 'gr10C', nombre: '10C', gradoId: 'g10', director: 'u4' },
    { id: 'gr11A', nombre: '11A', gradoId: 'g11', director: 'u2' },
    { id: 'gr11B', nombre: '11B', gradoId: 'g11', director: 'u3' },
    { id: 'gr9A', nombre: '9A', gradoId: 'g9', director: 'u4' },
    { id: 'gr9B', nombre: '9B', gradoId: 'g9', director: 'u2' },
    { id: 'gr8A', nombre: '8A', gradoId: 'g8', director: 'u3' },
    { id: 'gr7A', nombre: '7A', gradoId: 'g7', director: 'u4' },
    { id: 'gr6A', nombre: '6A', gradoId: 'g6', director: 'u2' }
  ],

  materias: [
    { id: 'm1', nombre: 'Matemáticas', gradoId: 'g10', docenteId: 'u2', color: '#3498DB', horas: 5, codigo: 'MAT10' },
    { id: 'm2', nombre: 'Lengua Castellana', gradoId: 'g10', docenteId: 'u3', color: '#9B59B6', horas: 4, codigo: 'LEN10' },
    { id: 'm3', nombre: 'Ciencias Naturales', gradoId: 'g10', docenteId: 'u4', color: '#2ECC71', horas: 4, codigo: 'CNA10' },
    { id: 'm4', nombre: 'Ciencias Sociales', gradoId: 'g10', docenteId: 'u2', color: '#E67E22', horas: 3, codigo: 'CSO10' },
    { id: 'm5', nombre: 'Inglés', gradoId: 'g10', docenteId: 'u3', color: '#E74C3C', horas: 4, codigo: 'ING10' },
    { id: 'm6', nombre: 'Física', gradoId: 'g10', docenteId: 'u4', color: '#1ABC9C', horas: 4, codigo: 'FIS10' },
    { id: 'm7', nombre: 'Educación Física', gradoId: 'g10', docenteId: 'u2', color: '#F39C12', horas: 2, codigo: 'EFI10' },
    { id: 'm8', nombre: 'Tecnología e Informática', gradoId: 'g10', docenteId: 'u3', color: '#8E44AD', horas: 2, codigo: 'TEC10' },
    { id: 'm9', nombre: 'Matemáticas', gradoId: 'g11', docenteId: 'u2', color: '#3498DB', horas: 5, codigo: 'MAT11' },
    { id: 'm10', nombre: 'Lengua Castellana', gradoId: 'g11', docenteId: 'u3', color: '#9B59B6', horas: 4, codigo: 'LEN11' },
    { id: 'm11', nombre: 'Química', gradoId: 'g11', docenteId: 'u4', color: '#2ECC71', horas: 4, codigo: 'QUI11' },
    { id: 'm12', nombre: 'Física', gradoId: 'g11', docenteId: 'u2', color: '#1ABC9C', horas: 4, codigo: 'FIS11' },
    { id: 'm13', nombre: 'Matemáticas', gradoId: 'g9', docenteId: 'u3', color: '#3498DB', horas: 5, codigo: 'MAT9' },
    { id: 'm14', nombre: 'Ciencias Naturales', gradoId: 'g9', docenteId: 'u4', color: '#2ECC71', horas: 4, codigo: 'CNA9' }
  ],

  estudiantes: [
    { id: 'e1', nombre: 'Sofía', apellido: 'López', documento: '1001234567', tipoDoc: 'TI', fechaNacimiento: '2007-03-15', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'sofia.lopez@email.com', telefono: '3001234567', direccion: 'Cra 45 #23-12', acudiente: { nombre: 'Rosa López', parentesco: 'Madre', telefono: '3109876543', email: 'rosa.lopez@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e2', nombre: 'Andrés', apellido: 'Moreno', documento: '1001234568', tipoDoc: 'TI', fechaNacimiento: '2007-06-22', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'andres.moreno@email.com', telefono: '3101234568', direccion: 'Cll 12 #34-56', acudiente: { nombre: 'Juan Moreno', parentesco: 'Padre', telefono: '3201234568', email: 'juan.moreno@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e3', nombre: 'Valentina', apellido: 'Castro', documento: '1001234569', tipoDoc: 'TI', fechaNacimiento: '2007-09-10', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'valentina.castro@email.com', telefono: '3201234569', direccion: 'Av. 68 #15-30', acudiente: { nombre: 'Claudia Castro', parentesco: 'Madre', telefono: '3101234569', email: 'claudia.castro@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e4', nombre: 'Diego', apellido: 'Hernández', documento: '1001234570', tipoDoc: 'TI', fechaNacimiento: '2007-01-05', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'diego.hernandez@email.com', telefono: '3001234570', direccion: 'Cra 7 #45-78', acudiente: { nombre: 'Marta Hernández', parentesco: 'Madre', telefono: '3151234570', email: 'marta.h@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e5', nombre: 'Isabella', apellido: 'Ruiz', documento: '1001234571', tipoDoc: 'TI', fechaNacimiento: '2007-11-20', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'isabella.ruiz@email.com', telefono: '3201234571', direccion: 'Cll 80 #23-45', acudiente: { nombre: 'Jorge Ruiz', parentesco: 'Padre', telefono: '3001234571', email: 'jorge.ruiz@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e6', nombre: 'Sebastián', apellido: 'Vargas', documento: '1001234572', tipoDoc: 'TI', fechaNacimiento: '2007-04-18', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'sebastian.vargas@email.com', telefono: '3101234572', direccion: 'Cra 50 #12-34', acudiente: { nombre: 'Patricia Vargas', parentesco: 'Madre', telefono: '3201234572', email: 'patricia.v@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e7', nombre: 'Camila', apellido: 'Torres', documento: '1001234573', tipoDoc: 'TI', fechaNacimiento: '2007-07-30', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'camila.torres@email.com', telefono: '3001234573', direccion: 'Cll 26 #67-89', acudiente: { nombre: 'Luis Torres', parentesco: 'Padre', telefono: '3101234573', email: 'luis.torres@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e8', nombre: 'Felipe', apellido: 'Jiménez', documento: '1001234574', tipoDoc: 'TI', fechaNacimiento: '2007-02-14', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'felipe.jimenez@email.com', telefono: '3201234574', direccion: 'Av. Caracas #34-56', acudiente: { nombre: 'Carmen Jiménez', parentesco: 'Madre', telefono: '3001234574', email: 'carmen.j@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e9', nombre: 'Lucía', apellido: 'Sánchez', documento: '1001234575', tipoDoc: 'TI', fechaNacimiento: '2007-08-25', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'lucia.sanchez@email.com', telefono: '3101234575', direccion: 'Cra 15 #78-90', acudiente: { nombre: 'Roberto Sánchez', parentesco: 'Padre', telefono: '3201234575', email: 'roberto.s@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e10', nombre: 'Miguel', apellido: 'Gómez', documento: '1001234576', tipoDoc: 'TI', fechaNacimiento: '2007-12-01', gradoId: 'g10', grupoId: 'gr10A', foto: null, email: 'miguel.gomez@email.com', telefono: '3001234576', direccion: 'Cll 100 #45-67', acudiente: { nombre: 'Ana Gómez', parentesco: 'Madre', telefono: '3101234576', email: 'ana.gomez@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e11', nombre: 'Sara', apellido: 'Díaz', documento: '1001234577', tipoDoc: 'TI', fechaNacimiento: '2007-05-17', gradoId: 'g10', grupoId: 'gr10B', foto: null, email: 'sara.diaz@email.com', telefono: '3201234577', direccion: 'Cra 30 #56-78', acudiente: { nombre: 'Martha Díaz', parentesco: 'Madre', telefono: '3001234577', email: 'martha.d@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e12', nombre: 'Nicolás', apellido: 'Pereira', documento: '1001234578', tipoDoc: 'TI', fechaNacimiento: '2007-10-08', gradoId: 'g10', grupoId: 'gr10B', foto: null, email: 'nicolas.pereira@email.com', telefono: '3101234578', direccion: 'Cll 45 #89-01', acudiente: { nombre: 'Carlos Pereira', parentesco: 'Padre', telefono: '3201234578', email: 'carlos.p@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e13', nombre: 'Laura', apellido: 'Molina', documento: '1001234579', tipoDoc: 'TI', fechaNacimiento: '2007-03-22', gradoId: 'g10', grupoId: 'gr10B', foto: null, email: 'laura.molina@email.com', telefono: '3001234579', direccion: 'Av. 1° de Mayo #23-45', acudiente: { nombre: 'Gloria Molina', parentesco: 'Madre', telefono: '3101234579', email: 'gloria.m@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e14', nombre: 'David', apellido: 'Reyes', documento: '1001234580', tipoDoc: 'TI', fechaNacimiento: '2007-07-14', gradoId: 'g11', grupoId: 'gr11A', foto: null, email: 'david.reyes@email.com', telefono: '3201234580', direccion: 'Cra 9 #34-56', acudiente: { nombre: 'Alicia Reyes', parentesco: 'Madre', telefono: '3001234580', email: 'alicia.r@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e15', nombre: 'Mariana', apellido: 'Vargas', documento: '1001234581', tipoDoc: 'TI', fechaNacimiento: '2006-09-30', gradoId: 'g11', grupoId: 'gr11A', foto: null, email: 'mariana.vargas@email.com', telefono: '3101234581', direccion: 'Cll 72 #12-34', acudiente: { nombre: 'Héctor Vargas', parentesco: 'Padre', telefono: '3201234581', email: 'hector.v@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e16', nombre: 'Carlos', apellido: 'Pino', documento: '1001234582', tipoDoc: 'TI', fechaNacimiento: '2006-02-18', gradoId: 'g11', grupoId: 'gr11A', foto: null, email: 'carlos.pino@email.com', telefono: '3001234582', direccion: 'Cra 27 #56-78', acudiente: { nombre: 'Elena Pino', parentesco: 'Madre', telefono: '3101234582', email: 'elena.p@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e17', nombre: 'Juliana', apellido: 'Cruz', documento: '1001234583', tipoDoc: 'TI', fechaNacimiento: '2006-11-05', gradoId: 'g11', grupoId: 'gr11A', foto: null, email: 'juliana.cruz@email.com', telefono: '3201234583', direccion: 'Cll 19 #34-56', acudiente: { nombre: 'Pedro Cruz', parentesco: 'Padre', telefono: '3001234583', email: 'pedro.c@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e18', nombre: 'Esteban', apellido: 'Ríos', documento: '1001234584', tipoDoc: 'TI', fechaNacimiento: '2006-04-12', gradoId: 'g11', grupoId: 'gr11B', foto: null, email: 'esteban.rios@email.com', telefono: '3101234584', direccion: 'Av. Boyacá #67-89', acudiente: { nombre: 'Sandra Ríos', parentesco: 'Madre', telefono: '3201234584', email: 'sandra.r@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e19', nombre: 'Daniela', apellido: 'Ortega', documento: '1001234585', tipoDoc: 'TI', fechaNacimiento: '2006-08-20', gradoId: 'g11', grupoId: 'gr11B', foto: null, email: 'daniela.ortega@email.com', telefono: '3001234585', direccion: 'Cra 60 #45-67', acudiente: { nombre: 'Miguel Ortega', parentesco: 'Padre', telefono: '3101234585', email: 'miguel.o@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e20', nombre: 'Tomás', apellido: 'Aguilar', documento: '1001234586', tipoDoc: 'TI', fechaNacimiento: '2008-01-28', gradoId: 'g9', grupoId: 'gr9A', foto: null, email: 'tomas.aguilar@email.com', telefono: '3201234586', direccion: 'Cll 53 #23-45', acudiente: { nombre: 'Beatriz Aguilar', parentesco: 'Madre', telefono: '3001234586', email: 'beatriz.a@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e21', nombre: 'Paula', apellido: 'Serrano', documento: '1001234587', tipoDoc: 'TI', fechaNacimiento: '2008-06-15', gradoId: 'g9', grupoId: 'gr9A', foto: null, email: 'paula.serrano@email.com', telefono: '3101234587', direccion: 'Cra 85 #34-56', acudiente: { nombre: 'Ricardo Serrano', parentesco: 'Padre', telefono: '3201234587', email: 'ricardo.s@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e22', nombre: 'Alejandro', apellido: 'Muñoz', documento: '1001234588', tipoDoc: 'TI', fechaNacimiento: '2008-10-03', gradoId: 'g9', grupoId: 'gr9A', foto: null, email: 'alejandro.munoz@email.com', telefono: '3001234588', direccion: 'Av. 68 #56-78', acudiente: { nombre: 'Teresa Muñoz', parentesco: 'Madre', telefono: '3101234588', email: 'teresa.m@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e23', nombre: 'Natalia', apellido: 'Flores', documento: '1001234589', tipoDoc: 'TI', fechaNacimiento: '2009-03-08', gradoId: 'g8', grupoId: 'gr8A', foto: null, email: 'natalia.flores@email.com', telefono: '3201234589', direccion: 'Cll 127 #45-67', acudiente: { nombre: 'Fabio Flores', parentesco: 'Padre', telefono: '3001234589', email: 'fabio.f@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e24', nombre: 'Samuel', apellido: 'Cárdenas', documento: '1001234590', tipoDoc: 'TI', fechaNacimiento: '2010-07-22', gradoId: 'g7', grupoId: 'gr7A', foto: null, email: 'samuel.cardenas@email.com', telefono: '3101234590', direccion: 'Cra 20 #78-90', acudiente: { nombre: 'Gloria Cárdenas', parentesco: 'Madre', telefono: '3201234590', email: 'gloria.c@email.com' }, activo: true, creado: '2024-02-01' },
    { id: 'e25', nombre: 'Gabriela', apellido: 'Rojas', documento: '1001234591', tipoDoc: 'TI', fechaNacimiento: '2011-01-17', gradoId: 'g6', grupoId: 'gr6A', foto: null, email: 'gabriela.rojas@email.com', telefono: '3001234591', direccion: 'Cll 40 #12-34', acudiente: { nombre: 'Andrés Rojas', parentesco: 'Padre', telefono: '3101234591', email: 'andres.rojas@email.com' }, activo: true, creado: '2024-02-01' }
  ],

  notas: [
    // Período 1 - Grupo 10A - Matemáticas (m1)
    { id: 'n1', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 8.5, descripcion: 'Examen 1er período', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n2', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p1', tipo: 'tarea', valor: 9.0, descripcion: 'Tareas período 1', fecha: '2024-03-20', docenteId: 'u2' },
    { id: 'n3', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p1', tipo: 'quiz', valor: 7.5, descripcion: 'Quiz álgebra', fecha: '2024-02-28', docenteId: 'u2' },
    { id: 'n4', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p1', tipo: 'proyecto', valor: 9.5, descripcion: 'Proyecto geometría', fecha: '2024-04-10', docenteId: 'u2' },
    { id: 'n5', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p1', tipo: 'participacion', valor: 8.0, descripcion: 'Participación en clase', fecha: '2024-04-15', docenteId: 'u2' },
    
    { id: 'n6', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 6.0, descripcion: 'Examen 1er período', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n7', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p1', tipo: 'tarea', valor: 7.0, descripcion: 'Tareas período 1', fecha: '2024-03-20', docenteId: 'u2' },
    { id: 'n8', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p1', tipo: 'quiz', valor: 5.5, descripcion: 'Quiz álgebra', fecha: '2024-02-28', docenteId: 'u2' },
    { id: 'n9', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p1', tipo: 'proyecto', valor: 7.0, descripcion: 'Proyecto geometría', fecha: '2024-04-10', docenteId: 'u2' },
    { id: 'n10', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p1', tipo: 'participacion', valor: 6.5, descripcion: 'Participación en clase', fecha: '2024-04-15', docenteId: 'u2' },

    { id: 'n11', estudianteId: 'e3', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 9.0, descripcion: 'Examen 1er período', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n12', estudianteId: 'e3', materiaId: 'm1', periodoId: 'p1', tipo: 'tarea', valor: 9.5, descripcion: 'Tareas período 1', fecha: '2024-03-20', docenteId: 'u2' },
    { id: 'n13', estudianteId: 'e3', materiaId: 'm1', periodoId: 'p1', tipo: 'quiz', valor: 8.5, descripcion: 'Quiz álgebra', fecha: '2024-02-28', docenteId: 'u2' },
    { id: 'n14', estudianteId: 'e3', materiaId: 'm1', periodoId: 'p1', tipo: 'proyecto', valor: 10.0, descripcion: 'Proyecto geometría', fecha: '2024-04-10', docenteId: 'u2' },
    { id: 'n15', estudianteId: 'e3', materiaId: 'm1', periodoId: 'p1', tipo: 'participacion', valor: 9.0, descripcion: 'Participación en clase', fecha: '2024-04-15', docenteId: 'u2' },

    { id: 'n16', estudianteId: 'e4', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 4.5, descripcion: 'Examen 1er período', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n17', estudianteId: 'e4', materiaId: 'm1', periodoId: 'p1', tipo: 'tarea', valor: 5.5, descripcion: 'Tareas período 1', fecha: '2024-03-20', docenteId: 'u2' },
    { id: 'n18', estudianteId: 'e4', materiaId: 'm1', periodoId: 'p1', tipo: 'quiz', valor: 4.0, descripcion: 'Quiz álgebra', fecha: '2024-02-28', docenteId: 'u2' },
    { id: 'n19', estudianteId: 'e4', materiaId: 'm1', periodoId: 'p1', tipo: 'proyecto', valor: 5.0, descripcion: 'Proyecto geometría', fecha: '2024-04-10', docenteId: 'u2' },
    { id: 'n20', estudianteId: 'e4', materiaId: 'm1', periodoId: 'p1', tipo: 'participacion', valor: 5.0, descripcion: 'Participación en clase', fecha: '2024-04-15', docenteId: 'u2' },

    { id: 'n21', estudianteId: 'e5', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 7.5, descripcion: 'Examen 1er período', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n22', estudianteId: 'e5', materiaId: 'm1', periodoId: 'p1', tipo: 'tarea', valor: 8.0, descripcion: 'Tareas período 1', fecha: '2024-03-20', docenteId: 'u2' },
    { id: 'n23', estudianteId: 'e5', materiaId: 'm1', periodoId: 'p1', tipo: 'quiz', valor: 7.0, descripcion: 'Quiz álgebra', fecha: '2024-02-28', docenteId: 'u2' },
    { id: 'n24', estudianteId: 'e5', materiaId: 'm1', periodoId: 'p1', tipo: 'proyecto', valor: 8.5, descripcion: 'Proyecto geometría', fecha: '2024-04-10', docenteId: 'u2' },
    { id: 'n25', estudianteId: 'e5', materiaId: 'm1', periodoId: 'p1', tipo: 'participacion', valor: 7.5, descripcion: 'Participación en clase', fecha: '2024-04-15', docenteId: 'u2' },

    // Período 2 - Matemáticas Grupo 10A
    { id: 'n26', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p2', tipo: 'examen', valor: 8.0, descripcion: 'Examen 2do período', fecha: '2024-06-15', docenteId: 'u2' },
    { id: 'n27', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p2', tipo: 'tarea', valor: 8.5, descripcion: 'Tareas período 2', fecha: '2024-06-20', docenteId: 'u2' },
    { id: 'n28', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p2', tipo: 'quiz', valor: 9.0, descripcion: 'Quiz trigonometría', fecha: '2024-05-28', docenteId: 'u2' },
    { id: 'n29', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p2', tipo: 'proyecto', valor: 8.5, descripcion: 'Proyecto estadística', fecha: '2024-07-10', docenteId: 'u2' },
    { id: 'n30', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p2', tipo: 'participacion', valor: 9.0, descripcion: 'Participación en clase', fecha: '2024-07-15', docenteId: 'u2' },

    { id: 'n31', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p2', tipo: 'examen', valor: 5.5, descripcion: 'Examen 2do período', fecha: '2024-06-15', docenteId: 'u2' },
    { id: 'n32', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p2', tipo: 'tarea', valor: 6.5, descripcion: 'Tareas período 2', fecha: '2024-06-20', docenteId: 'u2' },
    { id: 'n33', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p2', tipo: 'quiz', valor: 6.0, descripcion: 'Quiz trigonometría', fecha: '2024-05-28', docenteId: 'u2' },
    { id: 'n34', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p2', tipo: 'proyecto', valor: 7.0, descripcion: 'Proyecto estadística', fecha: '2024-07-10', docenteId: 'u2' },
    { id: 'n35', estudianteId: 'e2', materiaId: 'm1', periodoId: 'p2', tipo: 'participacion', valor: 7.0, descripcion: 'Participación en clase', fecha: '2024-07-15', docenteId: 'u2' },

    // Lengua Castellana - Grupo 10A - Período 1
    { id: 'n36', estudianteId: 'e1', materiaId: 'm2', periodoId: 'p1', tipo: 'examen', valor: 9.0, descripcion: 'Examen literatura', fecha: '2024-03-18', docenteId: 'u3' },
    { id: 'n37', estudianteId: 'e1', materiaId: 'm2', periodoId: 'p1', tipo: 'tarea', valor: 9.5, descripcion: 'Ensayo', fecha: '2024-03-25', docenteId: 'u3' },
    { id: 'n38', estudianteId: 'e1', materiaId: 'm2', periodoId: 'p1', tipo: 'quiz', valor: 8.0, descripcion: 'Quiz gramática', fecha: '2024-03-01', docenteId: 'u3' },
    { id: 'n39', estudianteId: 'e1', materiaId: 'm2', periodoId: 'p1', tipo: 'proyecto', valor: 9.0, descripcion: 'Proyecto de lectura', fecha: '2024-04-12', docenteId: 'u3' },
    { id: 'n40', estudianteId: 'e1', materiaId: 'm2', periodoId: 'p1', tipo: 'participacion', valor: 10.0, descripcion: 'Exposición oral', fecha: '2024-04-18', docenteId: 'u3' },

    { id: 'n41', estudianteId: 'e2', materiaId: 'm2', periodoId: 'p1', tipo: 'examen', valor: 7.0, descripcion: 'Examen literatura', fecha: '2024-03-18', docenteId: 'u3' },
    { id: 'n42', estudianteId: 'e2', materiaId: 'm2', periodoId: 'p1', tipo: 'tarea', valor: 7.5, descripcion: 'Ensayo', fecha: '2024-03-25', docenteId: 'u3' },
    { id: 'n43', estudianteId: 'e2', materiaId: 'm2', periodoId: 'p1', tipo: 'quiz', valor: 6.5, descripcion: 'Quiz gramática', fecha: '2024-03-01', docenteId: 'u3' },
    { id: 'n44', estudianteId: 'e2', materiaId: 'm2', periodoId: 'p1', tipo: 'proyecto', valor: 8.0, descripcion: 'Proyecto de lectura', fecha: '2024-04-12', docenteId: 'u3' },
    { id: 'n45', estudianteId: 'e2', materiaId: 'm2', periodoId: 'p1', tipo: 'participacion', valor: 7.0, descripcion: 'Exposición oral', fecha: '2024-04-18', docenteId: 'u3' },

    // Ciencias - Grupo 10A - Período 1
    { id: 'n46', estudianteId: 'e1', materiaId: 'm3', periodoId: 'p1', tipo: 'examen', valor: 7.5, descripcion: 'Examen biología', fecha: '2024-03-20', docenteId: 'u4' },
    { id: 'n47', estudianteId: 'e1', materiaId: 'm3', periodoId: 'p1', tipo: 'tarea', valor: 8.0, descripcion: 'Informe laboratorio', fecha: '2024-03-28', docenteId: 'u4' },
    { id: 'n48', estudianteId: 'e1', materiaId: 'm3', periodoId: 'p1', tipo: 'quiz', valor: 8.5, descripcion: 'Quiz célula', fecha: '2024-03-05', docenteId: 'u4' },
    { id: 'n49', estudianteId: 'e1', materiaId: 'm3', periodoId: 'p1', tipo: 'proyecto', valor: 9.0, descripcion: 'Proyecto ecosistemas', fecha: '2024-04-15', docenteId: 'u4' },
    { id: 'n50', estudianteId: 'e1', materiaId: 'm3', periodoId: 'p1', tipo: 'participacion', valor: 8.0, descripcion: 'Participación laboratorio', fecha: '2024-04-20', docenteId: 'u4' },

    // Período 3 - Matemáticas (para gráficas)
    { id: 'n51', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p3', tipo: 'examen', valor: 9.0, descripcion: 'Examen 3er período', fecha: '2024-10-15', docenteId: 'u2' },
    { id: 'n52', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p3', tipo: 'tarea', valor: 9.5, descripcion: 'Tareas período 3', fecha: '2024-10-20', docenteId: 'u2' },
    { id: 'n53', estudianteId: 'e1', materiaId: 'm1', periodoId: 'p3', tipo: 'quiz', valor: 8.5, descripcion: 'Quiz cálculo', fecha: '2024-09-28', docenteId: 'u2' },

    // Inglés - e1 - p1
    { id: 'n54', estudianteId: 'e1', materiaId: 'm5', periodoId: 'p1', tipo: 'examen', valor: 8.0, descripcion: 'Examen listening', fecha: '2024-03-22', docenteId: 'u3' },
    { id: 'n55', estudianteId: 'e1', materiaId: 'm5', periodoId: 'p1', tipo: 'tarea', valor: 8.5, descripcion: 'Reading exercises', fecha: '2024-03-29', docenteId: 'u3' },
    { id: 'n56', estudianteId: 'e1', materiaId: 'm5', periodoId: 'p1', tipo: 'quiz', valor: 7.5, descripcion: 'Grammar quiz', fecha: '2024-03-08', docenteId: 'u3' },

    // Física - e1 - p1
    { id: 'n57', estudianteId: 'e1', materiaId: 'm6', periodoId: 'p1', tipo: 'examen', valor: 7.0, descripcion: 'Examen mecánica', fecha: '2024-03-25', docenteId: 'u4' },
    { id: 'n58', estudianteId: 'e1', materiaId: 'm6', periodoId: 'p1', tipo: 'tarea', valor: 8.0, descripcion: 'Problemas física', fecha: '2024-04-01', docenteId: 'u4' },
    { id: 'n59', estudianteId: 'e1', materiaId: 'm6', periodoId: 'p1', tipo: 'quiz', valor: 6.5, descripcion: 'Quiz cinemática', fecha: '2024-03-10', docenteId: 'u4' },

    // Ciencias Sociales - e1 - p1
    { id: 'n60', estudianteId: 'e1', materiaId: 'm4', periodoId: 'p1', tipo: 'examen', valor: 8.5, descripcion: 'Examen historia', fecha: '2024-03-17', docenteId: 'u2' },
    { id: 'n61', estudianteId: 'e1', materiaId: 'm4', periodoId: 'p1', tipo: 'tarea', valor: 9.0, descripcion: 'Mapa conceptual', fecha: '2024-03-24', docenteId: 'u2' },
    { id: 'n62', estudianteId: 'e1', materiaId: 'm4', periodoId: 'p1', tipo: 'proyecto', valor: 9.5, descripcion: 'Proyecto geopolítica', fecha: '2024-04-08', docenteId: 'u2' },

    // Notas para más estudiantes - Ciencias p1 e3-e10
    { id: 'n63', estudianteId: 'e3', materiaId: 'm3', periodoId: 'p1', tipo: 'examen', valor: 9.5, descripcion: 'Examen biología', fecha: '2024-03-20', docenteId: 'u4' },
    { id: 'n64', estudianteId: 'e4', materiaId: 'm3', periodoId: 'p1', tipo: 'examen', valor: 4.0, descripcion: 'Examen biología', fecha: '2024-03-20', docenteId: 'u4' },
    { id: 'n65', estudianteId: 'e5', materiaId: 'm3', periodoId: 'p1', tipo: 'examen', valor: 7.5, descripcion: 'Examen biología', fecha: '2024-03-20', docenteId: 'u4' },
    { id: 'n66', estudianteId: 'e6', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 8.0, descripcion: 'Examen mat', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n67', estudianteId: 'e7', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 7.5, descripcion: 'Examen mat', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n68', estudianteId: 'e8', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 6.5, descripcion: 'Examen mat', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n69', estudianteId: 'e9', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 8.5, descripcion: 'Examen mat', fecha: '2024-03-15', docenteId: 'u2' },
    { id: 'n70', estudianteId: 'e10', materiaId: 'm1', periodoId: 'p1', tipo: 'examen', valor: 5.5, descripcion: 'Examen mat', fecha: '2024-03-15', docenteId: 'u2' }
  ],

  asistencia: [
    // Grupo 10A - Matemáticas - Semana muestra
    { id: 'a1', estudianteId: 'e1', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a2', estudianteId: 'e2', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a3', estudianteId: 'e3', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'ausente', justificacion: null },
    { id: 'a4', estudianteId: 'e4', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'tardanza', justificacion: null },
    { id: 'a5', estudianteId: 'e5', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a6', estudianteId: 'e6', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a7', estudianteId: 'e7', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'ausente', justificacion: 'Cita médica' },
    { id: 'a8', estudianteId: 'e8', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a9', estudianteId: 'e9', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a10', estudianteId: 'e10', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'justificado', justificacion: 'Permiso familiar' },
    
    { id: 'a11', estudianteId: 'e1', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-02', estado: 'presente', justificacion: null },
    { id: 'a12', estudianteId: 'e2', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-02', estado: 'ausente', justificacion: null },
    { id: 'a13', estudianteId: 'e3', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-02', estado: 'presente', justificacion: null },
    { id: 'a14', estudianteId: 'e4', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-02', estado: 'ausente', justificacion: null },
    { id: 'a15', estudianteId: 'e5', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-02', estado: 'presente', justificacion: null },
    
    { id: 'a16', estudianteId: 'e1', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-03', estado: 'presente', justificacion: null },
    { id: 'a17', estudianteId: 'e2', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-03', estado: 'presente', justificacion: null },
    { id: 'a18', estudianteId: 'e3', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-03', estado: 'tardanza', justificacion: null },
    { id: 'a19', estudianteId: 'e4', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-03', estado: 'presente', justificacion: null },
    { id: 'a20', estudianteId: 'e5', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-10-03', estado: 'ausente', justificacion: null },

    { id: 'a21', estudianteId: 'e1', materiaId: 'm2', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a22', estudianteId: 'e2', materiaId: 'm2', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a23', estudianteId: 'e3', materiaId: 'm2', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },
    { id: 'a24', estudianteId: 'e4', materiaId: 'm2', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'ausente', justificacion: null },
    { id: 'a25', estudianteId: 'e5', materiaId: 'm2', grupoId: 'gr10A', fecha: '2024-10-01', estado: 'presente', justificacion: null },

    { id: 'a26', estudianteId: 'e1', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-09-30', estado: 'presente', justificacion: null },
    { id: 'a27', estudianteId: 'e2', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-09-30', estado: 'presente', justificacion: null },
    { id: 'a28', estudianteId: 'e3', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-09-30', estado: 'presente', justificacion: null },
    { id: 'a29', estudianteId: 'e4', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-09-30', estado: 'ausente', justificacion: null },
    { id: 'a30', estudianteId: 'e5', materiaId: 'm1', grupoId: 'gr10A', fecha: '2024-09-30', estado: 'presente', justificacion: null }
  ],

  actividades: [
    { id: 'act1', titulo: 'Examen Final Matemáticas', fecha: '2024-11-15', tipo: 'examen', gradoId: 'g10', grupoId: 'gr10A', materiaId: 'm1', docenteId: 'u2', descripcion: 'Evaluación final del 3er período' },
    { id: 'act2', titulo: 'Entrega Proyecto Ciencias', fecha: '2024-11-10', tipo: 'proyecto', gradoId: 'g10', grupoId: 'gr10A', materiaId: 'm3', docenteId: 'u4', descripcion: 'Proyecto final ecosistemas' },
    { id: 'act3', titulo: 'Exposición Lengua Castellana', fecha: '2024-11-08', tipo: 'exposicion', gradoId: 'g10', grupoId: 'gr10A', materiaId: 'm2', docenteId: 'u3', descripcion: 'Presentaciones orales' },
    { id: 'act4', titulo: 'Quiz Inglés Unit 5', fecha: '2024-11-05', tipo: 'quiz', gradoId: 'g10', grupoId: 'gr10A', materiaId: 'm5', docenteId: 'u3', descripcion: 'Vocabulario y gramática' },
    { id: 'act5', titulo: 'Examen Física', fecha: '2024-11-20', tipo: 'examen', gradoId: 'g10', grupoId: 'gr10B', materiaId: 'm6', docenteId: 'u4', descripcion: 'Termodinámica' }
  ],

  notificaciones: [
    { id: 'not1', tipo: 'alerta', mensaje: 'Diego Hernández tiene promedio bajo en Matemáticas (4.8)', fecha: '2024-10-15', leida: false, usuarioId: 'u2' },
    { id: 'not2', tipo: 'asistencia', mensaje: 'Andrés Moreno ha faltado 3 días consecutivos', fecha: '2024-10-14', leida: false, usuarioId: 'u2' },
    { id: 'not3', tipo: 'sistema', mensaje: 'Período 3er Trimestre iniciado correctamente', fecha: '2024-09-01', leida: true, usuarioId: 'u1' },
    { id: 'not4', tipo: 'alerta', mensaje: 'Felipe Jiménez tiene promedio bajo en Física (5.2)', fecha: '2024-10-13', leida: false, usuarioId: 'u4' }
  ]
};

// ============================================================
// DB API
// ============================================================
const DB = {
  _data: null,

  init() {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      this._data = JSON.parse(JSON.stringify(DEMO_DATA));
      this._save();
    } else {
      this._data = JSON.parse(stored);
      // Merge config keys if missing
      if (!this._data.actividades) this._data.actividades = DEMO_DATA.actividades;
      if (!this._data.notificaciones) this._data.notificaciones = DEMO_DATA.notificaciones;
    }
    return this;
  },

  reset() {
    this._data = JSON.parse(JSON.stringify(DEMO_DATA));
    this._save();
  },

  _save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this._data));
  },

  // ---- Config ----
  getConfig() { return this._data.config; },
  updateConfig(key, value) {
    this._data.config[key] = value;
    this._save();
  },
  updateInstitucion(data) {
    this._data.config.institucion = { ...this._data.config.institucion, ...data };
    this._save();
  },
  updateEscala(data) {
    this._data.config.escala = { ...this._data.config.escala, ...data };
    this._save();
  },
  updateTiposActividad(tipos) {
    this._data.config.tiposActividad = tipos;
    this._save();
  },

  // ---- Usuarios ----
  getUsuarios() { return this._data.usuarios || []; },
  getUsuario(id) { return this._data.usuarios.find(u => u.id === id); },
  getUsuarioByEmail(email) { return this._data.usuarios.find(u => u.email === email); },
  addUsuario(u) {
    u.id = 'u' + Date.now();
    u.creado = new Date().toISOString().split('T')[0];
    this._data.usuarios.push(u);
    this._save();
    return u;
  },
  updateUsuario(id, data) {
    const idx = this._data.usuarios.findIndex(u => u.id === id);
    if (idx > -1) { this._data.usuarios[idx] = { ...this._data.usuarios[idx], ...data }; this._save(); }
  },
  deleteUsuario(id) {
    this._data.usuarios = this._data.usuarios.filter(u => u.id !== id);
    this._save();
  },

  // ---- Períodos ----
  getPeriodos() { return this._data.periodos || []; },
  getPeriodo(id) { return this._data.periodos.find(p => p.id === id); },
  getPeriodoActivo() { return this._data.periodos.find(p => p.activo); },
  addPeriodo(p) {
    p.id = 'p' + Date.now();
    this._data.periodos.push(p);
    this._save();
    return p;
  },
  updatePeriodo(id, data) {
    const idx = this._data.periodos.findIndex(p => p.id === id);
    if (idx > -1) { this._data.periodos[idx] = { ...this._data.periodos[idx], ...data }; this._save(); }
  },
  deletePeriodo(id) {
    this._data.periodos = this._data.periodos.filter(p => p.id !== id);
    this._save();
  },

  // ---- Grados ----
  getGrados() { return this._data.grados || []; },
  getGrado(id) { return this._data.grados.find(g => g.id === id); },
  addGrado(g) {
    g.id = 'g' + Date.now();
    this._data.grados.push(g);
    this._save();
    return g;
  },
  updateGrado(id, data) {
    const idx = this._data.grados.findIndex(g => g.id === id);
    if (idx > -1) { this._data.grados[idx] = { ...this._data.grados[idx], ...data }; this._save(); }
  },
  deleteGrado(id) {
    this._data.grados = this._data.grados.filter(g => g.id !== id);
    this._data.grupos = this._data.grupos.filter(gr => gr.gradoId !== id);
    this._save();
  },

  // ---- Grupos ----
  getGrupos() { return this._data.grupos || []; },
  getGrupo(id) { return this._data.grupos.find(g => g.id === id); },
  getGruposByGrado(gradoId) { return this._data.grupos.filter(g => g.gradoId === gradoId); },
  addGrupo(g) {
    g.id = 'gr' + Date.now();
    this._data.grupos.push(g);
    this._save();
    return g;
  },
  updateGrupo(id, data) {
    const idx = this._data.grupos.findIndex(g => g.id === id);
    if (idx > -1) { this._data.grupos[idx] = { ...this._data.grupos[idx], ...data }; this._save(); }
  },
  deleteGrupo(id) {
    this._data.grupos = this._data.grupos.filter(g => g.id !== id);
    this._save();
  },

  // ---- Materias ----
  getMaterias() { return this._data.materias || []; },
  getMateria(id) { return this._data.materias.find(m => m.id === id); },
  getMateriasByGrado(gradoId) { return this._data.materias.filter(m => m.gradoId === gradoId); },
  getMateriasByDocente(docenteId) { return this._data.materias.filter(m => m.docenteId === docenteId); },
  addMateria(m) {
    m.id = 'm' + Date.now();
    this._data.materias.push(m);
    this._save();
    return m;
  },
  updateMateria(id, data) {
    const idx = this._data.materias.findIndex(m => m.id === id);
    if (idx > -1) { this._data.materias[idx] = { ...this._data.materias[idx], ...data }; this._save(); }
  },
  deleteMateria(id) {
    this._data.materias = this._data.materias.filter(m => m.id !== id);
    this._save();
  },

  // ---- Estudiantes ----
  getEstudiantes() { return this._data.estudiantes || []; },
  getEstudiante(id) { return this._data.estudiantes.find(e => e.id === id); },
  getEstudiantesByGrupo(grupoId) { return this._data.estudiantes.filter(e => e.grupoId === grupoId && e.activo); },
  getEstudiantesByGrado(gradoId) { return this._data.estudiantes.filter(e => e.gradoId === gradoId && e.activo); },
  addEstudiante(e) {
    e.id = 'e' + Date.now();
    e.creado = new Date().toISOString().split('T')[0];
    e.activo = true;
    this._data.estudiantes.push(e);
    this._save();
    return e;
  },
  updateEstudiante(id, data) {
    const idx = this._data.estudiantes.findIndex(e => e.id === id);
    if (idx > -1) { this._data.estudiantes[idx] = { ...this._data.estudiantes[idx], ...data }; this._save(); }
  },
  deleteEstudiante(id) {
    const idx = this._data.estudiantes.findIndex(e => e.id === id);
    if (idx > -1) { this._data.estudiantes[idx].activo = false; this._save(); }
  },

  // ---- Notas ----
  getNotas() { return this._data.notas || []; },
  getNotasByEstudiante(estudianteId) { return this._data.notas.filter(n => n.estudianteId === estudianteId); },
  getNotasByGrupoMateriaPeriodo(grupoId, materiaId, periodoId) {
    const estudiantes = this.getEstudiantesByGrupo(grupoId).map(e => e.id);
    return this._data.notas.filter(n => estudiantes.includes(n.estudianteId) && n.materiaId === materiaId && n.periodoId === periodoId);
  },
  getNotasByEstudianteMateriaPeriodo(eId, mId, pId) {
    return this._data.notas.filter(n => n.estudianteId === eId && n.materiaId === mId && n.periodoId === pId);
  },
  addNota(n) {
    n.id = 'n' + Date.now() + Math.random().toString(36).substr(2,5);
    this._data.notas.push(n);
    this._save();
    return n;
  },
  updateNota(id, data) {
    const idx = this._data.notas.findIndex(n => n.id === id);
    if (idx > -1) { this._data.notas[idx] = { ...this._data.notas[idx], ...data }; this._save(); }
  },
  deleteNota(id) {
    this._data.notas = this._data.notas.filter(n => n.id !== id);
    this._save();
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
  getAsistencia() { return this._data.asistencia || []; },
  getAsistenciaByFechaGrupoMateria(fecha, grupoId, materiaId) {
    const estudiantes = this.getEstudiantesByGrupo(grupoId).map(e => e.id);
    return this._data.asistencia.filter(a => a.fecha === fecha && a.materiaId === materiaId && estudiantes.includes(a.estudianteId));
  },
  getAsistenciaByEstudiante(estudianteId) {
    return this._data.asistencia.filter(a => a.estudianteId === estudianteId);
  },
  setAsistencia(estudianteId, materiaId, grupoId, fecha, estado, justificacion = null) {
    const existing = this._data.asistencia.find(a => a.estudianteId === estudianteId && a.materiaId === materiaId && a.fecha === fecha);
    if (existing) {
      existing.estado = estado;
      existing.justificacion = justificacion;
    } else {
      this._data.asistencia.push({ id: 'a' + Date.now() + Math.random().toString(36).substr(2,5), estudianteId, materiaId, grupoId, fecha, estado, justificacion });
    }
    this._save();
  },
  calcularPorcentajeAsistencia(estudianteId, materiaId) {
    const reg = materiaId ? this._data.asistencia.filter(a => a.estudianteId === estudianteId && a.materiaId === materiaId)
                          : this._data.asistencia.filter(a => a.estudianteId === estudianteId);
    if (!reg.length) return 100;
    const presentes = reg.filter(a => a.estado === 'presente' || a.estado === 'justificado').length;
    return Math.round((presentes / reg.length) * 100);
  },

  // ---- Actividades ----
  getActividades() { return this._data.actividades || []; },
  addActividad(a) {
    a.id = 'act' + Date.now();
    this._data.actividades.push(a);
    this._save();
    return a;
  },
  deleteActividad(id) {
    this._data.actividades = this._data.actividades.filter(a => a.id !== id);
    this._save();
  },

  // ---- Notificaciones ----
  getNotificaciones(usuarioId) { return (this._data.notificaciones || []).filter(n => !usuarioId || n.usuarioId === usuarioId); },
  getNotificacionesNoLeidas(usuarioId) { return this.getNotificaciones(usuarioId).filter(n => !n.leida); },
  marcarLeida(id) {
    const n = this._data.notificaciones.find(n => n.id === id);
    if (n) { n.leida = true; this._save(); }
  },
  marcarTodasLeidas(usuarioId) {
    this._data.notificaciones.filter(n => n.usuarioId === usuarioId).forEach(n => n.leida = true);
    this._save();
  },
  addNotificacion(n) {
    n.id = 'not' + Date.now();
    n.fecha = new Date().toISOString().split('T')[0];
    n.leida = false;
    if (!this._data.notificaciones) this._data.notificaciones = [];
    this._data.notificaciones.unshift(n);
    this._save();
  },

  // ---- Stats para Dashboard ----
  getStats() {
    const estudiantes = this.getEstudiantes().filter(e => e.activo);
    const materias = this.getMaterias();
    const periodos = this.getPeriodos();
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

    // Estudiantes en riesgo
    const enRiesgo = [];
    estudiantes.forEach(est => {
      materias.forEach(mat => {
        const pf = this.calcularPromedioFinal(est.id, mat.id);
        if (pf !== null && pf < minAprobatorio) {
          enRiesgo.push({ estudiante: est, materia: mat, promedio: pf, tipo: 'nota' });
        }
      });
      const asist = this.calcularPorcentajeAsistencia(est.id, null);
      if (asist < 80) {
        enRiesgo.push({ estudiante: est, materia: null, promedio: asist, tipo: 'asistencia' });
      }
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
