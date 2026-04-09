import { useState, useCallback } from 'react';

export type PlanTier = 'analyst' | 'desk' | 'institutional';

export interface PlanState {
  tier: PlanTier;
  name: string;
  setTier: (t: PlanTier) => void;
  isDesk: boolean;
  isInstitutional: boolean;
  isPremium: boolean; // desk or institutional
}

// Singleton state so it persists across components without context
let _tier: PlanTier = 'desk';
const _listeners: Array<() => void> = [];

const notify = () => _listeners.forEach(fn => fn());

export const usePlan = (): PlanState => {
  const [, forceUpdate] = useState(0);

  const setTier = useCallback((t: PlanTier) => {
    _tier = t;
    notify();
  }, []);

  // Subscribe to external changes
  useState(() => {
    const handler = () => forceUpdate(n => n + 1);
    _listeners.push(handler);
    return () => {
      const idx = _listeners.indexOf(handler);
      if (idx !== -1) _listeners.splice(idx, 1);
    };
  });

  return {
    tier: _tier,
    name: _tier === 'analyst' ? 'Analyst' : _tier === 'desk' ? 'Desk' : 'Institutional',
    setTier,
    isDesk: _tier === 'desk',
    isInstitutional: _tier === 'institutional',
    isPremium: _tier === 'desk' || _tier === 'institutional',
  };
};
