-- =============================================================================
-- OHANA CLUB - ESQUEMA DE BASE DE DATOS COMPLETO (Supabase / PostgreSQL)
-- Compatible con PostgreSQL 14+, Supabase Realtime, RLS y Triggers
-- =============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLAS PRINCIPALES
-- =============================================================================

-- 1.1 Tabla de Usuarios / Personal del Sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'staff' CHECK (rol IN ('admin', 'staff')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Tabla de Zonas / Espacios Físicos
CREATE TABLE IF NOT EXISTS zonas (
    id VARCHAR(20) PRIMARY KEY, -- 'CANCHA', 'EVENTOS'
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL, -- 'DEPORTIVO', 'SOCIAL'
    color_identificador VARCHAR(20) DEFAULT '#2563EB',
    activo BOOLEAN DEFAULT TRUE
);

-- 1.3 Tabla de Tarifas Configuradas
CREATE TABLE IF NOT EXISTS tarifas_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zona_id VARCHAR(20) REFERENCES zonas(id) ON DELETE CASCADE,
    nombre_tarifa VARCHAR(50) NOT NULL, -- 'DIURNA', 'NOCTURNA', 'EVENTO_GENERAL'
    hora_inicio_vigencia TIME,
    hora_fin_vigencia TIME,
    precio_hora DECIMAL(10,2),
    monto_adelanto_fijo DECIMAL(10,2) DEFAULT 10.00, -- S/ 10.00 para Cancha
    porcentaje_adelanto DECIMAL(5,2) DEFAULT 50.00,  -- 50.00% para Eventos
    activo BOOLEAN DEFAULT TRUE
);

-- 1.4 Tabla de Reservas (Core de Alquileres)
CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zona_id VARCHAR(20) NOT NULL REFERENCES zonas(id),
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_telefono VARCHAR(30),
    cliente_empresa VARCHAR(150),
    tipo_evento VARCHAR(100) NOT NULL DEFAULT 'Reserva', -- 'Entrenamiento', 'Reserva', 'Cumpleaños', 'Evento Corporativo'
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_tarifa VARCHAR(50) DEFAULT 'DIURNA', -- 'DIURNA', 'NOCTURNA', 'EVENTO_PERSONALIZADO'
    monto_total DECIMAL(10,2) NOT NULL CHECK (monto_total >= 0),
    adelanto DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (adelanto >= 0),
    saldo_pendiente DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) DEFAULT 'CONFIRMADA' CHECK (estado IN ('CONFIRMADA', 'PAGADA', 'CANCELADA')),
    metodo_pago_adelanto VARCHAR(30) DEFAULT 'EFECTIVO' CHECK (metodo_pago_adelanto IN ('EFECTIVO', 'YAPE_PLIN', 'TARJETA', 'TRANSFERENCIA')),
    es_recurrente BOOLEAN DEFAULT FALSE,
    grupo_recurrencia_id UUID,
    creado_por UUID REFERENCES usuarios(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción de Negocio: Evitar solapamientos exactos de horario en misma zona
    CONSTRAINT uq_reserva_zona_fecha_hora UNIQUE (zona_id, fecha, hora_inicio)
);

-- 1.5 Categorías de Minimarket
CREATE TABLE IF NOT EXISTS categorias_producto (
    id VARCHAR(50) PRIMARY KEY, -- 'bebidas', 'snacks', 'galletas', 'otros'
    nombre VARCHAR(100) NOT NULL,
    icono VARCHAR(50)
);

-- 1.6 Productos e Inventario
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id VARCHAR(50) NOT NULL REFERENCES categorias_producto(id),
    nombre VARCHAR(150) NOT NULL,
    presentacion VARCHAR(50), -- '500ml', '250ml', 'bolsa', 'paquete'
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 10,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.7 Ventas de Minimarket POS
CREATE TABLE IF NOT EXISTS ventas_minimarket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_comprobante VARCHAR(50) UNIQUE NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    metodo_pago VARCHAR(30) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'YAPE_PLIN', 'TARJETA')),
    monto_recibido DECIMAL(10,2),
    vuelto DECIMAL(10,2) DEFAULT 0.00,
    usuario_id UUID REFERENCES usuarios(id)
);

-- 1.8 Detalle de Ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas_minimarket(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- 1.9 Cierres de Caja y Reportes Financieros
CREATE TABLE IF NOT EXISTS cierres_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periodo VARCHAR(50) NOT NULL, -- 'Mayo 2026', '2026-05'
    tipo_cierre VARCHAR(20) DEFAULT 'MENSUAL' CHECK (tipo_cierre IN ('DIARIO', 'MENSUAL')),
    fecha_cierre TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ingresos por Alquileres
    total_alquileres DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    alquileres_efectivo DECIMAL(10,2) DEFAULT 0.00,
    alquileres_yape_plin DECIMAL(10,2) DEFAULT 0.00,
    alquileres_transferencia DECIMAL(10,2) DEFAULT 0.00,
    
    -- Ingresos por Minimarket
    total_minimarket DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    minimarket_efectivo DECIMAL(10,2) DEFAULT 0.00,
    minimarket_yape_plin DECIMAL(10,2) DEFAULT 0.00,
    minimarket_transferencia DECIMAL(10,2) DEFAULT 0.00,
    
    total_general DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    observaciones TEXT,
    usuario_id UUID REFERENCES usuarios(id)
);

-- =============================================================================
-- 2. ÍNDICES DE RENDIMIENTO
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_zona ON reservas(fecha, zona_id);
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas_minimarket(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta ON detalle_ventas(venta_id);

-- =============================================================================
-- 3. FUNCIONES Y TRIGGERS AUTOMÁTICOS
-- =============================================================================

-- Calcular automáticamente saldo pendiente en reservas
CREATE OR REPLACE FUNCTION fn_calcular_saldo_reserva()
RETURNS TRIGGER AS $$
BEGIN
    NEW.saldo_pendiente := NEW.monto_total - NEW.adelanto;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_saldo ON reservas;
CREATE TRIGGER trg_calcular_saldo
BEFORE INSERT OR UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION fn_calcular_saldo_reserva();

-- Descontar automáticamente stock al registrar un detalle de venta
CREATE OR REPLACE FUNCTION fn_descontar_stock_venta()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id = NEW.producto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_descontar_stock ON detalle_ventas;
CREATE TRIGGER trg_descontar_stock
AFTER INSERT ON detalle_ventas
FOR EACH ROW
EXECUTE FUNCTION fn_descontar_stock_venta();

-- =============================================================================
-- 4. SEGURIDAD Y POLÍTICAS RLS (SUPABASE ROW LEVEL SECURITY)
-- =============================================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_minimarket ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_caja ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública/autenticada
CREATE POLICY "Permitir lectura general de zonas" ON zonas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general de tarifas" ON tarifas_config FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general de categorias" ON categorias_producto FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general de productos" ON productos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de reservas" ON reservas FOR SELECT USING (true);
CREATE POLICY "Permitir insercion de reservas" ON reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de reservas" ON reservas FOR UPDATE USING (true);
CREATE POLICY "Permitir lectura de ventas" ON ventas_minimarket FOR SELECT USING (true);
CREATE POLICY "Permitir insercion de ventas" ON ventas_minimarket FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de detalle de ventas" ON detalle_ventas FOR SELECT USING (true);
CREATE POLICY "Permitir insercion de detalle de ventas" ON detalle_ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de cierres de caja" ON cierres_caja FOR SELECT USING (true);

-- =============================================================================
-- 5. DATOS SEMILLA (SEED DATA EXACTO DEL FIGMA)
-- =============================================================================

-- 5.1 Usuario Staff Inicial
INSERT INTO usuarios (id, username, email, password_hash, nombre_completo, rol) VALUES
('a0000000-0000-0000-0000-000000000001', 'Usuario.staff', 'staff@ohanaclub.pe', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Staff Operativo', 'staff')
ON CONFLICT (username) DO NOTHING;

-- 5.2 Zonas
INSERT INTO zonas (id, nombre, descripcion, tipo, color_identificador) VALUES
('CANCHA', 'Zona Cancha', 'Cancha de césped sintético para fútbol y vóley', 'DEPORTIVO', '#2563EB'),
('EVENTOS', 'Zona Eventos', 'Espacio acondicionado para eventos sociales, cumpleaños y corporativos', 'SOCIAL', '#EA580C')
ON CONFLICT (id) DO NOTHING;

-- 5.3 Tarifas Configuradas
INSERT INTO tarifas_config (zona_id, nombre_tarifa, hora_inicio_vigencia, hora_fin_vigencia, precio_hora, monto_adelanto_fijo, porcentaje_adelanto) VALUES
('CANCHA', 'DIURNA', '08:00:00', '18:00:00', 60.00, 10.00, 0.00),
('CANCHA', 'NOCTURNA', '18:00:00', '23:00:00', 80.00, 10.00, 0.00),
('EVENTOS', 'EVENTO_GENERAL', '08:00:00', '23:59:00', 150.00, 0.00, 50.00)
ON CONFLICT DO NOTHING;

-- 5.4 Categorías
INSERT INTO categorias_producto (id, nombre, icono) VALUES
('bebidas', 'Bebidas', 'cup-water'),
('snacks', 'Snacks', 'cookie'),
('galletas', 'Galletas', 'cake'),
('otros', 'Otros', 'package')
ON CONFLICT (id) DO NOTHING;

-- 5.5 Productos e Inventario
INSERT INTO productos (id, categoria_id, nombre, presentacion, precio_unitario, stock_actual, stock_minimo, imagen_url) VALUES
('b0000000-0000-0000-0000-000000000001', 'bebidas', 'Agua mineral', '500ml', 2.00, 28, 10, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000002', 'bebidas', 'Gaseosa', '500ml', 3.00, 15, 10, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000003', 'bebidas', 'Energizante', '250ml', 6.00, 8, 10, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000004', 'bebidas', 'Isotonica', '250ml', 4.00, 12, 10, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000005', 'snacks', 'Papas clasicas', 'bolsa', 3.50, 20, 10, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000006', 'snacks', 'Mani salado', 'bolsa', 2.50, 18, 10, 'https://images.unsplash.com/photo-1567406899672-849646bda646?w=150&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000007', 'galletas', 'Galletas chocolate', 'paquete', 2.00, 5, 10, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 5.6 Reservas del Calendario (Figma 23 Mayo 2026)
INSERT INTO reservas (id, zona_id, cliente_nombre, cliente_telefono, tipo_evento, fecha, hora_inicio, hora_fin, tipo_tarifa, monto_total, adelanto, saldo_pendiente, estado, metodo_pago_adelanto, es_recurrente) VALUES
('c0000000-0000-0000-0000-000000000001', 'CANCHA', 'Academia Futbol', '987654321', 'Entrenamiento', '2026-05-23', '08:00:00', '10:30:00', 'DIURNA', 150.00, 10.00, 140.00, 'CONFIRMADA', 'EFECTIVO', true),
('c0000000-0000-0000-0000-000000000002', 'CANCHA', 'Juan Perez', '999888777', 'Reserva', '2026-05-23', '11:00:00', '14:00:00', 'DIURNA', 180.00, 10.00, 170.00, 'CONFIRMADA', 'YAPE_PLIN', false),
('c0000000-0000-0000-0000-000000000003', 'CANCHA', 'Los Amigos', '912345678', 'Reserva', '2026-05-23', '17:00:00', '20:00:00', 'NOCTURNA', 220.00, 10.00, 210.00, 'CONFIRMADA', 'EFECTIVO', false),
('c0000000-0000-0000-0000-000000000004', 'EVENTOS', 'Maria Lopez', '955443322', 'Cumpleaños', '2026-05-23', '13:00:00', '16:00:00', 'EVENTO_PERSONALIZADO', 1200.00, 600.00, 600.00, 'CONFIRMADA', 'TRANSFERENCIA', false),
('c0000000-0000-0000-0000-000000000005', 'EVENTOS', 'Academia Futbol', '911223344', 'Evento Corporativo', '2026-05-23', '19:00:00', '22:00:00', 'EVENTO_PERSONALIZADO', 2000.00, 1000.00, 1000.00, 'CONFIRMADA', 'TRANSFERENCIA', false)
ON CONFLICT (id) DO NOTHING;

-- 5.7 Cierre de Caja Mayo 2026
INSERT INTO cierres_caja (id, periodo, tipo_cierre, total_alquileres, alquileres_efectivo, alquileres_yape_plin, alquileres_transferencia, total_minimarket, minimarket_efectivo, minimarket_yape_plin, minimarket_transferencia, total_general, observaciones) VALUES
('d0000000-0000-0000-0000-000000000001', 'Mayo 2026', 'MENSUAL', 4260.00, 2120.00, 1520.00, 620.00, 2145.00, 1120.00, 725.00, 300.00, 6405.00, 'Cierre mensual consolidado de Mayo 2026')
ON CONFLICT (id) DO NOTHING;
