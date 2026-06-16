import { isFamilyPortalInventoryPath } from './familyPortalInventoryRoute';

describe('isFamilyPortalInventoryPath', () => {
  test('matches program family hub inventory', () => {
    expect(isFamilyPortalInventoryPath('/family-hub/inventory')).toBe(true);
    expect(isFamilyPortalInventoryPath('/family-hub/inventory/')).toBe(true);
  });

  test('matches legacy family portal inventory', () => {
    expect(isFamilyPortalInventoryPath('/portal/family/inventory')).toBe(true);
  });

  test('does not match nested inventory routes', () => {
    expect(isFamilyPortalInventoryPath('/family-hub/inventory/extra')).toBe(false);
  });
});
