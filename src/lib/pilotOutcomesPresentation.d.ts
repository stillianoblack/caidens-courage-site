export function formatDecimal(value: number | null | undefined): string | null;
export function formatPercentage(value: number | null | undefined, missingLabel?: string): string;
export function formatPercentageWords(value: number | null | undefined, missingLabel?: string): string;
export function formatPoints(value: number | null | undefined, missingLabel?: string): string;
export function missingImpactStatus(kind: 'domain' | 'overall' | 'weekly' | 'participation'): string;
