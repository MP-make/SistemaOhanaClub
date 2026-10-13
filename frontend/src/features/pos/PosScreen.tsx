import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Banknote, 
  Smartphone, 
  ArrowRightLeft, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  History,
  Receipt,
  X,
  Calendar,
  Clock,
  ShoppingBag,
  LayoutGrid,
  Coffee,
  Cookie,
  Package,
  Sparkles
} from 'lucide-react';
import { Producto, CartItem, MetodoPago, Venta } from '../../types';
import { apiService } from '../../services/api';

interface PosScreenProps {
  onVentaCompletada: (venta: Venta) => void;
}

export const PosScreen: React.FC<PosScreenProps> = ({ onVentaCompletada }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<string>('todos');
  const [search, setSearch] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Estado para el historial de ventas
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historialVentas, setHistorialVentas] = useState<Venta[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Ref para el scroll horizontal de categorías
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    loadProductos();
  }, [categoria, search]);

  const loadProductos = async () => {
    const list = await apiService.getProductos(categoria, search);
    setProductos(list);
  };

  const loadHistorial = async () => {
    setLoadingHistory(true);
    try {
      const list = await apiService.getVentas();
      setHistorialVentas(list);
    } catch (err) {
      console.error('Error al cargar historial de ventas:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openHistory = () => {
    setShowHistoryModal(true);
    loadHistorial();
  };

  const addToCart = (prod: Producto) => {
    // Validar disponibilidad antes de añadir al carrito
    if (prod.stockActual <= 0) {
      alert(`El producto "${prod.nombre}" no tiene stock disponible.`);
      return;
    }
    const enCarrito = cart.find(c => c.producto.id === prod.id)?.cantidad || 0;
    if (enCarrito >= prod.stockActual) {
      alert(`No puedes añadir más unidades. Stock disponible: ${prod.stockActual}`);
      return;
    }

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
      // Recargar catálogo inmediatamente para reflejar el stock descontado en vivo
      await loadProductos();
      onVentaCompletada(venta);
    } catch (err: any) {
      alert(err.message || 'Error al procesar cobro');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    { id: 'todos', label: 'Todos' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'otros', label: 'Otros' },
  ];

  // Helper para imágenes de productos: primero toma la imagen real guardada del producto
  const getProductImage = (prod: Producto) => {
    if (prod.imagenUrl && prod.imagenUrl.trim().startsWith('http')) {
      return prod.imagenUrl.trim();
    }
    const name = (prod.nombre || '').toLowerCase();
    if (name.includes('agua')) {
      return 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('gaseosa') || name.includes('coca') || name.includes('inka')) {
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('energizante') || name.includes('monster') || name.includes('red bull')) {
      return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('isotonica') || name.includes('sporade') || name.includes('gatorade')) {
      return 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('papas') || name.includes('lays') || name.includes('doritos')) {
      return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('mani') || name.includes('frutos')) {
      return 'https://images.unsplash.com/photo-1567406899672-849646bda646?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('galletas') || name.includes('oreo') || name.includes('casino')) {
      return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=80';
    }
    if (name.includes('cerveza') || name.includes('cusqueña') || name.includes('pilsen')) {
      return 'https://images.unsplash.com/photo-1608270112445-565d774f2601?w=300&auto=format&fit=crop&q=80';
    }
    return prod.imagenUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80';
  };

  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const handlePrevProduct = () => {
    setCarouselIndex(prev => (prev > 0 ? prev - 1 : Math.max(0, productos.length - 3)));
  };

  const handleNextProduct = () => {
    setCarouselIndex(prev => (prev + 3 < productos.length ? prev + 1 : 0));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1638BF] md:bg-slate-100 select-none overflow-hidden h-[calc(100dvh-60px)] md:h-[calc(100dvh-73px)]">
      
      {/* ================= VISTA MÓVIL (< md) ================= */}
      <div className="md:hidden flex-1 flex flex-col overflow-hidden bg-white rounded-t-[32px] shadow-xs">
        {/* Cabecera Móvil Fija (Buscador + Categorías) */}
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full bg-slate-50 border border-[#2563EB]/40 text-slate-800 text-xs font-medium pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-3" />
            </div>
            <button
              type="button"
              onClick={openHistory}
              className="bg-blue-50 border border-[#2563EB] text-[#2563EB] hover:bg-blue-100 p-2.5 rounded-xl flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0"
              title="Ver ventas realizadas"
            >
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Categorías Segmentadas con Conteo */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
            {categorias.map((cat) => {
              const isActive = categoria === cat.id;
              const count = cat.id === 'todos' 
                ? productos.length 
                : productos.filter(p => (p.categoriaId || '').toLowerCase() === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoria(cat.id); setCarouselIndex(0); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0 ${
                    isActive
                      ? 'bg-[#1638BF] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zona Scrollable de Productos en Móvil */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-32">
          {/* Carrusel rápido para vista compacta */}
          {productos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {productos.map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs hover:shadow-md transition flex flex-col justify-between items-center text-center relative"
                >
                  <div className="w-full h-24 bg-slate-50/50 rounded-xl p-1.5 flex items-center justify-center relative mb-2">
                    <img
                      src={getProductImage(prod)}
                      alt={prod.nombre}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute top-1 right-1 text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                      Stock: {prod.stockActual}
                    </span>
                    <div className="absolute -bottom-2 left-1.5 bg-[#D8F600] text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-lg border border-slate-900/15 shadow-xs whitespace-nowrap">
                      S/ {prod.precioUnitario.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-center w-full min-h-[30px] flex flex-col items-center justify-center px-0.5 mt-1">
                    <span className="text-xs font-bold text-slate-900 leading-tight block truncate w-full">
                      {prod.nombre}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 leading-tight block truncate w-full">
                      {prod.presentacion || 'unidad'}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(prod)}
                    className="w-full bg-[#1638BF] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-2 rounded-xl shadow-xs mt-2 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>+ Añadir</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              No se encontraron productos en esta categoría.
            </div>
          )}

          {/* Ticket Venta Móvil */}
          <div id="ticket-resumen" className="mt-5 border border-slate-200 rounded-2xl p-3.5 bg-slate-50/80 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ChevronDown className="w-4 h-4 text-[#1638BF]" />
                <span>Ticket de Venta ({totalCount})</span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>

            <div className="py-2 divide-y divide-slate-100 max-h-36 overflow-y-auto no-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  El ticket está vacío. Selecciona productos arriba.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.producto.id} className="py-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#1638BF] bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                        {item.cantidad}x
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[130px]">
                        {item.producto.nombre}
                      </span>
                    </div>
                    <span className="font-bold text-slate-950">
                      S/ {(item.producto.precioUnitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Medios de Pago Móvil */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200 mb-3">
              <button
                type="button"
                onClick={() => setMetodoPago('EFECTIVO')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                  metodoPago === 'EFECTIVO'
                    ? 'bg-[#1638BF] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <Banknote className="w-3.5 h-3.5 shrink-0" />
                <span>Efectivo</span>
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('YAPE')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                  metodoPago === 'YAPE'
                    ? 'bg-[#742284] text-white shadow-sm'
                    : 'bg-white border border-purple-200 text-[#742284]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Yape</span>
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('PLIN')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                  metodoPago === 'PLIN'
                    ? 'bg-[#00B4D8] text-white shadow-sm'
                    : 'bg-white border border-cyan-200 text-[#0077B6]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Plin</span>
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('TRANSFERENCIA')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                  metodoPago === 'TRANSFERENCIA'
                    ? 'bg-[#1638BF] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Transf.</span>
              </button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full bg-[#FF6A00] hover:bg-[#e85d00] active:scale-[0.98] disabled:opacity-50 text-white font-black text-sm py-3 rounded-xl shadow-md transition flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Procesando...' : `Cobrar S/ ${totalCart.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* ================= VISTA TABLET & DESKTOP (>= md) ================= */}
      {/* Contenedor Fijo: Ocupa toda la altura disponible y nunca pierde la barra superior ni el ticket */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden p-4 lg:p-6 max-w-[1700px] w-full mx-auto">
        
        {/* Barra Superior Estática / Fija: Buscador + Selector de Categorías + Ventas Realizadas */}
        <div className="shrink-0 bg-white rounded-2xl p-4 mb-4 shadow-xs border border-slate-200/90 flex flex-col lg:flex-row gap-3.5 items-center justify-between">
          
          {/* Buscador Rápido de Productos */}
          <div className="relative w-full lg:w-80 shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Selector Práctico y Ergonómico de Categorías (Texto limpio, badges con conteo y scroll fluido) */}
          <div className="flex-1 min-w-0 max-w-full overflow-hidden flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 relative">
            {/* Botón flecha izquierda para desplazar */}
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="w-7 h-7 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Contenedor scrolleable con touch, mouse wheel y flechas */}
            <div 
              ref={categoriesScrollRef}
              className="flex gap-2 overflow-x-auto no-scrollbar w-full items-center py-0.5 px-1 scroll-smooth"
            >
              {categorias.map((cat) => {
                const isActive = categoria === cat.id;
                const count = cat.id === 'todos' 
                  ? productos.length 
                  : productos.filter(p => (p.categoriaId || '').toLowerCase() === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0 ${
                      isActive
                        ? 'bg-[#1638BF] text-white shadow-sm ring-2 ring-[#1638BF]/30'
                        : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200/60 hover:text-slate-950 shadow-2xs'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Botón flecha derecha para desplazar */}
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="w-7 h-7 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs active:scale-95 transition cursor-pointer"
              title="Desplazar a la derecha"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Botón Ver Ventas Realizadas (Historial de Cobros) */}
          <button
            type="button"
            onClick={openHistory}
            className="bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-95 text-[#1638BF] font-black text-xs px-4 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer shrink-0 ml-auto lg:ml-0"
            title="Consultar historial de ventas y comprobantes"
          >
            <History className="w-4 h-4 text-[#1638BF]" />
            <span>Ventas Realizadas</span>
          </button>
        </div>

        {/* Cuerpo Principal Dividido: Catálogo con Scroll Propio (Izquierda) + Venta Actual Fija (Derecha) */}
        <div className="flex-1 flex gap-5 overflow-hidden items-stretch">
          
          {/* COLUMNA IZQUIERDA: Catálogo de Productos (ÚNICA ZONA CON SCROLL) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white/50 rounded-2xl border border-slate-200/80 p-4">
            
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Catálogo de Productos
                </span>
                <span className="bg-blue-100 text-[#1638BF] font-black text-xs px-2.5 py-0.5 rounded-full">
                  {productos.length} disponible(s)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Desplaza libremente para ver todos los productos
              </span>
            </div>

            {/* Grid de Productos con Scroll Exclusivo */}
            <div className="flex-1 overflow-y-auto pr-1">
              {productos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No hay productos en esta categoría</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra categoría o borrando la búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                  {productos.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white border border-slate-200/90 hover:border-[#1638BF]/60 rounded-2xl p-4 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between items-center text-center group"
                    >
                      {/* Imagen del Producto */}
                      <div className="w-full h-32 flex items-center justify-center overflow-hidden mb-2 relative bg-slate-50/60 rounded-xl p-2">
                        <img
                          src={getProductImage(prod)}
                          alt={prod.nombre}
                          className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition"
                        />
                        <span className="absolute top-1.5 right-1.5 text-[10px] bg-white/90 backdrop-blur-xs text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                          Stock: {prod.stockActual}
                        </span>
                      </div>

                      {/* Badge de Precio */}
                      <div className="bg-[#D8F600] text-slate-950 font-black text-xs px-3 py-1 rounded-md shadow-2xs mb-1 border border-slate-900/10">
                        S/ {prod.precioUnitario.toFixed(2)}
                      </div>

                      {/* Nombre y presentación */}
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
              )}
            </div>

          </div>

          {/* COLUMNA DERECHA: Caja de Venta Actual (COMPLETAMENTE ESTÁTICA / FIJA) */}
          <div className="w-80 lg:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 flex flex-col shrink-0 h-full overflow-hidden">
            
            {/* Encabezado Fijo del Ticket */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900">Venta Actual</h3>
                <p className="text-xs text-slate-500 font-medium">{totalCount} artículo(s) seleccionados</p>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-black text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  title="Vaciar ticket"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Lista Interna con Scroll Exclusivo para Items del Ticket */}
            <div className="flex-1 py-3 divide-y divide-slate-100 overflow-y-auto pr-1 space-y-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-xs text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-2 text-slate-300">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-600">Ticket Vacío</p>
                  <p className="text-[11px] mt-1 text-slate-400 max-w-[200px]">
                    Haz clic en "+ Añadir al Carrito" de cualquier producto para registrar la venta.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.producto.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#1638BF] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg text-xs">
                        {item.cantidad}x
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[130px] lg:max-w-[160px]">
                          {item.producto.nombre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          S/ {item.producto.precioUnitario.toFixed(2)} c/u
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-950 text-sm">
                      S/ {(item.producto.precioUnitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Resumen Fijo de Totales e Impuestos */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 shrink-0 bg-white">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">S/ {(totalCart / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>IGV (18% inc.)</span>
                <span className="font-semibold">S/ {(totalCart - (totalCart / 1.18)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Total a Cobrar</span>
                <span className="text-xl text-[#1638BF]">S/ {totalCart.toFixed(2)}</span>
              </div>
            </div>

            {/* Métodos de Pago Fijos */}
            <div className="mt-3.5 shrink-0">
              <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wide">
                Medio de Pago:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPago('EFECTIVO')}
                  className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    metodoPago === 'EFECTIVO'
                      ? 'bg-[#1638BF] text-white shadow-sm ring-2 ring-[#1638BF]/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('YAPE')}
                  className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    metodoPago === 'YAPE'
                      ? 'bg-[#742284] text-white shadow-sm ring-2 ring-[#742284]/30'
                      : 'bg-purple-50 text-[#742284] border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Yape</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('PLIN')}
                  className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    metodoPago === 'PLIN'
                      ? 'bg-[#00B4D8] text-white shadow-sm ring-2 ring-[#00B4D8]/30'
                      : 'bg-cyan-50 text-[#0077B6] border border-cyan-200 hover:bg-cyan-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Plin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('TRANSFERENCIA')}
                  className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    metodoPago === 'TRANSFERENCIA'
                      ? 'bg-[#1638BF] text-white shadow-sm ring-2 ring-[#1638BF]/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transferencia</span>
                </button>
              </div>
            </div>

            {/* Botón Naranja Fijo de Cobro */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full bg-[#FF6A00] hover:bg-[#e85d00] active:scale-[0.98] disabled:opacity-40 text-white font-black text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center cursor-pointer mt-4 shrink-0"
            >
              {loading ? 'Procesando cobro...' : `COBRAR S/ ${totalCart.toFixed(2)}`}
            </button>

          </div>

        </div>

      </div>

      {/* ================= MODAL DE VENTAS REALIZADAS (HISTORIAL Y COMPROBANTES) ================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 relative max-h-[85vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-[#1638BF] rounded-2xl flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Ventas Realizadas en Minimarket
                  </h3>
                  <p className="text-xs text-slate-500">
                    Historial de tickets cobrados y detalle de artículos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Ventas */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
              {loadingHistory ? (
                <div className="text-center py-12 text-xs font-bold text-slate-400">
                  Cargando ventas desde la base de datos...
                </div>
              ) : historialVentas.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  No hay ventas registradas aún.
                </div>
              ) : (
                historialVentas.map((v) => (
                  <div 
                    key={v.id} 
                    className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50 hover:bg-white hover:border-blue-400 transition shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#1638BF] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {v.numeroComprobante}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                          {v.metodoPago}
                        </span>
                      </div>
                      <span className="text-base font-black text-slate-950">
                        S/ {v.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(v.fechaHora).toLocaleDateString('es-PE')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(v.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Detalle de Artículos */}
                    {v.items && v.items.length > 0 && (
                      <div className="border-t border-slate-200/60 pt-2 space-y-1">
                        {v.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-700">
                            <span className="font-medium">
                              <span className="font-bold text-slate-900">{it.cantidad}x</span> {it.nombre}
                            </span>
                            <span className="font-semibold text-slate-900">
                              S/ {it.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Total registradas: {historialVentas.length} tickets</span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
