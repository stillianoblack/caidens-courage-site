# Legacy browser data-access debt — non-blocking for the narrow release

Status: documented 2026-07-16. This report applies only to unchanged legacy paths. It does not approve new anonymous access, policy weakening, or new direct browser writes.

## Release boundary

The changed independent-family paths use validated Netlify functions for signup, child list/create/grade, child-session launch and baseline, participant progress, B-4 preference/onboarding, and Focus Flame module/attempt completion. Participant-scoped B-4 Flight state remains local to the selected participant. The narrow release does not change production RLS.

Changed files that still contain direct Supabase calls were reviewed at branch level:

- `adventureWeekProgress.ts`, `b4CheckInStatus.ts`, `getCourageInTheDarkProgress.ts`, and `participantGradeService.ts` use functions for compatibility-family sessions; their direct calls are legacy non-family fallbacks.
- `assessmentResultsService.ts` uses `family-child-session` for a compatibility-family baseline; its direct calls are legacy non-family paths.
- `pilotProgramService.ts` uses `pilot-family-signup` for independent-family signup; its direct calls serve older program paths.
- `pilotTrackingService.ts` remains the shared legacy client, but compatibility-family Focus Flame completion now returns before it and uses `family-child-progress`.
- `completeMissionWithSupabase.ts` and `programGoalsService.ts` are excluded unrelated work.

No changed release flow was found to perform a protected direct browser operation after the family completion correction.

## Unchanged debt inventory

The following unchanged application paths contain browser Supabase access and require a future, separately scoped policy/API transition:

- `src/hooks/useFocusCoinWallet.ts`
- `src/lib/adminEmergencyAddStudentService.ts`
- `src/lib/adminPilotCleanupService.ts`
- `src/lib/adventureModuleService.ts`
- `src/lib/adventureMonthService.ts`
- `src/lib/campChildOnboardingService.ts`
- `src/lib/characterDiscoveryService.ts`
- `src/lib/childInventoryEarnedState.ts`
- `src/lib/childProgressStatus.ts`
- `src/lib/childRewardCompletionSnapshot.ts`
- `src/lib/familyChildGoalsService.ts`
- `src/lib/familyClaimByCodeService.ts`
- `src/lib/familyDashboardDataService.ts`
- `src/lib/familyPlayerProgressDisplay.ts`
- `src/lib/familyPortalLinkAudit.ts`
- `src/lib/familyProgramDisplayNameService.ts`
- `src/lib/familyResultsService.ts`
- `src/lib/galleryProgramSettings.ts`
- `src/lib/inviteParentForStudent.ts`
- `src/lib/kidPlayReturnSessionVerify.ts`
- `src/lib/kitParentEmails.ts`
- `src/lib/missionRewardClaimService.ts`
- `src/lib/monthlyChallengeProgress.ts`
- `src/lib/parentChildLinkFromCampService.ts`
- `src/lib/parentClaimFamilyPortalService.ts`
- `src/lib/participantDebug.ts`
- `src/lib/participantQuestService.ts`
- `src/lib/participantReassignmentService.ts`
- `src/lib/participantUiState.ts`
- `src/lib/participantWeekGradeService.ts`
- `src/lib/pilotProgramAdminScale.ts`
- `src/lib/pilotWaitlistService.ts`
- `src/lib/playerInventoryModel.ts`
- `src/lib/portalAccessResolve.ts`
- `src/lib/pushSubscriptionService.ts`
- `src/lib/questionAttemptService.ts`
- `src/lib/rewardClaimService.ts`
- `src/lib/saveCampAchievementScreenshot.ts`
- `src/lib/studentFamilyLinkService.ts`
- `src/lib/studentGalleryService.ts`
- `src/lib/studentPinService.ts`

## Future remediation rule

Inventory the active production callers, add server-mediated ownership checks, migrate one user journey at a time, test anonymous and cross-family denial, then tighten only the policies whose browser dependency has been removed. This debt is non-blocking for the narrow release because these paths and their policies are unchanged.
