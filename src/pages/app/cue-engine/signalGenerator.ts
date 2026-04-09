import { CueItem } from '@/mocks/appData';

// ── Signal template pool ──────────────────────────────────────────────────────
// Each template defines the "shape" of a new signal; timestamps are injected live

interface SignalTemplate {
  asset: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timeframe: string;
  entry: number;
  target: number;
  stopLoss: number;
  riskReward: number;
  sector: string;
}

const SIGNAL_POOL: SignalTemplate[] = [
  // Crypto
  { asset: 'BTC/USD',  direction: 'BUY',  confidence: 89, timeframe: '4H', entry: 69800,  target: 76400,  stopLoss: 67100,  riskReward: 2.4, sector: 'Crypto' },
  { asset: 'ETH/USD',  direction: 'BUY',  confidence: 86, timeframe: '1H', entry: 3310,   target: 3720,   stopLoss: 3120,   riskReward: 2.2, sector: 'Crypto' },
  { asset: 'SOL/USD',  direction: 'SELL', confidence: 81, timeframe: '4H', entry: 172,    target: 152,    stopLoss: 182,    riskReward: 2.0, sector: 'Crypto' },
  { asset: 'BNB/USD',  direction: 'BUY',  confidence: 78, timeframe: '4H', entry: 412,    target: 458,    stopLoss: 390,    riskReward: 2.1, sector: 'Crypto' },
  { asset: 'AVAX/USD', direction: 'BUY',  confidence: 83, timeframe: '1H', entry: 38.40,  target: 44.80,  stopLoss: 35.20,  riskReward: 2.0, sector: 'Crypto' },
  { asset: 'LINK/USD', direction: 'BUY',  confidence: 80, timeframe: '4H', entry: 14.82,  target: 17.40,  stopLoss: 13.50,  riskReward: 1.96, sector: 'Crypto' },
  { asset: 'XRP/USD',  direction: 'SELL', confidence: 77, timeframe: '1H', entry: 0.5820, target: 0.5240, stopLoss: 0.6100, riskReward: 2.07, sector: 'Crypto' },
  // Equity
  { asset: 'MSFT',     direction: 'BUY',  confidence: 85, timeframe: '1D', entry: 418.20, target: 448.00, stopLoss: 402.00, riskReward: 1.86, sector: 'Equity' },
  { asset: 'AMZN',     direction: 'BUY',  confidence: 82, timeframe: '1D', entry: 184.60, target: 202.00, stopLoss: 175.80, riskReward: 1.98, sector: 'Equity' },
  { asset: 'META',     direction: 'SELL', confidence: 79, timeframe: '1D', entry: 512.40, target: 478.00, stopLoss: 530.00, riskReward: 1.96, sector: 'Equity' },
  { asset: 'GOOGL',    direction: 'BUY',  confidence: 84, timeframe: '1D', entry: 172.80, target: 188.00, stopLoss: 164.40, riskReward: 1.81, sector: 'Equity' },
  { asset: 'AMD',      direction: 'BUY',  confidence: 88, timeframe: '4H', entry: 162.40, target: 182.00, stopLoss: 152.00, riskReward: 1.88, sector: 'Equity' },
  { asset: 'JPM',      direction: 'HOLD', confidence: 71, timeframe: '1D', entry: 198.40, target: 210.00, stopLoss: 190.00, riskReward: 1.38, sector: 'Equity' },
  // Forex
  { asset: 'GBP/USD',  direction: 'BUY',  confidence: 80, timeframe: '1H', entry: 1.2640, target: 1.2820, stopLoss: 1.2540, riskReward: 1.80, sector: 'Forex' },
  { asset: 'USD/CAD',  direction: 'SELL', confidence: 76, timeframe: '4H', entry: 1.3680, target: 1.3480, stopLoss: 1.3780, riskReward: 2.00, sector: 'Forex' },
  { asset: 'AUD/USD',  direction: 'BUY',  confidence: 74, timeframe: '1H', entry: 0.6520, target: 0.6680, stopLoss: 0.6440, riskReward: 2.00, sector: 'Forex' },
  // Commodity
  { asset: 'SILVER',   direction: 'BUY',  confidence: 77, timeframe: '1D', entry: 27.40,  target: 30.20,  stopLoss: 25.80,  riskReward: 1.75, sector: 'Commodity' },
  { asset: 'OIL/WTI',  direction: 'SELL', confidence: 75, timeframe: '4H', entry: 82.40,  target: 77.20,  stopLoss: 85.00,  riskReward: 2.00, sector: 'Commodity' },
  // Index
  { asset: 'NQ100',    direction: 'BUY',  confidence: 83, timeframe: '1H', entry: 18240,  target: 18820,  stopLoss: 17960,  riskReward: 2.07, sector: 'Index' },
  { asset: 'DJI',      direction: 'HOLD', confidence: 69, timeframe: '1D', entry: 38800,  target: 39600,  stopLoss: 38200,  riskReward: 1.33, sector: 'Index' },
];

let _counter = 100; // start IDs high so they don't clash with mock data

/**
 * Pick a random template from the pool (excluding any already-active assets)
 * and return a fully-formed CueItem with a fresh timestamp.
 */
export const generateNewSignal = (existingAssets: string[]): CueItem => {
  // Prefer assets not already in the list; fall back to any if all are present
  const available = SIGNAL_POOL.filter(t => !existingAssets.includes(t.asset));
  const pool = available.length > 0 ? available : SIGNAL_POOL;
  const tpl = pool[Math.floor(Math.random() * pool.length)];

  _counter += 1;
  return {
    id: `live_${_counter}`,
    asset: tpl.asset,
    direction: tpl.direction,
    confidence: tpl.confidence,
    timeframe: tpl.timeframe,
    entry: tpl.entry,
    target: tpl.target,
    stopLoss: tpl.stopLoss,
    riskReward: tpl.riskReward,
    sector: tpl.sector,
    age: 'just now',
    generatedAt: Date.now(),
    status: 'active',
  };
};

/** Interval range for new signal simulation (ms) */
export const SIGNAL_INTERVAL_MIN = 2 * 60 * 1000; // 2 minutes
export const SIGNAL_INTERVAL_MAX = 4 * 60 * 1000; // 4 minutes

/** Pick a random interval between min and max */
export const randomInterval = () =>
  SIGNAL_INTERVAL_MIN + Math.random() * (SIGNAL_INTERVAL_MAX - SIGNAL_INTERVAL_MIN);
