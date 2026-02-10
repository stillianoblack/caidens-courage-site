import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export interface BluePageHeaderCta {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BluePageHeaderProps {
  /** Main H1 title */
  title: string;
  /** Primary paragraph below the title */
  description: string;
  /** Optional second line (e.g. "All resources are free...") */
  subtitle?: string;
  /** Optional CTA button */
  cta?: BluePageHeaderCta;
  /** Optional id for the header wrapper (e.g. for anchor or scroll) */
  id?: string;
}

/**
 * Blue header frame with H1, paragraph(s), and optional CTA.
 * Design library component — matches the B-4 Tools Library (Resources) page header.
 */
export default function BluePageHeader({
  title,
  description,
  subtitle,
  cta,
  id,
}: BluePageHeaderProps) {
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
        <p className="text-lg sm:text-xl text-white/90 max-w-3xl mb-2">
          {description}
        </p>
        {subtitle && (
          <p className="text-sm sm:text-base text-white/80">
            {subtitle}
          </p>
        )}
        {cta && (
          <div className="mt-6">
            {cta.href != null ? (
              <Link to={cta.href}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  {cta.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={cta.onClick}
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
