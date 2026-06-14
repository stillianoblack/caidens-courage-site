import React from 'react';
import { Link } from 'react-router-dom';
import type { SelectableChild } from '../../hooks/useActiveChild';

type ActiveChildSelectorProps = {
  children: SelectableChild[];
  activeParticipantId?: string;
  onSelect: (child: SelectableChild) => void;
  title?: string;
  helper?: string;
  addChildHref?: string;
};

export default function ActiveChildSelector({
  children,
  activeParticipantId = '',
  onSelect,
  title = 'Who is playing?',
  helper = 'Select your child before starting games or check-ins.',
  addChildHref,
}: ActiveChildSelectorProps) {
  if (children.length <= 1) return null;

  return (
    <section className="family-activeChildSelector" aria-labelledby="family-active-child-title">
      <div className="family-panelBlockHead">
        <h2 id="family-active-child-title" className="family-panelBlockTitle">
          {title}
        </h2>
        <p className="family-panelHelper">{helper}</p>
      </div>
      <div className="family-activeChildOptions">
        {children.map((child) => {
          const active = child.participantId === activeParticipantId;
          return (
            <button
              key={child.participantId}
              type="button"
              className={`family-activeChildBtn${active ? ' family-activeChildBtn--active' : ''}`}
              aria-pressed={active}
              onClick={() => onSelect(child)}
            >
              <span className="family-activeChildBtnName">{child.displayName}</span>
              {active ? <span className="family-activeChildBtnBadge">Active</span> : null}
            </button>
          );
        })}
        {addChildHref ? (
          <Link to={addChildHref} className="family-activeChildAddLink">
            Add Child
          </Link>
        ) : null}
      </div>
    </section>
  );
}
