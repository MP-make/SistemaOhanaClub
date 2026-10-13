import React, { useState } from 'react';
import { CheckCircle2, Share2, X, Calendar, Clock, DollarSign, User, CreditCard } from 'lucide-react';
import { Reserva, Venta, MetodoPago } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva?: Reserva | null;
  venta?: Venta | null;
  onCobrarSaldo?: (reservaId: string, metodoPago: MetodoPago) => Promise<void>;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  reserva,
  venta,
  onCobrarSaldo
}) => {
  const [metodoCobro, setMetodoCobro] = useState<MetodoPago>('EFECTIVO');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const formatMetodo = (m?: string) => {
    if (!m) return 'Efectivo';
    if (m === 'YAPE') return 'Yape';
    if (m === 'PLIN') return 'Plin';
    if (m === 'TRANSFERENCIA') return 'Transferencia';
    if (m === 'YAPE_PLIN') return 'Yape / Plin';
    if (m === 'TARJETA') return 'Tarjeta';
    if (m === 'EFECTIVO') return 'Efectivo';
    return m;
  };

  const handleShareWhatsApp = () => {
    let text = '';
    if (reserva) {
      text = `⚽ *OHANA CLUB - CONSTANCIA DE RESERVA*\n\n` +
        `👤 *Cliente:* ${reserva.clienteNombre}\n` +
        `📍 *Espacio:* ${reserva.zona === 'CANCHA' ? 'Zona Cancha Sintética' : 'Zona Eventos'}\n` +
        `📅 *Fecha:* ${reserva.fecha}\n` +
        `⏰ *Horario:* ${reserva.horaInicio} - ${reserva.horaFin}\n` +
        `💰 *Monto Total:* S/ ${reserva.montoTotal.toFixed(2)}\n` +
        `✅ *Adelanto Pagado:* S/ ${reserva.adelanto.toFixed(2)}\n` +
        `🔴 *Saldo Pendiente:* S/ ${reserva.saldoPendiente.toFixed(2)}\n` +
        `📌 *Estado:* ${reserva.estado}\n\n` +
        `_Control interno no fiscal. ¡Gracias por su preferencia!_`;
    } else if (venta) {
      const itemsList = venta.items.map(i => `• ${i.cantidad}x ${i.nombre} - S/ ${i.subtotal.toFixed(2)}`).join('\n');
      text = `🛒 *OHANA CLUB - RESUMEN DE COMPRA*\n\n` +
        `📋 *Comprobante:* ${venta.numeroComprobante}\n` +
        `💳 *Método:* ${formatMetodo(venta.metodoPago)}\n` +
        `${itemsList}\n\n` +
        `💰 *TOTAL PAGADO: S/ ${venta.total.toFixed(2)}*\n\n` +
        `_Control interno no fiscal. ¡Vuelva pronto!_`;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCobrar = async () => {
    if (!reserva || !onCobrarSaldo) return;
    setIsProcessing(true);
    try {
      await onCobrarSaldo(reserva.id, metodoCobro);
    } catch (err) {
      console.error('Error al cobrar saldo restante:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const tieneSaldoPendiente = !!reserva && (Number(reserva.saldoPendiente) > 0) && reserva.estado !== 'PAGADA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp">
        {/* Cabecera */}
        <div className="bg-ohana-blue text-white p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-ohana-lime text-ohana-blue rounded-full mx-auto flex items-center justify-center mb-2 shadow-md">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h2 className="text-xl font-black tracking-wide">OHANA CLUB</h2>
          <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">
            {reserva ? 'Constancia de Reserva' : 'Resumen de Venta POS'}
          </p>
        </div>

        {/* Cuerpo del Recibo */}
        <div className="p-5 space-y-4 text-sm bg-slate-50/50 max-h-[75vh] overflow-y-auto">
          {reserva && (
            <>
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Espacio</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    reserva.zona === 'CANCHA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {reserva.zona === 'CANCHA' ? 'Zona Cancha' : 'Zona Eventos'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1 text-slate-500 text-xs"><User className="w-3.5 h-3.5" /> Cliente:</span>
                  <span>{reserva.clienteNombre}</span>
                </div>
                {reserva.clienteTelefono && (
                  <div className="flex items-center justify-between font-semibold text-slate-800 text-xs">
                    <span className="text-slate-500">Teléfono:</span>
                    <span>{reserva.clienteTelefono}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1 text-slate-500 text-xs"><Calendar className="w-3.5 h-3.5" /> Fecha:</span>
                  <span>{reserva.fecha}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1 text-slate-500 text-xs"><Clock className="w-3.5 h-3.5" /> Horario:</span>
                  <span>{reserva.horaInicio} - {reserva.horaFin}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Estado:</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                    reserva.estado === 'PAGADA' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {reserva.estado === 'PAGADA' ? '✓ PAGADA (Completada)' : '⏱ PENDIENTE DE SALDO'}
                  </span>
                </div>
              </div>

              {/* Detalle económico */}
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1.5">
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Monto Total:</span>
                  <span className="font-bold">S/ {reserva.montoTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-ohana-green font-semibold text-xs">
                  <span>Adelanto Registrado:</span>
                  <span>- S/ {reserva.adelanto.toFixed(2)} ({formatMetodo(reserva.metodoPago)})</span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-1.5 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Saldo Pendiente:</span>
                  <span className={`text-base font-black ${tieneSaldoPendiente ? 'text-ohana-red' : 'text-emerald-600'}`}>
                    S/ {reserva.saldoPendiente.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Sección interactiva para Cobrar Saldo Pendiente */}
              {tieneSaldoPendiente && onCobrarSaldo && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                    <DollarSign className="w-4 h-4 text-ohana-blue" />
                    <span>Cobrar Saldo al Cliente (Llegada a Cancha)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Método de Pago para el Saldo:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA'] as MetodoPago[]).map((metodo) => (
                        <button
                          key={metodo}
                          type="button"
                          onClick={() => setMetodoCobro(metodo)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            metodoCobro === metodo
                              ? 'bg-ohana-blue text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>{formatMetodo(metodo)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCobrar}
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>{isProcessing ? 'Procesando cobro...' : `Cobrar Saldo S/ ${reserva.saldoPendiente.toFixed(2)}`}</span>
                  </button>
                </div>
              )}
            </>
          )}

          {venta && (
            <>
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Comprobante: <b>{venta.numeroComprobante}</b></span>
                  <span>Método: <b>{formatMetodo(venta.metodoPago)}</b></span>
                </div>
                <div className="divide-y divide-slate-100 pt-1">
                  {venta.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between text-xs">
                      <span>{it.cantidad}x {it.nombre}</span>
                      <span className="font-bold text-slate-700">S/ {it.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Cobrado:</span>
                  <span className="text-lg font-black text-ohana-blue">S/ {venta.total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          <p className="text-[10px] text-center text-slate-400 italic">
            Documento de control y constancia interna. No posee validez fiscal.
          </p>
        </div>

        {/* Acciones */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs"
          >
            <Share2 className="w-4 h-4" />
            Compartir por WhatsApp
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

