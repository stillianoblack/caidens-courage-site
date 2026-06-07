import React from 'react';
import type { VictoriaReflectionAccent } from '../../types/gameAssessment';

const ICONS: Record<VictoriaReflectionAccent, string> = {
  clipboard: '📋',
  classroom: '🏫',
  'thought-bubble': '💭',
  'behavior-need': '🔄',
  'support-strategy': '🤝',
};

type VictoriaReflectionGraphicProps = {
  accent?: VictoriaReflectionAccent;
};

export default function VictoriaReflectionGraphic({ accent = 'clipboard' }: VictoriaReflectionGraphicProps) {
  return (
    <div className={`victoria-reflectionGraphic victoria-reflectionGraphic--${accent}`} aria-hidden="true">
      <span className="victoria-reflectionGraphicIcon">{ICONS[accent]}</span>
    </div>
  );
}
