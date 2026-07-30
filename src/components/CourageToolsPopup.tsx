import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CourageToolsPopupModal from './CourageToolsPopupModal';
import { useCourageToolsPopupTrigger } from '../hooks/useCourageToolsPopupTrigger';
import { supabase } from '../lib/supabaseClient';
import {
  browserApplicationSessionExists,
  isCourageToolsPopupEligible,
} from '../lib/courageToolsPopupEligibility';

export default function CourageToolsPopup() {
  const { pathname } = useLocation();
  const [authenticationLoading, setAuthenticationLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const applicationSessionExists = browserApplicationSessionExists();
  useEffect(() => {
    let active = true;
    if (!supabase) {
      setAuthenticated(false);
      setAuthenticationLoading(false);
      return undefined;
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthenticated(Boolean(data.session));
      setAuthenticationLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthenticated(Boolean(session));
      setAuthenticationLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);
  const enabled = isCourageToolsPopupEligible({
    pathname,
    authenticationLoading,
    authenticated,
    applicationSessionExists,
  });
  const { armed, isOpen, closePopup, dismiss, markSubmitted } = useCourageToolsPopupTrigger(enabled);

  if (!armed && !isOpen) return null;

  return (
    <CourageToolsPopupModal
      isOpen={isOpen}
      onClose={dismiss}
      onCloseAfterSuccess={closePopup}
      onSuccess={markSubmitted}
    />
  );
}
