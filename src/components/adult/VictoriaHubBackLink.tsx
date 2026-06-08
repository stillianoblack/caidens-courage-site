import React from 'react';
import AdultTrainingBackButton from '../adult-learning/AdultTrainingBackButton';

type VictoriaHubBackLinkProps = {
  to: string;
  label: string;
  onClick?: () => void;
  variant?: 'inline' | 'floating';
};

export default function VictoriaHubBackLink({
  to,
  label,
  onClick,
  variant = 'floating',
}: VictoriaHubBackLinkProps) {
  return (
    <AdultTrainingBackButton
      to={to}
      label={label}
      theme="victoria"
      onClick={onClick}
      variant={variant}
    />
  );
}
