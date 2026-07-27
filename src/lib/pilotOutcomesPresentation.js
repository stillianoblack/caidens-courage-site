function formatDecimal(value) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const rounded = Math.round((Number(value) + Number.EPSILON) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatPercentage(value, missingLabel = 'Not enough data') {
  const formatted = formatDecimal(value);
  return formatted == null ? missingLabel : `${formatted}%`;
}

function formatPoints(value, missingLabel = 'Not enough data') {
  const formatted = formatDecimal(value);
  if (formatted == null) return missingLabel;
  return `${Number(formatted) > 0 ? '+' : ''}${formatted} pts`;
}

function formatPercentageWords(value, missingLabel = 'not enough data') {
  const formatted = formatDecimal(value);
  return formatted == null ? missingLabel : `${formatted} percent`;
}

function missingImpactStatus(kind) {
  if (kind === 'weekly') return 'Awaiting weekly progress.';
  if (kind === 'participation') return 'Awaiting assessments.';
  return 'Awaiting matched assessments.';
}

function growthPendingCenterLabel() {
  return 'Growth pending';
}

function growthPendingStatusLabel() {
  return 'Growth pending';
}

module.exports = {
  formatDecimal,
  formatPercentage,
  formatPercentageWords,
  formatPoints,
  missingImpactStatus,
  growthPendingCenterLabel,
  growthPendingStatusLabel,
};
