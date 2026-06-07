import React from 'react';

type DetectiveNotebookCardProps = {
  detectiveNote: string;
  vocabularyWord: string;
};

function MagnifierAccent() {
  return (
    <svg
      className="detective-notebookMagnifierSvg"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="8.5" stroke="currentColor" strokeWidth="2.25" />
      <path d="M20.5 20.5 28 28" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" />
    </svg>
  );
}

function highlightWordInNote(note: string, word: string): React.ReactNode {
  const lowerNote = note.toLowerCase();
  const lowerWord = word.toLowerCase();
  const index = lowerNote.indexOf(lowerWord);

  if (index === -1) {
    return note;
  }

  const before = note.slice(0, index);
  const match = note.slice(index, index + word.length);
  const after = note.slice(index + word.length);

  return (
    <>
      {before}
      <span className="detective-notebookInlineHighlight">
        <MagnifierAccent />
        <mark className="detective-notebookWord">{match}</mark>
      </span>
      {after}
    </>
  );
}

export default function DetectiveNotebookCard({
  detectiveNote,
  vocabularyWord,
}: DetectiveNotebookCardProps) {
  return (
    <article className="detective-notebook" aria-label="Detective notebook clue">
      <div className="detective-notebookSpine" aria-hidden="true" />
      <div className="detective-notebookPage">
        <span className="detective-notebookSticky" aria-hidden="true">
          CLUE
        </span>
        <span className="detective-notebookClueTag" aria-hidden="true">
          Evidence
        </span>

        <p className="detective-notebookLabel">Detective Note</p>
        <p className="detective-notebookText">
          &ldquo;{highlightWordInNote(detectiveNote, vocabularyWord)}&rdquo;
        </p>

        <div className="detective-notebookVocab">
          <span className="detective-notebookVocabLabel">Vocabulary Word</span>
          <span className="detective-notebookVocabWord">
            <MagnifierAccent />
            <span>{vocabularyWord}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
