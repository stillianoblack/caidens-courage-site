import {
  buildMissionQuestionSessionKey,
  readMissionQuestionIndex,
  writeMissionQuestionIndex,
} from './missionQuestionProgressSession';

/**
 * When participant id resolves after mount, merge any in-progress index from the anon key
 * so question progression does not reset to 0 (Miranda + all characters).
 */
export function migrateMissionQuestionIndex(
  missionId: string,
  previousParticipantId: string | null | undefined,
  nextParticipantId: string | null | undefined,
): number {
  const nextKey = buildMissionQuestionSessionKey(missionId, nextParticipantId);
  const nextIndex = readMissionQuestionIndex(nextKey);

  const prevKey = buildMissionQuestionSessionKey(missionId, previousParticipantId);
  if (prevKey === nextKey) return nextIndex;

  const prevIndex = readMissionQuestionIndex(prevKey);
  const merged = Math.max(prevIndex, nextIndex);
  if (merged > 0) {
    writeMissionQuestionIndex(nextKey, merged);
  }
  return merged;
}
