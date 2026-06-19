import React from 'react';
import { KidPlayShellComingSoon } from './KidPlayShellNav';

type KidPlayShellComingSoonPanelProps = {
  moduleLabel: string;
};

export default function KidPlayShellComingSoonPanel({ moduleLabel }: KidPlayShellComingSoonPanelProps) {
  return <KidPlayShellComingSoon moduleLabel={moduleLabel} />;
}
