import React, { useEffect, useState } from 'react';

type AdminImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  hint?: string;
  examplePaths?: string[];
  previewLabel?: string;
  uploading?: boolean;
};

export default function AdminImageField({
  label,
  value,
  onChange,
  onUpload,
  hint = 'Upload an image or paste a public /images/ path.',
  examplePaths = [],
  previewLabel = 'Preview',
  uploading = false,
}: AdminImageFieldProps) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [value]);

  return (
    <label className="adminPortal-field">
      <span>{label}</span>
      <input type="file" accept="image/*" disabled={uploading} onChange={onUpload} />
      <input
        type="text"
        placeholder="/images/filename.webp or paste URL"
        value={value}
        disabled={uploading}
        onChange={(event) => {
          setBroken(false);
          onChange(event.target.value);
        }}
      />
      {uploading ? (
        <span className="adminPortal-fieldHint adminPortal-fieldHint--status">Uploading…</span>
      ) : null}
      <span className="adminPortal-fieldHint">{hint}</span>
      {examplePaths.map((path) => (
        <span key={path} className="adminPortal-fieldHint adminPortal-fieldHint--example">
          Example: {path}
        </span>
      ))}
      {value ? (
        <div className="adminImagePreview">
          <span className="adminImagePreviewLabel">{previewLabel}</span>
          {!broken ? (
            <img
              src={value}
              alt=""
              className="adminImagePreviewImg"
              onLoad={() => setBroken(false)}
              onError={() => setBroken(true)}
            />
          ) : (
            <p className="adminImagePreviewError" role="alert">Image could not load.</p>
          )}
        </div>
      ) : null}
    </label>
  );
}
