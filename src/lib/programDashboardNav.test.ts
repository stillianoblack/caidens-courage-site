import { PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { PROGRAM_SIDEBAR_NAV } from '../data/pilotDashboardContent';
import { resolveProgramDashboardTab } from './programDashboardNav';
import fs from 'fs';

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

  it('keeps facilitator hub content derived from the current URL', () => {
    const library = fs.readFileSync('src/components/pilot-dashboard/panels/PilotActivitiesPanel.tsx', 'utf8');
    const training = fs.readFileSync('src/components/pilot-dashboard/panels/PilotFacilitatorPanel.tsx', 'utf8');
    const gallery = fs.readFileSync('src/components/pilot-dashboard/panels/PilotGalleryPanel.tsx', 'utf8');

    expect(library).toContain('setCategory(requestedCategory);');
    expect(library).toContain('setCategory(next);');
    expect(training).toContain('setSection(requestedSection);');
    expect(training).toContain('setSection(next);');
    expect(gallery).toContain('setActiveTab(requestedTab);');
    expect(gallery).toContain('setActiveTab(tab);');
    expect(gallery).toContain('setSearchParams(nextParams);');
    expect(library).toContain("window.addEventListener('popstate', syncFromHistory);");
    expect(training).toContain("window.addEventListener('popstate', syncFromHistory);");
    expect(gallery).toContain("window.addEventListener('popstate', syncFromHistory);");
  });
});
