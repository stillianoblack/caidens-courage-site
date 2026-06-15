import React, { useCallback, useState } from 'react';

export type MobileDataAccordionDetail = {
  id: string;
  label: string;
  value: React.ReactNode;
};

export type MobileDataAccordionItemProps = {
  id: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  metric?: React.ReactNode;
  details?: MobileDataAccordionDetail[];
  actions?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
};

export function MobileDataAccordionItem({
  id,
  primary,
  secondary,
  metric,
  details = [],
  actions,
  defaultExpanded = false,
  className,
}: MobileDataAccordionItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => {
    setExpanded((value) => !value);
  }, []);

  const panelId = `mobile-data-accordion-${id}`;

  return (
    <article
      className={['mobileDataAccordionItem', expanded ? 'mobileDataAccordionItem--expanded' : '', className]
        .filter(Boolean)
        .join(' ')}
      role="listitem"
    >
      <button
        type="button"
        className="mobileDataAccordionTrigger"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className="mobileDataAccordionSummary">
          <span className="mobileDataAccordionSummaryText">
            <span className="mobileDataAccordionPrimary">{primary}</span>
            {secondary ? <span className="mobileDataAccordionSecondary">{secondary}</span> : null}
          </span>
          {metric ? <span className="mobileDataAccordionMetric">{metric}</span> : null}
          <MobileDataAccordionChevron expanded={expanded} />
        </span>
      </button>

      {expanded ? (
        <div id={panelId} className="mobileDataAccordionBody">
          {details.length > 0 ? (
            <dl className="mobileDataAccordionFields">
              {details.map((detail) => (
                <div key={detail.id} className="mobileDataAccordionField">
                  <dt className="mobileDataAccordionFieldLabel">{detail.label}</dt>
                  <dd className="mobileDataAccordionFieldValue">{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {actions ? <div className="mobileDataAccordionActions">{actions}</div> : null}
        </div>
      ) : null}
    </article>
  );
}

type MobileDataAccordionListProps = {
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
};

export function MobileDataAccordionList({
  className,
  children,
  'aria-label': ariaLabel = 'Data rows',
}: MobileDataAccordionListProps) {
  return (
    <div className={['mobileDataAccordionList', className].filter(Boolean).join(' ')} role="list" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

function MobileDataAccordionChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={[
        'mobileDataAccordionChevron',
        expanded ? 'mobileDataAccordionChevron--expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.2 6.26a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.06 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
