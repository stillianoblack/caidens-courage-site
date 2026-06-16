export function isFamilyPortalInventoryPath(pathname: string): boolean {
  return /\/inventory\/?$/.test(pathname);
}
