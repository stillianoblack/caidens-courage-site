import React, { useCallback, useState } from 'react';

export type CopyableCompactType = 'email' | 'phone' | 'code' | 'text';

type CopyableCompactValueProps = {
  value: string;
  type: CopyableCompactType;
  label?: string;
  truncateMiddle?: boolean;
};

function isEmptyValue(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || trimmed === '—';
}

export function truncateMiddle(value: string, head = 12, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function EmailIcon() {
  return (
    <svg className="pilot-copyChipIcon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="pilot-copyChipIcon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="pilot-copyChipIcon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function resolveDisplayLabel(type: CopyableCompactType, label?: string): string {
  if (label) return label;
  switch (type) {
    case 'email':
      return 'Email';
    case 'phone':
      return 'Phone';
    case 'code':
      return 'Code';
    default:
      return 'Copy';
  }
}

export default function CopyableCompactValue({
  value,
  type,
  label,
  truncateMiddle: useTruncateMiddle = false,
}: CopyableCompactValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (isEmptyValue(value)) return;
    try {
      await navigator.clipboard.writeText(value.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }, [value]);

  if (isEmptyValue(value)) {
    return <span className="pilot-copyChip pilot-copyChip--empty">—</span>;
  }

  const trimmed = value.trim();
  const displayLabel = resolveDisplayLabel(type, label);
  const compactText =
    type === 'code' && useTruncateMiddle
      ? truncateMiddle(trimmed)
      : type === 'text'
        ? truncateMiddle(trimmed, 16, 6)
        : displayLabel;

  return (
    <button
      type="button"
      className={`pilot-copyChip pilot-copyChip--${type}${copied ? ' pilot-copyChip--copied' : ''}`}
      title={trimmed}
      aria-label={`Copy ${displayLabel}: ${trimmed}`}
      onClick={() => void handleCopy()}
    >
      {type === 'email' ? <EmailIcon /> : null}
      {type === 'phone' ? <PhoneIcon /> : null}
      {type === 'code' ? <CodeIcon /> : null}
      <span className="pilot-copyChipText">{copied ? 'Copied' : compactText}</span>
    </button>
  );
}
