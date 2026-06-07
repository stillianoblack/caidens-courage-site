import React from 'react';
import type { B4GuideResult } from '../../data/b4GuideContent';
import B4Dialogue from './B4Dialogue';

type ResultCardProps = {
  result: B4GuideResult;
  onStartWeek1: () => void;
  onBack: () => void;
};

export default function ResultCard({ result, onStartWeek1, onBack }: ResultCardProps) {
  return (
    <div className="b4g-card">
      <p className="b4g-result-type">Your focus style</p>
      <h2 className="b4g-result-heading">You are a {result.title}</h2>
      <B4Dialogue message={result.b4Message} />
      <div>
        <p className="b4g-step-label">Recommended moves</p>
        <ul className="b4g-moves-list">
          {result.recommendedMoves.map((move) => (
            <li key={move}>{move}</li>
          ))}
        </ul>
      </div>
      <div className="b4g-actions b4g-actions--row">
        <button type="button" className="b4g-primary-btn" onClick={onStartWeek1}>
          Start Week 1 Module
        </button>
        <button type="button" className="b4g-secondary-btn" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}
