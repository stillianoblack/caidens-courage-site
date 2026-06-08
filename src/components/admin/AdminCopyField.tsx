import React from 'react';
import { copyToClipboard } from '../../lib/copyToClipboard';

type AdminCopyFieldProps = {
  label: string;
  value: string;
  onCopied: (message: string) => void;
};

export default function AdminCopyField({ label, value, onCopied }: AdminCopyFieldProps) {
  const handleCopy = async () => {
    await copyToClipboard(value, 'Copied', onCopied);
  };

  return (
    <div className="adminPortal-detailItem">
      <span className="adminPortal-detailLabel">{label}</span>
      <div className="adminPortal-codeRow">
        <code className="adminPortal-codeValue">{value}</code>
        <button type="button" className="adminPortal-btn adminPortal-btn--copy" onClick={handleCopy}>
          Copy
        </button>
      </div>
    </div>
  );
}
