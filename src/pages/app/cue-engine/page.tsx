import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { dashboardCues, cueEngineFilters, CueItem } from '@/mocks/appData';
import { useReasoningCache } from './useReasoningCache';
import { usePlan } from '@/hooks/usePlan';
import PremiumGate from '@/components/feature/PremiumGate';
import QuickTradePanel from './QuickTradePanel';
import { useLivePrice } from '@/hooks/useLivePrices';
import { generateNewSignal, randomInterval } from './signalGenerator';
import { useRealSignals } from '@/hooks/useRealSignals';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns a live-updating relative time string from a Unix ms timestamp */
const timeAgo = (ts: number): string => {
  const diffMs = Date.now() - ts;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
};

const dirStyle = (d: string) => {
  if (d === 'BUY') return { bg: 'rgba(0,208,132,0.12)', color: '#00D084', border: 'rgba(0,208,132,0.25)' };
  if (d === 'SELL') return { bg: 'rgba(255,77,77,0.12)', color: '#FF4D4D', border: 'rgba(255,77,77,0.25)' };
  return { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', border: 'rgba(107,114,128,0.25)' };
};

const optTypeStyle = (t: 'CALL' | 'PUT') =>
  t === 'CALL'
    ? { bg: 'rgba(0,208,132,0.10)', color: '#00D084', border: 'rgba(0,208,132,0.22)' }
    : { bg: 'rgba(255,77,77,0.10)', color: '#FF4D4D', border: 'rgba(255,77,77,0.22)' };

const deriveFactors = (conf: number) => [
  { label: 'Technical', score: Math.min(100, Math.round(conf * 1.02 - 2)) },
  { label: 'Volume', score: Math.min(100, Math.round(conf * 1.04 - 1)) },
  { label: 'Sentiment', score: Math.max(40, Math.round(conf * 0.88 + 2)) },
  { label: 'Macro', score: Math.max(35, Math.round(conf * 0.76 - 3)) },
];

const fmtEntry = (v: number) => {
  if (v < 10) return v.toFixed(3);
  if (v < 100) return v.toFixed(2);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// ─── sub-components ─────────────────────────────────────────────────────────

const FilterGroup = ({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs text-cc-muted whitespace-nowrap">{label}</span>
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="text-xs px-2 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
          style={
            value === opt
              ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' }
              : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B', border: '1px solid transparent' }
          }
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const SkeletonLine = ({ width }: { width: string }) => (
  <div className="h-3 rounded animate-pulse" style={{ width, background: 'rgba(255,255,255,0.07)' }} />
);

// ─── Live price widget ────────────────────────────────────────────────────────
const LivePriceWidget = ({ symbol, entry }: { symbol: string; entry: number }) => {
  // Strip options suffix e.g. "SPY 520C" → "SPY"
  const baseSymbol = symbol.includes(' ') ? symbol.split(' ')[0] : symbol;
  const { price: live } = useLivePrice(baseSymbol);

  if (!live || live.loading) {
    return (
      <div className="rounded-lg p-3 mb-4 flex items-center gap-3" style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-4 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>
    );
  }

  if (live.error || live.price === 0) return null;

  const diff = entry > 0 ? ((live.price - entry) / entry) * 100 : 0;
  const abovEntry = live.price >= entry;

  return (
    <div className="rounded-lg p-3 mb-4" style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
          <span className="text-xs font-mono text-cc-muted tracking-wider">LIVE PRICE</span>
        </div>
        <span className={`text-xs font-mono ${live.change >= 0 ? 'text-cc-green' : 'text-cc-red'}`}>
          {live.change >= 0 ? '+' : ''}{live.change.toFixed(2)}% today
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-grotesk font-700 text-white text-lg font-mono">{fmtEntry(live.price)}</span>
        <div className="text-right">
          <div className="text-xs text-cc-muted">vs entry</div>
          <div className="text-xs font-mono font-700" style={{ color: abovEntry ? '#00D084' : '#FF4D4D' }}>
            {abovEntry ? '+' : ''}{diff.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Options Greeks block ────────────────────────────────────────────────────

const GreeksBlock = ({ opts }: { opts: NonNullable<CueItem['options']> }) => {
  const greeks = [
    { label: 'Delta', value: opts.delta.toFixed(3) },
    { label: 'Gamma', value: opts.gamma.toFixed(3) },
    { label: 'Theta', value: opts.theta.toFixed(3) },
    { label: 'Vega', value: opts.vega.toFixed(3) },
  ];
  return (
    <div className="bg-[#131820] rounded-lg p-4 mb-4">
      <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">OPTIONS GREEKS</div>
      <div className="grid grid-cols-2 gap-2">
        {greeks.map(g => (
          <div key={g.label} className="flex items-center justify-between">
            <span className="text-xs text-cc-muted">{g.label}</span>
            <span
              className="text-xs font-mono font-700"
              style={{ color: parseFloat(g.value) < 0 ? '#FF4D4D' : '#F0F2F6' }}
            >
              {g.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Options contract info block ─────────────────────────────────────────────

const OptionsInfoBlock = ({ opts }: { opts: NonNullable<CueItem['options']> }) => {
  const ts = optTypeStyle(opts.optionType);
  return (
    <div className="bg-[#131820] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono text-cc-muted tracking-wider">CONTRACT</div>
        <span
          className="text-xs px-2 py-0.5 rounded font-mono font-700"
          style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}
        >
          {opts.optionType}
        </span>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Underlying', value: opts.underlying, color: '#F0F2F6' },
          { label: 'Spot Price', value: `$${opts.underlyingPrice.toLocaleString()}`, color: '#F0F2F6' },
          { label: 'Strike', value: `$${opts.strike.toLocaleString()}`, color: '#F59E0B' },
          { label: 'Expiry', value: opts.expiry, color: '#F0F2F6' },
          { label: 'DTE', value: `${opts.dte} days`, color: opts.dte <= 7 ? '#FF4D4D' : opts.dte <= 14 ? '#F59E0B' : '#00D084' },
          { label: 'Premium', value: `$${opts.premium.toFixed(2)}`, color: '#F0F2F6' },
          { label: 'IV', value: `${opts.iv.toFixed(1)}%`, color: opts.iv > 40 ? '#FF4D4D' : opts.iv > 25 ? '#F59E0B' : '#00D084' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-cc-muted">{row.label}</span>
            <span className="text-xs font-mono font-700" style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── main page ───────────────────────────────────────────────────────────────

const formatSignalForCopy = (cue: CueItem): string => {
  const isOpt = cue.sector === 'Options';
  const lines: string[] = [
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📊 CUE SIGNAL — ${cue.asset}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Direction : ${cue.direction}`,
    `Timeframe : ${cue.timeframe}`,
    `Sector    : ${cue.sector}`,
    `Confidence: ${cue.confidence}%`,
    ``,
  ];

  if (isOpt && cue.options) {
    lines.push(
      `Type      : ${cue.options.optionType}`,
      `Underlying: ${cue.options.underlying}`,
      `Strike    : $${cue.options.strike.toLocaleString()}`,
      `Expiry    : ${cue.options.expiry} (${cue.options.dte}d)`,
      `Premium   : $${cue.options.premium.toFixed(2)}`,
      `IV        : ${cue.options.iv.toFixed(1)}%`,
    );
  } else {
    lines.push(
      `Entry     : ${fmtEntry(cue.entry)}`,
      `Target    : ${fmtEntry(cue.target)}`,
      `Stop Loss : ${fmtEntry(cue.stopLoss)}`,
    );
  }

  lines.push(
    `R/R Ratio : ${cue.riskReward}:1`,
    ``,
    `Generated : ${timeAgo(cue.generatedAt)}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `via CUE Intelligence Platform`,
  );

  return lines.join('\n');
};

const CueEnginePage = () => {
  const [sector, setSector] = useState('All');
  const [timeframe, setTimeframe] = useState('All');
  const [direction, setDirection] = useState('All');
  const [minConf, setMinConf] = useState(60);
  const [selectedId, setSelectedId] = useState<string>('c1');
  const [reasoning, setReasoning] = useState<string>('');
  const [reasoningLoading, setReasoningLoading] = useState(false);
  const [quickTradeOpen, setQuickTradeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Real signal engine ────────────────────────────────────────────────────
  const { signals: realSignals, scanning: engineScanning, lastScanned } = useRealSignals();

  // ── Live cue list (seeded with mock, replaced by real signals when ready) ──
  const [liveCues, setLiveCues] = useState<CueItem[]>(dashboardCues);

  // When the real signal engine returns results, replace mock seed with real data
  useEffect(() => {
    if (realSignals.length === 0) return;
    setLiveCues(prev => {
      // Keep any simulated signals added after mount (id starts with "live_")
      const simulated = prev.filter(c => c.id.startsWith('live_'));
      // Real signals go first (newest intelligence), then keep simulated ones
      const merged = [...realSignals, ...simulated];
      // Auto-select first real signal if current selection is still on mock seed
      if (selectedId.startsWith('c')) {
        setSelectedId(realSignals[0]?.id ?? selectedId);
      }
      return merged;
    });
  }, [realSignals]); // eslint-disable-line react-hooks/exhaustive-deps
  // Track which IDs are "new" (flash animation active)
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  // Track which IDs still show the "NEW" badge
  const [badgeIds, setBadgeIds] = useState<Set<string>>(new Set());

  // Live clock — ticks every 30s so relative timestamps stay fresh
  const [, setTick] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    tickRef.current = setInterval(() => setTick(t => t + 1), 30_000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  // ── Signal simulation ─────────────────────────────────────────────────────
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNextSignal = useCallback(() => {
    const delay = randomInterval();
    simTimerRef.current = setTimeout(() => {
      setLiveCues(prev => {
        const existingAssets = prev.map(c => c.asset);
        const newCue = generateNewSignal(existingAssets);

        // Mark as new for flash + badge
        setNewIds(ids => new Set([...ids, newCue.id]));
        setBadgeIds(ids => new Set([...ids, newCue.id]));

        // Remove flash class after animation completes (3s)
        setTimeout(() => {
          setNewIds(ids => {
            const next = new Set(ids);
            next.delete(newCue.id);
            return next;
          });
        }, 3200);

        // Remove NEW badge after 8s
        setTimeout(() => {
          setBadgeIds(ids => {
            const next = new Set(ids);
            next.delete(newCue.id);
            return next;
          });
        }, 8000);

        return [newCue, ...prev];
      });

      scheduleNextSignal();
    }, delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scheduleNextSignal();
    return () => { if (simTimerRef.current) clearTimeout(simTimerRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopySignal = useCallback((cue: CueItem) => {
    const text = formatSignalForCopy(cue);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const { getReasoning } = useReasoningCache();
  const { isPremium } = usePlan();

  const filtered = liveCues.filter(c =>
    (sector === 'All' || c.sector === sector) &&
    (timeframe === 'All' || c.timeframe === timeframe) &&
    (direction === 'All' || c.direction === direction) &&
    c.confidence >= minConf,
  );

  useEffect(() => {
    const stillVisible = filtered.some(c => c.id === selectedId);
    if (!stillVisible && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [sector, timeframe, direction, minConf]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCue: CueItem | undefined = liveCues.find(c => c.id === selectedId);

  const fetchReasoning = useCallback((cue: CueItem) => {
    setReasoning('');
    getReasoning(
      cue,
      (loading) => setReasoningLoading(loading),
      (text) => setReasoning(text),
    );
  }, [getReasoning]);

  useEffect(() => {
    if (selectedCue) fetchReasoning(selectedCue);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const first = dashboardCues.find(c => c.id === 'c1');
    if (first) fetchReasoning(first);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (id: string) => {
    if (id === selectedId) return;
    setSelectedId(id);
  };

  const factors = selectedCue ? deriveFactors(selectedCue.confidence) : [];
  const isOptions = selectedCue?.sector === 'Options';

  return (
    <AppLayout title="Cue Engine" subtitle="Real-time AI-generated trade cues">
      <div className="flex h-full overflow-hidden">

        {/* ── Left panel ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Filter bar */}
          <div
            className="px-5 py-3 flex flex-wrap items-center gap-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,16,24,0.80)', backdropFilter: 'blur(8px)' }}
          >
            <FilterGroup label="Sector" options={cueEngineFilters.sectors} value={sector} onChange={setSector} />
            <div className="w-px h-5 bg-[#1a2030] hidden md:block" />
            <FilterGroup label="TF" options={cueEngineFilters.timeframes} value={timeframe} onChange={setTimeframe} />
            <div className="w-px h-5 bg-[#1a2030] hidden md:block" />
            <FilterGroup label="Dir" options={cueEngineFilters.directions} value={direction} onChange={setDirection} />
            <div className="w-px h-5 bg-[#1a2030] hidden md:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-cc-muted whitespace-nowrap">Conf</span>
              <div className="flex gap-1">
                {cueEngineFilters.confidence.map(v => (
                  <button
                    key={v}
                    onClick={() => setMinConf(v)}
                    className="text-xs px-2 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
                    style={
                      minConf === v
                        ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' }
                        : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B', border: '1px solid transparent' }
                    }
                  >
                    {v}%+
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {badgeIds.size > 0 && (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                  style={{ background: 'rgba(0,208,132,0.08)', border: '1px solid rgba(0,208,132,0.20)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#00D084' }} />
                  <span className="text-xs font-mono" style={{ color: '#00D084' }}>New signal</span>
                </div>
              )}
              {engineScanning && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#F59E0B' }} />
                  <span className="text-xs font-mono" style={{ color: '#F59E0B' }}>Scanning markets…</span>
                </div>
              )}
              {!engineScanning && lastScanned && (
                <span className="text-xs font-mono text-cc-muted hidden lg:block">
                  Last scan {lastScanned.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                <span className="text-xs font-mono text-cc-muted">{filtered.length} cues</span>
              </div>
            </div>
          </div>

          {/* Signal list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span style={{ fontSize: '13px', color: '#4E5A6B' }}>
                  No cues match the current filters.
                </span>
              </div>
            ) : (
              <div className="divide-y divide-[#1a2030]/50">
                {filtered.map(cue => {
                  const ds = dirStyle(cue.direction);
                  const isSelected = selectedId === cue.id;
                  const isOpt = cue.sector === 'Options';
                  const isNew = newIds.has(cue.id);
                  const hasBadge = badgeIds.has(cue.id);
                  return (
                    <div
                      key={cue.id}
                      onClick={() => handleSelect(cue.id)}
                      className={`px-5 py-4 cursor-pointer transition-all ${isNew ? 'new-signal-flash slide-down-fade' : ''}`}
                      style={
                        isNew
                          ? { borderLeft: '2px solid #00D084' }
                          : {
                              background: isSelected ? 'rgba(245,158,11,0.04)' : 'transparent',
                              borderLeft: isSelected ? '2px solid #F59E0B' : '2px solid transparent',
                            }
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-grotesk font-700 text-cc-text text-sm">{cue.asset}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded font-mono"
                            style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                          >
                            {cue.direction}
                          </span>
                          {isOpt && cue.options && (() => {
                            const ts = optTypeStyle(cue.options.optionType);
                            return (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded font-mono"
                                style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}
                              >
                                {cue.options.optionType}
                              </span>
                            );
                          })()}
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-mono"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8' }}
                          >
                            {cue.timeframe}
                          </span>
                          {isOpt && cue.options && (
                            <span className="text-xs font-mono" style={{ color: '#4E5A6B' }}>
                              {cue.options.dte}d exp
                            </span>
                          )}
                          {hasBadge && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded font-mono font-700 new-badge-pulse"
                              style={{ background: 'rgba(0,208,132,0.15)', color: '#00D084', border: '1px solid rgba(0,208,132,0.35)', letterSpacing: '0.05em' }}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cc-muted">{timeAgo(cue.generatedAt)}</span>
                          <span className="text-xs font-mono text-cc-amber font-700">{cue.confidence}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-cc-muted mb-2 flex-wrap">
                        {isOpt && cue.options ? (
                          <>
                            <span>Premium <span className="text-cc-text font-mono">${cue.options.premium.toFixed(2)}</span></span>
                            <span>Strike <span className="text-cc-amber font-mono">${cue.options.strike}</span></span>
                            <span>IV <span className="font-mono" style={{ color: cue.options.iv > 40 ? '#FF4D4D' : '#F59E0B' }}>{cue.options.iv.toFixed(1)}%</span></span>
                            <span>R/R <span className="text-cc-amber font-mono">{cue.riskReward}:1</span></span>
                          </>
                        ) : (
                          <>
                            <span>Entry <span className="text-cc-text font-mono">{fmtEntry(cue.entry)}</span></span>
                            <span>Target <span className="text-cc-green font-mono">{fmtEntry(cue.target)}</span></span>
                            <span>Stop <span className="text-cc-red font-mono">{fmtEntry(cue.stopLoss)}</span></span>
                            <span>R/R <span className="text-cc-amber font-mono">{cue.riskReward}:1</span></span>
                          </>
                        )}
                      </div>

                      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full bg-cc-amber transition-all duration-500"
                          style={{ width: `${cue.confidence}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: cue detail ── */}
        {selectedCue && (
          <div
            className="w-80 flex-shrink-0 overflow-y-auto"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, #0D1520 0%, #0A1018 100%)' }}
          >
            <div className="p-5">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-mono text-cc-muted tracking-wider">CUE DETAIL</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                    <span className="text-xs font-mono text-cc-green">ACTIVE</span>
                  </div>
                  <button
                    onClick={() => handleCopySignal(selectedCue)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap font-grotesk font-700"
                    style={
                      copied
                        ? { background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.28)', color: '#00D084' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: '#8A95A8' }
                    }
                    onMouseEnter={e => {
                      if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                    }}
                    onMouseLeave={e => {
                      if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <i className={`text-xs ${copied ? 'ri-check-line' : 'ri-file-copy-line'}`} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setQuickTradeOpen(true)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap font-grotesk font-700"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.28)', color: '#F59E0B' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.20)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.12)')}
                  >
                    <i className="ri-flashlight-line text-xs" />
                    Quick Trade
                  </button>
                </div>
              </div>

              {/* Ticker + badge */}
              <div className="mb-5">
                <div className="font-grotesk text-2xl font-700 text-white mb-2">{selectedCue.asset}</div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {(() => {
                    const ds = dirStyle(selectedCue.direction);
                    return (
                      <span
                        className="text-sm px-3 py-1 rounded font-mono font-700"
                        style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                      >
                        {selectedCue.direction}
                      </span>
                    );
                  })()}
                  {isOptions && selectedCue.options && (() => {
                    const ts = optTypeStyle(selectedCue.options.optionType);
                    return (
                      <span
                        className="text-sm px-3 py-1 rounded font-mono font-700"
                        style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}
                      >
                        {selectedCue.options.optionType}
                      </span>
                    );
                  })()}
                  <span
                    className="text-xs px-2 py-1 rounded font-mono"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8' }}
                  >
                    {selectedCue.timeframe}
                  </span>
                  <span className="text-xs text-cc-muted">{selectedCue.sector}</span>
                </div>
              </div>

              {/* Live price widget */}
              <LivePriceWidget symbol={selectedCue.asset} entry={selectedCue.entry} />

              {/* Options contract info */}
              {isOptions && selectedCue.options && (
                <OptionsInfoBlock opts={selectedCue.options} />
              )}

              {/* Trade parameters */}
              <div className="bg-[#131820] rounded-lg p-4 mb-4 space-y-3">
                {isOptions && selectedCue.options ? (
                  <>
                    {[
                      { label: 'Entry Premium', value: `$${fmtEntry(selectedCue.entry)}`, color: '#F0F2F6', icon: 'ri-arrow-right-line' },
                      { label: 'Target Premium', value: `$${fmtEntry(selectedCue.target)}`, color: '#00D084', icon: 'ri-arrow-up-line' },
                      { label: 'Stop Premium', value: `$${fmtEntry(selectedCue.stopLoss)}`, color: '#FF4D4D', icon: 'ri-arrow-down-line' },
                      { label: 'R/R Ratio', value: `${selectedCue.riskReward}:1`, color: '#F59E0B', icon: 'ri-scales-line' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className={`${row.icon} text-xs`} style={{ color: row.color }} />
                          </div>
                          <span className="text-xs text-cc-muted">{row.label}</span>
                        </div>
                        <span className="text-sm font-mono font-700" style={{ color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { label: 'Entry', value: fmtEntry(selectedCue.entry), color: '#F0F2F6', icon: 'ri-arrow-right-line' },
                      { label: 'Target', value: fmtEntry(selectedCue.target), color: '#00D084', icon: 'ri-arrow-up-line' },
                      { label: 'Stop Loss', value: fmtEntry(selectedCue.stopLoss), color: '#FF4D4D', icon: 'ri-arrow-down-line' },
                      { label: 'R/R Ratio', value: `${selectedCue.riskReward}:1`, color: '#F59E0B', icon: 'ri-scales-line' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className={`${row.icon} text-xs`} style={{ color: row.color }} />
                          </div>
                          <span className="text-xs text-cc-muted">{row.label}</span>
                        </div>
                        <span className="text-sm font-mono font-700" style={{ color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Options Greeks */}
              {isOptions && selectedCue.options && (
                <GreeksBlock opts={selectedCue.options} />
              )}

              {/* Confidence bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-cc-muted">Confidence Score</span>
                  <span className="text-sm font-mono font-700 text-cc-amber">{selectedCue.confidence}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full bg-cc-amber transition-all duration-500"
                    style={{ width: `${selectedCue.confidence}%` }}
                  />
                </div>
              </div>

              {/* Factor breakdown — premium */}
              <PremiumGate featureName="Factor Breakdown" requiredPlan="desk" overlay lockedHeight="100px">
                <div className="mb-4">
                  <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">FACTOR BREAKDOWN</div>
                  <div className="space-y-2.5">
                    {factors.map(f => (
                      <div key={f.label} className="flex items-center gap-3">
                        <span className="text-xs text-cc-muted w-20">{f.label}</span>
                        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${f.score}%`, background: 'rgba(245,158,11,0.70)' }}
                          />
                        </div>
                        <span className="text-xs font-mono text-cc-muted w-8 text-right">{f.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PremiumGate>

              {/* AI Reasoning — premium */}
              <PremiumGate featureName="AI Reasoning" requiredPlan="desk" overlay lockedHeight="90px">
                <div
                  className="reasoning-card pl-4 py-3 rounded-r-lg mb-4"
                  style={{ background: 'rgba(245,158,11,0.04)' }}
                >
                  <div className="text-xs font-mono text-cc-amber mb-2 tracking-wider">AI REASONING</div>
                  {reasoningLoading ? (
                    <div className="space-y-2 py-1">
                      <SkeletonLine width="100%" />
                      <SkeletonLine width="78%" />
                    </div>
                  ) : (
                    <p className="text-xs text-cc-text-dim leading-relaxed">{reasoning}</p>
                  )}
                </div>
              </PremiumGate>

              {!isPremium && (
                <div
                  className="rounded-lg p-3 flex items-center gap-2 mt-2"
                  style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
                >
                  <i className="ri-vip-crown-line text-cc-amber text-sm" />
                  <span className="text-xs text-cc-muted">
                    <span className="text-cc-amber">Desk plan</span> unlocks AI reasoning &amp; factor breakdown
                  </span>
                </div>
              )}

              {/* Copy Signal CTA */}
              <button
                onClick={() => handleCopySignal(selectedCue)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg cursor-pointer transition-all mt-4 font-grotesk font-700 text-sm whitespace-nowrap"
                style={
                  copied
                    ? { background: 'rgba(0,208,132,0.10)', border: '1px solid rgba(0,208,132,0.30)', color: '#00D084' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#8A95A8' }
                }
                onMouseEnter={e => {
                  if (!copied) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#F0F2F6';
                  }
                }}
                onMouseLeave={e => {
                  if (!copied) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = '#8A95A8';
                  }
                }}
              >
                <i className={`text-sm ${copied ? 'ri-check-double-line' : 'ri-file-copy-line'}`} />
                {copied ? 'Signal copied to clipboard!' : 'Copy Signal for External Platform'}
              </button>

              <div className="text-xs text-cc-muted text-center mt-3">Generated {timeAgo(selectedCue.generatedAt)}</div>
            </div>
          </div>
        )}
      </div>
      {quickTradeOpen && selectedCue && (
        <QuickTradePanel cue={selectedCue} onClose={() => setQuickTradeOpen(false)} />
      )}
    </AppLayout>
  );
};

export default CueEnginePage;
