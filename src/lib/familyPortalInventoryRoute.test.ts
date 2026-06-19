import { isFamilyPortalInventoryPath } from './familyPortalInventoryRoute';

describe('isFamilyPortalInventoryPath', () => {
  test('matches program family hub collections routes', () => {
    expect(isFamilyPortalInventoryPath('/family-hub/collections')).toBe(true);
    expect(isFamilyPortalInventoryPath('/family-hub/collections/')).toBe(true);
  });

  test('matches program family hub inventory alias', () => {
    expect(isFamilyPortalInventoryPath('/family-hub/inventory')).toBe(true);
    expect(isFamilyPortalInventoryPath('/family-hub/inventory/')).toBe(true);
  });

  test('matches legacy family portal inventory', () => {
    expect(isFamilyPortalInventoryPath('/portal/family/inventory')).toBe(true);
  });

  test('does not match nested collections routes', () => {
    expect(isFamilyPortalInventoryPath('/family-hub/collections/extra')).toBe(false);
  });
});
