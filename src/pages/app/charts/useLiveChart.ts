import { useState, useEffect, useRef, useCallback } from 'react';
import { OHLCBar, generateChartBars } from '@/mocks/appData';

// Timeframe → tick interval (ms) + bar duration (ms)
const TF_CONFIG: Record<string, { tickMs: number; barMs: number }> = {
  'S5':  { tickMs: 200,  barMs: 5_000 },
  'S10': { tickMs: 300,  barMs: 10_000 },
  'S30': { tickMs: 400,  barMs: 30_000 },
  '1m':  { tickMs: 500,  barMs: 60_000 },
  '2m':  { tickMs: 600,  barMs: 120_000 },
  '3m':  { tickMs: 700,  barMs: 180_000 },
  '5m':  { tickMs: 800,  barMs: 300_000 },
  '10m': { tickMs: 900,  barMs: 600_000 },
  '15m': { tickMs: 1000, barMs: 900_000 },
  '30m': { tickMs: 1200, barMs: 1_800_000 },
  '1H':  { tickMs: 1500, barMs: 3_600_000 },
  '4H':  { tickMs: 2000, barMs: 14_400_000 },
  'D1':  { tickMs: 3000, barMs: 86_400_000 },
};

// Volatility per timeframe (price % per tick)
const TF_VOL: Record<string, number> = {
  'S5': 0.0003, 'S10': 0.0004, 'S30': 0.0005,
  '1m': 0.0006, '2m': 0.0007, '3m': 0.0008,
  '5m': 0.001,  '10m': 0.0012, '15m': 0.0015,
  '30m': 0.002, '1H': 0.003, '4H': 0.006, 'D1': 0.012,
};

export interface LiveChartState {
  bars: OHLCBar[];           // historical bars (stable)
  liveBar: OHLCBar | null;   // currently forming bar (updates every tick)
  livePrice: number;         // latest tick price
  barProgress: number;       // 0–1 how far through current bar
  isLive: boolean;
}

const legacyTf = (tf: string): string => {
  const map: Record<string, string> = {
    'S5': '1H', 'S10': '1H', 'S30': '1H',
    '1m': '1H', '2m': '1H', '3m': '1H',
    '5m': '1H', '10m': '4H', '15m': '4H',
    '30m': '4H', '1H': '4H', '4H': '4H', 'D1': '1D',
  };
  return map[tf] ?? '4H';
};

export const useLiveChart = (
  assetId: string,
  tf: string,
  basePrice: number,
): LiveChartState => {
  const cfg = TF_CONFIG[tf] ?? TF_CONFIG['1H'];
  const vol = TF_VOL[tf] ?? 0.003;

  // Seed historical bars once per asset+tf combo
  const [historicalBars, setHistoricalBars] = useState<OHLCBar[]>(() =>
    generateChartBars(assetId, legacyTf(tf), basePrice)
  );

  const [liveBar, setLiveBar] = useState<OHLCBar | null>(null);
  const [livePrice, setLivePrice] = useState(basePrice);
  const [barProgress, setBarProgress] = useState(0);

  // Refs for mutable state inside intervals
  const priceRef = useRef(basePrice);
  const livBarRef = useRef<OHLCBar | null>(null);
  const barStartRef = useRef(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const barTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when asset or timeframe changes
  useEffect(() => {
    const newBars = generateChartBars(assetId, legacyTf(tf), basePrice);
    setHistoricalBars(newBars);

    // Init live bar from last bar
    const last = newBars[newBars.length - 1];
    const initBar: OHLCBar = { ...last };
    priceRef.current = last.close;
    livBarRef.current = initBar;
    setLiveBar(initBar);
    setLivePrice(last.close);
    setBarProgress(0);
    barStartRef.current = Date.now();
  }, [assetId, tf, basePrice]);

  // Tick engine
  useEffect(() => {
    const tick = () => {
      // Generate next price tick — Brownian motion with slight mean reversion
      const prev = priceRef.current;
      const drift = (Math.random() - 0.499) * vol * prev;
      const meanRevert = (basePrice - prev) * 0.0001; // gentle pull toward base
      const next = Math.max(prev * 0.5, prev + drift + meanRevert);
      priceRef.current = next;

      // Update live bar OHLC
      setLiveBar(prev => {
        if (!prev) return null;
        const updated: OHLCBar = {
          open: prev.open,
          high: Math.max(prev.high, next),
          low: Math.min(prev.low, next),
          close: next,
          volume: prev.volume + Math.random() * 0.002,
          bullish: next >= prev.open,
        };
        livBarRef.current = updated;
        return updated;
      });

      setLivePrice(next);

      // Update bar progress
      const elapsed = Date.now() - barStartRef.current;
      setBarProgress(Math.min(1, elapsed / cfg.barMs));
    };

    tickRef.current = setInterval(tick, cfg.tickMs);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [assetId, tf, basePrice, cfg.tickMs, cfg.barMs, vol]);

  // Bar completion engine — seal the live bar and start a new one
  useEffect(() => {
    const complete = () => {
      const sealed = livBarRef.current;
      if (!sealed) return;

      // Append sealed bar to historical
      setHistoricalBars(prev => {
        const updated = [...prev.slice(-199), { ...sealed }];
        return updated;
      });

      // Start fresh bar
      const newOpen = priceRef.current;
      const fresh: OHLCBar = {
        open: newOpen, high: newOpen, low: newOpen, close: newOpen,
        volume: 0.1 + Math.random() * 0.3, bullish: true,
      };
      livBarRef.current = fresh;
      setLiveBar(fresh);
      barStartRef.current = Date.now();
      setBarProgress(0);
    };

    barTimerRef.current = setInterval(complete, cfg.barMs);
    return () => {
      if (barTimerRef.current) clearInterval(barTimerRef.current);
    };
  }, [assetId, tf, cfg.barMs]);

  return {
    bars: historicalBars,
    liveBar,
    livePrice,
    barProgress,
    isLive: true,
  };
};
