import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CourageFooter from '../components/courage/CourageFooter';
import CourageHeader from '../components/courage/CourageHeader';
import SectionHero from '../components/courage/SectionHero';
import '../components/pilot-dashboard/pilot-dashboard.css';
import { PORTAL_PATH, PILOT_DASHBOARD_PATH } from '../config/courageRoutes';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import {
  DEFAULT_GALLERY_PROGRAM_CODE,
  uploadStudentGalleryItem,
} from '../lib/studentGalleryService';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function StudentGallerySubmitPage() {
  const navigate = useNavigate();
  const sessionType = readPilotDashboardSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [programCode, setProgramCode] = useState(DEFAULT_GALLERY_PROGRAM_CODE);
  const [groupName, setGroupName] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Submit Student Work | Caiden's Courage";
  }, []);

  useEffect(() => {
    if (!sessionType) {
      navigate(PORTAL_PATH, { replace: true });
    }
  }, [navigate, sessionType]);

  if (!sessionType) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setUploadState('error');
      setUploadMessage('Please choose an image to upload.');
      return;
    }

    setUploadState('uploading');
    setUploadMessage('Uploading...');

    const result = await uploadStudentGalleryItem({
      file: selectedFile,
      title: workTitle,
      studentNickname: nickname,
      programCode,
      groupName,
      uploadSource: 'submit',
    });

    if (!result.success) {
      setUploadState('error');
      setUploadMessage('Upload failed. Check the console for details.');
      return;
    }

    setUploadState('success');
    setUploadMessage('Upload complete. Your submission is pending facilitator review.');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <SectionHero
        eyebrow="STUDENT GALLERY"
        title="Submit Student Work"
        description="Upload student coloring pages, drawings, and reflections to the Blue Ribbon pilot gallery."
      />

      <div className="cc-site-container mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
        <form
          className="rounded-2xl border-2 border-navy-100 bg-white p-6 shadow-sm sm:p-8"
          onSubmit={handleSubmit}
        >
          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
              Student first name or nickname
            </span>
            <input
              type="text"
              className="w-full rounded-xl border-2 border-navy-100 px-3 py-2.5 text-navy-700"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={32}
              required
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
              Program code
            </span>
            <input
              type="text"
              className="w-full rounded-xl border-2 border-navy-100 px-3 py-2.5 text-navy-700"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value)}
              maxLength={48}
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
              Group or classroom
            </span>
            <input
              type="text"
              className="w-full rounded-xl border-2 border-navy-100 px-3 py-2.5 text-navy-700"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={64}
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
              Work title
            </span>
            <input
              type="text"
              className="w-full rounded-xl border-2 border-navy-100 px-3 py-2.5 text-navy-700"
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              maxLength={80}
              required
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
              Image file
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="w-full text-sm text-navy-600"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] ?? null);
                setUploadState('idle');
                setUploadMessage(null);
              }}
              required
            />
          </label>

          {uploadMessage ? (
            <p
              className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
                uploadState === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : uploadState === 'error'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-navy-100 bg-navy-50 text-navy-700'
              }`}
              role="status"
            >
              {uploadMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-golden-500 px-5 text-sm font-extrabold uppercase tracking-wide text-navy-700 shadow-[0_3px_0_#c9a44a] disabled:opacity-60"
              disabled={uploadState === 'uploading'}
            >
              {uploadState === 'uploading' ? 'Uploading...' : 'Upload to Gallery'}
            </button>
            <Link
              to={PILOT_DASHBOARD_PATH}
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border-2 border-navy-100 bg-white px-5 text-sm font-bold text-navy-600"
            >
              Back to Pilot Dashboard
            </Link>
          </div>
        </form>
      </div>

      <CourageFooter />
    </div>
  );
}
