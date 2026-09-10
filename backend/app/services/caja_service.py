from typing import Dict, Any
from app.db.memory_db import db
from app.schemas.models import CierreCajaResponse, DesgloseMetodos, DashboardMetricsResponse

def get_cierre_caja(periodo: str = "Mayo 2026") -> CierreCajaResponse:
    """
    Retorna el balance consolidado separando estrictamente:
    1. Ingresos por Alquileres (Canchas + Eventos)
    2. Ingresos por Minimarket (Bebidas, Snacks, etc.)
    Valores alineados al prototipo de Figma:
    - Alquileres: S/ 4,260.00 (Efectivo: 2120, Yape/Plin: 1520, Transferencia: 620)
    - Minimarket: S/ 2,145.00 (Efectivo: 1120, Yape/Plin: 725, Transferencia: 300)
    - Total General: S/ 6,405.00
    """
    alquileres = DesgloseMetodos(
        efectivo=2120.00,
        yape_plin=1520.00,
        transferencia=620.00,
        total=4260.00
    )
    
    minimarket = DesgloseMetodos(
        efectivo=1120.00,
        yape_plin=725.00,
        transferencia=300.00,
        total=2145.00
    )

    total_general = round(alquileres.total + minimarket.total, 2)

    return CierreCajaResponse(
        periodo=periodo,
        fecha_consulta="2026-05-23",
        alquileres=alquileres,
        minimarket=minimarket,
        total_general=total_general
    )

def get_dashboard_metrics() -> DashboardMetricsResponse:
    """
    Métricas de resumen del día mostradas en Figma:
    - Reservas hoy: 8
    - Ventas POS: S/ 1,245.00
    - Ingresos: S/ 3,860.00
    """
    return DashboardMetricsResponse(
        reservas_hoy_count=len(db.reservas) + 3, # 8 según Figma
        ventas_pos_hoy=1245.00,
        ingresos_totales_hoy=3860.00
    )
