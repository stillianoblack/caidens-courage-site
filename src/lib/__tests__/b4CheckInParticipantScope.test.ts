import { B4_BASELINE_ASSESSMENT_NAME } from '../../data/b4BaselineCheckContent';
import { isBaselineAssessmentCompleteLocal } from '../b4CheckInStatus';
import {
  loadB4BaselineState,
  recoverCompletedBaselineStateForParticipant,
  saveB4BaselineState,
} from '../b4BaselineCheckStorage';

describe('B-4 Check-In participant-scoped completion', () => {
  const participantId = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => window.localStorage.clear());

  test('a family program context does not relock a completed camp-linked participant', () => {
    saveB4BaselineState(
      {
        profile: {
          anonymousStudentId: 'nova-local',
          participantId,
          firstName: 'Nova',
          nickname: 'Nova',
          programCode: 'CAMP-ORIGINAL',
          groupName: 'Camp',
        },
        completedModules: ['feelings', 'reading', 'focus-moves'],
        record: {
          assessmentName: B4_BASELINE_ASSESSMENT_NAME,
          anonymousStudentId: 'nova-local',
          participantId,
          firstName: 'Nova',
          nickname: 'Nova',
          programCode: 'CAMP-ORIGINAL',
          groupName: 'Camp',
          completedModules: ['feelings', 'reading', 'focus-moves'],
          feelingsScore: 8,
          readingScore: 4,
          focusMovesScore: 4,
          completedAt: '2026-07-15T15:25:00.000Z',
        },
      },
      participantId,
    );

    expect(
      isBaselineAssessmentCompleteLocal({
        participantId,
        programCode: 'FAMILY-CURRENT',
      }),
    ).toBe(true);
  });

  test('recovers one exact-name completed record into the authenticated participant scope', () => {
    const oldParticipantId = '22222222-2222-4222-8222-222222222222';
    saveB4BaselineState(
      {
        profile: {
          anonymousStudentId: 'nova-local',
          participantId: oldParticipantId,
          firstName: 'Nova',
          nickname: 'Nova',
          programCode: 'CAMP-ORIGINAL',
          groupName: 'Camp',
        },
        completedModules: ['feelings', 'reading', 'focus-moves'],
        record: {
          assessmentName: B4_BASELINE_ASSESSMENT_NAME,
          anonymousStudentId: 'nova-local',
          participantId: oldParticipantId,
          firstName: 'Nova',
          nickname: 'Nova',
          programCode: 'CAMP-ORIGINAL',
          groupName: 'Camp',
          completedModules: ['feelings', 'reading', 'focus-moves'],
          feelingsScore: 8,
          readingScore: 4,
          focusMovesScore: 4,
          completedAt: '2026-07-15T15:25:00.000Z',
        },
      },
      oldParticipantId,
    );

    const recovered = recoverCompletedBaselineStateForParticipant({
      participantId,
      displayName: 'Nova',
    });

    expect(recovered?.record?.participantId).toBe(participantId);
    expect(loadB4BaselineState(participantId).completedModules).toEqual([
      'feelings',
      'reading',
      'focus-moves',
    ]);
  });

  test('does not recover when more than one completed record has the same nickname', () => {
    ['22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333'].forEach(
      (sourceParticipantId, index) => {
        saveB4BaselineState(
          {
            profile: {
              anonymousStudentId: `nova-${index}`,
              participantId: sourceParticipantId,
              nickname: 'Nova',
              programCode: '',
              groupName: '',
            },
            completedModules: ['feelings', 'reading', 'focus-moves'],
            record: {
              assessmentName: B4_BASELINE_ASSESSMENT_NAME,
              anonymousStudentId: `nova-${index}`,
              participantId: sourceParticipantId,
              nickname: 'Nova',
              programCode: '',
              groupName: '',
              completedModules: ['feelings', 'reading', 'focus-moves'],
              feelingsScore: 8,
              readingScore: 4,
              focusMovesScore: 4,
              completedAt: '2026-07-15T15:25:00.000Z',
            },
          },
          sourceParticipantId,
        );
      },
    );

    expect(
      recoverCompletedBaselineStateForParticipant({ participantId, displayName: 'Nova' }),
    ).toBeNull();
  });
});
