export function getMissionIntroHint(flags: {
  useVictoriaHeader?: boolean;
  useUncleTHeader?: boolean;
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
  useB4Header?: boolean;
}): string {
  if (flags.useVictoriaHeader) {
    return 'Read each reflection card, choose your answer, then tap Check.';
  }
  if (flags.useUncleTHeader) {
    return 'Read each coaching scenario, choose your answer, then tap Check.';
  }
  if (flags.useCaidenHeader) {
    return 'Read the scenario, choose the best answer, then tap Check.';
  }
  if (flags.useMirandaHeader) {
    return 'Read the clue, choose your answer, then tap Check.';
  }
  if (flags.useCharlieHeader) {
    return 'Read the trail moment, choose the best answer, then tap Check.';
  }
  if (flags.useB4Header) {
    return 'Read the feeling clue, choose your answer, then tap Check.';
  }
  return 'Choose the best answer, then tap Check.';
}
