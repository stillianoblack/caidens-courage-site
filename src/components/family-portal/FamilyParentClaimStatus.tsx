import React from 'react';
import { StatusChip } from '../portal-design-system';
import type { ParentClaimStatus } from '../../lib/familyParentClaimState';

type FamilyParentClaimStatusProps = {
  status: ParentClaimStatus;
  showDetail?: boolean;
  className?: string;
};

export default function FamilyParentClaimStatus({
  status,
  showDetail = false,
  className = '',
}: FamilyParentClaimStatusProps) {
  return (
    <div className={`family-parentClaimStatus${className ? ` ${className}` : ''}`}>
      <StatusChip label={status.label} variant={status.variant} />
      {showDetail ? <p className="family-parentClaimStatusDetail">{status.detail}</p> : null}
    </div>
  );
}
