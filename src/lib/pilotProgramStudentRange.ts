import type { EstimatedStudentCountRange } from '../types/pilotProgram';

/** Legacy numeric estimate for dashboards that still read estimated_students. */
export function deriveEstimatedStudentsFromRange(range: EstimatedStudentCountRange): number {
  switch (range) {
    case '1 child':
      return 1;
    case '2–4 children':
      return 3;
    case '5–10 students':
      return 8;
    case '11–25 students':
      return 18;
    case '26–50 students':
      return 38;
    case '50+ students':
      return 50;
    default:
      return 1;
  }
}
