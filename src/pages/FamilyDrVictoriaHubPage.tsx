import React from 'react';
import AdultLearningHub from '../components/adult-learning/AdultLearningHub';
import '../components/adult-learning/adult-learning-hub.css';
import { DR_VICTORIA_LEARNING_HUB } from '../data/adult/drVictoriaHub';

export default function FamilyDrVictoriaHubPage() {
  return (
    <AdultLearningHub
      guide={DR_VICTORIA_LEARNING_HUB}
      portal="family"
      backPath={DR_VICTORIA_LEARNING_HUB.routes.familySection}
      backLabel="Back to Parent Corner"
      embedded
    />
  );
}
