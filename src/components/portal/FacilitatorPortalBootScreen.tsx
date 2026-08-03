import React from 'react';
import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../../design-system/brand/brandLogos';
import type { FacilitatorPortalBootState } from '../../hooks/useFacilitatorPortalBoot';
import './facilitator-portal-boot-screen.css';

type FacilitatorPortalBootScreenProps = {
  state: FacilitatorPortalBootState;
  exiting?: boolean;
  onRetry: () => void;
};

const STATUS_COPY: Record<FacilitatorPortalBootState, string> = {
  booting: 'Preparing your facilitator portal…',
  ready: 'Your facilitator portal is ready.',
  recoverable_error: 'The portal is taking longer than expected.',
  unauthenticated: 'Your facilitator session has ended.',
  fatal_error: 'We couldn’t safely open this portal.',
};

export default function FacilitatorPortalBootScreen({
  state,
  exiting = false,
  onRetry,
}: FacilitatorPortalBootScreenProps) {
  const recoverable = state === 'recoverable_error';

  return (
    <main
      className={`facilitatorBoot${exiting ? ' facilitatorBoot--exiting' : ''}`}
      data-testid="facilitator-portal-boot"
      data-boot-state={state}
      aria-busy={state === 'booting' || state === 'ready'}
    >
      <div className="facilitatorBoot__center" role="status" aria-live="polite">
        <img
          className="focusFlameMark focusFlameMark--animate facilitatorBoot__mark"
          src={FOCUS_FLAME_ACADEMY_MARK_SRC}
          alt=""
          decoding="sync"
        />
        <p>{STATUS_COPY[state]}</p>
        {recoverable ? (
          <div className="facilitatorBoot__recovery" role="alert">
            <button type="button" onClick={onRetry}>Try again</button>
            <a href="/portal">Return to Enter the World</a>
          </div>
        ) : null}
      </div>
      <div className="facilitatorBoot__progress" aria-hidden="true">
        <span />
      </div>
    </main>
  );
}
