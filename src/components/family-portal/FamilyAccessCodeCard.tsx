import React from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { readActivePortalRole } from '../../config/portalContext';
import { useCopyToast } from '../shared/useCopyToast';

type FamilyAccessCodeCardProps = {
  compact?: boolean;
  className?: string;
};

export default function FamilyAccessCodeCard({ compact = false, className = '' }: FamilyAccessCodeCardProps) {
  const role = readActivePortalRole();
  const familyCode = readActivePilotProgram()?.familyAccessCode;
  const { copyWithToast, toast } = useCopyToast();

  if (role !== 'family' || !familyCode?.trim()) {
    return null;
  }

  return (
    <>
      <section
        className={`family-accessCodeCard${compact ? ' family-accessCodeCard--compact' : ''}${className ? ` ${className}` : ''}`}
        aria-labelledby="family-access-code-title"
      >
        <div className="family-accessCodeHead">
          <h2 id="family-access-code-title" className="family-accessCodeTitle">
            Family Access Code
          </h2>
          {!compact ? (
            <p className="family-accessCodeCopy">
              Share this code with a parent, guardian, tutor, or family member helping your child.
            </p>
          ) : null}
        </div>
        <div className="family-accessCodeRow">
          <code className="family-accessCodeValue">{familyCode}</code>
          <button
            type="button"
            className="family-accessCodeBtn"
            onClick={() => void copyWithToast(familyCode)}
          >
            Copy
          </button>
        </div>
      </section>
      {toast}
    </>
  );
}
