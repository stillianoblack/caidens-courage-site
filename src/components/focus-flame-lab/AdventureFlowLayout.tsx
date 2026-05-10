import React from 'react';

export type AdventureFlowLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AdventureFlowLayout({ children, className }: AdventureFlowLayoutProps) {
  return <div className={['ffl-screen', 'ffl-grid', className].filter(Boolean).join(' ')}>{children}</div>;
}

