import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StudentGalleryGrid from '../../student-gallery/StudentGalleryGrid';
import { MarketingShowcaseCard, useToast } from '../../portal-design-system';
import '../../portal-design-system/portal-design-system.css';
import { PILOT_STUDENT_GALLERY } from '../../../data/pilotDashboardContent';
import { trackEvent } from '../../../lib/analytics';
import { requestGalleryCountsRefresh } from '../../../lib/galleryNavCounts';
import { readGalleryProgramSettingsLocal } from '../../../lib/galleryProgramSettings';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import {
  fetchCommunityGalleryItems,
  fetchFacilitatorApprovedGalleryItems,
  fetchFacilitatorPendingGalleryItems,
  updateStudentGalleryItemReview,
  uploadStudentGalleryItem,
} from '../../../lib/studentGalleryService';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

type GalleryTabId = 'program' | 'pending-review' | 'community';

type PilotGalleryPanelProps = {
  programCode?: string;
  groupName?: string;
};

const GALLERY_TABS: Array<{ id: GalleryTabId; label: string }> = [
  { id: 'program', label: 'Program Gallery' },
  { id: 'pending-review', label: 'Pending Review' },
  { id: 'community', label: 'Community Gallery' },
];

function resolveGalleryTab(value: string | null): GalleryTabId {
  if (value === 'pending-review' || value === 'community') return value;
  return 'program';
}

export default function PilotGalleryPanel(props: PilotGalleryPanelProps = {}) {
  const { programCode: programCodeProp, groupName: groupNameProp } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveGalleryTab(searchParams.get('tab'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [pendingItems, setPendingItems] = useState<
    Awaited<ReturnType<typeof fetchFacilitatorPendingGalleryItems>>
  >([]);
  const [programItems, setProgramItems] = useState<
    Awaited<ReturnType<typeof fetchFacilitatorApprovedGalleryItems>>
  >([]);
  const [communityItems, setCommunityItems] = useState<
    Awaited<ReturnType<typeof fetchCommunityGalleryItems>>
  >([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewMessageTone, setReviewMessageTone] = useState<'success' | 'error'>('success');
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    trackEvent('gallery_viewed');
  }, []);

  const [title, setTitle] = useState('');
  const [studentNickname, setStudentNickname] = useState('');
  const [programCode, setProgramCode] = useState(
    programCodeProp?.trim() || readActivePilotProgram()?.programCode?.trim() || '',
  );
  const [groupName, setGroupName] = useState(groupNameProp?.trim() || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const gallerySettings = readGalleryProgramSettingsLocal(programCode);

  useEffect(() => {
    if (programCodeProp?.trim()) {
      setProgramCode(programCodeProp.trim());
    }
  }, [programCodeProp]);

  useEffect(() => {
    if (groupNameProp?.trim()) {
      setGroupName(groupNameProp.trim());
    }
  }, [groupNameProp]);

  const selectTab = useCallback(
    (tab: GalleryTabId) => {
      const nextParams = new URLSearchParams(searchParams);
      if (tab === 'program') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', tab);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const refreshGallery = useCallback(async () => {
    setLoading(true);
    const [pending, program, community] = await Promise.all([
      fetchFacilitatorPendingGalleryItems(programCodeProp),
      fetchFacilitatorApprovedGalleryItems(programCodeProp),
      fetchCommunityGalleryItems(),
    ]);
    setPendingItems(pending);
    setProgramItems(program);
    setCommunityItems(community);
    setLoading(false);
  }, [programCodeProp]);

  useEffect(() => {
    void refreshGallery();
  }, [refreshGallery]);

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

    setUploadState('idle');
    setUploadMessage(null);
    showToast("Artwork uploaded. I'll help you track the review.", 'success');
    setTitle('');
    setStudentNickname('');
    setGroupName('');
    setProgramCode(programCodeProp?.trim() || readActivePilotProgram()?.programCode?.trim() || '');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await refreshGallery();
    requestGalleryCountsRefresh();
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
    requestGalleryCountsRefresh();
  };

  const handleApprove = (id: string) =>
    runReview(id, 'approved', 'Submission approved and added to Program Gallery.');

  const handleReject = (id: string) =>
    runReview(id, 'rejected', 'Submission rejected. The family will see the update.');

  const handleRequestChanges = (id: string) =>
    runReview(
      id,
      'needs_changes',
      'Requested changes. The family will see Needs Changes with your note.',
    );

  const scrollToUpload = useCallback(() => {
    selectTab('program');
    window.setTimeout(() => {
      uploadFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [selectTab]);

  return (
    <div className="pilot-panel pilot-panel--gallery">
      <p className="pilot-panelIntro">{PILOT_STUDENT_GALLERY.description}</p>

      <MarketingShowcaseCard
        title="Celebrate Student Creativity"
        description="Share coloring pages, reflections, and student wins from your program. Approved work stays private to your program unless you choose to share it with the community gallery."
        imageSrc="/images/gallery/B-4_Coloredpage.webp"
        imageAlt="B-4 coloring page example"
        actions={[
          { label: 'Upload Student Work', onClick: scrollToUpload },
          { label: 'Learn About Community Gallery', onClick: () => selectTab('community'), variant: 'ghost' },
        ]}
      />

      <div className="pilot-galleryTabs" role="tablist" aria-label="Student gallery views">
        {GALLERY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`pilot-galleryTabBtn${activeTab === tab.id ? ' pilot-galleryTabBtn--active' : ''}`}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'pending-review' && pendingItems.length > 0 ? (
              <span className="pilot-galleryTabBadge">{pendingItems.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === 'program' ? (
        <form ref={uploadFormRef} className="pilot-galleryUploadCard" onSubmit={handleUpload}>
          <h3 className="pilot-dash-cardTitle">Upload Student Work</h3>
          <p className="pilot-dash-cardDesc">
            Facilitator uploads publish immediately to the Program Gallery for this camp only.
            Family and student submissions enter Pending Review until you approve, reject, or request
            changes.
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
                readOnly
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
              disabled={uploadState === 'uploading' || !gallerySettings.programGalleryEnabled}
            >
              {uploadState === 'uploading' ? 'Uploading...' : 'Upload to Program Gallery'}
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
      ) : null}

      {loading ? <p className="pilot-emptyNote">Loading gallery…</p> : null}

      {!loading && activeTab === 'pending-review' ? (
        <section className="pilot-galleryGridSection" aria-label="Pending submissions">
          <h3 className="pilot-panelBlockTitle">Pending Review</h3>
          <p className="pilot-panelBlockSub">
            Family and student uploads for this program appear here until you approve, reject, or
            request changes. Nothing is shared outside this program until approved.
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
      ) : null}

      {!loading && activeTab === 'program' ? (
        <section className="pilot-galleryGridSection" aria-label="Program gallery">
          <h3 className="pilot-panelBlockTitle">Program Gallery</h3>
          <p className="pilot-panelBlockSub">
            Approved work for this program only. Other camps and test programs are not shown here.
          </p>
          <StudentGalleryGrid
            items={programItems}
            emptyMessage="No approved artwork yet for this program. Upload work or approve pending submissions."
          />
        </section>
      ) : null}

      {!loading && activeTab === 'community' ? (
        <section className="pilot-galleryGridSection" aria-label="Community gallery">
          <h3 className="pilot-panelBlockTitle">Community Gallery</h3>
          <p className="pilot-panelBlockSub">
            {gallerySettings.communityGallerySharing
              ? 'Approved work explicitly shared to the broader Caiden\'s Courage community.'
              : 'Community sharing is off for this program. Enable it in Program Settings → Student Gallery to opt in.'}
          </p>
          <StudentGalleryGrid
            items={communityItems}
            emptyMessage="No community-shared artwork yet. Community items appear only when a program opts in and work is approved for community sharing."
          />
        </section>
      ) : null}
    </div>
  );
}
