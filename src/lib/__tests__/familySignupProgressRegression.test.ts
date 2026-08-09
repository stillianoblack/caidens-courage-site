import { mergeB4CheckInCompletion } from '../getCourageInTheDarkProgress';
import { persistWeek0ResultToDatabase } from '../week0AssessmentStorage';
import { saveStudentAssessmentToSupabase } from '../assessmentResultsService';

jest.mock('../assessmentResultsService', () => ({
  saveStudentAssessmentToSupabase: jest.fn(),
}));

describe('family signup and progress regressions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test('completed B-4 Check-In marks the week-one map station complete', () => {
    expect(mergeB4CheckInCompletion(['caiden-courage-in-the-dark'], 1, true)).toEqual([
      'caiden-courage-in-the-dark',
      'b4-self-check-in',
    ]);
  });

  test('does not duplicate the canonical B-4 completion marker', () => {
    expect(mergeB4CheckInCompletion(['b4-self-check-in'], 1, true)).toEqual([
      'b4-self-check-in',
    ]);
  });

  test('legacy assessment save never creates a generic Student identity', async () => {
    const result = await persistWeek0ResultToDatabase({
      studentName: '',
      week: 0,
      phase: 'baseline',
      selScore: 1,
      readingScore: 1,
      focusStrategyScore: 1,
      completedAt: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
    expect(saveStudentAssessmentToSupabase).not.toHaveBeenCalled();
  });
});
