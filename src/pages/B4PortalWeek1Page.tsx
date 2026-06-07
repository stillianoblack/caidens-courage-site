import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import B4GuideFlow from '../components/b4/B4GuideFlow';
import '../components/b4/b4-portal-hub.css';
import '../components/b4-guide/b4-guide.css';
import { KIDS_PORTAL_PATH } from '../config/courageRoutes';
import { B4_MODULE_TITLE } from '../data/b4GuideContent';

export default function B4PortalWeek1Page() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${B4_MODULE_TITLE} | Caiden's Courage`;
  }, []);

  return (
    <B4GuideFlow
      embedded
      initialScreen="module"
      onExit={() => navigate(`${KIDS_PORTAL_PATH}/b4`)}
    />
  );
}
