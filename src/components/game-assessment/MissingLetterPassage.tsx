import React from 'react';

type WordSegment =
  | { kind: 'char'; value: string }
  | { kind: 'blank'; count: number };

function parseMissingLetterWord(word: string): WordSegment[] {
  const segments: WordSegment[] = [];
  let index = 0;

  while (index < word.length) {
    if (word[index] === '_') {
      let count = 0;
      while (index < word.length && word[index] === '_') {
        count += 1;
        index += 1;
      }
      segments.push({ kind: 'blank', count });
    } else {
      segments.push({ kind: 'char', value: word[index] });
      index += 1;
    }
  }

  return segments;
}

type MissingLetterWordProps = {
  word: string;
  className?: string;
};

/** Renders words like l_brary as l____brary with baseline purple underlines. */
export function MissingLetterWord({ word, className = 'game-missingWord' }: MissingLetterWordProps) {
  const segments = parseMissingLetterWord(word);

  return (
    <span className={className} aria-label={word.replace(/_/g, ' blank ')}>
      {segments.map((segment, index) => {
        if (segment.kind === 'blank') {
          return (
            <span
              key={`blank-${index}`}
              className="game-missingBlank"
              style={{ ['--blank-count' as string]: segment.count }}
              aria-hidden="true"
            />
          );
        }
        return (
          <span key={`char-${index}`} className="game-missingChar">
            {segment.value}
          </span>
        );
      })}
    </span>
  );
}

type MissingLetterPassageProps = {
  text: string;
  className?: string;
};

/** Splits passage text and styles any token containing underscores as missing-letter blanks. */
export default function MissingLetterPassage({ text, className = '' }: MissingLetterPassageProps) {
  const parts = text.split(/(\s+)/);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return part;
        }
        if (part.includes('_')) {
          return <MissingLetterWord key={`word-${index}`} word={part} />;
        }
        return <span key={`text-${index}`}>{part}</span>;
      })}
    </p>
  );
}

/** True when story/passage should use missing-letter blank styling. */
export function passageUsesMissingBlanks(type: string, story?: string): boolean {
  if (!story || !story.includes('_')) return false;
  return type === 'missing_letter' || type === 'fill_blank' || type === 'grammar';
}
