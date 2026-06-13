import React from 'react';
import WeeklyAdventureCard, {
  type WeeklyAdventureCardProps,
} from '../components/WeeklyAdventureCard';

/** Kid-facing adventure card — wraps WeeklyAdventureCard with shared visual system styles. */
export type AdventureCardProps = WeeklyAdventureCardProps;

export default function AdventureCard(props: AdventureCardProps) {
  return <WeeklyAdventureCard {...props} />;
}
