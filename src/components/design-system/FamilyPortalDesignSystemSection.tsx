import React, { useState } from 'react';
import {
  DEMO_FAMILY_CHILD_SUMMARY,
  DEMO_FAMILY_CHILD_SUMMARY_SECOND,
  DEMO_FAMILY_LINKS,
  DEMO_FAMILY_RECENT_ACTIVITY,
  DEMO_MODULES,
} from '../../data/designSystemDemoData';
import {
  formatFamilyRelativeActivityDate,
  resolveChildDisplayInitials,
  resolveChildModuleCounts,
  resolveFamilyChildAvatarSrc,
} from '../../lib/familyChildSummaryCard';
import FamilyB4QuickActions from '../family-portal/FamilyB4QuickActions';
import FamilyCertificatePreviewCard from '../family-portal/FamilyCertificatePreviewCard';
import FamilyChildProgressDrawer from '../family-portal/FamilyChildProgressDrawer';
import FamilyChildSummaryCard from '../family-portal/FamilyChildSummaryCard';
import FamilyGoalsSummaryCard from '../family-portal/FamilyGoalsSummaryCard';
import FamilyRecommendedNextCard from '../family-portal/FamilyRecommendedNextCard';
import {
  CollapsibleCard,
  CopyableCompactValue,
  GoalsOnboardingDrawer,
  MarketingShowcaseCard,
  RecentActivityFeed,
} from '../portal-design-system';
import { useToast } from '../portal-design-system/ToastProvider';
import { buildFamilyOverviewB4QuickActions } from '../../lib/familyOverviewRecommendations';
import { familyPortalPath } from '../../lib/familyPortalPaths';

const noopAsync = async () => undefined;

const DEMO_RECOMMENDATION = {
  headline: 'Keep the momentum going',
  body: 'Alex recently finished Week 1 — Focus Moves. Try the next recommended activity together.',
  href: familyPortalPath('continue-learning'),
  cta: 'Start Activity',
};

export default function FamilyPortalDesignSystemSection() {
  const { showToast } = useToast();
  const [familyGoalsOpen, setFamilyGoalsOpen] = useState(false);
  const [childDrawerOpen, setChildDrawerOpen] = useState(false);

  const quickActions = buildFamilyOverviewB4QuickActions({
    overviewPath: familyPortalPath(''),
    continueLearningPath: familyPortalPath('continue-learning'),
    downloadsPath: familyPortalPath('downloads'),
  });

  return (
    <section id="family-portal" className="dsPageSection">
      <h2 className="dsPageSectionTitle">15. Family Portal Components</h2>
      <p className="dsPageSectionSub">
        Reusable Family Portal patterns — child summary card, access codes, activity timeline,
        gallery marketing, child drawer, goals summary, recommendations, certificates, and B-4
        quick actions. Mock data only.
      </p>

      <h3 className="dsPageSectionSub">Family child summary card</h3>
      <p className="dsPageSectionSub">
        Reassurance strip at the top of Family Overview — answers &ldquo;Is my child connected and how
        are they doing?&rdquo; before metrics.
      </p>

      <h4 className="dsPageSectionSub">Empty state</h4>
      <FamilyChildSummaryCard
        childName=""
        programName=""
        baselineStatus="Not Started"
        modulesCompleted={0}
        modulesTotal={0}
        lastActivityLabel=""
        avatarInitials="?"
        previewEmpty
      />

      <h4 className="dsPageSectionSub">Connected child</h4>
      <FamilyChildSummaryCard
        childName={DEMO_FAMILY_CHILD_SUMMARY.displayName}
        programName="Blue Ribbon Results Academy"
        baselineStatus={DEMO_FAMILY_CHILD_SUMMARY.baselineStatus}
        modulesCompleted={
          resolveChildModuleCounts(
            DEMO_FAMILY_CHILD_SUMMARY.participantId,
            DEMO_MODULES,
          ).completed
        }
        modulesTotal={
          resolveChildModuleCounts(
            DEMO_FAMILY_CHILD_SUMMARY.participantId,
            DEMO_MODULES,
          ).total
        }
        lastActivityLabel={formatFamilyRelativeActivityDate(DEMO_FAMILY_CHILD_SUMMARY.lastActivityAt)}
        avatarSrc={resolveFamilyChildAvatarSrc({
          participantId: DEMO_FAMILY_CHILD_SUMMARY.participantId,
          moduleResults: DEMO_MODULES,
        })}
        avatarInitials={resolveChildDisplayInitials(DEMO_FAMILY_CHILD_SUMMARY.displayName)}
        onViewProgress={() => setChildDrawerOpen(true)}
      />

      <h4 className="dsPageSectionSub">Multiple children (switcher ready)</h4>
      <FamilyChildSummaryCard
        childName={DEMO_FAMILY_CHILD_SUMMARY.displayName}
        programName="Blue Ribbon Results Academy"
        baselineStatus={DEMO_FAMILY_CHILD_SUMMARY.baselineStatus}
        modulesCompleted={
          resolveChildModuleCounts(
            DEMO_FAMILY_CHILD_SUMMARY.participantId,
            DEMO_MODULES,
          ).completed
        }
        modulesTotal={
          resolveChildModuleCounts(
            DEMO_FAMILY_CHILD_SUMMARY.participantId,
            DEMO_MODULES,
          ).total
        }
        lastActivityLabel={formatFamilyRelativeActivityDate(DEMO_FAMILY_CHILD_SUMMARY.lastActivityAt)}
        avatarSrc={resolveFamilyChildAvatarSrc({
          participantId: DEMO_FAMILY_CHILD_SUMMARY.participantId,
          moduleResults: DEMO_MODULES,
        })}
        avatarInitials={resolveChildDisplayInitials(DEMO_FAMILY_CHILD_SUMMARY.displayName)}
        childOptions={[
          {
            participantId: DEMO_FAMILY_CHILD_SUMMARY.participantId!,
            displayName: DEMO_FAMILY_CHILD_SUMMARY.displayName,
          },
          {
            participantId: DEMO_FAMILY_CHILD_SUMMARY_SECOND.participantId!,
            displayName: DEMO_FAMILY_CHILD_SUMMARY_SECOND.displayName,
          },
        ]}
        activeParticipantId={DEMO_FAMILY_CHILD_SUMMARY.participantId}
        onSelectChild={() => undefined}
        onViewProgress={() => setChildDrawerOpen(true)}
      />

      <h3 className="dsPageSectionSub">Family access collapsible card</h3>
      <CollapsibleCard
        title="Family Access"
        defaultCollapsed
        collapsedSummary="Codes available when needed."
      >
        <div className="family-accessCodeRows">
          <div className="family-accessCodeRowItem">
            <span className="family-accessCodeRowLabel">Family Access Code</span>
            <CopyableCompactValue value="FAM-DEMO-01" type="code" label="Family Code" truncateMiddle />
          </div>
          <div className="family-accessCodeRowItem">
            <span className="family-accessCodeRowLabel">Linked Camp Code</span>
            <CopyableCompactValue value="DEMO-PROGRAM" type="code" label="Camp Code" truncateMiddle />
          </div>
          <div className="family-accessCodeRowItem">
            <span className="family-accessCodeRowLabel">Child / Student Access Code</span>
            <CopyableCompactValue value="DEMO-PROGRAM" type="code" label="Student Code" truncateMiddle />
          </div>
        </div>
      </CollapsibleCard>

      <h3 className="dsPageSectionSub">Recent activity timeline</h3>
      <RecentActivityFeed items={DEMO_FAMILY_RECENT_ACTIVITY} />

      <h3 className="dsPageSectionSub">Gallery marketing card</h3>
      <MarketingShowcaseCard
        title="Share Your Child's Creativity"
        description="Upload coloring pages, reflections, and student wins. Submissions stay private to your program unless approved for community sharing."
        imageSrc="/images/gallery/B-4_Coloredpage.webp"
        imageAlt="Coloring page example"
        actions={[
          { label: 'Upload Artwork' },
          { label: 'Learn About Community Gallery', variant: 'ghost' },
        ]}
      />

      <h3 className="dsPageSectionSub">Family goals summary card</h3>
      <FamilyGoalsSummaryCard goals={['Improve Focus', 'Build Reading Confidence', 'Manage Big Feelings']} />

      <h3 className="dsPageSectionSub">Certificate preview card</h3>
      <div className="dsPageGrid dsPageGrid--2">
        <FamilyCertificatePreviewCard count={2} certificatesPath={familyPortalPath('certificates')} />
        <FamilyCertificatePreviewCard count={0} certificatesPath={familyPortalPath('certificates')} />
      </div>

      <h3 className="dsPageSectionSub">Recommended next activity card</h3>
      <FamilyRecommendedNextCard recommendation={DEMO_RECOMMENDATION} />

      <h3 className="dsPageSectionSub">Family B-4 quick actions</h3>
      <FamilyB4QuickActions actions={quickActions} onOpenChildDrawer={() => setChildDrawerOpen(true)} />

      <div className="dsPageRow">
        <button type="button" className="dsBtnGold" onClick={() => setFamilyGoalsOpen(true)}>
          Family goals drawer
        </button>
        <button type="button" className="dsBtnGold" onClick={() => setChildDrawerOpen(true)}>
          Child detail drawer
        </button>
      </div>

      <GoalsOnboardingDrawer
        open={familyGoalsOpen}
        onClose={() => setFamilyGoalsOpen(false)}
        portalType="family"
        programCode="FAM-DEMO-01"
        onSave={async () => {
          showToast('Demo only — goals not saved.', { variant: 'info', source: 'system' });
          setFamilyGoalsOpen(false);
        }}
        onRemindLater={noopAsync}
        onSkip={noopAsync}
      />

      <FamilyChildProgressDrawer
        open={childDrawerOpen}
        onClose={() => setChildDrawerOpen(false)}
        child={DEMO_FAMILY_CHILD_SUMMARY}
        goalsRecord={{
          program_code: 'FAM-DEMO-01',
          portal_type: 'family',
          selected_goals: ['Improve Focus', 'Build Reading Confidence', 'Manage Big Feelings'],
          completed_at: '2026-06-06T09:00:00.000Z',
        }}
        gallerySubmissionCount={2}
        certificateCount={1}
        campProgramCode="DEMO-PROGRAM"
        campProgramName="Demo Summer Camp"
        baselineScorePct={72}
        baselineRows={[
          { key: 'feelings', label: 'Feelings', pct: 72, tone: 'feelings', labelDetail: '3 of 4' },
          { key: 'reading', label: 'Reading', pct: 58, tone: 'reading', labelDetail: '2 of 4' },
        ]}
        familyLink={DEMO_FAMILY_LINKS[0]}
        parentGuardianName="Maria Rivera"
      />
    </section>
  );
}
