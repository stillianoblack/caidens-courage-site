import type { PortalSearchResource } from '../data/portalSearchResources';

function resourceHaystack(item: PortalSearchResource): string {
  return [
    item.title,
    item.description,
    item.category,
    item.character,
    ...item.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function searchPortalResources(
  query: string,
  resources: PortalSearchResource[],
  limit = 8,
): PortalSearchResource[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const tokens = trimmed.split(/\s+/).filter(Boolean);

  return resources
    .filter((item) => tokens.every((token) => resourceHaystack(item).includes(token)))
    .slice(0, limit);
}
