import React from 'react';
import './character-dashboard.css';

export type QuestGridProps = {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

export default function QuestGrid({
  children,
  className = '',
  'aria-label': ariaLabel = 'Character quests',
}: QuestGridProps) {
  return (
    <div className={['char-questGrid', className].filter(Boolean).join(' ')} role="list" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
