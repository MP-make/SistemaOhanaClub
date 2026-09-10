import {
  Reserva,
  Producto,
  Venta,
  CierreCaja,
  DashboardMetrics,
  TarifaCalculation,
  ZonaTipo,
  TarifaTipo,
  MetodoPago
} from '../types';
import { supabaseApi, isSupabaseConfigured } from './supabaseClient';

// API Base URL (FastAPI opcional)
const API_BASE_URL = 'http://localhost:8000/api';

// Estado local con persistencia y fallback automático
const INITIAL_RESERVAS: Reserva[] = [
  {
    id: 'res-001',
    zona: 'CANCHA',
    clienteNombre: 'Academia Futbol',
    clienteTelefono: '987654321',
    tipoEvento: 'Entrenamiento',
    fecha: '2026-05-23',
    horaInicio: '08:00',
    horaFin: '10:30',
    tipoTarifa: 'DIURNA',
    montoTotal: 150.00,
    adelanto: 10.00,
    saldoPendiente: 140.00,
    estado: 'CONFIRMADA',
    metodoPago: 'EFECTIVO',
    esRecurrente: true
  },
  {
    id: 'res-002',
    zona: 'CANCHA',
    clienteNombre: 'Juan Perez',
    clienteTelefono: '999888777',
    tipoEvento: 'Reserva',
    fecha: '2026-05-23',
    horaInicio: '11:00',
    horaFin: '14:00',
    tipoTarifa: 'DIURNA',
    montoTotal: 180.00,
    adelanto: 10.00,
    saldoPendiente: 170.00,
    estado: 'CONFIRMADA',
    metodoPago: 'YAPE_PLIN',
    esRecurrente: false
  },
  {
    id: 'res-003',
    zona: 'CANCHA',
    clienteNombre: 'Los Amigos',
    clienteTelefono: '912345678',
    tipoEvento: 'Reserva',
    fecha: '2026-05-23',
    horaInicio: '17:00',
    horaFin: '20:00',
    tipoTarifa: 'NOCTURNA',
    montoTotal: 220.00,
    adelanto: 10.00,
    saldoPendiente: 210.00,
    estado: 'CONFIRMADA',
    metodoPago: 'EFECTIVO',
    esRecurrente: false
  },
  {
    id: 'res-004',
    zona: 'EVENTOS',
    clienteNombre: 'Maria Lopez',
    clienteTelefono: '955443322',
    clienteEmpresa: 'Familia Lopez',
    tipoEvento: 'Cumpleaños',
    fecha: '2026-05-23',
    horaInicio: '13:00',
    horaFin: '16:00',
    tipoTarifa: 'EVENTO_PERSONALIZADO',
    montoTotal: 1200.00,
    adelanto: 600.00,
    saldoPendiente: 600.00,
    estado: 'CONFIRMADA',
    metodoPago: 'TRANSFERENCIA',
    esRecurrente: false
  },
  {
    id: 'res-005',
    zona: 'EVENTOS',
    clienteNombre: 'Tech Solutions',
    clienteTelefono: '911223344',
    clienteEmpresa: 'Tech Solutions SAC',
    tipoEvento: 'Evento Corporativo',
    fecha: '2026-05-23',
    horaInicio: '19:00',
    horaFin: '22:00',
    tipoTarifa: 'EVENTO_PERSONALIZADO',
    montoTotal: 2000.00,
    adelanto: 1000.00,
    saldoPendiente: 1000.00,
    estado: 'CONFIRMADA',
    metodoPago: 'TRANSFERENCIA',
    esRecurrente: false
  }
];

const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: 'prod-001',
    categoriaId: 'bebidas',
    nombre: 'Agua mineral',
    presentacion: '500ml',
    precioUnitario: 2.00,
    stockActual: 28,
    stockMinimo: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80',
    estado: 'Disponible'
  },
  {
    id: 'prod-002',
    categoriaId: 'bebidas',
    nombre: 'Gaseosa',
    presentacion: '500ml',
    precioUnitario: 3.00,
    stockActual: 15,
    stockMinimo: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80',
    estado: 'Disponible'
  },
  {
    id: 'prod-003',
    categoriaId: 'bebidas',
    nombre: 'Energizante',
    presentacion: '250ml',
    precioUnitario: 6.00,
    stockActual: 8,
    stockMinimo: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=150&auto=format&fit=crop&q=80',
    estado: 'Stock Bajo'
  },
  {
    id: 'prod-004',
    categoriaId: 'bebidas',
    nombre: 'Isotonica',
    presentacion: '250ml',
    precioUnitario: 4.00,
    stockActual: 12,
    stockMinimo: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80',
    estado: 'Disponible'
  },
  {
    id: 'prod-005',
    categoriaId: 'snacks',
    nombre: 'Papas clasicas',
    presentacion: 'bolsa',
    precioUnitario: 3.50,
    stockActual: 20,
    stockMinimo: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop&q=80',
    estado: 'Disponible'
  },
  {
    id: 'prod-006',
    categoriaId: 'snacks',
    nombre: 'Mani salado',
    presentacion: 'bolsa',
    precioUnitario: 2.50,
    stockActual: 18,
    stockMinimo: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1567406899672-849646bda646?w=150&auto=format&fit=crop&q=80',
    estado: 'Disponible'
  },
  {
    id: 'prod-007',
    categoriaId: 'galletas',
    nombre: 'Galletas chocolate',
    presentacion: 'paquete',
    precioUnitario: 2.00,
    stockActual: 5,
    stockMinimo: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=150&auto=format&fit=crop&q=80',
    estado: 'Stock Bajo'
  }
];

class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(`ohana_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`ohana_${key}`, JSON.stringify(value));
    } catch {
      // Ignorar en entornos sin storage
    }
  }

  getReservas(): Reserva[] {
    return this.get<Reserva[]>('reservas', INITIAL_RESERVAS);
  }

  saveReservas(reservas: Reserva[]): void {
    this.set('reservas', reservas);
  }

  getProductos(): Producto[] {
    return this.get<Producto[]>('productos', INITIAL_PRODUCTOS);
  }

  saveProductos(productos: Producto[]): void {
    this.set('productos', productos);
  }

  getVentas(): Venta[] {
    return this.get<Venta[]>('ventas', []);
  }

  saveVentas(ventas: Venta[]): void {
    this.set('ventas', ventas);
  }
}

export const localStore = new StorageService();

// Helper de minutos para cálculo de solapamiento
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export const apiService = {
  // 1. Reservas
  async getReservas(fecha?: string, zona?: ZonaTipo): Promise<Reserva[]> {
    // Si Supabase está configurado, consultar en la nube
    if (isSupabaseConfigured()) {
      try {
        const sbData = await supabaseApi.getReservas(fecha);
        if (sbData && Array.isArray(sbData) && sbData.length > 0) {
          let mapped: Reserva[] = sbData.map((r: any) => ({
            id: r.id,
            zona: r.zona_id,
            clienteNombre: r.cliente_nombre,
            clienteTelefono: r.cliente_telefono || '',
            clienteEmpresa: r.cliente_empresa,
            tipoEvento: r.tipo_evento,
            fecha: r.fecha,
            horaInicio: r.hora_inicio ? r.hora_inicio.slice(0, 5) : '08:00',
            horaFin: r.hora_fin ? r.hora_fin.slice(0, 5) : '10:00',
            tipoTarifa: r.tipo_tarifa,
            montoTotal: Number(r.monto_total) || 0,
            adelanto: Number(r.adelanto) || 0,
            saldoPendiente: Number(r.saldo_pendiente) || 0,
            estado: r.estado || 'CONFIRMADA',
            metodoPago: r.metodo_pago_adelanto || 'EFECTIVO',
            esRecurrente: Boolean(r.es_recurrente)
          }));
          if (zona) mapped = mapped.filter(r => r.zona === zona);
          localStore.saveReservas(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Fallo consulta a Supabase, usando local:', e);
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reservas?${new URLSearchParams({ ...(fecha && { fecha }), ...(zona && { zona }) })}`);
      if (res.ok) return await res.json();
    } catch {}

    let list = localStore.getReservas();
    if (fecha) list = list.filter(r => r.fecha === fecha);
    if (zona) list = list.filter(r => r.zona === zona);
    return list;
  },

  calculateTarifa(
    zona: ZonaTipo,
    horaInicio: string,
    horaFin: string,
    tipoTarifa: TarifaTipo = 'DIURNA',
    presupuestoEvento: number = 0
  ): TarifaCalculation {
    const startMin = timeToMinutes(horaInicio);
    const endMin = timeToMinutes(horaFin);
    let diffMin = endMin - startMin;
    if (diffMin <= 0) diffMin += 24 * 60;
    const horas = Math.round((diffMin / 60) * 100) / 100;

    if (zona === 'CANCHA') {
      const startHour = parseInt(horaInicio.split(':')[0], 10);
      const isNocturna = tipoTarifa === 'NOCTURNA' || startHour >= 18;
      const precioHora = isNocturna ? 80.00 : 60.00;
      const montoTotal = Math.round(precioHora * Math.max(horas, 1.0) * 100) / 100;
      const adelanto = 10.00; // Adelanto fijo Cancha (Regla RF03 / HU03)
      const saldoPendiente = Math.max(0, Math.round((montoTotal - adelanto) * 100) / 100);

      return {
        zona: 'CANCHA',
        montoTotal,
        adelanto,
        saldoPendiente,
        tipoTarifa: isNocturna ? 'NOCTURNA' : 'DIURNA',
        horas
      };
    } else {
      const montoTotal = Number(presupuestoEvento) || 0;
      const adelanto = Math.round(montoTotal * 0.50 * 100) / 100; // 50% Eventos (Regla RF03 / HU03)
      const saldoPendiente = Math.round((montoTotal - adelanto) * 100) / 100;

      return {
        zona: 'EVENTOS',
        montoTotal,
        adelanto,
        saldoPendiente,
        tipoTarifa: 'EVENTO_PERSONALIZADO',
        horas
      };
    }
  },

  async createReserva(reservaData: Omit<Reserva, 'id' | 'estado'>): Promise<Reserva> {
    // Validar solapamiento (HU05 - Prevención de Errores)
    const existing = localStore.getReservas();
    const reqS = timeToMinutes(reservaData.horaInicio);
    const reqE = timeToMinutes(reservaData.horaFin);

    const conflict = existing.some(r => {
      if (r.zona === reservaData.zona && r.fecha === reservaData.fecha && r.estado !== 'CANCELADA') {
        const exS = timeToMinutes(r.horaInicio);
        const exE = timeToMinutes(r.horaFin);
        return Math.max(reqS, exS) < Math.min(reqE, exE);
      }
      return false;
    });

    if (conflict) {
      const nombreZona = reservaData.zona === 'CANCHA' ? 'Zona Cancha' : 'Zona Eventos';
      throw new Error(`Horario no disponible. La ${nombreZona} ya tiene una reserva para ese horario.`);
    }

    const nuevaReserva: Reserva = {
      ...reservaData,
      id: `res-${Date.now().toString().slice(-5)}`,
      estado: 'CONFIRMADA'
    };

    // Sincronizar con Supabase si está activo
    if (isSupabaseConfigured()) {
      try {
        const created = await supabaseApi.createReserva(nuevaReserva);
        if (created?.id) {
          nuevaReserva.id = created.id;
        }
      } catch (e) {
        console.warn('No se pudo guardar en Supabase, persistiendo localmente:', e);
      }
    }

    const updated = [nuevaReserva, ...existing];
    localStore.saveReservas(updated);
    return nuevaReserva;
  },

  // 2. POS & Inventario
  async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    if (isSupabaseConfigured()) {
      try {
        const sbProds = await supabaseApi.getProductos(categoria, search);
        if (sbProds && Array.isArray(sbProds) && sbProds.length > 0) {
          const mapped: Producto[] = sbProds.map((p: any) => ({
            id: p.id,
            categoriaId: p.categoria_id,
            nombre: p.nombre,
            presentacion: p.presentacion || '',
            precioUnitario: Number(p.precio_unitario) || 0,
            stockActual: Number(p.stock_actual) || 0,
            stockMinimo: Number(p.stock_minimo) || 10,
            imagenUrl: p.imagen_url || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80',
            activo: p.activo,
            estado: (Number(p.stock_actual) <= Number(p.stock_minimo || 10)) ? 'Stock Bajo' : 'Disponible'
          }));
          return mapped;
        }
      } catch (e) {
        console.warn('Fallo getProductos en Supabase, usando local:', e);
      }
    }

    let prods = localStore.getProductos();
    if (categoria && categoria !== 'todos') {
      prods = prods.filter(p => p.categoriaId === categoria);
    }
    if (search) {
      const s = search.toLowerCase();
      prods = prods.filter(p => p.nombre.toLowerCase().includes(s));
    }
    return prods.map(p => ({
      ...p,
      estado: p.stockActual <= p.stockMinimo ? 'Stock Bajo' : 'Disponible'
    }));
  },

  async updateStock(productoId: string, delta: number): Promise<Producto> {
    if (isSupabaseConfigured()) {
      try {
        await supabaseApi.updateStock(productoId, delta);
      } catch (e) {
        console.warn('Fallo updateStock en Supabase:', e);
      }
    }

    const prods = localStore.getProductos();
    const prod = prods.find(p => p.id === productoId);
    if (!prod) throw new Error('Producto no encontrado');

    const nuevoStock = Math.max(0, prod.stockActual + delta);
    prod.stockActual = nuevoStock;
    prod.estado = nuevoStock <= prod.stockMinimo ? 'Stock Bajo' : 'Disponible';

    localStore.saveProductos(prods);
    return prod;
  },

  async createVenta(items: { productoId: string; cantidad: number }[], metodoPago: MetodoPago): Promise<Venta> {
    const prods = localStore.getProductos();
    let total = 0;
    const ventaItems = [];

    for (const item of items) {
      const prod = prods.find(p => p.id === item.productoId);
      if (!prod) throw new Error('Producto inexistente');
      if (prod.stockActual < item.cantidad) {
        throw new Error(`Stock insuficiente para ${prod.nombre}`);
      }

      // Descontar inventario (SLA05)
      prod.stockActual -= item.cantidad;
      prod.estado = prod.stockActual <= prod.stockMinimo ? 'Stock Bajo' : 'Disponible';

      const subtotal = Math.round(prod.precioUnitario * item.cantidad * 100) / 100;
      total += subtotal;
      ventaItems.push({
        productoId: prod.id,
        nombre: `${prod.nombre} ${prod.presentacion}`,
        cantidad: item.cantidad,
        precioUnitario: prod.precioUnitario,
        subtotal
      });
    }

    localStore.saveProductos(prods);

    const ventas = localStore.getVentas();
    const nuevaVenta: Venta = {
      id: `vta-${Date.now().toString().slice(-5)}`,
      numeroComprobante: `REC-${String(ventas.length + 2).padStart(3, '0')}`,
      fechaHora: new Date().toISOString(),
      total: Math.round(total * 100) / 100,
      metodoPago,
      items: ventaItems
    };

    if (isSupabaseConfigured()) {
      try {
        await supabaseApi.createVenta(
          nuevaVenta.total,
          metodoPago,
          ventaItems.map(it => ({
            producto_id: it.productoId,
            cantidad: it.cantidad,
            precio_unitario: it.precioUnitario,
            subtotal: it.subtotal
          }))
        );
      } catch (e) {
        console.warn('Fallo createVenta en Supabase:', e);
      }
    }

    ventas.unshift(nuevaVenta);
    localStore.saveVentas(ventas);
    return nuevaVenta;
  },

  // 3. Cierre de Caja y Dashboard
  getCierreCaja(periodo: string = 'Mayo 2026'): CierreCaja {
    return {
      periodo,
      fechaConsulta: '2026-05-23',
      alquileres: {
        efectivo: 2120.00,
        yapePlin: 1520.00,
        transferencia: 620.00,
        total: 4260.00
      },
      minimarket: {
        efectivo: 1120.00,
        yapePlin: 725.00,
        transferencia: 300.00,
        total: 2145.00
      },
      totalGeneral: 6405.00
    };
  },

  getDashboardMetrics(): DashboardMetrics {
    const reservas = localStore.getReservas();
    return {
      reservasHoyCount: 8,
      ventasPosHoy: 1245.00,
      ingresosTotalesHoy: 3860.00
    };
  }
};
