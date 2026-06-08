import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StudentGalleryGrid from '../../student-gallery/StudentGalleryGrid';
import { resolveActiveProgramContext } from '../../../config/activePilotProgram';
import { getFamilyGallerySubmitterKey } from '../../../lib/familyGallerySession';
import {
  DEFAULT_GALLERY_PROGRAM_CODE,
  fetchApprovedStudentGalleryItems,
  fetchFamilyGallerySubmissions,
  isAllowedGalleryImageType,
  normalizeGalleryStatus,
  uploadStudentGalleryItem,
} from '../../../lib/studentGalleryService';
import { trackEvent } from '../../../lib/analytics';
import { markGalleryViewed, requestGalleryCountsRefresh } from '../../../lib/galleryNavCounts';
import './family-gallery.css';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function FamilyGalleryPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitterKey = useMemo(() => getFamilyGallerySubmitterKey(), []);
  const programContext = useMemo(() => resolveActiveProgramContext(), []);
  const programCode = programContext?.programCode ?? DEFAULT_GALLERY_PROGRAM_CODE;
  const groupName = programContext?.groupName ?? '';

  const [studentName, setStudentName] = useState('');
  const [activityName, setActivityName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [mySubmissions, setMySubmissions] = useState<
    Awaited<ReturnType<typeof fetchFamilyGallerySubmissions>>
  >([]);
  const [approvedItems, setApprovedItems] = useState<
    Awaited<ReturnType<typeof fetchApprovedStudentGalleryItems>>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('gallery_viewed');
    markGalleryViewed(programCode);
  }, [programCode]);

  const refreshGallery = useCallback(async () => {
    setLoading(true);
    const [mine, approved] = await Promise.all([
      fetchFamilyGallerySubmissions(submitterKey),
      fetchApprovedStudentGalleryItems(),
    ]);
    setMySubmissions(mine);
    setApprovedItems(approved);
    setLoading(false);
  }, [submitterKey]);

  useEffect(() => {
    void refreshGallery();
  }, [refreshGallery]);

  const visibleSubmissions = useMemo(
    () =>
      mySubmissions.filter((item) => {
        const status = normalizeGalleryStatus(item.status);
        return status !== 'rejected';
      }),
    [mySubmissions],
  );

  const rejectedCount = useMemo(
    () => mySubmissions.filter((item) => normalizeGalleryStatus(item.status) === 'rejected').length,
    [mySubmissions],
  );

  const applyFile = (file: File | null) => {
    if (!file) return;
    if (!isAllowedGalleryImageType(file)) {
      setUploadState('error');
      setUploadMessage('Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    setSelectedFile(file);
    setUploadState('idle');
    setUploadMessage(null);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    applyFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setUploadState('error');
      setUploadMessage('Please choose an image to upload.');
      return;
    }

    if (!studentName.trim() || !activityName.trim()) {
      setUploadState('error');
      setUploadMessage('Student name and activity name are required.');
      return;
    }

    setUploadState('uploading');
    setUploadMessage('Uploading…');

    const result = await uploadStudentGalleryItem({
      file: selectedFile,
      title: activityName,
      studentNickname: studentName,
      caption,
      programCode,
      groupName,
      uploadSource: 'family',
      submitterKey,
    });

    if (!result.success) {
      setUploadState('error');
      setUploadMessage(result.error ?? 'Upload failed. Please try again.');
      return;
    }

    setUploadState('success');
    setUploadMessage('Submitted! Your upload is waiting for facilitator approval.');
    setStudentName('');
    setActivityName('');
    setCaption('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await refreshGallery();
    requestGalleryCountsRefresh();
  };

  return (
    <div className="family-panel family-panel--gallery">
      <header className="family-galleryHeader">
        <h2 className="family-panelBlockTitle">Family Gallery</h2>
        <p className="family-gallerySubtitle">
          Upload student artwork, coloring pages, or activity photos for facilitator review.
        </p>
      </header>

      <form className="family-galleryUploadCard" onSubmit={handleSubmit}>
        <h3 className="family-galleryUploadTitle">Share Student Work</h3>
        <p className="family-galleryUploadDesc">
          Upload a photo of artwork, coloring pages, or completed activities. A facilitator will
          review it before it appears in the gallery.
        </p>

        <p className="family-gallerySafetyNote" role="note">
          Please do not upload sensitive personal information (full names, addresses, or contact
          details). Use a first name or nickname only.
        </p>

        <div className="family-galleryFormGrid">
          <label className="family-galleryField">
            <span className="family-galleryLabel">Student first name or nickname</span>
            <input
              type="text"
              className="family-galleryInput"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              maxLength={32}
              placeholder="Alex"
              required
            />
          </label>

          <label className="family-galleryField">
            <span className="family-galleryLabel">Activity name</span>
            <input
              type="text"
              className="family-galleryInput"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              maxLength={80}
              placeholder="Focus Flame coloring page"
              required
            />
          </label>
        </div>

        <label className="family-galleryField">
          <span className="family-galleryLabel">Optional caption</span>
          <textarea
            className="family-galleryTextarea"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="Tell us a little about this work."
          />
        </label>

        <div
          className={`family-galleryDropzone${dragOver ? ' family-galleryDropzone--active' : ''}${selectedFile ? ' family-galleryDropzone--hasFile' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="family-galleryFileInput"
            onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
          />
          <p className="family-galleryDropzoneTitle">
            {selectedFile ? selectedFile.name : 'Drop an image here or tap to browse'}
          </p>
          <p className="family-galleryDropzoneHint">JPG, PNG, or WEBP</p>
        </div>

        <p className="family-galleryReviewNote">
          Uploads are reviewed before they appear in the gallery.
        </p>

        <button
          type="submit"
          className="family-gallerySubmitBtn"
          disabled={uploadState === 'uploading'}
        >
          {uploadState === 'uploading' ? 'Submitting…' : 'Submit for Review'}
        </button>

        {uploadMessage ? (
          <p
            className={`family-galleryUploadStatus family-galleryUploadStatus--${uploadState}`}
            role="status"
          >
            {uploadMessage}
          </p>
        ) : null}
      </form>

      {loading ? <p className="family-emptyNote">Loading gallery…</p> : null}

      {!loading ? (
        <>
          <section className="family-gallerySection" aria-label="Your uploads">
            <h3 className="family-gallerySectionTitle">Your Uploads</h3>
            {rejectedCount > 0 ? (
              <p className="family-galleryRejectedNote">
                {rejectedCount} submission{rejectedCount === 1 ? '' : 's'} were not approved. Check
                facilitator notes on items marked Needs Changes.
              </p>
            ) : null}
            <StudentGalleryGrid
              items={visibleSubmissions}
              emptyMessage="No uploads yet. Share student work above!"
              variant="family"
            />
          </section>

          <section className="family-gallerySection" aria-label="Approved community gallery">
            <h3 className="family-gallerySectionTitle">Approved Gallery</h3>
            <p className="family-gallerySectionDesc">
              Artwork approved by facilitators appears here for everyone to celebrate.
            </p>
            <StudentGalleryGrid
              items={approvedItems}
              emptyMessage="No approved artwork yet. Check back after facilitator review."
              variant="family"
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
