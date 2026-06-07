import React from 'react';
import type { CaidenQuestAccent } from '../../types/gameAssessment';

type CaidenQuestGraphicProps = {
  accent?: CaidenQuestAccent;
};

function SceneSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 120" className="caiden-questSvg" aria-hidden="true">
      {children}
    </svg>
  );
}

function renderScene(accent?: CaidenQuestAccent) {
  switch (accent) {
    case 'camp-pack':
      return (
        <SceneSvg>
          {/* Classroom desk surface */}
          <rect x="8" y="78" width="304" height="8" rx="2" fill="#e5c06a" opacity="0.35" />
          {/* Backpack */}
          <rect x="24" y="38" width="44" height="48" rx="6" fill="#dbeafe" stroke="#243e70" strokeWidth="2" />
          <path d="M34 38 L46 24 L58 38" fill="none" stroke="#243e70" strokeWidth="2" />
          {/* Homework paper */}
          <rect x="82" y="44" width="36" height="44" rx="3" fill="#fff" stroke="#243e70" strokeWidth="2" />
          <line x1="90" y1="54" x2="110" y2="54" stroke="#243e70" strokeWidth="1.5" opacity="0.35" />
          <line x1="90" y1="62" x2="108" y2="62" stroke="#243e70" strokeWidth="1.5" opacity="0.35" />
          {/* Sketchbook */}
          <rect x="130" y="46" width="40" height="40" rx="4" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <path d="M138 58 Q150 52 162 60" fill="none" stroke="#f97316" strokeWidth="2" />
          {/* Pencil */}
          <rect x="178" y="50" width="28" height="6" rx="2" fill="#fbbf24" transform="rotate(25 178 50)" />
          <polygon points="204,52 212,53 204,54" fill="#243e70" />
          {/* Clock */}
          <circle cx="248" cy="52" r="22" fill="#fff" stroke="#243e70" strokeWidth="2" />
          <path d="M248 52 L248 38" stroke="#243e70" strokeWidth="2" strokeLinecap="round" />
          <path d="M248 52 L260 56" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
          {/* Focus flame glow */}
          <circle cx="288" cy="36" r="12" fill="#f97316" opacity="0.75" />
          <circle cx="288" cy="36" r="18" fill="#f97316" opacity="0.15" />
        </SceneSvg>
      );
    case 'small-step':
      return (
        <SceneSvg>
          <rect x="20" y="70" width="40" height="8" rx="4" fill="#e5c06a" opacity="0.5" />
          <rect x="70" y="58" width="40" height="8" rx="4" fill="#e5c06a" opacity="0.7" />
          <rect x="120" y="46" width="40" height="8" rx="4" fill="#e5c06a" />
          <circle cx="200" cy="50" r="18" fill="#f97316" opacity="0.9" />
          <path d="M200 32 L200 68 M188 50 L212 50" stroke="#fff" strokeWidth="2" />
        </SceneSvg>
      );
    case 'distraction':
      return (
        <SceneSvg>
          <rect x="24" y="40" width="72" height="48" rx="6" fill="#fff" stroke="#243e70" strokeWidth="2" />
          <line x1="32" y1="52" x2="88" y2="52" stroke="#243e70" strokeWidth="2" opacity="0.3" />
          <line x1="32" y1="64" x2="72" y2="64" stroke="#243e70" strokeWidth="2" opacity="0.3" />
          <rect x="200" y="32" width="56" height="72" rx="8" fill="#1a2f52" opacity="0.15" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="228" cy="56" r="8" fill="#3b82f6" opacity="0.6" />
        </SceneSvg>
      );
    case 'timer':
      return (
        <SceneSvg>
          <circle cx="80" cy="60" r="36" fill="#fff" stroke="#243e70" strokeWidth="3" />
          <path d="M80 60 L80 38" stroke="#243e70" strokeWidth="3" strokeLinecap="round" />
          <path d="M80 60 L98 68" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <rect x="180" y="44" width="100" height="32" rx="16" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <text x="200" y="66" fontSize="14" fill="#1a2f52" fontWeight="700">20 min</text>
        </SceneSvg>
      );
    case 'focus-reset':
      return (
        <SceneSvg>
          <circle cx="70" cy="60" r="28" fill="#dbeafe" stroke="#243e70" strokeWidth="2" />
          <path d="M58 60 Q70 40 82 60 Q70 80 58 60" fill="#3b82f6" opacity="0.4" />
          <circle cx="200" cy="60" r="22" fill="#f97316" opacity="0.85" />
          <path d="M190 60 L210 60 M200 50 L200 70" stroke="#fff" strokeWidth="2" />
        </SceneSvg>
      );
    case 'weekly-plan':
      return (
        <SceneSvg>
          <rect x="24" y="28" width="100" height="72" rx="8" fill="#fff" stroke="#243e70" strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="36" y={40 + i * 14} width={60 - i * 8} height="6" rx="3" fill="#e5c06a" opacity={0.4 + i * 0.15} />
          ))}
          <circle cx="220" cy="60" r="20" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
        </SceneSvg>
      );
    case 'priority':
      return (
        <SceneSvg>
          <circle cx="60" cy="50" r="20" fill="#dbeafe" stroke="#243e70" strokeWidth="2" />
          <path d="M52 50 L68 50 M60 42 L60 58" stroke="#243e70" strokeWidth="2" />
          <path d="M120 70 Q160 30 200 70" fill="none" stroke="#e5c06a" strokeWidth="3" strokeDasharray="6 4" />
          <rect x="220" y="40" width="64" height="40" rx="6" fill="#fff" stroke="#243e70" strokeWidth="2" />
        </SceneSvg>
      );
    case 'reflection':
      return (
        <SceneSvg>
          <path d="M40 80 Q80 20 120 80 Q160 40 200 80" fill="none" stroke="#e5c06a" strokeWidth="3" />
          {[80, 120, 160].map((x) => (
            <circle key={x} cx={x} cy={60} r="8" fill="#f97316" opacity="0.7" />
          ))}
          <circle cx="260" cy="50" r="24" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
        </SceneSvg>
      );
    case 'ask-help':
      return (
        <SceneSvg>
          {/* Missing notebook — dashed outline */}
          <rect x="24" y="32" width="52" height="64" rx="4" fill="#fff" stroke="#243e70" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="34" y1="48" x2="66" y2="48" stroke="#243e70" strokeWidth="1.5" opacity="0.25" />
          <line x1="34" y1="58" x2="62" y2="58" stroke="#243e70" strokeWidth="1.5" opacity="0.25" />
          <line x1="34" y1="68" x2="58" y2="68" stroke="#243e70" strokeWidth="1.5" opacity="0.25" />
          {/* Missing marker */}
          <text x="42" y="28" fontSize="22" fill="#dc2626" fontWeight="800">?</text>
          {/* Teacher / help icon */}
          <circle cx="130" cy="52" r="26" fill="#dbeafe" stroke="#243e70" strokeWidth="2" />
          <circle cx="122" cy="46" r="3" fill="#243e70" />
          <circle cx="138" cy="46" r="3" fill="#243e70" />
          <path d="M122 58 Q130 66 138 58" fill="none" stroke="#243e70" strokeWidth="2" />
          <rect x="118" y="22" width="24" height="8" rx="4" fill="#243e70" opacity="0.2" />
          {/* Focus Flame pause */}
          <circle cx="220" cy="52" r="24" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <circle cx="220" cy="52" r="14" fill="#f97316" opacity="0.85" />
          <rect x="214" y="44" width="4" height="16" rx="1" fill="#fff" />
          <rect x="222" y="44" width="4" height="16" rx="1" fill="#fff" />
          <path d="M248 52 L268 52" stroke="#243e70" strokeWidth="2" markerEnd="url(#helpArrow)" />
          <defs>
            <marker id="helpArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#243e70" />
            </marker>
          </defs>
        </SceneSvg>
      );
    case 'attention-return':
      return (
        <SceneSvg>
          <ellipse cx="80" cy="40" rx="24" ry="14" fill="#dbeafe" stroke="#243e70" strokeWidth="1.5" opacity="0.7" />
          <ellipse cx="120" cy="28" rx="20" ry="12" fill="#dbeafe" stroke="#243e70" strokeWidth="1.5" opacity="0.5" />
          <path d="M160 80 L220 50" stroke="#243e70" strokeWidth="3" markerEnd="url(#arrow)" />
          <circle cx="240" cy="44" r="28" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#243e70" />
            </marker>
          </defs>
        </SceneSvg>
      );
    case 'take-turns':
      return (
        <SceneSvg>
          <circle cx="70" cy="60" r="22" fill="#dbeafe" stroke="#243e70" strokeWidth="2" />
          <circle cx="130" cy="60" r="22" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <rect x="190" y="48" width="48" height="24" rx="12" fill="#243e70" />
          <path d="M200 60 L228 60 M214 52 L228 60 L214 68" fill="none" stroke="#fff" strokeWidth="2" />
        </SceneSvg>
      );
    case 'healthy-break':
      return (
        <SceneSvg>
          <circle cx="70" cy="60" r="32" fill="#fff" stroke="#243e70" strokeWidth="2" />
          <text x="52" y="66" fontSize="14" fill="#1a2f52" fontWeight="700">20m</text>
          <rect x="140" y="44" width="56" height="32" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
          <text x="152" y="66" fontSize="12" fill="#243e70">break</text>
          <path d="M220 70 L260 50" stroke="#e5c06a" strokeWidth="3" />
        </SceneSvg>
      );
    case 'one-step':
      return (
        <SceneSvg>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={40 + i * 50} y={80 - i * 16} width="36" height="10" rx="5" fill="#e5c06a" opacity={0.5 + i * 0.15} />
          ))}
          <circle cx="260" cy="40" r="20" fill="#f97316" opacity="0.9" />
        </SceneSvg>
      );
    case 'responsible-choice':
      return (
        <SceneSvg>
          <rect x="24" y="52" width="120" height="40" rx="8" fill="#fff" stroke="#243e70" strokeWidth="2" />
          <circle cx="60" cy="72" r="14" fill="#dbeafe" />
          <circle cx="100" cy="72" r="14" fill="#fef3c7" />
          <path d="M180 72 L240 72" stroke="#e5c06a" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx="260" cy="72" r="16" fill="#243e70" />
          <text x="254" y="78" fontSize="14" fill="#fff">+</text>
        </SceneSvg>
      );
    case 'recover-mistake':
      return (
        <SceneSvg>
          <rect x="40" y="48" width="64" height="40" rx="6" fill="#fff" stroke="#dc2626" strokeWidth="2" opacity="0.8" />
          <text x="58" y="74" fontSize="20" fill="#dc2626">✕</text>
          <path d="M140 72 Q180 30 220 72" fill="none" stroke="#243e70" strokeWidth="2" />
          <circle cx="240" cy="50" r="18" fill="#f97316" opacity="0.9" />
        </SceneSvg>
      );
    case 'growth-reflection':
      return (
        <SceneSvg>
          <path d="M40 80 Q100 30 160 60 Q220 90 280 40" fill="none" stroke="#e5c06a" strokeWidth="3" />
          <circle cx="280" cy="40" r="22" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <text x="270" y="46" fontSize="16">★</text>
        </SceneSvg>
      );
    default:
      return (
        <SceneSvg>
          <circle cx="80" cy="60" r="24" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <circle cx="200" cy="60" r="18" fill="#f97316" opacity="0.8" />
        </SceneSvg>
      );
  }
}

export default function CaidenQuestGraphic({ accent }: CaidenQuestGraphicProps) {
  return (
    <div className={`caiden-questGraphic${accent ? ` caiden-questGraphic--${accent}` : ''}`}>
      {renderScene(accent)}
    </div>
  );
}
