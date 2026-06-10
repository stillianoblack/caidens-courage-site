import React from 'react';
import EmptyState from './EmptyState';

export type RecentActivityKind =
  | 'baseline'
  | 'module'
  | 'certificate'
  | 'gallery'
  | 'goals'
  | 'activity'
  | 'linked';

export type RecentActivityItem = {
  id: string;
  label: string;
  kind?: RecentActivityKind;
  timestamp?: string;
};

type RecentActivityFeedProps = {
  items: RecentActivityItem[];
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
};

export default function RecentActivityFeed({
  items,
  emptyMessage = 'No recent activity yet.',
  className = '',
  loading = false,
}: RecentActivityFeedProps) {
  if (loading) {
    return (
      <div className={`ds-recentActivityFeed ds-recentActivityFeed--loading${className ? ` ${className}` : ''}`} aria-busy="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="family-skeletonBar" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        className={className}
        title="No recent activity yet"
        description={emptyMessage}
      />
    );
  }

  return (
    <ul className={`ds-recentActivityFeed family-activityList${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <li key={item.id} className="family-activityItem">
          <span className="family-activityDot" aria-hidden="true" />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
