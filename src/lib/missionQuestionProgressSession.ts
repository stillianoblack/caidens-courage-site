/** In-memory mission question index — survives brief GameAssessmentFlow remounts. */
const activeMissionQuestionIndex = new Map<string, number>();

export function buildMissionQuestionSessionKey(
  missionId: string,
  participantId?: string | null,
): string {
  const participant = participantId?.trim() || 'anon';
  return `${missionId}::${participant}`;
}

export function readMissionQuestionIndex(sessionKey: string): number {
  return activeMissionQuestionIndex.get(sessionKey) ?? 0;
}

export function writeMissionQuestionIndex(sessionKey: string, index: number): void {
  activeMissionQuestionIndex.set(sessionKey, Math.max(0, index));
}

export function clearMissionQuestionIndex(sessionKey: string): void {
  activeMissionQuestionIndex.delete(sessionKey);
}
