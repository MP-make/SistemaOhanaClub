from datetime import datetime, time
from typing import List, Dict, Any, Tuple
from app.schemas.models import TarifaCalculateRequest, TarifaCalculationResponse, ReservaCreate

TARIFA_DIURNA_CANCHA = 60.00
TARIFA_NOCTURNA_CANCHA = 80.00
ADELANTO_FIJO_CANCHA = 10.00
PORCENTAJE_ADELANTO_EVENTO = 0.50

def parse_time_str(time_str: str) -> time:
    """Convierte cadena HH:MM a objeto time"""
    parts = time_str.split(":")
    return time(hour=int(parts[0]), minute=int(parts[1]))

def calculate_hours_difference(start_str: str, end_str: str) -> float:
    """Calcula la cantidad de horas entre dos horas dadas"""
    t1 = parse_time_str(start_str)
    t2 = parse_time_str(end_str)
    minutes = (t2.hour * 60 + t2.minute) - (t1.hour * 60 + t1.minute)
    if minutes <= 0:
        minutes += 24 * 60 # Ajuste si pasa la medianoche
    return round(minutes / 60.0, 2)

def calculate_tarifa(data: TarifaCalculateRequest) -> TarifaCalculationResponse:
    """
    Aplica las reglas de negocio estrictas:
    - Cancha: S/60 diurna, S/80 nocturna (>= 18:00), adelanto fijo S/10.00
    - Eventos: 50% de adelanto sobre el presupuesto total pactado
    """
    horas = calculate_hours_difference(data.hora_inicio, data.hora_fin)
    
    if data.zona.upper() == "CANCHA":
        start_t = parse_time_str(data.hora_inicio)
        # Si la hora de inicio es 18:00 o posterior, o si el usuario seleccionó nocturna
        is_nocturna = (data.tarifa_tipo == "NOCTURNA") or (start_t.hour >= 18)
        precio_hora = TARIFA_NOCTURNA_CANCHA if is_nocturna else TARIFA_DIURNA_CANCHA
        tipo_tarifa_res = "NOCTURNA" if is_nocturna else "DIURNA"
        
        # En caso de seleccionar tarifa directa o por horas
        monto_total = round(precio_hora * max(horas, 1.0), 2)
        adelanto = ADELANTO_FIJO_CANCHA
        saldo_pendiente = max(0.0, round(monto_total - adelanto, 2))
        
        return TarifaCalculationResponse(
            zona="CANCHA",
            monto_total=monto_total,
            adelanto=adelanto,
            saldo_pendiente=saldo_pendiente,
            tipo_tarifa=tipo_tarifa_res,
            horas=horas
        )
    else: # EVENTOS
        monto_total = float(data.presupuesto_evento or 0.0)
        adelanto = round(monto_total * PORCENTAJE_ADELANTO_EVENTO, 2)
        saldo_pendiente = round(monto_total - adelanto, 2)
        
        return TarifaCalculationResponse(
            zona="EVENTOS",
            monto_total=monto_total,
            adelanto=adelanto,
            saldo_pendiente=saldo_pendiente,
            tipo_tarifa="EVENTO_PERSONALIZADO",
            horas=horas
        )

def check_time_conflict(
    zona: str,
    fecha: str,
    hora_inicio: str,
    hora_fin: str,
    existing_reservas: List[Dict[str, Any]],
    exclude_id: str = None
) -> bool:
    """
    Valida si existe cruce de horarios para la misma zona y fecha.
    Retorna True si hay conflicto, False si está disponible.
    """
    req_start = parse_time_str(hora_inicio)
    req_end = parse_time_str(hora_fin)
    req_s_min = req_start.hour * 60 + req_start.minute
    req_e_min = req_end.hour * 60 + req_end.minute

    for res in existing_reservas:
        if exclude_id and res.get("id") == exclude_id:
            continue
        if res.get("zona", "").upper() == zona.upper() and res.get("fecha") == fecha and res.get("estado") != "CANCELADA":
            ex_start = parse_time_str(res.get("hora_inicio"))
            ex_end = parse_time_str(res.get("hora_fin"))
            ex_s_min = ex_start.hour * 60 + ex_start.minute
            ex_e_min = ex_end.hour * 60 + ex_end.minute
            
            # Condición de solapamiento de intervalos
            if max(req_s_min, ex_s_min) < min(req_e_min, ex_e_min):
                return True
    return False
