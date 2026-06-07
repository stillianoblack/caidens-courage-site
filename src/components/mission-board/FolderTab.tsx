import React from 'react';

type FolderTabProps = {
  label: string;
  completed?: boolean;
  locked?: boolean;
  className?: string;
};

export default function FolderTab({ label, completed = false, locked = false, className = '' }: FolderTabProps) {
  return (
    <span className={['mission-folderTab', className].filter(Boolean).join(' ')}>
      <span className="mission-folderTabLabel">{label}</span>
      {completed ? (
        <span className="mission-folderTabCheck" aria-label="Completed">
          ✓
        </span>
      ) : null}
      {locked ? (
        <span className="mission-folderTabLock" aria-hidden="true">
          🔒
        </span>
      ) : null}
    </span>
  );
}
