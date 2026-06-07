import React from 'react';

type MirandaFileIconProps = {
  fileNumber: number;
};

function File1StudentIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="miranda-hubFileIconSvg">
      <circle cx="24" cy="16" r="7" fill="#fff" fillOpacity="0.95" />
      <path
        d="M12 38c0-6.627 5.373-10 12-10s12 3.373 12 10"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="34" cy="14" r="6" fill="#e5c06a" />
      <path
        d="M34 11.5c0 1.2-.8 2.2-1.8 2.5-.5.15-1 .2-1.2.2"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M32.5 14.5 34 16l2-2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function File2ClueIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="miranda-hubFileIconSvg">
      <rect x="8" y="26" width="18" height="14" rx="2.5" fill="#fff" fillOpacity="0.92" />
      <path d="M12 31h10M12 35h7" stroke="#7c5cbf" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="20" r="9" stroke="#fff" strokeWidth="3" />
      <path d="M36.5 26.5 42 32" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="20" r="4" fill="#93c5fd" fillOpacity="0.85" />
    </svg>
  );
}

function File3LettersIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="miranda-hubFileIconSvg">
      <rect x="8" y="14" width="14" height="16" rx="3" fill="#fff" fillOpacity="0.95" />
      <rect x="18" y="18" width="14" height="16" rx="3" fill="#faf5ff" stroke="#e5c06a" strokeWidth="2" />
      <rect x="28" y="22" width="14" height="16" rx="3" fill="#fff" fillOpacity="0.9" />
      <text x="13" y="26" fill="#7c5cbf" fontSize="10" fontWeight="800" fontFamily="Nunito, sans-serif">
        A
      </text>
      <text x="23" y="30" fill="#5a408f" fontSize="10" fontWeight="800" fontFamily="Nunito, sans-serif">
        B
      </text>
      <text x="33" y="34" fill="#7c5cbf" fontSize="10" fontWeight="800" fontFamily="Nunito, sans-serif">
        C
      </text>
    </svg>
  );
}

function File4NotebookIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="miranda-hubFileIconSvg">
      <path
        d="M10 10h22a3 3 0 0 1 3 3v26a2 2 0 0 0-2-2H12a2 2 0 0 1-2-2V10Z"
        fill="#fff"
        fillOpacity="0.95"
      />
      <path d="M12 16h18M12 22h14M12 28h16" stroke="#7c5cbf" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 13v24" stroke="#e5c06a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="34" cy="18" r="9" stroke="#fff" strokeWidth="3" />
      <path d="M40.5 24.5 45 29" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="34" cy="18" r="3.5" fill="#c4b5fd" fillOpacity="0.9" />
    </svg>
  );
}

function File5TrailIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="miranda-hubFileIconSvg">
      <path
        d="M8 10h20a2.5 2.5 0 0 1 2.5 2.5v24a1.5 1.5 0 0 0-1.5-1.5H10a2 2 0 0 1-2-2V10Z"
        fill="#fff"
        fillOpacity="0.95"
      />
      <path d="M11 16h16M11 21h12" stroke="#7c5cbf" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M28 12v22" stroke="#e5c06a" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="34" cy="30" rx="3" ry="4" fill="#8b6914" fillOpacity="0.85" />
      <ellipse cx="38" cy="34" rx="2.5" ry="3.5" fill="#8b6914" fillOpacity="0.7" />
      <ellipse cx="35" cy="38" rx="3" ry="4" fill="#8b6914" fillOpacity="0.85" />
      <ellipse cx="40" cy="24" rx="2.5" ry="3.5" fill="#8b6914" fillOpacity="0.65" />
    </svg>
  );
}

export default function MirandaFileIcon({ fileNumber }: MirandaFileIconProps) {
  if (fileNumber === 1) return <File1StudentIcon />;
  if (fileNumber === 2) return <File2ClueIcon />;
  if (fileNumber === 3) return <File3LettersIcon />;
  if (fileNumber === 4) return <File4NotebookIcon />;
  if (fileNumber === 5) return <File5TrailIcon />;
  return null;
}

export function mirandaFileIconTone(fileNumber: number): string {
  if (fileNumber === 1) return 'miranda-hubFileIconWrap--student';
  if (fileNumber === 2) return 'miranda-hubFileIconWrap--clue';
  if (fileNumber === 3) return 'miranda-hubFileIconWrap--letters';
  if (fileNumber === 4) return 'miranda-hubFileIconWrap--notebook';
  if (fileNumber === 5) return 'miranda-hubFileIconWrap--trail';
  return '';
}
