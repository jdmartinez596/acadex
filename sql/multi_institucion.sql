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

-- 3. Agregar columna institucion_id a todas las tablas
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

-- 5. Crear usuario super_admin si no existe
INSERT INTO usuarios (id, nombre, apellido, email, documento, password, rol, institucion_id, activo)
VALUES ('super_admin', 'Super', 'Admin', 'super@acadex.app', 'SUPERADMIN', 'superadmin123', 'super_admin', 'inst_default', true)
ON CONFLICT (id) DO NOTHING;
