import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser SpeechSynthesis for optional B-4 style narration.
 * Volume: SpeechSynthesisUtterance.volume is widely supported (0–1); if unsupported,
 * the engine still speaks—there is no separate Web Audio gain for TTS in most browsers.
 */
export function useB4Speech(enabled: boolean, volume: number) {
  const [supported, setSupported] = useState(false);
  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);

  enabledRef.current = enabled;
  volumeRef.current = volume;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'speechSynthesis' in window;
    setSupported(ok);
    if (!ok) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener('voiceschanged', warm);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', warm);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabledRef.current || !text.trim()) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.trim());
      u.rate = 0.82;
      u.pitch = 1.02;
      u.volume = Math.min(1, Math.max(0, volumeRef.current));
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return { speak, cancel, supported };
}
