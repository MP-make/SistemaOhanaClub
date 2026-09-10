import React, { useState } from 'react';

export const SoccerMascot: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center select-none pointer-events-none">
      {!imgError ? (
        <img
          src="/images/imagen1.png"
          alt="Ohana Club Mascot"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain drop-shadow-xl animate-pulse-subtle"
        />
      ) : (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          {/* Balón */}
          <circle cx="50" cy="85" r="16" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5"/>
          <polygon points="50,75 56,80 54,88 46,88 44,80" fill="#1E293B"/>
          <line x1="50" y1="75" x2="50" y2="69" stroke="#1E293B" strokeWidth="2"/>
          <line x1="56" y1="80" x2="63" y2="78" stroke="#1E293B" strokeWidth="2"/>
          <line x1="54" y1="88" x2="60" y2="96" stroke="#1E293B" strokeWidth="2"/>
          <line x1="46" y1="88" x2="40" y2="96" stroke="#1E293B" strokeWidth="2"/>
          <line x1="44" y1="80" x2="37" y2="78" stroke="#1E293B" strokeWidth="2"/>

          {/* Futbolista Ilustrado */}
          {/* Cabeza y Pelo */}
          <circle cx="135" cy="65" r="12" fill="#FDE68A" stroke="#0F172A" strokeWidth="2.5"/>
          <path d="M125 65 C125 54, 145 54, 147 62 C142 63, 137 60, 133 64 Z" fill="#0F172A"/>
          {/* Ojo y sonrisa */}
          <circle cx="130" cy="65" r="1.5" fill="#0F172A"/>
          <path d="M128 70 Q132 73 135 69" stroke="#0F172A" strokeWidth="1.5" fill="none"/>

          {/* Torso con Camiseta Naranja */}
          <path d="M124 77 L155 85 L145 125 L115 115 Z" fill="#FF6A00" stroke="#0F172A" strokeWidth="2.5"/>
          
          {/* Brazos */}
          <path d="M124 82 Q105 95 100 85" stroke="#FDE68A" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <path d="M124 82 Q105 95 100 85" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          
          <path d="M153 87 Q175 95 170 110" stroke="#FDE68A" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <path d="M153 87 Q175 95 170 110" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

          {/* Shorts Azules */}
          <path d="M115 115 L145 125 L140 155 L125 150 L118 160 L105 145 Z" fill="#2563EB" stroke="#0F172A" strokeWidth="2.5"/>

          {/* Pierna de apoyo (Izquierda) */}
          <path d="M135 152 L140 180" stroke="#FDE68A" strokeWidth="9" strokeLinecap="round"/>
          <path d="M135 152 L140 180" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="132" y="172" width="16" height="18" rx="4" fill="#C8FF00" stroke="#0F172A" strokeWidth="2"/>

          {/* Pierna de chut (Derecha pateando hacia el balón) */}
          <path d="M110 145 Q80 140 65 120" stroke="#FDE68A" strokeWidth="10" strokeLinecap="round" fill="none"/>
          <path d="M110 145 Q80 140 65 120" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          
          {/* Media blanca y Botín verde neón con tacos */}
          <rect x="58" y="105" width="22" height="26" rx="3" transform="rotate(-35 65 115)" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2"/>
          <path d="M48 100 L75 85 L85 105 L60 118 Z" fill="#C8FF00" stroke="#0F172A" strokeWidth="2.5"/>
          {/* Tacos / suela */}
          <line x1="45" y1="102" x2="52" y2="98" stroke="#FF6A00" strokeWidth="3"/>
          <line x1="55" y1="96" x2="62" y2="92" stroke="#FF6A00" strokeWidth="3"/>
        </svg>
      )}
    </div>
  );
};

