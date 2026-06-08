import React, { useEffect } from 'react';
import { trackEvent } from '../../../lib/analytics';

export default function FamilyCertificatesPanel() {
  useEffect(() => {
    trackEvent('certificate_viewed');
  }, []);

  return (
    <div className="family-panel">
      <p className="family-emptyNote">Certificates will appear here after activities are completed.</p>
    </div>
  );
}
