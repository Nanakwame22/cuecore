import { useState, useEffect, useRef, useCallback } from 'react';

export interface SignalNotification {
  id: string;
  asset: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timeframe: string;
  sector: string;
  entry: number | string;
  rr: number;
  timestamp: Date;
  read: boolean;
}

// Pool of signals that can fire as "new" alerts
const SIGNAL_POOL: Omit<SignalNotification, 'id' | 'timestamp' | 'read'>[] = [
  { asset: 'BTC/USD', direction: 'BUY', confidence: 93, timeframe: '4H', sector: 'Crypto', entry: 69140, rr: 2.6 },
  { asset: 'ETH/USD', direction: 'BUY', confidence: 89, timeframe: '4H', sector: 'Crypto', entry: 3310, rr: 2.4 },
  { asset: 'NVDA', direction: 'SELL', confidence: 84, timeframe: '1D', sector: 'Equity', entry: 910.5, rr: 2.1 },
  { asset: 'EUR/USD', direction: 'SELL', confidence: 87, timeframe: '1H', sector: 'Forex', entry: 1.0812, rr: 1.9 },
  { asset: 'SOL/USD', direction: 'BUY', confidence: 91, timeframe: '4H', sector: 'Crypto', entry: 172.8, rr: 2.5 },
  { asset: 'GOLD', direction: 'BUY', confidence: 82, timeframe: '1D', sector: 'Commodity', entry: 2341, rr: 1.8 },
  { asset: 'TSLA', direction: 'BUY', confidence: 80, timeframe: '1D', sector: 'Equity', entry: 174.6, rr: 2.2 },
  { asset: 'SPY 525C', direction: 'BUY', confidence: 88, timeframe: '1D', sector: 'Options', entry: 9.40, rr: 2.0 },
  { asset: 'AAPL', direction: 'SELL', confidence: 83, timeframe: '1D', sector: 'Equity', entry: 191.2, rr: 1.95 },
  { asset: 'USD/JPY', direction: 'BUY', confidence: 86, timeframe: '4H', sector: 'Forex', entry: 152.4, rr: 2.1 },
  { asset: 'BNB/USD', direction: 'BUY', confidence: 85, timeframe: '4H', sector: 'Crypto', entry: 412.5, rr: 2.3 },
  { asset: 'AMZN', direction: 'BUY', confidence: 90, timeframe: '1D', sector: 'Equity', entry: 184.3, rr: 2.4 },
];

const INTERVAL_MS = 18000; // new signal every ~18s for demo

export const useSignalAlerts = (minConfidence: number = 80) => {
  const [notifications, setNotifications] = useState<SignalNotification[]>([]);
  const [toastQueue, setToastQueue] = useState<SignalNotification[]>([]);
  const poolIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fireSignal = useCallback(() => {
    const pool = SIGNAL_POOL.filter(s => s.confidence >= minConfidence);
    if (pool.length === 0) return;

    const idx = poolIndexRef.current % pool.length;
    poolIndexRef.current += 1;

    const signal: SignalNotification = {
      ...pool[idx],
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [signal, ...prev].slice(0, 50));
    setToastQueue(prev => [...prev, signal]);
  }, [minConfidence]);

  // Start interval on mount
  useEffect(() => {
    // Fire one immediately after a short delay so user sees it quickly
    const initial = setTimeout(() => fireSignal(), 4000);
    intervalRef.current = setInterval(fireSignal, INTERVAL_MS);

    return () => {
      clearTimeout(initial);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fireSignal]);

  const dismissToast = useCallback((id: string) => {
    setToastQueue(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, toastQueue, dismissToast, markAllRead, markRead, unreadCount };
};
