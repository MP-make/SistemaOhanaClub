from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.schemas.models import (
    ProductoItem,
    ProductoStockUpdate,
    VentaCreate,
    VentaResponse
)
from app.services.pos_service import process_venta
from app.db.memory_db import db

router = APIRouter(prefix="/pos", tags=["Minimarket POS & Inventario"])

@router.get("/productos", response_model=List[ProductoItem])
def listar_productos(
    categoria: Optional[str] = Query(None, description="bebidas, snacks, galletas, otros"),
    search: Optional[str] = Query(None, description="Búsqueda por nombre")
):
    prods = db.productos
    if categoria and categoria.lower() != "todos":
        prods = [p for p in prods if p["categoria_id"].lower() == categoria.lower()]
    if search:
        s = search.lower()
        prods = [p for p in prods if s in p["nombre"].lower()]

    items: List[ProductoItem] = []
    for p in prods:
        estado = "Stock Bajo" if p["stock_actual"] <= p["stock_minimo"] else "Disponible"
        items.append(
            ProductoItem(
                id=p["id"],
                categoria_id=p["categoria_id"],
                nombre=p["nombre"],
                presentacion=p["presentacion"],
                precio_unitario=p["precio_unitario"],
                stock_actual=p["stock_actual"],
                stock_minimo=p["stock_minimo"],
                imagen_url=p["imagen_url"],
                estado=estado
            )
        )
    return items

@router.post("/ventas", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def registrar_venta(venta_in: VentaCreate):
    try:
        return process_venta(venta_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("/productos/{producto_id}/stock", response_model=ProductoItem)
def ajustar_stock(producto_id: str, update: ProductoStockUpdate):
    prod = next((p for p in db.productos if p["id"] == producto_id), None)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    nuevo_stock = prod["stock_actual"] + update.cantidad_ajuste
    if nuevo_stock < 0:
        raise HTTPException(status_code=400, detail="El stock no puede ser negativo")
    
    prod["stock_actual"] = nuevo_stock
    estado = "Stock Bajo" if prod["stock_actual"] <= prod["stock_minimo"] else "Disponible"
    
    return ProductoItem(
        id=prod["id"],
        categoria_id=prod["categoria_id"],
        nombre=prod["nombre"],
        presentacion=prod["presentacion"],
        precio_unitario=prod["precio_unitario"],
        stock_actual=prod["stock_actual"],
        stock_minimo=prod["stock_minimo"],
        imagen_url=prod["imagen_url"],
        estado=estado
    )
