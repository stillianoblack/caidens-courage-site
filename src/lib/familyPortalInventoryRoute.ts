export function isFamilyPortalInventoryPath(pathname: string): boolean {
  return /\/(inventory|collections)\/?$/.test(pathname);
}
