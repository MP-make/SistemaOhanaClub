-- =========================================================================
-- SCRIPT MAESTRO DE SUPABASE (OHANA CLUB)
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
-- Configura Políticas de Seguridad (RLS) + Inserción de Datos Iniciales.
-- =========================================================================

-- 1. HABILITAR PERMISOS DE LECTURA Y ESCRITURA PARA EL FRONTEND (API ANON)
-- Esto permite que tu aplicación web pueda consultar y guardar datos en Supabase

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura anon de usuarios" ON public.usuarios;
CREATE POLICY "Permitir lectura anon de usuarios" ON public.usuarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir update anon de usuarios" ON public.usuarios;
CREATE POLICY "Permitir update anon de usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.zonas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en zonas" ON public.zonas;
CREATE POLICY "Permitir todo anon en zonas" ON public.zonas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.tarifas_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en tarifas_config" ON public.tarifas_config;
CREATE POLICY "Permitir todo anon en tarifas_config" ON public.tarifas_config FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en reservas" ON public.reservas;
CREATE POLICY "Permitir todo anon en reservas" ON public.reservas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.categorias_producto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en categorias_producto" ON public.categorias_producto;
CREATE POLICY "Permitir todo anon en categorias_producto" ON public.categorias_producto FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en productos" ON public.productos;
CREATE POLICY "Permitir todo anon en productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ventas_minimarket ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en ventas_minimarket" ON public.ventas_minimarket;
CREATE POLICY "Permitir todo anon en ventas_minimarket" ON public.ventas_minimarket FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en detalle_ventas" ON public.detalle_ventas;
CREATE POLICY "Permitir todo anon en detalle_ventas" ON public.detalle_ventas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.cierres_caja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo anon en cierres_caja" ON public.cierres_caja;
CREATE POLICY "Permitir todo anon en cierres_caja" ON public.cierres_caja FOR ALL USING (true) WITH CHECK (true);

-- 2. ZONAS
INSERT INTO public.zonas (id, nombre, descripcion, tipo, color_identificador, activo) VALUES
('CANCHA', 'Cancha Sintética de Fútbol 7', 'Cancha de grass sintético con iluminación LED profesional', 'DEPORTIVA', '#2563EB', true),
('EVENTOS', 'Zona de Eventos y Parrillas', 'Área techada para cumpleaños, celebraciones y eventos corporativos', 'SOCIAL', '#EA580C', true)
ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion;

-- 3. USUARIOS (Admin y Staff con sus contraseñas exactas)
INSERT INTO public.usuarios (id, username, email, password_hash, nombre_completo, rol) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'admin@ohanaclub.pe', 'admin123', 'Administrador General', 'admin'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'staff', 'staff@ohanaclub.pe', 'staff123', 'Staff Turno Mañana', 'staff')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  nombre_completo = EXCLUDED.nombre_completo;

-- 4. TARIFAS CONFIGURADAS (HU02 / HU03 / HU04)
INSERT INTO public.tarifas_config (id, zona_id, nombre_tarifa, hora_inicio_vigencia, hora_fin_vigencia, precio_hora, monto_adelanto_fijo, porcentaje_adelanto, activo) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'CANCHA', 'Diurna Cancha', '06:00:00', '18:00:00', 60.00, 10.00, 0.00, true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'CANCHA', 'Nocturna con Luz', '18:00:00', '06:00:00', 80.00, 10.00, 0.00, true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'EVENTOS', 'Evento Social/Corporativo', '00:00:00', '23:59:59', NULL, 0.00, 50.00, true)
ON CONFLICT (id) DO NOTHING;

-- 5. CATEGORÍAS DE PRODUCTOS
INSERT INTO public.categorias_producto (id, nombre, icono) VALUES
('bebidas', 'Bebidas e Hidratantes', 'Coffee'),
('snacks', 'Snacks y Piqueos', 'ShoppingBag'),
('galletas', 'Galletas y Dulces', 'Cookie'),
('otros', 'Otros Artículos', 'Package')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 6. PRODUCTOS DEL MINIMARKET
INSERT INTO public.productos (id, categoria_id, nombre, presentacion, precio_unitario, stock_actual, stock_minimo, imagen_url, activo) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'bebidas', 'Agua Mineral San Mateo', '600ml sin gas', 2.50, 24, 10, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'bebidas', 'Gaseosa Coca Cola', '500ml personal', 3.50, 18, 10, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'bebidas', 'Gaseosa Inka Kola', '500ml personal', 3.50, 6, 10, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'bebidas', 'Bebida Energizante Monster', 'Lata 473ml', 8.00, 12, 10, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=150&auto=format&fit=crop&q=80', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'bebidas', 'Bebida Rehidratante Sporade', '500ml blueberry', 3.00, 5, 10, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'snacks', 'Papas Lays Clásicas', 'Bolsa 45g', 2.00, 15, 10, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop&q=80', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', 'snacks', 'Maní Salado Karinto', 'Bolsa 50g', 1.50, 8, 10, 'https://images.unsplash.com/photo-1567406899672-849646bda646?w=150&auto=format&fit=crop&q=80', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a48', 'galletas', 'Galleta Casino Chocolate', 'Paquete 6 uds', 1.20, 20, 10, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=150&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO UPDATE SET 
  precio_unitario = EXCLUDED.precio_unitario,
  stock_actual = EXCLUDED.stock_actual;

-- 7. RESERVAS INICIALES (DEMO 23 DE MAYO)
INSERT INTO public.reservas (id, zona_id, cliente_nombre, cliente_telefono, cliente_empresa, tipo_evento, fecha, hora_inicio, hora_fin, tipo_tarifa, monto_total, adelanto, saldo_pendiente, estado, metodo_pago_adelanto, es_recurrente, creado_por) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'CANCHA', 'Academia Futbol', '987654321', NULL, 'Entrenamiento', '2026-05-23', '08:00:00', '10:30:00', 'DIURNA', 150.00, 10.00, 140.00, 'CONFIRMADA', 'EFECTIVO', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'CANCHA', 'Juan Perez', '999888777', NULL, 'Reserva', '2026-05-23', '11:00:00', '14:00:00', 'DIURNA', 180.00, 10.00, 170.00, 'CONFIRMADA', 'YAPE_PLIN', false, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', 'CANCHA', 'Los Amigos', '912345678', NULL, 'Reserva', '2026-05-23', '17:00:00', '20:00:00', 'NOCTURNA', 220.00, 10.00, 210.00, 'CONFIRMADA', 'EFECTIVO', false, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54', 'EVENTOS', 'Maria Lopez', '955443322', 'Familia Lopez', 'Cumpleaños', '2026-05-23', '13:00:00', '16:00:00', 'EVENTO_PERSONALIZADO', 1200.00, 600.00, 600.00, 'CONFIRMADA', 'TRANSFERENCIA', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'EVENTOS', 'Tech Solutions', '911223344', 'Tech Solutions SAC', 'Evento Corporativo', '2026-05-23', '19:00:00', '22:00:00', 'EVENTO_PERSONALIZADO', 2000.00, 1000.00, 1000.00, 'CONFIRMADA', 'YAPE_PLIN', false, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22')
ON CONFLICT (id) DO NOTHING;
