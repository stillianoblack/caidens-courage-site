import React from 'react';
import type { MirandaClueCardData } from '../../types/gameAssessment';
import { MissingLetterWord } from '../game-assessment/MissingLetterPassage';
import MirandaClueAccentIcon from './MirandaClueAccentIcon';

type MirandaMissingLetterCardProps = Pick<MirandaClueCardData, 'label' | 'tag' | 'text' | 'clueWord'>;

function renderSentenceWithWord(sentence: string, clueWord: string) {
  const index = sentence.indexOf(clueWord);
  if (index === -1) {
    return sentence;
  }

  const before = sentence.slice(0, index);
  const after = sentence.slice(index + clueWord.length);

  return (
    <>
      {before}
      <MissingLetterWord word={clueWord} className="miranda-missingInlineWord" />
      {after}
    </>
  );
}

export default function MirandaMissingLetterCard({
  label,
  tag,
  text,
  clueWord = '',
}: MirandaMissingLetterCardProps) {
  return (
    <article className="miranda-missingLetterCard" aria-label={`${label}: ${tag}`}>
      <div className="miranda-missingLetterPage">
        <span className="miranda-missingLetterAccent" aria-hidden="true">
          <MirandaClueAccentIcon accent="magnifier" />
        </span>
        <p className="miranda-clueLabel">{label}</p>
        <span className="miranda-clueTag miranda-clueTag--letters">{tag}</span>
        <p className="miranda-missingLetterSentence">
          {clueWord ? renderSentenceWithWord(text, clueWord) : text}
        </p>
        {clueWord ? (
          <div className="miranda-missingLetterWordHero">
            <span className="miranda-missingLetterWordLabel">Restore the word</span>
            <MissingLetterWord word={clueWord} className="miranda-missingLetterWordLarge" />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function extractClueWordFromText(text: string): string | undefined {
  const match = text.match(/\b[\w]*_[\w]*\b/);
  return match?.[0];
}
