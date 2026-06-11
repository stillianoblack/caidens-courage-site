import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ENABLE_B4_CHAT } from '../../config/featureFlags';
import type { FamilyB4QuickAction } from '../../lib/familyOverviewRecommendations';
import { openAskB4 } from '../../lib/openAskB4';
import { openProgramGoals } from '../../lib/openProgramGoals';

type FamilyB4QuickActionsProps = {
  actions: FamilyB4QuickAction[];
  onOpenChildDrawer?: () => void;
  className?: string;
};

function FamilyB4QuickActionsPanel({
  actions,
  onOpenChildDrawer,
  className = '',
}: FamilyB4QuickActionsProps) {
  const navigate = useNavigate();

  const handleAction = (action: FamilyB4QuickAction) => {
    if (action.openGoals) {
      openProgramGoals();
      return;
    }
    if (action.openChildDrawer) {
      onOpenChildDrawer?.();
      return;
    }
    if (action.prompt) {
      openAskB4(action.prompt);
      return;
    }
    if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <section className={`family-b4QuickActions${className ? ` ${className}` : ''}`} aria-label="B-4 quick actions">
      <h2 className="family-panelBlockTitle">Ask B-4</h2>
      <div className="family-b4QuickActionsGrid">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="family-b4QuickActionBtn"
            onClick={() => handleAction(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function FamilyB4QuickActions(props: FamilyB4QuickActionsProps) {
  if (!ENABLE_B4_CHAT) return null;
  return <FamilyB4QuickActionsPanel {...props} />;
}
