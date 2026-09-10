import React, { useState, useEffect } from 'react';
import { Search, Plus, MinusCircle, PlusCircle } from 'lucide-react';
import { Producto } from '../../types';
import { apiService } from '../../services/api';

interface InventarioScreenProps {
  onNewReserva: () => void;
}

export const InventarioScreen: React.FC<InventarioScreenProps> = ({ onNewReserva }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<string>('bebidas');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    loadProductos();
  }, [categoria, search]);

  const loadProductos = async () => {
    const list = await apiService.getProductos(categoria, search);
    setProductos(list);
  };

  const handleAdjustStock = async (productoId: string, delta: number) => {
    await apiService.updateStock(productoId, delta);
    loadProductos();
  };

  const categorias = [
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'otros', label: 'Otros' },
  ];

  // Helper para imágenes de productos de alta resolución
  const getProductImage = (prod: Producto) => {
    const name = prod.nombre.toLowerCase();
    if (name.includes('agua')) {
      return 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('gaseosa')) {
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('energizante') || name.includes('energicente')) {
      return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('isotonica')) {
      return 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('papas')) {
      return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('mani')) {
      return 'https://images.unsplash.com/photo-1567406899672-849646bda646?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('galletas')) {
      return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=150&auto=format&fit=crop&q=80';
    }
    return prod.imagenUrl;
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

            {/* Pestañas de categorías */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
              {categorias.map((cat) => {
                const isActive = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
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

            {/* Tabla de Inventario de Figma 1:1 */}
            <div className="border border-[#2563EB] rounded-2xl overflow-hidden bg-white shadow-xs mb-4">
              
              {/* Encabezado de la tabla */}
              <div className="grid grid-cols-12 bg-white px-3 py-2 text-xs font-bold text-slate-900 border-b border-[#2563EB]">
                <span className="col-span-5 text-left">Producto</span>
                <span className="col-span-2 text-center">Stock</span>
                <span className="col-span-5 text-left pl-2">Estado</span>
              </div>

              {/* Filas de la tabla */}
              <div className="divide-y divide-slate-200">
                {productos.map((prod) => {
                  const isStockBajo = prod.estado === 'Stock Bajo' || prod.stockActual < 10;
                  return (
                    <div
                      key={prod.id}
                      className="grid grid-cols-12 px-3 py-2 items-center text-xs transition hover:bg-slate-50"
                    >
                      {/* Producto */}
                      <div className="col-span-5 flex items-center gap-2 pr-1">
                        <div className="w-7 h-9 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={getProductImage(prod)}
                            alt={prod.nombre}
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                        <span className="font-bold text-slate-900 truncate text-[11px] leading-tight">
                          {prod.nombre} {prod.presentacion && !['bolsa', 'paquete'].includes(prod.presentacion) ? prod.presentacion : ''}
                        </span>
                      </div>

                      {/* Stock */}
                      <div className="col-span-2 text-center font-bold text-slate-900 text-xs">
                        {prod.stockActual}
                      </div>

                      {/* Estado y Controles (+ / -) */}
                      <div className="col-span-5 flex items-center justify-between pl-2">
                        <span
                          className={`text-[11px] font-bold ${
                            isStockBajo ? 'text-[#DC2626]' : 'text-[#16A34A]'
                          }`}
                        >
                          {isStockBajo ? 'Stock Bajo' : 'Disponible'}
                        </span>

                        <div className="flex items-center gap-1.5 text-slate-900">
                          <button
                            onClick={() => handleAdjustStock(prod.id, -1)}
                            className="hover:text-red-600 active:scale-95 transition cursor-pointer"
                            title="Disminuir"
                          >
                            <MinusCircle className="w-[18px] h-[18px] stroke-[2]" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(prod.id, 1)}
                            className="hover:text-green-600 active:scale-95 transition cursor-pointer"
                            title="Aumentar"
                          >
                            <PlusCircle className="w-[18px] h-[18px] stroke-[2]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Botón "+ Nueva reserva" */}
          <div className="pt-2">
            <button
              onClick={onNewReserva}
              className="w-full bg-[#2442E7] hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-[15px] py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Nueva reserva</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= VISTA DESKTOP & LAPTOP (>= md) - TABLA DE GESTIÓN COMPLETA ================= */}
      <div className="hidden md:flex flex-col flex-1 p-5 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Ítems</span>
            <span className="text-2xl font-black text-slate-900">{productos.length} Productos</span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Stock Disponible</span>
            <span className="text-2xl font-black text-emerald-600">
              {productos.filter(p => p.stockActual >= 10).length} en Rango Óptimo
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Alerta Stock Bajo</span>
            <span className="text-2xl font-black text-amber-600">
              {productos.filter(p => p.stockActual < 10).length} Requieren Reposición
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Valoración en Stock</span>
            <span className="text-2xl font-black text-[#1638BF]">
              S/ {productos.reduce((acc, p) => acc + (p.precioUnitario * p.stockActual), 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre o presentación..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex gap-2">
            {categorias.map((cat) => {
              const isActive = categoria === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Producto</th>
                <th className="py-3.5 px-4 text-center">Categoría</th>
                <th className="py-3.5 px-4 text-right">Precio Venta</th>
                <th className="py-3.5 px-4 text-center">Stock Actual</th>
                <th className="py-3.5 px-4 text-center">Mínimo</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-5 text-center">Ajuste Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {productos.map((prod) => {
                const isStockBajo = prod.estado === 'Stock Bajo' || prod.stockActual < 10;
                return (
                  <tr key={prod.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={getProductImage(prod)}
                          alt={prod.nombre}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{prod.nombre}</span>
                        <span className="text-xs text-slate-500">{prod.presentacion || 'Unidad'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {prod.categoriaId}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      S/ {prod.precioUnitario.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center font-black text-slate-900 text-base">
                      {prod.stockActual}
                    </td>

                    <td className="py-3 px-4 text-center font-medium text-slate-500 text-xs">
                      10 uds
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          isStockBajo
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isStockBajo ? 'Stock Bajo' : 'Disponible'}
                      </span>
                    </td>

                    <td className="py-3 px-5 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleAdjustStock(prod.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 flex items-center justify-center font-black shadow-xs transition cursor-pointer"
                          title="Restar 1 unidad"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs px-1 text-slate-800">±1</span>
                        <button
                          onClick={() => handleAdjustStock(prod.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 flex items-center justify-center font-black shadow-xs transition cursor-pointer"
                          title="Sumar 1 unidad"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
