import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  FileText, 
  Printer, 
  X, 
  RefreshCw, 
  Lock, 
  Unlock, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { apiService } from '../../services/api';
import { CierreCaja, AperturaCaja } from '../../types';

export const CierreCajaScreen: React.FC = () => {
  const [periodo, setPeriodo] = useState('Mayo 2026');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de Apertura / Cierre de Turno
  const [apertura, setApertura] = useState<AperturaCaja | null>(null);
  const [modalAbrirOpen, setModalAbrirOpen] = useState(false);
  const [modalCerrarOpen, setModalCerrarOpen] = useState(false);

  // Formulario Apertura
  const [montoInicialInput, setMontoInicialInput] = useState('100.00');
  const [nombreStaffInput, setNombreStaffInput] = useState('Staff Turno');

  // Formulario Cierre
  const [efectivoContadoInput, setEfectivoContadoInput] = useState('');
  const [observacionesInput, setObservacionesInput] = useState('');

  const [cierre, setCierre] = useState<CierreCaja & { totalReservasCount: number; totalVentasCount: number; ticketPromedio: number }>({
    periodo: 'Mayo 2026',
    fechaConsulta: new Date().toISOString().slice(0, 10),
    alquileres: { efectivo: 0, yapePlin: 0, transferencia: 0, total: 0 },
    minimarket: { efectivo: 0, yapePlin: 0, transferencia: 0, total: 0 },
    totalGeneral: 0,
    totalReservasCount: 0,
    totalVentasCount: 0,
    ticketPromedio: 0,
    aperturaActual: null
  });

  const loadCierreData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCierreCaja(periodo);
      setCierre(data);
      const ape = apiService.getAperturaActual();
      setApertura(ape);
      if (ape) {
        // Sugerir el efectivo esperado en caja = monto inicial + ingresos en efectivo
        const efectivoEsperado = (ape.montoInicial || 0) + data.alquileres.efectivo + data.minimarket.efectivo;
        setEfectivoContadoInput(efectivoEsperado.toFixed(2));
      }
    } catch (e) {
      console.error('Error al cargar datos de caja:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCierreData();
  }, [periodo]);

  // Manejador para Abrir Caja
  const handleConfirmarApertura = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(montoInicialInput);
    if (isNaN(monto) || monto < 0) {
      alert('Por favor ingrese un monto inicial válido.');
      return;
    }
    const nuevaApe = await apiService.abrirCaja(monto, nombreStaffInput);
    setApertura(nuevaApe);
    setModalAbrirOpen(false);
    await loadCierreData();
  };

  // Manejador para Cerrar Caja
  const handleConfirmarCierre = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoContado = parseFloat(efectivoContadoInput);
    if (isNaN(montoContado) || montoContado < 0) {
      alert('Por favor ingrese el total de efectivo contado en caja.');
      return;
    }
    const apeCerrada = await apiService.cerrarCajaTurno(montoContado, observacionesInput);
    setApertura(apeCerrada);
    setModalCerrarOpen(false);
    setShowPdfPreview(true);
    await loadCierreData();
  };

  const isCajaAbierta = apertura?.estado === 'ABIERTA';
  const totalEfectivoRecaudado = cierre.alquileres.efectivo + cierre.minimarket.efectivo;
  const efectivoEsperadoEnCaja = (apertura?.montoInicial || 0) + totalEfectivoRecaudado;

  const porcAlquileres = cierre.totalGeneral > 0 
    ? ((cierre.alquileres.total / cierre.totalGeneral) * 100).toFixed(1) 
    : '0.0';
  const porcMinimarket = cierre.totalGeneral > 0 
    ? ((cierre.minimarket.total / cierre.totalGeneral) * 100).toFixed(1) 
    : '0.0';

  // Intervalos de barras calculados de acuerdo a la proporción de ingresos
  const chartWeeks = [
    { label: '01-05', alquileres: Math.min(100, Math.round(cierre.alquileres.total * 0.15)), minimarket: Math.min(100, Math.round(cierre.minimarket.total * 0.2)) },
    { label: '06-10', alquileres: Math.min(100, Math.round(cierre.alquileres.total * 0.25)), minimarket: Math.min(100, Math.round(cierre.minimarket.total * 0.25)) },
    { label: '11-15', alquileres: Math.min(100, Math.round(cierre.alquileres.total * 0.20)), minimarket: Math.min(100, Math.round(cierre.minimarket.total * 0.15)) },
    { label: '16-20', alquileres: Math.min(100, Math.round(cierre.alquileres.total * 0.10)), minimarket: Math.min(100, Math.round(cierre.minimarket.total * 0.18)) },
    { label: '21-25', alquileres: Math.min(100, Math.round(cierre.alquileres.total * 0.18)), minimarket: Math.min(100, Math.round(cierre.minimarket.total * 0.12)) },
    { label: '26-31', alquileres: Math.min(100, Math.round(cierre.alquileres.total * 0.12)), minimarket: Math.min(100, Math.round(cierre.minimarket.total * 0.10)) },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#1638BF] md:bg-slate-50 select-none pb-24 md:pb-8">
      
      {/* ================= VISTA MÓVIL (< md) - FIEL A FIGMA CON CONTROL OPERATIVO ================= */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex-1 bg-white rounded-t-[32px] px-4 pt-5 pb-24 flex flex-col justify-between shadow-xs border-t border-slate-100">
          <div>
            
            {/* PANEL DE APERTURA / ESTADO OPERATIVO EN MÓVIL */}
            <div className={`p-4 rounded-2xl mb-3.5 border transition ${
              isCajaAbierta 
                ? 'bg-emerald-50/80 border-emerald-300' 
                : 'bg-amber-50/90 border-amber-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCajaAbierta ? (
                    <Unlock className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-amber-600" />
                  )}
                  <div>
                    <h3 className="text-xs font-black text-slate-900">
                      {isCajaAbierta ? 'Turno de Caja Abierto' : 'Caja Cerrada / Sin Apertura'}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      {isCajaAbierta 
                        ? `Apertura: ${apertura?.horaApertura || '08:00'} • Base: S/ ${apertura?.montoInicial.toFixed(2)}` 
                        : 'Ingresa el efectivo base para iniciar turno'}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isCajaAbierta ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isCajaAbierta ? 'Operativa' : 'Cerrada'}
                </span>
              </div>

              {/* Botón de Acción Móvil */}
              {isCajaAbierta ? (
                <button
                  onClick={() => setModalCerrarOpen(true)}
                  className="w-full mt-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>Cerrar Turno de Caja (Arqueo)</span>
                </button>
              ) : (
                <button
                  onClick={() => setModalAbrirOpen(true)}
                  className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-4 h-4 text-[#D8F600]" />
                  <span>Abrir Caja (Ingresar Efectivo Inicial)</span>
                </button>
              )}
            </div>

            {/* Selector de Período Dropdown Interactivo */}
            <div className="relative w-full mb-3.5">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full bg-white border border-[#2563EB] text-[#2563EB] text-sm font-bold py-2.5 px-4 rounded-xl shadow-xs appearance-none focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-center cursor-pointer"
              >
                <option value="Mayo 2026">Mayo 2026</option>
                <option value="Abril 2026">Abril 2026</option>
                <option value="Marzo 2026">Marzo 2026</option>
                <option value="Febrero 2026">Febrero 2026</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#2563EB] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Card 1: Ingresos por Alquileres */}
            <div className="border border-[#2563EB] rounded-2xl overflow-hidden shadow-xs mb-3.5 bg-white">
              <div className="bg-[#D8F600] text-slate-950 px-3.5 py-2 flex justify-between items-center font-bold text-xs">
                <span>Ingresos por Alquileres</span>
                <span className="font-black">S/ {cierre.alquileres.total.toFixed(2)}</span>
              </div>

              <div className="p-3 space-y-1.5 bg-white text-xs">
                <div className="flex justify-between text-slate-800">
                  <span>Efectivo</span>
                  <span className="font-bold text-slate-950">S/ {cierre.alquileres.efectivo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Yape / Plin</span>
                  <span className="font-bold text-slate-950">S/ {cierre.alquileres.yapePlin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Transferencia</span>
                  <span className="font-bold text-slate-950">S/ {cierre.alquileres.transferencia.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Ingresos por Minimarket & Total General */}
            <div className="border border-[#2563EB] rounded-2xl overflow-hidden shadow-xs mb-3.5 bg-white">
              <div className="bg-[#2442E7] text-white px-3.5 py-2 flex justify-between items-center font-bold text-xs">
                <span>Ingresos por Minimarket</span>
                <span className="font-black">S/ {cierre.minimarket.total.toFixed(2)}</span>
              </div>

              <div className="p-3 space-y-1.5 bg-white text-xs border-b border-[#2563EB]">
                <div className="flex justify-between text-slate-800">
                  <span>Efectivo</span>
                  <span className="font-bold text-slate-950">S/ {cierre.minimarket.efectivo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Yape / Plin</span>
                  <span className="font-bold text-slate-950">S/ {cierre.minimarket.yapePlin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Transferencia</span>
                  <span className="font-bold text-slate-950">S/ {cierre.minimarket.transferencia.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center text-xs font-bold text-slate-950 bg-white">
                <span>Total recaudado</span>
                <span className="font-black text-[#1638BF]">S/ {cierre.totalGeneral.toFixed(2)}</span>
              </div>
            </div>

            {/* Resumen de Caja en Efectivo (Base + Cobros) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Base Inicial:</span>
                <span className="font-bold">S/ {(apertura?.montoInicial || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Efectivo Cobrado en Turno:</span>
                <span className="font-bold text-emerald-600">+ S/ {totalEfectivoRecaudado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Efectivo Total en Gaveta:</span>
                <span className="text-sm text-[#1638BF]">S/ {efectivoEsperadoEnCaja.toFixed(2)}</span>
              </div>
            </div>

            {/* Card 3: Resumen Mensual (Gráfico de Barras según Figma) */}
            <div className="border border-[#2563EB] rounded-2xl p-3.5 bg-white shadow-xs mb-3">
              <h3 className="text-xs font-bold text-[#2563EB] mb-3">
                Resumen mensual
              </h3>

              <div className="flex items-end justify-between h-24 gap-2 px-1 pb-1 border-b border-slate-100">
                {chartWeeks.map((week, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-1 w-full justify-center h-full">
                      <div
                        style={{ height: `${week.alquileres}%` }}
                        className="w-3 bg-[#D8F600] rounded-t-xs"
                        title={`Alquileres: ${week.alquileres}%`}
                      />
                      <div
                        style={{ height: `${week.minimarket}%` }}
                        className="w-3 bg-[#FF6A00] rounded-t-xs"
                        title={`Minimarket: ${week.minimarket}%`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 mt-1.5">
                      {week.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-2.5 text-[10px] font-bold text-slate-900">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#D8F600] inline-block" />
                  <span>Alquileres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#FF6A00] inline-block" />
                  <span>Minimarket</span>
                </div>
              </div>
            </div>

          </div>

          {/* Botones Móviles de Cierre y Reporte */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => setShowPdfPreview(true)}
              className="w-full bg-[#2442E7] hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-[14.5px] py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D8F600]" />
              <span>Generar comprobante / PDF</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= VISTA DESKTOP & LAPTOP (>= md) - DASHBOARD FINANCIERO ================= */}
      <div className="hidden md:flex flex-col flex-1 p-5 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5">
        
        {/* Header con Período, Apertura y Botón Cierre */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Cierre y Balance de Caja</h2>
              <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                isCajaAbierta ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isCajaAbierta ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isCajaAbierta ? 'Caja Operativa (Abierta)' : 'Caja Cerrada'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Control de apertura con fondo inicial, liquidación diaria y arqueo de turnos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Botón de Abrir o Cerrar Turno */}
            {isCajaAbierta ? (
              <button
                onClick={() => setModalCerrarOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>Cerrar Turno (Arqueo)</span>
              </button>
            ) : (
              <button
                onClick={() => setModalAbrirOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Unlock className="w-4 h-4 text-[#D8F600]" />
                <span>Abrir Caja (Fondo Inicial)</span>
              </button>
            )}

            <div className="relative">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="bg-blue-50 text-[#1638BF] font-bold text-xs pl-4 pr-9 py-2.5 rounded-xl border border-blue-200 shadow-xs appearance-none focus:outline-none focus:ring-1 focus:ring-[#1638BF] cursor-pointer"
              >
                <option value="Mayo 2026">Período: Mayo 2026</option>
                <option value="Abril 2026">Período: Abril 2026</option>
                <option value="Marzo 2026">Período: Marzo 2026</option>
                <option value="Febrero 2026">Período: Febrero 2026</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#1638BF] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowPdfPreview(true)}
              className="bg-[#1638BF] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4 text-[#D8F600]" />
              <span>Generar Informe PDF</span>
            </button>
          </div>
        </div>

        {/* Banner de Arqueo y Estado de Turno */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Fondo Inicial (Apertura)</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              S/ {(apertura?.montoInicial || 0).toFixed(2)}
            </div>
            <span className="text-[10.5px] text-slate-500 font-semibold">
              Hora: {apertura?.horaApertura || '08:00'} ({apertura?.abiertaPor || 'Staff'})
            </span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
            <span className="text-[11px] font-bold text-blue-900 uppercase block">Efectivo Cobrado en Turno</span>
            <div className="text-xl font-black text-[#1638BF] mt-0.5">
              + S/ {totalEfectivoRecaudado.toFixed(2)}
            </div>
            <span className="text-[10.5px] text-blue-700 font-semibold">
              Canchas: S/{cierre.alquileres.efectivo.toFixed(2)} • POS: S/{cierre.minimarket.efectivo.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-900 uppercase block">Efectivo Esperado en Gaveta</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              S/ {efectivoEsperadoEnCaja.toFixed(2)}
            </div>
            <span className="text-[10.5px] text-emerald-800 font-bold">
              Base Inicial + Ventas en Efectivo
            </span>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
            <span className="text-[11px] font-bold text-purple-900 uppercase block">Cobros Digitales (Yape/Plin/Transf)</span>
            <div className="text-xl font-black text-purple-900 mt-0.5">
              S/ {(cierre.totalGeneral - totalEfectivoRecaudado).toFixed(2)}
            </div>
            <span className="text-[10.5px] text-purple-700 font-semibold">
              Ingresado a cuentas bancarias
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: Desglose Financiero (6 cols) */}
          <div className="col-span-12 lg:col-span-6 space-y-5">
            
            {/* Card 1: Alquileres */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-[#D8F600] px-5 py-3.5 flex justify-between items-center">
                <span className="font-extrabold text-slate-950 text-sm">Ingresos por Alquileres</span>
                <span className="font-black text-slate-950 text-lg">S/ {cierre.alquileres.total.toFixed(2)}</span>
              </div>
              <div className="p-5 space-y-3 bg-white">
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Efectivo en Caja
                  </span>
                  <span className="font-black text-slate-900">S/ {cierre.alquileres.efectivo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    Yape / Plin
                  </span>
                  <span className="font-black text-slate-900">S/ {cierre.alquileres.yapePlin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Transferencia Bancaria
                  </span>
                  <span className="font-black text-slate-900">S/ {cierre.alquileres.transferencia.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Minimarket */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-[#1638BF] px-5 py-3.5 flex justify-between items-center text-white">
                <span className="font-extrabold text-white text-sm">Ingresos por Minimarket</span>
                <span className="font-black text-[#D8F600] text-lg">S/ {cierre.minimarket.total.toFixed(2)}</span>
              </div>
              <div className="p-5 space-y-3 bg-white">
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Efectivo en Caja
                  </span>
                  <span className="font-black text-slate-900">S/ {cierre.minimarket.efectivo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    Yape / Plin
                  </span>
                  <span className="font-black text-slate-900">S/ {cierre.minimarket.yapePlin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Transferencia Bancaria
                  </span>
                  <span className="font-black text-slate-900">S/ {cierre.minimarket.transferencia.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Total General Card */}
            <div className="bg-gradient-to-r from-[#1638BF] to-[#1E40AF] text-white rounded-2xl p-5 shadow-md flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">Total Recaudado en el Mes</span>
                <span className="text-2xl font-black text-[#D8F600] mt-1 block">S/ {cierre.totalGeneral.toFixed(2)}</span>
              </div>
              <div className="text-right text-xs text-blue-100 font-semibold">
                <p>Alquileres: {porcAlquileres}%</p>
                <p>Minimarket: {porcMinimarket}%</p>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Gráfico y KPIs (6 cols) */}
          <div className="col-span-12 lg:col-span-6 space-y-5">
            
            {/* Gráfico Mensual */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tendencia Quincenal de Ingresos</h3>
                  <p className="text-xs text-slate-400">Distribución de recaudación por rangos de días</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#D8F600]" />
                    <span className="text-slate-600">Alquileres</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#FF6A00]" />
                    <span className="text-slate-600">Minimarket</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between h-44 gap-4 px-2 pb-2 border-b border-slate-100">
                {chartWeeks.map((week, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                    <div className="flex items-end gap-1.5 w-full justify-center h-full">
                      <div
                        style={{ height: `${week.alquileres}%` }}
                        className="w-4 bg-[#D8F600] rounded-t-sm group-hover:opacity-80 transition"
                        title={`Alquileres: ${week.alquileres}%`}
                      />
                      <div
                        style={{ height: `${week.minimarket}%` }}
                        className="w-4 bg-[#FF6A00] rounded-t-sm group-hover:opacity-80 transition"
                        title={`Minimarket: ${week.minimarket}%`}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600 mt-2">
                      {week.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarjetas de Resumen KPI */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Reservas Concretadas</span>
                <span className="text-xl font-black text-slate-900">{cierre.totalReservasCount}</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Ventas POS</span>
                <span className="text-xl font-black text-slate-900">{cierre.totalVentasCount} tickets</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Ticket Promedio</span>
                <span className="text-xl font-black text-[#1638BF]">S/ {cierre.ticketPromedio.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ================= MODAL DE APERTURA DE CAJA ================= */}
      {modalAbrirOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="text-center border-b border-slate-100 pb-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center mb-2">
                <Unlock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Apertura de Caja (Inicio de Turno)</h3>
              <p className="text-xs text-slate-500 font-medium">Ingresa el efectivo inicial asignado a la gaveta</p>
            </div>

            <form onSubmit={handleConfirmarApertura} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monto Base Inicial (S/):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-500 text-sm">S/</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={montoInicialInput}
                    onChange={(e) => setMontoInicialInput(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Responsable del Turno:
                </label>
                <input
                  type="text"
                  required
                  value={nombreStaffInput}
                  onChange={(e) => setNombreStaffInput(e.target.value)}
                  placeholder="Staff Turno Mañana"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  Confirmar Apertura
                </button>
                <button
                  type="button"
                  onClick={() => setModalAbrirOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CIERRE DE CAJA / ARQUEO ================= */}
      {modalCerrarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="text-center border-b border-slate-100 pb-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl mx-auto flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Cierre de Caja y Arqueo</h3>
              <p className="text-xs text-slate-500 font-medium">Contabiliza el efectivo físico en gaveta</p>
            </div>

            <form onSubmit={handleConfirmarCierre} className="space-y-3.5">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Inicial:</span>
                  <span className="font-bold">S/ {(apertura?.montoInicial || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Efectivo Cobrado:</span>
                  <span className="font-bold text-emerald-600">+ S/ {totalEfectivoRecaudado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Teórico Esperado:</span>
                  <span className="text-[#1638BF]">S/ {efectivoEsperadoEnCaja.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Efectivo Real Contado en Gaveta (S/):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-500 text-sm">S/</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={efectivoContadoInput}
                    onChange={(e) => setEfectivoContadoInput(e.target.value)}
                    placeholder={efectivoEsperadoEnCaja.toFixed(2)}
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                {parseFloat(efectivoContadoInput) !== efectivoEsperadoEnCaja && !isNaN(parseFloat(efectivoContadoInput)) && (
                  <p className="text-[11px] font-bold mt-1 text-amber-600">
                    Diferencia: S/ {(parseFloat(efectivoContadoInput) - efectivoEsperadoEnCaja).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones / Motivo (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={observacionesInput}
                  onChange={(e) => setObservacionesInput(e.target.value)}
                  placeholder="Sin novedades en el turno..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  Confirmar y Cerrar Turno
                </button>
                <button
                  type="button"
                  onClick={() => setModalCerrarOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Previsualización de Reporte PDF */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="text-center border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-blue-100 text-[#1B3BB6] rounded-full mx-auto flex items-center justify-center mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1B3BB6]">INFORME DE CIERRE DE CAJA</h3>
              <p className="text-xs text-slate-500 font-semibold">{periodo} • Ohana Club S.A.C.</p>
            </div>

            <div className="space-y-3 text-xs md:text-sm bg-slate-50 p-4 rounded-2xl">
              <div className="flex justify-between text-slate-700">
                <span>Fondo Inicial de Caja:</span>
                <span className="font-bold">S/ {(apertura?.montoInicial || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Alquileres Canchas y Eventos:</span>
                <span className="font-bold">S/ {cierre.alquileres.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Ventas Minimarket:</span>
                <span className="font-bold">S/ {cierre.minimarket.total.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm md:text-base text-[#1B3BB6]">
                <span>Total Recaudado en Turno:</span>
                <span>S/ {cierre.totalGeneral.toFixed(2)}</span>
              </div>
              {apertura?.montoCierreEfectivo !== undefined && (
                <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-dashed border-slate-200">
                  <span>Efectivo Físico Arqueado:</span>
                  <span>S/ {apertura.montoCierreEfectivo.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                  setShowPdfPreview(false);
                }}
                className="flex-1 bg-[#1B3BB6] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Guardar PDF
              </button>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs md:text-sm cursor-pointer"
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
