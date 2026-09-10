import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  ShoppingCart, 
  Package, 
  Archive, 
  CalendarPlus, 
  LogOut, 
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Plus
} from 'lucide-react';
import { ScreenType } from '../../types';
import { Logo } from '../shared/Logo';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  onNewReserva: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onLogout,
  onNewReserva
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const navItems = [
    { 
      id: 'dashboard' as ScreenType, 
      label: 'Inicio / Dashboard', 
      icon: Home,
      badge: null
    },
    { 
      id: 'calendario' as ScreenType, 
      label: 'Calendario y Agenda', 
      icon: Calendar,
      badge: 'Hoy'
    },
    { 
      id: 'pos' as ScreenType, 
      label: 'Minimarket POS', 
      icon: ShoppingCart,
      badge: null
    },
    { 
      id: 'inventario' as ScreenType, 
      label: 'Inventario de Stock', 
      icon: Package,
      badge: null
    },
    { 
      id: 'caja' as ScreenType, 
      label: 'Cierre de Caja y Reportes', 
      icon: Archive,
      badge: null
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#132A85] text-white shrink-0 h-screen sticky top-0 border-r border-blue-900/40 shadow-xl select-none z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Brand Header con Botón de Colapsar / Expandir */}
      <div className={`p-4 border-b border-blue-900/60 flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="scale-90 origin-left">
                <Logo size="sm" showSubtitle={false} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-white tracking-wider">OHANA</span>
                  <span className="font-black text-[10px] text-[#0F2276] bg-[#D8F600] px-1.5 py-0.5 rounded font-bold">CLUB</span>
                </div>
                <p className="text-[11px] text-blue-200/70 font-medium">Gestión & Operaciones</p>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition cursor-pointer"
              title="Comprimir menú"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="scale-90">
              <Logo size="sm" showSubtitle={false} />
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D8F600] transition cursor-pointer"
              title="Expandir menú"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Action: Nueva Reserva */}
      <div className="p-3 pb-2">
        {!isCollapsed ? (
          <button
            onClick={onNewReserva}
            className="w-full bg-[#D8F600] hover:bg-[#c9e600] active:scale-[0.98] text-[#0F2276] font-black text-xs py-3 px-4 rounded-xl shadow-md flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-[#0F2276]" />
              <span className="tracking-wide">+ NUEVA RESERVA</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition" />
          </button>
        ) : (
          <button
            onClick={onNewReserva}
            className="w-12 h-12 mx-auto bg-[#D8F600] hover:bg-[#c9e600] active:scale-95 text-[#0F2276] font-black rounded-xl shadow-md flex items-center justify-center transition cursor-pointer"
            title="+ Nueva Reserva"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-2 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold text-blue-300/60 uppercase tracking-wider">
            Módulos del Sistema
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            currentScreen === item.id || 
            (item.id === 'calendario' && currentScreen === 'nueva_reserva') ||
            (item.id === 'caja' && currentScreen === 'reportes');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`w-full flex items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'justify-between px-3.5 py-3'
              } ${
                isActive
                  ? 'bg-blue-600/90 text-white shadow-md shadow-blue-950/40 border-l-4 border-[#D8F600]'
                  : 'text-blue-100/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#D8F600]' : 'text-blue-300'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="text-[10px] bg-[#D8F600] text-[#0F2276] font-black px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Staff Profile & Logout */}
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

        const displayName = currentUser.nombre_completo || currentUser.username || 'Usuario';
        const displayRol = currentUser.rol === 'admin' ? 'Administrador' : 'Staff Turno';

        return (
          <div className={`border-t border-blue-900/60 bg-blue-950/50 ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4'}`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-[#D8F600] shrink-0 font-bold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{displayName}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">{displayRol} • Online</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#D8F600] animate-pulse" title="Conectado a Base de Datos" />
                </div>

                <button
                  onClick={onLogout}
                  className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <div className="w-10 h-10 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-[#D8F600] font-bold text-sm" title={`${displayName} (${displayRol})`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </aside>
  );
};
