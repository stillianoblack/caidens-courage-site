import React from 'react';
import { Link } from 'react-router-dom';
import CharacterHeroBadge from './CharacterHeroBadge';
import TrailStatusBadge from './TrailStatusBadge';
import type { AdventureTrailNodeView } from '../../types/adventureTrail';

export type TrailNodeProps = {
  node: AdventureTrailNodeView;
  lockedHelperText?: string;
};

const DEFAULT_LOCKED_HELPER = 'Complete earlier steps to unlock';

export default function TrailNode({
  node,
  lockedHelperText = DEFAULT_LOCKED_HELPER,
}: TrailNodeProps) {
  const isInteractive =
    !node.comingSoon &&
    (node.state === 'complete' || node.state === 'available' || node.state === 'in_progress');
  const isExternal =
    node.external ?? (node.href.startsWith('/downloads') || node.href.startsWith('http'));

  const body = (
    <>
      <CharacterHeroBadge
        characterId={node.characterId}
        kind={node.kind}
        state={node.state}
        size="lg"
      />
      <div className="trailNodeContent">
        <div className="trailNodeHead">
          <p className="trailNodeStep">Step {node.stepNumber}</p>
          <TrailStatusBadge state={node.state} />
        </div>
        <h3 className="trailNodeTitle">{node.title}</h3>
        <p className="trailNodeDesc">{node.description}</p>
        {node.state === 'locked' ? (
          <p className="trailNodeHelper">{lockedHelperText}</p>
        ) : null}
        {node.state === 'coming_soon' ? (
          <p className="trailNodeHelper">More adventures are on the way.</p>
        ) : null}
        {isInteractive ? (
          <span className="trailNodeCta">
            {node.state === 'complete' ? 'Review' : node.cta}
            <span aria-hidden="true">→</span>
          </span>
        ) : null}
      </div>
    </>
  );

  const className = [
    'trailNode',
    `trailNode--${node.side}`,
    `trailNode--${node.state}`,
    `trailNode--${node.kind}`,
    isInteractive ? 'trailNode--interactive' : 'trailNode--static',
  ].join(' ');

  if (!isInteractive) {
    return (
      <article
        className={className}
        aria-label={node.state === 'locked' ? `${node.title}, locked` : undefined}
      >
        {body}
      </article>
    );
  }

  if (isExternal) {
    return (
      <a href={node.href} className={className}>
        {body}
      </a>
    );
  }

  return (
    <Link to={node.href} className={className} aria-current={node.state === 'in_progress' ? 'step' : undefined}>
      {body}
    </Link>
  );
}
