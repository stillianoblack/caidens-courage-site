import React, { useId, useState } from 'react';
import './info-tooltip.css';

const CIRCLE_QUESTION_ICON_SRC = '/images/icons/circle-question-regular-full.svg';

export type InfoTooltipProps = {
  label: string;
  className?: string;
  /** When true, bubble anchors to the right edge (for section heading rows). */
  alignEnd?: boolean;
};

export default function InfoTooltip({ label, className = '', alignEnd = false }: InfoTooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className={[
        'infoTooltip',
        alignEnd ? 'infoTooltip--alignEnd' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="infoTooltipTrigger"
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
      >
        <img
          src={CIRCLE_QUESTION_ICON_SRC}
          alt=""
          width={20}
          height={20}
          className="infoTooltipIcon"
          aria-hidden="true"
          decoding="async"
        />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={['infoTooltipBubble', open ? 'infoTooltipBubble--open' : '']
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </span>
    </span>
  );
}
