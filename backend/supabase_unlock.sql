-- =========================================================================
-- SCRIPT DE DESBLOQUEO DE PERMISOS RLS PARA SUPABASE (OHANA CLUB)
-- Ejecuta este comando en el SQL Editor de tu proyecto de Supabase.
-- =========================================================================

-- 1. Desactivar RLS en las tablas del sistema para permitir lectura/escritura desde el frontend
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.zonas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifas_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_producto DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas_minimarket DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cierres_caja DISABLE ROW LEVEL SECURITY;

-- 2. Otorgar permisos directos a la clave anónima de tu frontend
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Actualizar / Insertar los usuarios oficiales
INSERT INTO public.usuarios (id, username, email, password_hash, nombre_completo, rol) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'admin@ohanaclub.pe', 'admin123', 'Administrador General', 'admin'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'staff', 'staff@ohanaclub.pe', 'staff123', 'Staff Turno Mañana', 'staff')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;
