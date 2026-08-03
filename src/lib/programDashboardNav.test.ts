import { PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { PROGRAM_SIDEBAR_NAV } from '../data/pilotDashboardContent';
import { resolveProgramDashboardTab } from './programDashboardNav';

describe('facilitator navigation reconciliation', () => {
  it('exposes only the approved primary navigation in order', () => {
    expect(PROGRAM_SIDEBAR_NAV.map(({ label }) => label)).toEqual([
      'Headquarters',
      'Explorers',
      'Library',
      'Assessments',
      'Training + Results',
      'Student Gallery',
    ]);
  });

  it('keeps hidden and legacy routes resolvable', () => {
    expect(resolveProgramDashboardTab(`${PROGRAM_DASHBOARD_PATH}/weekly-modules`)).toBe('weekly-modules');
    expect(resolveProgramDashboardTab(`${PROGRAM_DASHBOARD_PATH}/results`)).toBe('results');
    expect(resolveProgramDashboardTab(`${PROGRAM_DASHBOARD_PATH}/certificates`)).toBe('certificates');
  });
});
