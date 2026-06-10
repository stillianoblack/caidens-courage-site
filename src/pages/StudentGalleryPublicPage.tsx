import React, { useEffect, useState } from 'react';
import CourageFooter from '../components/courage/CourageFooter';
import CourageHeader from '../components/courage/CourageHeader';
import SectionHero from '../components/courage/SectionHero';
import StudentGalleryGrid from '../components/student-gallery/StudentGalleryGrid';
import '../components/pilot-dashboard/pilot-dashboard.css';
import {
  fetchCommunityGalleryItems,
  type StudentGalleryItem,
} from '../lib/studentGalleryService';

export default function StudentGalleryPublicPage() {
  const [items, setItems] = useState<StudentGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Student Gallery | Caiden's Courage";
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchCommunityGalleryItems().then((next) => {
      if (!cancelled) {
        setItems(next);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <SectionHero
        eyebrow="STUDENT GALLERY"
        title="Community Student Gallery"
        description="Celebrating courage, creativity, and focus from programs that opted into community sharing."
      />

      <div className="cc-site-container mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="pilot-panel pilot-panel--gallery pilot-panel--galleryPublic">
          {loading ? <p className="pilot-emptyNote">Loading gallery…</p> : null}
          {!loading ? (
            <StudentGalleryGrid
              items={items}
              emptyMessage="Community-shared student artwork will appear here when programs opt in."
            />
          ) : null}
        </div>
      </div>

      <CourageFooter />
    </div>
  );
}
