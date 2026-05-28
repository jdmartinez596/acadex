-- ============================================================
-- ACADEX — Migración Multi-Institución
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

-- 1. Crear tabla de instituciones
CREATE TABLE IF NOT EXISTS instituciones (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  email TEXT DEFAULT '',
  activo BOOLEAN DEFAULT true,
  creado TIMESTAMP DEFAULT NOW()
);

-- 2. Insertar institución por defecto para datos existentes
INSERT INTO instituciones (id, nombre, direccion, telefono, email)
VALUES ('inst_default', 'Institución Principal', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 3. Permitir rol super_admin en la tabla usuarios
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('super_admin','admin','docente','estudiante'));

-- 4. Agregar columna institucion_id a todas las tablas
ALTER TABLE config ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE periodos ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE grados ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE materias ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE notas ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS institucion_id TEXT DEFAULT 'inst_default' REFERENCES instituciones(id);

-- 4. Actualizar registros existentes (por si crearon antes de la migración)
UPDATE config SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE usuarios SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE periodos SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE grados SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE grupos SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE materias SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE estudiantes SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE notas SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE asistencia SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE actividades SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;
UPDATE notificaciones SET institucion_id = 'inst_default' WHERE institucion_id IS NULL;

-- 5. Crear usuario super_admin (actualizar si ya existe por email)
UPDATE usuarios SET rol = 'super_admin', institucion_id = 'inst_default'
WHERE email = 'jdmartinez596@gmail.com';

INSERT INTO usuarios (id, nombre, apellido, email, documento, password, rol, institucion_id, activo)
SELECT 'super_admin', 'Jesus', 'Martinez', 'jdmartinez596@gmail.com', 'SUPERADMIN', 'Juni@r12', 'super_admin', 'inst_default', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'jdmartinez596@gmail.com');
