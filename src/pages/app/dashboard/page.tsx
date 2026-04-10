import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { dashboardStats, dashboardCues, watchlistAssets, type CueItem } from '@/mocks/appData';
import { useLivePrices } from '@/hooks/useLivePrices';
import { useRealSignals } from '@/hooks/useRealSignals';

// ── Helpers ───────────────────────────────────────────────────────────────────

const dirStyle = (d: string) => {
  if (d === 'BUY')  return { bg: 'rgba(0,208,132,0.10)',  color: '#00D084', border: 'rgba(0,208,132,0.20)' };
  if (d === 'SELL') return { bg: 'rgba(255,77,77,0.10)',   color: '#FF4D4D', border: 'rgba(255,77,77,0.20)' };
  return               { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF', border: 'rgba(107,114,128,0.20)' };
};

const fmtPrice = (p: number, symbol: string) => {
  if (!p || p === 0) return '—';
  if (symbol === 'EUR/USD' || symbol === 'GBP/USD') return p.toFixed(5);
  if (symbol.includes('/') && p < 10) return p.toFixed(4);
  return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const timeAgo = (ms: number) => {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 10)  return 'just now';
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

const statIconColors: Record<number, { bg: string; color: string; glow: string }> = {
  0: { bg: 'rgba(245,158,11,0.10)', color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
  1: { bg: 'rgba(0,208,132,0.10)',  color: '#00D084', glow: 'rgba(0,208,132,0.12)' },
  2: { bg: 'rgba(245,158,11,0.10)', color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
  3: { bg: 'rgba(0,208,132,0.10)',  color: '#00D084', glow: 'rgba(0,208,132,0.12)' },
};

// ── DashboardPage ─────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const [now, setNow] = useState(Date.now());

  // Tick for live relative timestamps
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);
  void now;

  const symbols = watchlistAssets.slice(0, 8).map(a => a.symbol);
  const { prices } = useLivePrices(symbols);

  const { signals: realSignals, scanning, lastScanned } = useRealSignals();

  // Merge: real signals take priority; fill remaining slots from mock cues
  const mergedFeed = useMemo<CueItem[]>(() => {
    const realAssets = new Set(realSignals.map(s => s.asset));
    const mockFill   = dashboardCues.filter(c => !realAssets.has(c.asset));
    return [...realSignals, ...mockFill].slice(0, 7);
  }, [realSignals]);

  // Live stats derived from real signals when available
  const liveActiveCues  = realSignals.length > 0 ? realSignals.length : parseInt(dashboardStats[0].value);
  const liveAvgConf     = realSignals.length > 0
    ? (realSignals.reduce((s, c) => s + c.confidence, 0) / realSignals.length).toFixed(1) + '%'
    : dashboardStats[1].value;
  const liveBuyCount    = realSignals.filter(s => s.direction === 'BUY').length;
  const liveSellCount   = realSignals.filter(s => s.direction === 'SELL').length;
  const liveAvgRR       = realSignals.length > 0
    ? (realSignals.reduce((s, c) => s + c.riskReward, 0) / realSignals.length).toFixed(2)
    : dashboardStats[3].value;

  const livStats = [
    { ...dashboardStats[0], value: String(liveActiveCues),  change: realSignals.length > 0 ? `${liveBuyCount}B / ${liveSellCount}S` : dashboardStats[0].change },
    { ...dashboardStats[1], value: liveAvgConf },
    { ...dashboardStats[2] },
    { ...dashboardStats[3], value: liveAvgRR },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Live intelligence overview">
      <div className="p-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {livStats.map((stat, i) => {
            const ic = statIconColors[i] ?? statIconColors[0];
            return (
              <div key={stat.label} className="stat-card rounded-2xl p-5 relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${ic.glow} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
                />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-inter tracking-wide" style={{ color: '#3D5060' }}>{stat.label}</span>
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-xl"
                    style={{ background: ic.bg, border: `1px solid ${ic.color}22` }}
                  >
                    <i className={`${stat.icon} text-sm`} style={{ color: ic.color }} />
                  </div>
                </div>
                <div className="text-2xl font-grotesk font-700 text-white number-font mb-1.5">{stat.value}</div>
                <div className={`text-xs font-mono flex items-center gap-1 ${stat.up ? 'text-cc-green' : 'text-cc-red'}`}>
                  <i className={`text-[10px] ${stat.up ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}`} />
                  {stat.change} {i === 0 && realSignals.length > 0 ? 'real-time' : 'vs yesterday'}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Live Cue Feed */}
          <div className="xl:col-span-2">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0D1520 0%, #0A1018 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-2 h-2 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full pulse-dot block" style={{ background: '#00D084' }} />
                  </div>
                  <span className="text-sm font-grotesk font-700" style={{ color: '#E8EEF4' }}>Live Cue Feed</span>

                  {/* Real signal count */}
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,208,132,0.08)', color: '#00D084', border: '1px solid rgba(0,208,132,0.15)' }}
                  >
                    {mergedFeed.length} active
                  </span>

                  {/* Real vs mock badge */}
                  {realSignals.length > 0 && (
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}
                    >
                      {realSignals.length} real · {mergedFeed.length - realSignals.length} fill
                    </span>
                  )}

                  {/* Scanning indicator */}
                  {scanning && (
                    <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: '#F59E0B' }}>
                      <i className="ri-loader-4-line animate-spin text-xs" />
                      Scanning…
                    </span>
                  )}
                  {!scanning && lastScanned && (
                    <span className="text-[10px] font-mono hidden sm:inline" style={{ color: '#2A3A4A' }}>
                      {timeAgo(lastScanned)}
                    </span>
                  )}
                </div>

                <a
                  href="/app/cue-engine"
                  className="flex items-center gap-1 text-xs font-inter cursor-pointer transition-colors flex-shrink-0"
                  style={{ color: '#F59E0B' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#FBBF24')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#F59E0B')}
                >
                  View all <i className="ri-arrow-right-line text-xs" />
                </a>
              </div>

              {/* Cue rows */}
              <div>
                {mergedFeed.map((cue, idx) => {
                  const ds       = dirStyle(cue.direction);
                  const isReal   = realSignals.some(s => s.id === cue.id);
                  const ageLabel = timeAgo(cue.generatedAt);

                  return (
                    <div
                      key={cue.id}
                      className="px-5 py-4 cursor-pointer transition-all"
                      style={{ borderBottom: idx < mergedFeed.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-grotesk font-700 text-sm" style={{ color: '#E8EEF4' }}>{cue.asset}</span>

                          <span
                            className="text-[10px] px-2 py-0.5 rounded-md font-mono font-700 tracking-wide"
                            style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                          >
                            {cue.direction}
                          </span>

                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#4A6070' }}
                          >
                            {cue.timeframe}
                          </span>

                          <span className="text-[10px] hidden md:inline" style={{ color: '#2A3A4A' }}>{cue.sector}</span>

                          {/* Real signal indicator */}
                          {isReal && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-mono tracking-widest"
                              style={{ background: 'rgba(0,208,132,0.08)', color: '#00D084', border: '1px solid rgba(0,208,132,0.15)' }}
                            >
                              LIVE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono" style={{ color: '#2A3A4A' }}>{ageLabel}</span>
                          <span
                            className="text-xs font-mono font-700 px-2 py-0.5 rounded-md"
                            style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}
                          >
                            {cue.confidence}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 text-xs mb-2.5 flex-wrap">
                        <span style={{ color: '#3D5060' }}>Entry <span className="font-mono" style={{ color: '#C8D8E4' }}>{cue.entry.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></span>
                        <span style={{ color: '#3D5060' }}>Target <span className="font-mono" style={{ color: '#00D084' }}>{cue.target.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></span>
                        <span style={{ color: '#3D5060' }}>Stop <span className="font-mono" style={{ color: '#FF4D4D' }}>{cue.stopLoss.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></span>
                        <span style={{ color: '#3D5060' }}>R/R <span className="font-mono" style={{ color: '#F59E0B' }}>{cue.riskReward}:1</span></span>
                      </div>

                      {/* Confidence bar */}
                      <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${cue.confidence}%`,
                            background: isReal
                              ? `linear-gradient(90deg, #00D084, #34D399)`
                              : `linear-gradient(90deg, #D97706, #F59E0B)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state while scanning for first time */}
              {mergedFeed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <i className="ri-radar-line text-2xl" style={{ color: '#334155' }} />
                  <span className="text-sm" style={{ color: '#334155' }}>Scanning markets for signals…</span>
                </div>
              )}
            </div>
          </div>

          {/* Watchlist sidebar */}
          <div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0D1520 0%, #0A1018 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-sm font-grotesk font-700" style={{ color: '#E8EEF4' }}>Watchlist</span>
                <a
                  href="/app/watchlist"
                  className="flex items-center gap-1 text-xs font-inter cursor-pointer transition-colors"
                  style={{ color: '#F59E0B' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#FBBF24')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#F59E0B')}
                >
                  Manage <i className="ri-arrow-right-line text-xs" />
                </a>
              </div>

              <div>
                {watchlistAssets.slice(0, 8).map((asset, idx) => {
                  const live      = prices[asset.symbol];
                  const livePrice = live && !live.loading && !live.error ? live.price  : null;
                  const liveChg   = live && !live.loading && !live.error ? live.change : null;

                  // Direction: prefer real signal over mock
                  const realSig = realSignals.find(s => s.asset === asset.symbol);
                  const dir     = realSig?.direction ?? asset.direction;
                  const ds      = dirStyle(dir);

                  return (
                    <div
                      key={asset.id}
                      className="px-5 py-3.5 cursor-pointer transition-all"
                      style={{ borderBottom: idx < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-grotesk font-700" style={{ color: '#E8EEF4' }}>{asset.symbol}</span>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                              style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                            >
                              {dir}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-inter" style={{ color: '#2A3A4A' }}>{asset.sector}</span>
                            {livePrice !== null && (
                              <span className="text-[8px] font-mono tracking-widest" style={{ color: '#00D084' }}>LIVE</span>
                            )}
                            {realSig && (
                              <span className="text-[8px] font-mono tracking-widest" style={{ color: '#F59E0B' }}>CUE</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          {live?.loading ? (
                            <div className="h-4 w-16 rounded-md shimmer" />
                          ) : (
                            <>
                              <div className="text-sm font-mono" style={{ color: '#C8D8E4' }}>
                                {fmtPrice(livePrice ?? asset.price, asset.symbol)}
                              </div>
                              <div
                                className="text-[10px] font-mono font-700"
                                style={{ color: (liveChg ?? asset.change) >= 0 ? '#00D084' : '#FF4D4D' }}
                              >
                                {(liveChg ?? asset.change) >= 0 ? '+' : ''}{(liveChg ?? asset.change).toFixed(2)}%
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── 30-Day Performance ── */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0D1520 0%, #0A1018 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.30), transparent)' }}
          />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #F59E0B, #D97706)' }} />
              <span className="text-sm font-grotesk font-700" style={{ color: '#E8EEF4' }}>30-Day Performance</span>
            </div>
            <a
              href="/app/history"
              className="flex items-center gap-1 text-xs font-inter cursor-pointer transition-colors"
              style={{ color: '#F59E0B' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#FBBF24')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#F59E0B')}
            >
              Full history <i className="ri-arrow-right-line text-xs" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Cues',  value: '312',    sub: 'This month',          color: '#E8EEF4' },
              { label: 'Win Rate',    value: '74.1%',  sub: '231W / 81L',          color: '#00D084' },
              { label: 'Avg R/R',     value: liveAvgRR + ':1', sub: realSignals.length > 0 ? 'Live signals' : 'Closed positions', color: '#F59E0B' },
              { label: 'Best Cue',   value: '+16.2%', sub: 'SOL/USD 4H BUY',      color: '#00D084' },
            ].map(m => (
              <div key={m.label}>
                <div className="text-[10px] font-mono tracking-wider mb-2" style={{ color: '#2A3A4A' }}>{m.label.toUpperCase()}</div>
                <div className="text-xl font-grotesk font-700 number-font mb-1" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[10px] font-inter" style={{ color: '#3D5060' }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardPage;
