// ── Twelve Data OHLCV fetcher ─────────────────────────────────────────────────
// One call per symbol per scan. We compute RSI/MACD/EMA client-side from the
// raw candles so we don't burn through the free-tier 800 req/day limit.
// All fetches go through the shared apiQueue to respect the 8 req/min cap.

import { enqueueApiCall } from './apiQueue';

const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY as string;
const BASE = 'https://api.twelvedata.com';

// Twelve Data interval codes
export type TDInterval = '1min' | '5min' | '15min' | '1h' | '4h' | '1day';

// CueCore display symbol → Twelve Data symbol
const SYMBOL_MAP: Record<string, string> = {
  GOLD: 'XAU/USD',
  SILVER: 'XAG/USD',
  'OIL/WTI': 'WTI/USD',
};

export const toTDSymbol = (symbol: string): string =>
  SYMBOL_MAP[symbol] ?? symbol;

export interface OHLCVBar {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Cache ─────────────────────────────────────────────────────────────────────
const seriesCache = new Map<string, { bars: OHLCVBar[]; fetchedAt: number }>();
// 30-minute TTL: OHLCV data for 4H/1D candles doesn't change meaningfully faster
const CACHE_TTL = 30 * 60 * 1000;

const _doFetch = async (
  symbol: string,
  interval: TDInterval,
  outputsize: number,
): Promise<OHLCVBar[]> => {
  const tdSym = toTDSymbol(symbol);
  const url =
    `${BASE}/time_series` +
    `?symbol=${encodeURIComponent(tdSym)}` +
    `&interval=${interval}` +
    `&outputsize=${outputsize}` +
    `&apikey=${API_KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.status === 'error' || !Array.isArray(json.values)) {
    throw new Error(json.message ?? `No data returned for ${symbol}`);
  }

  // Twelve Data returns newest-first; reverse to oldest-first for indicators
  const bars: OHLCVBar[] = (json.values as Record<string, string>[])
    .reverse()
    .map(v => ({
      datetime: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseFloat(v.volume) || 0,
    }));

  const key = `${symbol}:${interval}`;
  seriesCache.set(key, { bars, fetchedAt: Date.now() });
  return bars;
};

export const fetchTimeSeries = (
  symbol: string,
  interval: TDInterval,
  outputsize = 100,
): Promise<OHLCVBar[]> => {
  const key = `${symbol}:${interval}`;
  const cached = seriesCache.get(key);
  // Return cached data immediately — no queue needed
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return Promise.resolve(cached.bars);
  // Otherwise enqueue the real API call
  return enqueueApiCall(() => _doFetch(symbol, interval, outputsize));
};

/** Invalidate cache for a symbol (e.g. after a forced refresh) */
export const invalidateCache = (symbol: string, interval: TDInterval) =>
  seriesCache.delete(`${symbol}:${interval}`);
