import React from 'react';

type EmptyStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
};

type EmptyStateProps = {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  action?: EmptyStateAction;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  imageSrc,
  imageAlt = '',
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`ds-emptyState${className ? ` ${className}` : ''}`}>
      {imageSrc ? (
        <div className="ds-emptyStateMedia" aria-hidden="true">
          <img src={imageSrc} alt={imageAlt} decoding="async" />
        </div>
      ) : null}
      <h3 className="ds-emptyStateTitle">{title}</h3>
      {description ? <p className="ds-emptyStateDesc">{description}</p> : null}
      {action ? (
        action.href ? (
          <a href={action.href} className="ds-emptyStateBtn">
            {action.label}
          </a>
        ) : (
          <button type="button" className="ds-emptyStateBtn" onClick={action.onClick}>
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
