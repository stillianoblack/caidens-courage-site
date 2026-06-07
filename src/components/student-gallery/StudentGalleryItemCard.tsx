import React from 'react';
import type { StudentGalleryItem } from '../../lib/studentGalleryService';
import StudentGalleryStatusPill from './StudentGalleryStatusPill';

type StudentGalleryItemCardProps = {
  item: StudentGalleryItem;
  showActions?: boolean;
  actionBusy?: boolean;
  reviewNote?: string;
  onReviewNoteChange?: (value: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  variant?: 'pilot' | 'family';
  onOpenLightbox?: () => void;
};

export default function StudentGalleryItemCard({
  item,
  showActions = false,
  actionBusy = false,
  reviewNote = '',
  onReviewNoteChange,
  onApprove,
  onReject,
  onRequestChanges,
  variant = 'pilot',
  onOpenLightbox,
}: StudentGalleryItemCardProps) {
  const itemClass = variant === 'family' ? 'family-galleryItem' : 'pilot-galleryItem';
  const imageWrapClass =
    variant === 'family' ? 'family-galleryItemImageWrap' : 'pilot-galleryItemImageWrap';
  const imageClass = variant === 'family' ? 'family-galleryItemImage' : 'pilot-galleryItemImage';
  const metaClass = variant === 'family' ? 'family-galleryItemMeta' : 'pilot-galleryItemMeta';
  const titleClass = variant === 'family' ? 'family-galleryItemTitle' : 'pilot-galleryItemTitle';
  const nicknameClass =
    variant === 'family' ? 'family-galleryItemNickname' : 'pilot-galleryItemNickname';

  return (
    <li className={itemClass}>
      <div className={imageWrapClass}>
        <button
          type="button"
          className={`${imageWrapClass}Btn`}
          onClick={onOpenLightbox}
          aria-label={`View larger image: ${item.title || item.student_nickname}`}
        >
          <img
            src={item.file_url}
            alt={item.title || `${item.student_nickname} artwork`}
            className={imageClass}
            loading="lazy"
          />
        </button>
      </div>
      <div className={metaClass}>
        <p className={titleClass}>{item.title || 'Untitled activity'}</p>
        <p className={nicknameClass}>{item.student_nickname || '—'}</p>
        {item.caption ? (
          <p className={variant === 'family' ? 'family-galleryItemCaption' : 'pilot-galleryItemCaption'}>
            {item.caption}
          </p>
        ) : null}
        {item.facilitator_note && variant === 'family' ? (
          <p className="family-galleryFacilitatorNote">
            <strong>Facilitator note:</strong> {item.facilitator_note}
          </p>
        ) : null}
        <StudentGalleryStatusPill status={item.status} variant={variant} />
        {showActions ? (
          <>
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
          </>
        ) : null}
      </div>
    </li>
  );
}
