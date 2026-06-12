import type {
  AdventureTrailNode,
  AdventureTrailNodeView,
  TrailNodeState,
} from '../types/adventureTrail';

export function isTrailGameNodeComplete(
  node: AdventureTrailNode,
  completedModuleIds: Set<string>,
): boolean {
  if (!node.moduleId) return false;
  return completedModuleIds.has(node.moduleId);
}

export function resolveTrailNodeState(
  node: AdventureTrailNode,
  index: number,
  priorNodes: AdventureTrailNode[],
  completedModuleIds: Set<string>,
  gates: { weekLocked: boolean; baselineLocked: boolean },
): TrailNodeState {
  if (node.comingSoon) return 'coming_soon';
  if (gates.weekLocked || gates.baselineLocked) return 'locked';

  const previousReady =
    index === 0 ||
    priorNodes.slice(0, index).every((prior) => {
      if (prior.comingSoon) return true;
      if (!prior.moduleId) return true;
      return isTrailGameNodeComplete(prior, completedModuleIds);
    });

  if (!previousReady) return 'locked';

  if (node.moduleId && isTrailGameNodeComplete(node, completedModuleIds)) {
    return 'complete';
  }

  return 'available';
}

export function decorateTrailNodes(
  nodes: AdventureTrailNode[],
  completedModuleIds: Set<string>,
  gates: { weekLocked: boolean; baselineLocked: boolean },
): AdventureTrailNodeView[] {
  const decorated = nodes.map((node, index) => ({
    ...node,
    state: resolveTrailNodeState(node, index, nodes, completedModuleIds, gates),
    stepNumber: index + 1,
    side: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
  }));

  const firstAvailableIndex = decorated.findIndex(
    (node) => node.state === 'available' && !node.comingSoon,
  );
  if (firstAvailableIndex >= 0) {
    decorated[firstAvailableIndex] = {
      ...decorated[firstAvailableIndex],
      state: 'in_progress',
    };
  }

  return decorated;
}
