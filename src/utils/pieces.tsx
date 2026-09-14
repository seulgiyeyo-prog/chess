import React from 'react';
import { PieceSymbol, PieceColor } from '../types';

interface PieceProps {
  type: PieceSymbol;
  color: PieceColor;
  className?: string;
  size?: number | string;
}

export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = '', size = '88%' }) => {
  const isWhite = color === 'w';
  const gradId = `${color}-${type}-3d`;

  return (
    <div
      className={`relative select-none flex items-center justify-center transition-all duration-200 group-hover:scale-105 active:scale-95 ${className}`}
      style={{
        width: size,
        height: size,
        transform: 'translateZ(20px)',
      }}
    >
      {/* 3D Base Pedestal Shadow: Creates the realistic bottom floor shadow under the heavy piece */}
      <div
        className="absolute bottom-[-4%] w-[74%] h-[20%] rounded-[50%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 55%, transparent 75%)',
          filter: 'blur(2.5px)',
          transform: 'scaleY(0.45)',
        }}
      />

      {/* Realistic 3D Carved Staunton SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        style={{
          filter: isWhite
            ? 'drop-shadow(0px 8px 10px rgba(0,0,0,0.45)) drop-shadow(0px 2px 3px rgba(0,0,0,0.3))'
            : 'drop-shadow(0px 8px 10px rgba(0,0,0,0.65)) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Specular Light & Gradients for White Pieces (Polished Ivory / Marble wood) */}
          <linearGradient id={`white-body-${gradId}`} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fdfefe" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="85%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <linearGradient id={`white-highlight-${gradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`white-base-${gradId}`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* 3D Specular Light & Gradients for Black Pieces (Obsidian / Polished Ebony) */}
          <linearGradient id={`black-body-${gradId}`} x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="25%" stopColor="#334155" />
            <stop offset="60%" stopColor="#1e293b" />
            <stop offset="85%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id={`black-highlight-${gradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#64748b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`black-base-${gradId}`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Gold / Royal trim for King & Queen crown accents */}
          <linearGradient id="royal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {renderRealisticPiece(type, isWhite, gradId)}
      </svg>
    </div>
  );
};

function renderRealisticPiece(type: PieceSymbol, isWhite: boolean, gradId: string) {
  const bodyGrad = isWhite ? `url(#white-body-${gradId})` : `url(#black-body-${gradId})`;
  const baseGrad = isWhite ? `url(#white-base-${gradId})` : `url(#black-base-${gradId})`;
  const highLight = isWhite ? `url(#white-highlight-${gradId})` : `url(#black-highlight-${gradId})`;
  const strokeColor = isWhite ? '#94a3b8' : '#090d16';
  const rimLight = isWhite ? '#ffffff' : '#64748b';

  // Realistic common tiered pedestal base
  const renderPedestal = () => (
    <g id="pedestal">
      {/* Lowest pedestal ring */}
      <ellipse cx="50" cy="89" rx="36" ry="6" fill={baseGrad} stroke={strokeColor} strokeWidth="1.2" />
      {/* Lower bevel */}
      <path
        d="M16 88 C 16 83, 24 81, 50 81 C 76 81, 84 83, 84 88 C 84 89, 76 93, 50 93 C 24 93, 16 89, 16 88 Z"
        fill={baseGrad}
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      {/* Mid pedestal tier */}
      <ellipse cx="50" cy="82" rx="30" ry="4.5" fill={bodyGrad} stroke={strokeColor} strokeWidth="1" />
      {/* Upper collar rim */}
      <ellipse cx="50" cy="77" rx="24" ry="3.8" fill={bodyGrad} stroke={strokeColor} strokeWidth="1" />
      {/* Specular highlight on base curve */}
      <path
        d="M24 82 C 30 80, 42 79, 52 79"
        stroke={rimLight}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />
    </g>
  );

  switch (type) {
    case 'p': // Realistic 3D Pawn
      return (
        <g id="pawn-3d">
          {renderPedestal()}

          {/* Stem / Waisted Body */}
          <path
            d="M30 76 C 36 62, 38 48, 41 38 L 59 38 C 62 48, 64 62, 70 76 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Body curved light reflect */}
          <path
            d="M38 72 C 40 58, 42 46, 44 40"
            stroke={rimLight}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Neck Collar Rim */}
          <ellipse cx="50" cy="38" rx="14" ry="3.5" fill={bodyGrad} stroke={strokeColor} strokeWidth="1.2" />
          <ellipse cx="50" cy="35" rx="12" ry="3" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Spherical Head with 3D spherical shading */}
          <circle cx="50" cy="22" r="14" fill={bodyGrad} stroke={strokeColor} strokeWidth="1.4" />
          {/* Spherical 3D light reflection glint */}
          <ellipse cx="45" cy="17" rx="6.5" ry="4.5" fill="#ffffff" opacity={isWhite ? '0.75' : '0.35'} transform="rotate(-25 45 17)" />
        </g>
      );

    case 'n': // Realistic 3D Knight (Detailed sculptural horse with mane & muzzle)
      return (
        <g id="knight-3d">
          {renderPedestal()}

          {/* Muscular Neck & Head Silhouette */}
          <path
            d="M28 76 C 30 66, 32 54, 28 44 C 24 38, 20 36, 21 32 C 22 28, 28 26, 34 26 C 35 22, 37 14, 42 12 C 45 10, 48 13, 49 17 C 53 15, 60 17, 65 22 C 73 30, 78 45, 74 58 C 72 65, 70 71, 72 76 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Knight Mane Layer (Carved ridges) */}
          <path
            d="M48 18 C 55 22, 60 27, 63 35 M52 28 C 59 34, 64 42, 66 52 M56 42 C 63 50, 66 60, 68 70"
            stroke={isWhite ? '#cbd5e1' : '#475569'}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Snout and Jaw contour */}
          <path
            d="M22 34 C 26 38, 33 40, 39 37 C 44 35, 47 29, 44 26"
            fill={isWhite ? '#f8fafc' : '#334155'}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Nostril */}
          <ellipse cx="25" cy="33" rx="1.8" ry="1.2" fill={strokeColor} />

          {/* Fierce Eye */}
          <ellipse cx="38" cy="24" rx="2.5" ry="1.8" fill={isWhite ? '#1e293b' : '#94a3b8'} />
          <circle cx="37.5" cy="23.5" r="0.8" fill="#ffffff" />

          {/* Chest muscular highlight */}
          <path
            d="M29 50 C 33 58, 38 66, 42 74"
            stroke={rimLight}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      );

    case 'b': // Realistic 3D Bishop (Mitre cap with deep carved cross-slit & jewel finial)
      return (
        <g id="bishop-3d">
          {renderPedestal()}

          {/* Body stem */}
          <path
            d="M32 76 C 36 62, 38 52, 40 46 L 60 46 C 62 52, 64 62, 68 76 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Collar ring */}
          <ellipse cx="50" cy="46" rx="16" ry="3.8" fill={baseGrad} stroke={strokeColor} strokeWidth="1.2" />
          <ellipse cx="50" cy="43" rx="14" ry="3.2" fill={bodyGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Mitre (Bishop Hat) */}
          <path
            d="M35 43 C 32 35, 33 22, 50 13 C 67 22, 68 35, 65 43 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Carved Mitre Slash (Notch) */}
          <path
            d="M45 23 L 57 33"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M46 22 L 57 31"
            stroke={isWhite ? '#ffffff' : '#64748b'}
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Highlight along round mitre */}
          <path
            d="M38 38 C 37 30, 41 20, 48 16"
            stroke={rimLight}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Top Globular Finial */}
          <circle cx="50" cy="11" r="3.8" fill={isWhite ? '#fef08a' : 'url(#royal-gold)'} stroke={strokeColor} strokeWidth="1" />
          <circle cx="49" cy="9.8" r="1.2" fill="#ffffff" opacity="0.9" />
        </g>
      );

    case 'r': // Realistic 3D Rook (Castle Tower with battlement embrasures & stone masonry)
      return (
        <g id="rook-3d">
          {renderPedestal()}

          {/* Solid Castle Tower Trunk */}
          <path
            d="M29 76 L 33 39 L 67 39 L 71 76 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Vertical 3D light reflection on tower cylinder */}
          <path
            d="M38 73 L 41 41"
            stroke={rimLight}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Upper Cornice Tier */}
          <ellipse cx="50" cy="38" rx="20" ry="4" fill={baseGrad} stroke={strokeColor} strokeWidth="1.2" />
          <path
            d="M27 38 L 26 23 L 74 23 L 73 38 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Crenellations / Battlement Embrasures (Castle Tops) */}
          <path
            d="M26 23 L 26 14 L 35 14 L 35 20 L 44 20 L 44 14 L 56 14 L 56 20 L 65 20 L 65 14 L 74 14 L 74 23 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Embrasure Depth Shadow */}
          <path
            d="M35 15 L 44 15 M56 15 L 65 15"
            stroke={isWhite ? '#cbd5e1' : '#0f172a'}
            strokeWidth="2"
          />
        </g>
      );

    case 'q': // Realistic 3D Queen (Regal Crown with Pearls & Coronet Points)
      return (
        <g id="queen-3d">
          {renderPedestal()}

          {/* Elegant Slim Flared Waist */}
          <path
            d="M32 76 C 36 60, 39 48, 41 39 L 59 39 C 61 48, 64 60, 68 76 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Body gloss beam */}
          <path
            d="M39 72 C 42 56, 44 46, 45 40"
            stroke={rimLight}
            strokeWidth="2.8"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Royal Coronet Base Ring */}
          <ellipse cx="50" cy="39" rx="18" ry="4" fill={baseGrad} stroke={strokeColor} strokeWidth="1.2" />

          {/* Flaring Crown Coronet */}
          <path
            d="M30 38 C 28 32, 22 23, 20 22 L 32 28 L 38 18 L 50 28 L 62 18 L 68 28 L 80 22 C 78 23, 72 32, 70 38 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Gold Royal Inset Arc */}
          <path
            d="M33 34 C 40 37, 60 37, 67 34"
            stroke="url(#royal-gold)"
            strokeWidth="2"
            fill="none"
          />

          {/* Jewels / Pearls on Coronet Spikes */}
          <circle cx="20" cy="21" r="2.6" fill={isWhite ? '#fef08a' : 'url(#royal-gold)'} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="38" cy="17" r="2.8" fill={isWhite ? '#fef08a' : 'url(#royal-gold)'} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="50" cy="27" r="2.8" fill={isWhite ? '#ffffff' : '#94a3b8'} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="62" cy="17" r="2.8" fill={isWhite ? '#fef08a' : 'url(#royal-gold)'} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="80" cy="21" r="2.6" fill={isWhite ? '#fef08a' : 'url(#royal-gold)'} stroke={strokeColor} strokeWidth="0.8" />
        </g>
      );

    case 'k': // Realistic 3D King (Imperial Crown with Maltese Cross)
      return (
        <g id="king-3d">
          {renderPedestal()}

          {/* Stately Wide Body */}
          <path
            d="M31 76 C 35 60, 38 48, 40 38 L 60 38 C 62 48, 65 60, 69 76 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Vertical Cylinder Highlight */}
          <path
            d="M39 72 C 42 56, 44 46, 45 40"
            stroke={rimLight}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* King Coronet Collar */}
          <ellipse cx="50" cy="38" rx="19" ry="4.2" fill={baseGrad} stroke={strokeColor} strokeWidth="1.2" />

          {/* Imperial Arched Dome (Camauro Crown) */}
          <path
            d="M29 37 C 26 27, 33 19, 50 18 C 67 19, 74 27, 71 37 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Crown Ribs */}
          <path
            d="M37 36 C 36 26, 42 20, 50 18 C 58 20, 64 26, 63 36"
            stroke={isWhite ? '#cbd5e1' : '#334155'}
            strokeWidth="1.5"
            fill="none"
          />

          {/* Gold Coronet Rim Band */}
          <ellipse cx="50" cy="36" rx="17" ry="3.2" stroke="url(#royal-gold)" strokeWidth="1.8" fill="none" />

          {/* 3D Maltese Cross on Top */}
          <g id="cross">
            {/* Cross Vertical */}
            <path
              d="M48 9 L 52 9 L 53 18 L 47 18 Z"
              fill={isWhite ? '#fef08a' : 'url(#royal-gold)'}
              stroke={strokeColor}
              strokeWidth="0.9"
            />
            {/* Cross Horizontal */}
            <path
              d="M44 11 L 56 11 L 56 15 L 44 15 Z"
              fill={isWhite ? '#fef08a' : 'url(#royal-gold)'}
              stroke={strokeColor}
              strokeWidth="0.9"
            />
            {/* Central jewel shine */}
            <circle cx="50" cy="13" r="1.5" fill="#ffffff" />
          </g>
        </g>
      );

    default:
      return null;
  }
}
