import { useState, useMemo, useRef, useEffect } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { watchlistAssets, dashboardCues } from '@/mocks/appData';
import CandlestickChart from './CandlestickChart';
import { usePlan } from '@/hooks/usePlan';
import UpgradeModal from '@/components/feature/UpgradeModal';
import { useRealChart } from './useRealChart';
import { useRealSignals } from '@/hooks/useRealSignals';

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', 'D1'] as const;
type TF = typeof TIMEFRAMES[number];

export type ChartType = 'candles' | 'line' | 'bars' | 'heikin_ashi';

const CHART_TYPES: { key: ChartType; label: string; icon: string }[] = [
  { key: 'candles',     label: 'Candles',   icon: 'ri-bar-chart-box-line' },
  { key: 'line',        label: 'Line',      icon: 'ri-line-chart-line' },
  { key: 'bars',        label: 'Bars',      icon: 'ri-bar-chart-line' },
  { key: 'heikin_ashi', label: 'H. Ashi',   icon: 'ri-bar-chart-grouped-line' },
];

const formatPrice = (p: number) =>
  p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  : p >= 10  ? p.toFixed(2)
  : p.toFixed(5);

const formatChange = (c: number) => `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;

const sectorColor = (s: string) => {
  switch (s) {
    case 'Crypto':    return 'text-[#F59E0B]';
    case 'Equity':    return 'text-[#60A5FA]';
    case 'Forex':     return 'text-[#A78BFA]';
    case 'Commodity': return 'text-[#34D399]';
    default:          return 'text-slate-400';
  }
};

const ChartsPage = () => {
  const [selectedId,       setSelectedId]       = useState(watchlistAssets[0].id);
  const [timeframe,        setTimeframe]        = useState<TF>('4H');
  const [chartType,        setChartType]        = useState<ChartType>('candles');
  const [showVWAP,         setShowVWAP]         = useState(false);
  const [showBB,           setShowBB]           = useState(false);
  const [showVolume,       setShowVolume]       = useState(true);
  const [showRSI,          setShowRSI]          = useState(true);
  const [showMACD,         setShowMACD]         = useState(true);
  const [showMA,           setShowMA]           = useState(false);
  const [showSignalPanel,  setShowSignalPanel]  = useState(true);
  const [showChartOptions, setShowChartOptions] = useState(false);
  const [enableAutoscroll, setEnableAutoscroll] = useState(true);
  const [enableGridSnap,   setEnableGridSnap]   = useState(true);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [activeTab,        setActiveTab]        = useState<'signal' | 'levels'>('signal');
  const [upgradeModal,     setUpgradeModal]     = useState<{ open: boolean; feature: string }>({ open: false, feature: '' });
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const chartOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Auto-hide signal panel on mobile
  useEffect(() => {
    if (isMobile) setShowSignalPanel(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chartOptionsRef.current && !chartOptionsRef.current.contains(e.target as Node))
        setShowChartOptions(false);
    };
    if (showChartOptions) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChartOptions]);

  const { isPremium } = usePlan();

  // Real signals from the engine — merged with mock cues as fallback
  const { signals: realSignals } = useRealSignals();

  const selectedAsset = watchlistAssets.find(a => a.id === selectedId) ?? watchlistAssets[0];

  // Fetch real OHLCV + indicators
  const { bars, liveBar, livePrice, loading, error, indicators } = useRealChart(
    selectedAsset.symbol,
    timeframe,
  );

  const lastPrice = livePrice > 0 ? livePrice : selectedAsset.price;
  const priceChange = selectedAsset.change;

  const filteredAssets = watchlistAssets.filter(a =>
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find a matching signal (real first, then mock)
  const matchedCue = useMemo(() => {
    const sym = selectedAsset.symbol;
    const real = realSignals.find(s => s.asset === sym);
    if (real) return real;
    return dashboardCues.find(c => c.asset === sym || c.asset.startsWith(sym.split('/')[0]));
  }, [selectedAsset.symbol, realSignals]);

  const signal = matchedCue ? {
    direction: matchedCue.direction,
    entry: matchedCue.entry,
    stopLoss: matchedCue.stopLoss,
    target: matchedCue.target,
    riskReward: matchedCue.riskReward,
  } : null;

  const riskPct   = matchedCue ? Math.abs((matchedCue.entry - matchedCue.stopLoss) / matchedCue.entry * 100) : null;
  const rewardPct = matchedCue ? Math.abs((matchedCue.target - matchedCue.entry) / matchedCue.entry * 100) : null;

  // Indicator display values
  const rsiVal = indicators.rsi;
  const rsiZone = rsiVal !== null
    ? rsiVal > 70 ? { label: 'Overbought', color: 'text-[#FF4D4D]' }
    : rsiVal < 30 ? { label: 'Oversold',   color: 'text-[#00D084]' }
    : rsiVal >= 40 && rsiVal <= 65 ? { label: 'Buy Zone', color: 'text-[#F59E0B]' }
    : { label: 'Neutral', color: 'text-slate-400' }
    : null;

  const macdBullish = (indicators.macdHistogram ?? 0) > 0;
  const emaCross    = indicators.ema9 !== null && indicators.ema21 !== null
    ? indicators.ema9 > indicators.ema21 ? 'Bullish' : 'Bearish'
    : null;

  return (
    <AppLayout title="Charts" subtitle="Institutional-grade charting with live OHLCV and Cue Engine overlay">
      {/* Full dark surface */}
      <div className="relative flex h-full overflow-hidden" style={{ background: '#080a0e' }}>

        {/* ── Instrument Sidebar ─────────────────────────────────────────── */}
        {/* Mobile backdrop */}
        {isMobile && showMobileSidebar && (
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
        <div
          style={{
            display: isMobile ? (showMobileSidebar ? 'flex' : 'none') : 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
            width: isMobile ? '100%' : '208px',
            position: isMobile ? 'absolute' : 'relative',
            top: 0, bottom: 0, left: 0,
            zIndex: isMobile ? 50 : 'auto',
            background: '#0d1420',
            borderRight: '1px solid #1e2d42',
          }}
        >
          {/* Mobile header with close button */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #1e2d42', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instruments</span>
              <button onClick={() => setShowMobileSidebar(false)} style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>
                <i className="ri-close-line" />
              </button>
            </div>
          )}

          {/* Search */}
          <div className="px-3 py-3 border-b flex-shrink-0" style={{ borderColor: '#1e2d42' }}>
            <div className="relative">
              <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search symbol…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-md text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1"
                style={{ background: '#162030', border: '1px solid #1e2d42', '--tw-ring-color': '#F59E0B' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Asset list */}
          <div className="flex-1 overflow-y-auto">
            {filteredAssets.map(asset => {
              const isActive = asset.id === selectedId;
              const up = asset.change >= 0;
              return (
                <button
                  key={asset.id}
                  onClick={() => { setSelectedId(asset.id); setShowMobileSidebar(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 12px',
                    textAlign: 'left', cursor: 'pointer', border: 'none',
                    borderLeft: `2px solid ${isActive ? '#F59E0B' : 'transparent'}`,
                    background: isActive ? 'rgba(245,158,11,0.07)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isActive ? 'text-[#F59E0B]' : 'text-slate-300'}`}>
                      {asset.symbol}
                    </span>
                    <span className={`text-xs font-mono ${up ? 'text-[#00D084]' : 'text-[#FF4D4D]'}`}>
                      {formatChange(asset.change)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-600 truncate">{asset.name}</span>
                    <span className={`text-xs ${sectorColor(asset.sector)}`}>{asset.sector}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Chart Area ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── Toolbar Row 1 ── */}
          <div
            className="px-3 md:px-4 py-2.5 flex items-center gap-2 md:gap-3 flex-shrink-0 border-b"
            style={{ background: '#0d1420', borderColor: '#1e2d42' }}
          >
            {/* Hamburger — mobile only */}
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setShowMobileSidebar(true)}
                style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, flexShrink: 0 }}
              >
                <i className="ri-menu-line" style={{ fontSize: 16 }} />
              </button>
            )}

            {/* Asset info */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="min-w-0">
                <span className="font-mono font-bold text-white text-sm">{selectedAsset.symbol}</span>
                {!isMobile && <span className="text-slate-500 text-xs ml-1.5">{selectedAsset.name}</span>}
              </div>
              <span className="text-base font-mono font-bold text-white whitespace-nowrap">
                {loading ? '—' : formatPrice(lastPrice)}
              </span>
              <span className={`text-xs font-mono font-semibold whitespace-nowrap ${priceChange >= 0 ? 'text-[#00D084]' : 'text-[#FF4D4D]'}`}>
                {formatChange(priceChange)}
              </span>
              {/* Direction badge */}
              {matchedCue && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-mono font-bold border whitespace-nowrap"
                  style={
                    matchedCue.direction === 'BUY'
                      ? { color: '#00D084', borderColor: 'rgba(0,208,132,0.3)', background: 'rgba(0,208,132,0.1)' }
                      : matchedCue.direction === 'SELL'
                      ? { color: '#FF4D4D', borderColor: 'rgba(255,77,77,0.3)', background: 'rgba(255,77,77,0.1)' }
                      : { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)' }
                  }
                >
                  {matchedCue.direction}
                </span>
              )}
              {loading && (
                <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                  <i className="ri-loader-4-line animate-spin" /> <span className="hidden sm:inline">Loading…</span>
                </span>
              )}
              {error && (
                <span className="text-xs text-[#FF4D4D] flex items-center gap-1 whitespace-nowrap">
                  <i className="ri-wifi-off-line" /> <span className="hidden sm:inline">API error — showing mock</span>
                </span>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">

              {/* Chart type + settings dropdown */}
              <div className="relative" ref={chartOptionsRef}>
                <button
                  onClick={() => setShowChartOptions(v => !v)}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-all font-mono font-semibold border"
                  style={showChartOptions
                    ? { background: '#F59E0B', color: '#080a0e', borderColor: '#F59E0B' }
                    : { background: 'transparent', color: '#94a3b8', borderColor: '#1e2d42' }}
                >
                  <i className={`${CHART_TYPES.find(c => c.key === chartType)?.icon ?? 'ri-bar-chart-box-line'} text-xs`} />
                  <span className="hidden sm:inline">{CHART_TYPES.find(c => c.key === chartType)?.label}</span>
                  <i className={`${showChartOptions ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-xs`} />
                </button>

                {showChartOptions && (
                  <div
                    className="absolute top-full right-0 md:left-0 mt-2 z-50 w-80 rounded-xl border overflow-hidden"
                    style={{ background: '#0d1420', borderColor: '#1e2d42', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
                  >
                    {/* Chart types */}
                    <div className="p-4 border-b" style={{ borderColor: '#1e2d42' }}>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Chart type</div>
                      <div className="grid grid-cols-4 gap-2">
                        {CHART_TYPES.map(ct => (
                          <button
                            key={ct.key}
                            onClick={() => setChartType(ct.key)}
                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg cursor-pointer transition-all border text-xs"
                            style={chartType === ct.key
                              ? { background: 'rgba(245,158,11,0.12)', borderColor: '#F59E0B', color: '#F59E0B' }
                              : { background: '#162030', borderColor: '#1e2d42', color: '#64748b' }}
                          >
                            <i className={`${ct.icon} text-lg`} />
                            <span className="font-medium leading-tight text-center">{ct.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Indicators */}
                    <div className="p-4 border-b" style={{ borderColor: '#1e2d42' }}>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Indicators</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'vwap', label: 'VWAP',     active: showVWAP,    premium: true,  toggle: () => { if (!isPremium) { setUpgradeModal({ open: true, feature: 'VWAP' }); return; } setShowVWAP(v => !v); } },
                          { key: 'bb',   label: 'Bollinger', active: showBB,      premium: true,  toggle: () => { if (!isPremium) { setUpgradeModal({ open: true, feature: 'Bollinger Bands' }); return; } setShowBB(v => !v); } },
                          { key: 'ma',   label: 'MA',        active: showMA,      premium: false, toggle: () => setShowMA(v => !v) },
                          { key: 'vol',  label: 'Volume',    active: showVolume,  premium: false, toggle: () => setShowVolume(v => !v) },
                          { key: 'rsi',  label: 'RSI',       active: showRSI,     premium: false, toggle: () => setShowRSI(v => !v) },
                          { key: 'macd', label: 'MACD',      active: showMACD,    premium: false, toggle: () => setShowMACD(v => !v) },
                        ].map(item => (
                          <button
                            key={item.key}
                            onClick={item.toggle}
                            className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all border text-xs font-semibold"
                            style={item.active && (!item.premium || isPremium)
                              ? { background: 'rgba(0,208,132,0.1)', color: '#00D084', borderColor: 'rgba(0,208,132,0.3)' }
                              : { background: '#162030', color: '#64748b', borderColor: '#1e2d42' }}
                          >
                            <span>{item.label}</span>
                            {item.premium && !isPremium
                              ? <i className="ri-lock-2-line text-xs text-slate-600" />
                              : <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.active && (!item.premium || isPremium) ? '#00D084' : '#334155' }} />
                            }
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="p-4">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Settings</div>
                      <div className="space-y-3">
                        {[
                          { label: 'Autoscroll',  value: enableAutoscroll, set: setEnableAutoscroll },
                          { label: 'Grid snap',   value: enableGridSnap,   set: setEnableGridSnap },
                          { label: 'Cue Panel',   value: showSignalPanel,  set: setShowSignalPanel },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{item.label}</span>
                            <button
                              onClick={() => item.set(v => !v)}
                              className="relative w-9 h-5 rounded-full cursor-pointer transition-all"
                              style={{ background: item.value ? '#F59E0B' : '#1e2d42' }}
                            >
                              <div
                                className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                                style={{ left: item.value ? '1.1rem' : '0.125rem' }}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider + timeframe strip — desktop only */}
              {!isMobile && (
                <>
                  <div style={{ width: 1, height: 20, background: '#1e2d42', flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, borderRadius: 8, padding: 2, background: '#162030', flexShrink: 0 }}>
                    {TIMEFRAMES.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        style={{
                          fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
                          padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                          border: 'none', whiteSpace: 'nowrap',
                          background: timeframe === tf ? '#F59E0B' : 'transparent',
                          color: timeframe === tf ? '#080a0e' : '#64748b',
                        }}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  <div style={{ width: 1, height: 20, background: '#1e2d42', flexShrink: 0 }} />
                </>
              )}

              {/* Cue panel toggle — always visible */}
              <button
                onClick={() => setShowSignalPanel(v => !v)}
                className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-all font-mono font-semibold border flex items-center gap-1.5"
                style={showSignalPanel
                  ? { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)' }
                  : { background: 'transparent', color: '#64748b', borderColor: '#1e2d42' }}
              >
                <i className="ri-layout-right-line text-xs" />
                {!isMobile && <span>Cue Panel</span>}
              </button>
            </div>
          </div>

          {/* ── Toolbar Row 2 — mobile timeframe strip ── */}
          {isMobile && (
            <div
              style={{ flexShrink: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1e2d42', overflowX: 'auto', background: '#0d1420' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, borderRadius: 8, padding: 2, background: '#162030', flexShrink: 0 }}>
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{
                      fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
                      padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      border: 'none', whiteSpace: 'nowrap',
                      background: timeframe === tf ? '#F59E0B' : 'transparent',
                      color: timeframe === tf ? '#080a0e' : '#64748b',
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <i className="ri-database-2-line" /> {error ? 'Mock' : 'Twelve Data'}
              </span>
            </div>
          )}

          {/* ── Chart + Signal Panel ── */}
          <div className="flex-1 flex overflow-hidden relative">

            {/* Chart canvas */}
            <div className="flex-1 relative overflow-hidden" style={{ background: '#080a0e', padding: '12px 12px 12px 12px' }}>
              <CandlestickChart
                bars={bars}
                liveBar={liveBar}
                livePrice={livePrice}
                barProgress={0}
                chartType={chartType}
                showVWAP={showVWAP && isPremium}
                showBB={showBB && isPremium}
                showVolume={showVolume}
                showRSI={showRSI}
                showMACD={showMACD}
                showMA={showMA}
                signal={signal}
              />
              {/* Loading overlay */}
              {loading && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: 'rgba(8,10,14,0.85)' }}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-[#F59E0B] animate-spin" />
                  <span className="text-sm text-slate-400">Fetching OHLCV data…</span>
                  <span className="text-xs text-slate-600">{selectedAsset.symbol} · {timeframe}</span>
                </div>
              )}
            </div>

            {/* ── Cue Engine Signal Panel ── */}
            {showSignalPanel && (
              <>
                {/* Mobile backdrop */}
                {/* Mobile backdrop */}
                {isMobile && (
                  <div
                    style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.45)' }}
                    onClick={() => setShowSignalPanel(false)}
                  />
                )}
                <div
                  style={{
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
                    width: isMobile ? Math.min(288, windowWidth - 40) : 256,
                    position: isMobile ? 'absolute' : 'relative',
                    top: 0, bottom: 0, right: 0,
                    zIndex: isMobile ? 40 : 'auto',
                    background: '#0d1420',
                    borderLeft: '1px solid #1e2d42',
                  }}
                >
                  {/* Panel header */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: '#1e2d42' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F59E0B' }} />
                        <span className="text-xs font-bold text-white tracking-widest uppercase">Cue Engine</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">{selectedAsset.symbol}</span>
                        {/* Close button — mobile only */}
                        <button
                          onClick={() => setShowSignalPanel(false)}
                          style={{ display: isMobile ? 'block' : 'none', color: '#94a3b8', fontSize: 18, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <i className="ri-close-line" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b" style={{ borderColor: '#1e2d42' }}>
                    {(['signal', 'levels'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="flex-1 py-2 text-xs font-semibold cursor-pointer transition-all capitalize border-b-2"
                        style={activeTab === tab
                          ? { color: '#F59E0B', borderBottomColor: '#F59E0B', background: 'rgba(245,158,11,0.05)' }
                          : { color: '#475569', borderBottomColor: 'transparent' }}
                      >
                        {tab === 'signal' ? 'Signal' : 'Levels'}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto">

                    {/* ── Signal tab ── */}
                    {activeTab === 'signal' && (
                      <div className="p-4 space-y-4">
                        {matchedCue ? (
                          <>
                            {/* Direction card */}
                            <div
                              className="rounded-xl p-4 border"
                              style={
                                matchedCue.direction === 'BUY'
                                  ? { background: 'rgba(0,208,132,0.07)', borderColor: 'rgba(0,208,132,0.25)' }
                                  : matchedCue.direction === 'SELL'
                                  ? { background: 'rgba(255,77,77,0.07)', borderColor: 'rgba(255,77,77,0.25)' }
                                  : { background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.25)' }
                              }
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: matchedCue.direction === 'BUY' ? '#00D084' : matchedCue.direction === 'SELL' ? '#FF4D4D' : '#F59E0B' }}
                                  />
                                  <span
                                    className="text-lg font-bold font-mono"
                                    style={{ color: matchedCue.direction === 'BUY' ? '#00D084' : matchedCue.direction === 'SELL' ? '#FF4D4D' : '#F59E0B' }}
                                  >
                                    {matchedCue.direction}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-slate-500">Confidence</div>
                                  <div
                                    className="text-base font-bold font-mono"
                                    style={{ color: matchedCue.direction === 'BUY' ? '#00D084' : matchedCue.direction === 'SELL' ? '#FF4D4D' : '#F59E0B' }}
                                  >
                                    {matchedCue.confidence}%
                                  </div>
                                </div>
                              </div>
                              {/* Confidence bar */}
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${matchedCue.confidence}%`,
                                    background: matchedCue.direction === 'BUY' ? '#00D084' : matchedCue.direction === 'SELL' ? '#FF4D4D' : '#F59E0B',
                                  }}
                                />
                              </div>
                              <div className="flex justify-between mt-1.5">
                                <span className="text-xs text-slate-500">TF: {matchedCue.timeframe}</span>
                                <span className="text-xs text-slate-500">{timeframe} view</span>
                              </div>
                            </div>

                            {/* Trade levels */}
                            <div className="space-y-0">
                              {[
                                { dot: '#60A5FA', label: 'Entry',     value: matchedCue.entry,     pct: null },
                                { dot: '#00D084', label: 'Target',    value: matchedCue.target,    pct: rewardPct !== null ? `+${rewardPct.toFixed(1)}%` : null },
                                { dot: '#FF4D4D', label: 'Stop Loss', value: matchedCue.stopLoss,  pct: riskPct !== null ? `-${riskPct.toFixed(1)}%` : null },
                              ].map(row => (
                                <div
                                  key={row.label}
                                  className="flex items-center justify-between py-2.5 border-b"
                                  style={{ borderColor: '#1e2d42' }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: row.dot }} />
                                    <span className="text-xs text-slate-500">{row.label}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-mono font-bold text-slate-200">{formatPrice(row.value)}</div>
                                    {row.pct && (
                                      <div className="text-xs font-mono" style={{ color: row.dot }}>{row.pct}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* R/R ratio */}
                            <div className="rounded-xl p-3 border" style={{ background: '#162030', borderColor: '#1e2d42' }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 font-semibold">Risk / Reward</span>
                                <span className="text-sm font-bold font-mono" style={{ color: '#F59E0B' }}>
                                  {matchedCue.riskReward.toFixed(1)}:1
                                </span>
                              </div>
                              <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                                <div className="rounded-l-full" style={{ background: '#FF4D4D', width: `${100 / (matchedCue.riskReward + 1)}%` }} />
                                <div className="rounded-r-full flex-1" style={{ background: '#00D084' }} />
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs" style={{ color: '#FF4D4D' }}>Risk</span>
                                <span className="text-xs" style={{ color: '#00D084' }}>Reward</span>
                              </div>
                            </div>

                            {/* AI reasoning */}
                            <div>
                              <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">AI Reasoning</div>
                              <div
                                className="text-xs text-slate-400 leading-relaxed rounded-lg p-3 border"
                                style={{ background: '#162030', borderColor: '#1e2d42' }}
                              >
                                {matchedCue.direction === 'BUY'
                                  ? `Bullish momentum confirmed. RSI in preferred buy zone${rsiVal !== null ? ` (${rsiVal.toFixed(0)})` : ''}. MACD ${macdBullish ? 'bullish histogram' : 'diverging'}. ${emaCross ? `EMA9 vs EMA21: ${emaCross}.` : ''} Key support at ${formatPrice(matchedCue.stopLoss)}.`
                                  : matchedCue.direction === 'SELL'
                                  ? `Bearish pressure building. RSI${rsiVal !== null ? ` at ${rsiVal.toFixed(0)}` : ''} shows exhaustion. MACD ${!macdBullish ? 'bearish' : 'weakening'}. ${emaCross ? `EMA cross: ${emaCross}.` : ''} Target: ${formatPrice(matchedCue.target)}.`
                                  : `Consolidation phase. No clear directional bias. Watching ${formatPrice(matchedCue.target)} resistance and ${formatPrice(matchedCue.stopLoss)} support.`
                                }
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-10">
                            <div
                              className="w-12 h-12 flex items-center justify-center mx-auto mb-3 rounded-full"
                              style={{ background: '#162030' }}
                            >
                              <i className="ri-radar-line text-slate-500 text-xl" />
                            </div>
                            <div className="text-xs text-slate-500">No active signal</div>
                            <div className="text-xs text-slate-600 mt-1">Cue Engine scanning…</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Levels tab (real indicator values) ── */}
                    {activeTab === 'levels' && (
                      <div className="p-4 space-y-4">

                        {/* Real indicators */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Live Indicators</div>
                          <div className="space-y-0">
                            {/* RSI */}
                            <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#1e2d42' }}>
                              <div>
                                <div className="text-xs text-slate-400">RSI (14)</div>
                                <div className="text-xs text-slate-600">{rsiZone?.label ?? '—'}</div>
                              </div>
                              <span className={`text-xs font-mono font-bold ${rsiZone?.color ?? 'text-slate-500'}`}>
                                {rsiVal !== null ? rsiVal.toFixed(1) : loading ? '…' : '—'}
                              </span>
                            </div>
                            {/* MACD */}
                            <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#1e2d42' }}>
                              <div>
                                <div className="text-xs text-slate-400">MACD Hist.</div>
                                <div className="text-xs text-slate-600">{indicators.macdHistogram !== null ? (macdBullish ? 'Bullish' : 'Bearish') : '—'}</div>
                              </div>
                              <span
                                className="text-xs font-mono font-bold"
                                style={{ color: indicators.macdHistogram !== null ? (macdBullish ? '#00D084' : '#FF4D4D') : '#475569' }}
                              >
                                {indicators.macdHistogram !== null
                                  ? (indicators.macdHistogram >= 0 ? '+' : '') + indicators.macdHistogram.toFixed(4)
                                  : loading ? '…' : '—'}
                              </span>
                            </div>
                            {/* EMA cross */}
                            <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#1e2d42' }}>
                              <div>
                                <div className="text-xs text-slate-400">EMA 9 / 21</div>
                                <div className="text-xs text-slate-600">{emaCross ?? '—'}</div>
                              </div>
                              <span
                                className="text-xs font-mono font-bold"
                                style={{ color: emaCross === 'Bullish' ? '#00D084' : emaCross === 'Bearish' ? '#FF4D4D' : '#475569' }}
                              >
                                {emaCross ?? (loading ? '…' : '—')}
                              </span>
                            </div>
                            {/* ATR */}
                            <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#1e2d42' }}>
                              <div>
                                <div className="text-xs text-slate-400">ATR (14)</div>
                                <div className="text-xs text-slate-600">Avg Range</div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-400">
                                {indicators.atr !== null ? formatPrice(indicators.atr) : loading ? '…' : '—'}
                              </span>
                            </div>
                            {/* EMA9 value */}
                            <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#1e2d42' }}>
                              <div>
                                <div className="text-xs text-slate-400">EMA 9</div>
                                <div className="text-xs text-slate-600">Fast MA</div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-400">
                                {indicators.ema9 !== null ? formatPrice(indicators.ema9) : loading ? '…' : '—'}
                              </span>
                            </div>
                            {/* EMA21 value */}
                            <div className="flex items-center justify-between py-2.5">
                              <div>
                                <div className="text-xs text-slate-400">EMA 21</div>
                                <div className="text-xs text-slate-600">Slow MA</div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-400">
                                {indicators.ema21 !== null ? formatPrice(indicators.ema21) : loading ? '…' : '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bollinger (premium only) */}
                        <div
                          className="rounded-xl p-3 border flex items-center gap-3"
                          style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}
                        >
                          <i className="ri-lock-2-line text-sm" style={{ color: '#F59E0B' }} />
                          <div>
                            <div className="text-xs font-semibold text-slate-300">Bollinger Bands</div>
                            <div className="text-xs text-slate-600">Upgrade to Premium</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Bottom indicator status bar — desktop only ── */}
          {/* Bottom status bar — desktop only */}
          <div
            style={{
              display: isMobile ? 'none' : 'flex',
              flexShrink: 0, padding: '6px 16px',
              alignItems: 'center', gap: 20, fontSize: 12,
              borderTop: '1px solid #1e2d42', overflowX: 'auto',
              background: '#0d1420',
            }}
          >
            {rsiVal !== null && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-600">RSI</span>
                <span className={`font-mono font-bold ${rsiZone?.color ?? 'text-slate-400'}`}>{rsiVal.toFixed(1)}</span>
              </span>
            )}
            {indicators.macdHistogram !== null && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-600">MACD</span>
                <span className="font-mono font-bold" style={{ color: macdBullish ? '#00D084' : '#FF4D4D' }}>
                  {macdBullish ? '▲' : '▼'} {Math.abs(indicators.macdHistogram).toFixed(4)}
                </span>
              </span>
            )}
            {emaCross && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-600">EMA 9/21</span>
                <span className="font-mono font-bold" style={{ color: emaCross === 'Bullish' ? '#00D084' : '#FF4D4D' }}>{emaCross}</span>
              </span>
            )}
            {indicators.atr !== null && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-600">ATR</span>
                <span className="font-mono font-bold text-slate-400">{formatPrice(indicators.atr)}</span>
              </span>
            )}
            <span className="ml-auto flex items-center gap-1.5 text-slate-600 whitespace-nowrap">
              <i className="ri-database-2-line" /> {error ? 'Mock data' : 'Twelve Data'} · {timeframe} · {bars.length} bars
            </span>
          </div>
        </div>
      </div>

      <UpgradeModal open={upgradeModal.open} feature={upgradeModal.feature} onClose={() => setUpgradeModal({ open: false, feature: '' })} />
    </AppLayout>
  );
};

export default ChartsPage;
