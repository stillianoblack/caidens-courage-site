import React from 'react';
import type { MirandaClueCardData } from '../../types/gameAssessment';
import MirandaClueAccentIcon, { EvidenceStamp } from './MirandaClueAccentIcon';

type MirandaCaseFileCardProps = Pick<MirandaClueCardData, 'label' | 'tag' | 'text' | 'accent'>;

export default function MirandaCaseFileCard({ label, tag, text, accent }: MirandaCaseFileCardProps) {
  return (
    <article className="miranda-caseFile" aria-label={`${label}: ${tag}`}>
      <div className="miranda-caseFileTab" aria-hidden="true">
        MISSING STUDENT
      </div>
      <div className="miranda-caseFileBody">
        <EvidenceStamp />
        {accent ? (
          <span className="miranda-caseFileAccentWrap" aria-hidden="true">
            <MirandaClueAccentIcon accent={accent} />
          </span>
        ) : null}
        <p className="miranda-clueLabel">{label}</p>
        <span className="miranda-clueTag miranda-clueTag--case">{tag}</span>
        <p className="miranda-caseFileText">&ldquo;{text}&rdquo;</p>
      </div>
    </article>
  );
}

/** Alias for evidence-focused case file cards */
export function MirandaEvidenceCard(props: MirandaCaseFileCardProps) {
  return <MirandaCaseFileCard {...props} />;
}
