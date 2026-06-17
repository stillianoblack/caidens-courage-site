import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { readActivePortalRole } from '../../../config/portalContext';
import {
  readParentClaimContext,
  writeParentClaimContext,
} from '../../../config/parentClaimContext';
import { formatB4CheckInStatusLabel } from '../../../config/assessmentTypeConstants';
import {
  FAMILY_SETTINGS_PAGE,
  FAMILY_SETTINGS_TABS,
  type FamilySettingsTabId,
} from '../../../data/familySettingsContent';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useFamilyChildGoals } from '../../../hooks/useFamilyChildGoals';
import { useFamilyPortalShell } from '../../../hooks/useFamilyPortalShell';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import type { FamilyChildSummary } from '../../../lib/familyChildrenMetrics';
import { resolveFamilySettingsTab } from '../../../lib/familyPortalPaths';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import type { StudentFamilyLink } from '../../../lib/studentFamilyLinkService';
import { formatFamilyRelativeActivityDate } from '../../../lib/familyChildSummaryCard';
import AddChildForm from '../AddChildForm';
import FamilyChildGradeConfig from '../FamilyChildGradeConfig';
import ParticipantGradeMeta from '../../shared/ParticipantGradeMeta';
import '../../shared/participant-grade-meta.css';
import { hasCanonicalGradeLevel } from '../../../lib/participantGradeDisplay';
import FamilyChildGoalsChecklist from '../FamilyChildGoalsChecklist';
import FamilyParentClaimStatus from '../FamilyParentClaimStatus';
import FamilyUpgradePricingModal from '../FamilyUpgradePricingModal';
import SettingsCard from '../settings/SettingsCard';
import SettingsPageLayout from '../settings/SettingsPageLayout';
import FamilySettingsOverviewTab from '../settings/FamilySettingsOverviewTab';
import FamilyDisplayNameEditor from '../FamilyDisplayNameEditor';
import { CopyableCompactValue, StatusChip } from '../../portal-design-system';

function SettingsRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="family-settingsRow">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function resolveChildLink(
  child: FamilyChildSummary,
  familyLinks: StudentFamilyLink[],
): StudentFamilyLink | null {
  if (!child.participantId) return null;
  return familyLinks.find((link) => link.student_id === child.participantId) ?? null;
}

export default function FamilyProgramSettingsPanel() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const focusParam = searchParams.get('focus');
  const [activeTab, setActiveTab] = useState<FamilySettingsTabId>(resolveFamilySettingsTab(tabParam));

  const programCode = resolveTrackingProgramCode() ?? undefined;
  const {
    children,
    familyLinks,
    campProgramCode,
    campProgramName,
    claimStatus,
    claimRequired,
    loading,
    refresh,
    studentParticipants,
  } = useFamilyPortalShell(programCode);
  const canShowAddChild = !claimRequired;
  const activeProgram = readActivePilotProgram();
  const role = readActivePortalRole();
  const familyCode = activeProgram?.familyAccessCode?.trim() || '';
  const programCodeValue = activeProgram?.programCode?.trim() || programCode || '';
  const baselinePath = getPortalRoute('baseline-check', location.pathname);

  const selectableChildren = useMemo(
    () =>
      children
        .filter((child) => child.participantId)
        .map((child) => ({
          participantId: child.participantId!,
          displayName: child.displayName,
        })),
    [children],
  );
  const { activeChild, selectChild } = useActiveChild(selectableChildren);
  const activeSummary = children.find((child) => child.participantId === activeChild?.participantId);
  const { record: childGoalsRecord, refresh: refreshChildGoals } = useFamilyChildGoals(
    programCode ?? '',
    activeChild?.participantId,
    activeSummary?.displayName,
  );

  const [pricingOpen, setPricingOpen] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const addChildRef = useRef<HTMLDivElement | null>(null);
  const gradeFocusRef = useRef<HTMLDivElement | null>(null);
  const gradeFocusScrolledRef = useRef(false);

  const participantById = useMemo(
    () => new Map(studentParticipants.map((row) => [row.id, row])),
    [studentParticipants],
  );

  const parentClaim = readParentClaimContext();
  const parentLink = familyLinks[0];
  const [parentFirstName, setParentFirstName] = useState(
    parentLink?.parent_first_name?.trim() || '',
  );
  const [parentLastName, setParentLastName] = useState(
    parentClaim?.lastName?.trim() || parentLink?.parent_last_name?.trim() || '',
  );
  const [parentEmail, setParentEmail] = useState(
    parentClaim?.email?.trim() || parentLink?.parent_email?.trim() || '',
  );
  const [parentPhone, setParentPhone] = useState(
    parentClaim?.phone?.trim() || parentLink?.parent_phone?.trim() || '',
  );
  const [editingParent, setEditingParent] = useState(false);

  useEffect(() => {
    setActiveTab(resolveFamilySettingsTab(tabParam));
  }, [tabParam]);

  useEffect(() => {
    if (focusParam !== 'grade') {
      gradeFocusScrolledRef.current = false;
    }
  }, [focusParam]);

  useEffect(() => {
    if (activeTab !== 'children' || focusParam !== 'grade' || loading || gradeFocusScrolledRef.current) {
      return;
    }
    gradeFocusScrolledRef.current = true;
    requestAnimationFrame(() => {
      gradeFocusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [activeTab, focusParam, loading, children.length]);

  useEffect(() => {
    if (activeTab !== 'children' || focusParam !== 'add-child' || loading || !canShowAddChild) {
      return;
    }
    setShowAddChild(true);
    requestAnimationFrame(() => {
      addChildRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [activeTab, canShowAddChild, focusParam, loading]);

  const selectTab = useCallback(
    (next: FamilySettingsTabId) => {
      setActiveTab(next);
      const nextParams = new URLSearchParams(searchParams);
      if (next === 'overview') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', next);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const scrollToAddChild = () => {
    selectTab('children');
    setShowAddChild(true);
    requestAnimationFrame(() => {
      addChildRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSaveParent = () => {
    writeParentClaimContext({
      email: parentEmail.trim(),
      phone: parentPhone.trim() || undefined,
      lastName: parentLastName.trim() || undefined,
      confirmed: Boolean(parentEmail.trim() || parentPhone.trim()),
    });
    setEditingParent(false);
    void refresh();
  };

  const planLabel = activeProgram?.pricingTier === 'camp_pilot' ? 'Camp Pilot Family' : 'Family Portal';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <FamilyDisplayNameEditor
              programCode={programCodeValue}
              campProgramName={campProgramName}
              campProgramCode={campProgramCode}
              onSaved={() => void refresh()}
            />
            <FamilySettingsOverviewTab
              onAddChild={scrollToAddChild}
              onSetGoals={() => selectTab('family-goals')}
            />
          </>
        );

      case 'family-goals':
        return (
          <SettingsCard>
            {selectableChildren.length > 1 && activeSummary ? (
              <p className="family-settingsChildPickerLabel">
                Goals for <strong>{activeSummary.displayName}</strong>
              </p>
            ) : null}
            {childGoalsRecord?.goals?.length ? (
              <ul className="family-goalsSummaryChips" aria-label="Saved goals">
                {childGoalsRecord.goals.map((goal) => (
                  <li key={goal}>
                    <StatusChip label={goal} variant="default" />
                  </li>
                ))}
              </ul>
            ) : null}
            <FamilyChildGoalsChecklist
              programCode={programCode ?? ''}
              childId={activeChild?.participantId}
              childName={activeSummary?.displayName}
              initialRecord={childGoalsRecord}
              title="Family Goals"
              subtitle="Choose up to 3 goals so B-4 can recommend better activities."
              strengthsTitle="Child Strengths"
              onSaved={() => void refreshChildGoals()}
            />
          </SettingsCard>
        );

      case 'children':
        return (
          <SettingsCard
            title="Children"
            subtitle="Manage the children connected to this family portal."
          >
            {loading && children.length === 0 ? <p className="family-panelHelper">Loading children…</p> : null}
            {!loading && children.length === 0 ? (
              <p className="family-panelHelper">
                No child profiles yet. Add a child to get started with B-4 Check-In and activities.
              </p>
            ) : null}
            {children.length > 0 ? (
              <>
                <div
                  ref={gradeFocusRef}
                  id="family-child-grade-focus"
                  className="family-settingsGradeSection"
                >
                  <h3 className="family-settingsSubheading">Grade Level</h3>
                  <p className="family-panelHelper">
                    Select a grade for each child. B-4 uses this to recommend the right activities.
                  </p>
                  <div className="family-settingsGradeList">
                    {children.map((child) => {
                      if (!child.participantId) return null;
                      const participant = participantById.get(child.participantId);
                      return (
                        <FamilyChildGradeConfig
                          key={`grade-${child.key}`}
                          participantId={child.participantId}
                          displayName={child.displayName}
                          gradeLevel={participant?.grade_level}
                          allowStretchLevel={participant?.allow_stretch_level}
                          highlighted={
                            focusParam === 'grade' &&
                            !hasCanonicalGradeLevel(participant?.grade_level)
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                <h3 className="family-settingsSubheading">Child Profiles</h3>
                <ul className="family-settingsChildList">
                  {children.map((child) => {
                    const link = resolveChildLink(child, familyLinks);
                    const lastActivity = formatFamilyRelativeActivityDate(child.lastActivityAt);
                    const participant = child.participantId
                      ? participantById.get(child.participantId)
                      : undefined;
                    return (
                      <li key={child.key} className="family-settingsChildItem">
                        <div className="family-settingsChildMain">
                          <p className="family-settingsChildName">{child.displayName}</p>
                          {child.nickname && child.nickname !== child.displayName ? (
                            <p className="family-settingsChildMeta">Nickname: {child.nickname}</p>
                          ) : null}
                          <ParticipantGradeMeta
                            gradeLevel={participant?.grade_level}
                            gradeBand={participant?.grade_band}
                            allowStretch={Boolean(participant?.allow_stretch_level)}
                            variant="family"
                          />
                          <p className="family-settingsChildMeta">
                            {formatB4CheckInStatusLabel(child.b4CheckInStatus)}
                          </p>
                          {child.latestActivity ? (
                            <p className="family-settingsChildMeta">Latest: {child.latestActivity}</p>
                          ) : lastActivity ? (
                            <p className="family-settingsChildMeta">Last activity: {lastActivity}</p>
                          ) : null}
                          {child.progressLabel ? (
                            <p className="family-settingsChildMeta">Progress: {child.progressLabel}</p>
                          ) : null}
                          {link ? (
                            <p className="family-settingsChildMeta">
                              Parent/Guardian:{' '}
                              {link.parent_claimed ? 'Linked' : 'Pending confirmation'}
                            </p>
                          ) : null}
                        </div>
                        {child.participantId ? (
                          <button
                            type="button"
                            className="family-settingsGhostBtn"
                            onClick={() =>
                              selectChild({
                                participantId: child.participantId!,
                                displayName: child.displayName,
                              })
                            }
                          >
                            {activeChild?.participantId === child.participantId ? 'Selected' : 'Select'}
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}
            {canShowAddChild ? (
              <div className="family-settingsActions">
                <button
                  type="button"
                  className="family-settingsPrimaryBtn"
                  onClick={() => {
                    setShowAddChild(true);
                    requestAnimationFrame(() => {
                      addChildRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                  }}
                >
                  Add Child
                </button>
              </div>
            ) : null}
            {showAddChild && canShowAddChild ? (
              <div ref={addChildRef} className="family-settingsAddChild">
                <AddChildForm
                  routeToBaseline
                  baselinePath={baselinePath}
                  onAdded={() => {
                    void refresh();
                    setShowAddChild(false);
                  }}
                />
              </div>
            ) : null}
          </SettingsCard>
        );

      case 'parent-guardian':
        return (
          <SettingsCard
            title="Parent/Guardian Info"
            subtitle="Manage parent or guardian contact information connected to this portal."
          >
            <FamilyParentClaimStatus status={claimStatus} showDetail className="family-settingsClaimStatus" />
            {!editingParent ? (
              <dl className="family-settingsGrid">
                <SettingsRow
                  label="Parent/Guardian first name"
                  value={parentLink?.parent_first_name?.trim() || parentFirstName || '—'}
                />
                <SettingsRow
                  label="Parent/Guardian last name"
                  value={parentLastName || parentLink?.parent_last_name?.trim() || '—'}
                />
                <SettingsRow label="Email" value={parentEmail || '—'} />
                <SettingsRow label="Phone" value={parentPhone || '—'} />
              </dl>
            ) : (
              <form
                className="family-settingsParentForm"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSaveParent();
                }}
              >
                <label className="family-addChildField">
                  <span className="family-addChildLabel">Parent/Guardian first name</span>
                  <input
                    className="family-addChildInput"
                    value={parentFirstName}
                    onChange={(event) => setParentFirstName(event.target.value)}
                    autoComplete="given-name"
                  />
                </label>
                <label className="family-addChildField">
                  <span className="family-addChildLabel">Parent/Guardian last name</span>
                  <input
                    className="family-addChildInput"
                    value={parentLastName}
                    onChange={(event) => setParentLastName(event.target.value)}
                    autoComplete="family-name"
                  />
                </label>
                <label className="family-addChildField">
                  <span className="family-addChildLabel">Email</span>
                  <input
                    className="family-addChildInput"
                    type="email"
                    value={parentEmail}
                    onChange={(event) => setParentEmail(event.target.value)}
                    autoComplete="email"
                  />
                </label>
                <label className="family-addChildField">
                  <span className="family-addChildLabel">Phone</span>
                  <input
                    className="family-addChildInput"
                    type="tel"
                    value={parentPhone}
                    onChange={(event) => setParentPhone(event.target.value)}
                    autoComplete="tel"
                  />
                </label>
                <div className="family-settingsActions">
                  <button type="submit" className="family-settingsPrimaryBtn">
                    Save Parent/Guardian Info
                  </button>
                  <button
                    type="button"
                    className="family-settingsGhostBtn"
                    onClick={() => setEditingParent(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {!editingParent ? (
              <button
                type="button"
                className="family-settingsPrimaryBtn"
                onClick={() => setEditingParent(true)}
              >
                Update Parent/Guardian Info
              </button>
            ) : null}
            {claimRequired ? (
              <p className="family-panelHelper family-panelHelper--prominent" role="status">
                Confirm your parent or guardian email to connect linked child profiles.
              </p>
            ) : null}
          </SettingsCard>
        );

      case 'family-access':
        return (
          <SettingsCard
            title="Family Access"
            subtitle="Share this family code with trusted parents, guardians, tutors, or family members helping your child."
          >
            {role !== 'family' || !familyCode ? (
              <p className="family-panelHelper">Family access codes are not available for this session.</p>
            ) : (
              <div className="family-settingsCodes">
                <div className="family-settingsCodeRow">
                  <span className="family-settingsCodeLabel">Family Program Code</span>
                  <CopyableCompactValue
                    value={programCodeValue || '—'}
                    type="code"
                    label="Family Program Code"
                    truncateMiddle
                  />
                </div>
                <div className="family-settingsCodeRow">
                  <span className="family-settingsCodeLabel">Family Access Code</span>
                  <CopyableCompactValue
                    value={familyCode}
                    type="code"
                    label="Family Access Code"
                    truncateMiddle
                  />
                </div>
                {campProgramCode ? (
                  <div className="family-settingsCodeRow">
                    <span className="family-settingsCodeLabel">
                      Linked Camp Program{campProgramName ? ` · ${campProgramName}` : ''}
                    </span>
                    <CopyableCompactValue
                      value={campProgramCode}
                      type="code"
                      label="Linked Camp Program Code"
                      truncateMiddle
                    />
                  </div>
                ) : null}
              </div>
            )}
          </SettingsCard>
        );

      case 'notifications':
        return (
          <SettingsCard
            title="Notifications & Reminders"
            subtitle="B-4 daily reminders are coming soon."
          >
            <p className="family-settingsComingSoon">
              Coming soon — notification preferences are not available during the pilot.
            </p>
            <div className="family-settingsNotifications" aria-disabled="true">
              {[
                'Morning reminder',
                'After-school reminder',
                'Evening reminder',
                'Parent/Guardian completion updates',
              ].map((label) => (
                <label key={label} className="family-settingsToggleRow family-settingsToggleRow--disabled">
                  <input type="checkbox" disabled />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </SettingsCard>
        );

      case 'plan':
        return (
          <SettingsCard title="Plan" subtitle="Manage your family plan and premium access.">
            <dl className="family-settingsGrid">
              <SettingsRow label="Current plan" value={planLabel} />
            </dl>
            <div className="family-settingsActions">
              <button type="button" className="family-settingsPrimaryBtn" onClick={() => setPricingOpen(true)}>
                Upgrade Your Family Plan
              </button>
              <button type="button" className="family-settingsGhostBtn" onClick={() => setPricingOpen(true)}>
                View Plans
              </button>
            </div>
          </SettingsCard>
        );

      case 'privacy':
        return (
          <SettingsCard title="Privacy & Sharing">
            <p className="family-panelHelper">
              You control what your family shares. Child progress is only visible to linked
              parents/guardians and approved program staff.
            </p>
            <ul className="family-settingsPrivacyList">
              <li>Community Gallery opt-in (coming soon)</li>
              <li>Share progress with camp/school (coming soon)</li>
              <li>Data export (coming soon)</li>
            </ul>
          </SettingsCard>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SettingsPageLayout
        title={FAMILY_SETTINGS_PAGE.title}
        subtitle={FAMILY_SETTINGS_PAGE.subtitle}
        tabs={FAMILY_SETTINGS_TABS}
        activeTab={activeTab}
        onSelectTab={selectTab}
      >
        {renderTabContent()}
      </SettingsPageLayout>

      <FamilyUpgradePricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}
