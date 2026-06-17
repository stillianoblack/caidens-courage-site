export type WeekSelectionDebugPayload = {
  clickedWeek: number;
  previousSelectedWeek: number | null;
  newSelectedWeek: number;
  headerTitle: string;
  headerThumbnail: string | null;
  scrollTriggered: boolean;
};

export function logWeekSelectionDebug(payload: WeekSelectionDebugPayload): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[WEEK_SELECTION_DEBUG]', payload);
}
