import React from 'react';
import type { GameAnswerValue, GameQuestion } from '../../types/gameAssessment';
import {
  isChoiceQuestion,
  isSequenceQuestion,
  isTrueFalseQuestion,
} from '../../types/gameAssessment';
import AnswerChoiceList from '../../design-system/game/AnswerChoiceList';

type GameQuestionRendererProps = {
  question: GameQuestion;
  answer: GameAnswerValue;
  checked: boolean;
  onPlaySelect?: () => void;
  onSelectChoice: (id: string) => void;
  onSelectTrueFalse: (value: boolean) => void;
  onSequenceTap: (id: string) => void;
  onSequenceClear: () => void;
};

function choiceUsesCards(type: GameQuestion['type']): boolean {
  return type !== 'true_false' && type !== 'sequence_order';
}

export default function GameQuestionRenderer({
  question,
  answer,
  checked,
  onPlaySelect,
  onSelectChoice,
  onSelectTrueFalse,
  onSequenceTap,
  onSequenceClear,
}: GameQuestionRendererProps) {
  const playSelect = () => {
    onPlaySelect?.();
  };

  if (isSequenceQuestion(question)) {
    const order = Array.isArray(answer) ? answer : [];
    const remaining = question.items.filter((item) => !order.includes(item.id));

    return (
      <div className="game-seq">
        <ol className="game-seqOrder" aria-label="Your order">
          {order.map((id, index) => {
            const item = question.items.find((entry) => entry.id === id);
            if (!item) return null;
            return (
              <li key={id} className="game-seqOrderItem">
                <span className="game-seqNum">{index + 1}</span>
                {item.label}
              </li>
            );
          })}
          {order.length === 0 ? (
            <li className="game-seqOrderEmpty">Your order will appear here.</li>
          ) : null}
        </ol>
        {order.length > 0 ? (
          <button
            type="button"
            className="game-seqClear"
            onClick={() => {
              playSelect();
              onSequenceClear();
            }}
          >
            Clear order
          </button>
        ) : null}
        <div className="bbc-answers" role="group" aria-labelledby="game-question">
          {remaining.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={checked}
              className="bbc-answerCard"
              onClick={() => {
                playSelect();
                onSequenceTap(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isTrueFalseQuestion(question)) {
    const selected = typeof answer === 'boolean' ? answer : null;
    return (
      <div className="bbc-answers bbc-answers--inline" role="group" aria-labelledby="game-question">
        {[true, false].map((value) => {
          const label = value ? 'True' : 'False';
          const isSelected = selected === value;
          const isCorrect = checked && value === question.correctAnswer;
          const isWrong = checked && isSelected && value !== question.correctAnswer;
          return (
            <button
              key={label}
              type="button"
              disabled={checked}
              className={[
                'bbc-answerCard',
                isSelected && !checked ? 'bbc-answerCard--selected' : '',
                isCorrect ? 'bbc-answerCard--correct' : '',
                isWrong ? 'bbc-answerCard--wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                playSelect();
                onSelectTrueFalse(value);
              }}
              aria-pressed={isSelected}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  if (isChoiceQuestion(question) && choiceUsesCards(question.type)) {
    const selectedId = typeof answer === 'string' ? answer : null;
    const showLetterPrefix = question.type === 'missing_letter' || question.type === 'context_clue';

    return (
      <AnswerChoiceList
        className="bbc-answers"
        options={question.options}
        selectedId={selectedId}
        correctId={question.correctId}
        checked={checked}
        showLetterPrefix={showLetterPrefix}
        onSelect={(id) => {
          playSelect();
          onSelectChoice(id);
        }}
      />
    );
  }

  return (
    <p className="game-unknownType" role="note">
      This question type is not supported yet. Please skip or try again later.
    </p>
  );
}
