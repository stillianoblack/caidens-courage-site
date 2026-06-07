import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentGalleryGrid from '../../student-gallery/StudentGalleryGrid';
import { PILOT_STUDENT_GALLERY } from '../../../data/pilotDashboardContent';
import {
  DEFAULT_GALLERY_PROGRAM_CODE,
  fetchStudentGalleryItems,
  normalizeGalleryStatus,
  updateStudentGalleryItemReview,
  uploadStudentGalleryItem,
} from '../../../lib/studentGalleryService';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function PilotGalleryPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchStudentGalleryItems>>>([]);
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewMessageTone, setReviewMessageTone] = useState<'success' | 'error'>('success');
  const [reviewNote, setReviewNote] = useState('');
  const [title, setTitle] = useState('');
  const [studentNickname, setStudentNickname] = useState('');
  const [groupName, setGroupName] = useState('');
  const [programCode, setProgramCode] = useState(DEFAULT_GALLERY_PROGRAM_CODE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const refreshGallery = useCallback(async () => {
    setLoading(true);
    const next = await fetchStudentGalleryItems();
    setItems(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshGallery();
  }, [refreshGallery]);

  const pendingItems = useMemo(
    () => items.filter((item) => normalizeGalleryStatus(item.status) === 'pending'),
    [items],
  );

  const approvedItems = useMemo(
    () => items.filter((item) => normalizeGalleryStatus(item.status) === 'approved'),
    [items],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadState('idle');
    setUploadMessage(null);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setUploadState('error');
      setUploadMessage('Please choose an image to upload.');
      return;
    }

    if (!title.trim() || !studentNickname.trim()) {
      setUploadState('error');
      setUploadMessage('Title and student nickname are required.');
      return;
    }

    setUploadState('uploading');
    setUploadMessage('Uploading...');

    const result = await uploadStudentGalleryItem({
      file: selectedFile,
      title,
      studentNickname,
      groupName,
      programCode,
      uploadSource: 'dashboard',
    });

    if (!result.success) {
      setUploadState('error');
      setUploadMessage(result.error ?? 'Upload failed. Check the console for details.');
      return;
    }

    setUploadState('success');
    setUploadMessage('Upload complete. Added to Approved Gallery.');
    setTitle('');
    setStudentNickname('');
    setGroupName('');
    setProgramCode(DEFAULT_GALLERY_PROGRAM_CODE);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await refreshGallery();
  };

  const runReview = async (
    id: string,
    status: 'approved' | 'rejected' | 'needs_changes',
    successMessage: string,
  ) => {
    setReviewMessage(null);
    setActionBusyId(id);
    const result = await updateStudentGalleryItemReview({
      id,
      status,
      facilitatorNote: reviewNote,
      reviewedBy: 'facilitator',
    });
    setActionBusyId(null);
    if (!result.success) {
      setReviewMessageTone('error');
      setReviewMessage(result.error ?? 'Review action failed. Check the browser console.');
      console.error('[student_gallery] review failed:', result.error);
      return;
    }
    setReviewMessageTone('success');
    setReviewMessage(successMessage);
    setReviewNote('');
    await refreshGallery();
  };

  const handleApprove = (id: string) =>
    runReview(id, 'approved', 'Submission approved and moved to Approved Gallery.');

  const handleReject = (id: string) =>
    runReview(id, 'rejected', 'Submission rejected. The family will see the update.');

  const handleRequestChanges = (id: string) =>
    runReview(
      id,
      'needs_changes',
      'Requested changes. The family will see Needs Changes with your note.',
    );

  return (
    <div className="pilot-panel pilot-panel--gallery">
      <h2 className="pilot-sectionTitle">{PILOT_STUDENT_GALLERY.title}</h2>
      <p className="pilot-panelIntro">{PILOT_STUDENT_GALLERY.description}</p>

      <form className="pilot-galleryUploadCard" onSubmit={handleUpload}>
        <h3 className="pilot-dash-cardTitle">Upload Student Work</h3>
        <p className="pilot-dash-cardDesc">
          Facilitator uploads publish immediately to the Approved Gallery. Family and student
          submissions enter Pending Review until you approve, reject, or request changes.
        </p>

        <div className="pilot-galleryFormGrid">
          <label className="pilot-galleryField">
            <span className="pilot-galleryLabel">Work title</span>
            <input
              type="text"
              className="pilot-galleryInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
            />
          </label>

          <label className="pilot-galleryField">
            <span className="pilot-galleryLabel">Student nickname</span>
            <input
              type="text"
              className="pilot-galleryInput"
              value={studentNickname}
              onChange={(e) => setStudentNickname(e.target.value)}
              maxLength={32}
              required
            />
          </label>

          <label className="pilot-galleryField">
            <span className="pilot-galleryLabel">Group or classroom</span>
            <input
              type="text"
              className="pilot-galleryInput"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={64}
            />
          </label>

          <label className="pilot-galleryField">
            <span className="pilot-galleryLabel">Program code</span>
            <input
              type="text"
              className="pilot-galleryInput"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value)}
              maxLength={48}
            />
          </label>
        </div>

        <label className="pilot-galleryField pilot-galleryField--file">
          <span className="pilot-galleryLabel">Image file</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="pilot-galleryFileInput"
            onChange={handleFileChange}
          />
          {selectedFile ? (
            <span className="pilot-galleryFileName">{selectedFile.name}</span>
          ) : null}
        </label>

        <div className="pilot-galleryUploadActions">
          <button
            type="submit"
            className="pilot-dash-cta"
            disabled={uploadState === 'uploading'}
          >
            {uploadState === 'uploading' ? 'Uploading...' : 'Upload to Gallery'}
          </button>
          <Link to={PILOT_STUDENT_GALLERY.href} className="pilot-gallerySecondaryLink">
            {PILOT_STUDENT_GALLERY.submitCta}
          </Link>
        </div>

        {uploadMessage ? (
          <p
            className={`pilot-galleryUploadStatus pilot-galleryUploadStatus--${uploadState}`}
            role="status"
          >
            {uploadMessage}
          </p>
        ) : null}
      </form>

      {loading ? <p className="pilot-emptyNote">Loading gallery…</p> : null}

      {!loading ? (
        <>
          <section className="pilot-galleryGridSection" aria-label="Pending submissions">
            <h3 className="pilot-panelBlockTitle">Gallery Approval — Pending Review</h3>
            <p className="pilot-panelBlockSub">
              Family and student uploads appear here until you approve, reject, or request changes.
              Nothing is published publicly until approved.
            </p>
            {reviewMessage ? (
              <p
                className={`pilot-galleryReviewFeedback pilot-galleryReviewFeedback--${reviewMessageTone}`}
                role="status"
              >
                {reviewMessage}
              </p>
            ) : null}
            <StudentGalleryGrid
              items={pendingItems}
              emptyMessage="No submissions waiting for review."
              showActions
              actionBusyId={actionBusyId}
              reviewNote={reviewNote}
              onReviewNoteChange={setReviewNote}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
            />
          </section>

          <section className="pilot-galleryGridSection" aria-label="Approved student gallery">
            <h3 className="pilot-panelBlockTitle">Approved Gallery</h3>
            <p className="pilot-panelBlockSub">
              Approved work is visible on the public student gallery and in the Family Portal.
            </p>
            <StudentGalleryGrid
              items={approvedItems}
              emptyMessage="No approved artwork yet. Upload work or approve pending submissions."
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
