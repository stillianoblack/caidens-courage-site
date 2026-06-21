import {
  deriveMonthlyChallengeProgress,
  monthCertificateKey,
  monthChallengeCompletedKey,
  MONTH_1_CHALLENGE,
} from './monthlyChallengeProgress';

describe('deriveMonthlyChallengeProgress', () => {
  it('does not mark Month 1 certificate earned when only 3 of 4 weeks are complete', () => {
    const earnedClaimKeys = new Set([
      monthChallengeCompletedKey(1),
      monthCertificateKey(1),
    ]);

    const progress = deriveMonthlyChallengeProgress(
      MONTH_1_CHALLENGE,
      [],
      earnedClaimKeys,
      {},
      [1, 2, 3],
    );

    expect(progress.weeksCompleted).toBe(3);
    expect(progress.weeksTotal).toBe(4);
    expect(progress.certificateEarned).toBe(false);
    expect(progress.monthChallengeCompleted).toBe(false);
    expect(progress.monthlyBadgeEarned).toBe(false);
  });

  it('marks Month 1 certificate earned when all 4 canonical weeks are complete', () => {
    const progress = deriveMonthlyChallengeProgress(
      MONTH_1_CHALLENGE,
      [],
      new Set(),
      {},
      [1, 2, 3, 4],
    );

    expect(progress.weeksCompleted).toBe(4);
    expect(progress.weeksTotal).toBe(4);
    expect(progress.certificateEarned).toBe(true);
    expect(progress.monthChallengeCompleted).toBe(true);
    expect(progress.monthlyBadgeEarned).toBe(true);
  });

  it('ignores legacy reward claim keys without canonical week completion', () => {
    const progress = deriveMonthlyChallengeProgress(
      MONTH_1_CHALLENGE,
      ['caiden-week-1', 'miranda-week-2'],
      new Set([monthCertificateKey(1)]),
      {},
      [1, 2],
    );

    expect(progress.weeksCompleted).toBe(2);
    expect(progress.certificateEarned).toBe(false);
  });
});
