import React, { useState } from 'react';
import type { StudentGalleryItem } from '../../lib/studentGalleryService';
import StudentGalleryItemCard from './StudentGalleryItemCard';
import StudentGalleryLightbox from './StudentGalleryLightbox';

type StudentGalleryGridProps = {
  items: StudentGalleryItem[];
  emptyMessage: string;
  showActions?: boolean;
  actionBusyId?: string | null;
  reviewNote?: string;
  onReviewNoteChange?: (value: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  variant?: 'pilot' | 'family';
};

export default function StudentGalleryGrid({
  items,
  emptyMessage,
  showActions = false,
  actionBusyId = null,
  reviewNote = '',
  onReviewNoteChange,
  onApprove,
  onReject,
  onRequestChanges,
  variant = 'pilot',
}: StudentGalleryGridProps) {
  const [lightboxItem, setLightboxItem] = useState<StudentGalleryItem | null>(null);
  const gridClass = variant === 'family' ? 'family-galleryGrid' : 'pilot-galleryGrid';
  const emptyClass = variant === 'family' ? 'family-galleryEmpty' : 'pilot-galleryEmpty';

  if (items.length === 0) {
    return <p className={emptyClass}>{emptyMessage}</p>;
  }

  return (
    <>
      <ul className={gridClass}>
        {items.map((item) => (
          <StudentGalleryItemCard
            key={item.id}
            item={item}
            showActions={showActions}
            actionBusy={actionBusyId === item.id}
            reviewNote={reviewNote}
            onReviewNoteChange={onReviewNoteChange}
            onApprove={onApprove}
            onReject={onReject}
            onRequestChanges={onRequestChanges}
            variant={variant}
            onOpenLightbox={() => setLightboxItem(item)}
          />
        ))}
      </ul>

      {lightboxItem ? (
        <StudentGalleryLightbox
          item={lightboxItem}
          variant={variant}
          showActions={showActions}
          actionBusy={actionBusyId === lightboxItem.id}
          reviewNote={reviewNote}
          onReviewNoteChange={onReviewNoteChange}
          onApprove={onApprove}
          onReject={onReject}
          onRequestChanges={onRequestChanges}
          onClose={() => setLightboxItem(null)}
        />
      ) : null}
    </>
  );
}
