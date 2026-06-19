import React from 'react';
import './kid-play-shell.css';

type KidPlayShellPageProps = {
  children: React.ReactNode;
  className?: string;
};

/** Shared max-width, gutters, and bottom-nav clearance for kid play shell pages. */
export default function KidPlayShellPage({ children, className }: KidPlayShellPageProps) {
  return (
    <div className={['kidPlayShellPage', className].filter(Boolean).join(' ')}>{children}</div>
  );
}
