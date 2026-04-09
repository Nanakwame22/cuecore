import { liveCues } from '@/mocks/landingData';
import CueBadge from '@/pages/home/components/CueBadge';
import ConfidenceBar from '@/pages/home/components/ConfidenceBar';

const watchlistItems = [
  { asset: 'BTC/USD', price: '68,420', change: '+3.24%', up: true, confidence: 91 },
  { asset: 'NVDA', price: '892.40', change: '+1.83%', up: true, confidence: 87 },
  { asset: 'ETH/USD', price: '3,241', change: '+4.12%', up: true, confidence: 88 },
  { asset: 'EUR/USD', price: '1.0842', change: '-0.41%', up: false, confidence: 83 },
  { asset: 'GOLD', price: '2,318', change: '+0.22%', up: true, confidence: 72 },
  { asset: 'TSLA', price: '178.20', change: '-2.14%', up: false, confidence: 79 },
];

const PlatformDashboardPreview = () => (
  <section className="bg-[#080a0e] py-28 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
          <span className="text-xs text-cc-amber font-mono tracking-wider">INTELLIGENCE DASHBOARD</span>
        </div>
        <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-4">
          Your command center<br /><span className="text-gradient-gold">for market intelligence.</span>
        </h2>
        <p className="text-cc-text-dim text-lg max-w-2xl mx-auto">
          The CueCore dashboard surfaces only what matters — live cues, confidence scores, and full reasoning — in a clean, distraction-free interface built for speed.
        </p>
      </div>

      {/* Dashboard mockup */}
      <div className="bg-[#0a0c10] border border-[#1a2030] rounded-xl overflow-hidden shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a2030] bg-[#0d1117]">
          <div className="w-3 h-3 rounded-full bg-[#FF4D4D]/60" />
          <div className="w-3 h-3 rounded-full bg-cc-amber/40" />
          <div className="w-3 h-3 rounded-full bg-cc-green/40" />
          <div className="flex-1 mx-4">
            <div className="bg-[#080a0e] rounded-md px-3 py-1 text-xs font-mono text-cc-muted max-w-xs mx-auto text-center">
              app.cuecore.io/dashboard
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
            <span className="text-xs font-mono text-cc-green">LIVE</span>
          </div>
        </div>

        {/* Dashboard layout */}
        <div className="flex h-[580px]">
          {/* Sidebar */}
          <div className="w-14 bg-[#0d1117] border-r border-[#1a2030] flex flex-col items-center py-4 gap-4">
            <div className="w-7 h-7 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-cc-amber rotate-45 relative">
                <div className="absolute inset-0.5 bg-cc-amber/30" />
              </div>
            </div>
            <div className="w-px h-4 bg-[#1a2030]" />
            {[
              { icon: 'ri-dashboard-line', active: true },
              { icon: 'ri-pulse-line', active: false },
              { icon: 'ri-bar-chart-2-line', active: false },
              { icon: 'ri-bookmark-line', active: false },
              { icon: 'ri-notification-3-line', active: false },
            ].map((item, i) => (
              <div
                key={i}
                className="w-9 h-9 flex items-center justify-center rounded-md cursor-pointer transition-colors"
                style={{
                  background: item.active ? 'rgba(245,158,11,0.08)' : 'transparent',
                  borderLeft: item.active ? '2px solid #F59E0B' : '2px solid transparent',
                }}
              >
                <i className={`${item.icon} text-sm`} style={{ color: item.active ? '#F59E0B' : '#4E5A6B' }} />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left panel: Watchlist */}
            <div className="w-56 border-r border-[#1a2030] flex flex-col">
              <div className="px-3 py-3 border-b border-[#1a2030]">
                <div className="text-xs font-mono text-cc-muted tracking-wider">WATCHLIST</div>
              </div>
              <div className="flex-1 overflow-hidden">
                {watchlistItems.map((item, i) => (
                  <div
                    key={i}
                    className="px-3 py-2.5 border-b border-[#1a2030]/50 cursor-pointer hover:bg-[#131820] transition-colors"
                    style={i === 0 ? { background: 'rgba(245,158,11,0.04)', borderLeft: '2px solid rgba(245,158,11,0.4)' } : {}}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-white">{item.asset}</span>
                      <span className={`text-xs font-mono number-font ${item.up ? 'text-cc-green' : 'text-cc-red'}`}>{item.change}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cc-muted number-font">{item.price}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-0.5 rounded-full bg-[#1a2030] overflow-hidden">
                          <div className="h-full bg-cc-amber rounded-full" style={{ width: `${item.confidence}%` }} />
                        </div>
                        <span className="text-xs font-mono text-cc-muted">{item.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Cue feed */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2030]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white">LIVE CUE FEED</span>
                  <div className="flex items-center gap-1.5">
                    {['ALL', 'BUY', 'SELL', 'HOLD'].map((f, i) => (
                      <span
                        key={f}
                        className="text-xs px-2 py-0.5 rounded-full font-mono cursor-pointer"
                        style={i === 0 ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' } : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B' }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                  <span className="text-xs font-mono text-cc-green">12 new</span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col gap-0">
                {liveCues.slice(0, 5).map((cue, i) => (
                  <div
                    key={cue.id}
                    className="flex items-center gap-4 px-4 py-3 border-b border-[#1a2030]/50 cursor-pointer hover:bg-[#131820] transition-colors"
                    style={i === 0 ? { background: '#131820' } : {}}
                  >
                    <CueBadge direction={cue.direction} size="sm" />
                    <div className="w-20">
                      <div className="text-xs font-mono text-white">{cue.asset}</div>
                      <div className="text-xs text-cc-muted">{cue.sector}</div>
                    </div>
                    <div className="flex-1">
                      <ConfidenceBar value={cue.confidence} showLabel />
                    </div>
                    <div className="text-right w-16">
                      <div className="text-xs font-mono text-cc-muted">R/R</div>
                      <div className="text-xs font-mono text-cc-amber number-font">1:{cue.riskReward}</div>
                    </div>
                    <div className="text-right w-12">
                      <div className="text-xs font-mono text-cc-muted">{cue.timeframe}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel: Detail */}
            <div className="w-52 border-l border-[#1a2030] flex flex-col">
              <div className="px-3 py-3 border-b border-[#1a2030]">
                <div className="text-xs font-mono text-cc-muted tracking-wider">CUE DETAIL</div>
              </div>
              <div className="p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-grotesk font-700 text-white">BTC/USD</span>
                  <CueBadge direction="BUY" size="sm" />
                </div>
                <div>
                  <div className="text-xs text-cc-muted mb-1">Confidence</div>
                  <ConfidenceBar value={91} showLabel />
                </div>
                {[
                  { label: 'Entry', value: '68,420', color: 'text-white' },
                  { label: 'Target', value: '74,800', color: 'text-cc-green' },
                  { label: 'Stop', value: '65,900', color: 'text-cc-red' },
                  { label: 'R/R', value: '1 : 2.4', color: 'text-cc-amber' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-[#1a2030]/50">
                    <span className="text-xs text-cc-muted">{item.label}</span>
                    <span className={`text-xs font-mono number-font ${item.color}`}>{item.value}</span>
                  </div>
                ))}
                <div>
                  <div className="text-xs font-mono text-cc-muted tracking-wider mb-2">SIGNALS</div>
                  {['RSI Divergence', 'Volume Surge', 'Dark Pool'].map((s) => (
                    <div key={s} className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cc-green flex-shrink-0" />
                      <span className="text-xs text-cc-text-dim">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-xs text-cc-muted mt-4 font-mono">
        Simulated dashboard preview — actual interface may vary
      </p>
    </div>
  </section>
);

export default PlatformDashboardPreview;
