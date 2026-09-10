import unittest
from app.services.booking_service import calculate_tarifa, check_time_conflict
from app.schemas.models import TarifaCalculateRequest
from app.services.pos_service import process_venta
from app.schemas.models import VentaCreate, VentaItemInput
from app.services.caja_service import get_cierre_caja
from app.db.memory_db import db

class TestBusinessRules(unittest.TestCase):
    def test_calculo_tarifa_diurna_cancha(self):
        # 1 hora diurna (16:00 a 17:00)
        req = TarifaCalculateRequest(
            zona="CANCHA",
            fecha="2026-05-23",
            hora_inicio="16:00",
            hora_fin="17:00",
            tarifa_tipo="DIURNA"
        )
        res = calculate_tarifa(req)
        self.assertEqual(res.monto_total, 60.00)
        self.assertEqual(res.adelanto, 10.00)
        self.assertEqual(res.saldo_pendiente, 50.00)
        self.assertEqual(res.tipo_tarifa, "DIURNA")

    def test_calculo_tarifa_nocturna_cancha(self):
        # 1 hora nocturna (19:00 a 20:00)
        req = TarifaCalculateRequest(
            zona="CANCHA",
            fecha="2026-05-23",
            hora_inicio="19:00",
            hora_fin="20:00",
            tarifa_tipo="NOCTURNA"
        )
        res = calculate_tarifa(req)
        self.assertEqual(res.monto_total, 80.00)
        self.assertEqual(res.adelanto, 10.00)
        self.assertEqual(res.saldo_pendiente, 70.00)
        self.assertEqual(res.tipo_tarifa, "NOCTURNA")

    def test_calculo_evento_50_porciento(self):
        # Evento presupuestado en S/ 2000
        req = TarifaCalculateRequest(
            zona="EVENTOS",
            fecha="2026-05-23",
            hora_inicio="19:00",
            hora_fin="23:00",
            presupuesto_evento=2000.00
        )
        res = calculate_tarifa(req)
        self.assertEqual(res.monto_total, 2000.00)
        self.assertEqual(res.adelanto, 1000.00)
        self.assertEqual(res.saldo_pendiente, 1000.00)

    def test_prevencion_error_solapamiento(self):
        # Debe detectar conflicto si ya existe reserva de 08:00 a 10:30 en Cancha
        conflict = check_time_conflict(
            zona="CANCHA",
            fecha="2026-05-23",
            hora_inicio="09:00",
            hora_fin="10:00",
            existing_reservas=db.reservas
        )
        self.assertTrue(conflict)

        # No debe haber conflicto en horario libre
        no_conflict = check_time_conflict(
            zona="CANCHA",
            fecha="2026-05-23",
            hora_inicio="15:00",
            hora_fin="16:00",
            existing_reservas=db.reservas
        )
        self.assertFalse(no_conflict)

    def test_venta_pos_descuento_stock(self):
        # Probar venta de 1 agua mineral y 1 gaseosa
        db.reset()
        prod_agua = next(p for p in db.productos if p["id"] == "prod-001")
        stock_inicial_agua = prod_agua["stock_actual"]

        venta_req = VentaCreate(
            items=[
                VentaItemInput(producto_id="prod-001", cantidad=2)
            ],
            metodo_pago="EFECTIVO"
        )
        venta_res = process_venta(venta_req)
        
        self.assertEqual(venta_res.total, 4.00) # 2 * S/2.00
        self.assertEqual(prod_agua["stock_actual"], stock_inicial_agua - 2)

    def test_cierre_caja_separacion_estricta(self):
        cierre = get_cierre_caja("Mayo 2026")
        self.assertEqual(cierre.alquileres.total, 4260.00)
        self.assertEqual(cierre.minimarket.total, 2145.00)
        self.assertEqual(cierre.total_general, 6405.00)
        self.assertEqual(cierre.alquileres.efectivo + cierre.alquileres.yape_plin + cierre.alquileres.transferencia, 4260.00)

if __name__ == '__main__':
    unittest.main()
