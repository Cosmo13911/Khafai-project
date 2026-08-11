import React from "react";

interface KhafaiLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const KhafaiLogo: React.FC<KhafaiLogoProps> = ({
  className = "w-10 h-10",
  width,
  height,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="boltGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD200" />
          <stop offset="55%" stopColor="#FFB400" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3FD2F0" />
          <stop offset="100%" stopColor="#0B5CFF" />
        </linearGradient>
        <linearGradient id="paperGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F2F6" />
        </linearGradient>
        <linearGradient id="rollGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8BCCB" />
          <stop offset="50%" stopColor="#E8E9F0" />
          <stop offset="100%" stopColor="#C6CAD8" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="10"
            floodColor="#4A5A80"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      {/* กระดาษม้วนขวา */}
      <rect x="368" y="132" width="46" height="276" rx="20" fill="#E3E4EC" />
      <path
        d="M368 132 h26 a20 20 0 0 1 20 20 v56 a20 20 0 0 0 20 20 h-66 z"
        fill="none"
      />

      {/* ปากม้วน */}
      <path d="M386 140 a26 26 0 0 1 52 0 v54 h-52 z" fill="url(#rollGrad)" />

      {/* ตัวกระดาษ */}
      <g filter="url(#shadow)">
        <path
          d="M170 126 h176 a42 42 0 0 1 42 42 v184 a34 34 0 0 1 -34 34 H188 a34 34 0 0 1 -34 -34 v-186 a40 40 0 0 1 16 -40 z"
          fill="url(#paperGrad)"
        />
      </g>

      {/* บรรทัดข้อความ */}
      <rect x="254" y="168" width="86" height="14" rx="7" fill="#A7A9BC" />
      <rect x="254" y="202" width="86" height="14" rx="7" fill="#A7A9BC" />

      {/* กราฟแท่ง */}
      <rect x="198" y="322" width="30" height="44" rx="12" fill="url(#barGrad)" />
      <rect x="236" y="296" width="30" height="70" rx="12" fill="url(#barGrad)" />
      <rect x="274" y="262" width="30" height="104" rx="12" fill="url(#barGrad)" />
      <rect x="312" y="232" width="30" height="134" rx="12" fill="url(#barGrad)" />

      {/* สายฟ้า */}
      <path
        d="M216 106
           C 222 96 232 96 228 108
           L 196 200
           C 194 206 198 210 204 210
           L 240 210
           C 250 210 252 220 246 228
           L 134 356
           C 128 362 122 358 124 350
           L 158 254
           C 160 248 158 244 152 244
           L 118 244
           C 108 244 106 234 112 226
           Z"
        fill="url(#boltGrad)"
      />
    </svg>
  );
};
