import uuid
from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.schemas.models import (
    ReservaCreate,
    ReservaResponse,
    TarifaCalculateRequest,
    TarifaCalculationResponse
)
from app.services.booking_service import calculate_tarifa, check_time_conflict
from app.db.memory_db import db

router = APIRouter(prefix="/reservas", tags=["Reservas"])

@router.post("/calcular-tarifa", response_model=TarifaCalculationResponse)
def calcular_tarifa_endpoint(payload: TarifaCalculateRequest):
    """
    Calcula instantáneamente tarifa, adelanto y saldo pendiente
    Feedback inmediato (Principio UX).
    """
    return calculate_tarifa(payload)

@router.get("", response_model=List[ReservaResponse])
def listar_reservas(
    fecha: Optional[str] = Query(None, description="Filtrar por fecha YYYY-MM-DD"),
    zona: Optional[str] = Query(None, description="CANCHA o EVENTOS")
):
    resultado = db.reservas
    if fecha:
        resultado = [r for r in resultado if r.get("fecha") == fecha]
    if zona:
        resultado = [r for r in resultado if r.get("zona", "").upper() == zona.upper()]
    return [ReservaResponse(**r) for r in resultado]

@router.post("", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
def crear_reserva(reserva_in: ReservaCreate):
    """
    Registra una nueva reserva validando disponibilidad en tiempo real (HU05 / Prevención de errores).
    """
    # 1. Validar solapamiento
    has_conflict = check_time_conflict(
        zona=reserva_in.zona,
        fecha=reserva_in.fecha,
        hora_inicio=reserva_in.hora_inicio,
        hora_fin=reserva_in.hora_fin,
        existing_reservas=db.reservas
    )

    if has_conflict:
        nombre_zona = "Zona Cancha" if reserva_in.zona.upper() == "CANCHA" else "Zona Eventos"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Horario no disponible. La {nombre_zona} ya tiene una reserva para ese horario."
        )

    # 2. Si no hay conflicto, crear la reserva
    nueva_reserva = {
        "id": f"res-{uuid.uuid4().hex[:6]}",
        "zona": reserva_in.zona.upper(),
        "cliente_nombre": reserva_in.cliente_nombre,
        "cliente_telefono": reserva_in.cliente_telefono or "",
        "cliente_empresa": reserva_in.cliente_empresa,
        "tipo_evento": reserva_in.tipo_evento or "Reserva",
        "fecha": reserva_in.fecha,
        "hora_inicio": reserva_in.hora_inicio,
        "hora_fin": reserva_in.hora_fin,
        "tipo_tarifa": reserva_in.tipo_tarifa or "DIURNA",
        "monto_total": reserva_in.monto_total,
        "adelanto": reserva_in.adelanto,
        "saldo_pendiente": reserva_in.saldo_pendiente,
        "estado": "CONFIRMADA",
        "metodo_pago": reserva_in.metodo_pago or "EFECTIVO",
        "es_recurrente": reserva_in.es_recurrente or False
    }

    db.reservas.append(nueva_reserva)
    return ReservaResponse(**nueva_reserva)

@router.delete("/{reserva_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_reserva(reserva_id: str):
    res = next((r for r in db.reservas if r["id"] == reserva_id), None)
    if not res:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    res["estado"] = "CANCELADA"
    return None
