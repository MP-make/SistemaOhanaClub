import React from 'react';

export const FigmaBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#1534B8]">
      {/* 1. Ondas orgánicas superiores (Vector SVG nítido 1:1 con Figma) */}
      <svg
        className="absolute top-0 left-0 w-full h-[38%] md:h-[42%] pointer-events-none z-0"
        viewBox="0 0 390 320"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradOrangeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6800" />
            <stop offset="60%" stopColor="#FFA100" />
            <stop offset="100%" stopColor="#C4DF00" />
          </linearGradient>
          <linearGradient id="gradLimeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4DF00" />
            <stop offset="100%" stopColor="#D8F600" />
          </linearGradient>
        </defs>

        {/* Tubo curvado superior izquierdo naranja que gira a amarillo */}
        <path
          d="M-20 -20 C 30 50, 40 140, 110 130 C 180 120, 170 20, 240 -10 C 200 -40, 50 -40, -20 -20 Z"
          fill="url(#gradOrangeTop)"
        />
        <path
          d="M-30 40 C 20 80, 70 160, 130 140 C 190 120, 180 20, 250 10 C 270 40, 250 100, 200 140 C 140 180, 60 170, -30 100 Z"
          fill="url(#gradOrangeTop)"
        />

        {/* Tubo curvado superior derecho verde lima */}
        <path
          d="M240 -20 C 270 40, 310 140, 360 110 C 390 90, 400 20, 410 -20 Z"
          fill="url(#gradLimeTop)"
        />
        <path
          d="M320 20 C 310 80, 340 170, 390 160 C 420 150, 410 70, 390 20 Z"
          fill="url(#gradLimeTop)"
        />
      </svg>

      {/* 2. Formas orgánicas vectoriales en los laterales y la base */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blob lateral izquierdo naranja */}
        <path
          d="M0 370 C 40 370, 50 430, 40 480 C 20 530, 0 540, 0 540 Z"
          fill="#FF6800"
        />

        {/* Blob lateral derecho verde lima */}
        <path
          d="M390 270 C 340 300, 330 380, 360 440 C 380 470, 390 480, 390 480 Z"
          fill="#D8F600"
        />

        {/* Onda inferior izquierda naranja */}
        <path
          d="M-30 670 C 40 650, 80 750, 40 820 C 10 860, -40 860, -60 810 Z"
          fill="#FF6800"
        />

        {/* Onda inferior derecha verde lima */}
        <path
          d="M390 680 C 310 720, 300 810, 360 860 C 390 890, 420 880, 420 880 Z"
          fill="#D8F600"
        />
      </svg>
    </div>
  );
};
