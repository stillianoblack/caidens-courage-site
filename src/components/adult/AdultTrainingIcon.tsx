import React from 'react';
import type {
  UncleTCoachingAccent,
  VictoriaFocusLabAccent,
  VictoriaReflectionAccent,
} from '../../types/gameAssessment';
import './adult-training-icon.css';

export type AdultTrainingIconName =
  | 'file-x'
  | 'shield-check'
  | 'rotate-ccw'
  | 'trending-up'
  | 'shield'
  | 'pause-circle'
  | 'footprints'
  | 'brain'
  | 'alert-circle'
  | 'heart-handshake'
  | 'sparkles'
  | 'arrow-right-circle'
  | 'sprout'
  | 'badge-check'
  | 'cloud-rain'
  | 'heart-pulse'
  | 'waves'
  | 'list-checks'
  | 'headphones'
  | 'clipboard-check'
  | 'timer-reset'
  | 'activity'
  | 'lightbulb';

type AdultTrainingIconProps = {
  name: AdultTrainingIconName;
  theme: 'uncle-t' | 'victoria' | 'charlie';
  className?: string;
};

function IconGlyph({ name }: { name: AdultTrainingIconName }) {
  switch (name) {
    case 'file-x':
      return (
        <>
          <rect x="18" y="10" width="28" height="36" rx="4" />
          <rect x="26" y="6" width="12" height="8" rx="2" />
          <path data-stroke d="M26 30 L38 42 M38 30 L26 42" />
        </>
      );
    case 'shield-check':
      return (
        <>
          <path d="M24 8 L40 14 V26 C40 34 33 40 24 44 C15 40 8 34 8 26 V14 Z" />
          <path data-stroke d="M18 26 L22 30 L30 20" />
        </>
      );
    case 'rotate-ccw':
      return (
        <>
          <path d="M14 24 C14 16 20 10 28 10 C34 10 39 14 41 20" data-stroke />
          <path d="M10 18 L14 10 L22 14" />
          <path d="M20 28 C20 32 24 36 30 36 C34 36 37 34 38 30" data-stroke />
        </>
      );
    case 'trending-up':
      return (
        <>
          <path d="M10 36 H42 V10 H10 Z" opacity="0.15" />
          <path d="M14 30 L22 22 L30 26 L38 14 V30 H14 Z" />
          <path d="M32 14 H38 V20" data-stroke />
        </>
      );
    case 'shield':
      return <path d="M24 6 L42 14 V26 C42 35 34 42 24 46 C14 42 6 35 6 26 V14 Z" />;
    case 'pause-circle':
      return (
        <>
          <circle cx="24" cy="24" r="20" />
          <rect x="18" y="16" width="6" height="16" rx="1.5" fill="#fff" />
          <rect x="28" y="16" width="6" height="16" rx="1.5" fill="#fff" />
        </>
      );
    case 'footprints':
      return (
        <>
          <ellipse cx="18" cy="34" rx="7" ry="9" />
          <ellipse cx="32" cy="22" rx="7" ry="9" />
          <circle cx="14" cy="18" r="3" />
          <circle cx="20" cy="14" r="3" />
          <circle cx="28" cy="12" r="3" />
          <circle cx="34" cy="16" r="3" />
        </>
      );
    case 'brain':
      return (
        <path d="M24 8 C16 8 10 14 10 22 C8 24 8 28 10 30 C8 34 10 40 16 42 C18 46 22 48 24 48 C26 48 30 46 32 42 C38 40 40 34 38 30 C40 28 40 24 38 22 C38 14 32 8 24 8 Z M20 20 C20 18 22 16 24 16 C26 16 28 18 28 20 C28 22 26 24 24 24 C22 24 20 22 20 20 Z" />
      );
    case 'alert-circle':
      return (
        <>
          <circle cx="24" cy="24" r="20" />
          <rect x="22" y="14" width="4" height="14" rx="2" fill="#fff" />
          <circle cx="24" cy="34" r="3" fill="#fff" />
        </>
      );
    case 'heart-handshake':
      return (
        <>
          <path d="M24 40 C14 32 8 26 8 18 C8 12 12 8 18 8 C21 8 23 10 24 12 C25 10 27 8 30 8 C36 8 40 12 40 18 C40 26 34 32 24 40 Z" />
          <path data-stroke d="M16 24 L20 28 L28 20" />
        </>
      );
    case 'sparkles':
      return (
        <>
          <path d="M24 6 L26 16 L36 18 L26 20 L24 30 L22 20 L12 18 L22 16 Z" />
          <circle cx="38" cy="10" r="3" />
          <circle cx="10" cy="32" r="2.5" />
        </>
      );
    case 'arrow-right-circle':
      return (
        <>
          <circle cx="24" cy="24" r="20" />
          <path d="M20 24 H30 M30 24 L26 20 M30 24 L26 28" data-stroke stroke="#fff" />
        </>
      );
    case 'sprout':
      return (
        <>
          <path d="M24 44 V28" data-stroke />
          <path d="M24 28 C16 28 12 22 12 16 C18 16 22 20 24 28 C26 20 30 16 36 16 C36 22 32 28 24 28 Z" />
        </>
      );
    case 'badge-check':
      return (
        <>
          <circle cx="24" cy="24" r="20" />
          <path data-stroke d="M16 24 L22 30 L34 18" stroke="#fff" />
        </>
      );
    case 'cloud-rain':
      return (
        <>
          <path d="M14 30 C8 30 6 24 10 20 C10 14 16 10 22 10 C24 6 30 4 36 8 C42 8 46 14 44 20 C48 22 48 30 42 32 H16 C14 32 14 31 14 30 Z" />
          <rect x="18" y="34" width="3" height="8" rx="1.5" />
          <rect x="26" y="36" width="3" height="8" rx="1.5" />
          <rect x="34" y="34" width="3" height="8" rx="1.5" />
        </>
      );
    case 'heart-pulse':
      return (
        <>
          <path d="M24 42 C12 32 6 26 6 18 C6 12 10 8 16 8 C19 8 22 10 24 14 C26 10 29 8 32 8 C38 8 42 12 42 18 C42 26 36 32 24 42 Z" />
          <path data-stroke d="M14 24 H18 L20 18 L24 30 L28 20 L30 24 H34" stroke="#fff" />
        </>
      );
    case 'waves':
      return (
        <>
          <path d="M8 28 C14 22 20 22 24 28 C28 34 34 34 40 28 V36 H8 Z" />
          <path d="M8 20 C14 14 20 14 24 20 C28 26 34 26 40 20" data-stroke />
        </>
      );
    case 'list-checks':
      return (
        <>
          <rect x="10" y="12" width="8" height="8" rx="2" />
          <rect x="22" y="14" width="22" height="4" rx="2" />
          <rect x="10" y="26" width="8" height="8" rx="2" />
          <rect x="22" y="28" width="22" height="4" rx="2" />
          <path data-stroke d="M12 16 L14 18 L18 14" />
          <path data-stroke d="M12 30 L14 32 L18 28" />
        </>
      );
    case 'headphones':
      return (
        <>
          <path d="M14 28 C14 18 18 12 24 12 C30 12 34 18 34 28 V34 H30 V28 C30 20 28 16 24 16 C20 16 18 20 18 28 V34 H14 Z" />
          <rect x="10" y="28" width="8" height="14" rx="4" />
          <rect x="30" y="28" width="8" height="14" rx="4" />
        </>
      );
    case 'clipboard-check':
      return (
        <>
          <rect x="14" y="10" width="28" height="36" rx="4" />
          <rect x="20" y="6" width="16" height="8" rx="3" />
          <path data-stroke d="M20 26 L24 30 L32 22" stroke="#fff" />
        </>
      );
    case 'timer-reset':
      return (
        <>
          <circle cx="24" cy="26" r="16" />
          <path d="M24 14 V10 H20" data-stroke />
          <path data-stroke d="M24 26 L30 20" stroke="#fff" />
          <path d="M30 8 L36 4 L34 12 Z" />
        </>
      );
    case 'activity':
      return <path d="M8 30 L16 14 L24 26 L32 10 L40 30 Z" />;
    case 'lightbulb':
      return (
        <>
          <path d="M24 6 C16 6 10 14 10 22 C10 28 14 32 16 34 V38 H32 V34 C34 32 38 28 38 22 C38 14 32 6 24 6 Z" />
          <rect x="18" y="38" width="12" height="6" rx="2" />
        </>
      );
    default:
      return <circle cx="24" cy="24" r="16" />;
  }
}

export default function AdultTrainingIcon({ name, theme, className = '' }: AdultTrainingIconProps) {
  return (
    <div className={`adultTraining-icon adultTraining-icon--${theme}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" className="adultTraining-iconSvg">
        <IconGlyph name={name} />
      </svg>
    </div>
  );
}

const UNCLE_T_ACCENT_ICONS: Record<UncleTCoachingAccent, AdultTrainingIconName> = {
  'mistake-learn': 'file-x',
  'feel-seen': 'shield-check',
  'small-retry': 'rotate-ccw',
  'growth-focus': 'trending-up',
  dignity: 'shield',
  'shutdown-coach': 'pause-circle',
  'courage-try': 'footprints',
  'model-learning': 'brain',
  'confidence-doubt': 'alert-circle',
  'safe-participate': 'shield-check',
  'notice-progress': 'trending-up',
  'full-story': 'heart-handshake',
  'small-first-step': 'arrow-right-circle',
  'own-progress': 'sprout',
  'named-effort': 'badge-check',
  'growth-ending': 'sparkles',
};

const VICTORIA_REFLECTION_ICONS: Record<VictoriaReflectionAccent, AdultTrainingIconName> = {
  classroom: 'alert-circle',
  clipboard: 'clipboard-check',
  'thought-bubble': 'heart-pulse',
  'behavior-need': 'alert-circle',
  'support-strategy': 'heart-handshake',
  'calm-safe': 'heart-handshake',
  'gentle-correction': 'shield',
  'hurt-feelings': 'heart-pulse',
  'private-reconnect': 'shield',
  'frustration-skill': 'activity',
  'calm-connect-coach': 'waves',
  'sincere-repair': 'heart-handshake',
  'balanced-support': 'shield-check',
};

const VICTORIA_FOCUS_LAB_ICONS: Record<VictoriaFocusLabAccent, AdultTrainingIconName> = {
  'visual-checklist': 'clipboard-check',
  'break-it-down': 'list-checks',
  'work-timer': 'timer-reset',
  'organized-folders': 'clipboard-check',
  'quiet-workspace': 'headphones',
  'routine-chart': 'list-checks',
  'transition-countdown': 'timer-reset',
  'build-systems': 'activity',
};

export function UncleTScenarioIcon({ accent }: { accent?: UncleTCoachingAccent }) {
  const name = (accent && UNCLE_T_ACCENT_ICONS[accent]) || 'file-x';
  return <AdultTrainingIcon name={name} theme="uncle-t" className="uncleT-scenarioIllustration" />;
}

export function VictoriaReflectionIcon({ accent }: { accent?: VictoriaReflectionAccent }) {
  const name = (accent && VICTORIA_REFLECTION_ICONS[accent]) || 'heart-pulse';
  return <AdultTrainingIcon name={name} theme="victoria" className="victoria-reflectionGraphic" />;
}

export function VictoriaFocusLabIcon({ accent }: { accent?: VictoriaFocusLabAccent }) {
  const name = (accent && VICTORIA_FOCUS_LAB_ICONS[accent]) || 'clipboard-check';
  return <AdultTrainingIcon name={name} theme="victoria" className="victoria-focusLabGraphic" />;
}

