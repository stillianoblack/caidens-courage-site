import React, { useEffect } from 'react';
import type { StudentGalleryItem } from '../../lib/studentGalleryService';
import StudentGalleryStatusPill from './StudentGalleryStatusPill';
import './student-gallery-lightbox.css';

type StudentGalleryLightboxProps = {
  item: StudentGalleryItem;
  variant: 'pilot' | 'family';
  showActions?: boolean;
  actionBusy?: boolean;
  reviewNote?: string;
  onReviewNoteChange?: (value: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  onClose: () => void;
};

export default function StudentGalleryLightbox({
  item,
  variant,
  showActions = false,
  actionBusy = false,
  reviewNote = '',
  onReviewNoteChange,
  onApprove,
  onReject,
  onRequestChanges,
  onClose,
}: StudentGalleryLightboxProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="sg-lightboxBackdrop" role="presentation" onClick={onClose}>
      <div
        className="sg-lightboxDialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${item.student_nickname} — ${item.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="sg-lightboxClose" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="sg-lightboxImageWrap">
          <img
            src={item.file_url}
            alt={item.title || `${item.student_nickname} artwork`}
            className="sg-lightboxImage"
          />
        </div>

        <div className="sg-lightboxMeta">
          <p className="sg-lightboxNickname">{item.student_nickname || '—'}</p>
          <p className="sg-lightboxTitle">{item.title || 'Untitled activity'}</p>
          {item.caption ? <p className="sg-lightboxCaption">{item.caption}</p> : null}
          {item.facilitator_note && variant === 'family' ? (
            <p className="sg-lightboxFacilitatorNote">
              <strong>Facilitator note:</strong> {item.facilitator_note}
            </p>
          ) : null}
          <StudentGalleryStatusPill status={item.status} variant={variant} />

          {showActions ? (
            <div className="sg-lightboxReview">
              <label className="pilot-galleryReviewNoteField">
                <span className="pilot-galleryLabel">Optional note to family</span>
                <textarea
                  className="pilot-galleryReviewNoteInput"
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => onReviewNoteChange?.(e.target.value)}
                  placeholder="Share feedback when requesting changes or rejecting."
                  maxLength={280}
                />
              </label>
              <div className="pilot-galleryReviewActions">
                <button
                  type="button"
                  className="pilot-galleryReviewBtn pilot-galleryReviewBtn--approve"
                  disabled={actionBusy}
                  onClick={() => onApprove?.(item.id)}
                >
                  {actionBusy ? 'Saving…' : 'Approve'}
                </button>
                <button
                  type="button"
                  className="pilot-galleryReviewBtn pilot-galleryReviewBtn--changes"
                  disabled={actionBusy}
                  onClick={() => onRequestChanges?.(item.id)}
                >
                  {actionBusy ? 'Saving…' : 'Request Changes'}
                </button>
                <button
                  type="button"
                  className="pilot-galleryReviewBtn pilot-galleryReviewBtn--reject"
                  disabled={actionBusy}
                  onClick={() => onReject?.(item.id)}
                >
                  {actionBusy ? 'Saving…' : 'Reject'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
