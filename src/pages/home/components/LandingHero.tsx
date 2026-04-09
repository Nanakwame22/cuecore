import { useState, useEffect } from 'react';
import CueBadge from './CueBadge';
import ConfidenceBar from './ConfidenceBar';
import { liveCues } from '@/mocks/landingData';

const LandingHero = () => {
  const [activeCueIdx, setActiveCueIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveCueIdx((prev) => (prev + 1) % liveCues.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const cue = liveCues[activeCueIdx];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#080a0e]">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cc-amber/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cc-green/3 blur-3xl pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-20 left-8 w-16 h-16 border-l-2 border-t-2 border-cc-amber/20" />
      <div className="absolute bottom-20 right-8 w-16 h-16 border-r-2 border-b-2 border-cc-amber/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Copy */}
          <div className="flex-1 max-w-2xl">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 bg-cc-green/10 border border-cc-green/20 rounded-full px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
              <span className="text-xs text-cc-green font-mono tracking-wider">SYSTEM LIVE — 1,847 INSTRUMENTS ACTIVE</span>
            </div>

            <h1 className="font-grotesk text-5xl md:text-6xl lg:text-7xl font-700 leading-[1.05] tracking-tight mb-6">
              <span className="text-white">Trade with</span>
              <br />
              <span className="text-gradient-gold">institutional</span>
              <br />
              <span className="text-white">intelligence.</span>
            </h1>

            <p className="text-cc-text-dim text-lg leading-relaxed mb-10 max-w-xl">
              CueCore's AI engine analyzes 40+ market factors in real-time and delivers structured BUY, SELL, and HOLD cues — each with a confidence score, entry, target, and risk-reward ratio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/request-access"
                className="inline-flex items-center justify-center gap-2 bg-cc-amber text-black font-grotesk font-600 text-sm px-6 py-3 rounded-md hover:bg-cc-amber-dim transition-colors cursor-pointer whitespace-nowrap"
              >
                Request Early Access
                <i className="ri-arrow-right-line" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 cursor-pointer whitespace-nowrap transition-colors"
                style={{ background: 'transparent', border: '1px solid rgba(245,158,11,0.40)', color: '#F59E0B', borderRadius: '6px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <i className="ri-play-circle-line" />
                See How It Works
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-[#1a2030]">
              <div>
                <div className="text-2xl font-grotesk font-700 text-white number-font">73.2%</div>
                <div className="text-xs text-cc-muted mt-0.5">Win Rate (90d)</div>
              </div>
              <div className="w-px h-10 bg-[#1a2030]" />
              <div>
                <div className="text-2xl font-grotesk font-700 text-white number-font">2.4M+</div>
                <div className="text-xs text-cc-muted mt-0.5">Cues Generated</div>
              </div>
              <div className="w-px h-10 bg-[#1a2030]" />
              <div>
                <div className="text-2xl font-grotesk font-700 text-white number-font">84.7%</div>
                <div className="text-xs text-cc-muted mt-0.5">Avg Confidence</div>
              </div>
            </div>
          </div>

          {/* Right: Live Cue Preview */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2030]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                  <span className="text-xs font-mono text-cc-muted tracking-wider">LIVE CUE FEED</span>
                </div>
                <span className="text-xs font-mono text-cc-muted">CUE-{String(activeCueIdx + 1001).padStart(4, '0')}</span>
              </div>

              {/* Cue card */}
              <div
                className="p-5 transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xl font-grotesk font-700 text-white">{cue.asset}</div>
                    <div className="text-xs text-cc-muted mt-0.5">{cue.sector} · {cue.timeframe} Timeframe</div>
                  </div>
                  <CueBadge direction={cue.direction} size="lg" />
                </div>

                <div className="mb-4">
                  <div className="text-xs text-cc-muted mb-1.5">AI Confidence</div>
                  <ConfidenceBar value={cue.confidence} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#080a0e] rounded-md p-3">
                    <div className="text-xs text-cc-muted mb-1">Entry</div>
                    <div className="text-sm font-mono text-white number-font">{typeof cue.entry === 'number' && cue.entry > 100 ? cue.entry.toLocaleString() : cue.entry}</div>
                  </div>
                  <div className="bg-[#080a0e] rounded-md p-3">
                    <div className="text-xs text-cc-muted mb-1">Target</div>
                    <div className="text-sm font-mono text-cc-green number-font">{typeof cue.target === 'number' && cue.target > 100 ? cue.target.toLocaleString() : cue.target}</div>
                  </div>
                  <div className="bg-[#080a0e] rounded-md p-3">
                    <div className="text-xs text-cc-muted mb-1">Stop</div>
                    <div className="text-sm font-mono text-cc-red number-font">{typeof cue.stopLoss === 'number' && cue.stopLoss > 100 ? cue.stopLoss.toLocaleString() : cue.stopLoss}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#080a0e] rounded-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <i className="ri-scales-3-line text-cc-amber text-sm" />
                    <span className="text-xs text-cc-muted">Risk / Reward</span>
                  </div>
                  <span className="text-sm font-mono font-600 text-cc-amber number-font">1 : {cue.riskReward}</span>
                </div>
              </div>

              {/* Mini cue list */}
              <div className="border-t border-[#1a2030] px-4 py-3">
                <div className="text-xs text-cc-muted mb-2 tracking-wider">RECENT CUES</div>
                <div className="flex flex-col gap-1.5">
                  {liveCues.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CueBadge direction={c.direction} size="sm" />
                        <span className="text-xs text-cc-text-dim font-mono">{c.asset}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-cc-muted">{c.timeframe}</span>
                        <span className={`text-xs number-font ${c.direction === 'BUY' ? 'text-cc-green' : c.direction === 'SELL' ? 'text-cc-red' : 'text-cc-amber'}`}>
                          {c.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating indicator */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {liveCues.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-300 ${i === activeCueIdx ? 'w-6 bg-cc-amber' : 'w-1.5 bg-[#1a2030]'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
