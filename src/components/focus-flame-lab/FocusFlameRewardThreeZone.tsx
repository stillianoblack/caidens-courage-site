import React from 'react';
import { adventureReminderCopy } from './AdventureStatusPanel';
import CompactB4HudCard from './CompactB4HudCard';
import MobileSceneStatus from './MobileSceneStatus';

type Feeling = 'Nervous' | 'Excited' | 'Embarrassed' | 'Angry';
type BodySignal = 'Head' | 'Chest' | 'Hands' | 'Stomach';

export type FocusFlameRewardScene = {
  id: 'move' | 'ceremony' | 'cave';
  title: string;
  cardImageSrc: string;
};

const TOTAL_FOCUS_POINTS = 40;
const SCENE_ORDER: FocusFlameRewardScene['id'][] = ['move', 'ceremony', 'cave'];

function clamp<T>(v: T | null | undefined, fallback: T) {
  return (v ?? fallback) as T;
}

function badgeIconUrls(publicUrl: string) {
  const root = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
  const icons = `${root}/images/icons`;
  return {
    noticing: `${icons}/leading-the-charge.webp`,
    body: `${icons}/post-on-fire.webp`,
    draw: `${icons}/the-warrior.webp`,
  };
}

function journeyLineStatus(sceneId: FocusFlameRewardScene['id'], selectedId: FocusFlameRewardScene['id']): string {
  if (sceneId === selectedId) return 'Completed';
  return 'Locked';
}

function RewardHudBadge({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="ffl-reward-hud-badge" aria-label={label}>
      <div className="ffl-reward-hud-badge-iconWrap">
        <img className="ffl-reward-hud-badge-img" src={src} alt={alt} loading="eager" decoding="async" />
      </div>
      <span className="ffl-reward-hud-badge-label">{label}</span>
    </div>
  );
}

function KidsBadgeTile({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div className="ffl-reward-badge-tile ffl-reward-badge-tile--earned" aria-label={label}>
      <div className="ffl-reward-badge-tile-iconWrap">
        <img className="ffl-reward-badge-tile-img" src={src} alt={alt} loading="eager" decoding="async" />
      </div>
      <span className="ffl-reward-badge-tile-label">{label}</span>
    </div>
  );
}

export default function FocusFlameRewardThreeZone({
  selectedScene,
  scenes,
  feeling,
  body,
  getBookHref,
  onTryNewScene,
  onPlayButtonClick,
  reduceMotion,
  markSrc,
}: {
  selectedScene: FocusFlameRewardScene;
  scenes: FocusFlameRewardScene[];
  feeling: Feeling | null;
  body: BodySignal | null;
  getBookHref?: string;
  onTryNewScene: () => void;
  onPlayButtonClick: () => void;
  reduceMotion: boolean;
  markSrc: string;
}) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const icons = badgeIconUrls(publicUrl);
  const certificatePdfHref = `${publicUrl}/downloads/Certificates/focus-flame-certificate.pdf`;

  const journeyScenes = [...scenes].sort(
    (a, b) => SCENE_ORDER.indexOf(a.id) - SCENE_ORDER.indexOf(b.id)
  );

  return (
    <div className="ffl-reward-page-wrap">
      <div className="ffl-reward-three-zone ffl-reward-stack">
        <aside className="ffl-reward-left-hud" aria-label="Reward status panel">
          <div className="ffl-reward-mobileSceneWrap">
            <MobileSceneStatus scene={selectedScene} progressPercent={100} />
          </div>

          <CompactB4HudCard message="Great job. Your Focus Flame is getting stronger." />

          <div className="ffl-hud-card ffl-hud-card--adventure ffl-reward-left-hud-card ffl-hud-adventure-card">
            <div className="ffl-hud-scene-thumbWrap ffl-hud-scene-thumbWrap--inCard">
              <img
                className="ffl-hud-scene-thumb"
                src={selectedScene.cardImageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                data-ffl-scene={selectedScene.id}
              />
            </div>
            <div className="ffl-hud-scene-title">{selectedScene.title}</div>
            <p className="ffl-hud-scene-reminder">{adventureReminderCopy(selectedScene.id)}</p>
          </div>

          <div className="ffl-hud-card ffl-hud-card--flame ffl-flame-status-card ffl-reward-left-hud-card ffl-reward-left-flame-card">
            <div className="ffl-reward-left-flame-row">
              <img className="ffl-reward-left-flame-mark" src={markSrc} alt="" decoding="async" />
              <h4 className="ffl-flame-status-headline ffl-reward-left-flame-headline">Steady</h4>
            </div>
            <div className="ffl-reward-hud-badge-row" role="list">
              <div role="listitem">
                <RewardHudBadge src={icons.noticing} alt="Noticing badge" label="Noticing" />
              </div>
              <div role="listitem">
                <RewardHudBadge src={icons.body} alt="Body badge" label="Body" />
              </div>
              <div role="listitem">
                <RewardHudBadge src={icons.draw} alt="Draw badge" label="Draw" />
              </div>
            </div>
          </div>
        </aside>

        <main className="ffl-reward-hero ffl-reward-main">
          <header className="ffl-reward-hero-intro">
            <p className="ffl-reward-eyebrow">CONGRATS, CAIDEN!</p>
            <h2 className="ffl-h2 ffl-reward-hero-title">Caiden’s flame stabilized.</h2>
            <p className="ffl-p ffl-reward-hero-sub">You helped Caiden notice what was happening.</p>
            <p className="ffl-reward-hero-meta">
              Feeling: <span className="ffl-strong">{clamp(feeling, '—')}</span> · Body signal:{' '}
              <span className="ffl-strong">{clamp(body, '—')}</span>
            </p>
          </header>

          <div className="ffl-reward-card-row">
            <section
              className="ffl-reward-surface-card ffl-reward-surface-card--kids ffl-kid-card"
              aria-labelledby="ffl-reward-kids-title"
            >
              <h3 id="ffl-reward-kids-title" className="ffl-reward-surface-title">
                For kids
              </h3>
              <p className="ffl-reward-kids-copy">
                You earned {TOTAL_FOCUS_POINTS} Focus Points for helping Caiden practice courage.
              </p>
              <div className="ffl-reward-badge-row" role="list">
                <div role="listitem">
                  <KidsBadgeTile src={icons.noticing} alt="Noticing badge" label="Noticing" />
                </div>
                <div role="listitem">
                  <KidsBadgeTile src={icons.body} alt="Body badge" label="Body" />
                </div>
                <div role="listitem">
                  <KidsBadgeTile src={icons.draw} alt="Draw badge" label="Draw" />
                </div>
              </div>
              <button
                type="button"
                className="ffl-ctaPrimary ffl-primary-button ffl-reward-kids-cta ffl-try-new-scene-button"
                onClick={onTryNewScene}
              >
                Try a new scene
              </button>
            </section>

            <section
              className="ffl-reward-surface-card ffl-reward-surface-card--parents"
              aria-labelledby="ffl-reward-parents-title"
            >
              <h3 id="ffl-reward-parents-title" className="ffl-reward-surface-title">
                For parents &amp; teachers
              </h3>
              <p className="ffl-reward-parents-copy">
                Download a Focus Flame certificate your child or student can fill out and sign.
              </p>
              <p className="ffl-reward-cert-helper">Printable PDF. No child account needed.</p>
              {/* Certificate asset: public/downloads/Certificates/focus-flame-certificate.pdf */}
              {/* TODO: Add Netlify form email capture before certificate download in Phase 2. */}
              <div className="ffl-reward-parent-actions">
                <a
                  className="ffl-ctaPrimary ffl-reward-cert-download"
                  href={certificatePdfHref}
                  download="focus-flame-certificate.pdf"
                  onClick={() => {
                    onPlayButtonClick();
                  }}
                >
                  Download Kid Certificate
                </a>
                <a
                  className="ffl-ctaSecondary ffl-reward-book-link"
                  href={getBookHref || '/#preorder'}
                  onClick={() => {
                    onPlayButtonClick();
                  }}
                >
                  Get the book
                </a>
              </div>
            </section>
          </div>
        </main>

        <aside className="ffl-reward-ambient" aria-label="Journey reflection">
          <div className={`ffl-reward-ambient-flameSlot${reduceMotion ? ' ffl-reward-ambient-flameSlot--still' : ''}`}>
            <img
              className="ffl-reward-ambient-flame"
              src={markSrc}
              alt=""
              decoding="async"
              aria-hidden="true"
            />
          </div>
          <blockquote className="ffl-reward-ambient-b4">
            Every brave step makes your flame shine brighter.
          </blockquote>
          <div className="ffl-reward-journey" aria-label="Adventure journey">
            <div className="ffl-reward-journey-title">Your journey</div>
            <ul className="ffl-reward-journey-list">
              {journeyScenes.map((s) => (
                <li key={s.id} className="ffl-reward-journey-item">
                  <span className="ffl-reward-journey-scene">{s.title}</span>
                  <span className="ffl-reward-journey-status" data-status={journeyLineStatus(s.id, selectedScene.id)}>
                    — {journeyLineStatus(s.id, selectedScene.id)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
