import React from 'react';
import './grade-resolution-loading.css';

export default function GradeResolutionLoading() {
  return (
    <div className="gradeResolutionLoading" role="status" aria-live="polite">
      <div className="gradeResolutionLoadingCard">
        <span className="gradeResolutionLoadingSpinner" aria-hidden="true" />
        <p>Loading your learning level…</p>
      </div>
    </div>
  );
}
