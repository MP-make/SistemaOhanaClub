import React, { useState } from 'react';
import { Menu, Bell, ShoppingCart, ArrowLeft, Filter, CalendarDays, LogOut, X, User, ShieldCheck, Home, Calendar, Package, Archive, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { ScreenType, ZonaTipo } from '../../types';
import { Logo } from '../shared/Logo';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onLogout?: () => void;
  onBack?: () => void;
  cartCount?: number;
  zonaReserva?: ZonaTipo;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onLogout,
  onBack,
  cartCount = 0,
  zonaReserva = 'CANCHA',
  onToggleSidebar
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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
      case 'reportes': return 'Reportes Mensuales';
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
                className="w-full bg-[#D8F600] hover:bg-[#c9e600] active:scale-[0.98] text-[#0F2276] font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#0F2276] stroke-[2.5]" />
                  <span className="tracking-wide text-[13px] font-black">+ NUEVA RESERVA</span>
                </div>
                <span className="text-xs opacity-70">➔</span>
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

      {/* ================= MODAL / CENTRO DE NOTIFICACIONES (MOVIL Y DESKTOP) ================= */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn select-none">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1638BF] flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Centro de Notificaciones</h3>
                  <p className="text-xs text-slate-500">Avisos del local en tiempo real</p>
                </div>
              </div>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto no-scrollbar">
              <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">8 Reservas activas hoy</p>
                  <p className="text-slate-600 mt-0.5">5 turnos en Cancha Sintética y 3 eventos programados.</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Aviso de Inventario</p>
                  <p className="text-slate-600 mt-0.5">Bebidas isotónicas y gaseosas con stock controlado.</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Caja y Cobros Operativos</p>
                  <p className="text-slate-600 mt-0.5">Cobros en efectivo, Yape, Plin y tarjeta sincronizados con la base de datos.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setIsNotifOpen(false)}
                className="w-full bg-[#1638BF] hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
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
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6A00]" />
          </button>
        </div>
      </header>
    </>
  );
};
