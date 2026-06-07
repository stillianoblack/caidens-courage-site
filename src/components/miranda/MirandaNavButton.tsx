import React from 'react';
import { Link } from 'react-router-dom';

type MirandaNavButtonProps = {
  to: string;
  label: string;
  variant?: 'hub-return' | 'hub-return-outline' | 'next-case';
  onClick?: () => void;
  className?: string;
};

export default function MirandaNavButton({
  to,
  label,
  variant = 'hub-return',
  onClick,
  className = '',
}: MirandaNavButtonProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={['miranda-navBtn', `miranda-navBtn--${variant}`, className].filter(Boolean).join(' ')}
    >
      <span className="miranda-navBtnLabel">{label}</span>
    </Link>
  );
}
