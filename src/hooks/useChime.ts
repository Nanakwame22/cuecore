import { useCallback, useRef, useState } from 'react';

/**
 * Generates a subtle two-tone chime using the Web Audio API.
 * No external audio files required.
 */
export const useChime = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Two-note chime: C5 then E5
    const notes = [
      { freq: 523.25, start: 0, duration: 0.18 },
      { freq: 659.25, start: 0.14, duration: 0.28 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      // Soft attack, quick decay
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.12, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    });
  }, [soundEnabled, getCtx]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
    // Unlock AudioContext on first user interaction
    getCtx();
  }, [getCtx]);

  return { soundEnabled, toggleSound, playChime };
};
