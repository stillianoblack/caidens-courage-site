import fs from 'fs';
import path from 'path';

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Kid Play navigation performance contracts', () => {
  test('direct-loads shell changes and retains the selected Weekly Adventures query', () => {
    const layout = read('src/pages/KidPlaySessionLayout.tsx');
    const navigation = read('src/lib/kidShellNav.ts');

    expect(layout).toContain('<Outlet key={location.pathname} />');
    expect(layout).toContain('const navigateRef = useRef(navigate);');
    expect(layout).toContain('}, [kidPlaySessionId]);');
    expect(layout).toContain('route: location.pathname + location.search,');
    expect(layout).toContain('}, [location.pathname, location.search, session]);');
    expect(navigation).toContain('shouldUseSoftShellNavigation');
    expect(navigation).toContain('window.location.assign(href)');
  });

  test('retains successful module, month, and completion data for the session', () => {
    expect(read('src/hooks/useAdventureModules.ts')).toContain('moduleCache');
    expect(read('src/hooks/useAdventureModules.ts')).toContain('moduleRequests');
    expect(read('src/hooks/useAdventureMonths.ts')).toContain('monthCache');
    expect(read('src/hooks/useAdventureMonths.ts')).toContain('monthRequests');
    expect(read('src/hooks/useAdventureWeekCompletions.ts')).toContain('completionCache');
    expect(read('src/hooks/useAdventureWeekCompletions.ts')).toContain('completionRequests');
  });

  test('keeps cached Collections content visible during background refresh', () => {
    const inventory = read(
      'src/components/family-portal/panels/FamilyInventoryPanel.tsx',
    );

    expect(inventory).toContain('inventorySessionCache');
    expect(inventory).toContain('setLoading(!cached)');
    expect(inventory).toContain('Promise.all([');
  });
});
