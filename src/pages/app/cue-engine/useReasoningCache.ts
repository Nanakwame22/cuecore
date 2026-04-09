import { useRef, useCallback } from 'react';
import { dashboardCues } from '@/mocks/appData';

type CueItem = typeof dashboardCues[number];

interface CacheEntry {
  text: string;
  signal: string;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const FALLBACK = (signal: string) =>
  `Signal generated from technical indicator confluence. RSI, MACD, and volume conditions aligned with the ${signal} direction. See factor breakdown for individual scores.`;

export const useReasoningCache = () => {
  const cache = useRef<Record<string, CacheEntry>>({});

  const getReasoning = useCallback(async (
    cue: CueItem,
    onLoading: (loading: boolean) => void,
    onResult: (text: string) => void,
  ) => {
    const cacheKey = cue.id;
    const now = Date.now();
    const cached = cache.current[cacheKey];

    if (cached && cached.signal === cue.direction && now - cached.timestamp < CACHE_TTL_MS) {
      onResult(cached.text);
      return;
    }

    onLoading(true);

    const userMessage = JSON.stringify({
      symbol: cue.asset,
      signal: cue.direction,
      confidence: cue.confidence,
      entry: cue.entry,
      target: cue.target,
      stop: cue.stopLoss,
      rr: cue.riskReward,
      tf: cue.timeframe,
      type: cue.sector,
    });

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

    if (!apiKey) {
      onLoading(false);
      onResult(FALLBACK(cue.direction));
      return;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          system: 'You are CueCore\'s signal reasoning engine. Write 2 to 4 sentences explaining why this trade signal was generated. Use the exact numeric values provided. Write like a senior trader briefing a colleague. No em dashes. No disclaimers. Under 75 words.',
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text: string = data?.content?.[0]?.text ?? FALLBACK(cue.direction);

      cache.current[cacheKey] = { text, signal: cue.direction, timestamp: now };
      onLoading(false);
      onResult(text);
    } catch {
      onLoading(false);
      onResult(FALLBACK(cue.direction));
    }
  }, []);

  return { getReasoning };
};
