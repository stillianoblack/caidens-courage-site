import React from 'react';
import type { CharlieNatureAccent } from '../../types/gameAssessment';
import './charlie-nature-illustration.css';

type CharlieNatureIllustrationProps = {
  accent?: CharlieNatureAccent;
};

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 160 120" className="charlie-natureSvg" aria-hidden="true">
      {children}
    </svg>
  );
}

function renderScene(accent?: CharlieNatureAccent) {
  switch (accent) {
    case 'turtle-crossing':
      return (
        <Scene>
          <rect x="8" y="88" width="144" height="10" rx="4" fill="#8b7355" opacity="0.35" />
          <rect x="12" y="78" width="136" height="8" rx="3" fill="#6b8f71" opacity="0.25" />
          <ellipse cx="52" cy="72" rx="22" ry="14" fill="#5a9a6e" />
          <ellipse cx="72" cy="68" rx="18" ry="12" fill="#4d8a60" />
          <circle cx="88" cy="64" r="10" fill="#7ec87a" />
          <ellipse cx="44" cy="66" rx="5" ry="3" fill="#2d5a3d" />
          <path d="M30 92 L130 92" stroke="#c4a574" strokeWidth="3" strokeDasharray="8 6" />
          <rect x="118" y="48" width="28" height="18" rx="4" fill="#fff" stroke="#5a9a6e" strokeWidth="2" />
          <text x="124" y="61" fontSize="10" fill="#3d7a52" fontWeight="700">
            SLOW
          </text>
        </Scene>
      );
    case 'muddy-footprints':
      return (
        <Scene>
          <ellipse cx="80" cy="95" rx="60" ry="12" fill="#8b7355" opacity="0.3" />
          <ellipse cx="48" cy="78" rx="10" ry="14" fill="#6b5344" opacity="0.55" />
          <ellipse cx="72" cy="70" rx="9" ry="13" fill="#6b5344" opacity="0.5" />
          <ellipse cx="96" cy="64" rx="8" ry="12" fill="#6b5344" opacity="0.45" />
          <ellipse cx="118" cy="58" rx="7" ry="11" fill="#6b5344" opacity="0.4" />
          <ellipse cx="100" cy="38" rx="42" ry="18" fill="#7eb8d4" opacity="0.35" />
          <path d="M56 42 Q80 28 104 42" fill="#5a9a6e" opacity="0.25" />
        </Scene>
      );
    case 'frog-pond':
      return (
        <Scene>
          <ellipse cx="80" cy="88" rx="58" ry="16" fill="#7eb8d4" opacity="0.45" />
          <ellipse cx="80" cy="82" rx="48" ry="10" fill="#5a9a6e" opacity="0.2" />
          <ellipse cx="68" cy="72" rx="16" ry="12" fill="#5a9a6e" />
          <circle cx="62" cy="68" r="5" fill="#fff" />
          <circle cx="63" cy="68" r="2" fill="#243e70" />
          <ellipse cx="78" cy="70" rx="3" ry="5" fill="#4d8a60" />
          <path d="M40 50 Q52 36 64 44" stroke="#8bc48a" strokeWidth="3" fill="none" />
          <circle cx="110" cy="46" r="8" fill="#fff" opacity="0.5" />
        </Scene>
      );
    case 'raccoon-snacks':
      return (
        <Scene>
          <rect x="20" y="72" width="48" height="28" rx="6" fill="#e8924f" opacity="0.35" stroke="#d97a35" strokeWidth="2" />
          <rect x="92" y="68" width="40" height="24" rx="5" fill="#fff" stroke="#c4a574" strokeWidth="2" />
          <ellipse cx="118" cy="58" rx="20" ry="16" fill="#6b5344" />
          <circle cx="112" cy="52" r="4" fill="#fff" />
          <circle cx="124" cy="52" r="4" fill="#fff" />
          <circle cx="113" cy="52" r="1.5" fill="#243e70" />
          <circle cx="125" cy="52" r="1.5" fill="#243e70" />
          <ellipse cx="118" cy="60" rx="6" ry="3" fill="#4a3728" />
          <path d="M104 62 L96 68" stroke="#6b5344" strokeWidth="3" strokeLinecap="round" />
        </Scene>
      );
    case 'bird-nest':
      return (
        <Scene>
          <ellipse cx="80" cy="78" rx="36" ry="14" fill="#8b7355" opacity="0.55" />
          <ellipse cx="80" cy="74" rx="28" ry="10" fill="#c4a574" opacity="0.45" />
          <circle cx="72" cy="70" r="6" fill="#f5e6c8" stroke="#d97a35" strokeWidth="1.5" />
          <circle cx="84" cy="72" r="6" fill="#f5e6c8" stroke="#d97a35" strokeWidth="1.5" />
          <circle cx="78" cy="78" r="5" fill="#f5e6c8" stroke="#d97a35" strokeWidth="1.5" />
          <path d="M48 58 L56 42 L64 52 L72 38 L80 48" stroke="#5a9a6e" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="118" cy="44" rx="14" ry="8" fill="#8bc48a" opacity="0.4" />
        </Scene>
      );
    case 'bug-leaf':
      return (
        <Scene>
          <ellipse cx="80" cy="72" rx="44" ry="28" fill="#5a9a6e" opacity="0.35" />
          <path d="M80 44 L80 96" stroke="#3d7a52" strokeWidth="2" />
          <ellipse cx="68" cy="58" rx="14" ry="8" fill="#8bc48a" opacity="0.6" />
          <ellipse cx="92" cy="58" rx="14" ry="8" fill="#8bc48a" opacity="0.6" />
          <ellipse cx="80" cy="64" rx="10" ry="14" fill="#4d8a60" />
          <circle cx="76" cy="58" r="3" fill="#243e70" />
          <circle cx="84" cy="58" r="3" fill="#243e70" />
          <path d="M64 66 L56 72 M96 66 L104 72" stroke="#3d7a52" strokeWidth="2" />
        </Scene>
      );
    case 'rain-cloud':
      return (
        <Scene>
          <ellipse cx="72" cy="48" rx="40" ry="22" fill="#94a3b8" opacity="0.55" />
          <ellipse cx="96" cy="42" rx="28" ry="18" fill="#94a3b8" opacity="0.45" />
          <rect x="48" y="58" width="4" height="14" rx="2" fill="#64748b" opacity="0.6" />
          <rect x="68" y="62" width="4" height="16" rx="2" fill="#64748b" opacity="0.6" />
          <rect x="88" y="60" width="4" height="12" rx="2" fill="#64748b" opacity="0.6" />
          <rect x="108" y="64" width="4" height="14" rx="2" fill="#64748b" opacity="0.6" />
          <rect x="24" y="78" width="112" height="24" rx="6" fill="#fff" stroke="#5a9a6e" strokeWidth="2" />
          <path d="M40 90 L56 90 M72 90 L88 90 M104 90 L120 90" stroke="#5a9a6e" strokeWidth="2" />
        </Scene>
      );
    case 'kind-muddy':
      return (
        <Scene>
          <circle cx="48" cy="58" r="16" fill="#f5d0a8" stroke="#243e70" strokeWidth="2" />
          <circle cx="112" cy="58" r="16" fill="#f5d0a8" stroke="#243e70" strokeWidth="2" />
          <ellipse cx="48" cy="78" rx="14" ry="18" fill="#8b7355" opacity="0.45" />
          <ellipse cx="112" cy="72" rx="14" ry="16" fill="#5a9a6e" opacity="0.35" />
          <path d="M64 72 L96 72" stroke="#5a9a6e" strokeWidth="3" strokeLinecap="round" />
          <path d="M88 68 L96 72 L88 76" fill="#5a9a6e" />
        </Scene>
      );
    case 'woodpecker':
      return (
        <Scene>
          <rect x="72" y="24" width="16" height="72" rx="4" fill="#8b7355" />
          <ellipse cx="56" cy="44" rx="14" ry="10" fill="#e8924f" />
          <path d="M44 44 L32 40" stroke="#d97a35" strokeWidth="3" strokeLinecap="round" />
          <circle cx="52" cy="42" r="3" fill="#243e70" />
          <path d="M76 36 L84 28 M76 48 L88 44 M76 60 L86 58" stroke="#c4a574" strokeWidth="2" />
        </Scene>
      );
    case 'snail-rain':
      return (
        <Scene>
          <ellipse cx="80" cy="88" rx="50" ry="10" fill="#7eb8d4" opacity="0.3" />
          <circle cx="72" cy="72" r="14" fill="#c4a574" opacity="0.55" />
          <path d="M72 58 C72 50 80 46 88 50 C96 54 96 64 88 68" fill="#8b7355" opacity="0.5" />
          <ellipse cx="96" cy="54" rx="8" ry="6" fill="#8bc48a" />
          <circle cx="94" cy="52" r="2" fill="#243e70" />
          <rect x="40" y="32" width="3" height="8" rx="1.5" fill="#94a3b8" opacity="0.5" />
          <rect x="100" y="28" width="3" height="10" rx="1.5" fill="#94a3b8" opacity="0.5" />
        </Scene>
      );
    case 'ant-teamwork':
      return (
        <Scene>
          <ellipse cx="52" cy="78" rx="8" ry="6" fill="#4a3728" />
          <ellipse cx="72" cy="72" rx="8" ry="6" fill="#4a3728" />
          <ellipse cx="92" cy="66" rx="8" ry="6" fill="#4a3728" />
          <rect x="44" y="58" width="20" height="10" rx="3" fill="#e8924f" opacity="0.5" />
          <rect x="64" y="54" width="18" height="9" rx="3" fill="#e8924f" opacity="0.45" />
          <path d="M40 82 L120 82" stroke="#8b7355" strokeWidth="2" opacity="0.4" />
        </Scene>
      );
    case 'butterfly-pollination':
      return (
        <Scene>
          <ellipse cx="56" cy="68" rx="18" ry="22" fill="#b784d7" opacity="0.45" />
          <ellipse cx="104" cy="68" rx="18" ry="22" fill="#e8924f" opacity="0.45" />
          <ellipse cx="80" cy="68" rx="18" ry="22" fill="#8bc48a" opacity="0.35" />
          <ellipse cx="80" cy="62" rx="6" ry="20" fill="#4a3728" />
          <circle cx="80" cy="48" r="5" fill="#4a3728" />
          <path d="M76 44 L72 36 M84 44 L88 36" stroke="#4a3728" strokeWidth="2" />
        </Scene>
      );
    case 'scared-bug':
      return (
        <Scene>
          <circle cx="56" cy="58" r="14" fill="#f5d0a8" stroke="#243e70" strokeWidth="2" />
          <ellipse cx="104" cy="72" rx="12" ry="8" fill="#5a9a6e" />
          <circle cx="100" cy="70" r="2" fill="#243e70" />
          <path d="M68 58 L88 68" stroke="#5a9a6e" strokeWidth="2" strokeDasharray="4 3" />
          <text x="44" y="62" fontSize="14" fill="#243e70">
            !
          </text>
        </Scene>
      );
    case 'trail-trash':
      return (
        <Scene>
          <path d="M20 88 C40 76 60 82 80 74 C100 66 120 78 140 70" stroke="#8b7355" strokeWidth="4" fill="none" />
          <rect x="64" y="62" width="14" height="18" rx="2" fill="#94a3b8" opacity="0.6" />
          <rect x="98" y="66" width="12" height="10" rx="2" fill="#e8924f" opacity="0.5" />
          <circle cx="118" cy="58" r="8" fill="#fff" stroke="#5a9a6e" strokeWidth="2" />
          <path d="M114 58 L122 58 M118 54 L118 62" stroke="#5a9a6e" strokeWidth="2" />
        </Scene>
      );
    case 'squirrel-space':
      return (
        <Scene>
          <ellipse cx="108" cy="62" rx="18" ry="14" fill="#c4a574" opacity="0.55" />
          <circle cx="100" cy="56" r="5" fill="#fff" />
          <circle cx="112" cy="56" r="5" fill="#fff" />
          <path d="M124 58 L136 48" stroke="#c4a574" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="72" r="14" fill="#f5d0a8" stroke="#243e70" strokeWidth="2" />
          <path d="M36 72 L24 72" stroke="#5a9a6e" strokeWidth="2" />
          <text x="18" y="76" fontSize="9" fill="#5a9a6e" fontWeight="700">
            SPACE
          </text>
        </Scene>
      );
    case 'observe-hands':
      return (
        <Scene>
          <circle cx="52" cy="52" r="18" fill="#f5d0a8" stroke="#243e70" strokeWidth="2" />
          <circle cx="108" cy="52" r="18" fill="#f5d0a8" stroke="#243e70" strokeWidth="2" />
          <ellipse cx="80" cy="78" rx="28" ry="16" fill="#5a9a6e" opacity="0.3" />
          <circle cx="80" cy="72" r="10" fill="#8bc48a" />
          <path d="M44 68 L44 88 M116 68 L116 88" stroke="#f5d0a8" strokeWidth="6" strokeLinecap="round" />
          <path d="M36 88 L52 88 M108 88 L124 88" stroke="#243e70" strokeWidth="2" />
        </Scene>
      );
    default:
      return (
        <Scene>
          <ellipse cx="80" cy="72" rx="40" ry="24" fill="#5a9a6e" opacity="0.3" />
          <circle cx="80" cy="56" r="16" fill="#8bc48a" />
        </Scene>
      );
  }
}

export default function CharlieNatureIllustration({ accent }: CharlieNatureIllustrationProps) {
  return (
    <div className="charlie-natureIllustration" aria-hidden="true">
      {renderScene(accent)}
    </div>
  );
}
