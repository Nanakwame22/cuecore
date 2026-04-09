// ── Technical indicator computations (client-side, pure functions) ────────────
// All computed from raw OHLCV bars so we need only 1 API call per symbol.

import type { OHLCVBar } from './twelveData';

// ── EMA ───────────────────────────────────────────────────────────────────────

/** Returns full EMA array (oldest → newest). Needs at least `period` data points. */
export const emaArray = (data: number[], period: number): number[] => {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  // Seed with SMA of first `period` values
  let prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(prev);
  for (let i = period; i < data.length; i++) {
    prev = data[i] * k + prev * (1 - k);
    result.push(prev);
  }
  return result;
};

export const latestEMA = (data: number[], period: number): number => {
  const arr = emaArray(data, period);
  return arr[arr.length - 1] ?? 0;
};

// ── RSI (Wilder's smoothing) ──────────────────────────────────────────────────

export const computeRSI = (closes: number[], period = 14): number => {
  if (closes.length < period + 1) return 50;

  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  const gains = changes.map(c => Math.max(c, 0));
  const losses = changes.map(c => Math.max(-c, 0));

  // Initial averages (simple)
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Wilder's smoothing for remaining bars
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
};

// ── MACD (12/26/9) ────────────────────────────────────────────────────────────

export interface MACDResult {
  macd: number;          // MACD line  (EMA12 − EMA26)
  signal: number;        // Signal line (EMA9 of MACD)
  histogram: number;     // Current bar histogram
  prevHistogram: number; // Previous bar histogram (for crossover detection)
}

export const computeMACD = (closes: number[]): MACDResult => {
  const zero = { macd: 0, signal: 0, histogram: 0, prevHistogram: 0 };
  if (closes.length < 35) return zero;

  const ema12 = emaArray(closes, 12);
  const ema26 = emaArray(closes, 26);

  // ema26 has (n - 26 + 1) elements; ema12 has (n - 12 + 1) elements.
  // Align them so the indices correspond to the same bar.
  const offset = (26 - 1) - (12 - 1); // = 14
  const macdLine: number[] = [];
  for (let i = 0; i < ema26.length; i++) {
    macdLine.push(ema12[i + offset] - ema26[i]);
  }

  if (macdLine.length < 9) return zero;

  const signalLine = emaArray(macdLine, 9);
  const n = signalLine.length;
  const m = macdLine.length;

  const lastMACD = macdLine[m - 1];
  const lastSignal = signalLine[n - 1];
  const prevMACD = macdLine[m - 2] ?? lastMACD;
  // signal line is shorter by (9-1)=8 bars than macdLine
  const prevSignal = signalLine[n - 2] ?? lastSignal;

  return {
    macd: lastMACD,
    signal: lastSignal,
    histogram: lastMACD - lastSignal,
    prevHistogram: prevMACD - prevSignal,
  };
};

// ── ATR (Average True Range) ──────────────────────────────────────────────────

export const computeATR = (bars: OHLCVBar[], period = 14): number => {
  if (bars.length < period + 1) return 0;
  const trs = bars.slice(1).map((bar, i) => {
    const prev = bars[i];
    return Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - prev.close),
      Math.abs(bar.low - prev.close),
    );
  });
  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
};

// ── Volume spike ──────────────────────────────────────────────────────────────

export const isVolumeSpike = (
  bars: OHLCVBar[],
  period = 20,
  threshold = 1.5,
): boolean => {
  if (bars.length < period + 1) return false;
  const lookback = bars.slice(-period - 1, -1);
  const avgVol = lookback.reduce((a, b) => a + b.volume, 0) / lookback.length;
  const currentVol = bars[bars.length - 1].volume;
  return avgVol > 0 && currentVol > threshold * avgVol;
};
