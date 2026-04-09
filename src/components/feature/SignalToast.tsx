import { useEffect, useState } from 'react';
import { SignalNotification } from '@/hooks/useSignalAlerts';

interface SignalToastProps {
  signal: SignalNotification;
  onDismiss: (id: string) => void;
}

const dirColor = (d: string) => {
  if (d === 'BUY') return { color: '#00D084', bg: 'rgba(0,208,132,0.12)', border: 'rgba(0,208,132,0.28)' };
  if (d === 'SELL') return { color: '#FF4D4D', bg: 'rgba(255,77,77,0.12)', border: 'rgba(255,77,77,0.28)' };
  return { color: '#9CA3AF', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.25)' };
};

const fmtEntry = (v: number | string) => {
  if (typeof v === 'string') return v;
  if (v < 10) return v.toFixed(3);
  if (v < 100) return v.toFixed(2);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const AUTO_DISMISS_MS = 7000;

const SignalToast = ({ signal, onDismiss }: SignalToastProps) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ds = dirColor(signal.direction);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(signal.id), 320);
  };

  useEffect(() => {
    // Slide in
    const show = setTimeout(() => setVisible(true), 20);
    // Auto dismiss
    const auto = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(auto);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="w-80 rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: '#0d1117',
        border: '1px solid rgba(245,158,11,0.30)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        transform: visible && !leaving ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: leaving ? 0 : 1,
      }}
    >
      {/* Amber top bar */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cc-amber pulse-dot" />
            <span className="text-xs font-mono text-cc-amber tracking-wider">NEW SIGNAL</span>
          </div>
          <button
            onClick={dismiss}
            className="w-5 h-5 flex items-center justify-center text-cc-muted hover:text-cc-text transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        {/* Asset + direction */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="font-grotesk font-700 text-white text-base">{signal.asset}</span>
          <span
            className="text-xs px-2 py-0.5 rounded font-mono font-700"
            style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
          >
            {signal.direction}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-mono"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8' }}
          >
            {signal.timeframe}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs mb-3">
          <div>
            <span className="text-cc-muted">Entry </span>
            <span className="font-mono text-cc-text">{fmtEntry(signal.entry)}</span>
          </div>
          <div>
            <span className="text-cc-muted">R/R </span>
            <span className="font-mono text-cc-amber">{signal.rr}:1</span>
          </div>
          <div>
            <span className="text-cc-muted">Conf </span>
            <span className="font-mono font-700 text-cc-amber">{signal.confidence}%</span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${signal.confidence}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}
          />
        </div>

        {/* Sector + time */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded font-mono"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#4E5A6B' }}
          >
            {signal.sector}
          </span>
          <span className="text-xs text-cc-muted">just now</span>
        </div>
      </div>

      {/* Progress bar (auto-dismiss timer) */}
      <div className="h-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full"
          style={{
            background: 'rgba(245,158,11,0.40)',
            animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SignalToast;
