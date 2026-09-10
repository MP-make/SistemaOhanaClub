import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ScreenType, Reserva, Venta, ZonaTipo } from './types';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
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

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  const handleOpenNuevaReserva = (zona: ZonaTipo = 'CANCHA') => {
    setSelectedZonaReserva(zona);
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

  // Si está en pantalla de Login, se renderiza a pantalla completa
  if (currentScreen === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
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

