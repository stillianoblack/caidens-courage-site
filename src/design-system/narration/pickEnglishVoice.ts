/** Smooth, natural voices that work well for young listeners. */
const SMOOTH_VOICE_HINTS: Array<{ pattern: string; score: number }> = [
  { pattern: 'samantha', score: 50 },
  { pattern: 'ava', score: 48 },
  { pattern: 'allison', score: 46 },
  { pattern: 'karen', score: 44 },
  { pattern: 'jenny', score: 42 },
  { pattern: 'aria', score: 42 },
  { pattern: 'google us english', score: 40 },
  { pattern: 'fiona', score: 38 },
  { pattern: 'victoria', score: 36 },
  { pattern: 'zira', score: 34 },
  { pattern: 'neural', score: 30 },
  { pattern: 'enhanced', score: 28 },
  { pattern: 'premium', score: 26 },
];

const AVOID_VOICE_HINTS = ['fred', 'junior', 'bells', 'bad news', 'whisper', 'compact', 'cellos'];

function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (lang.startsWith('en-us')) score += 40;
  else if (lang.startsWith('en')) score += 20;

  for (const hint of AVOID_VOICE_HINTS) {
    if (name.includes(hint)) return -100;
  }

  for (const { pattern, score: boost } of SMOOTH_VOICE_HINTS) {
    if (name.includes(pattern)) {
      score += boost;
      break;
    }
  }

  if (voice.localService) score += 8;

  return score;
}

export function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
  const pool = english.length ? english : voices;

  const ranked = [...pool].sort((a, b) => voiceScore(b) - voiceScore(a));
  const best = ranked[0];
  return best && voiceScore(best) > 0 ? best : ranked[0] ?? null;
}

export function loadSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}
