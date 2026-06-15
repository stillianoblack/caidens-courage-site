/**
 * Assign correct-answer positions targeting ~25% per slot with max 2 consecutive same.
 */
export function balanceCorrectPositions(count: number): (0 | 1 | 2 | 3)[] {
  if (count === 0) return [];

  const target = Math.floor(count / 4);
  const remainder = count % 4;
  const quotas = [target, target, target, target];
  for (let i = 0; i < remainder; i += 1) {
    quotas[i] += 1;
  }

  const positions: (0 | 1 | 2 | 3)[] = [];
  const used = [0, 0, 0, 0];

  for (let i = 0; i < count; i += 1) {
    const last = positions.slice(-2);
    const candidates = ([0, 1, 2, 3] as const).filter((slot) => {
      if (used[slot] >= quotas[slot]) return false;
      if (last.length === 2 && last[0] === slot && last[1] === slot) return false;
      return true;
    });

    let pick: 0 | 1 | 2 | 3;
    if (candidates.length > 0) {
      candidates.sort((a, b) => used[a] - used[b] || quotas[a] - used[a] - (quotas[b] - used[b]));
      pick = candidates[0];
    } else {
      const fallback = ([0, 1, 2, 3] as const).filter(
        (slot) => !(last.length === 2 && last[0] === slot && last[1] === slot),
      );
      fallback.sort((a, b) => used[a] - used[b]);
      pick = fallback[0] ?? ((i % 4) as 0 | 1 | 2 | 3);
    }

    positions.push(pick);
    used[pick] += 1;
  }

  return positions;
}

export function applyPositionToChoices(
  best: string,
  plausibleIncomplete: string,
  plausibleFlawed: string,
  obviousWrong: string,
  correctIndex: 0 | 1 | 2 | 3,
): [string, string, string, string] {
  const slots: string[] = ['', '', '', ''];
  const others = [plausibleIncomplete, plausibleFlawed, obviousWrong];
  let otherIdx = 0;

  for (let i = 0; i < 4; i += 1) {
    if (i === correctIndex) {
      slots[i] = best;
    } else {
      slots[i] = others[otherIdx];
      otherIdx += 1;
    }
  }

  return slots as [string, string, string, string];
}
