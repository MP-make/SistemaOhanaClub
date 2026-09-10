import uuid
from typing import Dict, List, Any

class DataStore:
    def __init__(self):
        self.reset()

    def reset(self):
        # 1. Usuarios
        self.usuarios = [
            {
                "id": "usr-001",
                "username": "Usuario.staff",
                "nombre_completo": "Staff Operativo Ohana",
                "rol": "staff"
            },
            {
                "id": "usr-002",
                "username": "admin",
                "nombre_completo": "Administrador General",
                "rol": "admin"
            }
        ]

        # 2. Productos
        self.productos: List[Dict[str, Any]] = [
            {
                "id": "prod-001",
                "categoria_id": "bebidas",
                "nombre": "Agua mineral",
                "presentacion": "500ml",
                "precio_unitario": 2.00,
                "stock_actual": 28,
                "stock_minimo": 10,
                "imagen_url": "/images/agua.png"
            },
            {
                "id": "prod-002",
                "categoria_id": "bebidas",
                "nombre": "Gaseosa",
                "presentacion": "500ml",
                "precio_unitario": 3.00,
                "stock_actual": 15,
                "stock_minimo": 10,
                "imagen_url": "/images/gaseosa.png"
            },
            {
                "id": "prod-003",
                "categoria_id": "bebidas",
                "nombre": "Energizante",
                "presentacion": "250ml",
                "precio_unitario": 6.00,
                "stock_actual": 8,
                "stock_minimo": 10,
                "imagen_url": "/images/energizante.png"
            },
            {
                "id": "prod-004",
                "categoria_id": "bebidas",
                "nombre": "Isotonica",
                "presentacion": "250ml",
                "precio_unitario": 4.00,
                "stock_actual": 12,
                "stock_minimo": 10,
                "imagen_url": "/images/isotonica.png"
            },
            {
                "id": "prod-005",
                "categoria_id": "snacks",
                "nombre": "Papas clasicas",
                "presentacion": "bolsa",
                "precio_unitario": 3.50,
                "stock_actual": 20,
                "stock_minimo": 10,
                "imagen_url": "/images/papas.png"
            },
            {
                "id": "prod-006",
                "categoria_id": "snacks",
                "nombre": "Mani salado",
                "presentacion": "bolsa",
                "precio_unitario": 2.50,
                "stock_actual": 18,
                "stock_minimo": 10,
                "imagen_url": "/images/mani.png"
            },
            {
                "id": "prod-007",
                "categoria_id": "galletas",
                "nombre": "Galletas chocolate",
                "presentacion": "paquete",
                "precio_unitario": 2.00,
                "stock_actual": 5,
                "stock_minimo": 10,
                "imagen_url": "/images/galletas.png"
            }
        ]

        # 3. Reservas Iniciales (Coinciden con el prototipo de Figma)
        self.reservas: List[Dict[str, Any]] = [
            {
                "id": "res-001",
                "zona": "CANCHA",
                "cliente_nombre": "Academia Futbol",
                "cliente_telefono": "987654321",
                "cliente_empresa": None,
                "tipo_evento": "Entrenamiento",
                "fecha": "2026-05-23",
                "hora_inicio": "08:00",
                "hora_fin": "10:30",
                "tipo_tarifa": "DIURNA",
                "monto_total": 150.00,
                "adelanto": 10.00,
                "saldo_pendiente": 140.00,
                "estado": "CONFIRMADA",
                "metodo_pago": "EFECTIVO",
                "es_recurrente": True
            },
            {
                "id": "res-002",
                "zona": "CANCHA",
                "cliente_nombre": "Juan Perez",
                "cliente_telefono": "999888777",
                "cliente_empresa": None,
                "tipo_evento": "Reserva",
                "fecha": "2026-05-23",
                "hora_inicio": "11:00",
                "hora_fin": "14:00",
                "tipo_tarifa": "DIURNA",
                "monto_total": 180.00,
                "adelanto": 10.00,
                "saldo_pendiente": 170.00,
                "estado": "CONFIRMADA",
                "metodo_pago": "YAPE_PLIN",
                "es_recurrente": False
            },
            {
                "id": "res-003",
                "zona": "CANCHA",
                "cliente_nombre": "Los Amigos",
                "cliente_telefono": "912345678",
                "cliente_empresa": None,
                "tipo_evento": "Reserva",
                "fecha": "2026-05-23",
                "hora_inicio": "17:00",
                "hora_fin": "20:00",
                "tipo_tarifa": "NOCTURNA",
                "monto_total": 220.00,
                "adelanto": 10.00,
                "saldo_pendiente": 210.00,
                "estado": "CONFIRMADA",
                "metodo_pago": "EFECTIVO",
                "es_recurrente": False
            },
            {
                "id": "res-004",
                "zona": "EVENTOS",
                "cliente_nombre": "Maria Lopez",
                "cliente_telefono": "955443322",
                "cliente_empresa": "Familia Lopez",
                "tipo_evento": "Cumpleaños",
                "fecha": "2026-05-23",
                "hora_inicio": "13:00",
                "hora_fin": "16:00",
                "tipo_tarifa": "EVENTO_PERSONALIZADO",
                "monto_total": 1200.00,
                "adelanto": 600.00,
                "saldo_pendiente": 600.00,
                "estado": "CONFIRMADA",
                "metodo_pago": "TRANSFERENCIA",
                "es_recurrente": False
            },
            {
                "id": "res-005",
                "zona": "EVENTOS",
                "cliente_nombre": "Tech Solutions",
                "cliente_telefono": "911223344",
                "cliente_empresa": "Tech Solutions SAC",
                "tipo_evento": "Evento Corporativo",
                "fecha": "2026-05-23",
                "hora_inicio": "19:00",
                "hora_fin": "22:00",
                "tipo_tarifa": "EVENTO_PERSONALIZADO",
                "monto_total": 2000.00,
                "adelanto": 1000.00,
                "saldo_pendiente": 1000.00,
                "estado": "CONFIRMADA",
                "metodo_pago": "TRANSFERENCIA",
                "es_recurrente": False
            }
        ]

        # 4. Ventas Iniciales
        self.ventas: List[Dict[str, Any]] = [
            {
                "id": "vta-001",
                "numero_comprobante": "REC-001",
                "fecha_hora": "2026-05-23T10:15:00",
                "total": 8.50,
                "metodo_pago": "EFECTIVO",
                "items": [
                    {"producto_id": "prod-002", "nombre": "Gaseosa 500ml", "cantidad": 1, "precio_unitario": 3.00, "subtotal": 3.00},
                    {"producto_id": "prod-005", "nombre": "Papas clasicas", "cantidad": 1, "precio_unitario": 3.50, "subtotal": 3.50},
                    {"producto_id": "prod-001", "nombre": "Agua mineral 500ml", "cantidad": 1, "precio_unitario": 2.00, "subtotal": 2.00}
                ]
            }
        ]

db = DataStore()
