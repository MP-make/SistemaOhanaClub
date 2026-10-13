import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  ShoppingCart, 
  DollarSign, 
  Filter, 
  Download, 
  Printer, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Search, 
  ChevronDown, 
  FileSpreadsheet, 
  ArrowUpRight,
  RefreshCw,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Reserva, Venta, MetodoPago, ZonaTipo } from '../../types';

export const ReportesScreen: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<'ventas' | 'reservas' | 'consolidado'>('consolidado');
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Filtros globales
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('TODOS');
  const [filtroZona, setFiltroZona] = useState<string>('TODAS');
  const [busquedaTexto, setBusquedaTexto] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [vList, rList] = await Promise.all([
        apiService.getVentas(),
        apiService.getReservas()
      ]);
      setVentas(vList);
      setReservas(rList);
    } catch (e) {
      console.error('Error al cargar reportes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Formateador de moneda
  const formatSoles = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatMetodoNombre = (m?: string) => {
    if (!m) return 'Efectivo';
    if (m === 'YAPE') return 'Yape';
    if (m === 'PLIN') return 'Plin';
    if (m === 'YAPE_PLIN') return 'Yape / Plin';
    if (m === 'TRANSFERENCIA') return 'Transferencia';
    if (m === 'TARJETA') return 'Tarjeta';
    if (m === 'EFECTIVO') return 'Efectivo';
    return m;
  };

  // Filtrado de Ventas POS
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      // Filtro fecha
      const fechaVenta = v.fechaHora ? v.fechaHora.slice(0, 10) : '';
      if (filtroFechaDesde && fechaVenta < filtroFechaDesde) return false;
      if (filtroFechaHasta && fechaVenta > filtroFechaHasta) return false;

      // Filtro método
      if (filtroMetodo !== 'TODOS') {
        if (filtroMetodo === 'YAPE_PLIN' && v.metodoPago !== 'YAPE' && v.metodoPago !== 'PLIN' && v.metodoPago !== 'YAPE_PLIN') return false;
        if (filtroMetodo !== 'YAPE_PLIN' && v.metodoPago !== filtroMetodo) return false;
      }

      // Búsqueda texto (comprobante o nombre de producto dentro de items)
      if (busquedaTexto.trim()) {
        const query = busquedaTexto.toLowerCase();
        const coincideComprobante = v.numeroComprobante.toLowerCase().includes(query);
        const coincideProducto = v.items?.some(i => i.nombre.toLowerCase().includes(query));
        if (!coincideComprobante && !coincideProducto) return false;
      }

      return true;
    });
  }, [ventas, filtroFechaDesde, filtroFechaHasta, filtroMetodo, busquedaTexto]);

  // Filtrado de Reservas
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(r => {
      // Filtro fecha
      if (filtroFechaDesde && r.fecha < filtroFechaDesde) return false;
      if (filtroFechaHasta && r.fecha > filtroFechaHasta) return false;

      // Filtro método de pago
      if (filtroMetodo !== 'TODOS') {
        const met = r.metodoPago || 'EFECTIVO';
        if (filtroMetodo === 'YAPE_PLIN' && met !== 'YAPE' && met !== 'PLIN' && met !== 'YAPE_PLIN') return false;
        if (filtroMetodo !== 'YAPE_PLIN' && met !== filtroMetodo) return false;
      }

      // Filtro Zona
      if (filtroZona !== 'TODAS' && r.zona !== filtroZona) return false;

      // Búsqueda por cliente o tipo de evento
      if (busquedaTexto.trim()) {
        const query = busquedaTexto.toLowerCase();
        const coincideCliente = r.clienteNombre.toLowerCase().includes(query);
        const coincideEvento = (r.tipoEvento || '').toLowerCase().includes(query);
        const coincideTelf = (r.clienteTelefono || '').toLowerCase().includes(query);
        if (!coincideCliente && !coincideEvento && !coincideTelf) return false;
      }

      return true;
    });
  }, [reservas, filtroFechaDesde, filtroFechaHasta, filtroMetodo, filtroZona, busquedaTexto]);

  // Cálculos y Métricas
  const totalVentasMonto = useMemo(() => {
    return ventasFiltradas.reduce((acc, v) => acc + (v.total || 0), 0);
  }, [ventasFiltradas]);

  const totalReservasMonto = useMemo(() => {
    return reservasFiltradas.reduce((acc, r) => acc + (r.adelanto || 0), 0);
  }, [reservasFiltradas]);

  const totalReservasPactado = useMemo(() => {
    return reservasFiltradas.reduce((acc, r) => acc + (r.montoTotal || 0), 0);
  }, [reservasFiltradas]);

  const totalSaldosPendientes = useMemo(() => {
    return reservasFiltradas.reduce((acc, r) => acc + (r.saldoPendiente || 0), 0);
  }, [reservasFiltradas]);

  const granTotalIngresos = totalVentasMonto + totalReservasMonto;

  // Desglose de Métodos de Pago (Consolidado)
  const metodosDesglose = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {
      EFECTIVO: { total: 0, count: 0 },
      YAPE: { total: 0, count: 0 },
      PLIN: { total: 0, count: 0 },
      TRANSFERENCIA: { total: 0, count: 0 },
      TARJETA: { total: 0, count: 0 }
    };

    ventasFiltradas.forEach(v => {
      const met = v.metodoPago === 'YAPE_PLIN' ? 'YAPE' : (v.metodoPago || 'EFECTIVO');
      if (!stats[met]) stats[met] = { total: 0, count: 0 };
      stats[met].total += v.total || 0;
      stats[met].count += 1;
    });

    reservasFiltradas.forEach(r => {
      const met = r.metodoPago === 'YAPE_PLIN' ? 'YAPE' : (r.metodoPago || 'EFECTIVO');
      if (!stats[met]) stats[met] = { total: 0, count: 0 };
      stats[met].total += r.adelanto || 0;
      stats[met].count += 1;
    });

    return stats;
  }, [ventasFiltradas, reservasFiltradas]);

  // Desglose por Espacio / Zona
  const zonaDesglose = useMemo(() => {
    let canchaMonto = 0;
    let canchaCount = 0;
    let eventosMonto = 0;
    let eventosCount = 0;

    reservasFiltradas.forEach(r => {
      if (r.zona === 'CANCHA') {
        canchaMonto += (r.adelanto || 0);
        canchaCount += 1;
      } else {
        eventosMonto += (r.adelanto || 0);
        eventosCount += 1;
      }
    });

    return { canchaMonto, canchaCount, eventosMonto, eventosCount };
  }, [reservasFiltradas]);

  // Ranking de Productos más vendidos en Minimarket
  const topProductos = useMemo(() => {
    const map: Record<string, { nombre: string; cantidad: number; total: number }> = {};
    ventasFiltradas.forEach(v => {
      v.items?.forEach(i => {
        const id = i.productoId || i.nombre;
        if (!map[id]) {
          map[id] = { nombre: i.nombre, cantidad: 0, total: 0 };
        }
        map[id].cantidad += i.cantidad;
        map[id].total += i.subtotal;
      });
    });

    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [ventasFiltradas]);

  // Exportar a CSV simple
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (tabActiva === 'ventas') {
      csvContent += 'Comprobante,Fecha,Metodo_Pago,Items_Vendidos,Total\n';
      ventasFiltradas.forEach(v => {
        const items = (v.items || []).map(i => `${i.cantidad}x ${i.nombre}`).join(' | ');
        csvContent += `"${v.numeroComprobante}","${v.fechaHora}","${v.metodoPago}","${items}",${v.total}\n`;
      });
    } else {
      csvContent += 'ID,Zona,Cliente,Telefono,Fecha,Horario,Tipo_Tarifa,Total,Cobrado,Saldo_Pendiente,Estado,Metodo\n';
      reservasFiltradas.forEach(r => {
        csvContent += `"${r.id}","${r.zona}","${r.clienteNombre}","${r.clienteTelefono || ''}","${r.fecha}","${r.horaInicio}-${r.horaFin}","${r.tipoTarifa}",${r.montoTotal},${r.adelanto},${r.saldoPendiente},"${r.estado}","${r.metodoPago || 'EFECTIVO'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ohana_${tabActiva}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen select-none pb-24 md:pb-12">
      
      {/* Contenedor Superior / Encabezado */}
      <div className="bg-white border-b border-slate-200 shadow-2xs px-4 md:px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100 text-[#1638BF]">
                <BarChart3 className="w-6 h-6 stroke-[2.5]" />
              </span>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Centro de Reportes y Análisis
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  Auditoría completa de ventas de minimarket, reservas de cancha y eventos
                </p>
              </div>
            </div>
          </div>

          {/* Acciones de exportar e imprimir */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer active:scale-95"
              title="Refrescar información"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1638BF]' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (CSV)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-[#1638BF] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D8F600]" />
              <span>Imprimir Reporte</span>
            </button>
          </div>
        </div>

        {/* Barra de Pestañas (Consolidado / Minimarket POS / Reservas de Espacios) */}
        <div className="max-w-[1600px] mx-auto mt-6 flex gap-2 border-b border-slate-100 pb-0.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTabActiva('consolidado')}
            className={`pb-3 px-4 text-xs md:text-sm font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              tabActiva === 'consolidado'
                ? 'border-[#1638BF] text-[#1638BF]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Balance Consolidado</span>
          </button>

          <button
            onClick={() => setTabActiva('ventas')}
            className={`pb-3 px-4 text-xs md:text-sm font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              tabActiva === 'ventas'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Ventas Minimarket ({ventasFiltradas.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('reservas')}
            className={`pb-3 px-4 text-xs md:text-sm font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              tabActiva === 'reservas'
                ? 'border-[#EA580C] text-[#EA580C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Reservas y Alquileres ({reservasFiltradas.length})</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros Interactivos */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, comprobante, producto..."
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Desde */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600">
              <span className="font-bold text-[11px] text-slate-400">Desde:</span>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none text-xs cursor-pointer"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600">
              <span className="font-bold text-[11px] text-slate-400">Hasta:</span>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none text-xs cursor-pointer"
              />
            </div>

            {/* Filtro Método de Pago */}
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="bg-slate-50 border border-slate-200 font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Método: Todos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA">Tarjeta</option>
            </select>

            {/* Filtro Zona (solo relevante en Reservas y Consolidado) */}
            {tabActiva !== 'ventas' && (
              <select
                value={filtroZona}
                onChange={(e) => setFiltroZona(e.target.value)}
                className="bg-slate-50 border border-slate-200 font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="TODAS">Zona: Todas</option>
                <option value="CANCHA">Cancha Sintética</option>
                <option value="EVENTOS">Zona Eventos</option>
              </select>
            )}

            {(filtroFechaDesde || filtroFechaHasta || filtroMetodo !== 'TODOS' || filtroZona !== 'TODAS' || busquedaTexto) && (
              <button
                onClick={() => {
                  setFiltroFechaDesde('');
                  setFiltroFechaHasta('');
                  setFiltroMetodo('TODOS');
                  setFiltroZona('TODAS');
                  setBusquedaTexto('');
                }}
                className="text-rose-600 font-bold hover:underline cursor-pointer px-2"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal de Reportes */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 space-y-6">
        
        {/* ===================== TAB 1: CONSOLIDADO ===================== */}
        {tabActiva === 'consolidado' && (
          <div className="space-y-6">
            
            {/* Tarjetas KPI Superiores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Ingresos Recaudados</span>
                <h3 className="text-2xl font-black text-[#1638BF]">{formatSoles(granTotalIngresos)}</h3>
                <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <span>●</span> Dinero efectivo y digital cobrado
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Ingresos por Alquileres</span>
                <h3 className="text-2xl font-black text-slate-900">{formatSoles(totalReservasMonto)}</h3>
                <p className="text-[11px] font-semibold text-slate-600 mt-1">
                  {reservasFiltradas.length} reservas registradas
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Ventas de Minimarket</span>
                <h3 className="text-2xl font-black text-slate-900">{formatSoles(totalVentasMonto)}</h3>
                <p className="text-[11px] font-semibold text-blue-600 mt-1">
                  {ventasFiltradas.length} boletas / tickets POS
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Saldos por Cobrar</span>
                <h3 className="text-2xl font-black text-rose-600">{formatSoles(totalSaldosPendientes)}</h3>
                <p className="text-[11px] font-semibold text-rose-600 mt-1">
                  Por liquidar a la llegada de clientes
                </p>
              </div>
            </div>

            {/* Cuadros de Desglose: Por Métodos de Pago y Por Zona */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Tarjeta: Desglose por Métodos de Pago */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#1638BF]" />
                    <span>Recaudación por Método de Pago</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">Total: {formatSoles(granTotalIngresos)}</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(metodosDesglose).map(([metodo, data]) => {
                    const porc = granTotalIngresos > 0 ? ((data.total / granTotalIngresos) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={metodo} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center gap-2">
                            <span>{formatMetodoNombre(metodo)}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({data.count} operaciones)</span>
                          </span>
                          <span className="font-black text-slate-900">
                            {formatSoles(data.total)} <span className="text-[11px] text-slate-400 font-normal">({porc}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              metodo === 'EFECTIVO' ? 'bg-blue-600' :
                              metodo === 'YAPE' ? 'bg-purple-600' :
                              metodo === 'PLIN' ? 'bg-sky-500' :
                              metodo === 'TRANSFERENCIA' ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${porc}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tarjeta: Desglose por Espacio Deportivo & Top Productos */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#EA580C]" />
                    <span>Ingresos por Espacio Alquilado</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">Total: {formatSoles(totalReservasMonto)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-blue-900">Cancha Sintética</span>
                    <h4 className="text-xl font-black text-[#1638BF]">{formatSoles(zonaDesglose.canchaMonto)}</h4>
                    <p className="text-[11px] text-blue-700">{zonaDesglose.canchaCount} reservas atendidas</p>
                  </div>

                  <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-orange-900">Zona Eventos</span>
                    <h4 className="text-xl font-black text-[#EA580C]">{formatSoles(zonaDesglose.eventosMonto)}</h4>
                    <p className="text-[11px] text-orange-700">{zonaDesglose.eventosCount} eventos realizados</p>
                  </div>
                </div>

                {/* Top productos más vendidos */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Productos Más Vendidos en Minimarket:</span>
                  </h4>
                  <div className="space-y-1.5">
                    {topProductos.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay ventas registradas con los filtros actuales.</p>
                    ) : (
                      topProductos.map((prod, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1 px-2.5 bg-slate-50 rounded-lg">
                          <span className="font-bold text-slate-800">
                            #{idx + 1} {prod.nombre} ({prod.cantidad} unids)
                          </span>
                          <span className="font-black text-slate-900">{formatSoles(prod.total)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ===================== TAB 2: VENTAS MINIMARKET ===================== */}
        {tabActiva === 'ventas' && (
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900">Detalle de Ventas POS</h3>
                <p className="text-xs text-slate-500">Historial completo con detalle de productos y métodos de cobro</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 block">Total Recaudado</span>
                <span className="text-xl font-black text-[#0284C7]">{formatSoles(totalVentasMonto)}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Comprobante</th>
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-4">Método de Pago</th>
                      <th className="py-3 px-4">Productos Vendidos</th>
                      <th className="py-3 px-4 text-right">Total Cobrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {ventasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                          No se encontraron ventas con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      ventasFiltradas.map((v) => (
                        <tr key={v.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-3 px-4 font-black text-slate-900">
                            {v.numeroComprobante}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {v.fechaHora ? v.fechaHora.replace('T', ' ').slice(0, 16) : 'Reciente'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black ${
                              v.metodoPago === 'EFECTIVO' ? 'bg-blue-100 text-blue-800' :
                              v.metodoPago === 'YAPE' || v.metodoPago === 'PLIN' || v.metodoPago === 'YAPE_PLIN' ? 'bg-purple-100 text-purple-800' :
                              v.metodoPago === 'TRANSFERENCIA' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {formatMetodoNombre(v.metodoPago)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            <div className="flex flex-wrap gap-1">
                              {v.items?.map((it, i) => (
                                <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  {it.cantidad}x {it.nombre} (S/{it.subtotal.toFixed(2)})
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                            {formatSoles(v.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================== TAB 3: RESERVAS Y ALQUILERES ===================== */}
        {tabActiva === 'reservas' && (
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900">Reporte de Reservas y Alquileres</h3>
                <p className="text-xs text-slate-500">Control por cliente, espacio, tipo de tarifa y estado de cobranza</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 block">Total Cobrado (Adelantos)</span>
                <span className="text-xl font-black text-[#EA580C]">{formatSoles(totalReservasMonto)}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Espacio</th>
                      <th className="py-3 px-4">Cliente / Contacto</th>
                      <th className="py-3 px-4">Fecha y Horario</th>
                      <th className="py-3 px-4">Tarifa / Evento</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Adelanto</th>
                      <th className="py-3 px-4">Saldo Restante</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reservasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                          No se encontraron reservas con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      reservasFiltradas.map((r) => (
                        <tr key={r.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-black text-[10.5px] ${
                              r.zona === 'CANCHA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {r.zona === 'CANCHA' ? 'Cancha' : 'Eventos'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{r.clienteNombre}</div>
                            {r.clienteTelefono && (
                              <div className="text-[11px] text-slate-500">{r.clienteTelefono}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{r.fecha}</div>
                            <div className="text-[11px] text-slate-500">{r.horaInicio} - {r.horaFin}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700">{r.tipoEvento}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10.5px] font-bold text-slate-700">
                              {formatMetodoNombre(r.metodoPago)}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {formatSoles(r.montoTotal)}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600">
                            {formatSoles(r.adelanto)}
                          </td>
                          <td className="py-3 px-4 font-black">
                            {r.saldoPendiente > 0 ? (
                              <span className="text-rose-600">{formatSoles(r.saldoPendiente)}</span>
                            ) : (
                              <span className="text-emerald-700">S/ 0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black ${
                              r.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-800' :
                              r.estado === 'CONFIRMADA' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
