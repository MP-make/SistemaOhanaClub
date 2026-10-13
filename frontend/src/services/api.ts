import {
  Reserva,
  Producto,
  Venta,
  CierreCaja,
  DashboardMetrics,
  TarifaCalculation,
  ZonaTipo,
  TarifaTipo,
  MetodoPago,
  AperturaCaja
} from '../types';
import { supabaseApi, isSupabaseConfigured } from './supabaseClient';

// API Base URL
const API_BASE_URL = '/api';

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

  getAperturaCaja(): AperturaCaja | null {
    return this.get<AperturaCaja | null>('apertura_caja_activa', null);
  }

  saveAperturaCaja(apertura: AperturaCaja | null): void {
    this.set('apertura_caja_activa', apertura);
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

  checkDisponibilidad(
    zona: ZonaTipo,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    excludeReservaId?: string
  ): { disponible: boolean; motivo?: string; conflicto?: Reserva } {
    const reqS = timeToMinutes(horaInicio);
    const reqE = timeToMinutes(horaFin);

    if (isNaN(reqS) || isNaN(reqE)) {
      return { disponible: false, motivo: 'Horario inválido' };
    }

    if (reqE <= reqS) {
      return { disponible: false, motivo: 'La hora de fin debe ser posterior a la hora de inicio' };
    }

    const existing = localStore.getReservas();
    const conflicto = existing.find(r => {
      if (excludeReservaId && r.id === excludeReservaId) return false;
      if (r.zona === zona && r.fecha === fecha && r.estado !== 'CANCELADA') {
        const exS = timeToMinutes(r.horaInicio);
        const exE = timeToMinutes(r.horaFin);
        return Math.max(reqS, exS) < Math.min(reqE, exE);
      }
      return false;
    });

    if (conflicto) {
      const nombreZona = zona === 'CANCHA' ? 'Cancha' : 'Zona de Eventos';
      return {
        disponible: false,
        motivo: `La ${nombreZona} ya está reservada de ${conflicto.horaInicio} a ${conflicto.horaFin} (${conflicto.clienteNombre})`,
        conflicto
      };
    }

    return { disponible: true, motivo: 'Horario y fecha disponibles' };
  },

  async createReserva(reservaData: Omit<Reserva, 'id' | 'estado'>): Promise<Reserva> {
    // Validar solapamiento (HU05 - Prevención de Errores)
    const check = this.checkDisponibilidad(
      reservaData.zona,
      reservaData.fecha,
      reservaData.horaInicio,
      reservaData.horaFin
    );

    if (!check.disponible) {
      throw new Error(check.motivo || 'Horario no disponible.');
    }

    const existing = localStore.getReservas();

    const nuevaReserva: Reserva = {
      ...reservaData,
      id: `res-${Date.now().toString().slice(-5)}`,
      estado: 'CONFIRMADA'
    };

    // Despacho HTTP real al Servicio REST / API Gateway (Visible en DevTools Network - Capas 3 y 4)
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(nuevaReserva)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.id) nuevaReserva.id = data.id;
      }
    } catch (e) {
      console.warn('Llamada HTTP a /api/reservas:', e);
    }

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

  async updateReserva(id: string, updates: Partial<Reserva>): Promise<Reserva> {
    if (isSupabaseConfigured()) {
      try {
        await supabaseApi.updateReserva(id, updates);
      } catch (e) {
        console.warn('Error al actualizar reserva en Supabase:', e);
      }
    }

    const reservas = localStore.getReservas();
    const idx = reservas.findIndex(r => r.id === id);
    if (idx !== -1) {
      reservas[idx] = { ...reservas[idx], ...updates };
      localStore.saveReservas(reservas);
      return reservas[idx];
    }
    throw new Error('Reserva no encontrada');
  },

  async cobrarSaldoReserva(id: string, metodoPago: MetodoPago = 'EFECTIVO'): Promise<Reserva> {
    const reservas = localStore.getReservas();
    const r = reservas.find(item => item.id === id);
    if (!r) throw new Error('Reserva no encontrada');

    const nuevoAdelanto = r.montoTotal;
    const nuevoSaldo = 0;
    const nuevoEstado = 'PAGADA' as const;

    return this.updateReserva(id, {
      adelanto: nuevoAdelanto,
      saldoPendiente: nuevoSaldo,
      estado: nuevoEstado,
      metodoPago
    });
  },

  async prorrogarReserva(id: string, minutos: number = 15): Promise<Reserva> {
    const reservas = localStore.getReservas();
    const r = reservas.find(item => item.id === id);
    if (!r) throw new Error('Reserva no encontrada');

    // Desplazar 15 minutos en el horario de inicio y fin
    const addMinutes = (timeStr: string, delta: number) => {
      const [h, m] = timeStr.split(':').map(Number);
      const totalMin = Math.max(0, h * 60 + m + delta);
      const newH = Math.floor(totalMin / 60) % 24;
      const newM = totalMin % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const newStart = addMinutes(r.horaInicio, minutos);
    const newEnd = addMinutes(r.horaFin, minutos);

    return this.updateReserva(id, {
      horaInicio: newStart,
      horaFin: newEnd
    });
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
          localStore.saveProductos(mapped);
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

  async createProducto(productoData: Omit<Producto, 'id' | 'estado'>): Promise<Producto> {
    const nuevoProd: Producto = {
      ...productoData,
      id: `prod-${Date.now().toString().slice(-6)}`,
      estado: (productoData.stockActual <= (productoData.stockMinimo || 10)) ? 'Stock Bajo' : 'Disponible'
    };

    if (isSupabaseConfigured()) {
      try {
        const created = await supabaseApi.createProducto({
          nombre: productoData.nombre,
          categoria_id: productoData.categoriaId,
          presentacion: productoData.presentacion,
          precio_unitario: productoData.precioUnitario,
          stock_actual: productoData.stockActual,
          stock_minimo: productoData.stockMinimo || 10,
          imagen_url: productoData.imagenUrl
        });
        if (created?.id) {
          nuevoProd.id = created.id;
        }
      } catch (e) {
        console.warn('Error al crear producto en Supabase:', e);
      }
    }

    const prods = localStore.getProductos();
    prods.unshift(nuevoProd);
    localStore.saveProductos(prods);
    return nuevoProd;
  },

  async updateProducto(productoId: string, updates: Partial<Producto>): Promise<Producto> {
    if (isSupabaseConfigured()) {
      try {
        await supabaseApi.updateProducto(productoId, {
          ...(updates.nombre !== undefined && { nombre: updates.nombre }),
          ...(updates.categoriaId !== undefined && { categoria_id: updates.categoriaId }),
          ...(updates.presentacion !== undefined && { presentacion: updates.presentacion }),
          ...(updates.precioUnitario !== undefined && { precio_unitario: updates.precioUnitario }),
          ...(updates.stockActual !== undefined && { stock_actual: updates.stockActual }),
          ...(updates.stockMinimo !== undefined && { stock_minimo: updates.stockMinimo }),
          ...(updates.imagenUrl !== undefined && { imagen_url: updates.imagenUrl })
        });
      } catch (e) {
        console.warn('Error al actualizar producto en Supabase:', e);
      }
    }

    const prods = localStore.getProductos();
    const index = prods.findIndex(p => p.id === productoId);
    if (index === -1) throw new Error('Producto no encontrado');

    const updated = {
      ...prods[index],
      ...updates,
      estado: ((updates.stockActual ?? prods[index].stockActual) <= (updates.stockMinimo ?? prods[index].stockMinimo)) ? ('Stock Bajo' as const) : ('Disponible' as const)
    };
    prods[index] = updated;
    localStore.saveProductos(prods);
    return updated;
  },

  async deleteProducto(productoId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabaseApi.deleteProducto(productoId);
      } catch (e) {
        console.warn('Error al eliminar producto en Supabase:', e);
      }
    }

    const prods = localStore.getProductos();
    const filtered = prods.filter(p => p.id !== productoId);
    localStore.saveProductos(filtered);
    return true;
  },

  async updateStock(productoId: string, delta: number): Promise<Producto> {
    if (isSupabaseConfigured()) {
      try {
        const updatedSb = await supabaseApi.updateStock(productoId, delta);
        if (updatedSb) {
          const prod: Producto = {
            id: updatedSb.id,
            categoriaId: updatedSb.categoria_id,
            nombre: updatedSb.nombre,
            presentacion: updatedSb.presentacion || '',
            precioUnitario: Number(updatedSb.precio_unitario) || 0,
            stockActual: Number(updatedSb.stock_actual) || 0,
            stockMinimo: Number(updatedSb.stock_minimo) || 10,
            imagenUrl: updatedSb.imagen_url,
            estado: (Number(updatedSb.stock_actual) <= Number(updatedSb.stock_minimo || 10)) ? 'Stock Bajo' : 'Disponible'
          };
          const prods = localStore.getProductos();
          const idx = prods.findIndex(p => p.id === productoId);
          if (idx !== -1) {
            prods[idx] = prod;
          } else {
            prods.push(prod);
          }
          localStore.saveProductos(prods);
          return prod;
        }
      } catch (e) {
        console.warn('Fallo updateStock en Supabase:', e);
      }
    }

    const prods = localStore.getProductos();
    const prod = prods.find(p => p.id === productoId);
    if (!prod) {
      // Si no existe en el store local, crear entrada de fallback
      const fallbackProd: Producto = {
        id: productoId,
        categoriaId: 'otros',
        nombre: 'Producto',
        presentacion: '',
        precioUnitario: 0,
        stockActual: Math.max(0, delta),
        stockMinimo: 10,
        imagenUrl: '',
        estado: 'Disponible'
      };
      prods.push(fallbackProd);
      localStore.saveProductos(prods);
      return fallbackProd;
    }

    const nuevoStock = Math.max(0, prod.stockActual + delta);
    prod.stockActual = nuevoStock;
    prod.estado = nuevoStock <= (prod.stockMinimo || 10) ? 'Stock Bajo' : 'Disponible';

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

    // Despacho HTTP real al Servicio REST / API Gateway (Visible en DevTools Network - Capas 3 y 4)
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(nuevaVenta)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.id) nuevaVenta.id = data.id;
      }
    } catch (e) {
      console.warn('Llamada HTTP a /api/ventas:', e);
    }

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

  async getVentas(): Promise<Venta[]> {
    if (isSupabaseConfigured()) {
      try {
        const sbVentas = await supabaseApi.getVentas();
        if (sbVentas && Array.isArray(sbVentas)) {
          const mapped: Venta[] = sbVentas.map((v: any) => ({
            id: v.id,
            numeroComprobante: v.numero_comprobante || `REC-${v.id.slice(-5)}`,
            fechaHora: v.fecha_hora,
            total: Number(v.total) || 0,
            metodoPago: (v.metodo_pago === 'YAPE_PLIN' ? 'YAPE' : v.metodo_pago) as MetodoPago,
            items: (v.detalle_ventas || []).map((d: any) => ({
              productoId: d.producto_id,
              nombre: d.productos?.nombre ? `${d.productos.nombre} ${d.productos.presentacion || ''}`.trim() : 'Producto',
              cantidad: Number(d.cantidad) || 1,
              precioUnitario: Number(d.precio_unitario) || 0,
              subtotal: Number(d.subtotal) || 0
            }))
          }));
          localStore.saveVentas(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Fallo getVentas en Supabase, usando local:', e);
      }
    }
    return localStore.getVentas();
  },

  // 3. Cierre de Caja y Dashboard
  async getCierreCaja(periodo: string = 'Mayo 2026'): Promise<CierreCaja & { totalReservasCount: number; totalVentasCount: number; ticketPromedio: number }> {
    const reservas = await this.getReservas();
    const ventas = await this.getVentas();

    // Desglose de ingresos por Alquileres (Canchas / Eventos)
    // Se toma el adelanto cobrado de reservas confirmadas o pagadas
    const alquileres = {
      efectivo: 0,
      yapePlin: 0,
      transferencia: 0,
      total: 0
    };

    reservas.forEach(r => {
      if (r.estado !== 'CANCELADA') {
        const monto = Number(r.adelanto) || 0;
        const metodo = r.metodoPago || 'EFECTIVO';
        if (metodo === 'YAPE' || metodo === 'PLIN' || metodo === 'YAPE_PLIN') {
          alquileres.yapePlin += monto;
        } else if (metodo === 'TRANSFERENCIA') {
          alquileres.transferencia += monto;
        } else {
          alquileres.efectivo += monto;
        }
        alquileres.total += monto;
      }
    });

    // Desglose de ingresos por Minimarket (POS)
    const minimarket = {
      efectivo: 0,
      yapePlin: 0,
      transferencia: 0,
      total: 0
    };

    ventas.forEach(v => {
      const monto = Number(v.total) || 0;
      const metodo = v.metodoPago || 'EFECTIVO';
      if (metodo === 'YAPE' || metodo === 'PLIN' || metodo === 'YAPE_PLIN') {
        minimarket.yapePlin += monto;
      } else if (metodo === 'TRANSFERENCIA') {
        minimarket.transferencia += monto;
      } else {
        minimarket.efectivo += monto;
      }
      minimarket.total += monto;
    });

    // Redondear a 2 decimales
    alquileres.efectivo = Math.round(alquileres.efectivo * 100) / 100;
    alquileres.yapePlin = Math.round(alquileres.yapePlin * 100) / 100;
    alquileres.transferencia = Math.round(alquileres.transferencia * 100) / 100;
    alquileres.total = Math.round(alquileres.total * 100) / 100;

    minimarket.efectivo = Math.round(minimarket.efectivo * 100) / 100;
    minimarket.yapePlin = Math.round(minimarket.yapePlin * 100) / 100;
    minimarket.transferencia = Math.round(minimarket.transferencia * 100) / 100;
    minimarket.total = Math.round(minimarket.total * 100) / 100;

    const totalGeneral = Math.round((alquileres.total + minimarket.total) * 100) / 100;
    const totalReservasCount = reservas.filter(r => r.estado !== 'CANCELADA').length;
    const totalVentasCount = ventas.length;
    const ticketPromedio = totalVentasCount > 0 ? Math.round((minimarket.total / totalVentasCount) * 100) / 100 : 0;
    const aperturaActual = this.getAperturaActual();

    return {
      periodo,
      fechaConsulta: new Date().toISOString().slice(0, 10),
      alquileres,
      minimarket,
      totalGeneral,
      totalReservasCount,
      totalVentasCount,
      ticketPromedio,
      aperturaActual
    };
  },

  getAperturaActual(): AperturaCaja | null {
    return localStore.getAperturaCaja();
  },

  async abrirCaja(montoInicial: number, abiertaPor?: string): Promise<AperturaCaja> {
    const now = new Date();
    const fecha = now.toISOString().slice(0, 10);
    const horaApertura = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const nuevaApertura: AperturaCaja = {
      id: `ape-${Date.now()}`,
      fecha,
      horaApertura,
      montoInicial: Number(montoInicial) || 0,
      abiertaPor: abiertaPor || 'Staff Turno',
      estado: 'ABIERTA'
    };

    localStore.saveAperturaCaja(nuevaApertura);
    return nuevaApertura;
  },

  async cerrarCajaTurno(montoCierreEfectivo: number, observaciones?: string, cerradaPor?: string): Promise<AperturaCaja> {
    const actual = this.getAperturaActual();
    const now = new Date();
    const horaCierre = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const aperturaCerrada: AperturaCaja = {
      id: actual?.id || `ape-${Date.now()}`,
      fecha: actual?.fecha || now.toISOString().slice(0, 10),
      horaApertura: actual?.horaApertura || '08:00',
      montoInicial: actual?.montoInicial || 0,
      abiertaPor: actual?.abiertaPor || 'Staff Turno',
      estado: 'CERRADA',
      montoCierreEfectivo: Number(montoCierreEfectivo) || 0,
      horaCierre,
      cerradaPor: cerradaPor || 'Staff Turno',
      observaciones: observaciones || ''
    };

    localStore.saveAperturaCaja(aperturaCerrada);
    return aperturaCerrada;
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
