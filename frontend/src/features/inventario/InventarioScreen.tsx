import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  MinusCircle, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  PackagePlus, 
  X, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  DollarSign, 
  Boxes, 
  Layers, 
  Image as ImageIcon 
} from 'lucide-react';
import { Producto } from '../../types';
import { apiService } from '../../services/api';

interface InventarioScreenProps {
  onNewReserva: () => void;
}

interface ProductFormData {
  nombre: string;
  presentacion: string;
  categoriaId: 'bebidas' | 'snacks' | 'galletas' | 'otros';
  precioUnitario: string;
  stockActual: string;
  stockMinimo: string;
  imagenUrl: string;
}

const INITIAL_FORM: ProductFormData = {
  nombre: '',
  presentacion: '',
  categoriaId: 'bebidas',
  precioUnitario: '',
  stockActual: '',
  stockMinimo: '10',
  imagenUrl: ''
};

export const InventarioScreen: React.FC<InventarioScreenProps> = ({ onNewReserva }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<string>('todos');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Modales y formularios
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmProd, setDeleteConfirmProd] = useState<Producto | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadProductos();
  }, [categoria, search]);

  const loadProductos = async () => {
    setLoading(true);
    try {
      const list = await apiService.getProductos(categoria, search);
      setProductos(list);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAdjustStock = async (productoId: string, delta: number) => {
    // Actualización inmediata en UI (respuesta instantánea al toque en móvil y desktop)
    setProductos(prev => prev.map(p => {
      if (p.id === productoId) {
        const newStock = Math.max(0, p.stockActual + delta);
        return {
          ...p,
          stockActual: newStock,
          estado: newStock <= (p.stockMinimo || 10) ? 'Stock Bajo' : 'Disponible'
        };
      }
      return p;
    }));

    try {
      await apiService.updateStock(productoId, delta);
    } catch (err: any) {
      console.error('Error al sincronizar stock:', err);
      showToast(err.message || 'Error al ajustar stock', 'error');
      loadProductos();
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Producto) => {
    setEditingProduct(prod);
    setFormData({
      nombre: prod.nombre,
      presentacion: prod.presentacion || '',
      categoriaId: (prod.categoriaId as any) || 'bebidas',
      precioUnitario: prod.precioUnitario.toString(),
      stockActual: prod.stockActual.toString(),
      stockMinimo: (prod.stockMinimo || 10).toString(),
      imagenUrl: prod.imagenUrl || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nombre = formData.nombre.trim();
    const precio = parseFloat(formData.precioUnitario);
    const stock = parseInt(formData.stockActual, 10);
    const stockMin = parseInt(formData.stockMinimo, 10) || 10;

    if (!nombre) {
      setFormError('Ingresa el nombre del producto.');
      return;
    }
    if (isNaN(precio) || precio < 0) {
      setFormError('Ingresa un precio de venta válido.');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setFormError('Ingresa una cantidad de stock válida.');
      return;
    }

    try {
      if (editingProduct) {
        // Actualizar producto existente
        await apiService.updateProducto(editingProduct.id, {
          nombre,
          presentacion: formData.presentacion.trim(),
          categoriaId: formData.categoriaId,
          precioUnitario: precio,
          stockActual: stock,
          stockMinimo: stockMin,
          imagenUrl: formData.imagenUrl.trim()
        });
        showToast(`Producto "${nombre}" actualizado correctamente.`);
      } else {
        // Crear nuevo producto
        await apiService.createProducto({
          nombre,
          presentacion: formData.presentacion.trim(),
          categoriaId: formData.categoriaId,
          precioUnitario: precio,
          stockActual: stock,
          stockMinimo: stockMin,
          imagenUrl: formData.imagenUrl.trim()
        });
        showToast(`Producto "${nombre}" agregado al inventario.`);
      }

      setIsModalOpen(false);
      loadProductos();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el producto.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProd) return;
    try {
      await apiService.deleteProducto(deleteConfirmProd.id);
      showToast(`Producto "${deleteConfirmProd.nombre}" eliminado del inventario.`);
      setDeleteConfirmProd(null);
      loadProductos();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar el producto.', 'error');
    }
  };

  const categorias = [
    { id: 'todos', label: 'Todos' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'otros', label: 'Otros' },
  ];

  // Helper para imágenes de productos de alta resolución
  const getProductImage = (prod: Producto) => {
    if (prod.imagenUrl && prod.imagenUrl.startsWith('http')) {
      return prod.imagenUrl;
    }
    const name = prod.nombre.toLowerCase();
    if (name.includes('agua')) {
      return 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('gaseosa') || name.includes('cola') || name.includes('inka')) {
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('energizante') || name.includes('monster') || name.includes('red bull')) {
      return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('isotonica') || name.includes('sporade') || name.includes('gatorade')) {
      return 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('papas') || name.includes('lays') || name.includes('doritos')) {
      return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('mani') || name.includes('frutos')) {
      return 'https://images.unsplash.com/photo-1567406899672-849646bda646?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('galletas') || name.includes('oreo') || name.includes('morochas')) {
      return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=150&auto=format&fit=crop&q=80';
    }
    if (name.includes('cerveza') || name.includes('cusqueña') || name.includes('pilsen')) {
      return 'https://images.unsplash.com/photo-1608270112445-565d774f2601?w=150&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1638BF] md:bg-slate-50 select-none relative">
      
      {/* ================= VISTA MÓVIL (< md) - FIEL A FIGMA ================= */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex-1 bg-white rounded-t-[32px] px-4 pt-5 pb-24 flex flex-col justify-between shadow-xs border-t border-slate-100">
          <div>
            
            {/* Cabecera Móvil con Botón + Producto */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Inventario de Artículos
              </span>
              <button
                onClick={openCreateModal}
                className="bg-[#1638BF] hover:bg-blue-700 active:scale-95 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Nuevo Producto</span>
              </button>
            </div>

            {/* Buscador de productos */}
            <div className="relative mb-3.5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
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

            {/* Tabla de Inventario Móvil */}
            <div className="border border-[#2563EB] rounded-2xl overflow-hidden bg-white shadow-xs mb-4">
              
              {/* Encabezado de la tabla */}
              <div className="grid grid-cols-12 bg-white px-3 py-2 text-xs font-bold text-slate-900 border-b border-[#2563EB]">
                <span className="col-span-5 text-left">Producto</span>
                <span className="col-span-2 text-center">Stock</span>
                <span className="col-span-5 text-right pr-1">Acciones</span>
              </div>

              {/* Filas de la tabla */}
              <div className="divide-y divide-slate-200">
                {productos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    No hay productos en esta categoría.
                  </div>
                ) : (
                  productos.map((prod) => {
                    const isStockBajo = prod.estado === 'Stock Bajo' || prod.stockActual <= (prod.stockMinimo || 10);
                    return (
                      <div
                        key={prod.id}
                        className="grid grid-cols-12 px-3 py-2.5 items-center text-xs transition hover:bg-slate-50"
                      >
                        {/* Producto & Clic para editar */}
                        <div 
                          onClick={() => openEditModal(prod)}
                          className="col-span-5 flex items-center gap-2 pr-1 cursor-pointer group"
                        >
                          <div className="w-8 h-9 flex items-center justify-center overflow-hidden shrink-0 bg-slate-50 rounded">
                            <img
                              src={getProductImage(prod)}
                              alt={prod.nombre}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold text-slate-900 truncate block text-[11px] leading-tight group-hover:text-blue-600">
                              {prod.nombre}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              S/ {prod.precioUnitario.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="col-span-2 text-center font-black text-slate-900 text-xs">
                          {prod.stockActual}
                          <span className={`block text-[9px] font-bold ${isStockBajo ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isStockBajo ? 'Bajo' : 'OK'}
                          </span>
                        </div>

                        {/* Acciones: Editar + Ajuste Rápido */}
                        <div className="col-span-5 flex items-center justify-end gap-1.5">
                          {/* Ajuste ±1 */}
                          <div className="flex items-center gap-1 bg-slate-100 px-1 py-0.5 rounded-lg border border-slate-200">
                            <button
                              onClick={() => handleAdjustStock(prod.id, -1)}
                              className="text-slate-600 hover:text-red-600 active:scale-90 transition cursor-pointer p-0.5"
                              title="Restar"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAdjustStock(prod.id, 1)}
                              className="text-slate-600 hover:text-green-600 active:scale-90 transition cursor-pointer p-0.5"
                              title="Sumar"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Botón Editar */}
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 active:scale-90 rounded-lg transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

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
              {productos.filter(p => p.stockActual > (p.stockMinimo || 10)).length} en Rango Óptimo
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Alerta Stock Bajo</span>
            <span className="text-2xl font-black text-amber-600">
              {productos.filter(p => p.stockActual <= (p.stockMinimo || 10)).length} Requieren Reposición
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Valoración en Stock</span>
            <span className="text-2xl font-black text-[#1638BF]">
              S/ {productos.reduce((acc, p) => acc + (p.precioUnitario * p.stockActual), 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Toolbar & Filters & Botón Nuevo Producto */}
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

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex gap-1.5 overflow-x-auto">
              {categorias.map((cat) => {
                const isActive = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#1638BF] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* BOTÓN PROMINENTE: + NUEVO PRODUCTO */}
            <button
              onClick={openCreateModal}
              className="bg-[#1638BF] hover:bg-blue-700 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer shrink-0 border border-blue-600"
            >
              <PackagePlus className="w-4 h-4 text-[#D8F600]" />
              <span>+ Nuevo Producto</span>
            </button>
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
                <th className="py-3.5 px-4 text-center">Ajuste Rápido</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium text-sm">
                    No se encontraron productos registrados. Haz clic en <strong>+ Nuevo Producto</strong> para agregar uno.
                  </td>
                </tr>
              ) : (
                productos.map((prod) => {
                  const isStockBajo = prod.estado === 'Stock Bajo' || prod.stockActual <= (prod.stockMinimo || 10);
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
                        {prod.stockMinimo || 10} uds
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

                      <td className="py-3 px-4 text-center">
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

                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition cursor-pointer"
                            title="Editar datos del producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmProd(prod)}
                            className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ================= MODAL: CREAR / EDITAR PRODUCTO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header del modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-100 text-[#1638BF] rounded-2xl flex items-center justify-center shadow-xs">
                  {editingProduct ? <Edit2 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingProduct ? 'Modifica los datos del artículo en inventario' : 'Registra un nuevo producto para el POS y stock'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error de validación */}
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nombre del Producto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Producto *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    placeholder="ej: Sporade Blueberry, Cerveza Pilsen, Papas Lays..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white"
                  />
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Presentación & Categoría en 2 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Presentación / Formato
                  </label>
                  <input
                    type="text"
                    value={formData.presentacion}
                    onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                    placeholder="ej: 500ml, Lata 473ml, Bolsa..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoriaId}
                    onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white cursor-pointer"
                  >
                    <option value="bebidas">Bebidas</option>
                    <option value="snacks">Snacks</option>
                    <option value="galletas">Galletas</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              {/* Precios y Stock en 3 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio Venta (S/) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={formData.precioUnitario}
                      onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                      required
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold pl-8 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white"
                    />
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Actual *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.stockActual}
                      onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
                      required
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold pl-8 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white"
                    />
                    <Boxes className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                    placeholder="10"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white"
                  />
                </div>
              </div>

              {/* URL de Imagen (Opcional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL de Imagen (Opcional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.imagenUrl}
                    onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                    placeholder="https://ejemplo.com/foto-producto.jpg (o déjalo vacío para ícono automático)"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1638BF] focus:bg-white"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1638BF] hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#D8F600]" />
                  <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ================= */}
      {deleteConfirmProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">¿Eliminar producto?</h3>
              <p className="text-xs text-slate-500 mt-1">
                ¿Estás seguro de quitar <strong>"{deleteConfirmProd.nombre}"</strong> del inventario?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmProd(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFICACIÓN TOAST ================= */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 backdrop-blur-md animate-fadeIn ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900/95 text-white border border-emerald-500/40' 
            : 'bg-rose-900/95 text-white border border-rose-500/40'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#D8F600] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

    </div>
  );
};

