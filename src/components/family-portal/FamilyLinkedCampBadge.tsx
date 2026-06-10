import React from 'react';

type FamilyLinkedCampBadgeProps = {
  label: string;
  className?: string;
};

export default function FamilyLinkedCampBadge({ label, className = '' }: FamilyLinkedCampBadgeProps) {
  if (!label.trim()) return null;

  return (
    <span className={`family-linkedCampBadge${className ? ` ${className}` : ''}`}>{label}</span>
  );
}
