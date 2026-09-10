import React from 'react';
import { LogOut } from 'lucide-react';
import { ScreenType } from '../../types';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onNewReserva: () => void;
  onLogout?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, onNewReserva, onLogout }) => {
  const quickActions = [
    {
      id: 'nueva_reserva',
      title: 'Reservas',
      subtitle: 'Nueva reserva',
      iconSrc: '/iconos/reservas.svg',
      titleColor: 'text-[#260AA5]',
      action: onNewReserva
    },
    {
      id: 'calendario',
      title: 'Calendario',
      subtitle: 'Ver agenda',
      iconSrc: '/iconos/calendario.svg',
      titleColor: 'text-[#EA580C]',
      action: () => onNavigate('calendario')
    },
    {
      id: 'pos',
      title: 'Minimarket POS',
      subtitle: 'Realizar venta',
      iconSrc: '/iconos/minimarket.svg',
      titleColor: 'text-[#0284C7]',
      action: () => onNavigate('pos')
    },
    {
      id: 'inventario',
      title: 'Inventario',
      subtitle: 'Gestion de stock',
      iconSrc: '/iconos/inventario.svg',
      titleColor: 'text-[#65A30D]',
      action: () => onNavigate('inventario')
    },
    {
      id: 'caja',
      title: 'Caja',
      subtitle: 'Apertura y cierre',
      iconSrc: '/iconos/caja.svg',
      titleColor: 'text-[#EA580C]',
      action: () => onNavigate('caja')
    },
    {
      id: 'reportes',
      title: 'Reportes',
      subtitle: 'Ver reportes',
      iconSrc: '/iconos/reportes.svg',
      titleColor: 'text-[#0844B1]',
      action: () => onNavigate('caja')
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#1638BF] md:bg-slate-50 select-none">
      
      {/* ================= VISTA MÓVIL (< md) - FIEL A FIGMA ================= */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex-1 bg-white rounded-t-[32px] px-5 pt-6 pb-24 flex flex-col justify-between shadow-xs border-t border-slate-100">
          
          {/* Bloque Superior: Accesos rápidos */}
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-[#0F172A] mb-3 tracking-tight">
              Accesos rapidos
            </h2>

            <div className="grid grid-cols-2 gap-3.5">
              {quickActions.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="bg-white rounded-[20px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_28px_rgba(27,59,182,0.12)] transition-all duration-200 flex flex-col items-start text-left active:scale-[0.98] cursor-pointer border border-slate-100/70"
                >
                  <div className="w-12 h-12 flex items-center justify-start mb-2">
                    <img
                      src={item.iconSrc}
                      alt={item.title}
                      className="w-11 h-11 max-w-11 max-h-11 object-contain"
                    />
                  </div>
                  <span className={`font-bold text-[14.5px] leading-tight ${item.titleColor}`}>
                    {item.title}
                  </span>
                  <span className="text-[11.5px] text-[#94A3B8] font-normal mt-0.5">
                    {item.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bloque Inferior: Resumen del día y Botón Cerrar Sesión */}
          <div className="mt-4 mb-2 space-y-3">
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A] mb-2.5 tracking-tight">
                Resumen del dia
              </h2>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white rounded-[18px] p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] border border-slate-100/70 flex flex-col justify-between min-h-[82px]">
                  <span className="text-[10.5px] font-bold text-blue-600 bg-[#EEF2FF] px-2.5 py-0.5 rounded-md inline-block w-max mb-1.5">
                    Reservas hoy
                  </span>
                  <span className="text-xl font-black text-[#0F172A] tracking-tight">
                    8
                  </span>
                </div>

                <div className="bg-white rounded-[18px] p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] border border-slate-100/70 flex flex-col justify-between min-h-[82px]">
                  <span className="text-[10.5px] font-bold text-blue-600 bg-[#EEF2FF] px-2.5 py-0.5 rounded-md inline-block w-max mb-1.5">
                    Ventas POS
                  </span>
                  <span className="text-[13px] font-black text-[#0F172A] tracking-tight whitespace-nowrap">
                    S/1,245.00
                  </span>
                </div>

                <div className="bg-white rounded-[18px] p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] border border-slate-100/70 flex flex-col justify-between min-h-[82px]">
                  <span className="text-[10.5px] font-bold text-blue-600 bg-[#EEF2FF] px-2.5 py-0.5 rounded-md inline-block w-max mb-1.5">
                    Ingresos
                  </span>
                  <span className="text-[13px] font-black text-[#0F172A] tracking-tight whitespace-nowrap">
                    S/3,860.00
                  </span>
                </div>
              </div>
            </div>

            {/* Botón Cerrar Sesión en Móvil */}
            <button
              onClick={onLogout || (() => onNavigate('login'))}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-xs mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= VISTA DESKTOP & LAPTOP (>= md) - ACOPLADA Y PROFESIONAL ================= */}
      <div className="hidden md:flex flex-col flex-1 p-5 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reservas Hoy</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">8 Activas</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <span>●</span> 5 Cancha • 3 Eventos
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#1638BF]">
              <img src="/iconos/calendario.svg" alt="Reservas" className="w-8 h-8 object-contain" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ventas Minimarket</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">S/ 1,245.00</h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-1">
                34 tickets atendidos
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-[#0284C7]">
              <img src="/iconos/minimarket.svg" alt="POS" className="w-8 h-8 object-contain" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ingresos Alquileres</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">S/ 2,615.00</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                +12% vs semana previa
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#EA580C]">
              <img src="/iconos/reservas.svg" alt="Alquileres" className="w-8 h-8 object-contain" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between hover:shadow-md transition bg-gradient-to-br from-white to-blue-50/50">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ingreso Total Diario</p>
              <h3 className="text-2xl font-black text-[#1638BF] tracking-tight">S/ 3,860.00</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                Caja en balance óptimo
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-lime-50 flex items-center justify-center text-[#65A30D]">
              <img src="/iconos/caja.svg" alt="Total" className="w-8 h-8 object-contain" />
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: Accesos Rápidos (7 cols) */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Módulos y Accesos Rápidos
              </h2>
              <span className="text-xs font-medium text-slate-500">Operaciones frecuentes</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 border border-slate-200/80 transition-all duration-200 flex flex-col items-start text-left group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center mb-3 transition">
                    <img
                      src={item.iconSrc}
                      alt={item.title}
                      className="w-9 h-9 object-contain group-hover:scale-110 transition duration-200"
                    />
                  </div>
                  <span className={`font-bold text-sm leading-tight ${item.titleColor}`}>
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">
                    {item.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Agenda del Día & Estado del Club (5 cols) */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Agenda del Día (Jueves 23)
              </h2>
              <button
                onClick={() => onNavigate('calendario')}
                className="text-xs font-bold text-[#1638BF] hover:underline cursor-pointer"
              >
                Ver calendario completo →
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-800">08:00 - 10:00</span>
                  <span className="text-slate-500">• Carlos Mendoza</span>
                </div>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  Cancha
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-800">10:00 - 12:00</span>
                  <span className="text-slate-500">• Tech SAC</span>
                </div>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  Cancha
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="font-bold text-slate-800">10:00 - 14:00</span>
                  <span className="text-slate-500">• Familia Ramos</span>
                </div>
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  Eventos
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-800">14:00 - 16:00</span>
                  <span className="text-slate-500">• FC Los Amigos</span>
                </div>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  Cancha
                </span>
              </div>
            </div>

            {/* Banner Informativo Directo */}
            <div className="bg-gradient-to-r from-[#1638BF] to-[#1E40AF] rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#D8F600]">Terminal de Cobro Rápido</h4>
                <p className="text-xs text-blue-100/90 mt-0.5">Cobro ágil para bebidas y alquileres</p>
              </div>
              <button
                onClick={() => onNavigate('pos')}
                className="bg-[#D8F600] hover:bg-[#c9e600] text-[#0F2276] font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                Abrir POS
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
