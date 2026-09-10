import React, { useState } from 'react';
import { ChevronDown, FileText, Printer, X } from 'lucide-react';
import { apiService } from '../../services/api';

export const CierreCajaScreen: React.FC = () => {
  const [periodo, setPeriodo] = useState('Mayo 2026');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const cierre = apiService.getCierreCaja(periodo);

  // Intervalos de barras coincidentes con Figma
  const chartWeeks = [
    { label: '01-05', alquileres: 65, minimarket: 45 },
    { label: '06-10', alquileres: 75, minimarket: 48 },
    { label: '11-25', alquileres: 55, minimarket: 35 },
    { label: '16-20', alquileres: 40, minimarket: 30 },
    { label: '21-25', alquileres: 75, minimarket: 25 },
    { label: '26-31', alquileres: 80, minimarket: 20 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#1638BF] md:bg-slate-50 select-none">
      
      {/* ================= VISTA MÓVIL (< md) - FIEL A FIGMA ================= */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex-1 bg-white rounded-t-[32px] px-4 pt-5 pb-24 flex flex-col justify-between shadow-xs border-t border-slate-100">
          <div>
            
            {/* Selector de Período Dropdown Interactivo con borde azul */}
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

            {/* Card 1: Ingresos por Alquileres (Cabecera Verde Neón de Figma) */}
            <div className="border border-[#2563EB] rounded-2xl overflow-hidden shadow-xs mb-3.5 bg-white">
              <div className="bg-[#D8F600] text-slate-950 px-3.5 py-2 flex justify-between items-center font-bold text-xs">
                <span>Ingresos por Alquileres</span>
                <span className="font-black">S/4.260.00</span>
              </div>

              <div className="p-3 space-y-1.5 bg-white text-xs">
                <div className="flex justify-between text-slate-800">
                  <span>Efectivo</span>
                  <span className="font-bold text-slate-950">S/2,120.00</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Yape / Plin</span>
                  <span className="font-bold text-slate-950">S/1,520.00</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Transferencia</span>
                  <span className="font-bold text-slate-950">S/620.00</span>
                </div>
              </div>
            </div>

            {/* Card 2: Ingresos por Minimarket & Total General (Figma 1:1) */}
            <div className="border border-[#2563EB] rounded-2xl overflow-hidden shadow-xs mb-3.5 bg-white">
              <div className="bg-[#2442E7] text-white px-3.5 py-2 flex justify-between items-center font-bold text-xs">
                <span>Ingresos por Minimarket</span>
                <span className="font-black">S/2.145.00</span>
              </div>

              <div className="p-3 space-y-1.5 bg-white text-xs border-b border-[#2563EB]">
                <div className="flex justify-between text-slate-800">
                  <span>Efectivo</span>
                  <span className="font-bold text-slate-950">S/1,120.00</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Yape / Plin</span>
                  <span className="font-bold text-slate-950">S/725.00</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Transferencia</span>
                  <span className="font-bold text-slate-950">S/300.00</span>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center text-xs font-bold text-slate-950 bg-white">
                <span>Total general</span>
                <span className="font-black">S/6.405.00</span>
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

          {/* Botón de Generar Reporte PDF */}
          <div className="pt-2">
            <button
              onClick={() => setShowPdfPreview(true)}
              className="w-full bg-[#2442E7] hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-[15px] py-3.5 rounded-xl shadow-md transition flex items-center justify-center cursor-pointer"
            >
              Generar reporte PDF
            </button>
          </div>

        </div>
      </div>

      {/* ================= VISTA DESKTOP & LAPTOP (>= md) - DASHBOARD FINANCIERO ================= */}
      <div className="hidden md:flex flex-col flex-1 p-5 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5">
        
        {/* Header con Período y Botón Exportar */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Cierre y Balance Financiero</h2>
            <p className="text-xs text-slate-500 mt-0.5">Auditoría de ingresos por alquileres deportivos y ventas POS</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="bg-blue-50 text-[#1638BF] font-bold text-sm pl-4 pr-9 py-2.5 rounded-xl border border-blue-200 shadow-xs appearance-none focus:outline-none focus:ring-1 focus:ring-[#1638BF] cursor-pointer"
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
              className="bg-[#1638BF] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D8F600]" />
              <span>Generar Reporte PDF</span>
            </button>
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
                <span className="font-black text-slate-950 text-lg">S/ 4,260.00</span>
              </div>
              <div className="p-5 space-y-3 bg-white">
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Efectivo en Caja
                  </span>
                  <span className="font-black text-slate-900">S/ 2,120.00</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    Yape / Plin
                  </span>
                  <span className="font-black text-slate-900">S/ 1,520.00</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Transferencia Bancaria
                  </span>
                  <span className="font-black text-slate-900">S/ 620.00</span>
                </div>
              </div>
            </div>

            {/* Card 2: Minimarket */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-[#1638BF] px-5 py-3.5 flex justify-between items-center text-white">
                <span className="font-extrabold text-white text-sm">Ingresos por Minimarket</span>
                <span className="font-black text-[#D8F600] text-lg">S/ 2,145.00</span>
              </div>
              <div className="p-5 space-y-3 bg-white">
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Efectivo en Caja
                  </span>
                  <span className="font-black text-slate-900">S/ 1,120.00</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    Yape / Plin
                  </span>
                  <span className="font-black text-slate-900">S/ 725.00</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Transferencia Bancaria
                  </span>
                  <span className="font-black text-slate-900">S/ 300.00</span>
                </div>
              </div>
            </div>

            {/* Total General Card */}
            <div className="bg-gradient-to-r from-[#1638BF] to-[#1E40AF] text-white rounded-2xl p-5 shadow-md flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">Total Recaudado en el Mes</span>
                <span className="text-2xl font-black text-[#D8F600] mt-1 block">S/ 6,405.00</span>
              </div>
              <div className="text-right text-xs text-blue-100">
                <p>Alquileres: 66.5%</p>
                <p>Minimarket: 33.5%</p>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Gráfico y KPIs (6 cols) */}
          <div className="col-span-12 lg:col-span-6 space-y-5">
            
            {/* Gráfico Mensual */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Evolución de Ingresos por Rango de Días</h3>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#D8F600] rounded-sm" />
                    <span className="text-slate-700">Alquileres</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#FF6A00] rounded-sm" />
                    <span className="text-slate-700">Minimarket</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex items-end justify-between h-44 gap-4 px-2 pb-2 border-b border-slate-200">
                {chartWeeks.map((week, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="flex items-end gap-2 w-full justify-center h-full">
                      <div
                        style={{ height: `${week.alquileres}%` }}
                        className="w-5 bg-[#D8F600] hover:bg-[#c9e600] rounded-t-md transition shadow-xs"
                        title={`Alquileres: S/${(week.alquileres * 50).toFixed(0)}`}
                      />
                      <div
                        style={{ height: `${week.minimarket}%` }}
                        className="w-5 bg-[#FF6A00] hover:bg-[#ea580c] rounded-t-md transition shadow-xs"
                        title={`Minimarket: S/${(week.minimarket * 30).toFixed(0)}`}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 mt-2">
                      {week.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick KPIs Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Total Reservas</span>
                <span className="text-xl font-black text-slate-900">48</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Ventas POS</span>
                <span className="text-xl font-black text-slate-900">142 tickets</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Ticket Promedio</span>
                <span className="text-xl font-black text-[#1638BF]">S/ 15.10</span>
              </div>
            </div>

          </div>

        </div>

      </div>

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
                <span>Alquileres Canchas y Eventos:</span>
                <span className="font-bold">S/{cierre.alquileres.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Ventas Minimarket:</span>
                <span className="font-bold">S/{cierre.minimarket.total.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm md:text-base text-[#1B3BB6]">
                <span>Total Recaudado:</span>
                <span>S/{cierre.totalGeneral.toFixed(2)}</span>
              </div>
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
