import React from 'react';

export type TrailConnectorProps = {
  active?: boolean;
  className?: string;
};

export default function TrailConnector({ active = false, className }: TrailConnectorProps) {
  return (
    <div
      className={['trailConnector', active ? 'trailConnector--active' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="trailConnectorLine" />
    </div>
  );
}
