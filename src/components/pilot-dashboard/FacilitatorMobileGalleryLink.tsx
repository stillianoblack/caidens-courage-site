import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { programDashboardTabPath } from '../../lib/programDashboardNav';
import { useFacilitatorGalleryPendingCount } from '../../hooks/useGalleryNavCounts';

type FacilitatorMobileGalleryLinkProps = {
  programCode?: string;
};

/** Compact gallery link for mobile overview — routes to Student Gallery page. */
export default function FacilitatorMobileGalleryLink({ programCode }: FacilitatorMobileGalleryLinkProps) {
  const pendingCount = useFacilitatorGalleryPendingCount(programCode);
  const label = useMemo(
    () => (pendingCount > 0 ? `Student Gallery (${pendingCount} pending)` : 'Student Gallery'),
    [pendingCount],
  );

  return (
    <Link to={programDashboardTabPath('student-gallery')} className="facilitator-mobileGalleryLink">
      <span className="facilitator-mobileGalleryLinkLabel">{label}</span>
      <span className="facilitator-mobileGalleryLinkChevron" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
