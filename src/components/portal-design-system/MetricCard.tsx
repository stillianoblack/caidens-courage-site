import React from 'react';

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  helperText?: string;
  accent?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function MetricCard({
  label,
  value,
  helperText,
  accent = false,
  onClick,
  className = '',
}: MetricCardProps) {
  const Tag = onClick ? 'button' : 'article';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={[
        'ds-metricCard',
        accent ? 'ds-metricCard--accent' : '',
        onClick ? 'ds-metricCard--clickable' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <p className="ds-metricCardLabel">{label}</p>
      <p className="ds-metricCardValue">{value}</p>
      {helperText ? <p className="ds-metricCardHelper">{helperText}</p> : null}
    </Tag>
  );
}
