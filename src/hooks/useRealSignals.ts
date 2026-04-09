import { useState, useEffect, useRef, useCallback } from 'react';
import type { CueItem } from '@/mocks/appData';
import { scanAllSymbols } from '@/services/signalEngine';

const SCAN_INTERVAL_MS = 15 * 60 * 1000; // re-scan every 15 minutes
// Delay first scan so useLivePrices can complete its initial quote batch first.
// With 8 symbols at 10s spacing, the scan itself takes ~70s — well within budget.
const INITIAL_DELAY_MS = 30_000;

export interface RealSignalsState {
  signals: CueItem[];
  scanning: boolean;
  lastScanned: Date | null;
  error: string | null;
}

/**
 * Runs a full market scan on mount (and every 5 minutes thereafter).
 * Returns the latest computed CueItems derived from real OHLCV + indicators.
 */
export const useRealSignals = () => {
  const [state, setState] = useState<RealSignalsState>({
    signals: [],
    scanning: false,
    lastScanned: null,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const runScan = useCallback(async () => {
    if (!mountedRef.current) return;
    setState(prev => ({ ...prev, scanning: true, error: null }));

    try {
      const signals = await scanAllSymbols();
      if (!mountedRef.current) return;
      setState({ signals, scanning: false, lastScanned: new Date(), error: null });
    } catch (err) {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        scanning: false,
        error: err instanceof Error ? err.message : 'Scan failed',
      }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Wait 30s before first scan so useLivePrices can finish its initial batch
    const initTimer = setTimeout(() => {
      runScan();
      intervalRef.current = setInterval(runScan, SCAN_INTERVAL_MS);
    }, INITIAL_DELAY_MS);
    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runScan]);

  return { ...state, rescan: runScan };
};
