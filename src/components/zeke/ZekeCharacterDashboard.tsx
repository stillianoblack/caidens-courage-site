import React from 'react';
import { useLocation } from 'react-router-dom';
import CharacterAdventureCard from '../family-portal/CharacterAdventureCard';
import { CharacterDashboardLayout, QuestGrid } from '../../design-system/character-dashboard';
import { ZEKE_AVATAR_SRC } from '../../data/zeke';
import { buildCharacterDashboardCoach } from '../../lib/characterDashboardCoach';
import '../../design-system/character-dashboard/character-dashboard.css';
import '../family-portal/family-dashboard.css';

const COMING_SOON_QUESTS = [
  {
    id: 'pattern-lab',
    title: 'Pattern Lab',
    description: 'Spot sequences and solve visual puzzles.',
  },
  {
    id: 'logic-bridge',
    title: 'Logic Bridge',
    description: 'Connect clues with careful reasoning.',
  },
];

export default function ZekeCharacterDashboard() {
  const location = useLocation();
  const coach = buildCharacterDashboardCoach({
    characterId: 'zeke',
    pathname: location.pathname,
    completedCount: 0,
    totalCount: 0,
    progressPercent: 0,
  });

  return (
    <CharacterDashboardLayout
      characterId="zeke"
      theme="zeke"
      hero={{
        imageSrc: ZEKE_AVATAR_SRC,
        imageAlt: 'Zeke',
        name: 'Zeke',
        subtitle: "Sensory Lab adventures for patterns and puzzles.",
        description: 'Critical-thinking challenges are coming soon to Zeke\'s Sensory Lab.',
        availableCountLabel: 'Coming Soon',
        theme: 'zeke',
      }}
      coach={coach}
      quests={
        <QuestGrid aria-label="Zeke quests">
          {COMING_SOON_QUESTS.map((quest) => (
            <CharacterAdventureCard
              key={quest.id}
              characterId="zeke"
              title={quest.title}
              description={quest.description}
              cta="Coming Soon"
              href="#"
              status="Locked"
              locked
              lockedLabel="Coming Soon"
              layout="horizontal"
            />
          ))}
        </QuestGrid>
      }
    />
  );
}
