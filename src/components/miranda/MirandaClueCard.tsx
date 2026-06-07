import React from 'react';
import type { GameQuestion, MirandaClueCardData } from '../../types/gameAssessment';
import { isContextClueQuestion } from '../../types/gameAssessment';
import MirandaCaseFileCard from './MirandaCaseFileCard';
import MirandaGrammarBoardCard from './MirandaGrammarBoardCard';
import MirandaMissingLetterCard, { extractClueWordFromText } from './MirandaMissingLetterCard';
import MirandaNotebookCard from './MirandaNotebookCard';
import MirandaTrailNotebookCard from './MirandaTrailNotebookCard';

type MirandaClueCardProps = {
  question: GameQuestion;
};

function resolveClueWord(clueCard: MirandaClueCardData, story?: string): string | undefined {
  if (clueCard.clueWord) return clueCard.clueWord;
  return extractClueWordFromText(clueCard.text) ?? (story ? extractClueWordFromText(story) : undefined);
}

export default function MirandaClueCard({ question }: MirandaClueCardProps) {
  if (isContextClueQuestion(question) && question.detectiveNote && question.vocabularyWord) {
    return (
      <MirandaNotebookCard
        detectiveNote={question.detectiveNote}
        vocabularyWord={question.vocabularyWord}
      />
    );
  }

  const clueCard = question.clueCard;
  if (!clueCard || clueCard.variant === 'focus_quest') return null;

  if (clueCard.variant === 'case_file') {
    return (
      <MirandaCaseFileCard
        label={clueCard.label}
        tag={clueCard.tag}
        text={clueCard.text}
        accent={clueCard.accent}
      />
    );
  }

  if (clueCard.variant === 'grammar_board') {
    return <MirandaGrammarBoardCard label={clueCard.label} tag={clueCard.tag} text={clueCard.text} />;
  }

  if (clueCard.variant === 'missing_letter') {
    return (
      <MirandaMissingLetterCard
        label={clueCard.label}
        tag={clueCard.tag}
        text={clueCard.text}
        clueWord={resolveClueWord(clueCard, question.story)}
      />
    );
  }

  if (clueCard.variant === 'trail_notebook') {
    return (
      <MirandaTrailNotebookCard
        label={clueCard.label}
        tag={clueCard.tag}
        text={clueCard.text}
        trailFocus={clueCard.trailFocus}
      />
    );
  }

  return null;
}

export function questionHasMirandaClueGraphic(question: GameQuestion): boolean {
  if (question.clueCard?.variant === 'focus_quest') return false;
  return Boolean(
    question.clueCard ||
      (isContextClueQuestion(question) && question.detectiveNote && question.vocabularyWord),
  );
}
