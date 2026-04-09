// ── Signal Engine ─────────────────────────────────────────────────────────────
// Fetches real OHLCV data and scores RSI, MACD, EMA crossover + volume spike
// to determine direction and confidence of a trade cue.

import { fetchTimeSeries, OHLCVBar, TDInterval } from './twelveData';
import {
  computeRSI,
  computeMACD,
  computeATR,
  latestEMA,
  isVolumeSpike,
} from './indicators';
import type { CueItem } from '@/mocks/appData';

// ── Symbols to scan ───────────────────────────────────────────────────────────

export interface ScanTarget {
  symbol: string;
  sector: string;
  timeframe: string; // CueCore display label
  interval: TDInterval; // Twelve Data interval code
}

// Kept to 8 symbols so one full scan uses ≤8 credits/minute at 10s spacing.
// useLivePrices already consumes some of the free-tier budget, so we stay lean.
export const SCAN_TARGETS: ScanTarget[] = [
  // Crypto — 4H (24/7 data, always fresh)
  { symbol: 'BTC/USD', sector: 'Crypto',    timeframe: '4H', interval: '4h' },
  { symbol: 'ETH/USD', sector: 'Crypto',    timeframe: '4H', interval: '4h' },
  { symbol: 'SOL/USD', sector: 'Crypto',    timeframe: '4H', interval: '4h' },
  // Equity — 1D
  { symbol: 'NVDA',    sector: 'Equity',    timeframe: '1D', interval: '1day' },
  { symbol: 'AAPL',    sector: 'Equity',    timeframe: '1D', interval: '1day' },
  { symbol: 'TSLA',    sector: 'Equity',    timeframe: '1D', interval: '1day' },
  // Forex — 4H
  { symbol: 'EUR/USD', sector: 'Forex',     timeframe: '4H', interval: '4h' },
  // Commodity — 1D
  { symbol: 'GOLD',    sector: 'Commodity', timeframe: '1D', interval: '1day' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let _idCounter = 300;

const fmt = (v: number): number => {
  if (v < 1) return parseFloat(v.toFixed(5));
  if (v < 10) return parseFloat(v.toFixed(4));
  if (v < 100) return parseFloat(v.toFixed(3));
  if (v < 1000) return parseFloat(v.toFixed(2));
  return parseFloat(v.toFixed(0));
};

// ── Core signal computation ───────────────────────────────────────────────────

/**
 * Scores 4 factors for BUY and SELL:
 *   1. RSI  — oversold (<35) → BUY,  overbought (>65) → SELL
 *   2. MACD — histogram > 0 → BUY,  histogram < 0   → SELL
 *   3. EMA  — EMA9 > EMA21  → BUY,  EMA9 < EMA21    → SELL
 *   4. Vol  — spike confirms whichever direction leads
 *
 * Confidence = (aligned_factors / 3) × 100, capped at 96.
 * Volume spike adds +12 pp. Minimum 2 aligned factors to emit.
 */
const scoreAndBuild = (
  symbol: string,
  sector: string,
  timeframe: string,
  bars: OHLCVBar[],
): CueItem | null => {
  if (bars.length < 40) return null;

  const closes = bars.map(b => b.close);
  const rsi = computeRSI(closes);
  const macd = computeMACD(closes);
  const ema9 = latestEMA(closes, 9);
  const ema21 = latestEMA(closes, 21);
  const atr = computeATR(bars);
  const volSpike = isVolumeSpike(bars);
  const price = closes[closes.length - 1];

  // Score each direction across 3 primary factors
  let bull = 0;
  let bear = 0;
  const bullFactors: string[] = [];
  const bearFactors: string[] = [];

  if (rsi < 35) { bull++; bullFactors.push(`RSI ${rsi.toFixed(1)} (oversold)`); }
  else if (rsi > 65) { bear++; bearFactors.push(`RSI ${rsi.toFixed(1)} (overbought)`); }

  if (macd.histogram > 0) { bull++; bullFactors.push('MACD bullish'); }
  else if (macd.histogram < 0) { bear++; bearFactors.push('MACD bearish'); }

  if (ema9 > ema21) { bull++; bullFactors.push('EMA9 > EMA21'); }
  else if (ema9 < ema21) { bear++; bearFactors.push('EMA9 < EMA21'); }

  // Need at least 2 of 3 factors aligned
  const dominantScore = Math.max(bull, bear);
  if (dominantScore < 2) return null;

  const direction: 'BUY' | 'SELL' = bull >= bear ? 'BUY' : 'SELL';

  // Volume spike bonus (12 pp)
  const volBonus = volSpike ? 0.12 : 0;
  const rawConf = dominantScore / 3 + volBonus;
  const confidence = Math.min(96, Math.round(rawConf * 100));

  if (confidence < 62) return null;

  // Build entry / target / stop from ATR
  // Use 0.5% of price as floor ATR for assets where volume=0 (index/forex)
  const effectiveATR = atr > 0 ? atr : price * 0.005;
  const entry = price;
  const target = direction === 'BUY' ? entry + 2 * effectiveATR : entry - 2 * effectiveATR;
  const stopLoss = direction === 'BUY' ? entry - effectiveATR : entry + effectiveATR;
  const riskReward = 2.0;

  _idCounter++;
  return {
    id: `real_${_idCounter}_${symbol.replace(/\//g, '')}`,
    asset: symbol,
    direction,
    confidence,
    timeframe,
    entry: fmt(entry),
    target: fmt(target),
    stopLoss: fmt(stopLoss),
    riskReward,
    sector,
    age: 'just now',
    generatedAt: Date.now(),
    status: 'active',
  };
};

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch + score a single target. Returns null if no signal or on API error. */
export const scanSymbol = async (target: ScanTarget): Promise<CueItem | null> => {
  try {
    const bars = await fetchTimeSeries(target.symbol, target.interval, 100);
    return scoreAndBuild(target.symbol, target.sector, target.timeframe, bars);
  } catch (err) {
    console.warn(`[signalEngine] ${target.symbol}:`, err);
    return null;
  }
};

/**
 * Scan all SCAN_TARGETS sequentially with 350ms spacing between requests
 * to respect Twelve Data's free-tier rate limit (~8 req/min).
 *
 * @param onSignal  Optional callback fired immediately each time a signal is found.
 */
export const scanAllSymbols = async (
  onSignal?: (signal: CueItem) => void,
): Promise<CueItem[]> => {
  const results: CueItem[] = [];

  for (let i = 0; i < SCAN_TARGETS.length; i++) {
    const signal = await scanSymbol(SCAN_TARGETS[i]);
    if (signal) {
      results.push(signal);
      onSignal?.(signal);
    }
    // No manual delay needed — apiQueue enforces the 10s/call rate limit globally
  }

  return results;
};
