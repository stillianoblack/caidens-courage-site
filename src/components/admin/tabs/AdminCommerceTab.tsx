import React from 'react';
import AdminCommerceProductsTab from './AdminCommerceProductsTab';
import AdminPricingPlansTab from './AdminPricingPlansTab';

export type AdminCommerceSubtab = 'products' | 'memberships';

type AdminCommerceTabProps = {
  activeSubtab: AdminCommerceSubtab;
  onSelectSubtab: (tab: AdminCommerceSubtab) => void;
  onCopied?: (message: string) => void;
};

const COMMERCE_SUBTABS: Array<{ id: AdminCommerceSubtab; label: string }> = [
  { id: 'products', label: 'Products' },
  { id: 'memberships', label: 'Membership Plans' },
];

export function resolveAdminCommerceSubtab(value: string | null): AdminCommerceSubtab {
  return value === 'memberships' ? 'memberships' : 'products';
}

export default function AdminCommerceTab({
  activeSubtab,
  onSelectSubtab,
  onCopied,
}: AdminCommerceTabProps) {
  return (
    <div className="adminPortal-stack">
      <section className="adminPortal-card">
        <h2 className="adminPortal-cardTitle">Commerce</h2>
        <p className="adminPortal-cardSub">
          Manage one-time products, memberships, prices, and Stripe checkout destinations without
          changing frontend source code.
        </p>
        <div className="adminPortal-segmentedTabs" role="tablist" aria-label="Commerce sections">
          {COMMERCE_SUBTABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeSubtab === tab.id}
              className={`adminPortal-segmentedTab ${
                activeSubtab === tab.id ? 'adminPortal-segmentedTab--active' : ''
              }`}
              onClick={() => onSelectSubtab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeSubtab === 'products' ? (
        <AdminCommerceProductsTab onCopied={onCopied} />
      ) : (
        <AdminPricingPlansTab onCopied={onCopied} />
      )}
    </div>
  );
}
