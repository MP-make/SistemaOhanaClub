import React, { useState } from 'react';
import { User, Calendar, Clock, Sun, Moon, Sparkles, ChevronDown, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { ZonaTipo, TarifaTipo, Reserva } from '../../types';
import { apiService } from '../../services/api';

interface NuevaReservaScreenProps {
  initialZona?: ZonaTipo;
  onReservaCreated: (reserva: Reserva) => void;
  onCancel: () => void;
}

export const NuevaReservaScreen: React.FC<NuevaReservaScreenProps> = ({
  initialZona = 'CANCHA',
  onReservaCreated,
  onCancel
}) => {
  const [zona, setZona] = useState<ZonaTipo>(initialZona);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteEmpresa, setClienteEmpresa] = useState('');
  const [tipoEvento, setTipoEvento] = useState('Cumpleaños');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('16:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const [tarifaTipo, setTarifaTipo] = useState<TarifaTipo>('DIURNA');
  const [presupuestoEvento, setPresupuestoEvento] = useState<number>(1000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper para detectar automáticamente Diurna o Nocturna según horario
  const getTarifaByHour = (timeStr: string): TarifaTipo => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (isNaN(hour)) return 'DIURNA';
    return (hour >= 18 || hour < 6) ? 'NOCTURNA' : 'DIURNA';
  };

  // La tarifa de Cancha se determina estrictamente por el horario seleccionado
  const activeTarifa: TarifaTipo = zona === 'CANCHA' ? getTarifaByHour(horaInicio) : tarifaTipo;

  // Verificación en vivo de disponibilidad de fecha y horario
  const disponibilidad = apiService.checkDisponibilidad(zona, fecha, horaInicio, horaFin);

  const handleHoraInicioChange = (newHora: string) => {
    setHoraInicio(newHora);
    setErrorMsg(null);
  };

  const handleHoraFinChange = (newHora: string) => {
    setHoraFin(newHora);
    setErrorMsg(null);
  };

  // Switch defaults when changing zona
  const handleSwitchZona = (newZona: ZonaTipo) => {
    setZona(newZona);
    setErrorMsg(null);
  };

  // Live calculated amounts (Principio UX: Feedback Inmediato)
  const calculation = apiService.calculateTarifa(
    zona,
    horaInicio,
    horaFin,
    activeTarifa,
    presupuestoEvento
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!disponibilidad.disponible) {
      setErrorMsg(disponibilidad.motivo || 'El horario y fecha seleccionados no están disponibles.');
      return;
    }

    const nombreFinal = zona === 'CANCHA' ? clienteNombre.trim() : clienteEmpresa.trim();
    if (!nombreFinal) {
      setErrorMsg('Por favor ingresa el nombre del cliente o empresa responsable.');
      return;
    }

    try {
      const nueva = await apiService.createReserva({
        zona,
        clienteNombre: nombreFinal,
        clienteTelefono: clienteTelefono.trim(),
        clienteEmpresa: zona === 'EVENTOS' ? clienteEmpresa.trim() : undefined,
        tipoEvento: zona === 'CANCHA' ? 'Reserva' : tipoEvento,
        fecha,
        horaInicio,
        horaFin,
        tipoTarifa: calculation.tipoTarifa as TarifaTipo,
        montoTotal: calculation.montoTotal,
        adelanto: calculation.adelanto,
        saldoPendiente: calculation.saldoPendiente,
        metodoPago: 'EFECTIVO'
      });
      onReservaCreated(nueva);
    } catch (err: any) {
      // Prevención de errores (HU05)
      setErrorMsg(err.message || 'Error al guardar reserva.');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto w-full md:px-6 md:py-6">
        
        {/* Selector Rápido de Zona */}
        <div className="bg-ohana-blue md:rounded-t-3xl px-4 py-3.5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => handleSwitchZona('CANCHA')}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition shadow-sm cursor-pointer ${
              zona === 'CANCHA'
                ? 'bg-white text-ohana-blue scale-105 ring-2 ring-white/50'
                : 'bg-blue-800/60 text-blue-200 hover:bg-blue-800'
            }`}
          >
            Modo Cancha (Fútbol / Vóley)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchZona('EVENTOS')}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition shadow-sm cursor-pointer ${
              zona === 'EVENTOS'
                ? 'bg-ohana-orange text-white scale-105 ring-2 ring-orange-300/50'
                : 'bg-blue-800/60 text-blue-200 hover:bg-blue-800'
            }`}
          >
            Modo Eventos (Cumpleaños / Fiestas)
          </button>
        </div>

        {/* Contenedor blanco con bordes superiores curvos */}
        <div className="bg-white rounded-t-3xl md:rounded-t-none md:rounded-b-3xl shadow-sm px-5 md:px-8 pt-5 md:pt-6 pb-6 mt-[-10px] md:mt-0 border border-slate-100">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm font-semibold rounded-2xl animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Campo: Cliente / Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zona === 'CANCHA' ? (
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                    Cliente / Responsable
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      required
                      placeholder="ej: Carlos Mendoza"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-semibold pl-9 pr-4 py-2.5 md:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ohana-blue"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 md:top-3.5" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                    Cliente / Empresa Responsable
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clienteEmpresa}
                      onChange={(e) => setClienteEmpresa(e.target.value)}
                      required
                      placeholder="ej: Empresa / Familia"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-semibold px-4 py-2.5 md:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ohana-orange"
                    />
                  </div>
                </div>
              )}

              {/* Teléfono */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="ej: 987654321"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-semibold px-4 py-2.5 md:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ohana-blue"
                />
              </div>
            </div>

            {/* Campo: Fecha y Horas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                  Fecha de Reserva
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-semibold pl-4 pr-10 py-2.5 md:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ohana-blue"
                  />
                  <Calendar className="w-4 h-4 text-ohana-blue absolute right-3 top-3 md:top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                  Hora inicio
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => handleHoraInicioChange(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-semibold pl-8 pr-3 py-2.5 md:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ohana-blue"
                  />
                  <Clock className="w-4 h-4 text-ohana-blue absolute left-2.5 top-3 md:top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                  Hora fin
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => handleHoraFinChange(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-semibold pl-8 pr-3 py-2.5 md:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ohana-blue"
                  />
                  <Clock className="w-4 h-4 text-ohana-blue absolute left-2.5 top-3 md:top-3.5" />
                </div>
              </div>
            </div>

            {/* Banner de Verificación de Disponibilidad en Tiempo Real */}
            {disponibilidad.disponible ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs md:text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Horario disponible para {zona === 'CANCHA' ? 'Cancha' : 'Zona de Eventos'} ({fecha})</span>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs md:text-sm font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-rose-900">Horario no disponible</span>
                  <span className="text-[11px] md:text-xs text-rose-700">{disponibilidad.motivo}</span>
                </div>
              </div>
            )}

            {/* Selector Condicional: Tarifa Cancha vs Presupuesto Eventos */}
            {zona === 'CANCHA' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs md:text-sm font-bold text-slate-700">
                    Tarifa de Cancha (Calculada por Horario)
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    ⚡ {activeTarifa === 'NOCTURNA' ? 'Nocturna con Luz' : 'Diurna'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Diurna S/60 */}
                  <div
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between select-none ${
                      activeTarifa === 'DIURNA'
                        ? 'bg-blue-50/90 border-ohana-blue text-ohana-blue shadow-sm ring-2 ring-ohana-blue'
                        : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                        <Sun className={`w-4 h-4 ${activeTarifa === 'DIURNA' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>Diurna</span>
                      </div>
                      {activeTarifa === 'DIURNA' && (
                        <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md">
                          ✓ Aplicada
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-500">(06:00 - 18:00)</span>
                    <span className={`text-base md:text-lg font-black mt-1 ${activeTarifa === 'DIURNA' ? 'text-slate-900' : 'text-slate-400'}`}>
                      S/ 60.00 / hr
                    </span>
                  </div>

                  {/* Nocturna S/80 */}
                  <div
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between select-none ${
                      activeTarifa === 'NOCTURNA'
                        ? 'bg-blue-50/90 border-ohana-blue text-ohana-blue shadow-sm ring-2 ring-ohana-blue'
                        : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                        <Moon className={`w-4 h-4 ${activeTarifa === 'NOCTURNA' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>Nocturna con Luz</span>
                      </div>
                      {activeTarifa === 'NOCTURNA' && (
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                          ✓ Aplicada
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-500">(18:00 - 06:00)</span>
                    <span className={`text-base md:text-lg font-black mt-1 ${activeTarifa === 'NOCTURNA' ? 'text-slate-900' : 'text-slate-400'}`}>
                      S/ 80.00 / hr
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de evento */}
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                    Tipo de evento
                  </label>
                  <div className="relative">
                    <select
                      value={tipoEvento}
                      onChange={(e) => setTipoEvento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-semibold px-4 py-2.5 md:py-3 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-ohana-orange"
                    >
                      <option value="Cumpleaños">Cumpleaños</option>
                      <option value="Evento Corporativo">Evento Corporativo</option>
                      <option value="Fiesta Privada">Fiesta Privada</option>
                      <option value="Torneo Deportivo">Torneo Deportivo</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 md:top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Presupuesto pactado */}
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                    Presupuesto total del evento
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={presupuestoEvento}
                      onChange={(e) => setPresupuestoEvento(Number(e.target.value))}
                      required
                      placeholder="ej: 1500"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm font-bold px-4 py-2.5 md:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ohana-orange"
                    />
                    <span className="absolute right-3 top-2.5 md:top-3 text-xs font-bold text-slate-400">PEN</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjeta: Resumen de pago con cálculo instantáneo */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-2.5">
              <h3 className="text-xs md:text-sm font-black text-slate-800">
                Resumen de pago y señas
              </h3>

              {zona === 'CANCHA' ? (
                <>
                  <div className="flex justify-between text-xs md:text-sm text-slate-600">
                    <span>Tarifa seleccionada</span>
                    <span className="font-bold">S/ {calculation.montoTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm text-ohana-green font-bold">
                    <span>Adelanto fijo obligatorio (Cancha)</span>
                    <span>- S/ {calculation.adelanto.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs md:text-sm">
                    <span className="font-black text-slate-800">Saldo pendiente</span>
                    <span className="text-base md:text-lg font-black text-ohana-red">
                      S/ {calculation.saldoPendiente.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-xs md:text-sm text-slate-600">
                    <span>Presupuesto pactado</span>
                    <span className="font-bold">S/ {calculation.montoTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm text-ohana-green font-bold">
                    <span>Adelanto del 50% requerido</span>
                    <span>- S/ {calculation.adelanto.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs md:text-sm">
                    <span className="font-black text-slate-800">Saldo pendiente</span>
                    <span className="text-base md:text-lg font-black text-ohana-red">
                      S/ {calculation.saldoPendiente.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Botón de Guardar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!disponibilidad.disponible}
                className={`w-full text-white font-black text-sm md:text-base py-3.5 md:py-4 rounded-2xl shadow-lg transition ${
                  !disponibilidad.disponible
                    ? 'bg-slate-400 cursor-not-allowed opacity-60 shadow-none'
                    : zona === 'CANCHA'
                      ? 'bg-ohana-blue-light hover:bg-blue-700 active:scale-[0.98] cursor-pointer'
                      : 'bg-ohana-orange hover:bg-orange-600 active:scale-[0.98] cursor-pointer'
                }`}
              >
                {!disponibilidad.disponible ? 'Horario no disponible' : 'Guardar reserva'}
              </button>
            </div>

            {/* Leyenda de pie */}
            <div className="text-[11px] text-center text-slate-400 font-medium pt-1">
              {zona === 'CANCHA' ? (
                <div className="flex justify-between px-2">
                  <span>Adelanto fijo: S/ 10.00</span>
                  <span>Tarifa nocturna desde las 18:00hrs</span>
                </div>
              ) : (
                <span>Se requiere adelanto obligatorio del 50% sobre el presupuesto del evento</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
