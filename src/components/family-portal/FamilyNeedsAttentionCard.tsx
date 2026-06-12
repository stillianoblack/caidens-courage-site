import React from 'react';
import { Link } from 'react-router-dom';
import type { FamilyNeedsAttentionItem } from '../../lib/familyOverviewInsights';

type FamilyNeedsAttentionCardProps = {
  items: FamilyNeedsAttentionItem[];
  onItemClick?: (item: FamilyNeedsAttentionItem) => void;
};

export default function FamilyNeedsAttentionCard({
  items,
  onItemClick,
}: FamilyNeedsAttentionCardProps) {
  if (items.length === 0) return null;

  return (
    <section className="family-panelBlock family-needsAttention">
      <div className="family-panelBlockHead">
        <h2 className="family-panelBlockTitle">Needs Attention</h2>
        <p className="family-panelBlockSub">Friendly reminders to keep your child moving forward.</p>
      </div>
      <ul className="family-needsAttentionList">
        {items.map((item) => (
          <li
            key={item.id}
            className={`family-needsAttentionItem${
              item.highlight ? ' family-needsAttentionItem--highlight' : ''
            }`}
          >
            {onItemClick ? (
              <button
                type="button"
                className="family-needsAttentionLink family-needsAttentionLink--button"
                onClick={() => onItemClick(item)}
              >
                <span className="family-needsAttentionLabel">{item.label}</span>
                <span className="family-needsAttentionDetail">{item.detail}</span>
              </button>
            ) : item.href ? (
              <Link to={item.href} className="family-needsAttentionLink">
                <span className="family-needsAttentionLabel">{item.label}</span>
                <span className="family-needsAttentionDetail">{item.detail}</span>
              </Link>
            ) : (
              <div>
                <span className="family-needsAttentionLabel">{item.label}</span>
                <span className="family-needsAttentionDetail">{item.detail}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
