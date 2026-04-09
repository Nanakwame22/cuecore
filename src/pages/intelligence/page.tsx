import { useState } from 'react';
import NavBar from '@/pages/home/components/NavBar';
import TickerBar from '@/pages/home/components/TickerBar';
import LandingFooter from '@/pages/home/components/LandingFooter';
import { liveCues } from '@/mocks/landingData';

const allCues = [
  ...liveCues,
  { id: '7', asset: 'SOL/USD', direction: 'BUY' as const, confidence: 85, timeframe: '4H', entry: 168.40, target: 192.00, stopLoss: 158.00, riskReward: 2.27, change: '+5.3%', sector: 'Crypto' },
  { id: '8', asset: 'AAPL', direction: 'HOLD' as const, confidence: 68, timeframe: '1D', entry: 189.30, target: 198.00, stopLoss: 183.00, riskReward: 1.40, change: '+0.9%', sector: 'Equity' },
  { id: '9', asset: 'USD/JPY', direction: 'SELL' as const, confidence: 76, timeframe: '4H', entry: 151.82, target: 149.50, stopLoss: 152.90, riskReward: 2.11, change: '-0.2%', sector: 'Forex' },
  { id: '10', asset: 'SPX', direction: 'BUY' as const, confidence: 74, timeframe: '1D', entry: 5204, target: 5380, stopLoss: 5120, riskReward: 2.10, change: '+0.7%', sector: 'Index' },
  { id: '11', asset: 'MSFT', direction: 'BUY' as const, confidence: 82, timeframe: '1D', entry: 412.50, target: 445.00, stopLoss: 396.00, riskReward: 1.97, change: '+1.2%', sector: 'Equity' },
  { id: '12', asset: 'XAU/USD', direction: 'BUY' as const, confidence: 80, timeframe: '4H', entry: 2318.50, target: 2380.00, stopLoss: 2280.00, riskReward: 1.60, change: '+0.2%', sector: 'Commodity' },
];

const sectors = ['All', 'Crypto', 'Equity', 'Forex', 'Commodity', 'Index'];
const timeframes = ['All', '1H', '4H', '1D', '1W'];
const directions = ['All', 'BUY', 'SELL', 'HOLD'];

const directionColor = (d: string) => {
  if (d === 'BUY') return { bg: 'rgba(0,208,132,0.12)', color: '#00D084', border: 'rgba(0,208,132,0.25)' };
  if (d === 'SELL') return { bg: 'rgba(255,77,77,0.12)', color: '#FF4D4D', border: 'rgba(255,77,77,0.25)' };
  return { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', border: 'rgba(107,114,128,0.25)' };
};

const IntelligencePage = () => {
  const [sector, setSector] = useState('All');
  const [timeframe, setTimeframe] = useState('All');
  const [direction, setDirection] = useState('All');
  const [minConf, setMinConf] = useState(60);
  const [selected, setSelected] = useState<string | null>('1');

  const filtered = allCues.filter(c =>
    (sector === 'All' || c.sector === sector) &&
    (timeframe === 'All' || c.timeframe === timeframe) &&
    (direction === 'All' || c.direction === direction) &&
    c.confidence >= minConf
  );

  const selectedCue = allCues.find(c => c.id === selected);

  return (
    <div className="min-h-screen bg-[#080a0e]">
      <NavBar />
      <div className="pt-16">
        <TickerBar />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1.5 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                  <span className="text-xs text-cc-amber font-mono tracking-wider">LIVE INTELLIGENCE FEED</span>
                </div>
                <h1 className="font-grotesk text-4xl md:text-5xl font-700 text-white leading-tight mb-3">
                  Active Trade Cues
                </h1>
                <p className="text-cc-text-dim text-lg max-w-xl">
                  Real-time AI-generated cues across 1,800+ instruments. Filter by sector, timeframe, direction, and confidence.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-grotesk font-700 text-white number-font">{filtered.length}</div>
                  <div className="text-xs text-cc-muted">Active Cues</div>
                </div>
                <div className="w-px h-10 bg-[#1a2030]" />
                <div className="text-center">
                  <div className="text-2xl font-grotesk font-700 text-cc-green number-font">
                    {filtered.filter(c => c.direction === 'BUY').length}
                  </div>
                  <div className="text-xs text-cc-muted">BUY</div>
                </div>
                <div className="w-px h-10 bg-[#1a2030]" />
                <div className="text-center">
                  <div className="text-2xl font-grotesk font-700 text-cc-red number-font">
                    {filtered.filter(c => c.direction === 'SELL').length}
                  </div>
                  <div className="text-xs text-cc-muted">SELL</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters + Feed */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          {/* Filter bar */}
          <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
            <FilterGroup label="Sector" options={sectors} value={sector} onChange={setSector} />
            <div className="w-px h-6 bg-[#1a2030] hidden md:block" />
            <FilterGroup label="Timeframe" options={timeframes} value={timeframe} onChange={setTimeframe} />
            <div className="w-px h-6 bg-[#1a2030] hidden md:block" />
            <FilterGroup label="Direction" options={directions} value={direction} onChange={setDirection} />
            <div className="w-px h-6 bg-[#1a2030] hidden md:block" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-cc-muted whitespace-nowrap">Min Confidence</span>
              <div className="flex gap-1">
                {[60, 70, 75, 80, 85, 90].map(v => (
                  <button
                    key={v}
                    onClick={() => setMinConf(v)}
                    className="text-xs px-2.5 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
                    style={minConf === v ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' } : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B', border: '1px solid transparent' }}
                  >
                    {v}%+
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Two-panel layout */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Cue list */}
            <div className="flex-1 space-y-3">
              {filtered.length === 0 && (
                <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-12 text-center">
                  <i className="ri-filter-off-line text-3xl text-cc-muted mb-3 block" />
                  <p className="text-cc-muted text-sm">No cues match your current filters.</p>
                </div>
              )}
              {filtered.map(cue => {
                const dc = directionColor(cue.direction);
                const isSelected = selected === cue.id;
                return (
                  <div
                    key={cue.id}
                    onClick={() => setSelected(cue.id)}
                    className="bg-[#0d1117] border rounded-xl p-5 cursor-pointer transition-all duration-150"
                    style={{ borderColor: isSelected ? 'rgba(245,158,11,0.40)' : '#1a2030', background: isSelected ? 'rgba(245,158,11,0.04)' : '#0d1117' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-grotesk font-700 text-cc-text text-base">{cue.asset}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>{cue.direction}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8' }}>{cue.timeframe}</span>
                        <span className="text-xs text-cc-muted">{cue.sector}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono font-700 ${cue.change.startsWith('+') ? 'text-cc-green' : 'text-cc-red'}`}>{cue.change}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-cc-muted mb-3">
                      <span>Entry <span className="text-cc-text font-mono">{cue.entry.toLocaleString()}</span></span>
                      <span>Target <span className="text-cc-green font-mono">{cue.target.toLocaleString()}</span></span>
                      <span>Stop <span className="text-cc-red font-mono">{cue.stopLoss.toLocaleString()}</span></span>
                      <span>R/R <span className="text-cc-amber font-mono">{cue.riskReward}:1</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-cc-muted">Confidence</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full bg-cc-amber transition-all" style={{ width: `${cue.confidence}%` }} />
                      </div>
                      <span className="text-xs font-mono text-cc-amber">{cue.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selectedCue && (
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono text-cc-muted tracking-wider">CUE DETAIL</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                  </div>
                  <div className="mb-4">
                    <div className="font-grotesk text-2xl font-700 text-white mb-1">{selectedCue.asset}</div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const dc = directionColor(selectedCue.direction);
                        return <span className="text-sm px-3 py-1 rounded font-mono font-700" style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>{selectedCue.direction}</span>;
                      })()}
                      <span className="text-xs px-2 py-1 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8' }}>{selectedCue.timeframe}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    {[
                      { label: 'Entry', value: selectedCue.entry.toLocaleString(), color: '#F0F2F6' },
                      { label: 'Target', value: selectedCue.target.toLocaleString(), color: '#00D084' },
                      { label: 'Stop Loss', value: selectedCue.stopLoss.toLocaleString(), color: '#FF4D4D' },
                      { label: 'R/R Ratio', value: `${selectedCue.riskReward}:1`, color: '#F59E0B' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-xs text-cc-muted">{row.label}</span>
                        <span className="text-sm font-mono font-700" style={{ color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-cc-muted">Confidence Score</span>
                      <span className="text-sm font-mono font-700 text-cc-amber">{selectedCue.confidence}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full bg-cc-amber" style={{ width: `${selectedCue.confidence}%` }} />
                    </div>
                  </div>

                  <div className="reasoning-card pl-4 py-3 rounded-r-lg" style={{ background: 'rgba(245,158,11,0.04)' }}>
                    <div className="text-xs font-mono text-cc-amber mb-2">AI REASONING</div>
                    <p className="text-xs text-cc-text-dim leading-relaxed">
                      Strong momentum confluence on {selectedCue.timeframe} with RSI divergence and volume breakout. Order book shows significant bid stacking at entry. Sentiment score elevated at 72/100.
                    </p>
                  </div>

                  <a href="/request-access" className="mt-5 w-full flex items-center justify-center gap-2 bg-cc-amber text-[#0A0C10] font-grotesk font-500 text-sm py-2.5 rounded-md hover:bg-cc-amber-light transition-colors cursor-pointer whitespace-nowrap">
                    Get Full Access <i className="ri-arrow-right-line" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
};

const FilterGroup = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-cc-muted whitespace-nowrap">{label}</span>
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="text-xs px-2.5 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
          style={value === opt ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' } : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B', border: '1px solid transparent' }}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default IntelligencePage;
