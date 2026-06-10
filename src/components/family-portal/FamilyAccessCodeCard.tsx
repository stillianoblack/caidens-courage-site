import React from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { readActivePortalRole } from '../../config/portalContext';
import { CollapsibleCard, CopyableCompactValue } from '../portal-design-system';

type FamilyAccessCodeCardProps = {
  compact?: boolean;
  className?: string;
  campProgramCode?: string | null;
  studentAccessCode?: string | null;
};

export default function FamilyAccessCodeCard({
  compact = false,
  className = '',
  campProgramCode = null,
  studentAccessCode = null,
}: FamilyAccessCodeCardProps) {
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

  const linkedCampCode = campProgramCode?.trim() || null;
  const childCode = studentAccessCode?.trim() || linkedCampCode;

  return (
    <CollapsibleCard
      title="Family Access"
      storageKey={storageKey}
      defaultCollapsed
      collapsedSummary="Codes available when needed."
      helperText="Use these codes when enrolling or linking your child to a camp program."
      className={`family-accessCodeCollapsible${className ? ` ${className}` : ''}`}
    >
      <div className="family-accessCodeRows">
        <div className="family-accessCodeRowItem">
          <span className="family-accessCodeRowLabel">Family Access Code</span>
          <CopyableCompactValue value={familyCode} type="code" label="Family Code" truncateMiddle />
        </div>
        {linkedCampCode ? (
          <div className="family-accessCodeRowItem">
            <span className="family-accessCodeRowLabel">Linked Camp Code</span>
            <CopyableCompactValue value={linkedCampCode} type="code" label="Camp Code" truncateMiddle />
          </div>
        ) : null}
        {childCode ? (
          <div className="family-accessCodeRowItem">
            <span className="family-accessCodeRowLabel">Child / Student Access Code</span>
            <CopyableCompactValue value={childCode} type="code" label="Student Code" truncateMiddle />
          </div>
        ) : (
          <p className="family-accessCodeChildNote">
            Child access code appears after your child is linked to a camp program.
          </p>
        )}
      </div>
    </CollapsibleCard>
  );
}
