import React from 'react';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import { useCopyToast } from '../shared/useCopyToast';

type ProgramAccessCodesCardProps = {
  program: ActivePilotProgram;
  compact?: boolean;
};

export default function ProgramAccessCodesCard({ program, compact = false }: ProgramAccessCodesCardProps) {
  const { copyWithToast, toast } = useCopyToast();

  return (
    <>
      <section className={`pilotAccessCodes${compact ? ' pilotAccessCodes--compact' : ''}`}>
        <h3 className="pilotAccessCodesTitle">Program Access Codes</h3>
        {!compact ? (
          <p className="pilotAccessCodesCopy">
            Share the Family Access Code with parents. Keep the Facilitator Code for your staff dashboard.
          </p>
        ) : null}

        <div className="pilotAccessCodesGrid">
          <div className="pilotAccessCodesRow">
            <span className="pilotAccessCodesLabel">Program Code</span>
            <span className="pilotAccessCodesValue">{program.programCode}</span>
            <button
              type="button"
              className="pilotAccessCodesBtn"
              onClick={() => void copyWithToast(program.programCode)}
            >
              Copy
            </button>
          </div>
          <div className="pilotAccessCodesRow">
            <span className="pilotAccessCodesLabel">Facilitator Code</span>
            <span className="pilotAccessCodesValue">{program.facilitatorAccessCode}</span>
            <button
              type="button"
              className="pilotAccessCodesBtn"
              onClick={() => void copyWithToast(program.facilitatorAccessCode)}
            >
              Copy
            </button>
          </div>
          <div className="pilotAccessCodesRow">
            <span className="pilotAccessCodesLabel">Family Access Code</span>
            <span className="pilotAccessCodesValue">{program.familyAccessCode}</span>
            <button
              type="button"
              className="pilotAccessCodesBtn"
              onClick={() => void copyWithToast(program.familyAccessCode)}
            >
              Copy
            </button>
          </div>
        </div>
      </section>
      {toast}
    </>
  );
}
