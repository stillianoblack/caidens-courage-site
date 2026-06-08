import React, { useState } from 'react';
import type { PilotPricingTier } from '../../types/pilotProgram';
import { trackSalesFunnel } from '../../lib/analytics';
import PilotUpgradePricingModal from './PilotUpgradePricingModal';

type PilotPartnerSupportCardProps = {
  pricingTier?: PilotPricingTier;
};

export default function PilotPartnerSupportCard({ pricingTier }: PilotPartnerSupportCardProps) {
  const [open, setOpen] = useState(false);

  if (pricingTier !== 'camp_pilot') {
    return null;
  }

  return (
    <>
      <div className="pilot-railSupport">
        <p className="pilot-railSupportTitle">Upgrade Your Plan</p>
        <p className="pilot-railSupportCopy">Support your pilot and unlock expanded program access.</p>
        <button
          type="button"
          className="pilot-railSupportBtn"
          onClick={() => {
            trackSalesFunnel('support_pilot_clicked', { portal: 'facilitator' });
            trackSalesFunnel('pricing_viewed', { portal: 'facilitator' });
            setOpen(true);
          }}
        >
          Support Pilot
        </button>
      </div>

      <PilotUpgradePricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
