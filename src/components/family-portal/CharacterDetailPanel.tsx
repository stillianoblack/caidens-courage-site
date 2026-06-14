import React from 'react';
import CharacterProfilePanel from '../../design-system/components/CharacterProfilePanel';
import type { CharacterProfilePanelProps } from '../../design-system/components/CharacterProfilePanel';

type CharacterDetailPanelProps = CharacterProfilePanelProps & {
  /** @deprecated Layout is chosen automatically (drawer vs sheet) */
  variant?: 'inspector' | 'sheet';
};

/** @deprecated Use CharacterProfilePanel from the design system */
export default function CharacterDetailPanel({ variant: _variant, ...props }: CharacterDetailPanelProps) {
  return <CharacterProfilePanel {...props} />;
}
