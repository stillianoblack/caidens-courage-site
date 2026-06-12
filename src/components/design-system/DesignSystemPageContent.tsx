import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BaselineOverviewBars from '../portal-design-system/BaselineOverviewBars';
import CollapsibleCard from '../portal-design-system/CollapsibleCard';
import CopyableCompactValue from '../portal-design-system/CopyableCompactValue';
import EmptyState from '../portal-design-system/EmptyState';
import GoalsOnboardingDrawer from '../portal-design-system/GoalsOnboardingDrawer';
import MarketingShowcaseCard from '../portal-design-system/MarketingShowcaseCard';
import MetricCard from '../portal-design-system/MetricCard';
import SlideOutDrawer from '../portal-design-system/SlideOutDrawer';
import B4InsightsDrawer from '../../design-system/components/B4InsightsDrawer';
import { B4_AVATAR_SRC } from '../../data/b4/avatar';
import '../../design-system/components/b4-insights-drawer.css';
import StatusChip from '../portal-design-system/StatusChip';
import { useToast } from '../portal-design-system/ToastProvider';
import PilotAdminStudentTable from '../pilot-dashboard/PilotAdminStudentTable';
import PilotNeedsAttentionCard from '../pilot-dashboard/PilotNeedsAttentionCard';
import PilotStudentDetailDrawer from '../pilot-dashboard/PilotStudentDetailDrawer';
import { ASK_B4_STARTER_PROMPTS } from '../../lib/askB4Mode';
import { familyPortalPath } from '../../lib/familyPortalPaths';
import {
  DEMO_ASSESSMENTS,
  DEMO_BASELINE_ROWS,
  DEMO_FAMILY_LINKS,
  DEMO_GALLERY_ITEM,
  DEMO_MODULES,
  DEMO_MODULE_ROWS,
  DEMO_NEEDS_ATTENTION,
  DEMO_PARTICIPANTS,
  DEMO_PENDING_GALLERY_ITEM,
  DEMO_RECENT_ACTIVITY,
  DEMO_ROSTER_ROWS,
} from '../../data/designSystemDemoData';
import FeaturedStudentWorkCard from './FeaturedStudentWorkCard';
import GameLearningDesignSystemSection from './GameLearningDesignSystemSection';
import GameUIPatternsSection from './GameUIPatternsSection';
import FamilyPortalDesignSystemSection from './FamilyPortalDesignSystemSection';
import InteractiveModuleSystemSection from './InteractiveModuleSystemSection';
import ContentClassificationSection from './ContentClassificationSection';
import '../portal-design-system/portal-design-system.css';
import '../pilot-dashboard/pilot-dashboard.css';
import './design-system-page.css';

const SECTIONS = [
  { id: 'shell', label: 'App Shell' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'cards', label: 'Cards' },
  { id: 'drawers', label: 'Drawers' },
  { id: 'b4-insights', label: 'B-4 Insights' },
  { id: 'toasts', label: 'Toasts' },
  { id: 'copy', label: 'Copy Values' },
  { id: 'status', label: 'Status Chips' },
  { id: 'tables', label: 'Tables' },
  { id: 'progress', label: 'Progress' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'b4', label: 'B-4' },
  { id: 'goals', label: 'Goals' },
  { id: 'game-learning', label: 'Game Learning' },
  { id: 'game-ui-patterns', label: 'Game UI Patterns' },
  { id: 'interactive-modules', label: 'Interactive Modules' },
  { id: 'content-classification', label: 'Content Classification' },
  { id: 'family-portal', label: 'Family Portal' },
] as const;

function ShellPreview({
  variant,
  label,
}: {
  variant: 'facilitator' | 'family' | 'kid';
  label: string;
}) {
  const isFamily = variant === 'family' || variant === 'kid';

  return (
    <div>
      <p className="dsShellPreviewLabel">{label}</p>
      <div className={`dsShellPreview${isFamily ? ' dsShellPreview--family' : ''}`}>
        <div className={`dsShellPreviewRail${isFamily ? ' dsShellPreviewRail--family' : ''}`}>
          <div className="dsShellPreviewRailItem dsShellPreviewRailItem--active" />
          <div className="dsShellPreviewRailItem" />
          <div className="dsShellPreviewRailItem" />
          <div className="dsShellPreviewRailItem" />
        </div>
        <div className="dsShellPreviewMain">
          <div className="dsShellPreviewTop" />
          <div className="dsShellPreviewContent">
            <MetricCard label="Preview" value="Content area" helperText={`${variant} portal shell`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function noopAsync() {
  return Promise.resolve();
}

export default function DesignSystemPageContent() {
  const { showToast } = useToast();
  const [standardDrawerOpen, setStandardDrawerOpen] = useState(false);
  const [largeDrawerOpen, setLargeDrawerOpen] = useState(false);
  const [studentDrawerOpen, setStudentDrawerOpen] = useState(false);
  const [facilitatorGoalsOpen, setFacilitatorGoalsOpen] = useState(false);
  const [familyGoalsOpen, setFamilyGoalsOpen] = useState(false);
  const [b4InsightsOpen, setB4InsightsOpen] = useState(false);

  return (
    <>
      <header className="dsPageHero">
        <h1 className="dsPageHeroTitle">Focus Flame Design System</h1>
        <p className="dsPageHeroSub">
          Shared components for Facilitator, Family, and Kid portals. Mock data only — no production
          writes.
        </p>
        <span className="dsPageBadge">Internal QA</span>
      </header>

      <main className="dsPageMain">
        <nav className="dsPageNav" aria-label="Design system sections">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </nav>

        <section id="shell" className="dsPageSection">
          <h2 className="dsPageSectionTitle">1. App Shell</h2>
          <p className="dsPageSectionSub">
            <code>AppShell</code> wraps <code>PortalShell</code> for facilitator, family, and kid variants.
          </p>
          <div className="dsPageGrid dsPageGrid--3">
            <ShellPreview variant="facilitator" label="Facilitator shell" />
            <ShellPreview variant="family" label="Family shell" />
            <ShellPreview variant="kid" label="Kid shell (maps to family layout)" />
          </div>
          <p className="dsPageNote">
            Live shells use real sidebars and headers. <code>B4Assistant</code> mounts inside{' '}
            <code>AppShell</code> for Facilitator, Family, and Kid portals (family game routes
            included). Marketing pages still use the global launcher from <code>App.tsx</code>.
          </p>
        </section>

        <section id="buttons" className="dsPageSection">
          <h2 className="dsPageSectionTitle">2. Buttons</h2>
          <p className="dsPageSectionSub">Portal button styles used across facilitator and family panels.</p>
          <div className="dsPageRow">
            <button type="button" className="dsBtnPrimary">
              Primary
            </button>
            <button type="button" className="dsBtnSecondary">
              Secondary
            </button>
            <button type="button" className="dsBtnGold">
              Gold CTA
            </button>
            <button type="button" className="dsBtnGhost">
              Ghost
            </button>
            <button type="button" className="dsBtnPrimary" disabled>
              Disabled
            </button>
            <button type="button" className="dsBtnDanger">
              Danger
            </button>
            <button type="button" className="pilot-rosterAddBtn">
              Facilitator Add
            </button>
            <button type="button" className="pilot-drawerBtnPrimary">
              Drawer Primary
            </button>
          </div>
        </section>

        <section id="cards" className="dsPageSection">
          <h2 className="dsPageSectionTitle">3. Cards</h2>
          <div className="dsPageGrid dsPageGrid--2">
            <MetricCard label="Students enrolled" value="24" helperText="Active program" accent />
            <MarketingShowcaseCard
              title="Student Gallery"
              description="Collect student drawings, coloring pages, and reflections."
              imageSrc="/images/characters/caiden_photo_icon_game.webp"
              actions={[{ label: 'Upload Artwork' }, { label: 'Learn more', variant: 'ghost' }]}
            />
            <CollapsibleCard title="Program Access Codes" storageKey="ds-demo-collapsed-expanded" defaultCollapsed={false}>
              <CopyableCompactValue value="DEMO-FAC-01" type="code" truncateMiddle />
            </CollapsibleCard>
            <CollapsibleCard title="Collapsed example" storageKey="ds-demo-collapsed-closed" defaultCollapsed>
              <p className="dsPageNote">Hidden until expanded.</p>
            </CollapsibleCard>
            <EmptyState
              title="No students yet"
              description="Add your first student from the Roster tab to get started."
              imageSrc="/images/icons/B4_Chat_Icon.webp"
              action={{ label: 'View roster guide' }}
            />
          </div>
        </section>

        <section id="drawers" className="dsPageSection">
          <h2 className="dsPageSectionTitle">4. Drawers / Panels</h2>
          <div className="dsPageRow">
            <button type="button" className="dsBtnSecondary" onClick={() => setStandardDrawerOpen(true)}>
              Open standard drawer
            </button>
            <button type="button" className="dsBtnSecondary" onClick={() => setLargeDrawerOpen(true)}>
              Open large drawer
            </button>
            <button type="button" className="dsBtnSecondary" onClick={() => setStudentDrawerOpen(true)}>
              Open student detail drawer
            </button>
            <button type="button" className="dsBtnSecondary" onClick={() => setFacilitatorGoalsOpen(true)}>
              Facilitator goals drawer
            </button>
            <button type="button" className="dsBtnSecondary" onClick={() => setFamilyGoalsOpen(true)}>
              Family goals drawer
            </button>
          </div>

          <SlideOutDrawer
            open={standardDrawerOpen}
            onClose={() => setStandardDrawerOpen(false)}
            titleId="ds-standard-drawer"
            className="pilot-drawer"
            header={
              <div className="pilot-drawerHead">
                <h2 id="ds-standard-drawer" className="pilot-drawerTitle">
                  Standard drawer
                </h2>
                <button type="button" className="pilot-drawerClose" onClick={() => setStandardDrawerOpen(false)}>
                  ×
                </button>
              </div>
            }
            body={<p>Standard width: clamp(420px, 38vw, 640px). Escape and backdrop click close.</p>}
          />

          <SlideOutDrawer
            open={largeDrawerOpen}
            onClose={() => setLargeDrawerOpen(false)}
            size="large"
            titleId="ds-large-drawer"
            className="pilot-drawer"
            header={
              <div className="pilot-drawerHead">
                <h2 id="ds-large-drawer" className="pilot-drawerTitle">
                  Large drawer
                </h2>
                <button type="button" className="pilot-drawerClose" onClick={() => setLargeDrawerOpen(false)}>
                  ×
                </button>
              </div>
            }
            body={<p>Large width: clamp(720px, 54vw, 960px).</p>}
          />

          <PilotStudentDetailDrawer
            open={studentDrawerOpen}
            participantId={studentDrawerOpen ? 'demo-student-001' : null}
            onClose={() => setStudentDrawerOpen(false)}
            participants={DEMO_PARTICIPANTS}
            familyLinks={DEMO_FAMILY_LINKS}
            assessmentResults={DEMO_ASSESSMENTS}
            moduleResults={DEMO_MODULES}
            programCode="DEMO-PROGRAM"
          />

          <GoalsOnboardingDrawer
            open={facilitatorGoalsOpen}
            onClose={() => setFacilitatorGoalsOpen(false)}
            portalType="facilitator"
            programCode="DEMO-PROGRAM"
            onSave={async (_selected) => {
              showToast('Demo only — goals not saved.', { variant: 'info', source: 'system' });
              setFacilitatorGoalsOpen(false);
            }}
            onRemindLater={noopAsync}
            onSkip={noopAsync}
          />

          <GoalsOnboardingDrawer
            open={familyGoalsOpen}
            onClose={() => setFamilyGoalsOpen(false)}
            portalType="family"
            programCode="DEMO-FAMILY"
            onSave={async (_selected) => {
              showToast('Demo only — goals not saved.', { variant: 'info', source: 'system' });
              setFamilyGoalsOpen(false);
            }}
            onRemindLater={noopAsync}
            onSkip={noopAsync}
          />
        </section>

        <section id="b4-insights" className="dsPageSection">
          <h2 className="dsPageSectionTitle">B-4 Insights Drawer</h2>
          <p className="dsPageSectionSub">
            Editorial interpretation drawer for dashboard metrics. Use when a user clicks a progress card
            and needs meaning + next steps. Do not use for settings, forms, admin editing, or chat.
          </p>
          <div className="dsPageRow">
            <button type="button" className="dsBtnSecondary" onClick={() => setB4InsightsOpen(true)}>
              Open B-4 Insights drawer
            </button>
          </div>
          <B4InsightsDrawer
            isOpen={b4InsightsOpen}
            onClose={() => setB4InsightsOpen(false)}
            portalType="family"
            title="Justice's Progress Snapshot"
            eyebrow="B-4 Insights"
            childName="Justice"
            programName="Blue Ribbon Results Academy"
            avatarImage={B4_AVATAR_SRC}
            summary="Justice has completed 2 of 12 modules and finished the B-4 Check-In. The next best step is setting family goals so B-4 can personalize activities."
            insights={[
              {
                id: 'progress',
                label: 'Recent progress',
                detail: 'Momentum is building across weekly adventures.',
                tone: 'progress',
              },
              {
                id: 'goals',
                label: 'Family goals not set',
                detail: 'Goals help B-4 recommend better activities.',
                tone: 'setup',
              },
            ]}
            recommendations={[
              'Continue weekly adventures to grow overall progress.',
              'Set family goals to personalize recommendations.',
            ]}
            nextActions={[
              {
                id: 'goals',
                label: 'Set Family Goals',
                href: familyPortalPath('settings', '/family-hub'),
                variant: 'primary',
              },
            ]}
            metrics={[
              { label: 'Overall progress', value: '24%' },
              { label: 'Baseline status', value: 'Complete' },
              { label: 'Modules completed', value: '2 of 12' },
              { label: 'Family goals', value: 'Not set yet' },
            ]}
          />
        </section>

        <section id="toasts" className="dsPageSection">
          <h2 className="dsPageSectionTitle">5. Toasts</h2>
          <p className="dsPageSectionSub">B-4 branded toasts appear bottom-right in live portals.</p>
          <div className="dsPageRow">
            <button
              type="button"
              className="dsBtnSecondary"
              onClick={() => showToast('Nice — your program goals are saved.', 'success')}
            >
              Success
            </button>
            <button
              type="button"
              className="dsBtnSecondary"
              onClick={() => showToast("Okay — I'll remind you later.", 'info')}
            >
              Info
            </button>
            <button
              type="button"
              className="dsBtnSecondary"
              onClick={() => showToast('Gallery settings need a quick review.', 'warning')}
            >
              Warning
            </button>
            <button
              type="button"
              className="dsBtnSecondary"
              onClick={() => showToast('Upload failed — try again.', 'error')}
            >
              Error
            </button>
            <button
              type="button"
              className="dsBtnGhost"
              onClick={() => showToast('System notice', { variant: 'info', source: 'system' })}
            >
              System variant
            </button>
          </div>
        </section>

        <section id="copy" className="dsPageSection">
          <h2 className="dsPageSectionTitle">6. Copyable Values</h2>
          <div className="dsPageRow">
            <CopyableCompactValue value="parent@example.com" type="email" />
            <CopyableCompactValue value="(555) 010-2000" type="phone" />
            <CopyableCompactValue value="FAM-DEMO-ACCESS-01" type="code" truncateMiddle />
            <CopyableCompactValue
              value="long-text-value-for-truncation-demo@example.com"
              type="text"
              truncateMiddle
            />
          </div>
        </section>

        <section id="status" className="dsPageSection">
          <h2 className="dsPageSectionTitle">7. Status Chips</h2>
          <div className="dsPageRow">
            <StatusChip label="Active" variant="active" />
            <StatusChip label="Not Started" variant="not-started" />
            <StatusChip label="In Progress" variant="in-progress" />
            <StatusChip label="Baseline Complete" variant="baseline-complete" />
            <StatusChip label="Certificate Ready" variant="certificate-ready" />
            <StatusChip label="Pending Review" variant="pending-review" />
            <StatusChip label="Approved" variant="approved" />
            <StatusChip label="Rejected" variant="rejected" />
          </div>
        </section>

        <section id="tables" className="dsPageSection">
          <h2 className="dsPageSectionTitle">8. Tables / Lists</h2>
          <div className="dsPageGrid dsPageGrid--2">
            <div>
              <h3 className="dsPageSectionSub">Roster row sample</h3>
              <PilotAdminStudentTable rows={DEMO_ROSTER_ROWS.slice(0, 1)} variant="roster" />
            </div>
            <div>
              <h3 className="dsPageSectionSub">Student Data row sample</h3>
              <PilotAdminStudentTable rows={DEMO_ROSTER_ROWS.slice(0, 1)} variant="settings" />
            </div>
          </div>
          <h3 className="dsPageSectionSub">Module completion rows</h3>
          <table className="dsDemoTable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Module</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_MODULE_ROWS.map((row) => (
                <tr key={`${row.student}-${row.module}`}>
                  <td>{row.student}</td>
                  <td>{row.module}</td>
                  <td>{row.score}</td>
                  <td>
                    <StatusChip
                      label={row.status}
                      variant={row.status === 'Complete' ? 'complete' : 'not-started'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="progress" className="dsPageSection">
          <h2 className="dsPageSectionTitle">9. Progress / Results</h2>
          <div className="dsPageGrid dsPageGrid--2">
            <div>
              <h3 className="dsPageSectionSub">BaselineOverviewBars</h3>
              <BaselineOverviewBars rows={DEMO_BASELINE_ROWS} />
            </div>
            <div>
              <h3 className="dsPageSectionSub">Program Health summary</h3>
              <div className="dsPageGrid dsPageGrid--2">
                <MetricCard label="Program Health" value="68%" helperText="Participation rate" accent />
                <MetricCard label="Baseline Completion" value="12" helperText="of 18 students" />
              </div>
            </div>
          </div>
          <div className="dsPageGrid dsPageGrid--2">
            <PilotNeedsAttentionCard counts={DEMO_NEEDS_ATTENTION} />
            <div>
              <h3 className="dsPageSectionSub">Recent Activity feed</h3>
              <ul className="dsActivityList">
                {DEMO_RECENT_ACTIVITY.map((item) => (
                  <li key={item} className="dsActivityItem">
                    <span className="dsActivityDot" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="gallery" className="dsPageSection">
          <h2 className="dsPageSectionTitle">10. Gallery Components</h2>
          <div className="dsPageGrid dsPageGrid--2">
            <MarketingShowcaseCard
              title="Share Your Child's Creativity"
              description="Upload coloring pages, reflections, and student wins."
              imageSrc="/images/characters/caiden_photo_icon_game.webp"
              actions={[{ label: 'Upload Artwork' }]}
            />
            <FeaturedStudentWorkCard item={DEMO_GALLERY_ITEM} />
            <EmptyState
              title="Program Gallery"
              description="No approved artwork yet. Check back after facilitator review."
            />
            <MetricCard
              label="Pending Review"
              value={String(3)}
              helperText="Awaiting facilitator approval"
              accent
            />
            <FeaturedStudentWorkCard item={DEMO_PENDING_GALLERY_ITEM} />
          </div>
        </section>

        <section id="b4" className="dsPageSection">
          <h2 className="dsPageSectionTitle">11. B-4 Assistant</h2>
          <p className="dsPageSectionSub">
            <code>B4Assistant</code> wraps the deferred <code>B4ChatWidget</code> launcher + drawer.
            Facilitator, Family, and Kid portals mount it from <code>AppShell</code>. Family mode
            defaults to the Family tab with parent-friendly prompts and deep links to downloads,
            progress, goals, gallery, and certificates.
          </p>
          <ul className="dsPageList">
            <li>Desktop: fixed bottom-right, no dim overlay until mobile sheet opens.</li>
            <li>Mobile: safe-area launcher; toasts stack above the B-4 icon (z-index 2500 vs 2050).</li>
          </ul>
          <div className="dsB4Mock">
            <div>
              <p className="dsShellPreviewLabel">Closed launcher</p>
              <div className="dsB4LauncherMock">
                <img src="/images/icons/B4_Chat_Icon.webp" alt="" aria-hidden="true" />
                Ask B-4
              </div>
            </div>
            <div className="dsB4PanelMock">
              <div className="dsB4PanelMockHead">
                <img
                  src="/images/icons/B4_Chat_Icon.webp"
                  alt=""
                  className="dsB4PanelMockAvatar"
                  aria-hidden="true"
                />
                <div>
                  <p className="dsB4PanelMockTitle">Ask B-4</p>
                  <p className="dsB4PanelMockSub">Open assistant state (mock)</p>
                </div>
              </div>
              <div className="dsB4Chips">
                {ASK_B4_STARTER_PROMPTS.family.map((prompt) => (
                  <span key={prompt.text} className="dsB4Chip">
                    {prompt.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="dsPageNote">
            Deep link example:{' '}
            <Link to={familyPortalPath('gallery')}>{familyPortalPath('gallery')}</Link>
          </p>
        </section>

        <section id="goals" className="dsPageSection">
          <h2 className="dsPageSectionTitle">12. Goals Onboarding Drawer</h2>
          <p className="dsPageSectionSub">
            <code>GoalsOnboardingDrawer</code> auto-opens at most once per day per portal/program/user.
            Dismissal persists to Supabase <code>program_goals.dismissed_until</code> when available,
            with localStorage fallback key{' '}
            <code>focusFlame:goalsDrawer:{'{portal}'}:{'{program_code}'}:{'{email}'}</code>.
          </p>
          <ul className="dsPageList">
            <li>
              <strong>Auto-open first visit</strong> — after ~5–7s if no goals saved and not dismissed.
            </li>
            <li>
              <strong>Dismissed state</strong> — X, outside click, Escape, or Remind Me Later → 24h;
              toast confirms manual reopen path.
            </li>
            <li>
              <strong>Skip for Now</strong> — dismissed for 7 days.
            </li>
            <li>
              <strong>Completed state</strong> — Save Goals sets <code>completed_at</code>; no further
              auto-open.
            </li>
            <li>
              <strong>Manual reopen</strong> — Family Goals / Program Goals header button always opens
              the drawer.
            </li>
          </ul>
          <div className="dsPageRow">
            <button type="button" className="dsBtnGold" onClick={() => setFacilitatorGoalsOpen(true)}>
              Facilitator variant (manual)
            </button>
            <button type="button" className="dsBtnGold" onClick={() => setFamilyGoalsOpen(true)}>
              Family variant (manual)
            </button>
          </div>
        </section>

        <GameLearningDesignSystemSection />
        <GameUIPatternsSection />
        <InteractiveModuleSystemSection />
        <ContentClassificationSection />
        <FamilyPortalDesignSystemSection />
      </main>
    </>
  );
}
