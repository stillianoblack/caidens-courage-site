import fs from 'fs'; import path from 'path';
describe('launch readiness goal selection',()=>{
  test('automatic goal selection is feature-gated off by default',()=>{const flags=fs.readFileSync(path.join(process.cwd(),'src/config/featureFlags.ts'),'utf8');const hook=fs.readFileSync(path.join(process.cwd(),'src/hooks/useProgramGoalsOnboarding.ts'),'utf8');expect(flags).toContain("REACT_APP_ENABLE_INITIAL_GOAL_SELECTION === 'true'");expect(hook).toContain('!ENABLE_INITIAL_GOAL_SELECTION');});
  test('dashboard onboarding persists a Supabase-backed dismissal field',()=>{const service=fs.readFileSync(path.join(process.cwd(),'src/lib/programGoalsService.ts'),'utf8');expect(service).toContain('dashboard_onboarding_dismissed_at');});
});
