export type ScreenType = 
  | 'login'
  | 'dashboard'
  | 'calendario'
  | 'nueva_reserva'
  | 'pos'
  | 'inventario'
  | 'caja'
  | 'reportes';

export type ZonaTipo = 'CANCHA' | 'EVENTOS';
export type TarifaTipo = 'DIURNA' | 'NOCTURNA' | 'EVENTO_PERSONALIZADO';
export type MetodoPago = 'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA' | 'TRANSFERENCIA';

export interface Usuario {
  id: string;
  username: string;
  nombreCompleto: string;
  rol: 'admin' | 'staff';
}

export interface Reserva {
  id: string;
  zona: ZonaTipo;
  clienteNombre: string;
  clienteTelefono?: string;
  clienteEmpresa?: string;
  tipoEvento: string; // 'Entrenamiento', 'Reserva', 'Cumpleaños', 'Evento Corporativo'
  fecha: string; // 'YYYY-MM-DD'
  horaInicio: string; // 'HH:MM'
  horaFin: string; // 'HH:MM'
  tipoTarifa: TarifaTipo;
  montoTotal: number;
  adelanto: number;
  saldoPendiente: number;
  estado: 'CONFIRMADA' | 'PAGADA' | 'CANCELADA';
  metodoPago?: MetodoPago;
  esRecurrente?: boolean;
}

export interface TarifaCalculation {
  zona: ZonaTipo;
  montoTotal: number;
  adelanto: number;
  saldoPendiente: number;
  tipoTarifa: string;
  horas: number;
}

export interface Producto {
  id: string;
  categoriaId: 'bebidas' | 'snacks' | 'galletas' | 'otros';
  nombre: string;
  presentacion: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  imagenUrl: string;
  estado: 'Disponible' | 'Stock Bajo';
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export interface VentaItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  numeroComprobante: string;
  fechaHora: string;
  total: number;
  metodoPago: MetodoPago;
  items: VentaItem[];
}

export interface DesgloseMetodos {
  efectivo: number;
  yapePlin: number;
  transferencia: number;
  total: number;
}

export interface CierreCaja {
  periodo: string;
  fechaConsulta: string;
  alquileres: DesgloseMetodos;
  minimarket: DesgloseMetodos;
  totalGeneral: number;
}

export interface DashboardMetrics {
  reservasHoyCount: number;
  ventasPosHoy: number;
  ingresosTotalesHoy: number;
}
