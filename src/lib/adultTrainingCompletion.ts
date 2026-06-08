import { DR_VICTORIA_GUIDE_ID } from '../data/adult/drVictoriaHub';
import { UNCLE_T_GUIDE_ID } from '../data/adult/uncleTHub';
import { getAdultGuideById } from '../data/adult/adultGuideRegistry';
import {
  ADULT_ASSESSMENT_PROGRESS_EVENT,
  markDrVictoriaTrainingComplete,
  markUncleTTrainingComplete,
} from './adultAssessmentStorage';

const MISSIONS_KEY = 'caidens-courage-adult-training-missions';

type CompletedMissionMap = Record<string, string[]>;

function readCompletedMissions(): CompletedMissionMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(MISSIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CompletedMissionMap;
  } catch {
    return {};
  }
}

function writeCompletedMissions(map: CompletedMissionMap): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MISSIONS_KEY, JSON.stringify(map));
}

function dispatchProgressEvent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADULT_ASSESSMENT_PROGRESS_EVENT));
}

function isGuideFullyComplete(guideId: string): boolean {
  const guide = getAdultGuideById(guideId);
  if (!guide) return false;

  const completed = readCompletedMissions()[guideId] ?? [];
  const required = guide.missions.filter((mission) => mission.status === 'available').map((m) => m.id);
  return required.length > 0 && required.every((missionId) => completed.includes(missionId));
}

export function markAdultTrainingMissionComplete(guideId: string, missionId: string): void {
  const map = readCompletedMissions();
  const existing = map[guideId] ?? [];
  if (existing.includes(missionId)) return;

  map[guideId] = [...existing, missionId];
  writeCompletedMissions(map);

  if (guideId === DR_VICTORIA_GUIDE_ID && isGuideFullyComplete(guideId)) {
    markDrVictoriaTrainingComplete();
  }
  if (guideId === UNCLE_T_GUIDE_ID && isGuideFullyComplete(guideId)) {
    markUncleTTrainingComplete();
  }

  dispatchProgressEvent();
}

export function readCompletedAdultTrainingMissions(guideId: string): string[] {
  return readCompletedMissions()[guideId] ?? [];
}
