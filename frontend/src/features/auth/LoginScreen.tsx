import React, { useState } from 'react';
import { Logo } from '../../components/shared/Logo';
import { FigmaBackground } from '../../components/shared/FigmaBackground';
import { supabaseApi, isSupabaseConfigured } from '../../services/supabaseClient';
import { AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // En móvil inicia siempre en 'inicio' (Splash) y al dar clic pasa a 'login'
  const [mobileMode, setMobileMode] = useState<'inicio' | 'login'>('inicio');
  const [usuario, setUsuario] = useState('admin@ohanaclub.pe');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const user = await supabaseApi.login(usuario, password);
        localStorage.setItem('ohana_current_user', JSON.stringify(user));
        setLoading(false);
        onLoginSuccess();
      } else {
        // Validación local si no hay configuración de base de datos en .env
        const cleanUser = usuario.trim().toLowerCase();
        let validUser: any = null;

        if ((cleanUser === 'admin' || cleanUser === 'admin@ohanaclub.pe') && password === 'admin123') {
          validUser = {
            username: 'admin',
            email: 'admin@ohanaclub.pe',
            nombre_completo: 'Administrador General',
            rol: 'admin'
          };
        } else if ((cleanUser === 'staff' || cleanUser === 'staff@ohanaclub.pe') && password === 'staff123') {
          validUser = {
            username: 'staff',
            email: 'staff@ohanaclub.pe',
            nombre_completo: 'Staff Turno Mañana',
            rol: 'staff'
          };
        }

        if (!validUser) {
          throw new Error('Usuario o contraseña incorrectos.');
        }

        localStorage.setItem('ohana_current_user', JSON.stringify(validUser));
        setLoading(false);
        onLoginSuccess();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Error al validar credenciales');
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col justify-between select-none">
      
      {/* Fondo Orgánico Responsivo */}
      <FigmaBackground />

      {/* ========================================================================= */}
      {/* VISTA MÓVIL (< md) - PROPORCIONES EXACTAS DE FIGMA CON ALTURA GENEROSA    */}
      {/* ========================================================================= */}
      <div className="md:hidden relative z-10 w-full min-h-screen flex flex-col justify-between">
        
        {/* 1. PANTALLA INICIO (SPLASH) - Logo Grande Centrado en el Medio */}
        {mobileMode === 'inicio' && (
          <div 
            onClick={() => setMobileMode('login')}
            className="w-full min-h-screen flex flex-col justify-between items-center px-6 pt-0 pb-0 cursor-pointer animate-fadeIn relative overflow-hidden"
            title="Toca para ingresar"
          >
            {/* Logo Grande Centrado en el Medio de la Pantalla */}
            <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <Logo size="2xl" />
            </div>

            {/* Mascota Futbolista en la base */}
            <div className="w-full max-w-[340px] flex justify-center items-end mt-auto relative z-10">
              <img
                src="/images/imagen1.png"
                alt="Ohana Mascot"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* 2. PANTALLA LOGIN (REGISTRO) - Tarjeta Azul con Altura y Espaciado Amplios */}
        {mobileMode === 'login' && (
          <div className="w-full min-h-screen flex flex-col justify-between items-center px-5 pt-12 pb-6 animate-fadeIn">
            
            {/* Contenedor central con la tarjeta azul y Logo solapado */}
            <div className="w-full max-w-[350px] my-auto flex flex-col items-center">
              
              {/* Logo Oficial Grande solapado */}
              <div className="mb-[-38px] relative z-20 scale-115">
                <Logo size="xl" />
              </div>

              {/* Tarjeta Azul de Login con mayor altura y respiración */}
              <div className="w-full min-h-[480px] rounded-[28px] p-6 sm:p-7 pt-14 pb-8 shadow-[0px_16px_40px_rgba(0,0,0,0.4)] bg-[#2136C7] border border-blue-400/25 flex flex-col justify-between">
                
                {errorMsg && (
                  <div className="mb-3 p-3 bg-red-500/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-shake border border-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 my-auto">
                  <div>
                    <label className="block text-white text-xs font-semibold mb-2 ml-1">
                      Usuario / Correo
                    </label>
                    <input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      required
                      className="w-full h-12 bg-white text-slate-900 text-sm font-semibold px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8F600] shadow-inner"
                      placeholder="admin@ohanaclub.pe"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xs font-semibold mb-2 ml-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-12 bg-white text-slate-900 text-sm font-semibold px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8F600] tracking-widest shadow-inner"
                      placeholder="••••••••••••"
                    />
                  </div>

                  {/* Recordar sesión & Olvidaste contraseña */}
                  <div className="flex items-center justify-between text-[11px] text-white pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-white text-[#2136C7] accent-[#D8F600] cursor-pointer"
                      />
                      <span>Recordar sesion</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Para reestablecer su contraseña, solicítelo al administrador del local.')}
                      className="text-white hover:underline cursor-pointer"
                    >
                      Olvidaste contraseña
                    </button>
                  </div>

                  {/* Botón de Ingreso */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#D8F600] hover:bg-[#c8ea00] active:scale-[0.98] text-[#0F2276] font-black text-sm rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition flex items-center justify-center cursor-pointer disabled:opacity-75"
                    >
                      {loading ? 'Validando en Base de Datos...' : 'Ingresar'}
                    </button>
                  </div>
                </form>

                {/* Footer de la tarjeta con separación */}
                <div className="text-center pt-2">
                  <p className="text-[11px] text-white/90">
                    ¿No tienes una cuenta?{' '}
                    <span 
                      onClick={() => alert('Para registrar un nuevo usuario staff, solicítelo en caja central.')}
                      className="font-bold underline text-white cursor-pointer hover:text-[#D8F600]"
                    >
                      Contacta al Admin
                    </span>
                  </p>
                </div>
              </div>

            </div>

            {/* Texto de pie de página fuera de la tarjeta */}
            <div className="text-center pb-2">
              <span className="text-xs text-white/90 font-medium">Ohana Club • Red Local</span>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* VISTA DESKTOP & LAPTOP (>= md) - LAYOUT FLUIDO 2 COLUMNAS                 */}
      {/* ========================================================================= */}
      <div className="hidden md:flex relative z-10 w-full min-h-screen flex-col justify-between p-6 lg:p-10 max-w-[1700px] mx-auto">
        
        {/* Header Superior Desktop */}
        <div className="flex items-center justify-between w-full">
          <Logo size="md" />
          <span className="text-xs lg:text-sm font-bold text-white/90 bg-white/10 px-4 py-2 rounded-full backdrop-blur-xs border border-white/20">
            Terminal de Control • Ohana Club
          </span>
        </div>

        {/* Contenido Principal en 2 Columnas */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
          
          {/* Columna Izquierda: Mascota y Bienvenida Deportiva */}
          <div className="col-span-12 md:col-span-6 lg:col-span-7 flex flex-col items-center text-center space-y-6">
            <div className="w-full flex justify-center">
              <img
                src="/images/imagen1.png"
                alt="Ohana Sports Mascot"
                className="w-auto max-h-[440px] lg:max-h-[520px] xl:max-h-[580px] object-contain drop-shadow-2xl animate-float"
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight">
                OHANA SPORTS & EVENTS
              </h2>
              <p className="text-base lg:text-lg text-blue-100/90 font-medium max-w-xl mx-auto leading-relaxed">
                Sistema Integral de Gestión de Alquiler de Canchas, Eventos, Punto de Venta y Control de Caja en Red Local.
              </p>
            </div>

            {/* Badges de módulos */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <span className="bg-white/10 backdrop-blur-xs border border-white/20 text-white text-xs lg:text-sm font-semibold px-4 py-1.5 rounded-full shadow-xs">
                ⚽ Canchas Diurna / Nocturna
              </span>
              <span className="bg-white/10 backdrop-blur-xs border border-white/20 text-white text-xs lg:text-sm font-semibold px-4 py-1.5 rounded-full shadow-xs">
                🎉 Zona de Eventos 50%
              </span>
              <span className="bg-white/10 backdrop-blur-xs border border-white/20 text-white text-xs lg:text-sm font-semibold px-4 py-1.5 rounded-full shadow-xs">
                🛒 POS Minimarket
              </span>
              <span className="bg-white/10 backdrop-blur-xs border border-white/20 text-white text-xs lg:text-sm font-semibold px-4 py-1.5 rounded-full shadow-xs">
                📊 Arqueo en Vivo
              </span>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Acceso / Login Form Ampliada */}
          <div className="col-span-12 md:col-span-6 lg:col-span-5 flex flex-col items-center justify-center w-full">
            {/* Logo Oficial Superior solapado */}
            <div className="mb-[-42px] relative z-20 scale-120 lg:scale-130">
              <Logo size="xl" />
            </div>

            {/* Tarjeta Azul de Login */}
            <div className="w-full max-w-lg xl:max-w-xl min-h-[520px] rounded-[32px] p-8 lg:p-12 xl:p-14 pt-16 lg:pt-18 shadow-[0px_20px_60px_rgba(0,0,0,0.45)] bg-[#2136C7] border border-blue-400/30 flex flex-col justify-between">
              
              {errorMsg && (
                <div className="mb-4 p-3.5 bg-red-500/90 text-white rounded-2xl text-xs lg:text-sm font-bold flex items-center gap-2.5 animate-shake border border-red-300 shadow-md">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6 my-auto">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2 ml-1">
                    Usuario / Correo
                  </label>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    className="w-full h-13 bg-white text-slate-900 text-base font-semibold px-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D8F600] shadow-inner"
                    placeholder="admin@ohanaclub.pe"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2 ml-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-13 bg-white text-slate-900 text-base font-semibold px-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D8F600] tracking-widest shadow-inner"
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="flex items-center justify-between text-xs lg:text-sm text-white pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white text-[#2136C7] accent-[#D8F600] cursor-pointer"
                    />
                    <span>Recordar sesión</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Para reestablecer su contraseña, solicítelo al administrador del local.')}
                    className="text-white hover:underline cursor-pointer"
                  >
                    Olvidaste contraseña
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-13 bg-[#D8F600] hover:bg-[#c8ea00] active:scale-[0.98] text-[#0F2276] font-black text-base rounded-2xl shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-75"
                  >
                    {loading ? 'Validando en Base de Datos...' : 'Ingresar al Sistema'}
                  </button>
                </div>
              </form>

              <div className="text-center pt-3">
                <p className="text-xs text-white/90">
                  ¿No tienes una cuenta?{' '}
                  <span 
                    onClick={() => alert('Para registrar un nuevo usuario staff, solicítelo en caja central.')}
                    className="font-bold underline text-white cursor-pointer hover:text-[#D8F600]"
                  >
                    Contacta al Administrador
                  </span>
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Desktop */}
        <div className="flex items-center justify-between w-full text-xs text-white/80 pt-4 border-t border-white/10">
          <span>Ohana Sports Club • Gestión y Control Operativo</span>
          <span>Versión 2.0 • Sincronizado en Red Local</span>
        </div>

      </div>

    </div>
  );
};
