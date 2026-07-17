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

  test('server validates program, facilitator proof, participant membership, and session scope', () => {
    const helper = source('netlify/functions/_lib/campCompatibilityAuth.js');
    expect(helper).toContain(".eq('id', programId)");
    expect(helper).toContain(".eq('program_code', programCode)");
    expect(helper).toContain(".eq('facilitator_access_code', accessCode)");
    expect(helper).toContain("data.role !== 'student'");
    expect(helper).toContain('data.program_code !== programCode');
    expect(helper).toContain(".eq('organization_id', program.id)");
  });
});
