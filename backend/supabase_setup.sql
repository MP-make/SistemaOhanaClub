-- =========================================================================
-- SCRIPT DE CONFIGURACIÓN Y POLÍTICAS DE ACCESO (OHANA CLUB)
-- Ejecuta este script completo en el SQL Editor de tu proyecto de Supabase.
-- =========================================================================

-- 1. HABILITAR PERMISOS DE ACCESO PARA EL FRONTEND (API PÚBLICA / ANON)

-- USUARIOS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_lectura_usuarios" ON public.usuarios;
CREATE POLICY "Permitir_lectura_usuarios" ON public.usuarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir_escritura_usuarios" ON public.usuarios;
CREATE POLICY "Permitir_escritura_usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

-- ZONAS
ALTER TABLE public.zonas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_zonas" ON public.zonas;
CREATE POLICY "Permitir_zonas" ON public.zonas FOR ALL USING (true) WITH CHECK (true);

-- TARIFAS
ALTER TABLE public.tarifas_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_tarifas" ON public.tarifas_config;
CREATE POLICY "Permitir_tarifas" ON public.tarifas_config FOR ALL USING (true) WITH CHECK (true);

-- RESERVAS
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_reservas" ON public.reservas;
CREATE POLICY "Permitir_reservas" ON public.reservas FOR ALL USING (true) WITH CHECK (true);

-- CATEGORIAS
ALTER TABLE public.categorias_producto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_categorias" ON public.categorias_producto;
CREATE POLICY "Permitir_categorias" ON public.categorias_producto FOR ALL USING (true) WITH CHECK (true);

-- PRODUCTOS
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_productos" ON public.productos;
CREATE POLICY "Permitir_productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);

-- VENTAS MINIMARKET
ALTER TABLE public.ventas_minimarket ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_ventas" ON public.ventas_minimarket;
CREATE POLICY "Permitir_ventas" ON public.ventas_minimarket FOR ALL USING (true) WITH CHECK (true);

-- DETALLE DE VENTAS
ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_detalle_ventas" ON public.detalle_ventas;
CREATE POLICY "Permitir_detalle_ventas" ON public.detalle_ventas FOR ALL USING (true) WITH CHECK (true);

-- CIERRES DE CAJA
ALTER TABLE public.cierres_caja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir_cierres_caja" ON public.cierres_caja;
CREATE POLICY "Permitir_cierres_caja" ON public.cierres_caja FOR ALL USING (true) WITH CHECK (true);


-- 2. INSERCIÓN / ACTUALIZACIÓN SEGURA DE USUARIOS
INSERT INTO public.usuarios (id, username, email, password_hash, nombre_completo, rol) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'admin@ohanaclub.pe', 'admin123', 'Administrador General', 'admin'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'staff', 'staff@ohanaclub.pe', 'staff123', 'Staff Turno Mañana', 'staff')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- 3. ZONAS
INSERT INTO public.zonas (id, nombre, descripcion, tipo, color_identificador, activo) VALUES
('CANCHA', 'Cancha Sintética de Fútbol 7', 'Cancha de grass sintético con iluminación LED profesional', 'DEPORTIVA', '#2563EB', true),
('EVENTOS', 'Zona de Eventos y Parrillas', 'Área techada para cumpleaños, celebraciones y eventos corporativos', 'SOCIAL', '#EA580C', true)
ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion;

-- 4. TARIFAS
INSERT INTO public.tarifas_config (id, zona_id, nombre_tarifa, hora_inicio_vigencia, hora_fin_vigencia, precio_hora, monto_adelanto_fijo, porcentaje_adelanto, activo) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'CANCHA', 'Diurna Cancha', '06:00:00', '18:00:00', 60.00, 10.00, 0.00, true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'CANCHA', 'Nocturna con Luz', '18:00:00', '06:00:00', 80.00, 10.00, 0.00, true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'EVENTOS', 'Evento Social/Corporativo', '00:00:00', '23:59:59', NULL, 0.00, 50.00, true)
ON CONFLICT (id) DO NOTHING;

-- 5. CATEGORÍAS
INSERT INTO public.categorias_producto (id, nombre, icono) VALUES
('bebidas', 'Bebidas e Hidratantes', 'Coffee'),
('snacks', 'Snacks y Piqueos', 'ShoppingBag'),
('galletas', 'Galletas y Dulces', 'Cookie'),
('otros', 'Otros Artículos', 'Package')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 6. PRODUCTOS
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
