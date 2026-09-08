import React from 'react';

export const CozyDeskIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#F0EAE1] flex items-center justify-center ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#FFE6C7]/60 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-[#E3E8DF]/60 blur-xl pointer-events-none" />

      <svg
        viewBox="0 0 360 220"
        className="w-full h-full object-cover select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5EFE6" />
            <stop offset="100%" stopColor="#EDE5D9" />
          </linearGradient>
          <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9C7B2" />
            <stop offset="100%" stopColor="#C4B09A" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EBF0F8" />
            <stop offset="100%" stopColor="#F8F3EC" />
          </linearGradient>
          <linearGradient id="lampGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFEFD0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFEFD0" stopOpacity="0" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3A3228" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Room Wall */}
        <rect width="360" height="220" fill="url(#wallGrad)" />

        {/* Window with soft sunlight */}
        <rect x="20" y="20" width="85" height="110" rx="6" fill="#FDFBEE" stroke="#E6DDD2" strokeWidth="2" />
        <line x1="62.5" y1="20" x2="62.5" y2="130" stroke="#E6DDD2" strokeWidth="2" />
        <line x1="20" y1="75" x2="105" y2="75" stroke="#E6DDD2" strokeWidth="2" />
        {/* Distant soft hill/tree seen through window */}
        <path d="M22 120 C 45 105, 80 115, 103 125 L 103 129 L 22 129 Z" fill="#D3DEC9" opacity="0.6" />

        {/* Wall Art / Pinboard */}
        <rect x="250" y="25" width="85" height="60" rx="4" fill="#F4EADB" stroke="#E3D6C5" strokeWidth="1.5" />
        <rect x="258" y="33" width="22" height="26" rx="2" fill="#E8DEFF" />
        <rect x="286" y="35" width="38" height="18" rx="2" fill="#E1EEDF" />
        <circle cx="269" cy="31" r="2.5" fill="#D98256" />
        <circle cx="305" cy="33" r="2.5" fill="#6B648C" />

        {/* Lamp Cone Light Beam */}
        <polygon points="120,68 65,185 175,185" fill="url(#lampGlow)" opacity="0.6" />

        {/* Cozy Wooden Desk */}
        <rect x="0" y="165" width="360" height="55" fill="url(#deskGrad)" />
        <line x1="0" y1="165" x2="360" y2="165" stroke="#EADBC9" strokeWidth="2" />

        {/* Computer Monitor */}
        <g filter="url(#shadow)">
          {/* Monitor Stand */}
          <rect x="175" y="145" width="16" height="24" rx="2" fill="#A8A4B8" />
          <path d="M165 168 L 201 168 L 195 165 L 171 165 Z" fill="#8E899E" />
          {/* Screen Body */}
          <rect x="125" y="65" width="116" height="82" rx="6" fill="#4B475D" />
          <rect x="128" y="68" width="110" height="73" rx="4" fill="url(#screenGrad)" />
          {/* Interface mock inside screen */}
          <rect x="135" y="75" width="26" height="5" rx="2" fill="#6B648C" />
          <rect x="135" y="84" width="46" height="3" rx="1.5" fill="#C9C4D8" />
          <rect x="135" y="90" width="36" height="3" rx="1.5" fill="#C9C4D8" />
          {/* Cozy card on screen */}
          <rect x="135" y="98" width="96" height="36" rx="4" fill="#FFFFFF" />
          <circle cx="145" cy="110" r="4" fill="#768E7C" />
          <rect x="154" y="108" width="60" height="3" rx="1.5" fill="#534C72" />
          <rect x="154" y="115" width="40" height="3" rx="1.5" fill="#A5A0B2" />
          <rect x="154" y="122" width="70" height="4" rx="2" fill="#E6DEFF" />
        </g>

        {/* Desk Lamp */}
        <path d="M102 165 L 118 165" stroke="#71695F" strokeWidth="3" strokeLinecap="round" />
        <path d="M110 165 L 105 120 L 120 70" stroke="#877F74" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="105" cy="120" r="3.5" fill="#6B648C" />
        {/* Lamp Shade */}
        <path d="M108 68 L 132 68 L 140 82 L 100 82 Z" fill="#E8B07D" />
        <ellipse cx="120" cy="82" rx="20" ry="4" fill="#FFF2DC" />

        {/* Small Desk Potted Plant */}
        <g filter="url(#shadow)">
          <path d="M55 155 L 75 155 L 72 170 L 58 170 Z" fill="#D98A68" />
          {/* Leaves */}
          <path d="M65 155 C 60 142, 50 144, 48 140 C 56 142, 63 148, 65 155 Z" fill="#55755E" />
          <path d="M65 155 C 65 138, 70 135, 72 132 C 73 140, 70 148, 65 155 Z" fill="#6A8B74" />
          <path d="M65 155 C 72 143, 82 144, 84 140 C 78 143, 70 149, 65 155 Z" fill="#84A88F" />
        </g>

        {/* Stack of Warm Notebooks */}
        <rect x="260" y="156" width="46" height="7" rx="1.5" fill="#D97A53" />
        <rect x="257" y="161" width="50" height="7" rx="1.5" fill="#6B648C" />
        {/* Ceramic Mug */}
        <rect x="290" y="142" width="18" height="20" rx="3" fill="#EFE8DD" />
        <path d="M308 146 C 313 146, 313 156, 308 156" stroke="#EFE8DD" strokeWidth="2.5" fill="none" />
        {/* Steam */}
        <path d="M296 137 C 298 132, 294 130, 296 125" stroke="#C9BFB0" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M302 138 C 304 134, 301 132, 303 127" stroke="#C9BFB0" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* Small Pencil Holder */}
        <rect x="220" y="148" width="16" height="18" rx="2" fill="#B5ADA2" />
        <line x1="224" y1="148" x2="221" y2="135" stroke="#E87C58" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="228" y1="148" x2="228" y2="132" stroke="#6B648C" strokeWidth="2" strokeLinecap="round" />
        <line x1="232" y1="148" x2="234" y2="136" stroke="#768E7C" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
