import React from 'react';
import './character-select.css';

type CharacterSelectLayoutProps = {
  roster: React.ReactNode;
  profile: React.ReactNode;
  stats: React.ReactNode;
  className?: string;
};

/** Three-column character select shell — roster | featured profile | stats. Not wired to routes yet. */
export default function CharacterSelectLayout({
  roster,
  profile,
  stats,
  className,
}: CharacterSelectLayoutProps) {
  return (
    <div
      className={['kidPlayCharacterSelectLayout', className].filter(Boolean).join(' ')}
      data-character-select-layout
    >
      <aside className="kidPlayCharacterSelectLayoutRoster" aria-label="Character roster">
        {roster}
      </aside>
      <section className="kidPlayCharacterSelectLayoutProfile" aria-label="Featured character">
        {profile}
      </section>
      <aside className="kidPlayCharacterSelectLayoutStats" aria-label="Character progress">
        {stats}
      </aside>
    </div>
  );
}
