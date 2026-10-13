import React, { useState, useEffect } from 'react';
import { Menu, Bell, ShoppingCart, ArrowLeft, Filter, CalendarDays, LogOut, X, User, ShieldCheck, Home, Calendar, Package, Archive, CheckCircle2, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { ScreenType, ZonaTipo, Reserva } from '../../types';
import { Logo } from '../shared/Logo';
import { apiService, localStore } from '../../services/api';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onLogout?: () => void;
  onBack?: () => void;
  cartCount?: number;
  zonaReserva?: ZonaTipo;
  onToggleSidebar?: () => void;
  onReservaActualizada?: () => void;
}

interface AlertaReserva {
  id: string;
  reservaId: string;
  tipo: 'PROXIMA' | 'DEMORADA' | 'EN_CURSO';
  clienteNombre: string;
  horaInicio: string;
  horaFin: string;
  zona: ZonaTipo;
  mensaje: string;
  minutosDiferencia: number;
  saldoPendiente: number;
  adelanto: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onLogout,
  onBack,
  cartCount = 0,
  zonaReserva = 'CANCHA',
  onToggleSidebar,
  onReservaActualizada
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notificacionesEnVivo, setNotificacionesEnVivo] = useState<AlertaReserva[]>([]);

  // Función para evaluar el estado en tiempo real de las reservas
  const calcularNotificaciones = async () => {
    try {
      const reservas = await apiService.getReservas();
      const now = new Date();
      // Formato YYYY-MM-DD local
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const alertas: AlertaReserva[] = [];

      reservas.forEach(r => {
        if (r.estado === 'CANCELADA') return;

        // Si es de hoy o de fechas recientes para pruebas
        const [hStart, mStart] = r.horaInicio.split(':').map(Number);
        const [hEnd, mEnd] = r.horaFin.split(':').map(Number);
        const startMin = (hStart || 0) * 60 + (mStart || 0);
        const endMin = (hEnd || 0) * 60 + (mEnd || 0);

        // Diferencia en minutos respecto a la hora de inicio (positivo = ya pasó la hora)
        const diff = nowMinutes - startMin;

        // 1. Caso Próxima (Faltan entre 0 y 60 min para que empiece)
        if (diff < 0 && Math.abs(diff) <= 60) {
          alertas.push({
            id: `notif-prox-${r.id}`,
            reservaId: r.id,
            tipo: 'PROXIMA',
            clienteNombre: r.clienteNombre,
            horaInicio: r.horaInicio,
            horaFin: r.horaFin,
            zona: r.zona,
            mensaje: `El turno comienza en ${Math.abs(diff)} min. Margen de anticipación permitido: hasta 15 min antes.`,
            minutosDiferencia: diff,
            saldoPendiente: r.saldoPendiente,
            adelanto: r.adelanto
          });
        }
        // 2. Caso Demorada / En tolerancia de 15 minutos (Pasó entre 1 y 30 minutos de la hora indicada)
        else if (diff >= 0 && diff <= 30) {
          alertas.push({
            id: `notif-demo-${r.id}`,
            reservaId: r.id,
            tipo: 'DEMORADA',
            clienteNombre: r.clienteNombre,
            horaInicio: r.horaInicio,
            horaFin: r.horaFin,
            zona: r.zona,
            mensaje: diff <= 15 
              ? `Tolerancia de llegada activa: ${diff} min transcurridos (límite máximo: 15 min de espera para respetar su horario).` 
              : `¡Tolerancia vencida! Han pasado ${diff} min desde la hora pactada (${r.horaInicio}). Verificar si asiste o liberar turno.`,
            minutosDiferencia: diff,
            saldoPendiente: r.saldoPendiente,
            adelanto: r.adelanto
          });
        }
        // 3. Caso En Curso con Saldo Pendiente
        else if (nowMinutes >= startMin && nowMinutes < endMin) {
          alertas.push({
            id: `notif-curso-${r.id}`,
            reservaId: r.id,
            tipo: 'EN_CURSO',
            clienteNombre: r.clienteNombre,
            horaInicio: r.horaInicio,
            horaFin: r.horaFin,
            zona: r.zona,
            mensaje: r.saldoPendiente > 0 
              ? `Turno en juego. Recuerda cobrar el saldo restante de S/ ${r.saldoPendiente.toFixed(2)}.`
              : 'Turno en juego. Horario cumpliéndose con normalidad (100% Pagado).',
            minutosDiferencia: diff,
            saldoPendiente: r.saldoPendiente,
            adelanto: r.adelanto
          });
        }
        // Si tiene saldo pendiente, incluirlo para gestión de cobranza
        else if (r.saldoPendiente > 0) {
          alertas.push({
            id: `notif-saldo-${r.id}`,
            reservaId: r.id,
            tipo: 'PROXIMA',
            clienteNombre: r.clienteNombre,
            horaInicio: r.horaInicio,
            horaFin: r.horaFin,
            zona: r.zona,
            mensaje: `Turno agendado (${r.fecha}). Cobro pendiente por liquidar: S/ ${r.saldoPendiente.toFixed(2)}.`,
            minutosDiferencia: diff,
            saldoPendiente: r.saldoPendiente,
            adelanto: r.adelanto
          });
        }
      });

      // Ordenar: primero demoradas, luego en curso, luego próximas
      alertas.sort((a, b) => {
        const peso = { DEMORADA: 1, EN_CURSO: 2, PROXIMA: 3 };
        return peso[a.tipo] - peso[b.tipo];
      });

      setNotificacionesEnVivo(alertas);
    } catch (e) {
      console.warn('Error al calcular notificaciones:', e);
    }
  };

  useEffect(() => {
    calcularNotificaciones();
    const interval = setInterval(calcularNotificaciones, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [currentScreen]);

  // Manejador para otorgar 15 min de espera (o restar)
  const handleProrrogar15 = async (reservaId: string, delta: number) => {
    try {
      await apiService.prorrogarReserva(reservaId, delta);
      alert(`Se aplicó un ajuste de ${delta > 0 ? `+${delta}` : delta} minutos al turno.`);
      await calcularNotificaciones();
      if (onReservaActualizada) onReservaActualizada();
    } catch (err: any) {
      alert(err.message || 'Error al prorrogar reserva');
    }
  };

  // Manejador para cobrar el saldo pendiente directamente desde la notificación
  const handleCobrarSaldo = async (reservaId: string) => {
    try {
      const updated = await apiService.cobrarSaldoReserva(reservaId, 'EFECTIVO');
      alert(`¡Saldo cobrado con éxito! Reserva de ${updated.clienteNombre} ahora está PAGADA.`);
      await calcularNotificaciones();
      if (onReservaActualizada) onReservaActualizada();
    } catch (err: any) {
      alert(err.message || 'Error al cobrar saldo');
    }
  };

  if (currentScreen === 'login') return null;

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleNavAndClose = (screen: ScreenType) => {
    setIsDrawerOpen(false);
    onNavigate(screen);
  };

  const handleLogoutAndClose = () => {
    setIsDrawerOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('login');
    }
  };

  const handleCartClick = () => {
    const el = document.getElementById('ticket-resumen');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getTitle = () => {
    switch (currentScreen) {
      case 'dashboard': return 'Panel Principal';
      case 'calendario': return 'Calendario';
      case 'nueva_reserva': return 'Nueva Reserva';
      case 'pos': return 'Minimarket POS';
      case 'inventario': return 'Inventario';
      case 'caja': return 'Cierre de caja';
      case 'reportes': return 'Reportes y Finanzas';
      default: return 'Ohana Club';
    }
  };

  return (
    <>
      {/* ================= HEADER MOVIL (< md) - FIEL A FIGMA ================= */}
      <div className="md:hidden">
        {currentScreen === 'dashboard' ? (
          <header className="bg-gradient-to-b from-[#10258F] to-[#1638BF] text-white px-5 pt-8 pb-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="origin-left">
                <Logo size="md" showSubtitle={false} className="h-13 w-13" />
              </div>
              <div>
                <h1 className="text-[19px] font-black text-[#D8F600] leading-tight tracking-tight">
                  ¡Bienvenido,Staff!
                </h1>
                <p className="text-[13px] text-white/90 font-medium">Ohana Club</p>
              </div>
            </div>
            
            {/* Campana de notificaciones con trazo limpio */}
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="p-2 text-[#D8F600] hover:opacity-80 active:scale-95 transition cursor-pointer relative"
              title="Notificaciones"
            >
              <Bell className="w-6 h-6 stroke-[2]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6A00]" />
            </button>
          </header>
        ) : currentScreen === 'nueva_reserva' ? (
          <header className="bg-[#1638BF] text-white px-4 pt-6 pb-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack || (() => onNavigate('calendario'))}
                className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
                title="Volver"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-lg font-bold text-white">Nueva reserva</h1>
            </div>
            <div className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${
              zonaReserva === 'CANCHA' 
                ? 'bg-[#1B3BB6] text-white border border-blue-400/40' 
                : 'bg-[#F97316] text-white'
            }`}>
              {zonaReserva === 'CANCHA' ? 'Zona Cancha' : 'Zona Eventos'}
            </div>
          </header>
        ) : currentScreen === 'calendario' ? (
          <header className="bg-gradient-to-b from-[#10258F] to-[#1638BF] text-white px-5 pt-6 pb-4 flex items-center justify-between shadow-xs">
            <button
              onClick={handleOpenDrawer}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Menú"
            >
              <Menu className="w-6 h-6 stroke-[#D8F600] stroke-[2.5]" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">Calendario</h1>
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer relative"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5 stroke-[2.5] text-[#D8F600]" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
            </button>
          </header>
        ) : currentScreen === 'pos' ? (
          <header className="bg-gradient-to-b from-[#10258F] to-[#1638BF] text-white px-5 pt-6 pb-4 flex items-center justify-between shadow-xs">
            <button
              onClick={handleOpenDrawer}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Menú"
            >
              <Menu className="w-6 h-6 stroke-[#D8F600] stroke-[2.5]" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">Minimarket POS</h1>
            <button 
              onClick={handleCartClick}
              className="relative p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Ver Ticket de Venta"
            >
              <ShoppingCart className="w-6 h-6 fill-[#D8F600] text-[#D8F600]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6A00] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </header>
        ) : currentScreen === 'inventario' ? (
          <header className="bg-gradient-to-b from-[#10258F] to-[#1638BF] text-white px-5 pt-6 pb-4 flex items-center justify-between shadow-xs">
            <button
              onClick={handleOpenDrawer}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Menú"
            >
              <Menu className="w-6 h-6 stroke-[#D8F600] stroke-[2.5]" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">Inventario</h1>
            <button
              onClick={() => setIsNotifOpen(true)}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </button>
          </header>
        ) : currentScreen === 'caja' ? (
          <header className="bg-gradient-to-b from-[#10258F] to-[#1638BF] text-white px-5 pt-6 pb-4 flex items-center justify-between shadow-xs">
            <button
              onClick={handleOpenDrawer}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Menú"
            >
              <Menu className="w-6 h-6 stroke-[#D8F600] stroke-[2.5]" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">Cierre de caja</h1>
            <button
              onClick={() => setIsNotifOpen(true)}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </button>
          </header>
        ) : (
          <header className="bg-[#1638BF] text-white px-5 pt-6 pb-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenDrawer}
                className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-white cursor-pointer"
                title="Menú"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold text-white">{getTitle()}</h1>
            </div>
            <button
              onClick={() => setIsNotifOpen(true)}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition text-[#D8F600] cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
            </button>
          </header>
        )}
      </div>

      {/* ================= DRAWER MODAL MÓVIL (Z-[9999] CUBRE TODO INCLUYENDO BOTTOM NAV) ================= */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[9999] flex animate-fadeIn select-none">
          {/* Backdrop desenfocado que oscurece el fondo */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Panel Lateral Deslizante desde la Izquierda */}
          <div className="relative w-[85%] max-w-[320px] bg-gradient-to-b from-[#0D1C68] via-[#10258F] to-[#1638BF] text-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-slideRight border-r border-blue-400/20">
            
            {/* Header del Drawer */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-blue-900/60">
                <div className="flex items-center gap-3">
                  <Logo size="sm" showSubtitle={false} className="h-10 w-10" />
                  <div>
                    <h2 className="text-base font-black text-[#D8F600] tracking-tight">Ohana Club</h2>
                    <p className="text-[11px] text-blue-200 font-medium">Panel de Usuario</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition cursor-pointer"
                  title="Cerrar Menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tarjeta de Perfil de Usuario Logeado */}
              {(() => {
                let currentUser = {
                  nombre_completo: 'Staff Turno Mañana',
                  email: 'staff@ohanaclub.pe',
                  username: 'staff',
                  rol: 'staff'
                };
                try {
                  const stored = localStorage.getItem('ohana_current_user');
                  if (stored) currentUser = JSON.parse(stored);
                } catch {}

                const initial = currentUser.nombre_completo ? currentUser.nombre_completo.charAt(0).toUpperCase() : (currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U');
                const displayName = currentUser.nombre_completo || currentUser.username || 'Usuario';
                const displayEmail = currentUser.email || `${currentUser.username}@ohanaclub.pe`;
                const displayRol = currentUser.rol === 'admin' ? 'Administrador' : 'Staff General';

                return (
                  <div className="my-5 p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#D8F600] text-[#0F2276] flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        {initial}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-white truncate">{displayName}</h3>
                          <ShieldCheck className="w-4 h-4 text-[#D8F600] shrink-0" />
                        </div>
                        <span className="text-xs text-blue-200 font-medium block truncate">{displayEmail}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-blue-200">
                      <span>Rol en Sistema:</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${currentUser.rol === 'admin' ? 'text-[#D8F600] bg-blue-900/80 border border-[#D8F600]/30' : 'text-white bg-blue-900/50'}`}>
                        {displayRol}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Botón Central: + NUEVA RESERVA */}
              <button
                onClick={() => handleNavAndClose('nueva_reserva')}
                className="w-full bg-[#D8F600] hover:bg-[#c9e600] active:scale-[0.98] text-[#0F2276] font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-between transition cursor-pointer mb-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#0F2276] stroke-[2.5]" />
                  <span className="tracking-wide text-[13px] font-black">+ NUEVA RESERVA</span>
                </div>
                <span className="text-xs opacity-70">➔</span>
              </button>

              {/* Botón Acceso a Reportes */}
              <button
                onClick={() => handleNavAndClose('reportes')}
                className="w-full bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-xs py-3 px-4 rounded-2xl border border-white/20 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-[#D8F600]">REP</span>
                  <span className="tracking-wide text-xs">Centro de Reportes</span>
                </div>
                <span className="text-xs text-[#D8F600] font-black">Ver</span>
              </button>

              {/* Tarjeta de Información de Turno y Estado */}
              <div className="mt-4 p-3.5 bg-blue-900/30 rounded-2xl border border-blue-800/40 space-y-2 text-xs">
                <div className="flex justify-between items-center text-blue-200">
                  <span>Terminal Operativo:</span>
                  <span className="font-bold text-white">#01 Local</span>
                </div>
                <div className="flex justify-between items-center text-blue-200">
                  <span>Horario de Turno:</span>
                  <span className="font-bold text-white">08:00 - 23:00</span>
                </div>
                <div className="flex justify-between items-center text-blue-200">
                  <span>Estado de Red:</span>
                  <span className="font-bold text-emerald-400">● Conectado</span>
                </div>
              </div>
            </div>

            {/* Footer con Botón Cerrar Sesión */}
            <div className="pt-4 border-t border-blue-900/60">
              <button
                onClick={handleLogoutAndClose}
                className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                <span>Cerrar Sesión</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= POPOVER / DROPDOWN DE NOTIFICACIONES ESTILO FACEBOOK ================= */}
      {isNotifOpen && (
        <>
          {/* Backdrop invisible para cerrar al hacer clic afuera */}
          <div 
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsNotifOpen(false)}
          />

          {/* Menú Desplegable Flotante tipo Facebook con Flecha Superior */}
          <div className="fixed sm:absolute top-16 right-3 sm:right-6 md:right-8 z-50 w-[94vw] sm:w-[420px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-slate-200/90 overflow-hidden animate-scaleUp select-none">
            
            {/* Cabecera estilo Facebook (Notifications, Mark as read, etc.) */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Notificaciones</h3>
                {notificacionesEnVivo.length > 0 && (
                  <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {notificacionesEnVivo.length} nuevas
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigate('calendario');
                  }}
                  className="text-xs font-bold text-[#1638BF] hover:underline cursor-pointer"
                >
                  Ver Agenda
                </button>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de Notificaciones estilo Facebook */}
            <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-100">
              {notificacionesEnVivo.length === 0 ? (
                <div className="text-center py-10 px-4 text-slate-400 text-xs">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 stroke-[1.5]" />
                  <p className="font-bold text-slate-700 text-sm">No tienes notificaciones nuevas</p>
                  <p className="text-slate-400 mt-1">Te avisaremos cuando se acerque una reserva o haya retrasos de llegada.</p>
                </div>
              ) : (
                notificacionesEnVivo.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsNotifOpen(false);
                      onNavigate('calendario');
                    }}
                    className="p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start group"
                  >
                    {/* Icono / Avatar lateral */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-xs ${
                        n.tipo === 'DEMORADA' 
                          ? 'bg-rose-100 text-rose-700' 
                          : n.tipo === 'EN_CURSO'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {n.zona === 'CANCHA' ? 'CANCHA' : 'EVENTOS'}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white flex items-center justify-center text-[8px] font-black ${
                        n.tipo === 'DEMORADA' ? 'bg-rose-500 text-white' : n.tipo === 'EN_CURSO' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        ●
                      </span>
                    </div>

                    {/* Contenido de la notificación */}
                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          n.tipo === 'DEMORADA'
                            ? 'bg-rose-100 text-rose-800'
                            : n.tipo === 'EN_CURSO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {n.tipo === 'DEMORADA' ? 'Tolerancia en espera' : n.tipo === 'EN_CURSO' ? 'Turno en curso' : 'Próxima reserva'}
                        </span>
                        <span className="text-[10.5px] font-bold text-slate-500">
                          {n.horaInicio} - {n.horaFin}
                        </span>
                      </div>

                      <p className="text-slate-800 text-xs font-semibold leading-snug">
                        <strong className="font-black text-slate-900">{n.clienteNombre}</strong> {n.mensaje}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Espacio: <b>{n.zona === 'CANCHA' ? 'Cancha Sintética' : 'Zona Eventos'}</b></span>
                        {n.saldoPendiente > 0 ? (
                          <span className="text-rose-600 font-bold">Resta S/ {n.saldoPendiente.toFixed(2)}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">✓ Pagado</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer estilo Facebook */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsNotifOpen(false);
                  onNavigate('calendario');
                }}
                className="w-full text-center text-xs font-bold text-[#1638BF] hover:text-blue-700 transition cursor-pointer"
              >
                Abrir Calendario para cobrar saldo o gestionar turnos →
              </button>
            </div>

          </div>
        </>
      )}

      {/* ================= TOPBAR DESKTOP / TABLET (>= md) ================= */}
      <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-[#1638BF]">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getTitle()}</h1>
              {currentScreen === 'nueva_reserva' && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  zonaReserva === 'CANCHA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {zonaReserva === 'CANCHA' ? 'Zona Cancha' : 'Zona Eventos'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">Ohana Club • Sistema Operativo en Red Local</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terminal Operativo Conectado</span>
          </div>

          <button 
            onClick={() => setIsNotifOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition relative cursor-pointer"
            title="Centro de Notificaciones"
          >
            <Bell className="w-5 h-5 text-[#1638BF]" />
            {notificacionesEnVivo.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </header>
    </>
  );
};
