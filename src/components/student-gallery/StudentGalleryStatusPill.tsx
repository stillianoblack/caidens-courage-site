import React from 'react';
import { getGalleryStatusLabel, normalizeGalleryStatus } from '../../lib/studentGalleryService';

type StudentGalleryStatusPillProps = {
  status: string | null | undefined;
  variant?: 'pilot' | 'family';
};

export default function StudentGalleryStatusPill({
  status,
  variant = 'pilot',
}: StudentGalleryStatusPillProps) {
  const normalized = normalizeGalleryStatus(status);
  const prefix = variant === 'family' ? 'family-galleryStatus' : 'pilot-galleryStatus';

  return (
    <span className={`${prefix} ${prefix}--${normalized}`}>{getGalleryStatusLabel(status)}</span>
  );
}
