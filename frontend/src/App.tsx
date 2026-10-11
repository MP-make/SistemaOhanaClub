import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ScreenType, Reserva, Venta, ZonaTipo } from './types';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { Wifi, WifiOff } from 'lucide-react';
import { LoginScreen } from './features/auth/LoginScreen';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { CalendarScreen } from './features/calendario/CalendarScreen';
import { NuevaReservaScreen } from './features/reservas/NuevaReservaScreen';
import { PosScreen } from './features/pos/PosScreen';
import { InventarioScreen } from './features/inventario/InventarioScreen';
import { CierreCajaScreen } from './features/caja/CierreCajaScreen';
import { ReceiptModal } from './components/shared/ReceiptModal';
import { apiService } from './services/api';

const screenToPath: Record<ScreenType, string> = {
  login: '/login',
  dashboard: '/dashboard',
  calendario: '/calendario',
  nueva_reserva: '/reservas/nueva',
  pos: '/pos',
  inventario: '/inventario',
  caja: '/caja',
  reportes: '/caja',
};

const pathToScreen: Record<string, ScreenType> = {
  '/login': 'login',
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/calendario': 'calendario',
  '/reservas/nueva': 'nueva_reserva',
  '/nueva-reserva': 'nueva_reserva',
  '/pos': 'pos',
  '/inventario': 'inventario',
  '/caja': 'caja',
  '/reportes': 'caja',
};

export function App() {
  // Inicializar la pantalla leyendo la URL actual del navegador
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    return pathToScreen[path] || 'dashboard';
  });

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [selectedZonaReserva, setSelectedZonaReserva] = useState<ZonaTipo>('CANCHA');
  const [reservaPreload, setReservaPreload] = useState<{ fecha?: string; horaInicio?: string; horaFin?: string } | null>(null);

  // Detección de conectividad en tiempo real (Mitigación R05 y RNF05)
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);
  
  // Modal de Constancia / Recibo
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReservaReceipt, setActiveReservaReceipt] = useState<Reserva | null>(null);
  const [activeVentaReceipt, setActiveVentaReceipt] = useState<Venta | null>(null);

  // Sincronizar ruta al cambiar de pantalla o con los botones adelante/atrás del navegador
  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
    const targetPath = screenToPath[screen] || '/dashboard';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ screen }, '', targetPath);
    }
  };

  useEffect(() => {
    loadReservas();

    // Escuchar botones de Atrás / Adelante del navegador
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const screen = pathToScreen[path] || 'dashboard';
      setCurrentScreen(screen);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      setTimeout(() => setShowRestoredNotice(false), 4500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadReservas = async () => {
    const list = await apiService.getReservas();
    setReservas(list);
  };

  const handleLoginSuccess = () => {
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    navigateTo('login');
  };

  const handleOpenNuevaReserva = (zona: ZonaTipo = 'CANCHA', fecha?: string, horaInicio?: string, horaFin?: string) => {
    setSelectedZonaReserva(zona);
    if (fecha && horaInicio && horaFin) {
      setReservaPreload({ fecha, horaInicio, horaFin });
    } else {
      setReservaPreload(null);
    }
    navigateTo('nueva_reserva');
  };

  const handleReservaCreated = (reserva: Reserva) => {
    setReservas(prev => [reserva, ...prev]);
    setActiveReservaReceipt(reserva);
    setActiveVentaReceipt(null);
    setIsReceiptOpen(true);
    navigateTo('calendario');
  };

  const handleVentaCompleted = (venta: Venta) => {
    setActiveVentaReceipt(venta);
    setActiveReservaReceipt(null);
    setIsReceiptOpen(true);
  };

  const handleSelectReservaFromCalendar = (reserva: Reserva) => {
    setActiveReservaReceipt(reserva);
    setActiveVentaReceipt(null);
    setIsReceiptOpen(true);
  };

  // Si está en pantalla de Login, se renderiza a pantalla completa con aviso si está offline
  if (currentScreen === 'login') {
    return (
      <div className="relative min-h-screen">
        {!isOnline && (
          <aside 
            role="status"
            aria-live="assertive"
            className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between z-50 sticky top-0 border-b border-amber-600 animate-fadeIn"
          >
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full text-xs font-black">
              <WifiOff className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
              <span>
                ⚠️ Modo Offline Activo (Mitigación R05): Sin conexión Wi-Fi/red. Operando en almacenamiento local seguro.
              </span>
            </div>
          </aside>
        )}
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row antialiased select-none">
      {/* ================= SIDEBAR PARA TABLET Y DESKTOP (>= md) ================= */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        onLogout={handleLogout}
        onNewReserva={() => handleOpenNuevaReserva('CANCHA')}
      />

      {/* ================= CONTENEDOR PRINCIPAL FLUIDO ================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50 relative">
        
        {/* Banner de Mitigación de Riesgo R05 (Detección de Red Offline/Online) */}
        {!isOnline && (
          <aside 
            role="status"
            aria-live="assertive"
            className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between z-50 sticky top-0 border-b border-amber-600 animate-fadeIn"
          >
            <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full text-xs md:text-sm font-black">
              <WifiOff className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
              <span>
                ⚠️ Modo Offline Activo (Mitigación R05): Sin conexión Wi-Fi/red. Operando en almacenamiento local seguro; las operaciones se sincronizarán al reconectar.
              </span>
            </div>
          </aside>
        )}
        {showRestoredNotice && (
          <aside 
            role="status"
            aria-live="polite"
            className="bg-emerald-600 text-white px-4 py-2 shadow-md flex items-center justify-between z-50 sticky top-0 border-b border-emerald-700 animate-fadeIn"
          >
            <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full text-xs md:text-sm font-black">
              <Wifi className="w-4 h-4 text-white shrink-0" />
              <span>
                ✅ Conexión a internet restablecida. El sistema Ohana Club vuelve a estar en línea.
              </span>
            </div>
          </aside>
        )}

        {/* Header Superior (Móvil con estilo Figma / Desktop con Topbar) */}
        <Header
          currentScreen={currentScreen}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          onBack={() => navigateTo('calendario')}
          zonaReserva={selectedZonaReserva}
        />

        {/* Contenido Principal con Scroll Suave */}
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              onNavigate={navigateTo}
              onNewReserva={() => handleOpenNuevaReserva('CANCHA')}
              onLogout={handleLogout}
            />
          )}

          {currentScreen === 'calendario' && (
            <CalendarScreen
              reservas={reservas}
              onNewReserva={handleOpenNuevaReserva}
              onSelectReserva={handleSelectReservaFromCalendar}
            />
          )}

          {currentScreen === 'nueva_reserva' && (
            <NuevaReservaScreen
              initialZona={selectedZonaReserva}
              initialFecha={reservaPreload?.fecha}
              initialHoraInicio={reservaPreload?.horaInicio}
              initialHoraFin={reservaPreload?.horaFin}
              onReservaCreated={handleReservaCreated}
              onCancel={() => navigateTo('calendario')}
            />
          )}

          {currentScreen === 'pos' && (
            <PosScreen onVentaCompletada={handleVentaCompleted} />
          )}

          {currentScreen === 'inventario' && (
            <InventarioScreen onNewReserva={() => handleOpenNuevaReserva('CANCHA')} />
          )}

          {currentScreen === 'caja' && (
            <CierreCajaScreen />
          )}
        </main>

        {/* Barra de Navegación Inferior (Visible solo en Móvil < md) */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={navigateTo}
        />

        {/* Modal de Comprobante / Recibo Digital Compartible (HU09 / RF09) */}
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          reserva={activeReservaReceipt}
          venta={activeVentaReceipt}
        />
      </div>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;

