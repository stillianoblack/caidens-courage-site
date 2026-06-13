import React, { useState } from 'react';

type AdminImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
  examplePaths?: string[];
  previewLabel?: string;
};

export default function AdminImageField({
  label,
  value,
  onChange,
  onUpload,
  hint = 'Upload an image or paste a public /images/ path.',
  examplePaths = [],
  previewLabel = 'Preview',
}: AdminImageFieldProps) {
  const [broken, setBroken] = useState(false);

  return (
    <label className="adminPortal-field">
      <span>{label}</span>
      <input type="file" accept="image/*" onChange={onUpload} />
      <input
        type="text"
        placeholder="/images/filename.webp or paste URL"
        value={value}
        onChange={(event) => {
          setBroken(false);
          onChange(event.target.value);
        }}
      />
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
