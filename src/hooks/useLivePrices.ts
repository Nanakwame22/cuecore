import { useState, useEffect, useRef, useCallback } from 'react';
import { enqueueApiCall } from '@/services/apiQueue';

// ── Twelve Data symbol mapping ────────────────────────────────────────────────
// Twelve Data uses different formats for different asset classes
const SYMBOL_MAP: Record<string, string> = {
  'BTC/USD':  'BTC/USD',
  'ETH/USD':  'ETH/USD',
  'SOL/USD':  'SOL/USD',
  'BNB/USD':  'BNB/USD',
  'NVDA':     'NVDA',
  'TSLA':     'TSLA',
  'AAPL':     'AAPL',
  'AMZN':     'AMZN',
  'SPX':      'SPX',
  'EUR/USD':  'EUR/USD',
  'USD/JPY':  'USD/JPY',
  'GBP/USD':  'GBP/USD',
  'GOLD':     'XAU/USD',
};

export interface LivePrice {
  symbol: string;
  price: number;
  change: number;       // % change
  changeAmt: number;    // absolute change
  prevClose: number;
  loading: boolean;
  error: boolean;
  lastUpdated: number;
}

// Cache: symbol → { data, fetchedAt }
const priceCache = new Map<string, { data: LivePrice; fetchedAt: number }>();
// 2-minute TTL — all calls go through the shared queue (10s/call), so a full
// batch of 10 symbols takes ~100s. Keeping TTL ≥ that avoids stale-data churn.
const CACHE_TTL_MS = 2 * 60 * 1000;

const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY as string;

const _doFetchPrice = async (symbol: string): Promise<LivePrice> => {
  const tdSymbol = SYMBOL_MAP[symbol] ?? symbol;
  const cached = priceCache.get(symbol);
  try {
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(tdSymbol)}&apikey=${API_KEY}`,
    );
    const json = await res.json();

    if (json.status === 'error' || !json.close) {
      throw new Error(json.message ?? 'API error');
    }

    const price     = parseFloat(json.close);
    const prevClose = parseFloat(json.previous_close);
    const changeAmt = price - prevClose;
    const change    = prevClose > 0 ? (changeAmt / prevClose) * 100 : 0;

    const data: LivePrice = {
      symbol,
      price,
      change: parseFloat(change.toFixed(2)),
      changeAmt: parseFloat(changeAmt.toFixed(4)),
      prevClose,
      loading: false,
      error: false,
      lastUpdated: Date.now(),
    };

    priceCache.set(symbol, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    if (cached) return { ...cached.data, loading: false };
    return {
      symbol, price: 0, change: 0, changeAmt: 0, prevClose: 0,
      loading: false, error: true, lastUpdated: Date.now(),
    };
  }
};

const fetchPrice = (symbol: string): Promise<LivePrice> => {
  const cached = priceCache.get(symbol);
  // Serve from cache immediately if still fresh — no queue slot needed
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }
  // Otherwise go through the shared rate-limit queue
  return enqueueApiCall(() => _doFetchPrice(symbol));
};

// ── Batch fetch — spacing is handled by the shared apiQueue ──────────────────
const fetchBatch = async (
  symbols: string[],
  onUpdate: (symbol: string, data: LivePrice) => void,
) => {
  for (const sym of symbols) {
    const data = await fetchPrice(sym);
    onUpdate(sym, data);
  }
};

// ── Main hook ─────────────────────────────────────────────────────────────────
export const useLivePrices = (symbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>(() => {
    // Init with loading state
    const init: Record<string, LivePrice> = {};
    symbols.forEach(s => {
      const cached = priceCache.get(s);
      init[s] = cached?.data ?? {
        symbol: s, price: 0, change: 0, changeAmt: 0, prevClose: 0,
        loading: true, error: false, lastUpdated: 0,
      };
    });
    return init;
  });

  const symbolsKey = symbols.join(',');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const syms = symbolsKey.split(',').filter(Boolean);
    await fetchBatch(syms, (symbol, data) => {
      setPrices(prev => ({ ...prev, [symbol]: data }));
    });
  }, [symbolsKey]);

  useEffect(() => {
    refresh();
    // Refresh every 30s
    intervalRef.current = setInterval(refresh, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { prices, refresh };
};

// ── Single symbol convenience hook ───────────────────────────────────────────
export const useLivePrice = (symbol: string) => {
  const { prices, refresh } = useLivePrices([symbol]);
  return { price: prices[symbol], refresh };
};
