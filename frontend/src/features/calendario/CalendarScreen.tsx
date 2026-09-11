import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Plus, Home, Sparkles } from 'lucide-react';
import { Reserva, ZonaTipo } from '../../types';

interface CalendarScreenProps {
  reservas: Reserva[];
  onNewReserva: (zona?: ZonaTipo) => void;
  onSelectReserva?: (reserva: Reserva) => void;
}

interface DayItem {
  dayName: string;
  dateNumber: number;
  fullDate: string;
  dateObj: Date;
}

interface DayRouletteProps {
  days: DayItem[];
  selectedDateStr: string;
  todayStr: string;
  onSelectDay: (day: DayItem) => void;
  isDesktop?: boolean;
}

const DayRoulette: React.FC<DayRouletteProps> = ({
  days,
  selectedDateStr,
  todayStr,
  onSelectDay,
  isDesktop = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const snapTimeoutRef = useRef<number | null>(null);

  const [scrollPos, setScrollPos] = useState(0);
  const [containerWidth, setContainerWidth] = useState(360);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth || 360);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const scrollToSelectedDate = useCallback((smooth = true) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const selectedEl = container.querySelector(`[data-date="${selectedDateStr}"]`) as HTMLElement;
    if (selectedEl) {
      const left = selectedEl.offsetLeft - container.offsetWidth / 2 + selectedEl.offsetWidth / 2;
      container.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    }
  }, [selectedDateStr]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToSelectedDate(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [selectedDateStr, days, scrollToSelectedDate]);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPos(containerRef.current.scrollLeft);
    }

    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    snapTimeoutRef.current = window.setTimeout(() => {
      if (!isDraggingRef.current && containerRef.current) {
        const container = containerRef.current;
        const center = container.scrollLeft + container.offsetWidth / 2;
        const items = Array.from(container.querySelectorAll('[data-date]')) as HTMLElement[];
        
        let closestItem: HTMLElement | null = null;
        let minDiff = Infinity;

        items.forEach((item) => {
          const itemCenter = item.offsetLeft + item.offsetWidth / 2;
          const diff = Math.abs(center - itemCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestItem = item;
          }
        });

        if (closestItem) {
          const targetDateStr = (closestItem as HTMLElement).getAttribute('data-date');
          const matchedDay = days.find(d => d.fullDate === targetDateStr);
          if (matchedDay && matchedDay.fullDate !== selectedDateStr) {
            onSelectDay(matchedDay);
          }
        }
      }
    }, 120);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (containerRef.current && e.deltaY !== 0) {
      containerRef.current.scrollLeft += e.deltaY * 0.85;
    }
  };

  const handleClickItem = (d: DayItem) => {
    if (!hasMovedRef.current) {
      onSelectDay(d);
    }
  };

  const getItem3DStyle = (index: number) => {
    if (!containerRef.current) return {};
    const itemWidth = isDesktop ? 58 : 50;
    const itemCenter = index * (itemWidth + 8) + itemWidth / 2 + (isDesktop ? 32 : 24);
    const centerViewport = scrollPos + containerWidth / 2;
    const diff = itemCenter - centerViewport;
    const maxDistance = containerWidth / 1.7;

    const normalized = Math.max(-1.2, Math.min(1.2, diff / maxDistance));
    
    // Curvatura 3D cilíndrica de ruleta
    const rotateY = normalized * 42;
    const translateZ = -Math.pow(Math.abs(normalized), 1.8) * 45;
    const scale = Math.max(0.78, 1.12 - Math.pow(Math.abs(normalized), 1.4) * 0.34);
    const opacity = Math.max(0.45, 1 - Math.pow(Math.abs(normalized), 1.3) * 0.55);

    return {
      transform: `perspective(600px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      zIndex: Math.round((1 - Math.abs(normalized)) * 20),
      transition: isDraggingRef.current ? 'none' : 'transform 0.12s ease-out, opacity 0.12s ease-out'
    };
  };

  return (
    <div className={`relative w-full ${isDesktop ? 'max-w-[500px]' : ''} overflow-hidden select-none py-1`}>
      {/* Difuminado en los extremos para profundizar el efecto cilíndrico de ruleta */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex gap-2 overflow-x-auto py-2.5 px-8 md:px-12 scrollbar-none items-center [perspective:800px] cursor-grab active:cursor-grabbing scroll-smooth"
      >
        {days.map((d, index) => {
          const isSelected = d.fullDate === selectedDateStr;
          const isToday = d.fullDate === todayStr;
          const style3D = getItem3DStyle(index);

          return (
            <button
              key={d.fullDate}
              data-date={d.fullDate}
              type="button"
              onClick={() => handleClickItem(d)}
              style={style3D}
              className={`relative shrink-0 flex flex-col items-center justify-center rounded-2xl cursor-pointer will-change-transform ${
                isDesktop ? 'w-14 h-16' : 'w-12 h-14'
              } ${
                isSelected
                  ? 'bg-[#D8F600] text-slate-950 font-black shadow-lg ring-2 ring-[#0F2276]/30'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
              }`}
            >
              <span className={`text-[10px] ${isSelected ? 'font-black text-slate-950' : 'font-bold text-slate-500'} leading-tight`}>
                {d.dayName}
              </span>
              <span className={`text-[16px] md:text-[17px] ${isSelected ? 'font-black text-slate-950' : 'font-black text-slate-800'} leading-tight`}>
                {d.dateNumber}
              </span>
              {isToday && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2142E7] mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  reservas,
  onNewReserva,
  onSelectReserva
}) => {
  // Siempre iniciamos con la fecha actual del día de hoy
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [activeZone, setActiveZone] = useState<ZonaTipo | 'ALL'>('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  // Fecha de hoy real
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Fecha seleccionada en formato YYYY-MM-DD
  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Navegación de mes: al cambiar de mes seleccionamos el día 1 de ese mes (o el día de hoy si regresamos al mes actual)
  const handlePrevMonth = () => {
    const targetDate = new Date(year, month - 1, 1);
    const isTargetCurrentMonth = targetDate.getMonth() === today.getMonth() && targetDate.getFullYear() === today.getFullYear();
    if (isTargetCurrentMonth) {
      setCurrentDate(new Date(today));
    } else {
      setCurrentDate(targetDate);
    }
  };

  const handleNextMonth = () => {
    const targetDate = new Date(year, month + 1, 1);
    const isTargetCurrentMonth = targetDate.getMonth() === today.getMonth() && targetDate.getFullYear() === today.getFullYear();
    if (isTargetCurrentMonth) {
      setCurrentDate(new Date(today));
    } else {
      setCurrentDate(targetDate);
    }
  };

  // Generación de todos los días del mes actual para el carrusel de rueda
  const getMonthDays = (yr: number, mth: number) => {
    const daysInMonth = new Date(yr, mth + 1, 0).getDate();
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    const days: DayItem[] = [];
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const dObj = new Date(yr, mth, dNum);
      const dayIndex = dObj.getDay(); // 0 Dom, 1 Lun, ...
      const dDateStr = `${yr}-${String(mth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      days.push({
        dayName: dayNames[dayIndex],
        dateNumber: dNum,
        fullDate: dDateStr,
        dateObj: dObj
      });
    }
    return days;
  };

  const monthDays = getMonthDays(year, month);

  const handleSelectDay = (d: DayItem) => {
    setCurrentDate(new Date(d.dateObj));
  };

  // Horarios de la grilla
  const timeRows = [
    { time: '08:00', hour: 8 },
    { time: '10:00', hour: 10 },
    { time: '12:00', hour: 12 },
    { time: '14:00', hour: 14 },
    { time: '16:00', hour: 16 },
    { time: '18:00', hour: 18 },
    { time: '20:00', hour: 20 },
    { time: '22:00', hour: 22 },
  ];

  // Reservas activas del día seleccionado
  const allDayReservas = reservas.filter(r => r.fecha === selectedDateStr && r.estado !== 'CANCELADA');
  const dayReservas = allDayReservas.filter(r => activeZone === 'ALL' || r.zona === activeZone);
  const canchasCount = allDayReservas.filter(r => r.zona === 'CANCHA').length;
  const eventosCount = allDayReservas.filter(r => r.zona === 'EVENTOS').length;
  const dayRevenue = dayReservas.reduce((acc, r) => acc + (r.montoTotal || 0), 0);

  const findCanchaReserva = (hour: number) => {
    return allDayReservas.find(res => {
      if (res.zona !== 'CANCHA') return false;
      const startH = parseInt(res.horaInicio.split(':')[0], 10);
      return startH === hour || (startH >= hour && startH < hour + 2);
    });
  };

  const findEventoReserva = (hour: number) => {
    return allDayReservas.find(res => {
      if (res.zona !== 'EVENTOS') return false;
      const startH = parseInt(res.horaInicio.split(':')[0], 10);
      return startH === hour || (startH >= hour && startH < hour + 2);
    });
  };

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
                {MONTH_NAMES[month]} {year}
              </h2>
              
              <button 
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full border border-[#2142E7] flex items-center justify-center text-[#2142E7] hover:bg-blue-50 active:scale-95 transition cursor-pointer"
                title="Siguiente mes"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Ruleta 3D Circular de Días */}
            <DayRoulette
              days={monthDays}
              selectedDateStr={selectedDateStr}
              todayStr={todayStr}
              onSelectDay={handleSelectDay}
            />

            {/* Selector de Filtros de Zona: Todas | Cancha | Eventos */}
            <div className="grid grid-cols-3 gap-1.5 mb-4 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveZone('ALL')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                  activeZone === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setActiveZone('CANCHA')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeZone === 'CANCHA'
                    ? 'bg-[#1638BF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>Cancha</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveZone('EVENTOS')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeZone === 'EVENTOS'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Eventos</span>
              </button>
            </div>

            {/* Tabla de Horarios Adaptable según Filtro Activo */}
            <div className="flex gap-2 items-stretch">
              
              {/* Columna de Horas */}
              <div className="w-11 flex flex-col justify-between py-1 text-right pr-1 shrink-0">
                {timeRows.map((r) => (
                  <div key={r.time} className="h-14 flex items-start justify-end text-[11px] font-bold text-slate-800 pt-0.5">
                    {r.time}
                  </div>
                ))}
              </div>

              {/* Grid 1 o 2 Columnas */}
              <div className={`flex-1 border border-slate-200 rounded-xl overflow-hidden bg-white grid ${
                activeZone === 'ALL' ? 'grid-cols-2 divide-x' : 'grid-cols-1'
              } divide-slate-200`}>
                
                {/* Columna Cancha */}
                {(activeZone === 'ALL' || activeZone === 'CANCHA') && (
                  <div className="divide-y divide-slate-200">
                    {activeZone === 'ALL' && (
                      <div className="bg-blue-50/80 py-1 text-center text-[10px] font-black text-[#1638BF] border-b border-slate-200">
                        Cancha
                      </div>
                    )}
                    {timeRows.map((r) => {
                      const canchaItem = findCanchaReserva(r.hour);

                      return (
                        <div key={`cancha-${r.time}`} className="h-14 p-1 flex flex-col justify-center">
                          {canchaItem ? (
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
                                Cliente: {canchaItem.clienteNombre}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-300 text-center font-medium">
                              Libre
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Columna Eventos */}
                {(activeZone === 'ALL' || activeZone === 'EVENTOS') && (
                  <div className="divide-y divide-slate-200">
                    {activeZone === 'ALL' && (
                      <div className="bg-orange-50/80 py-1 text-center text-[10px] font-black text-[#FF6A00] border-b border-slate-200">
                        Eventos
                      </div>
                    )}
                    {timeRows.map((r) => {
                      const eventoItem = findEventoReserva(r.hour);

                      return (
                        <div key={`eventos-${r.time}`} className="h-14 p-1 flex flex-col justify-center">
                          {eventoItem ? (
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
                                Cliente: {eventoItem.clienteNombre}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-300 text-center font-medium">
                              Libre
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Botón "+ Nueva reserva" */}
          <div className="pt-3">
            <button
              onClick={() => onNewReserva(activeZone === 'EVENTOS' ? 'EVENTOS' : 'CANCHA')}
              className={`w-full active:scale-[0.98] text-white font-bold text-[15px] py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer ${
                activeZone === 'EVENTOS'
                  ? 'bg-[#FF6A00] hover:bg-orange-600'
                  : 'bg-[#2442E7] hover:bg-blue-700'
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Nueva reserva ({activeZone === 'EVENTOS' ? 'Eventos' : 'Cancha'})</span>
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
            <h2 className="text-xl font-black text-slate-900 tracking-tight min-w-[160px] text-center">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button 
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Siguiente mes"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Ruleta 3D Circular de Días del Mes */}
          <DayRoulette
            days={monthDays}
            selectedDateStr={selectedDateStr}
            todayStr={todayStr}
            onSelectDay={handleSelectDay}
            isDesktop
          />

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
              onClick={() => onNewReserva(activeZone === 'EVENTOS' ? 'EVENTOS' : 'CANCHA')}
              className={`text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                activeZone === 'EVENTOS'
                  ? 'bg-[#FF6A00] hover:bg-orange-600'
                  : 'bg-[#1638BF] hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Reserva {activeZone === 'EVENTOS' ? '(Eventos)' : activeZone === 'CANCHA' ? '(Cancha)' : ''}</span>
            </button>
          </div>

        </div>

        {/* 2-Column Grid: Timetable & Day Summary Panel */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Grilla Horaria (8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horario</span>
              <div className={`grid ${activeZone === 'ALL' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 flex-1 pl-12 text-center text-xs font-black uppercase`}>
                {(activeZone === 'ALL' || activeZone === 'CANCHA') && (
                  <span className="text-[#1638BF] flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1638BF]" />
                    Zona Cancha Sintética
                  </span>
                )}
                {(activeZone === 'ALL' || activeZone === 'EVENTOS') && (
                  <span className="text-[#FF6A00] flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
                    Zona Eventos & Parrillas
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {timeRows.map((r) => {
                const canchaItem = findCanchaReserva(r.hour);
                const eventoItem = findEventoReserva(r.hour);

                return (
                  <div key={r.time} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                    <span className="w-12 text-xs font-bold text-slate-600 shrink-0 text-right">{r.time}</span>
                    
                    <div className={`grid ${activeZone === 'ALL' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 flex-1`}>
                      {/* Slot Cancha */}
                      {(activeZone === 'ALL' || activeZone === 'CANCHA') && (
                        <div className="min-h-[52px] flex items-center">
                          {canchaItem ? (
                            <div
                              onClick={() => onSelectReserva && onSelectReserva(canchaItem)}
                              className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-2.5 shadow-xs cursor-pointer transition flex items-center justify-between group"
                            >
                              <div>
                                <div className="text-xs font-black text-[#1638BF]">
                                  {canchaItem.horaInicio} - {canchaItem.horaFin} • {canchaItem.tipoEvento}
                                </div>
                                <div className="text-xs text-slate-700 font-medium">
                                  {canchaItem.clienteNombre} {canchaItem.clienteTelefono ? `(${canchaItem.clienteTelefono})` : ''}
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
                      )}

                      {/* Slot Eventos */}
                      {(activeZone === 'ALL' || activeZone === 'EVENTOS') && (
                        <div className="min-h-[52px] flex items-center">
                          {eventoItem ? (
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel Resumen del Día Seleccionado (4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Detalle de Jornada</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Día {day} de {MONTH_NAMES[month]} {year}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  {activeZone === 'ALL' ? 'Total Reservas del Día' : `Reservas de ${activeZone === 'CANCHA' ? 'Cancha' : 'Eventos'}`}
                </span>
                <span className="text-base font-black text-[#1638BF]">{dayReservas.length} activas</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Canchas / Eventos</span>
                <span className="text-base font-black text-slate-900">
                  {canchasCount} Cancha • {eventosCount} Eventos
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Recaudación Estimada</span>
                <span className="text-base font-black text-emerald-600">S/ {dayRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNewReserva(activeZone === 'EVENTOS' ? 'EVENTOS' : 'CANCHA')}
                className="w-full bg-[#D8F600] hover:bg-[#c9e600] text-[#0F2276] font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer text-center block"
              >
                + Reservar en este día ({activeZone === 'EVENTOS' ? 'Eventos' : 'Cancha'})
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};


