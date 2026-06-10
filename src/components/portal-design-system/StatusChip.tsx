import React from 'react';

export type StatusChipVariant =
  | 'active'
  | 'not-started'
  | 'in-progress'
  | 'baseline-complete'
  | 'certificate-ready'
  | 'pending-review'
  | 'approved'
  | 'rejected'
  | 'complete'
  | 'default';

type StatusChipProps = {
  label: string;
  variant?: StatusChipVariant;
  className?: string;
};

export default function StatusChip({
  label,
  variant = 'default',
  className = '',
}: StatusChipProps) {
  return (
    <span className={`ds-statusChip ds-statusChip--${variant}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
}
