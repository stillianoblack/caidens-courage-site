import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StudentGalleryGrid from '../../student-gallery/StudentGalleryGrid';
import { MarketingShowcaseCard } from '../../portal-design-system';
import { CHARACTER_IMAGE_PATHS } from '../../../data/familyPortalContent';
import { readActivePilotProgram, resolveActiveProgramContext } from '../../../config/activePilotProgram';
import { getFamilyGallerySubmitterKey } from '../../../lib/familyGallerySession';
import {
  fetchGalleryProgramSettings,
  readGalleryProgramSettingsLocal,
  type GalleryProgramSettings,
} from '../../../lib/galleryProgramSettings';
import {
  fetchCommunityGalleryItems,
  fetchProgramGalleryItems,
  fetchFamilyGallerySubmissions,
  isAllowedGalleryImageType,
  normalizeGalleryStatus,
  uploadStudentGalleryItem,
} from '../../../lib/studentGalleryService';
import { trackEvent } from '../../../lib/analytics';
import { useToast } from '../../portal-design-system/ToastProvider';
import { markGalleryViewed, requestGalleryCountsRefresh } from '../../../lib/galleryNavCounts';
import '../../portal-design-system/portal-design-system.css';
import './family-gallery.css';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

type FamilyGalleryTabId = 'my-submissions' | 'pending-review' | 'program-gallery' | 'community-gallery';

const BASE_TABS: Array<{ id: FamilyGalleryTabId; label: string }> = [
  { id: 'my-submissions', label: "My Child's Submissions" },
  { id: 'pending-review', label: 'Pending Review' },
  { id: 'program-gallery', label: 'Program Gallery' },
];

function resolveFamilyGalleryTab(value: string | null): FamilyGalleryTabId {
  if (
    value === 'pending-review' ||
    value === 'program-gallery' ||
    value === 'community-gallery' ||
    value === 'my-submissions'
  ) {
    return value;
  }
  return 'my-submissions';
}

export default function FamilyGalleryPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveFamilyGalleryTab(searchParams.get('tab'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const submitterKey = useMemo(() => getFamilyGallerySubmitterKey(), []);
  const programContext = useMemo(() => resolveActiveProgramContext(), []);
  const programCode = readActivePilotProgram()?.programCode ?? programContext?.programCode ?? '';
  const groupName = programContext?.groupName ?? '';

  const [studentName, setStudentName] = useState('');
  const [activityName, setActivityName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { showToast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [mySubmissions, setMySubmissions] = useState<
    Awaited<ReturnType<typeof fetchFamilyGallerySubmissions>>
  >([]);
  const [approvedItems, setApprovedItems] = useState<
    Awaited<ReturnType<typeof fetchProgramGalleryItems>>
  >([]);
  const [communityItems, setCommunityItems] = useState<
    Awaited<ReturnType<typeof fetchCommunityGalleryItems>>
  >([]);
  const [gallerySettings, setGallerySettings] = useState<GalleryProgramSettings>(() =>
    readGalleryProgramSettingsLocal(programCode),
  );
  const [loading, setLoading] = useState(true);

  const tabs = useMemo(() => {
    if (gallerySettings.communityGallerySharing) {
      return [...BASE_TABS, { id: 'community-gallery' as const, label: 'Community Gallery' }];
    }
    return BASE_TABS;
  }, [gallerySettings.communityGallerySharing]);

  useEffect(() => {
    trackEvent('gallery_viewed');
    markGalleryViewed(programCode);
  }, [programCode]);

  useEffect(() => {
    if (!programCode) return;
    void fetchGalleryProgramSettings(programCode).then(setGallerySettings);
  }, [programCode]);

  const refreshGallery = useCallback(async () => {
    setLoading(true);
    const [mine, approved, community] = await Promise.all([
      fetchFamilyGallerySubmissions(submitterKey, programCode),
      fetchProgramGalleryItems(programCode),
      gallerySettings.communityGallerySharing ? fetchCommunityGalleryItems() : Promise.resolve([]),
    ]);
    setMySubmissions(mine);
    setApprovedItems(approved);
    setCommunityItems(community);
    setLoading(false);
  }, [gallerySettings.communityGallerySharing, programCode, submitterKey]);

  useEffect(() => {
    void refreshGallery();
  }, [refreshGallery]);

  const pendingSubmissions = useMemo(
    () => mySubmissions.filter((item) => normalizeGalleryStatus(item.status) === 'pending'),
    [mySubmissions],
  );

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

  const setTab = (tab: FamilyGalleryTabId) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const scrollToUpload = () => {
    uploadFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

    if (!gallerySettings.allowFamilySubmit) {
      setUploadState('error');
      setUploadMessage('Family gallery submissions are disabled for this program.');
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

    setUploadState('idle');
    setUploadMessage(null);
    showToast("Artwork uploaded. I'll help you track the review.", 'success');
    setStudentName('');
    setActivityName('');
    setCaption('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await refreshGallery();
    requestGalleryCountsRefresh();
    setTab('pending-review');
  };

  const renderTabContent = () => {
    if (loading) return <p className="family-emptyNote">Loading gallery…</p>;

    switch (activeTab) {
      case 'pending-review':
        return (
          <StudentGalleryGrid
            items={pendingSubmissions}
            emptyMessage="No submissions waiting for review."
            variant="family"
          />
        );
      case 'program-gallery':
        return (
          <>
            <p className="family-gallerySectionDesc">
              Approved artwork from your program only. Other programs are not shown here.
            </p>
            <StudentGalleryGrid
              items={approvedItems}
              emptyMessage="No approved artwork yet. Check back after facilitator review."
              variant="family"
            />
          </>
        );
      case 'community-gallery':
        return gallerySettings.communityGallerySharing ? (
          <>
            <p className="family-gallerySectionDesc">
              Community artwork is shared only when your program opts in and a facilitator approves
              sharing.
            </p>
            <StudentGalleryGrid
              items={communityItems}
              emptyMessage="No community artwork available yet."
              variant="family"
            />
          </>
        ) : (
          <p className="family-emptyNote">Community sharing is not enabled for this program.</p>
        );
      case 'my-submissions':
      default:
        return (
          <>
            {rejectedCount > 0 ? (
              <p className="family-galleryRejectedNote">
                {rejectedCount} submission{rejectedCount === 1 ? '' : 's'} were not approved.
              </p>
            ) : null}
            <StudentGalleryGrid
              items={visibleSubmissions}
              emptyMessage="No uploads yet. Share student work above!"
              variant="family"
            />
          </>
        );
    }
  };

  return (
    <div className="family-panel family-panel--gallery">
      <MarketingShowcaseCard
        title="Share Your Child's Creativity"
        description="Upload coloring pages, reflections, and student wins. Submissions stay private to your program unless approved for community sharing."
        imageSrc={CHARACTER_IMAGE_PATHS.caiden ?? '/images/characters/caiden_photo_icon_game.webp'}
        actions={[{ label: 'Upload Artwork', onClick: scrollToUpload }]}
      />

      <div className="family-galleryTabs" role="tablist" aria-label="Family gallery views">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`family-galleryTab${activeTab === tab.id ? ' family-galleryTab--active' : ''}`}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form ref={uploadFormRef} className="family-galleryUploadCard" onSubmit={handleSubmit}>
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
          Family uploads are pending by default and stay program-private until approved.
        </p>

        <button
          type="submit"
          className="family-gallerySubmitBtn"
          disabled={uploadState === 'uploading' || !gallerySettings.allowFamilySubmit}
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

      <section className="family-gallerySection" aria-label={tabs.find((t) => t.id === activeTab)?.label}>
        {renderTabContent()}
      </section>
    </div>
  );
}
