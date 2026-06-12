import React, { useEffect, useState } from 'react';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import { isIndependentFamilyProgram } from '../../lib/independentFamilyProgram';
import {
  readAccessCodesCollapsed,
  readAccessCodesHintSeen,
  writeAccessCodesCollapsed,
  writeAccessCodesHintSeen,
} from '../../lib/facilitatorAccessCodesCollapse';
import { OPEN_FACILITATOR_ACCESS_CODES_EVENT } from '../../lib/openFacilitatorAccessCodes';
import { useCopyToast } from '../shared/useCopyToast';

type ProgramAccessCodesCardProps = {
  program: ActivePilotProgram;
  compact?: boolean;
  collapsible?: boolean;
};

export default function ProgramAccessCodesCard({
  program,
  compact = false,
  collapsible,
}: ProgramAccessCodesCardProps) {
  const { copyWithToast, toast } = useCopyToast();
  const isIndependentFamily = isIndependentFamilyProgram(program);
  const isCollapsible = collapsible ?? compact;
  const title = isIndependentFamily ? 'Family Access Codes' : 'Program Access Codes';
  const helperText = 'Codes available when needed.';

  const [collapsed, setCollapsed] = useState(() =>
    isCollapsible ? readAccessCodesCollapsed(program.programCode) : false,
  );
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!isCollapsible || readAccessCodesHintSeen(program.programCode)) {
      return undefined;
    }

    setShowHint(true);
    const timer = window.setTimeout(() => {
      setShowHint(false);
      writeAccessCodesHintSeen(program.programCode);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isCollapsible, program.programCode]);

  useEffect(() => {
    const handleOpenAccessCodes = () => {
      setCollapsed(false);
      writeAccessCodesCollapsed(program.programCode, false);
      window.requestAnimationFrame(() => {
        document.getElementById('program-access-codes')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    };

    window.addEventListener(OPEN_FACILITATOR_ACCESS_CODES_EVENT, handleOpenAccessCodes);
    return () => window.removeEventListener(OPEN_FACILITATOR_ACCESS_CODES_EVENT, handleOpenAccessCodes);
  }, [program.programCode]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeAccessCodesCollapsed(program.programCode, next);
  };

  const codesBody = (
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
      {isIndependentFamily ? null : (
        <div className="pilotAccessCodesRow">
          <span className="pilotAccessCodesLabel">Facilitator Code</span>
          <span className="pilotAccessCodesValue">{program.facilitatorAccessCode}</span>
          <button
            type="button"
            className="pilotAccessCodesBtn"
            onClick={() => void copyWithToast(program.facilitatorAccessCode!)}
          >
            Copy
          </button>
        </div>
      )}
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
  );

  return (
    <>
      <section
        id="program-access-codes"
        className={`pilotAccessCodes${compact ? ' pilotAccessCodes--compact' : ''}${
          isCollapsible ? ' pilotAccessCodes--collapsible' : ''
        }${collapsed ? ' pilotAccessCodes--collapsed' : ''}`}
      >
        {isCollapsible ? (
          <>
            <button
              type="button"
              className="pilotAccessCodesHeader"
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
            >
              <div className="pilotAccessCodesHeaderText">
                <h3 className="pilotAccessCodesTitle">{title}</h3>
                <p className="pilotAccessCodesHelper">{helperText}</p>
              </div>
              <span className="pilotAccessCodesToggle">
                <span className="pilotAccessCodesToggleLabel">{collapsed ? 'Expand' : 'Collapse'}</span>
                <span className="pilotAccessCodesCaret" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </span>
            </button>
            {showHint ? (
              <p className="pilotAccessCodesSetupHint" role="status">
                You can collapse access codes after setup.
              </p>
            ) : null}
            {!collapsed ? codesBody : null}
          </>
        ) : (
          <>
            <h3 className="pilotAccessCodesTitle">{title}</h3>
            <p className="pilotAccessCodesCopy">
              {isIndependentFamily
                ? 'Use your Family Access Code to open assessments, games, reading activities, and downloads.'
                : 'Share the Family Access Code with parents. Keep the Facilitator Code for your staff dashboard.'}
            </p>
            {codesBody}
          </>
        )}
      </section>
      {toast}
    </>
  );
}
