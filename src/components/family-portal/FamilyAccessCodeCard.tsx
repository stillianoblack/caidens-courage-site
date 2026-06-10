import React from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { readActivePortalRole } from '../../config/portalContext';
import { CollapsibleCard, CopyableCompactValue } from '../portal-design-system';

type FamilyAccessCodeCardProps = {
  compact?: boolean;
  className?: string;
};

export default function FamilyAccessCodeCard({ compact = false, className = '' }: FamilyAccessCodeCardProps) {
  const role = readActivePortalRole();
  const program = readActivePilotProgram();
  const familyCode = program?.familyAccessCode;
  const programCode = program?.programCode ?? '';

  if (role !== 'family' || !familyCode?.trim()) {
    return null;
  }

  const storageKey = `family_access_codes_collapsed_${programCode.trim()}`;

  if (compact) {
    return (
      <section className={`family-accessCodeCard family-accessCodeCard--compact${className ? ` ${className}` : ''}`}>
        <CopyableCompactValue value={familyCode} type="code" label="Family Code" truncateMiddle />
      </section>
    );
  }

  return (
    <CollapsibleCard
      title="Family Access Codes"
      storageKey={storageKey}
      defaultCollapsed={false}
      helperText="Share this code with a parent, guardian, tutor, or family member helping your child."
      className={`family-accessCodeCollapsible${className ? ` ${className}` : ''}`}
    >
      <div className="family-accessCodeRows">
        <div className="family-accessCodeRowItem">
          <span className="family-accessCodeRowLabel">Family Access Code</span>
          <CopyableCompactValue value={familyCode} type="code" label="Family Code" truncateMiddle />
        </div>
        {programCode ? (
          <div className="family-accessCodeRowItem">
            <span className="family-accessCodeRowLabel">Program Code</span>
            <CopyableCompactValue value={programCode} type="code" label="Program Code" truncateMiddle />
          </div>
        ) : null}
        <p className="family-accessCodeChildNote">
          Child access info appears after your child completes a B-4 Check-In or linked camp enrollment.
        </p>
      </div>
    </CollapsibleCard>
  );
}
