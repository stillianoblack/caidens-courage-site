import fs from 'fs';
import path from 'path';

function source(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8');
}

describe('camp child protected data paths', () => {
  test('facilitator launch uses the server-mediated session endpoint', () => {
    const launch = source('src/lib/facilitatorKidPlayLaunch.ts');
    expect(launch).toContain('launchCampCompatibilityChildSession');
    expect(launch).not.toContain('findActiveKidPlaySessionForChild');
    expect(launch).not.toContain('createKidPlaySession');
    expect(launch).not.toContain("from('kid_play_sessions')");
  });

  test('camp session hydration, activity, and ending use the protected endpoint', () => {
    const service = source('src/lib/kidPlaySessionService.ts');
    expect(service).toContain('getCampCompatibilityChildSession');
    expect(service).toContain('updateCampCompatibilityChildSession');
    expect(service).toContain('endCampCompatibilityChildSession');
    const layout = source('src/pages/KidPlaySessionLayout.tsx');
    expect(layout).toContain("row.session_source === 'facilitator_roster_launch'");
    expect(layout).toContain('serverHydratedSession');
  });

  test('facilitator participant directory is server-mediated before session launch', () => {
    const directory = source('src/lib/pilotParticipantDirectory.ts');
    expect(directory).toContain('getCampCompatibilityParticipantDirectory');
    expect(directory).toContain('hasCampCompatibilitySession');
    const roster = source('src/hooks/usePilotRosterData.ts');
    expect(roster).toContain('hasCampCompatibilitySession()');
  });

  test('server validates program, facilitator proof, participant membership, and session scope', () => {
    const helper = source('netlify/functions/_lib/campCompatibilityAuth.js');
    const sessionHelper = source('netlify/functions/_lib/facilitatorSession.js');
    expect(helper).toContain('readFacilitatorSession');
    expect(helper).toContain('authenticated.program.id !== programId');
    expect(helper).toContain('authenticated.program.program_code !== programCode');
    expect(helper).not.toContain("['x-camp-access-code']");
    expect(sessionHelper).toContain("from('facilitator_compatibility_sessions')");
    expect(sessionHelper).toContain(".eq('token_hash', hashToken(token))");
    expect(sessionHelper).toContain(".eq('program_code', session.program_code)");
    expect(helper).toContain("data.role !== 'student'");
    expect(helper).toContain('data.program_code !== programCode');
    expect(helper).toContain(".eq('organization_id', program.id)");
  });
});
