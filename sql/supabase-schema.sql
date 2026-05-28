-- ============================================================
-- ACADEX — Esquema de Supabase
-- Ejecutar en el SQL Editor de Supabase.
--
-- Si ya ejecutaste la versión anterior (con auth_id y
-- crear_usuario_auth), necesitas migrar manualmente:
--   ALTER TABLE usuarios ADD COLUMN password text;
--   ALTER TABLE usuarios ADD COLUMN documento text;
--   ALTER TABLE usuarios ALTER COLUMN email DROP NOT NULL;
--   ALTER TABLE usuarios DROP COLUMN auth_id;
--   UPDATE usuarios SET password = 'admin123' WHERE id = 'u1';
--   UPDATE usuarios SET password = 'docente123' WHERE id IN ('u2','u3','u4');
--   UPDATE usuarios SET password = '1001234567', documento = '1001234567' WHERE id = 'u5';
--   DROP FUNCTION IF EXISTS crear_usuario_auth(text,text,text);
--   ALTER TABLE usuarios ALTER COLUMN password SET NOT NULL;
--   ALTER TABLE usuarios ADD CONSTRAINT usuarios_documento_unique UNIQUE (documento);
-- Luego ejecuta el resto del schema normalmente.
-- ============================================================

-- 1. Configuración de la institución
CREATE TABLE config (
  id bigint primary key default 1,
  institucion jsonb not null default '{}',
  escala jsonb not null default '{"min":0,"max":10,"minAprobatorio":6}',
  tipos_actividad jsonb not null default '[]',
  boletin_template jsonb not null default '{}'
);

-- 2. Usuarios del sistema
CREATE TABLE usuarios (
  id text primary key,
  nombre text not null,
  apellido text not null,
  email text,
  documento text unique,
  password text not null,
  UNIQUE(email),
  rol text not null check (rol in ('admin','docente','estudiante')),
  avatar text,
  activo boolean default true,
  estudiante_id text,
  creado date default current_date
);

-- 3. Periodos académicos
CREATE TABLE periodos (
  id text primary key,
  nombre text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  activo boolean default false,
  anio integer not null
);

-- 4. Grados
CREATE TABLE grados (
  id text primary key,
  nombre text not null,
  nivel text not null,
  orden integer not null
);

-- 5. Grupos
CREATE TABLE grupos (
  id text primary key,
  nombre text not null,
  grado_id text not null references grados(id) on delete cascade,
  director text references usuarios(id) on delete set null
);

-- 6. Materias
CREATE TABLE materias (
  id text primary key,
  nombre text not null,
  grado_id text not null references grados(id) on delete cascade,
  docente_id text references usuarios(id) on delete set null,
  color text default '#3498DB',
  horas integer default 4,
  codigo text
);

-- 7. Estudiantes
CREATE TABLE estudiantes (
  id text primary key,
  nombre text not null,
  apellido text not null,
  documento text not null unique,
  tipo_doc text default 'TI',
  fecha_nacimiento date,
  grado_id text references grados(id) on delete set null,
  grupo_id text references grupos(id) on delete set null,
  foto text,
  email text,
  telefono text,
  direccion text,
  acudiente jsonb default '{}',
  activo boolean default true,
  creado date default current_date
);

-- 8. Notas
CREATE TABLE notas (
  id text primary key,
  estudiante_id text not null references estudiantes(id) on delete cascade,
  materia_id text not null references materias(id) on delete cascade,
  periodo_id text not null references periodos(id) on delete cascade,
  tipo text not null,
  valor numeric(4,2) not null,
  descripcion text,
  fecha date not null,
  docente_id text references usuarios(id) on delete set null
);

-- 9. Asistencia
CREATE TABLE asistencia (
  id text primary key,
  estudiante_id text not null references estudiantes(id) on delete cascade,
  materia_id text not null references materias(id) on delete cascade,
  grupo_id text not null references grupos(id) on delete cascade,
  fecha date not null,
  estado text not null check (estado in ('presente','ausente','tardanza','justificado')),
  justificacion text
);

-- 10. Actividades
CREATE TABLE actividades (
  id text primary key,
  titulo text not null,
  fecha date not null,
  tipo text not null,
  grado_id text references grados(id) on delete cascade,
  grupo_id text references grupos(id) on delete cascade,
  materia_id text references materias(id) on delete cascade,
  docente_id text references usuarios(id) on delete set null,
  descripcion text
);

-- 11. Notificaciones
CREATE TABLE notificaciones (
  id text primary key,
  tipo text not null,
  mensaje text not null,
  fecha date default current_date,
  leida boolean default false,
  usuario_id text references usuarios(id) on delete cascade
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Config inicial
INSERT INTO config (id, institucion, escala, tipos_actividad, boletin_template) VALUES (
  1,
  '{"nombre":"Institución Educativa Ejemplo","nit":"900.123.456-7","direccion":"Calle 123 #45-67, Ciudad","telefono":"(601) 234-5678","email":"info@institucion.edu.co","rector":"Dr. Carlos Mendoza"}',
  '{"min":0,"max":10,"minAprobatorio":6}',
  '[{"id":"examen","nombre":"Examen","porcentaje":40,"color":"#E74C3C"},{"id":"tarea","nombre":"Tarea","porcentaje":20,"color":"#3498DB"},{"id":"quiz","nombre":"Quiz","porcentaje":15,"color":"#9B59B6"},{"id":"proyecto","nombre":"Proyecto","porcentaje":15,"color":"#E67E22"},{"id":"participacion","nombre":"Participación","porcentaje":10,"color":"#2ECC71"}]',
  '{"encabezado":"BOLETÍN DE CALIFICACIONES","pie":"Firma del Director","colorPrimario":"#1E3A5F"}'
);

-- Usuarios demo (autenticación custom contra la tabla)
INSERT INTO usuarios (id, nombre, apellido, email, password, rol, activo) VALUES
  ('u1','Admin','Sistema','admin@acadex.com','admin123','admin',true),
  ('u2','María','González','docente@acadex.com','docente123','docente',true),
  ('u3','Pedro','Ramírez','pedro.ramirez@acadex.com','docente123','docente',true),
  ('u4','Ana','Martínez','ana.martinez@acadex.com','docente123','docente',true);

INSERT INTO usuarios (id, nombre, apellido, email, documento, password, rol, estudiante_id, activo) VALUES
  ('u_e1','Sofía','López','1001234567@estudiante.acadex.app','1001234567','1001234567','estudiante','e1',true),
  ('u_e2','Andrés','Moreno','1001234568@estudiante.acadex.app','1001234568','1001234568','estudiante','e2',true),
  ('u_e3','Valentina','Castro','1001234569@estudiante.acadex.app','1001234569','1001234569','estudiante','e3',true),
  ('u_e4','Diego','Hernández','1001234570@estudiante.acadex.app','1001234570','1001234570','estudiante','e4',true),
  ('u_e5','Isabella','Ruiz','1001234571@estudiante.acadex.app','1001234571','1001234571','estudiante','e5',true),
  ('u_e6','Sebastián','Vargas','1001234572@estudiante.acadex.app','1001234572','1001234572','estudiante','e6',true),
  ('u_e7','Camila','Torres','1001234573@estudiante.acadex.app','1001234573','1001234573','estudiante','e7',true),
  ('u_e8','Felipe','Jiménez','1001234574@estudiante.acadex.app','1001234574','1001234574','estudiante','e8',true),
  ('u_e9','Lucía','Sánchez','1001234575@estudiante.acadex.app','1001234575','1001234575','estudiante','e9',true),
  ('u_e10','Miguel','Gómez','1001234576@estudiante.acadex.app','1001234576','1001234576','estudiante','e10',true),
  ('u_e11','Sara','Díaz','1001234577@estudiante.acadex.app','1001234577','1001234577','estudiante','e11',true),
  ('u_e12','Nicolás','Pereira','1001234578@estudiante.acadex.app','1001234578','1001234578','estudiante','e12',true),
  ('u_e13','Laura','Molina','1001234579@estudiante.acadex.app','1001234579','1001234579','estudiante','e13',true),
  ('u_e14','David','Reyes','1001234580@estudiante.acadex.app','1001234580','1001234580','estudiante','e14',true),
  ('u_e15','Mariana','Vargas','1001234581@estudiante.acadex.app','1001234581','1001234581','estudiante','e15',true),
  ('u_e16','Carlos','Pino','1001234582@estudiante.acadex.app','1001234582','1001234582','estudiante','e16',true),
  ('u_e17','Juliana','Cruz','1001234583@estudiante.acadex.app','1001234583','1001234583','estudiante','e17',true),
  ('u_e18','Esteban','Ríos','1001234584@estudiante.acadex.app','1001234584','1001234584','estudiante','e18',true),
  ('u_e19','Daniela','Ortega','1001234585@estudiante.acadex.app','1001234585','1001234585','estudiante','e19',true),
  ('u_e20','Tomás','Aguilar','1001234586@estudiante.acadex.app','1001234586','1001234586','estudiante','e20',true),
  ('u_e21','Paula','Serrano','1001234587@estudiante.acadex.app','1001234587','1001234587','estudiante','e21',true),
  ('u_e22','Alejandro','Muñoz','1001234588@estudiante.acadex.app','1001234588','1001234588','estudiante','e22',true),
  ('u_e23','Natalia','Flores','1001234589@estudiante.acadex.app','1001234589','1001234589','estudiante','e23',true),
  ('u_e24','Samuel','Cárdenas','1001234590@estudiante.acadex.app','1001234590','1001234590','estudiante','e24',true),
  ('u_e25','Gabriela','Rojas','1001234591@estudiante.acadex.app','1001234591','1001234591','estudiante','e25',true);

-- Periodos
INSERT INTO periodos (id, nombre, fecha_inicio, fecha_fin, activo, anio) VALUES
  ('p1','1er Trimestre','2024-02-05','2024-04-26',false,2024),
  ('p2','2do Trimestre','2024-04-29','2024-07-26',false,2024),
  ('p3','3er Trimestre','2024-07-29','2024-11-22',true,2024);

-- Grados
INSERT INTO grados (id, nombre, nivel, orden) VALUES
  ('g6','6°','Secundaria',1),
  ('g7','7°','Secundaria',2),
  ('g8','8°','Secundaria',3),
  ('g9','9°','Secundaria',4),
  ('g10','10°','Media',5),
  ('g11','11°','Media',6);

-- Grupos
INSERT INTO grupos (id, nombre, grado_id, director) VALUES
  ('gr10A','10A','g10','u2'),
  ('gr10B','10B','g10','u3'),
  ('gr10C','10C','g10','u4'),
  ('gr11A','11A','g11','u2'),
  ('gr11B','11B','g11','u3'),
  ('gr9A','9A','g9','u4'),
  ('gr9B','9B','g9','u2'),
  ('gr8A','8A','g8','u3'),
  ('gr7A','7A','g7','u4'),
  ('gr6A','6A','g6','u2');

-- Materias
INSERT INTO materias (id, nombre, grado_id, docente_id, color, horas, codigo) VALUES
  ('m1','Matemáticas','g10','u2','#3498DB',5,'MAT10'),
  ('m2','Lengua Castellana','g10','u3','#9B59B6',4,'LEN10'),
  ('m3','Ciencias Naturales','g10','u4','#2ECC71',4,'CNA10'),
  ('m4','Ciencias Sociales','g10','u2','#E67E22',3,'CSO10'),
  ('m5','Inglés','g10','u3','#E74C3C',4,'ING10'),
  ('m6','Física','g10','u4','#1ABC9C',4,'FIS10'),
  ('m7','Educación Física','g10','u2','#F39C12',2,'EFI10'),
  ('m8','Tecnología e Informática','g10','u3','#8E44AD',2,'TEC10'),
  ('m9','Matemáticas','g11','u2','#3498DB',5,'MAT11'),
  ('m10','Lengua Castellana','g11','u3','#9B59B6',4,'LEN11'),
  ('m11','Química','g11','u4','#2ECC71',4,'QUI11'),
  ('m12','Física','g11','u2','#1ABC9C',4,'FIS11'),
  ('m13','Matemáticas','g9','u3','#3498DB',5,'MAT9'),
  ('m14','Ciencias Naturales','g9','u4','#2ECC71',4,'CNA9');

-- Estudiantes
INSERT INTO estudiantes (id, nombre, apellido, documento, tipo_doc, fecha_nacimiento, grado_id, grupo_id, email, telefono, direccion, acudiente, activo) VALUES
  ('e1','Sofía','López','1001234567','TI','2007-03-15','g10','gr10A','sofia.lopez@email.com','3001234567','Cra 45 #23-12','{"nombre":"Rosa López","parentesco":"Madre","telefono":"3109876543","email":"rosa.lopez@email.com"}',true),
  ('e2','Andrés','Moreno','1001234568','TI','2007-06-22','g10','gr10A','andres.moreno@email.com','3101234568','Cll 12 #34-56','{"nombre":"Juan Moreno","parentesco":"Padre","telefono":"3201234568","email":"juan.moreno@email.com"}',true),
  ('e3','Valentina','Castro','1001234569','TI','2007-09-10','g10','gr10A','valentina.castro@email.com','3201234569','Av. 68 #15-30','{"nombre":"Claudia Castro","parentesco":"Madre","telefono":"3101234569","email":"claudia.castro@email.com"}',true),
  ('e4','Diego','Hernández','1001234570','TI','2007-01-05','g10','gr10A','diego.hernandez@email.com','3001234570','Cra 7 #45-78','{"nombre":"Marta Hernández","parentesco":"Madre","telefono":"3151234570","email":"marta.h@email.com"}',true),
  ('e5','Isabella','Ruiz','1001234571','TI','2007-11-20','g10','gr10A','isabella.ruiz@email.com','3201234571','Cll 80 #23-45','{"nombre":"Jorge Ruiz","parentesco":"Padre","telefono":"3001234571","email":"jorge.ruiz@email.com"}',true),
  ('e6','Sebastián','Vargas','1001234572','TI','2007-04-18','g10','gr10A','sebastian.vargas@email.com','3101234572','Cra 50 #12-34','{"nombre":"Patricia Vargas","parentesco":"Madre","telefono":"3201234572","email":"patricia.v@email.com"}',true),
  ('e7','Camila','Torres','1001234573','TI','2007-07-30','g10','gr10A','camila.torres@email.com','3001234573','Cll 26 #67-89','{"nombre":"Luis Torres","parentesco":"Padre","telefono":"3101234573","email":"luis.torres@email.com"}',true),
  ('e8','Felipe','Jiménez','1001234574','TI','2007-02-14','g10','gr10A','felipe.jimenez@email.com','3201234574','Av. Caracas #34-56','{"nombre":"Carmen Jiménez","parentesco":"Madre","telefono":"3001234574","email":"carmen.j@email.com"}',true),
  ('e9','Lucía','Sánchez','1001234575','TI','2007-08-25','g10','gr10A','lucia.sanchez@email.com','3101234575','Cra 15 #78-90','{"nombre":"Roberto Sánchez","parentesco":"Padre","telefono":"3201234575","email":"roberto.s@email.com"}',true),
  ('e10','Miguel','Gómez','1001234576','TI','2007-12-01','g10','gr10A','miguel.gomez@email.com','3001234576','Cll 100 #45-67','{"nombre":"Ana Gómez","parentesco":"Madre","telefono":"3101234576","email":"ana.gomez@email.com"}',true),
  ('e11','Sara','Díaz','1001234577','TI','2007-05-17','g10','gr10B','sara.diaz@email.com','3201234577','Cra 30 #56-78','{"nombre":"Martha Díaz","parentesco":"Madre","telefono":"3001234577","email":"martha.d@email.com"}',true),
  ('e12','Nicolás','Pereira','1001234578','TI','2007-10-08','g10','gr10B','nicolas.pereira@email.com','3101234578','Cll 45 #89-01','{"nombre":"Carlos Pereira","parentesco":"Padre","telefono":"3201234578","email":"carlos.p@email.com"}',true),
  ('e13','Laura','Molina','1001234579','TI','2007-03-22','g10','gr10B','laura.molina@email.com','3001234579','Av. 1° de Mayo #23-45','{"nombre":"Gloria Molina","parentesco":"Madre","telefono":"3101234579","email":"gloria.m@email.com"}',true),
  ('e14','David','Reyes','1001234580','TI','2007-07-14','g11','gr11A','david.reyes@email.com','3201234580','Cra 9 #34-56','{"nombre":"Alicia Reyes","parentesco":"Madre","telefono":"3001234580","email":"alicia.r@email.com"}',true),
  ('e15','Mariana','Vargas','1001234581','TI','2006-09-30','g11','gr11A','mariana.vargas@email.com','3101234581','Cll 72 #12-34','{"nombre":"Héctor Vargas","parentesco":"Padre","telefono":"3201234581","email":"hector.v@email.com"}',true),
  ('e16','Carlos','Pino','1001234582','TI','2006-02-18','g11','gr11A','carlos.pino@email.com','3001234582','Cra 27 #56-78','{"nombre":"Elena Pino","parentesco":"Madre","telefono":"3101234582","email":"elena.p@email.com"}',true),
  ('e17','Juliana','Cruz','1001234583','TI','2006-11-05','g11','gr11A','juliana.cruz@email.com','3201234583','Cll 19 #34-56','{"nombre":"Pedro Cruz","parentesco":"Padre","telefono":"3001234583","email":"pedro.c@email.com"}',true),
  ('e18','Esteban','Ríos','1001234584','TI','2006-04-12','g11','gr11B','esteban.rios@email.com','3101234584','Av. Boyacá #67-89','{"nombre":"Sandra Ríos","parentesco":"Madre","telefono":"3201234584","email":"sandra.r@email.com"}',true),
  ('e19','Daniela','Ortega','1001234585','TI','2006-08-20','g11','gr11B','daniela.ortega@email.com','3001234585','Cra 60 #45-67','{"nombre":"Miguel Ortega","parentesco":"Padre","telefono":"3101234585","email":"miguel.o@email.com"}',true),
  ('e20','Tomás','Aguilar','1001234586','TI','2008-01-28','g9','gr9A','tomas.aguilar@email.com','3201234586','Cll 53 #23-45','{"nombre":"Beatriz Aguilar","parentesco":"Madre","telefono":"3001234586","email":"beatriz.a@email.com"}',true),
  ('e21','Paula','Serrano','1001234587','TI','2008-06-15','g9','gr9A','paula.serrano@email.com','3101234587','Cra 85 #34-56','{"nombre":"Ricardo Serrano","parentesco":"Padre","telefono":"3201234587","email":"ricardo.s@email.com"}',true),
  ('e22','Alejandro','Muñoz','1001234588','TI','2008-10-03','g9','gr9A','alejandro.munoz@email.com','3001234588','Av. 68 #56-78','{"nombre":"Teresa Muñoz","parentesco":"Madre","telefono":"3101234588","email":"teresa.m@email.com"}',true),
  ('e23','Natalia','Flores','1001234589','TI','2009-03-08','g8','gr8A','natalia.flores@email.com','3201234589','Cll 127 #45-67','{"nombre":"Fabio Flores","parentesco":"Padre","telefono":"3001234589","email":"fabio.f@email.com"}',true),
  ('e24','Samuel','Cárdenas','1001234590','TI','2010-07-22','g7','gr7A','samuel.cardenas@email.com','3101234590','Cra 20 #78-90','{"nombre":"Gloria Cárdenas","parentesco":"Madre","telefono":"3201234590","email":"gloria.c@email.com"}',true),
  ('e25','Gabriela','Rojas','1001234591','TI','2011-01-17','g6','gr6A','gabriela.rojas@email.com','3001234591','Cll 40 #12-34','{"nombre":"Andrés Rojas","parentesco":"Padre","telefono":"3101234591","email":"andres.rojas@email.com"}',true);

-- Notas
INSERT INTO notas (id, estudiante_id, materia_id, periodo_id, tipo, valor, descripcion, fecha, docente_id) VALUES
  -- Período 1 - 10A - Matemáticas
  ('n1','e1','m1','p1','examen',8.5,'Examen 1er período','2024-03-15','u2'),
  ('n2','e1','m1','p1','tarea',9.0,'Tareas período 1','2024-03-20','u2'),
  ('n3','e1','m1','p1','quiz',7.5,'Quiz álgebra','2024-02-28','u2'),
  ('n4','e1','m1','p1','proyecto',9.5,'Proyecto geometría','2024-04-10','u2'),
  ('n5','e1','m1','p1','participacion',8.0,'Participación en clase','2024-04-15','u2');

-- ============================================================
-- STORAGE: Bucket para avatares y fotos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

-- ============================================================
-- RLS: Permitir acceso público a todas las tablas
-- (App interna, sin autenticación de Supabase Auth)
-- ============================================================
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON periodos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON grados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON grupos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON materias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON estudiantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON asistencia FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON actividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notificaciones FOR ALL USING (true) WITH CHECK (true);
