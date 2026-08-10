import React from 'react';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import { isFamilyClaimCode } from '../../lib/familyClaimCode';
import { useCopyToast } from '../shared/useCopyToast';
import FacilitatorDrawer from '../pilot-dashboard/FacilitatorDrawer';
import '../pilot-dashboard/facilitator-share-invite-drawer.css';

type Props = { open: boolean; onClose: () => void; program: ActivePilotProgram };

export default function FamilyShareInviteDrawer({ open, onClose, program }: Props) {
  const { copyWithToast } = useCopyToast();
  const familyCode = program.familyAccessCode?.trim() ?? '';
  const safeFamilyCode = familyCode && !isFamilyClaimCode(familyCode) ? familyCode : '';
  return (
    <FacilitatorDrawer open={open} onClose={onClose} eyebrow="SHARE & INVITE"
      title="Share & Invite"
      description="Share your child’s Focus Flame experience with the people supporting them."
      characterSrc="/images/Choose-Your-Guide/B-4orange.webp" accent="navy" size="standard"
      titleId="family-share-invite-title">
      <div className="facilitatorShareDrawer">
        <section className="facilitatorShareSection">
          <h3>FAMILY ACCESS</h3>
          <div className="facilitatorShareCodeRow">
            <div>
              <span className="facilitatorShareCodeLabel">Family Access Code</span>
              <strong className="facilitatorShareCodeValue">{safeFamilyCode || 'Not generated'}</strong>
            </div>
            {safeFamilyCode ? (
              <button type="button" className="facilitatorShareCopyBtn"
                onClick={() => void copyWithToast(safeFamilyCode, 'Family access code copied.')}>
                Copy Code
              </button>
            ) : null}
          </div>
          <p>Share only with a parent or guardian supporting this family experience.</p>
        </section>
        <section className="facilitatorShareSection">
          <h3>CHILD ACCESS</h3>
          <strong className="facilitatorShareCodeValue">Managed by your facilitator</strong>
          <p>Student PINs and private program credentials are never exposed in this drawer.</p>
        </section>
      </div>
    </FacilitatorDrawer>
  );
}
