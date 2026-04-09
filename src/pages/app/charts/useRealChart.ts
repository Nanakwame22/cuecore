// ── useRealChart ───────────────────────────────────────────────────────────────
// Fetches real OHLCV candles from Twelve Data and computes live indicators.
// Wires the last bar's close to useLivePrice so the forming candle animates.

import { useState, useEffect } from 'react';
import { fetchTimeSeries, OHLCVBar, TDInterval } from '@/services/twelveData';
import { computeRSI, computeMACD, computeATR, latestEMA } from '@/services/indicators';
import { useLivePrice } from '@/hooks/useLivePrices';
import type { OHLCBar } from '@/mocks/appData';

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

  const [rawBars,  setRawBars]  = useState<OHLCVBar[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  // Live price for the forming bar (served from cache — no extra API budget)
  const { price: livePriceData } = useLivePrice(symbol);

  // Re-fetch whenever symbol or interval changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchTimeSeries(symbol, interval, 200)
      .then(bars => {
        if (!cancelled) { setRawBars(bars); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [symbol, interval]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const convertedBars = rawBars.map(toOHLCBar);
  const livePriceVal  = livePriceData?.price ?? 0;

  // Historical = everything except the last bar (last bar shown as liveBar)
  const historicalBars = convertedBars.length > 1 ? convertedBars.slice(0, -1) : convertedBars;

  // Live (forming) bar: last OHLCV bar with close updated to real-time price
  const lastRaw = rawBars[rawBars.length - 1];
  const liveBar: OHLCBar | null = lastRaw
    ? {
        open:    lastRaw.open,
        high:    livePriceVal > 0 ? Math.max(lastRaw.high, livePriceVal) : lastRaw.high,
        low:     livePriceVal > 0 ? Math.min(lastRaw.low,  livePriceVal) : lastRaw.low,
        close:   livePriceVal > 0 ? livePriceVal : lastRaw.close,
        volume:  lastRaw.volume || 0,
        bullish: (livePriceVal > 0 ? livePriceVal : lastRaw.close) >= lastRaw.open,
      }
    : null;

  const livePrice = livePriceVal > 0
    ? livePriceVal
    : (convertedBars.length > 0 ? convertedBars[convertedBars.length - 1].close : 0);

  // ── Indicators (full bar set) ─────────────────────────────────────────────

  const closes = rawBars.map(b => b.close);

  const rsi           = closes.length >= 15 ? computeRSI(closes)   : null;
  const macdResult    = closes.length >= 27 ? computeMACD(closes)  : null;
  const ema9          = closes.length >=  9 ? latestEMA(closes, 9)  : null;
  const ema21         = closes.length >= 21 ? latestEMA(closes, 21) : null;
  const atr           = rawBars.length >= 14 ? computeATR(rawBars)  : null;

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
