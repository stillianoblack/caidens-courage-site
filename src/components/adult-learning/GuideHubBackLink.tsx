import React from 'react';
import type { AdultGuideThemeId } from '../../types/adultTraining';
import AdultTrainingBackButton from './AdultTrainingBackButton';

type GuideHubBackLinkProps = {
  to: string;
  label: string;
  theme?: AdultGuideThemeId;
  onClick?: () => void;
  variant?: 'inline' | 'floating';
};

/** @deprecated Use AdultTrainingBackButton */
export default function GuideHubBackLink({
  to,
  label,
  theme = 'victoria',
  onClick,
  variant = 'inline',
}: GuideHubBackLinkProps) {
  return (
    <AdultTrainingBackButton to={to} label={label} theme={theme} onClick={onClick} variant={variant} />
  );
}
