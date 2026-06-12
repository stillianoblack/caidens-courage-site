import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import MirandaMissionFlow from '../components/miranda/MirandaMissionFlow';
import { MIRANDA_MYSTERY_FILES_PATH } from '../config/courageRoutes';
import { getMirandaMissionById } from '../data/miranda';

export default function MirandaMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const mission = getMirandaMissionById(missionId);

  if (!mission) {
    return <Navigate to={MIRANDA_MYSTERY_FILES_PATH} replace />;
  }

  return (
    <MirandaMissionFlow missionId={mission.id} exitPath={MIRANDA_MYSTERY_FILES_PATH} />
  );
}
