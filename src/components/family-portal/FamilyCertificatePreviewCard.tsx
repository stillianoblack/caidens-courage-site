import React from 'react';
import { Link } from 'react-router-dom';

type FamilyCertificatePreviewCardProps = {
  count: number;
  certificatesPath: string;
  className?: string;
};

export default function FamilyCertificatePreviewCard({
  count,
  certificatesPath,
  className = '',
}: FamilyCertificatePreviewCardProps) {
  return (
    <section className={`family-certPreviewCard${className ? ` ${className}` : ''}`}>
      {count > 0 ? (
        <>
          <p className="family-certPreviewLabel">Certificates Earned</p>
          <p className="family-certPreviewValue">{count}</p>
          <Link to={certificatesPath} className="family-certPreviewCta">
            View Certificates
          </Link>
        </>
      ) : (
        <>
          <p className="family-certPreviewEmpty">Complete activities to unlock certificates.</p>
          <Link to={certificatesPath} className="family-certPreviewCta family-certPreviewCta--ghost">
            View Certificates
          </Link>
        </>
      )}
    </section>
  );
}
