from fastapi import APIRouter, Query
from app.schemas.models import CierreCajaResponse, DashboardMetricsResponse
from app.services.caja_service import get_cierre_caja, get_dashboard_metrics

router = APIRouter(prefix="/caja", tags=["Cierre de Caja y Métricas"])

@router.get("/cierre", response_model=CierreCajaResponse)
def obtener_cierre_caja(periodo: str = Query("Mayo 2026", description="Mes o fecha de consulta")):
    """
    Retorna el arqueo de caja con separación estricta:
    Ingresos por Alquileres vs Ingresos por Minimarket (HU08 / RF08).
    """
    return get_cierre_caja(periodo=periodo)

@router.get("/dashboard-metricas", response_model=DashboardMetricsResponse)
def obtener_dashboard_metricas():
    """
    Retorna los 3 KPIs clave de la cabecera del Dashboard.
    """
    return get_dashboard_metrics()
