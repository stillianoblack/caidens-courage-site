import React, { useState } from 'react';
import FamilyUpgradePricingModal from './FamilyUpgradePricingModal';

export default function FamilyUpgradeRailCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="family-railSupport">
        <p className="family-railSupportTitle">Upgrade Your Family Plan</p>
        <p className="family-railSupportCopy">
          Unlock family activities, games, digital story access, and premium resources.
        </p>
        <button type="button" className="family-railSupportBtn" onClick={() => setOpen(true)}>
          View Plans
        </button>
      </div>

      <FamilyUpgradePricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
