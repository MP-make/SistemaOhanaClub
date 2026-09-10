from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, time, datetime

# --- USUARIO / AUTH ---
class UsuarioLogin(BaseModel):
    username: str
    password: str
    remember_me: bool = True

class UsuarioResponse(BaseModel):
    id: str
    username: str
    nombre_completo: str
    rol: str

# --- RESERVAS ---
class TarifaCalculateRequest(BaseModel):
    zona: str # 'CANCHA' o 'EVENTOS'
    fecha: str # 'YYYY-MM-DD'
    hora_inicio: str # 'HH:MM'
    hora_fin: str # 'HH:MM'
    tarifa_tipo: Optional[str] = "DIURNA" # 'DIURNA' | 'NOCTURNA'
    presupuesto_evento: Optional[float] = 0.0

class TarifaCalculationResponse(BaseModel):
    zona: str
    monto_total: float
    adelanto: float
    saldo_pendiente: float
    tipo_tarifa: str
    horas: float

class ReservaCreate(BaseModel):
    zona: str # 'CANCHA' o 'EVENTOS'
    cliente_nombre: str
    cliente_telefono: Optional[str] = ""
    cliente_empresa: Optional[str] = None
    tipo_evento: Optional[str] = "Reserva" # 'Entrenamiento', 'Reserva', 'Cumpleaños', 'Evento Corporativo'
    fecha: str # 'YYYY-MM-DD'
    hora_inicio: str # 'HH:MM'
    hora_fin: str # 'HH:MM'
    tipo_tarifa: Optional[str] = "DIURNA"
    monto_total: float
    adelanto: float
    saldo_pendiente: float
    metodo_pago: Optional[str] = "EFECTIVO"
    es_recurrente: Optional[bool] = False
    dias_recurrentes: Optional[List[str]] = []
    fecha_fin_recurrencia: Optional[str] = None

class ReservaResponse(BaseModel):
    id: str
    zona: str
    cliente_nombre: str
    cliente_telefono: Optional[str] = ""
    cliente_empresa: Optional[str] = None
    tipo_evento: str
    fecha: str
    hora_inicio: str
    hora_fin: str
    tipo_tarifa: str
    monto_total: float
    adelanto: float
    saldo_pendiente: float
    estado: str
    es_recurrente: bool = False

# --- POS / INVENTARIO ---
class ProductoItem(BaseModel):
    id: str
    categoria_id: str
    nombre: str
    presentacion: str
    precio_unitario: float
    stock_actual: int
    stock_minimo: int
    imagen_url: str
    estado: str # 'Disponible' | 'Stock Bajo'

class ProductoStockUpdate(BaseModel):
    cantidad_ajuste: int # +1 o -1

class VentaItemInput(BaseModel):
    producto_id: str
    cantidad: int

class VentaCreate(BaseModel):
    items: List[VentaItemInput]
    metodo_pago: str # 'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA'
    monto_recibido: Optional[float] = None

class VentaDetalleItem(BaseModel):
    producto_id: str
    nombre: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class VentaResponse(BaseModel):
    id: str
    numero_comprobante: str
    fecha_hora: str
    total: float
    metodo_pago: str
    items: List[VentaDetalleItem]

# --- CAJA Y REPORTES ---
class DesgloseMetodos(BaseModel):
    efectivo: float
    yape_plin: float
    transferencia: float
    total: float

class CierreCajaResponse(BaseModel):
    periodo: str
    fecha_consulta: str
    alquileres: DesgloseMetodos
    minimarket: DesgloseMetodos
    total_general: float

class DashboardMetricsResponse(BaseModel):
    reservas_hoy_count: int
    ventas_pos_hoy: float
    ingresos_totales_hoy: float
