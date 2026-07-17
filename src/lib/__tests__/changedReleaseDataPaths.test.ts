import fs from 'fs';
import path from 'path';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('changed narrow-release data-path safety', () => {
  test('independent family browser clients use validated Netlify functions', () => {
    expect(read('src/lib/pilotProgramService.ts')).toContain("fetch('/.netlify/functions/pilot-family-signup'");
    expect(read('src/lib/familyPortalChildrenApi.ts')).toContain("fetch('/.netlify/functions/family-portal-children'");
    expect(read('src/lib/familyChildSessionApi.ts')).toContain('/.netlify/functions/family-child-session');
    expect(read('src/lib/familyChildProgressApi.ts')).toContain('/.netlify/functions/family-child-progress');
    expect(read('src/lib/b4VariantService.ts')).toContain('/.netlify/functions/portal-b4-variant');
  });

  test('family B-4 status and progress failures do not fall through to protected browser reads', () => {
    const status = read('src/lib/b4CheckInStatus.ts');
    expect(status).toMatch(/if \(participantId && hasFamilyCompatibilitySession\(\)\)[\s\S]*catch \{\s*return false;\s*\}/);

    const progress = read('src/lib/getCourageInTheDarkProgress.ts');
    const familyBranch = progress.slice(
      progress.indexOf('if (hasFamilyCompatibilitySession())'),
      progress.indexOf('const [progressResult, walletResult'),
    );
    expect(familyBranch).toContain('fetchFamilyCompatibilityChildProgressSnapshot');
    expect(familyBranch).not.toContain('.from(');
  });

  test('family mission completion uses the participant-scoped function route', () => {
    const completion = read('src/lib/recordInteractiveCompletion.ts');
    const familyBranch = completion.slice(
      completion.indexOf("if (tracking.role === 'student' && hasFamilyCompatibilitySession())"),
      completion.indexOf('const { participantId } = await resolveParticipantForTracking(tracking);'),
    );
    expect(familyBranch).toContain('saveFamilyCompatibilityModuleCompletion');
    expect(familyBranch).not.toContain('saveModuleResult(');
    expect(familyBranch).not.toContain('saveQuestionAttempts(');
  });

  test('B-4 Flight state remains participant-scoped and browser-local', () => {
    const flight = read('src/games/b4-focus-flight/B4FocusFlightPage.tsx');
    expect(flight).toContain('getParticipantB4FlightStorageKey');
    expect(flight).toContain('participantId');
    expect(flight).toContain('kidPlayShellNavigate(navigate, exitPath)');
    expect(flight).not.toContain('.from(');
  });
});
