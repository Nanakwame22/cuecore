export const watchlistAssets = [
  { id: '1', symbol: 'BTC/USD', name: 'Bitcoin', price: 68420, change: 3.24, changeAmt: 2140, direction: 'BUY' as const, confidence: 91, sector: 'Crypto', volume: '42.1B', mktCap: '1.34T' },
  { id: '2', symbol: 'ETH/USD', name: 'Ethereum', price: 3241, change: 4.12, changeAmt: 128, direction: 'BUY' as const, confidence: 88, sector: 'Crypto', volume: '18.7B', mktCap: '389B' },
  { id: '3', symbol: 'NVDA', name: 'NVIDIA Corp', price: 892.40, change: 1.83, changeAmt: 16.02, direction: 'BUY' as const, confidence: 87, sector: 'Equity', volume: '4.2B', mktCap: '2.19T' },
  { id: '4', symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0842, change: -0.41, changeAmt: -0.0045, direction: 'SELL' as const, confidence: 83, sector: 'Forex', volume: '6.8B', mktCap: '—' },
  { id: '5', symbol: 'GOLD', name: 'Gold Spot', price: 2318.50, change: 0.22, changeAmt: 5.10, direction: 'HOLD' as const, confidence: 72, sector: 'Commodity', volume: '1.1B', mktCap: '—' },
  { id: '6', symbol: 'TSLA', name: 'Tesla Inc', price: 178.20, change: -2.14, changeAmt: -3.90, direction: 'SELL' as const, confidence: 79, sector: 'Equity', volume: '2.9B', mktCap: '567B' },
  { id: '7', symbol: 'SOL/USD', name: 'Solana', price: 168.40, change: 5.31, changeAmt: 8.50, direction: 'BUY' as const, confidence: 85, sector: 'Crypto', volume: '3.4B', mktCap: '74B' },
  { id: '8', symbol: 'AAPL', name: 'Apple Inc', price: 189.30, change: 0.94, changeAmt: 1.76, direction: 'HOLD' as const, confidence: 68, sector: 'Equity', volume: '3.1B', mktCap: '2.91T' },
  { id: '9', symbol: 'USD/JPY', name: 'US Dollar / Yen', price: 151.82, change: -0.18, changeAmt: -0.27, direction: 'SELL' as const, confidence: 76, sector: 'Forex', volume: '5.2B', mktCap: '—' },
  { id: '10', symbol: 'SPX', name: 'S&P 500 Index', price: 5204, change: 0.67, changeAmt: 34.6, direction: 'BUY' as const, confidence: 74, sector: 'Index', volume: '—', mktCap: '—' },
];

export interface OptionsMeta {
  optionType: 'CALL' | 'PUT';
  strike: number;
  expiry: string;
  premium: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  underlying: string;
  underlyingPrice: number;
  dte: number;
}

export interface CueItem {
  id: string;
  asset: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timeframe: string;
  entry: number;
  target: number;
  stopLoss: number;
  riskReward: number;
  sector: string;
  age: string;
  generatedAt: number; // Unix ms timestamp — used for live relative time display
  status: 'active';
  options?: OptionsMeta;
}

// Helper: generate a timestamp N minutes/hours ago from now (at module load time)
const minsAgo = (m: number) => Date.now() - m * 60 * 1000;
const hoursAgo = (h: number) => Date.now() - h * 60 * 60 * 1000;

export const dashboardCues: CueItem[] = [
  { id: 'c1', asset: 'BTC/USD', direction: 'BUY', confidence: 91, timeframe: '4H', entry: 68420, target: 74800, stopLoss: 65900, riskReward: 2.4, sector: 'Crypto', age: '2m ago', generatedAt: minsAgo(2), status: 'active' },
  { id: 'c2', asset: 'NVDA', direction: 'BUY', confidence: 87, timeframe: '1D', entry: 892.4, target: 960, stopLoss: 858, riskReward: 1.97, sector: 'Equity', age: '8m ago', generatedAt: minsAgo(8), status: 'active' },
  { id: 'c3', asset: 'EUR/USD', direction: 'SELL', confidence: 83, timeframe: '1H', entry: 1.084, target: 1.076, stopLoss: 1.089, riskReward: 1.71, sector: 'Forex', age: '14m ago', generatedAt: minsAgo(14), status: 'active' },
  { id: 'c4', asset: 'SOL/USD', direction: 'BUY', confidence: 85, timeframe: '4H', entry: 168.4, target: 192, stopLoss: 158, riskReward: 2.27, sector: 'Crypto', age: '21m ago', generatedAt: minsAgo(21), status: 'active' },
  { id: 'c5', asset: 'TSLA', direction: 'SELL', confidence: 79, timeframe: '1D', entry: 178.2, target: 162, stopLoss: 186, riskReward: 2.08, sector: 'Equity', age: '35m ago', generatedAt: minsAgo(35), status: 'active' },
  { id: 'c6', asset: 'GOLD', direction: 'HOLD', confidence: 72, timeframe: '1D', entry: 2318.5, target: 2380, stopLoss: 2280, riskReward: 1.6, sector: 'Commodity', age: '1h ago', generatedAt: hoursAgo(1), status: 'active' },
  { id: 'c7', asset: 'ETH/USD', direction: 'BUY', confidence: 88, timeframe: '4H', entry: 3241, target: 3680, stopLoss: 3050, riskReward: 2.32, sector: 'Crypto', age: '1h ago', generatedAt: minsAgo(72), status: 'active' },
  { id: 'c8', asset: 'AAPL', direction: 'HOLD', confidence: 68, timeframe: '1D', entry: 189.3, target: 198, stopLoss: 183, riskReward: 1.4, sector: 'Equity', age: '2h ago', generatedAt: hoursAgo(2), status: 'active' },
  {
    id: 'c9', asset: 'SPY 520C', direction: 'BUY', confidence: 86, timeframe: '1D', entry: 8.40, target: 14.20, stopLoss: 5.10, riskReward: 1.78, sector: 'Options', age: '5m ago', generatedAt: minsAgo(5), status: 'active',
    options: { optionType: 'CALL', strike: 520, expiry: '2026-04-18', premium: 8.40, iv: 18.4, delta: 0.52, gamma: 0.031, theta: -0.18, vega: 0.24, underlying: 'SPY', underlyingPrice: 518.60, dte: 10 },
  },
  {
    id: 'c10', asset: 'NVDA 900P', direction: 'BUY', confidence: 82, timeframe: '1D', entry: 12.60, target: 22.80, stopLoss: 7.40, riskReward: 2.12, sector: 'Options', age: '18m ago', generatedAt: minsAgo(18), status: 'active',
    options: { optionType: 'PUT', strike: 900, expiry: '2026-04-25', premium: 12.60, iv: 31.7, delta: -0.44, gamma: 0.028, theta: -0.31, vega: 0.38, underlying: 'NVDA', underlyingPrice: 892.40, dte: 17 },
  },
  {
    id: 'c11', asset: 'AAPL 195C', direction: 'BUY', confidence: 78, timeframe: '1D', entry: 3.80, target: 7.10, stopLoss: 2.10, riskReward: 1.94, sector: 'Options', age: '42m ago', generatedAt: minsAgo(42), status: 'active',
    options: { optionType: 'CALL', strike: 195, expiry: '2026-05-02', premium: 3.80, iv: 22.1, delta: 0.38, gamma: 0.042, theta: -0.09, vega: 0.17, underlying: 'AAPL', underlyingPrice: 189.30, dte: 24 },
  },
  {
    id: 'c12', asset: 'TSLA 175P', direction: 'BUY', confidence: 81, timeframe: '1D', entry: 9.20, target: 17.50, stopLoss: 5.30, riskReward: 2.24, sector: 'Options', age: '1h ago', generatedAt: minsAgo(68), status: 'active',
    options: { optionType: 'PUT', strike: 175, expiry: '2026-04-18', premium: 9.20, iv: 48.3, delta: -0.51, gamma: 0.035, theta: -0.42, vega: 0.29, underlying: 'TSLA', underlyingPrice: 178.20, dte: 10 },
  },
];

export const historyData = [
  { id: 'h1', asset: 'BTC/USD', direction: 'BUY' as const, confidence: 89, timeframe: '4H', entry: 64200, exit: 71400, target: 72000, stopLoss: 61500, riskReward: 2.6, outcome: 'win' as const, pnlPct: 11.2, sector: 'Crypto', openedAt: '2026-03-28', closedAt: '2026-04-01' },
  { id: 'h2', asset: 'NVDA', direction: 'SELL' as const, confidence: 81, timeframe: '1D', entry: 920.00, exit: 880.00, target: 870.00, stopLoss: 940.00, riskReward: 2.5, outcome: 'win' as const, pnlPct: 4.3, sector: 'Equity', openedAt: '2026-03-25', closedAt: '2026-03-29' },
  { id: 'h3', asset: 'EUR/USD', direction: 'BUY' as const, confidence: 76, timeframe: '1H', entry: 1.0780, exit: 1.0760, target: 1.0860, stopLoss: 1.0740, riskReward: 2.0, outcome: 'loss' as const, pnlPct: -0.5, sector: 'Forex', openedAt: '2026-03-22', closedAt: '2026-03-22' },
  { id: 'h4', asset: 'SOL/USD', direction: 'BUY' as const, confidence: 84, timeframe: '4H', entry: 148.00, exit: 172.00, target: 175.00, stopLoss: 138.00, riskReward: 2.7, outcome: 'win' as const, pnlPct: 16.2, sector: 'Crypto', openedAt: '2026-03-18', closedAt: '2026-03-24' },
  { id: 'h5', asset: 'TSLA', direction: 'BUY' as const, confidence: 74, timeframe: '1D', entry: 192.00, exit: 183.00, target: 215.00, stopLoss: 182.00, riskReward: 2.3, outcome: 'loss' as const, pnlPct: -4.7, sector: 'Equity', openedAt: '2026-03-15', closedAt: '2026-03-18' },
  { id: 'h6', asset: 'GOLD', direction: 'BUY' as const, confidence: 82, timeframe: '1D', entry: 2280.00, exit: 2340.00, target: 2350.00, stopLoss: 2250.00, riskReward: 2.3, outcome: 'win' as const, pnlPct: 2.6, sector: 'Commodity', openedAt: '2026-03-10', closedAt: '2026-03-14' },
  { id: 'h7', asset: 'ETH/USD', direction: 'SELL' as const, confidence: 80, timeframe: '4H', entry: 3480, exit: 3200, target: 3150, stopLoss: 3580, riskReward: 3.3, outcome: 'win' as const, pnlPct: 8.0, sector: 'Crypto', openedAt: '2026-03-05', closedAt: '2026-03-08' },
  { id: 'h8', asset: 'AAPL', direction: 'SELL' as const, confidence: 71, timeframe: '1D', entry: 198.00, exit: 198.50, target: 185.00, stopLoss: 204.00, riskReward: 2.2, outcome: 'loss' as const, pnlPct: -0.3, sector: 'Equity', openedAt: '2026-03-01', closedAt: '2026-03-03' },
  { id: 'h9', asset: 'USD/JPY', direction: 'BUY' as const, confidence: 78, timeframe: '4H', entry: 149.20, exit: 152.80, target: 153.00, stopLoss: 147.50, riskReward: 2.1, outcome: 'win' as const, pnlPct: 2.4, sector: 'Forex', openedAt: '2026-02-24', closedAt: '2026-02-28' },
  { id: 'h10', asset: 'BTC/USD', direction: 'SELL' as const, confidence: 77, timeframe: '1D', entry: 72400, exit: 68100, target: 67000, stopLoss: 74800, riskReward: 2.2, outcome: 'win' as const, pnlPct: 5.9, sector: 'Crypto', openedAt: '2026-02-18', closedAt: '2026-02-22' },
];

export const alertsData = [
  { id: 'a1', asset: 'BTC/USD', type: 'confidence', condition: 'above', value: 85, active: true, triggered: false, lastTriggered: null },
  { id: 'a2', asset: 'NVDA', type: 'direction', condition: 'BUY', value: null, active: true, triggered: true, lastTriggered: '2h ago' },
  { id: 'a3', asset: 'EUR/USD', type: 'price', condition: 'below', value: 1.0800, active: true, triggered: false, lastTriggered: null },
  { id: 'a4', asset: 'GOLD', type: 'confidence', condition: 'above', value: 80, active: false, triggered: false, lastTriggered: null },
  { id: 'a5', asset: 'ETH/USD', type: 'direction', condition: 'SELL', value: null, active: true, triggered: false, lastTriggered: null },
  { id: 'a6', asset: 'TSLA', type: 'price', condition: 'above', value: 190.00, active: true, triggered: true, lastTriggered: '1d ago' },
];

export const dashboardStats = [
  { label: 'Active Cues', value: '24', change: '+3', up: true, icon: 'ri-flashlight-line' },
  { label: 'Avg Confidence', value: '83.4%', change: '+1.2%', up: true, icon: 'ri-bar-chart-line' },
  { label: 'Win Rate (30d)', value: '74.1%', change: '+2.3%', up: true, icon: 'ri-trophy-line' },
  { label: 'Open R/R Avg', value: '2.18', change: '-0.04', up: false, icon: 'ri-scales-line' },
];

export const cueEngineFilters = {
  sectors: ['All', 'Crypto', 'Equity', 'Forex', 'Commodity', 'Options', 'Index'],
  timeframes: ['All', '1H', '4H', '1D', '1W'],
  directions: ['All', 'BUY', 'SELL', 'HOLD'],
  confidence: [60, 70, 75, 80, 85, 90],
};

// ── Chart data ────────────────────────────────────────────────────────────────

export interface OHLCBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bullish: boolean;
}

// Seeded pseudo-random so bars are stable per asset+timeframe combo
const seededRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

const tfConfig: Record<string, { bars: number; volatility: number; trend: number }> = {
  '1m': { bars: 80, volatility: 0.0008, trend: 0.00005 },
  '5m': { bars: 80, volatility: 0.002, trend: 0.0001 },
  '15m': { bars: 80, volatility: 0.003, trend: 0.00015 },
  '1H': { bars: 60, volatility: 0.004, trend: 0.0002 },
  '4H': { bars: 60, volatility: 0.009, trend: 0.0005 },
  '1D': { bars: 60, volatility: 0.018, trend: 0.001 },
  '1W': { bars: 52, volatility: 0.038, trend: 0.002 },
};

export const generateChartBars = (assetId: string, tf: string, basePrice: number): OHLCBar[] => {
  const cfg = tfConfig[tf] ?? tfConfig['4H'];
  const seed = assetId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * (tf.charCodeAt(0) + tf.length);
  const rand = seededRand(seed);

  const bars: OHLCBar[] = [];
  // Start price slightly below base so it trends toward it
  let price = basePrice * (0.88 + rand() * 0.06);

  for (let i = 0; i < cfg.bars; i++) {
    const open = price;
    const drift = (rand() - 0.47 + cfg.trend) * cfg.volatility * open;
    const close = open + drift;
    const wickUp = rand() * cfg.volatility * 0.6 * open;
    const wickDown = rand() * cfg.volatility * 0.6 * open;
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;
    const volume = 0.4 + rand() * 0.6;
    bars.push({ open, high, low, close, volume, bullish: close >= open });
    price = close;
  }
  return bars;
};

export const chartIndicators: Record<string, Record<string, { rsi: number; macd: string; bbWidth: string; atr: string; volRatio: string }>> = {
  '1': {
    '1H': { rsi: 58.4, macd: '+0.0024', bbWidth: '1.82%', atr: '0.0041', volRatio: '1.8x' },
    '4H': { rsi: 62.1, macd: '+0.0081', bbWidth: '2.14%', atr: '0.0082', volRatio: '2.3x' },
    '1D': { rsi: 67.3, macd: '+0.0210', bbWidth: '3.40%', atr: '0.0190', volRatio: '2.7x' },
    '1W': { rsi: 71.8, macd: '+0.0540', bbWidth: '5.20%', atr: '0.0420', volRatio: '3.1x' },
  },
  '2': {
    '1H': { rsi: 54.2, macd: '+0.0018', bbWidth: '1.60%', atr: '0.0038', volRatio: '1.6x' },
    '4H': { rsi: 59.7, macd: '+0.0062', bbWidth: '2.30%', atr: '0.0074', volRatio: '2.1x' },
    '1D': { rsi: 64.1, macd: '+0.0180', bbWidth: '3.10%', atr: '0.0170', volRatio: '2.4x' },
    '1W': { rsi: 68.5, macd: '+0.0490', bbWidth: '4.80%', atr: '0.0390', volRatio: '2.9x' },
  },
  '3': {
    '1H': { rsi: 61.0, macd: '+0.0031', bbWidth: '1.90%', atr: '0.0044', volRatio: '2.0x' },
    '4H': { rsi: 65.4, macd: '+0.0094', bbWidth: '2.50%', atr: '0.0088', volRatio: '2.5x' },
    '1D': { rsi: 70.2, macd: '+0.0240', bbWidth: '3.70%', atr: '0.0210', volRatio: '2.9x' },
    '1W': { rsi: 74.6, macd: '+0.0610', bbWidth: '5.60%', atr: '0.0460', volRatio: '3.4x' },
  },
};

// Fallback indicators for assets not in the map
export const defaultIndicators = (tf: string) => {
  const base: Record<string, { rsi: number; macd: string; bbWidth: string; atr: string; volRatio: string }> = {
    '1H': { rsi: 52.0, macd: '+0.0010', bbWidth: '1.50%', atr: '0.0030', volRatio: '1.5x' },
    '4H': { rsi: 56.0, macd: '+0.0050', bbWidth: '2.00%', atr: '0.0070', volRatio: '2.0x' },
    '1D': { rsi: 60.0, macd: '+0.0150', bbWidth: '3.00%', atr: '0.0160', volRatio: '2.3x' },
    '1W': { rsi: 65.0, macd: '+0.0400', bbWidth: '4.50%', atr: '0.0360', volRatio: '2.7x' },
  };
  return base[tf] ?? base['4H'];
};
