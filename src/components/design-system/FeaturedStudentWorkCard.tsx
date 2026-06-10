import React from 'react';
import StudentGalleryStatusPill from '../student-gallery/StudentGalleryStatusPill';
import type { StudentGalleryItem } from '../../lib/studentGalleryService';

type FeaturedStudentWorkCardProps = {
  item: StudentGalleryItem;
  className?: string;
};

/** Highlights one student artwork submission for gallery/overview promos. */
export default function FeaturedStudentWorkCard({ item, className = '' }: FeaturedStudentWorkCardProps) {
  return (
    <article className={`ds-featuredWork${className ? ` ${className}` : ''}`}>
      <div className="ds-featuredWorkMedia">
        <img
          src={item.file_url}
          alt={item.title || `${item.student_nickname} artwork`}
          decoding="async"
        />
      </div>
      <div className="ds-featuredWorkBody">
        <div className="ds-featuredWorkHead">
          <h3 className="ds-featuredWorkTitle">{item.title}</h3>
          <StudentGalleryStatusPill status={item.status} />
        </div>
        <p className="ds-featuredWorkMeta">
          {item.student_nickname} · {item.program_code}
        </p>
        {item.caption ? <p className="ds-featuredWorkCaption">{item.caption}</p> : null}
      </div>
    </article>
  );
}
