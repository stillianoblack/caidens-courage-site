import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../components/b4/B4BaselineCheckFlow';
import PublicPilotExperienceGate from '../components/courage/PublicPilotExperienceGate';
import { B4_PILOT_MODAL_DESCRIPTION } from '../config/pilotAccess';
import '../components/b4-baseline-check/b4-baseline-check.css';
import { B4_BASELINE_LANDING } from '../data/b4BaselineCheckContent';

export default function B4BaselineCheckPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${B4_BASELINE_LANDING.title} | Caiden's Courage`;
  }, []);

  return (
    <PublicPilotExperienceGate interestType="b4_tools" description={B4_PILOT_MODAL_DESCRIPTION}>
      <B4BaselineCheckFlow onExit={() => navigate('/')} />
    </PublicPilotExperienceGate>
  );
}
