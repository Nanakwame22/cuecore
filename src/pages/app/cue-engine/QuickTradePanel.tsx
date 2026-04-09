import { useState, useEffect } from 'react';
import { CueItem } from '@/mocks/appData';

interface QuickTradePanelProps {
  cue: CueItem;
  onClose: () => void;
}

// ── Timeframe → Pocket Option expiry mapping ─────────────────────────────────
const TF_EXPIRY: Record<string, { label: string; minutes: number }> = {
  '1H':  { label: '45 – 60 min',  minutes: 55  },
  '4H':  { label: '3 – 4 hours',  minutes: 210 },
  '1D':  { label: 'End of day',   minutes: 480 },
  '1W':  { label: '5 – 7 days',   minutes: 7200 },
};

// ── Direction → PO trade type ─────────────────────────────────────────────────
const getTradeType = (dir: string, optType?: 'CALL' | 'PUT') => {
  if (optType) return optType; // options already have CALL/PUT
  if (dir === 'BUY')  return 'CALL';
  if (dir === 'SELL') return 'PUT';
  return null; // HOLD = skip
};

const fmtEntry = (v: number) => {
  if (v < 10)  return v.toFixed(3);
  if (v < 100) return v.toFixed(2);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// ── Countdown to expiry ───────────────────────────────────────────────────────
const useCountdown = (minutes: number) => {
  const [secs, setSecs] = useState(minutes * 60);
  useEffect(() => {
    setSecs(minutes * 60);
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [minutes]);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ── Checklist items ───────────────────────────────────────────────────────────
const buildChecklist = (cue: CueItem) => [
  { id: 'conf',   label: `Confidence ≥ 80%`,          pass: cue.confidence >= 80 },
  { id: 'hold',   label: 'Signal is not HOLD',         pass: cue.direction !== 'HOLD' },
  { id: 'rr',     label: 'R/R ratio ≥ 1.5:1',          pass: cue.riskReward >= 1.5 },
  { id: 'tf',     label: 'Timeframe is set correctly', pass: true },
  { id: 'amount', label: 'Trade ≤ 3% of account',      pass: true },
];

// ─────────────────────────────────────────────────────────────────────────────

const QuickTradePanel = ({ cue, onClose }: QuickTradePanelProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const tradeType  = getTradeType(cue.direction, cue.options?.optionType);
  const expiryInfo = TF_EXPIRY[cue.timeframe] ?? TF_EXPIRY['1D'];
  const checklist  = buildChecklist(cue);
  const allPassed  = checklist.every(c => c.pass || checkedItems[c.id]);
  const countdown  = useCountdown(expiryInfo.minutes);

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleCopy = () => {
    const text = [
      `=== CueCore Quick Trade ===`,
      `Asset:     ${cue.asset}`,
      `Action:    ${tradeType ?? 'SKIP (HOLD)'}`,
      `Entry:     ${fmtEntry(cue.entry)}`,
      `Expiry:    ${expiryInfo.label}`,
      `Conf:      ${cue.confidence}%`,
      `R/R:       ${cue.riskReward}:1`,
      `Timeframe: ${cue.timeframe}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isHold = cue.direction === 'HOLD';
  const isBuy  = tradeType === 'CALL';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-280"
        style={{ background: 'rgba(0,0,0,0.35)', opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed top-14 right-0 z-50 h-[calc(100vh-56px)] w-[340px] flex flex-col transition-transform duration-280"
        style={{
          background: '#111D28',
          borderLeft: '1px solid rgba(255,255,255,0.09)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 flex items-center justify-center rounded" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <i className="ri-flashlight-line text-cc-amber text-sm" />
            </div>
            <div>
              <div className="text-sm font-grotesk font-700 text-cc-text">Quick Trade</div>
              <div className="text-xs text-cc-muted">Pocket Option format</div>
            </div>
          </div>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center text-cc-muted hover:text-cc-text transition-colors cursor-pointer rounded">
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* ── Asset + trade type ── */}
            <div
              className="rounded-xl p-4"
              style={{ background: isHold ? 'rgba(107,114,128,0.08)' : isBuy ? 'rgba(0,208,132,0.06)' : 'rgba(255,77,77,0.06)', border: `1px solid ${isHold ? 'rgba(107,114,128,0.18)' : isBuy ? 'rgba(0,208,132,0.20)' : 'rgba(255,77,77,0.20)'}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-grotesk font-700 text-white text-lg">{cue.asset}</span>
                {isHold ? (
                  <span className="text-sm px-3 py-1.5 rounded-lg font-mono font-700" style={{ background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}>
                    SKIP TRADE
                  </span>
                ) : (
                  <span
                    className="text-base px-4 py-1.5 rounded-lg font-grotesk font-700 tracking-wide"
                    style={{
                      background: isBuy ? '#00D084' : '#FF4D4D',
                      color: '#fff',
                    }}
                  >
                    {tradeType}
                  </span>
                )}
              </div>

              {isHold ? (
                <p className="text-xs text-cc-muted leading-relaxed">
                  This signal is <strong className="text-cc-text">HOLD</strong> — no trade recommended on Pocket Option. Wait for a directional signal.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-cc-muted mb-1">Entry Price</div>
                    <div className="font-mono font-700 text-cc-text text-sm">{fmtEntry(cue.entry)}</div>
                  </div>
                  <div>
                    <div className="text-cc-muted mb-1">Timeframe</div>
                    <div className="font-mono font-700 text-cc-text text-sm">{cue.timeframe}</div>
                  </div>
                  <div>
                    <div className="text-cc-muted mb-1">Confidence</div>
                    <div className="font-mono font-700 text-cc-amber text-sm">{cue.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-cc-muted mb-1">R/R Ratio</div>
                    <div className="font-mono font-700 text-cc-amber text-sm">{cue.riskReward}:1</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Expiry block ── */}
            {!isHold && (
              <div className="rounded-xl p-4" style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">POCKET OPTION EXPIRY</div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-cc-muted text-xs mb-1">Suggested expiry</div>
                    <div className="text-cc-text font-grotesk font-700 text-sm">{expiryInfo.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cc-muted text-xs mb-1">Timer</div>
                    <div className="font-mono font-700 text-cc-amber text-base">{countdown}</div>
                  </div>
                </div>
                {/* TF mapping visual */}
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.entries(TF_EXPIRY).map(([tf, info]) => (
                    <div
                      key={tf}
                      className="rounded-lg p-2 text-center"
                      style={{
                        background: tf === cue.timeframe ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                        border: tf === cue.timeframe ? '1px solid rgba(245,158,11,0.30)' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="text-xs font-mono font-700" style={{ color: tf === cue.timeframe ? '#F59E0B' : '#5A7080' }}>{tf}</div>
                      <div className="text-xs mt-0.5" style={{ color: tf === cue.timeframe ? '#8FA3B3' : '#3A4A58', fontSize: '10px' }}>{info.label.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Pre-trade checklist ── */}
            {!isHold && (
              <div className="rounded-xl p-4" style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-mono text-cc-muted tracking-wider">PRE-TRADE CHECKLIST</div>
                  {allPassed && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(0,208,132,0.12)', color: '#00D084' }}>
                      READY
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  {checklist.map(item => {
                    const checked = item.pass || !!checkedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => !item.pass && setCheckedItems(p => ({ ...p, [item.id]: !p[item.id] }))}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: checked ? (item.pass ? 'rgba(0,208,132,0.15)' : 'rgba(245,158,11,0.15)') : 'rgba(255,255,255,0.05)',
                            border: checked ? `1px solid ${item.pass ? 'rgba(0,208,132,0.40)' : 'rgba(245,158,11,0.40)'}` : '1px solid rgba(255,255,255,0.12)',
                          }}
                        >
                          {checked && (
                            <i className="ri-check-line text-xs" style={{ color: item.pass ? '#00D084' : '#F59E0B' }} />
                          )}
                        </div>
                        <span className="text-xs transition-colors" style={{ color: checked ? '#E8EEF4' : '#5A7080' }}>
                          {item.label}
                        </span>
                        {item.pass && (
                          <span className="ml-auto text-xs font-mono" style={{ color: '#00D084' }}>auto</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Trade summary card ── */}
            {!isHold && (
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.14)' }}
              >
                <div className="text-xs font-mono text-cc-amber tracking-wider mb-3">TRADE SUMMARY</div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Platform',   value: 'Pocket Option' },
                    { label: 'Asset',      value: cue.asset },
                    { label: 'Direction',  value: tradeType ?? '' },
                    { label: 'Expiry',     value: expiryInfo.label },
                    { label: 'Entry at',   value: fmtEntry(cue.entry) },
                    { label: 'Target',     value: fmtEntry(cue.target) },
                    { label: 'Stop',       value: fmtEntry(cue.stopLoss) },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-cc-muted">{row.label}</span>
                      <span className="font-mono text-cc-text">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
        {!isHold && (
          <div
            className="p-4 flex flex-col gap-2.5 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Open PO button */}
            <a
              href="https://pocketoption.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-grotesk font-700 text-sm transition-all cursor-pointer whitespace-nowrap"
              style={{
                background: isBuy ? '#00D084' : '#FF4D4D',
                color: '#fff',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <i className={`${isBuy ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-base`} />
              Open {tradeType} on Pocket Option
              <i className="ri-external-link-line text-xs opacity-70" />
            </a>

            {/* Copy summary */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap"
              style={{
                background: copied ? 'rgba(0,208,132,0.10)' : 'rgba(255,255,255,0.05)',
                border: copied ? '1px solid rgba(0,208,132,0.25)' : '1px solid rgba(255,255,255,0.08)',
                color: copied ? '#00D084' : '#8FA3B3',
              }}
            >
              <i className={`${copied ? 'ri-check-line' : 'ri-clipboard-line'} text-sm`} />
              {copied ? 'Copied to clipboard!' : 'Copy trade summary'}
            </button>

            <p className="text-center text-xs text-cc-muted px-2">
              Not financial advice. Always manage your risk.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default QuickTradePanel;
