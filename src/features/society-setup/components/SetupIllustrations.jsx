import React from 'react';

export const BuildingIllustration = () => (
  <div className="w-full flex justify-center py-4">
    <svg viewBox="0 0 320 180" className="w-full max-w-[260px] h-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky / Background soft cloud */}
      <circle cx="160" cy="90" r="75" fill="#F0FDF4" />
      <circle cx="100" cy="70" r="40" fill="#F8FAFC" />
      <circle cx="220" cy="75" r="45" fill="#F8FAFC" />
      
      {/* Ground */}
      <rect x="20" y="145" width="280" height="8" rx="4" fill="#E2E8F0" />
      <rect x="15" y="150" width="290" height="6" rx="3" fill="#86EFAC" />

      {/* Background Building Left */}
      <rect x="55" y="65" width="50" height="80" rx="3" fill="#CBD5E1" />
      <rect x="62" y="73" width="10" height="12" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="78" y="73" width="10" height="12" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="62" y="93" width="10" height="12" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="78" y="93" width="10" height="12" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="62" y="113" width="10" height="12" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="78" y="113" width="10" height="12" rx="1.5" fill="#FFFFFF" opacity="0.9" />

      {/* Main Center Tall Building */}
      <rect x="115" y="35" width="65" height="110" rx="4" fill="#93C5FD" />
      <rect x="122" y="42" width="51" height="6" rx="1.5" fill="#3B82F6" />
      {/* Windows */}
      {[0, 1, 2, 3, 4].map((row) => (
        <React.Fragment key={row}>
          <rect x="123" y={55 + row * 16} width="12" height="10" rx="1.5" fill="#FFFFFF" />
          <rect x="141" y={55 + row * 16} width="12" height="10" rx="1.5" fill="#FFFFFF" />
          <rect x="159" y={55 + row * 16} width="12" height="10" rx="1.5" fill="#FFFFFF" />
        </React.Fragment>
      ))}

      {/* Right Building */}
      <rect x="190" y="55" width="60" height="90" rx="3" fill="#E2E8F0" />
      <rect x="196" y="63" width="48" height="5" rx="1" fill="#EA580C" />
      {[0, 1, 2, 3].map((row) => (
        <React.Fragment key={row}>
          <rect x="199" y={75 + row * 16} width="11" height="10" rx="1.5" fill="#94A3B8" />
          <rect x="215" y={75 + row * 16} width="11" height="10" rx="1.5" fill="#94A3B8" />
          <rect x="231" y={75 + row * 16} width="11" height="10" rx="1.5" fill="#94A3B8" />
        </React.Fragment>
      ))}

      {/* Trees */}
      <circle cx="42" cy="128" r="14" fill="#22C55E" />
      <rect x="40" y="138" width="4" height="12" fill="#78350F" rx="1" />

      <circle cx="265" cy="128" r="14" fill="#16A34A" />
      <rect x="263" y="138" width="4" height="12" fill="#78350F" rx="1" />

      {/* Small Cars */}
      <rect x="80" y="142" width="22" height="7" rx="3" fill="#EA580C" />
      <circle cx="85" cy="149" r="2.5" fill="#1E293B" />
      <circle cx="97" cy="149" r="2.5" fill="#1E293B" />

      <rect x="180" y="142" width="20" height="7" rx="3" fill="#3B82F6" />
      <circle cx="185" cy="149" r="2.5" fill="#1E293B" />
      <circle cx="195" cy="149" r="2.5" fill="#1E293B" />
    </svg>
  </div>
);

export const AmenitiesIllustration = () => (
  <div className="w-full flex justify-center py-3">
    <svg viewBox="0 0 280 160" className="w-full max-w-[240px] h-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background glow */}
      <circle cx="140" cy="80" r="70" fill="#ECFDF5" />
      {/* Clubhouse building */}
      <polygon points="140,30 65,70 215,70" fill="#475569" />
      <rect x="75" y="70" width="130" height="65" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
      {/* Clubhouse Pillars & windows */}
      <rect x="85" y="78" width="16" height="57" fill="#E2E8F0" />
      <rect x="189" y="78" width="16" height="57" fill="#E2E8F0" />
      <rect x="110" y="80" width="22" height="30" rx="2" fill="#93C5FD" />
      <rect x="148" y="80" width="22" height="30" rx="2" fill="#93C5FD" />
      {/* Double door */}
      <rect x="127" y="100" width="26" height="35" rx="1.5" fill="#EA580C" />
      {/* Bench */}
      <rect x="40" y="122" width="22" height="4" rx="1.5" fill="#78350F" />
      <rect x="43" y="126" width="2" height="6" fill="#475569" />
      <rect x="57" y="126" width="2" height="6" fill="#475569" />
      {/* Tree */}
      <circle cx="230" cy="105" r="18" fill="#10B981" />
      <rect x="228" y="120" width="4" height="15" fill="#78350F" />
      {/* Ground path */}
      <rect x="20" y="135" width="240" height="6" rx="3" fill="#A7F3D0" />
    </svg>
  </div>
);

export const ContactIllustration = () => (
  <div className="w-full flex justify-center py-3">
    <svg viewBox="0 0 280 160" className="w-full max-w-[220px] h-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="140" cy="80" r="70" fill="#F0F9FF" />
      {/* Smartphone */}
      <rect x="100" y="20" width="80" height="120" rx="14" fill="#1E293B" />
      <rect x="105" y="26" width="70" height="108" rx="10" fill="#FFFFFF" />
      <circle cx="140" cy="32" r="2.5" fill="#94A3B8" />
      {/* Contact card on screen */}
      <rect x="112" y="44" width="56" height="42" rx="6" fill="#F8FAFC" stroke="#E2E8F0" />
      <circle cx="140" cy="58" r="9" fill="#EA580C" />
      <rect x="125" y="73" width="30" height="4" rx="2" fill="#64748B" />
      {/* Action buttons on phone */}
      <circle cx="124" cy="104" r="8" fill="#22C55E" />
      <path d="M121 104 C121 106 123 107 125 106" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="156" cy="104" r="8" fill="#3B82F6" />
      <rect x="152" y="101" width="8" height="6" rx="1" fill="#FFFFFF" />
      {/* Surrounding floating bubbles */}
      <circle cx="68" cy="70" r="14" fill="#DCFCE7" />
      <circle cx="212" cy="70" r="14" fill="#FED7AA" />
    </svg>
  </div>
);

export const DocumentIllustration = () => (
  <div className="w-full flex justify-center py-3">
    <svg viewBox="0 0 280 160" className="w-full max-w-[220px] h-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="140" cy="80" r="65" fill="#FEF3C7" />
      {/* Folder Back */}
      <rect x="90" y="55" width="105" height="70" rx="6" fill="#FBBF24" />
      <path d="M90 60 L120 60 L132 70 L195 70 L195 125 L90 125 Z" fill="#F59E0B" />
      {/* Paper sticking out */}
      <rect x="110" y="32" width="65" height="75" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="118" y="44" width="35" height="4" rx="2" fill="#3B82F6" />
      <rect x="118" y="54" width="48" height="3" rx="1.5" fill="#94A3B8" />
      <rect x="118" y="62" width="42" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="118" y="70" width="48" height="3" rx="1.5" fill="#CBD5E1" />
      {/* Folder Front Flap */}
      <rect x="85" y="72" width="112" height="55" rx="5" fill="#FBBF24" opacity="0.9" />
      {/* Shield icon */}
      <circle cx="141" cy="98" r="14" fill="#10B981" />
      <path d="M136 98 L140 102 L147 94" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
