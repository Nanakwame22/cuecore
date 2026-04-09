import { useState, useMemo, useRef, useEffect } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import {
  watchlistAssets,
  chartIndicators,
  defaultIndicators,
  dashboardCues,
} from '@/mocks/appData';
import CandlestickChart from './CandlestickChart';
import { usePlan } from '@/hooks/usePlan';
import UpgradeModal from '@/components/feature/UpgradeModal';
import { useLiveChart } from './useLiveChart';

const TIMEFRAMES = ['S5', 'S10', 'S30', '1m', '2m', '3m', '5m', '10m', '15m', '30m', '1H', '4H', 'D1'] as const;
type TF = typeof TIMEFRAMES[number];

export type ChartType = 'candles' | 'line' | 'bars' | 'heikin_ashi';

const tfToLegacy: Record<TF, string> = {
  'S5': '1H', 'S10': '1H', 'S30': '1H',
  '1m': '1H', '2m': '1H', '3m': '1H',
  '5m': '1H', '10m': '4H', '15m': '4H',
  '30m': '4H', '1H': '4H', '4H': '4H', 'D1': '1D',
};

const CHART_TYPES: { key: ChartType; label: string; icon: string }[] = [
  { key: 'line', label: 'Line', icon: 'ri-line-chart-line' },
  { key: 'candles', label: 'Candles', icon: 'ri-bar-chart-box-line' },
  { key: 'bars', label: 'Bars', icon: 'ri-bar-chart-line' },
  { key: 'heikin_ashi', label: 'Heikin Ashi', icon: 'ri-bar-chart-grouped-line' },
];

const dirColor = (d: string) => {
  if (d === 'BUY') return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' };
  if (d === 'SELL') return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' };
  return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' };
};

const formatPrice = (p: number) =>
  p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p >= 10 ? p.toFixed(2) : p.toFixed(4);

const ChartsPage = () => {
  const [selectedId, setSelectedId] = useState(watchlistAssets[0].id);
  const [timeframe, setTimeframe] = useState<TF>('1H');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showVWAP, setShowVWAP] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);
  const [showMA, setShowMA] = useState(false);
  const [showSignalPanel, setShowSignalPanel] = useState(true);
  const [showChartOptions, setShowChartOptions] = useState(false);
  const [enableAutoscroll, setEnableAutoscroll] = useState(true);
  const [enableGridSnap, setEnableGridSnap] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'signal' | 'levels'>('signal');
  const chartOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chartOptionsRef.current && !chartOptionsRef.current.contains(e.target as Node)) {
        setShowChartOptions(false);
      }
    };
    if (showChartOptions) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChartOptions]);

  const { isPremium } = usePlan();

  const selectedAsset = watchlistAssets.find(a => a.id === selectedId) ?? watchlistAssets[0];

  const { bars, liveBar, livePrice, barProgress } = useLiveChart(
    selectedAsset.id,
    timeframe,
    selectedAsset.price,
  );

  const lastClose = livePrice > 0 ? livePrice : (bars.length ? bars[bars.length - 1].close : selectedAsset.price);

  const indicators = useMemo(() => {
    const assetMap = chartIndicators[selectedAsset.id];
    const legacyTf = tfToLegacy[timeframe];
    return assetMap ? (assetMap[legacyTf] ?? defaultIndicators(legacyTf)) : defaultIndicators(legacyTf);
  }, [selectedAsset.id, timeframe]);

  // Find matching cue signal for this asset
  const matchedCue = useMemo(() =>
    dashboardCues.find(c => c.asset === selectedAsset.symbol || c.asset.startsWith(selectedAsset.symbol.split('/')[0])),
    [selectedAsset.symbol]
  );

  const signal = matchedCue ? {
    direction: matchedCue.direction,
    entry: matchedCue.entry,
    stopLoss: matchedCue.stopLoss,
    target: matchedCue.target,
    riskReward: matchedCue.riskReward,
  } : null;

  const rsiVal = indicators.rsi;
  const rsiColor = rsiVal > 70 ? 'text-red-500' : rsiVal < 30 ? 'text-green-600' : 'text-indigo-500';
  const macdPositive = indicators.macd.startsWith('+');

  const filteredAssets = watchlistAssets.filter(a =>
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dc = dirColor(selectedAsset.direction);

  // Compute risk/reward stats
  const riskPct = matchedCue ? Math.abs((matchedCue.entry - matchedCue.stopLoss) / matchedCue.entry * 100) : null;
  const rewardPct = matchedCue ? Math.abs((matchedCue.target - matchedCue.entry) / matchedCue.entry * 100) : null;

  return (
    <AppLayout title="Charts" subtitle="Institutional-grade charting with Cue Engine overlay">
      <div className="flex h-full overflow-hidden bg-white">

        {/* ── Instrument List ── */}
        <div className="w-52 flex-shrink-0 flex flex-col border-r border-slate-100 bg-white overflow-hidden">
          <div className="px-3 py-3 border-b border-slate-100">
            <div className="relative">
              <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredAssets.map(asset => {
              const isActive = asset.id === selectedId;
              const adc = dirColor(asset.direction);
              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedId(asset.id)}
                  className={`w-full px-3 py-2.5 text-left cursor-pointer transition-all border-l-2 ${isActive ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-700 ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>{asset.symbol}</span>
                    <span className={`text-xs font-mono font-600 ${asset.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-400 truncate">{asset.name}</span>
                    <span className={`text-xs font-mono font-600 ${adc.text}`}>{asset.direction}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Chart Area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Toolbar */}
          <div className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0 border-b border-slate-100 bg-white flex-wrap">
            {/* Asset info */}
            <div className="flex items-center gap-3">
              <div>
                <span className="font-mono font-700 text-slate-800 text-sm">{selectedAsset.symbol}</span>
                <span className="text-slate-400 text-xs ml-1.5 hidden sm:inline">{selectedAsset.name}</span>
              </div>
              <span className="text-base font-mono font-700 text-slate-800">
                {formatPrice(lastClose)}
              </span>
              <span className={`text-xs font-mono font-600 ${selectedAsset.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}%
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-600 border ${dc.bg} ${dc.text} ${dc.border}`}>
                {selectedAsset.direction}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2 flex-wrap">
              {/* Chart type + options button */}
              <div className="relative" ref={chartOptionsRef}>
                <button
                  onClick={() => setShowChartOptions(v => !v)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md cursor-pointer transition-all whitespace-nowrap font-mono font-600 border ${showChartOptions ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  <i className={`${CHART_TYPES.find(c => c.key === chartType)?.icon ?? 'ri-bar-chart-box-line'} text-xs`} />
                  {CHART_TYPES.find(c => c.key === chartType)?.label}
                  <i className={showChartOptions ? 'ri-arrow-up-s-line text-xs' : 'ri-arrow-down-s-line text-xs'} />
                </button>

                {/* Chart Options Dropdown */}
                {showChartOptions && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 w-80 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>

                    {/* Chart Types */}
                    <div className="p-4 border-b border-slate-700/60">
                      <div className="text-xs font-600 text-slate-400 uppercase tracking-widest mb-3">Chart types</div>
                      <div className="grid grid-cols-4 gap-2">
                        {CHART_TYPES.map(ct => (
                          <button
                            key={ct.key}
                            onClick={() => { setChartType(ct.key); }}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg cursor-pointer transition-all border ${
                              chartType === ct.key
                                ? 'bg-slate-700 border-slate-500 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-slate-200 hover:border-slate-600'
                            }`}
                          >
                            <i className={`${ct.icon} text-lg`} />
                            <span className="text-xs font-500 leading-tight text-center">{ct.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Frames */}
                    <div className="p-4 border-b border-slate-700/60">
                      <div className="text-xs font-600 text-slate-400 uppercase tracking-widest mb-3">Time frames</div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {TIMEFRAMES.map(tf => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`py-1.5 text-xs font-mono font-600 rounded-md cursor-pointer transition-all whitespace-nowrap ${
                              timeframe === tf
                                ? 'bg-slate-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Indicators */}
                    <div className="p-4 border-b border-slate-700/60">
                      <div className="text-xs font-600 text-slate-400 uppercase tracking-widest mb-3">Indicators</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'vwap', label: 'VWAP', active: showVWAP, premium: true, toggle: () => { if (!isPremium) { setUpgradeModal({ open: true, feature: 'VWAP' }); return; } setShowVWAP(v => !v); } },
                          { key: 'bb', label: 'Bollinger', active: showBB, premium: true, toggle: () => { if (!isPremium) { setUpgradeModal({ open: true, feature: 'Bollinger Bands' }); return; } setShowBB(v => !v); } },
                          { key: 'ma', label: 'MA', active: showMA, premium: false, toggle: () => setShowMA(v => !v) },
                          { key: 'vol', label: 'Volume', active: showVolume, premium: false, toggle: () => setShowVolume(v => !v) },
                          { key: 'rsi', label: 'RSI', active: showRSI, premium: false, toggle: () => setShowRSI(v => !v) },
                          { key: 'macd', label: 'MACD', active: showMACD, premium: false, toggle: () => setShowMACD(v => !v) },
                        ].map(item => (
                          <button
                            key={item.key}
                            onClick={item.toggle}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all border text-xs font-600 ${
                              item.active && (!item.premium || isPremium)
                                ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
                            }`}
                          >
                            <span>{item.label}</span>
                            {item.premium && !isPremium
                              ? <i className="ri-lock-2-line text-xs text-slate-500" />
                              : <div className={`w-1.5 h-1.5 rounded-full ${item.active && (!item.premium || isPremium) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            }
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="p-4">
                      <div className="text-xs font-600 text-slate-400 uppercase tracking-widest mb-3">Settings</div>
                      <div className="space-y-3">
                        {[
                          { label: 'Enable autoscroll', value: enableAutoscroll, set: setEnableAutoscroll },
                          { label: 'Enable grid snap', value: enableGridSnap, set: setEnableGridSnap },
                          { label: 'Cue Panel', value: showSignalPanel, set: setShowSignalPanel },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-xs text-slate-300">{item.label}</span>
                            <button
                              onClick={() => item.set(v => !v)}
                              className={`relative w-9 h-5 rounded-full cursor-pointer transition-all ${item.value ? 'bg-emerald-500' : 'bg-slate-600'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${item.value ? 'left-4' : 'left-0.5'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-5 bg-slate-200" />

              {/* Quick timeframe strip */}
              <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                {(['1m', '5m', '15m', '1H', '4H', 'D1'] as TF[]).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`text-xs px-2.5 py-1 rounded-md cursor-pointer transition-all whitespace-nowrap font-mono font-600 ${timeframe === tf ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-slate-200" />

              {/* Signal panel toggle */}
              <button
                onClick={() => setShowSignalPanel(v => !v)}
                className={`text-xs px-2.5 py-1 rounded-md cursor-pointer transition-all whitespace-nowrap font-mono font-600 border flex items-center gap-1 ${showSignalPanel ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                <i className="ri-layout-right-line text-xs" />
                Cue Panel
              </button>
            </div>
          </div>

          {/* Chart + Signal Panel */}
          <div className="flex-1 flex overflow-hidden">

            {/* Chart canvas */}
            <div className="flex-1 relative overflow-hidden bg-white p-3">
              <CandlestickChart
                bars={bars}
                liveBar={liveBar}
                livePrice={livePrice}
                barProgress={barProgress}
                chartType={chartType}
                showVWAP={showVWAP && isPremium}
                showBB={showBB && isPremium}
                showVolume={showVolume}
                showRSI={showRSI}
                showMACD={showMACD}
                showMA={showMA}
                signal={signal}
              />
            </div>

            {/* ── Cue Engine Signal Panel ── */}
            {showSignalPanel && (
              <div className="w-64 flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden">

                {/* Panel header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-700 text-slate-700 tracking-wide">CUE ENGINE</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{selectedAsset.symbol}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  {(['signal', 'levels'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-xs font-600 cursor-pointer transition-all capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {tab === 'signal' ? 'Signal' : 'Levels'}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'signal' && (
                    <div className="p-4 space-y-4">
                      {/* Direction badge */}
                      {matchedCue ? (
                        <>
                          <div className={`rounded-xl p-4 border ${
                            matchedCue.direction === 'BUY' ? 'bg-green-50 border-green-200' :
                            matchedCue.direction === 'SELL' ? 'bg-red-50 border-red-200' :
                            'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${dc.dot}`} />
                                <span className={`text-lg font-800 font-mono ${dc.text}`}>{matchedCue.direction}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-slate-400">Confidence</div>
                                <div className={`text-base font-800 font-mono ${dc.text}`}>{matchedCue.confidence}%</div>
                              </div>
                            </div>
                            {/* Confidence bar */}
                            <div className="h-1.5 bg-white rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${matchedCue.direction === 'BUY' ? 'bg-green-500' : matchedCue.direction === 'SELL' ? 'bg-red-500' : 'bg-slate-400'}`}
                                style={{ width: `${matchedCue.confidence}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-slate-400">TF: {matchedCue.timeframe}</span>
                              <span className="text-xs text-slate-400">{timeframe}</span>
                            </div>
                          </div>

                          {/* Trade levels */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-xs text-slate-500">Entry</span>
                              </div>
                              <span className="text-xs font-mono font-700 text-slate-800">{formatPrice(matchedCue.entry)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs text-slate-500">Target</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-mono font-700 text-green-600">{formatPrice(matchedCue.target)}</div>
                                {rewardPct !== null && <div className="text-xs text-green-500">+{rewardPct.toFixed(1)}%</div>}
                              </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-xs text-slate-500">Stop Loss</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-mono font-700 text-red-500">{formatPrice(matchedCue.stopLoss)}</div>
                                {riskPct !== null && <div className="text-xs text-red-400">-{riskPct.toFixed(1)}%</div>}
                              </div>
                            </div>
                          </div>

                          {/* R/R ratio */}
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-500 font-600">Risk / Reward</span>
                              <span className="text-sm font-800 font-mono text-blue-600">{matchedCue.riskReward.toFixed(1)}:1</span>
                            </div>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                              <div className="bg-red-400 rounded-l-full" style={{ width: `${100 / (matchedCue.riskReward + 1)}%` }} />
                              <div className="bg-green-400 rounded-r-full flex-1" />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-red-400">Risk</span>
                              <span className="text-xs text-green-500">Reward</span>
                            </div>
                          </div>

                          {/* Reasoning */}
                          <div>
                            <div className="text-xs font-600 text-slate-500 mb-2 uppercase tracking-wide">AI Reasoning</div>
                            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                              {matchedCue.direction === 'BUY'
                                ? `Strong bullish momentum detected. Price action above VWAP with volume confirmation. RSI in preferred buy zone (40–65). MACD bullish crossover forming. Key support holding at ${formatPrice(matchedCue.stopLoss)}.`
                                : matchedCue.direction === 'SELL'
                                ? `Bearish divergence identified. Price rejected at resistance with declining volume. RSI overbought territory. MACD bearish crossover confirmed. Downside target at ${formatPrice(matchedCue.target)}.`
                                : `Consolidation phase. No clear directional bias. Waiting for breakout confirmation above ${formatPrice(matchedCue.target)} or breakdown below ${formatPrice(matchedCue.stopLoss)}.`
                              }
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3 bg-slate-100 rounded-full">
                            <i className="ri-radar-line text-slate-400 text-lg" />
                          </div>
                          <div className="text-xs text-slate-400">No active signal for {selectedAsset.symbol}</div>
                          <div className="text-xs text-slate-300 mt-1">Cue Engine is scanning...</div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'levels' && (
                    <div className="p-4 space-y-4">
                      {/* Indicators */}
                      <div>
                        <div className="text-xs font-600 text-slate-400 uppercase tracking-wide mb-3">Indicators</div>
                        <div className="space-y-2">
                          {[
                            { label: 'RSI (14)', value: rsiVal.toString(), color: rsiColor, note: rsiVal > 70 ? 'Overbought' : rsiVal < 30 ? 'Oversold' : rsiVal >= 40 && rsiVal <= 65 ? 'Buy Zone' : 'Neutral' },
                            { label: 'MACD', value: indicators.macd, color: macdPositive ? 'text-green-600' : 'text-red-500', note: macdPositive ? 'Bullish' : 'Bearish' },
                            { label: 'BB Width', value: isPremium ? indicators.bbWidth : '—', color: 'text-slate-700', note: isPremium ? 'Volatility' : 'Premium' },
                            { label: 'ATR (14)', value: indicators.atr, color: 'text-slate-700', note: 'Avg Range' },
                            { label: 'Vol Ratio', value: indicators.volRatio, color: 'text-blue-600', note: 'vs Avg' },
                          ].map(item => (
                            <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                              <div>
                                <div className="text-xs text-slate-500">{item.label}</div>
                                <div className="text-xs text-slate-300">{item.note}</div>
                              </div>
                              <span className={`text-xs font-mono font-700 ${item.color}`}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key levels */}
                      <div>
                        <div className="text-xs font-600 text-slate-400 uppercase tracking-wide mb-3">Key Levels</div>
                        <div className="space-y-1.5">
                          {[
                            { label: 'Current', value: formatPrice(lastClose), color: 'text-slate-800', type: 'current' },
                            { label: 'Day High', value: formatPrice(lastClose * 1.012), color: 'text-green-600', type: 'high' },
                            { label: 'Day Low', value: formatPrice(lastClose * 0.988), color: 'text-red-500', type: 'low' },
                            { label: 'VWAP', value: formatPrice(lastClose * 0.998), color: 'text-blue-500', type: 'vwap' },
                            { label: 'Resistance', value: formatPrice(lastClose * 1.025), color: 'text-orange-500', type: 'res' },
                            { label: 'Support', value: formatPrice(lastClose * 0.975), color: 'text-indigo-500', type: 'sup' },
                          ].map(item => (
                            <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                              <span className="text-xs text-slate-500">{item.label}</span>
                              <span className={`text-xs font-mono font-700 ${item.color}`}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom status bar */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-slate-400">Live</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{selectedAsset.sector}</span>
                    <span className={`text-xs font-mono font-600 ${dc.text}`}>{selectedAsset.confidence}% conf</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom status bar */}
          <div className="px-4 py-2 flex items-center gap-5 flex-wrap border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">RSI</span>
              <span className={`text-xs font-mono font-700 ${rsiColor}`}>{rsiVal}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">MACD</span>
              <span className={`text-xs font-mono font-700 ${macdPositive ? 'text-green-600' : 'text-red-500'}`}>{indicators.macd}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">ATR</span>
              <span className="text-xs font-mono font-700 text-slate-600">{indicators.atr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Vol Ratio</span>
              <span className="text-xs font-mono font-700 text-blue-600">{indicators.volRatio}</span>
            </div>
            {isPremium && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">BB Width</span>
                <span className="text-xs font-mono font-700 text-slate-600">{indicators.bbWidth}</span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-mono font-600">LIVE</span>
                <span className={`text-xs font-mono font-700 ${livePrice > 0 && livePrice >= (bars[bars.length - 1]?.close ?? livePrice) ? 'text-green-600' : 'text-red-500'}`}>
                  {formatPrice(livePrice > 0 ? livePrice : lastClose)}
                </span>
              </div>
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs text-slate-400 font-mono">Scroll to zoom · Drag to pan</span>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, feature: '' })}
        featureName={upgradeModal.feature}
        requiredPlan="desk"
      />
    </AppLayout>
  );
};

export default ChartsPage;
