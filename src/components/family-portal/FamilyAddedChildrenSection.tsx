import React from 'react';
import type { FamilyVisibleChild } from '../../lib/studentFamilyLinkService';

type FamilyAddedChildrenSectionProps = {
  children: FamilyVisibleChild[];
  loading?: boolean;
};

function sourceLabel(source: FamilyVisibleChild['source']): string {
  return source === 'camp_link' ? 'Linked from camp' : 'Added to family';
}

export default function FamilyAddedChildrenSection({
  children,
  loading = false,
}: FamilyAddedChildrenSectionProps) {
  return (
    <section className="family-panelBlock" aria-labelledby="family-added-children-title">
      <div className="family-panelBlockHead">
        <h2 id="family-added-children-title" className="family-panelBlockTitle">
          Added Children
        </h2>
        <p className="family-panelHelper">
          Only children linked to your family program appear here. Camp access codes do not share
          other families&apos; results.
        </p>
      </div>

      {loading ? (
        <div className="family-childrenSkeleton" aria-busy="true" aria-label="Loading children">
          <div className="family-skeletonBar" />
        </div>
      ) : null}

      {!loading && children.length === 0 ? (
        <p className="family-panelHelper">
          No children added yet. Use Add a Child below, or ask your camp facilitator to link your
          child to your family program.
        </p>
      ) : null}

      {!loading && children.length > 0 ? (
        <ul className="family-addedChildrenList">
          {children.map((child) => (
            <li key={child.studentId} className="family-addedChildItem">
              <span className="family-addedChildName">{child.displayName}</span>
              <span className="family-addedChildSource">{sourceLabel(child.source)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
