import React, { useEffect, useRef } from 'react';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import type { FacilitatorAccessCodesFocus } from '../../lib/openFacilitatorAccessCodes';
import { useCopyToast } from '../shared/useCopyToast';
import FacilitatorDrawer from './FacilitatorDrawer';
import './facilitator-share-invite-drawer.css';

type Props = {
  open: boolean;
  onClose: () => void;
  program: ActivePilotProgram;
  focus?: FacilitatorAccessCodesFocus;
};

type AccessSectionProps = {
  id: string;
  title: string;
  label: string;
  value?: string | null;
  helper: string;
  highlighted?: boolean;
  onCopy: (value: string) => void;
};

function AccessSection({ id, title, label, value, helper, highlighted, onCopy }: AccessSectionProps) {
  const code = value?.trim() ?? '';
  return (
    <section id={id} className={`facilitatorShareSection${highlighted ? ' facilitatorShareSection--highlighted' : ''}`}>
      <h3>{title}</h3>
      <div className="facilitatorShareCodeRow">
        <div>
          <span className="facilitatorShareCodeLabel">{label}</span>
          <strong className="facilitatorShareCodeValue">{code || 'Not generated'}</strong>
        </div>
        {code ? (
          <button type="button" className="facilitatorShareCopyBtn" onClick={() => onCopy(code)}>
            Copy Code
          </button>
        ) : null}
      </div>
      <p>{helper}</p>
    </section>
  );
}

export default function FacilitatorShareInviteDrawer({ open, onClose, program, focus }: Props) {
  const { copyWithToast } = useCopyToast();
  const familySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || focus !== 'family') return;
    const timer = window.setTimeout(() => {
      familySectionRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [focus, open]);

  return (
    <FacilitatorDrawer
      open={open}
      onClose={onClose}
      eyebrow="SHARE & INVITE"
      title="Share & Invite"
      description="Share the right access with students, families, or facilitators."
      characterSrc="/images/Choose-Your-Guide/b-4facilitator.webp"
      accent="navy"
      size="standard"
      titleId="facilitator-share-invite-title"
    >
      <div className="facilitatorShareDrawer">
        <AccessSection
          id="facilitator-share-program"
          title="PROGRAM / STUDENT ACCESS"
          label="Program Code"
          value={program.programCode}
          helper="For students joining this Focus Flame Academy program."
          highlighted={focus === 'program'}
          onCopy={(value) => void copyWithToast(value, 'Program code copied.')}
        />
        <div ref={familySectionRef}>
          <AccessSection
            id="facilitator-share-family"
            title="FAMILY ACCESS"
            label="Family Access Code"
            value={program.familyAccessCode}
            helper="Share with parents or guardians connecting to their child's experience."
            highlighted={focus === 'family'}
            onCopy={(value) => void copyWithToast(value, 'Family access code copied.')}
          />
        </div>
        <AccessSection
          id="facilitator-share-facilitator"
          title="FACILITATOR ACCESS"
          label="Facilitator Code"
          value={program.facilitatorAccessCode}
          helper="For approved facilitators joining this program."
          highlighted={focus === 'facilitator'}
          onCopy={(value) => void copyWithToast(value, 'Facilitator code copied.')}
        />
      </div>
    </FacilitatorDrawer>
  );
}
