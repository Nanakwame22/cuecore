// ── useRealChart ───────────────────────────────────────────────────────────────
// Fetches real OHLCV candles from Twelve Data and computes live indicators.
// Wires the last bar's close to useLivePrice so the forming candle animates.

import { useState, useEffect } from 'react';
import { fetchTimeSeries, OHLCVBar, TDInterval } from '@/services/twelveData';
import { computeRSI, computeMACD, computeATR, latestEMA } from '@/services/indicators';
import { useLivePrice } from '@/hooks/useLivePrices';
import { generateChartBars, watchlistAssets, type OHLCBar } from '@/mocks/appData';

// Legacy timeframe label used by generateChartBars mock generator
const toMockTf = (tf: string): string => {
  const map: Record<string, string> = {
    '1m': '1H', '5m': '1H', '15m': '1H', '30m': '4H',
    '1H': '4H', '4H': '4H', 'D1': '1D',
  };
  return map[tf] ?? '4H';
};

// ── Timeframe → Twelve Data interval ─────────────────────────────────────────
const TF_TO_INTERVAL: Record<string, TDInterval> = {
  'S5':  '1min', 'S10': '1min', 'S30': '1min',
  '1m':  '1min', '2m':  '1min', '3m':  '1min',
  '5m':  '5min', '10m': '5min',
  '15m': '15min', '30m': '15min',
  '1H':  '1h',
  '4H':  '4h',
  'D1':  '1day',
};

const toOHLCBar = (v: OHLCVBar): OHLCBar => ({
  open:    v.open,
  high:    v.high,
  low:     v.low,
  close:   v.close,
  volume:  v.volume || 0,
  bullish: v.close >= v.open,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RealChartIndicators {
  rsi:           number | null;
  macdHistogram: number | null;
  macdLine:      number | null;
  ema9:          number | null;
  ema21:         number | null;
  atr:           number | null;
}

export interface RealChartState {
  bars:        OHLCBar[];
  liveBar:     OHLCBar | null;
  livePrice:   number;
  barProgress: number;
  loading:     boolean;
  error:       boolean;
  indicators:  RealChartIndicators;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useRealChart = (symbol: string, tf: string): RealChartState => {
  const interval: TDInterval = TF_TO_INTERVAL[tf] ?? '1h';

  const [rawBars,    setRawBars]    = useState<OHLCVBar[]>([]);
  const [mockBars,   setMockBars]   = useState<OHLCBar[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);

  // Live price for the forming bar (served from cache — no extra API budget)
  const { price: livePriceData } = useLivePrice(symbol);

  // Re-fetch whenever symbol or interval changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setMockBars([]);

    fetchTimeSeries(symbol, interval, 100)
      .then(bars => {
        if (!cancelled) { setRawBars(bars); setLoading(false); }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Log so we can diagnose the Twelve Data error in the console
        console.warn(`[useRealChart] API error for ${symbol} ${interval}:`, err);
        // Fall back to deterministic mock bars so the chart is never blank
        const asset   = watchlistAssets.find(a => a.symbol === symbol);
        const price   = asset?.price ?? 100;
        const assetId = asset?.id ?? symbol;
        setMockBars(generateChartBars(assetId, toMockTf(tf), price));
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [symbol, interval, tf]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const convertedBars = rawBars.map(toOHLCBar);
  const livePriceVal  = livePriceData?.price ?? 0;

  // Use real bars when available, fall back to mock on error
  const sourceBars = convertedBars.length > 0 ? convertedBars : mockBars;

  // Historical = everything except the last bar (last bar shown as liveBar)
  const historicalBars = sourceBars.length > 1 ? sourceBars.slice(0, -1) : sourceBars;

  // Live (forming) bar: last bar with close updated to real-time price
  const lastRaw = rawBars[rawBars.length - 1];
  const lastMock = mockBars[mockBars.length - 1];

  const liveBar: OHLCBar | null = lastRaw
    ? {
        open:    lastRaw.open,
        high:    livePriceVal > 0 ? Math.max(lastRaw.high, livePriceVal) : lastRaw.high,
        low:     livePriceVal > 0 ? Math.min(lastRaw.low,  livePriceVal) : lastRaw.low,
        close:   livePriceVal > 0 ? livePriceVal : lastRaw.close,
        volume:  lastRaw.volume || 0,
        bullish: (livePriceVal > 0 ? livePriceVal : lastRaw.close) >= lastRaw.open,
      }
    : lastMock
    ? { ...lastMock }
    : null;

  const livePrice = livePriceVal > 0
    ? livePriceVal
    : (sourceBars.length > 0 ? sourceBars[sourceBars.length - 1].close : 0);

  // ── Indicators (real bars preferred, mock as fallback) ───────────────────

  const closes     = rawBars.length > 0 ? rawBars.map(b => b.close) : sourceBars.map(b => b.close);
  const atrSource  = rawBars.length > 0 ? rawBars : [];

  const rsi        = closes.length >= 15 ? computeRSI(closes)      : null;
  const macdResult = closes.length >= 27 ? computeMACD(closes)     : null;
  const ema9       = closes.length >=  9 ? latestEMA(closes, 9)    : null;
  const ema21      = closes.length >= 21 ? latestEMA(closes, 21)   : null;
  const atr        = atrSource.length >= 14 ? computeATR(atrSource) : null;

  return {
    bars:        historicalBars,
    liveBar,
    livePrice,
    barProgress: 0,
    loading,
    error,
    indicators: {
      rsi,
      macdHistogram: macdResult?.histogram ?? null,
      macdLine:      macdResult?.macd      ?? null,
      ema9,
      ema21,
      atr,
    },
  };
};
