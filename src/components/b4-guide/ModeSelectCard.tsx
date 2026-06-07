import React from 'react';

type ModeSelectCardProps = {
  title: string;
  description: string;
  cta: string;
  onSelect: () => void;
};

export default function ModeSelectCard({ title, description, cta, onSelect }: ModeSelectCardProps) {
  return (
    <article className="b4g-card">
      <h2 className="b4g-card-title">{title}</h2>
      <p className="b4g-card-desc">{description}</p>
      <div className="b4g-actions">
        <button type="button" className="b4g-primary-btn" onClick={onSelect}>
          {cta}
        </button>
      </div>
    </article>
  );
}
