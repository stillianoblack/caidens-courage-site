import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

/**
 * Blue header lock-up for secondary pages (design library).
 * Matches Resources / B-4 Tools Library: navy background, H1, paragraph(s), optional CTA.
 */
export interface PageHeaderLockupProps {
  /** Main page title (H1) */
  title: string;
  /** Primary paragraph below the title */
  description?: string;
  /** Optional secondary line (smaller, muted) */
  subDescription?: string;
  /** Optional CTA: link or button */
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional id for the header block (e.g. for anchor or scroll) */
  id?: string;
}

export default function PageHeaderLockup({
  title,
  description,
  subDescription,
  cta,
  id,
}: PageHeaderLockupProps) {
  return (
    <div
      id={id}
      data-section="header"
      className="bg-navy-500 text-white py-16 pt-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mb-2">
            {description}
          </p>
        )}
        {subDescription && (
          <p className="text-sm sm:text-base text-white/80">
            {subDescription}
          </p>
        )}
        {cta && (cta.href || cta.onClick) && (
          <div className="mt-6">
            {cta.href ? (
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to={cta.href}
                className="!bg-white !text-navy-600 hover:!bg-white/90"
              >
                {cta.label}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={cta.onClick}
                className="!bg-white !text-navy-600 hover:!bg-white/90"
              >
                {cta.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
