import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Home, Sparkles } from 'lucide-react';
import { Reserva, ZonaTipo } from '../../types';

interface CalendarScreenProps {
  reservas: Reserva[];
  onNewReserva: (zona?: ZonaTipo) => void;
  onSelectReserva?: (reserva: Reserva) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  reservas,
  onNewReserva,
  onSelectReserva
}) => {
  const months = [
    'Enero 2026', 'Febrero 2026', 'Marzo 2026', 'Abril 2026',
    'Mayo 2026', 'Junio 2026', 'Julio 2026', 'Agosto 2026',
    'Septiembre 2026', 'Octubre 2026', 'Noviembre 2026', 'Diciembre 2026'
  ];
  const [monthIndex, setMonthIndex] = useState<number>(4); // Mayo 2026
  const [selectedDay, setSelectedDay] = useState<number>(23); // JUE 23 (Figma)
  const [activeZone, setActiveZone] = useState<ZonaTipo | 'ALL'>('ALL');

  const handlePrevMonth = () => {
    setMonthIndex(prev => (prev > 0 ? prev - 1 : 11));
  };

  const handleNextMonth = () => {
    setMonthIndex(prev => (prev < 11 ? prev + 1 : 0));
  };

  const daysOfWeek = [
    { dayName: 'LUN', date: 20 },
    { dayName: 'MAR', date: 21 },
    { dayName: 'MIE', date: 22 },
    { dayName: 'JUE', date: 23 },
    { dayName: 'VIE', date: 24 },
    { dayName: 'SAB', date: 25 },
    { dayName: 'DOM', date: 26 },
  ];

  const timeRows = [
    { time: '08:00', canchaStart: '08:00', eventosStart: '' },
    { time: '10:00', canchaStart: '', eventosStart: '' },
    { time: '12:00', canchaStart: '11:00', eventosStart: '' },
    { time: '14:00', canchaStart: '', eventosStart: '13:00' },
    { time: '16:00', canchaStart: '', eventosStart: '' },
    { time: '18:00', canchaStart: '17:00', eventosStart: '' },
    { time: '20:00', canchaStart: '', eventosStart: '19:00' },
    { time: '22:00', canchaStart: '', eventosStart: '' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#1638BF] md:bg-slate-50 select-none">
      
      {/* ================= VISTA MÓVIL (< md) - FIEL A FIGMA ================= */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex-1 bg-white rounded-t-[32px] px-4 pt-5 pb-24 flex flex-col justify-between shadow-xs border-t border-slate-100">
          <div>
            
            {/* Header: Selector de Mes con botones circulares */}
            <div className="flex items-center justify-between px-2 mb-4">
              <button 
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full border border-[#2142E7] flex items-center justify-center text-[#2142E7] hover:bg-blue-50 active:scale-95 transition cursor-pointer"
                title="Mes anterior"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              
              <h2 className="text-[17px] font-black text-[#1E3A8A] tracking-tight">
                {months[monthIndex]}
              </h2>
              
              <button 
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full border border-[#2142E7] flex items-center justify-center text-[#2142E7] hover:bg-blue-50 active:scale-95 transition cursor-pointer"
                title="Siguiente mes"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Barra de días de la semana con JUE 23 activo en amarillo lima */}
            <div className="grid grid-cols-7 gap-1 mb-4 items-center text-center">
              {daysOfWeek.map((d) => {
                const isSelected = d.date === selectedDay;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDay(d.date)}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#D8F600] text-slate-950 shadow-sm'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-[11px] ${isSelected ? 'font-black' : 'font-bold'} leading-tight`}>
                      {d.dayName}
                    </span>
                    <span className={`text-[16px] ${isSelected ? 'font-black' : 'font-extrabold'} leading-tight`}>
                      {d.date}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Botones de Zona (Zona Cancha Azul / Zona Eventos Naranja) */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                onClick={() => setActiveZone(activeZone === 'CANCHA' ? 'ALL' : 'CANCHA')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer ${
                  activeZone === 'CANCHA' || activeZone === 'ALL'
                    ? 'bg-[#2142E7] text-white ring-2 ring-blue-400/30'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Zona Cancha</span>
              </button>

              <button
                onClick={() => setActiveZone(activeZone === 'EVENTOS' ? 'ALL' : 'EVENTOS')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer ${
                  activeZone === 'EVENTOS' || activeZone === 'ALL'
                    ? 'bg-[#FF6A00] text-white ring-2 ring-orange-400/30'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zona Eventos</span>
              </button>
            </div>

            {/* Tabla de Horarios (Grid Figma 1:1) */}
            <div className="flex gap-2 items-stretch">
              
              {/* Columna de Horas */}
              <div className="w-11 flex flex-col justify-between py-1 text-right pr-1">
                {timeRows.map((r) => (
                  <div key={r.time} className="h-14 flex items-start justify-end text-[11px] font-bold text-slate-800 pt-0.5">
                    {r.time}
                  </div>
                ))}
              </div>

              {/* Grid 2 Columnas (Cancha / Eventos) */}
              <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden bg-white grid grid-cols-2 divide-x divide-slate-200">
                
                {/* Columna 1: Cancha */}
                <div className="divide-y divide-slate-200">
                  {timeRows.map((r) => {
                    const canchaItem = r.canchaStart
                      ? reservas.find(res => res.zona === 'CANCHA' && res.horaInicio.startsWith(r.canchaStart.split(':')[0]))
                      : null;

                    return (
                      <div key={`cancha-${r.time}`} className="h-14 p-1 flex flex-col justify-center">
                        {canchaItem && (activeZone === 'ALL' || activeZone === 'CANCHA') ? (
                          <div
                            onClick={() => onSelectReserva && onSelectReserva(canchaItem)}
                            className="bg-[#E0E7FF] border border-[#818CF8] rounded-md p-1.5 shadow-xs cursor-pointer hover:bg-blue-100 transition active:scale-[0.98] text-left"
                          >
                            <div className="text-[10px] font-bold text-[#3730A3] leading-none">
                              {canchaItem.horaInicio} - {canchaItem.horaFin}
                            </div>
                            <div className="text-[10.5px] font-black text-slate-900 leading-tight mt-0.5 truncate">
                              {canchaItem.tipoEvento}
                            </div>
                            <div className="text-[9px] text-slate-600 truncate">
                              Cliente:{canchaItem.clienteNombre}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Columna 2: Eventos */}
                <div className="divide-y divide-slate-200">
                  {timeRows.map((r) => {
                    const eventoItem = r.eventosStart
                      ? reservas.find(res => res.zona === 'EVENTOS' && res.horaInicio.startsWith(r.eventosStart.split(':')[0]))
                      : null;

                    return (
                      <div key={`eventos-${r.time}`} className="h-14 p-1 flex flex-col justify-center">
                        {eventoItem && (activeZone === 'ALL' || activeZone === 'EVENTOS') ? (
                          <div
                            onClick={() => onSelectReserva && onSelectReserva(eventoItem)}
                            className="bg-[#FFEDD5] border border-[#FB923C] rounded-md p-1.5 shadow-xs cursor-pointer hover:bg-orange-100 transition active:scale-[0.98] text-left"
                          >
                            <div className="text-[10px] font-bold text-[#C2410C] leading-none">
                              {eventoItem.horaInicio} - {eventoItem.horaFin}
                            </div>
                            <div className="text-[10.5px] font-black text-slate-900 leading-tight mt-0.5 truncate">
                              {eventoItem.tipoEvento}
                            </div>
                            <div className="text-[9px] text-slate-600 truncate">
                              Cliente:{eventoItem.clienteNombre}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

          {/* Botón "+ Nueva reserva" */}
          <div className="pt-3">
            <button
              onClick={() => onNewReserva('CANCHA')}
              className="w-full bg-[#2442E7] hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-[15px] py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Nueva reserva</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= VISTA DESKTOP & LAPTOP (>= md) - AGENDA INTERACTIVA ================= */}
      <div className="hidden md:flex flex-col flex-1 p-5 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5">
        
        {/* Toolbar Superior: Mes, Días y Botón Nueva Reserva */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Navegación de Mes */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Mes anterior"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h2 className="text-xl font-black text-slate-900 tracking-tight min-w-[140px] text-center">{months[monthIndex]}</h2>
            <button 
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Siguiente mes"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Selector de Días de la Semana */}
          <div className="flex gap-2">
            {daysOfWeek.map((d) => {
              const isSelected = d.date === selectedDay;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDay(d.date)}
                  className={`px-3 py-2 rounded-xl flex flex-col items-center min-w-[56px] transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#D8F600] text-slate-950 font-black shadow-xs ring-2 ring-[#0F2276]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-bold">{d.dayName}</span>
                  <span className="text-base font-black">{d.date}</span>
                </button>
              );
            })}
          </div>

          {/* Filtros de Zona & CTA */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveZone('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeZone === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveZone('CANCHA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeZone === 'CANCHA' ? 'bg-[#1638BF] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Cancha
              </button>
              <button
                onClick={() => setActiveZone('EVENTOS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeZone === 'EVENTOS' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Eventos
              </button>
            </div>

            <button
              onClick={() => onNewReserva('CANCHA')}
              className="bg-[#1638BF] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Reserva</span>
            </button>
          </div>

        </div>

        {/* 2-Column Grid: Timetable & Day Summary Panel */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Grilla Horaria (8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horario</span>
              <div className="grid grid-cols-2 gap-4 flex-1 pl-12 text-center text-xs font-black uppercase">
                <span className="text-[#1638BF] flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1638BF]" />
                  Zona Cancha Sintética
                </span>
                <span className="text-[#FF6A00] flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
                  Zona Eventos & Parrillas
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {timeRows.map((r) => {
                const canchaItem = r.canchaStart
                  ? reservas.find(res => res.zona === 'CANCHA' && res.horaInicio.startsWith(r.canchaStart.split(':')[0]))
                  : null;

                const eventoItem = r.eventosStart
                  ? reservas.find(res => res.zona === 'EVENTOS' && res.horaInicio.startsWith(r.eventosStart.split(':')[0]))
                  : null;

                return (
                  <div key={r.time} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                    <span className="w-12 text-xs font-bold text-slate-600 shrink-0 text-right">{r.time}</span>
                    
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      {/* Slot Cancha */}
                      <div className="min-h-[52px] flex items-center">
                        {canchaItem && (activeZone === 'ALL' || activeZone === 'CANCHA') ? (
                          <div
                            onClick={() => onSelectReserva && onSelectReserva(canchaItem)}
                            className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-2.5 shadow-xs cursor-pointer transition flex items-center justify-between group"
                          >
                            <div>
                              <div className="text-xs font-black text-[#1638BF]">
                                {canchaItem.horaInicio} - {canchaItem.horaFin} • {canchaItem.tipoEvento}
                              </div>
                              <div className="text-xs text-slate-700 font-medium">
                                {canchaItem.clienteNombre} ({canchaItem.clienteTelefono})
                              </div>
                            </div>
                            <span className="text-[11px] font-bold bg-[#D8F600] text-slate-950 px-2 py-0.5 rounded">
                              S/ {canchaItem.montoTotal}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-10 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                            Disponible
                          </div>
                        )}
                      </div>

                      {/* Slot Eventos */}
                      <div className="min-h-[52px] flex items-center">
                        {eventoItem && (activeZone === 'ALL' || activeZone === 'EVENTOS') ? (
                          <div
                            onClick={() => onSelectReserva && onSelectReserva(eventoItem)}
                            className="w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-2.5 shadow-xs cursor-pointer transition flex items-center justify-between group"
                          >
                            <div>
                              <div className="text-xs font-black text-[#EA580C]">
                                {eventoItem.horaInicio} - {eventoItem.horaFin} • {eventoItem.tipoEvento}
                              </div>
                              <div className="text-xs text-slate-700 font-medium">
                                {eventoItem.clienteNombre}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold bg-[#FF6A00] text-white px-2 py-0.5 rounded">
                              S/ {eventoItem.montoTotal}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-10 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                            Disponible
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel Resumen del Día Seleccionado (4 cols) */}
          {(() => {
            const dayReservas = reservas.filter(r => {
              const parts = r.fecha.split('-');
              return parseInt(parts[2] || '0', 10) === selectedDay;
            });
            const totalReservasDia = dayReservas.length;
            const totalMontoEstimado = dayReservas.reduce((acc, r) => acc + (r.montoTotal || 0), 0);

            return (
              <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Detalle de Jornada</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">Día {selectedDay} de {months[monthIndex]}</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Total Reservas del Día</span>
                    <span className="text-base font-black text-[#1638BF]">{totalReservasDia} activas</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Canchas / Eventos</span>
                    <span className="text-base font-black text-slate-900">
                      {dayReservas.filter(r => r.zona === 'CANCHA').length} Cancha • {dayReservas.filter(r => r.zona === 'EVENTOS').length} Eventos
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Recaudación Estimada</span>
                    <span className="text-base font-black text-emerald-600">S/ {totalMontoEstimado.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNewReserva('CANCHA')}
                    className="w-full bg-[#D8F600] hover:bg-[#c9e600] text-[#0F2276] font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer text-center block"
                  >
                    + Reservar en este día
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

      </div>

    </div>
  );
};

