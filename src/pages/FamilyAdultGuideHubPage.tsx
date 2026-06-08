import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AdultLearningHub from '../components/adult-learning/AdultLearningHub';
import '../components/adult-learning/adult-learning-hub.css';
import { FAMILY_PORTAL_PATH } from '../config/courageRoutes';
import { getAdultGuideById } from '../data/adult/adultGuideRegistry';

export default function FamilyAdultGuideHubPage() {
  const { guideId } = useParams<{ guideId: string }>();
  const guide = getAdultGuideById(guideId);

  if (!guide) {
    return <Navigate to={`${FAMILY_PORTAL_PATH}/guide`} replace />;
  }

  return (
    <AdultLearningHub
      guide={guide}
      portal="family"
      backPath={guide.routes.familySection}
      backLabel="Back to Parent Corner"
      embedded
    />
  );
}
