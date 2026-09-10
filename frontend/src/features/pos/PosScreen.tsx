import React, { useState, useEffect } from 'react';
import { Search, Banknote, Smartphone, CreditCard, ChevronLeft, ChevronDown } from 'lucide-react';
import { Producto, CartItem, MetodoPago, Venta } from '../../types';
import { apiService } from '../../services/api';

interface PosScreenProps {
  onVentaCompletada: (venta: Venta) => void;
}

export const PosScreen: React.FC<PosScreenProps> = ({ onVentaCompletada }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<string>('bebidas');
  const [search, setSearch] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadProductos();
  }, [categoria, search]);

  const loadProductos = async () => {
    const list = await apiService.getProductos(categoria, search);
    setProductos(list);

    // Si el carrito está vacío en primera carga, inicializar con los 3 productos del Figma
    if (cart.length === 0 && list.length > 0) {
      const allProds = await apiService.getProductos();
      const gaseosa = allProds.find(p => p.nombre.toLowerCase().includes('gaseosa'));
      const papas = allProds.find(p => p.nombre.toLowerCase().includes('papas'));
      const agua = allProds.find(p => p.nombre.toLowerCase().includes('agua'));

      const initialCart: CartItem[] = [];
      if (gaseosa) initialCart.push({ producto: gaseosa, cantidad: 1 });
      if (papas) initialCart.push({ producto: papas, cantidad: 1 });
      if (agua) initialCart.push({ producto: agua, cantidad: 1 });

      if (initialCart.length > 0) {
        setCart(initialCart);
      }
    }
  };

  const addToCart = (prod: Producto) => {
    setCart(prev => {
      const existing = prev.find(item => item.producto.id === prod.id);
      if (existing) {
        return prev.map(item =>
          item.producto.id === prod.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCart = cart.reduce((acc, item) => acc + item.producto.precioUnitario * item.cantidad, 0);
  const totalCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const venta = await apiService.createVenta(
        cart.map(c => ({ productoId: c.producto.id, cantidad: c.cantidad })),
        metodoPago
      );
      setCart([]);
      onVentaCompletada(venta);
    } catch (err: any) {
      alert(err.message || 'Error al procesar cobro');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'otros', label: 'Otros' },
  ];

  // Helper para imágenes de productos nítidas en Figma
  const getProductImage = (prod: Producto) => {
    const name = prod.nombre.toLowerCase();
    if (name.includes('agua')) {
      return 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('gaseosa') || name.includes('coca')) {
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('energizante') || name.includes('energicente')) {
      return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('isotonica') || name.includes('gatorade')) {
      return 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('papas') || name.includes('lays') || name.includes('doritos')) {
      return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('galletas') || name.includes('oreo')) {
      return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=80';
    }
    return prod.imagenUrl || 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=300&auto=format&fit=crop&q=80';
  };

  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const handlePrevProduct = () => {
    setCarouselIndex(prev => (prev > 0 ? prev - 1 : Math.max(0, productos.length - 3)));
  };

  const handleNextProduct = () => {
    setCarouselIndex(prev => (prev + 3 < productos.length ? prev + 1 : 0));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1638BF] md:bg-slate-50 select-none">
      
      {/* ================= VISTA MÓVIL (< md) - FIEL A FIGMA ================= */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex-1 bg-white rounded-t-[32px] px-4 pt-5 pb-24 flex flex-col justify-between shadow-xs border-t border-slate-100">
          <div>
            
            {/* Buscador de productos */}
            <div className="relative mb-3.5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos"
                className="w-full bg-white border border-[#2563EB] text-slate-800 text-xs font-medium pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-3" />
            </div>

            {/* Píldoras de Categorías */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
              {categorias.map((cat) => {
                const isActive = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoria(cat.id); setCarouselIndex(0); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-white border border-[#2563EB] text-slate-900 hover:bg-blue-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Carrusel / Grid de Productos (3 Columnas Figma 1:1) */}
            <div className="relative mb-4">
              <button 
                onClick={handlePrevProduct}
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#1B3BB6] text-white flex items-center justify-center shadow-md z-10 active:scale-95 transition cursor-pointer hover:bg-blue-800"
                title="Producto anterior"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button 
                onClick={handleNextProduct}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#1B3BB6] text-white flex items-center justify-center shadow-md z-10 active:scale-95 transition cursor-pointer hover:bg-blue-800"
                title="Siguiente producto"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5] rotate-180" />
              </button>

              <div className="grid grid-cols-3 gap-2 px-1">
                {(productos.length > 3 ? productos.slice(carouselIndex, carouselIndex + 3) : productos).map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-[#2563EB] rounded-2xl p-2 shadow-xs flex flex-col justify-between items-center text-center relative"
                  >
                    <div className="w-full h-24 flex items-center justify-center overflow-hidden mb-1">
                      <img
                        src={getProductImage(prod)}
                        alt={prod.nombre}
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>

                    <div className="bg-[#D8F600] text-slate-950 font-black text-[10.5px] px-2.5 py-0.5 rounded-md -mt-2.5 z-10 shadow-xs">
                      S/{prod.precioUnitario.toFixed(2)}
                    </div>

                    <span className="text-[11px] font-bold text-slate-800 leading-tight mt-1 h-7 flex items-center justify-center">
                      {prod.nombre} {prod.presentacion}
                    </span>

                    <button
                      onClick={() => addToCart(prod)}
                      className="w-full bg-[#D8F600] hover:bg-[#c8ea00] active:scale-95 text-slate-950 font-bold text-[10px] py-1.5 rounded-lg shadow-xs mt-1 transition cursor-pointer"
                    >
                      Añadir al carrito
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Caja de Venta Actual (Ticket Carrito) */}
            <div id="ticket-resumen" className="border border-[#2563EB] rounded-2xl p-3.5 bg-white mb-3.5 shadow-xs scroll-mt-20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ChevronDown className="w-4 h-4 text-[#2563EB]" />
                  <span>Venta actual ({totalCount})</span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-slate-900 hover:text-red-500 cursor-pointer transition"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              <div className="py-2 divide-y divide-slate-100 max-h-36 overflow-y-auto no-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    El carrito está vacío.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.producto.id} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-slate-950 w-3">
                          {item.cantidad}
                        </span>
                        <span className="font-medium text-slate-800">
                          {item.producto.nombre} {item.producto.presentacion}
                        </span>
                      </div>
                      <span className="font-bold text-slate-950">
                        S/{(item.producto.precioUnitario * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selector de Medios de Pago */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <button
                type="button"
                onClick={() => setMetodoPago('EFECTIVO')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  metodoPago === 'EFECTIVO'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white border border-[#2563EB] text-slate-900 hover:bg-blue-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('YAPE_PLIN')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  metodoPago === 'YAPE_PLIN'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white border border-[#2563EB] text-slate-900 hover:bg-blue-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Yape/Plin</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('TARJETA')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  metodoPago === 'TARJETA'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white border border-[#2563EB] text-slate-900 hover:bg-blue-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta</span>
              </button>
            </div>

            {/* Botón Naranja de Cobro */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full bg-[#FF6A00] hover:bg-[#e85d00] active:scale-[0.98] disabled:opacity-50 text-white font-black text-base py-3.5 rounded-xl shadow-md transition flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Procesando...' : `Cobrar S/${totalCart.toFixed(2)}`}
            </button>

          </div>
        </div>
      </div>

      {/* ================= VISTA DESKTOP & LAPTOP (>= md) - WORKSPACE 2 COLUMNAS ================= */}
      <div className="hidden md:flex flex-1 p-5 lg:p-7 max-w-[1600px] w-full mx-auto gap-6 items-start">
        
        {/* Columna Izquierda (Catálogo y Búsqueda) */}
        <div className="flex-1 flex flex-col space-y-5">
          
          {/* Header de Barra de herramientas */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
            
            {/* Buscador */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre de producto..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Categorías */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {categorias.map((cat) => {
                const isActive = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-[#1638BF] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productos.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-slate-200/80 hover:border-blue-400 rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between items-center text-center group"
              >
                {/* Imagen del Producto */}
                <div className="w-full h-32 flex items-center justify-center overflow-hidden mb-2 relative">
                  <img
                    src={getProductImage(prod)}
                    alt={prod.nombre}
                    className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition"
                  />
                  <span className="absolute top-0 right-0 text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                    Stock: {prod.stockActual}
                  </span>
                </div>

                {/* Badge de Precio */}
                <div className="bg-[#D8F600] text-slate-950 font-black text-xs px-3 py-1 rounded-md shadow-xs mb-1">
                  S/ {prod.precioUnitario.toFixed(2)}
                </div>

                {/* Nombre */}
                <span className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 h-8 flex items-center justify-center">
                  {prod.nombre} {prod.presentacion}
                </span>

                {/* Botón Añadir */}
                <button
                  onClick={() => addToCart(prod)}
                  className="w-full bg-[#1638BF] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs mt-3 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>+ Añadir al Carrito</span>
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Columna Derecha (Ticket de Venta / Carrito Sticky) */}
        <div className="w-80 lg:w-96 bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 flex flex-col shrink-0 sticky top-24">
          
          {/* Encabezado del Ticket */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Venta Actual</h3>
              <p className="text-xs text-slate-500">{totalCount} artículo(s) seleccionados</p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition cursor-pointer"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Lista de Items */}
          <div className="py-3 divide-y divide-slate-100 max-h-64 overflow-y-auto no-scrollbar space-y-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <p className="font-medium">No hay productos en el ticket</p>
                <p className="text-[11px] mt-1 text-slate-400">Haz clic en "+ Añadir al Carrito" para comenzar.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.producto.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {item.cantidad}x
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                        {item.producto.nombre}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        S/ {item.producto.precioUnitario.toFixed(2)} c/u
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 text-sm">
                    S/ {(item.producto.precioUnitario * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Resumen de Totales */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">S/ {(totalCart / 1.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>IGV (18% inc.)</span>
              <span className="font-semibold">S/ {(totalCart - (totalCart / 1.18)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-950 pt-1 border-t border-slate-100">
              <span>Total a Cobrar</span>
              <span className="text-lg text-[#1638BF]">S/ {totalCart.toFixed(2)}</span>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-600 block mb-2">Método de Pago:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPago('EFECTIVO')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  metodoPago === 'EFECTIVO'
                    ? 'bg-[#1638BF] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('YAPE_PLIN')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  metodoPago === 'YAPE_PLIN'
                    ? 'bg-[#1638BF] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Yape/Plin</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('TARJETA')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  metodoPago === 'TARJETA'
                    ? 'bg-[#1638BF] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Botón Cobrar */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full bg-[#FF6A00] hover:bg-[#e85d00] active:scale-[0.98] disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-xl shadow-md transition flex items-center justify-center cursor-pointer mt-4"
          >
            {loading ? 'Procesando cobro...' : `COBRAR S/ ${totalCart.toFixed(2)}`}
          </button>

        </div>

      </div>

    </div>
  );
};
