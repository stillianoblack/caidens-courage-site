import {
  formatPercentage,
  formatPercentageWords,
  formatPoints,
  missingImpactStatus,
} from '../pilotOutcomesPresentation';

describe('pilot outcomes presentation formatting', () => {
  it.each([
    [33.333333333, '33.3%'],
    [87.5, '87.5%'],
    [100, '100%'],
    [0, '0%'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatPercentage(value)).toBe(expected);
  });

  it('uses identical precision for percentages and percentage-point values', () => {
    expect(formatPercentageWords(33.333333333)).toBe('33.3 percent');
    expect(formatPoints(33.333333333)).toBe('+33.3 pts');
  });

  it('provides concise missing-state presentation labels', () => {
    expect(formatPercentage(null)).toBe('Not enough data');
    expect(missingImpactStatus('domain')).toBe('Awaiting matched assessments.');
    expect(missingImpactStatus('weekly')).toBe('Awaiting weekly progress.');
  });
});
