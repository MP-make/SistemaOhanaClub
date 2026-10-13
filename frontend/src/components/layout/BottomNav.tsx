import React from 'react';
import { ScreenType } from '../../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  if (currentScreen === 'login') return null;

  const navItems = [
    { id: 'dashboard', label: 'Inicio', iconSrc: '/iconos/inicio.svg' },
    { id: 'calendario', label: 'Calendario', iconSrc: '/iconos/calendariomenu.svg' },
    { id: 'pos', label: 'POS', iconSrc: '/iconos/ventasmenu.svg' },
    { id: 'inventario', label: 'Inventario', iconSrc: '/iconos/inventariomenu.svg' },
    { id: 'caja', label: 'Caja', iconSrc: '/iconos/caja.svg' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-slate-100 py-2.5 px-2 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center w-full">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id || (item.id === 'calendario' && currentScreen === 'nueva_reserva');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ScreenType)}
              className={`flex flex-col items-center justify-center gap-1 py-0.5 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive ? 'text-[#1638BF] font-black' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className={`w-[28px] h-[28px] flex items-center justify-center rounded-lg ${isActive ? 'scale-110 drop-shadow-xs' : 'opacity-80'}`}>
                <img
                  src={item.iconSrc}
                  alt={item.label}
                  className="w-[28px] h-[28px] max-w-[28px] max-h-[28px] object-contain"
                />
              </div>
              <span className={`text-[11.5px] leading-tight tracking-tight ${isActive ? 'font-black text-[#1638BF]' : 'font-semibold text-slate-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
