import uuid
from datetime import datetime
from typing import Dict, Any, List
from app.db.memory_db import db
from app.schemas.models import VentaCreate, VentaResponse, VentaDetalleItem

def process_venta(venta_in: VentaCreate) -> VentaResponse:
    total = 0.0
    detalles: List[VentaDetalleItem] = []

    # Validar stock y calcular total
    for item in venta_in.items:
        prod = next((p for p in db.productos if p["id"] == item.producto_id), None)
        if not prod:
            raise ValueError(f"Producto con ID {item.producto_id} no existe.")
        
        if prod["stock_actual"] < item.cantidad:
            raise ValueError(f"Stock insuficiente para {prod['nombre']}. Disponible: {prod['stock_actual']}")
        
        subtotal = round(prod["precio_unitario"] * item.cantidad, 2)
        total += subtotal

        # Descontar stock (Regla HU07 / SLA05)
        prod["stock_actual"] -= item.cantidad

        detalles.append(
            VentaDetalleItem(
                producto_id=prod["id"],
                nombre=f"{prod['nombre']} {prod['presentacion']}",
                cantidad=item.cantidad,
                precio_unitario=prod["precio_unitario"],
                subtotal=subtotal
            )
        )

    venta_id = f"vta-{uuid.uuid4().hex[:6]}"
    nro_recibo = f"REC-{len(db.ventas) + 1:03d}"
    now_str = datetime.now().isoformat()

    nueva_venta = {
        "id": venta_id,
        "numero_comprobante": nro_recibo,
        "fecha_hora": now_str,
        "total": round(total, 2),
        "metodo_pago": venta_in.metodo_pago,
        "items": [d.model_dump() for d in detalles]
    }
    db.ventas.append(nueva_venta)

    return VentaResponse(
        id=venta_id,
        numero_comprobante=nro_recibo,
        fecha_hora=now_str,
        total=round(total, 2),
        metodo_pago=venta_in.metodo_pago,
        items=detalles
    )
