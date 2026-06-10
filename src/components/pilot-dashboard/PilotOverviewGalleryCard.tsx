import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { programDashboardTabPath } from '../../lib/programDashboardNav';
import { readGalleryProgramSettingsLocal } from '../../lib/galleryProgramSettings';
import { useFacilitatorGalleryPendingCount } from '../../hooks/useGalleryNavCounts';
import {
  fetchFacilitatorApprovedGalleryItems,
} from '../../lib/studentGalleryService';

type PilotOverviewGalleryCardProps = {
  programCode?: string;
};

export default function PilotOverviewGalleryCard({ programCode }: PilotOverviewGalleryCardProps) {
  const pendingCount = useFacilitatorGalleryPendingCount(programCode);
  const [approvedCount, setApprovedCount] = useState(0);
  const settings = readGalleryProgramSettingsLocal(programCode ?? '');

  useEffect(() => {
    if (!programCode?.trim()) return;
    let cancelled = false;
    void fetchFacilitatorApprovedGalleryItems(programCode).then((items) => {
      if (!cancelled) setApprovedCount(items.length);
    });
    return () => {
      cancelled = true;
    };
  }, [programCode]);

  return (
    <Link to={programDashboardTabPath('student-gallery')} className="pilot-overviewMiniCard">
      <h3 className="pilot-overviewMiniCardTitle">Student Gallery</h3>
      <ul className="pilot-overviewMiniCardList">
        <li>{approvedCount} approved uploads</li>
        <li>{pendingCount} pending review</li>
        <li>
          Community sharing: {settings.communityGallerySharing ? 'On' : 'Off'}
        </li>
      </ul>
    </Link>
  );
}
