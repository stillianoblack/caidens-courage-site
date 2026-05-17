import React, { useState } from 'react';
import StepMicroFeedback from './StepMicroFeedback';
import { FEELING_OPTIONS, type Feeling } from './focusFlameSelTypes';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';

export default function EmotionTapStep({
  markSrc,
  value,
  reduceMotion,
  onSelect,
  onNext,
  onNextClick,
  canProceed,
}: {
  markSrc: string;
  value: Feeling | null;
  reduceMotion: boolean;
  onSelect: (feeling: Feeling, isNew: boolean) => void;
  onNext: () => void;
  onNextClick: () => void;
  canProceed: boolean;
}) {
  const [pulseKey, setPulseKey] = useState(0);
  const [feedbackKey, setFeedbackKey] = useState(0);

  const handleSelect = (opt: Feeling) => {
    const isNew = value !== opt;
    onSelect(opt, isNew);
    if (isNew) {
      setPulseKey((k) => k + 1);
      setFeedbackKey((k) => k + 1);
    }
  };

  return (
    <div className="ffl-selStep ffl-emotionTapStep">
      <header className="ffl-questionHeader ffl-step-header">
        <div className="ffl-kicker">STEP 1 OF 3</div>
        <h2 className="ffl-h2">What feeling matches Caiden’s flame?</h2>
      </header>

      {/* TODO: /images/focus-flame/emotion-orbs/ */}
      <div className="ffl-emotionTap-stage">
        <div
          className={[
            'ffl-emotionTap-flameWrap',
            pulseKey > 0 && !reduceMotion ? 'ffl-emotionTap-flameWrap--pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          key={pulseKey}
        >
          <img className="ffl-emotionTap-flame" src={markSrc} alt="" decoding="async" />
        </div>

        <div className="ffl-emotionTap-options" role="group" aria-label="Emotion choices">
          {FEELING_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={['ffl-emotionTap-pill', value === opt ? 'ffl-emotionTap-pill--selected' : '']
                .filter(Boolean)
                .join(' ')}
              aria-label={`Select ${opt}`}
              aria-pressed={value === opt}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <StepMicroFeedback
        message={value ? 'Nice noticing.' : null}
        points={value ? FOCUS_POINT_AWARDS.feeling : null}
        triggerKey={feedbackKey}
      />

      <div className="ffl-stepActions">
        <button
          type="button"
          className="ffl-ctaPrimary ffl-ctaPrimary--small"
          onClick={() => {
            onNextClick();
            onNext();
          }}
          disabled={!canProceed}
        >
          Next
        </button>
      </div>
    </div>
  );
}
