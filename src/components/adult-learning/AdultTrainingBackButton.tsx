import React from 'react';
import GameBackButton from '../game-assessment/shared/GameBackButton';
import type { AdultGuideThemeId } from '../../types/adultTraining';

type AdultTrainingBackButtonProps = {
  to: string;
  label: string;
  theme?: AdultGuideThemeId;
  onClick?: () => void;
  /** inline = hub flow layout; floating = game landing overlay */
  variant?: 'inline' | 'floating';
};

function parseHubName(label: string): string {
  const trimmed = label.trim();
  const match = trimmed.match(/^←?\s*Back to\s+(.+)$/i);
  return match ? match[1].trim() : trimmed;
}

export default function AdultTrainingBackButton({
  to,
  label,
  theme = 'victoria',
  onClick,
  variant = 'inline',
}: AdultTrainingBackButtonProps) {
  return (
    <GameBackButton
      to={to}
      hubName={parseHubName(label)}
      theme={theme}
      onClick={onClick}
      variant={variant}
    />
  );
}
