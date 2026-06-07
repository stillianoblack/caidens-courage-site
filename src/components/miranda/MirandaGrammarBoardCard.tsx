import React from 'react';
import type { MirandaClueCardData } from '../../types/gameAssessment';
import MirandaClueAccentIcon from './MirandaClueAccentIcon';

type MirandaGrammarBoardCardProps = Pick<MirandaClueCardData, 'label' | 'tag' | 'text'>;

function GrammarSentence({ text }: { text: string }) {
  const parts = text.split(/(_+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (/^_+$/.test(part)) {
          return (
            <span key={`blank-${index}`} className="miranda-grammarBlank" aria-label="blank">
              {part.replace(/_/g, '\u00a0')}
            </span>
          );
        }
        return <span key={`text-${index}`}>{part}</span>;
      })}
    </>
  );
}

export default function MirandaGrammarBoardCard({ label, tag, text }: MirandaGrammarBoardCardProps) {
  const hasBlank = text.includes('_');

  return (
    <article className="miranda-grammarBoard" aria-label={`${label}: ${tag}`}>
      <div className="miranda-grammarBoardPin" aria-hidden="true" />
      <div className="miranda-grammarBoardStrings" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="miranda-grammarBoardSurface">
        <span className="miranda-grammarBadge" aria-hidden="true">
          Grammar
        </span>
        <p className="miranda-clueLabel">{label}</p>
        <span className="miranda-clueTag miranda-clueTag--grammar">{tag}</span>
        <div className="miranda-grammarStrip">
          <span className="miranda-grammarStripPin" aria-hidden="true" />
          <p className="miranda-grammarStripText">
            &ldquo;{hasBlank ? <GrammarSentence text={text} /> : text}&rdquo;
          </p>
        </div>
        <span className="miranda-grammarBoardAccent" aria-hidden="true">
          <MirandaClueAccentIcon accent="pin" />
        </span>
      </div>
    </article>
  );
}
