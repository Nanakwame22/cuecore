import { liveCues } from '@/mocks/landingData';
import CueBadge from './CueBadge';
import ConfidenceBar from './ConfidenceBar';

const LandingLiveCues = () => (
  <section id="live-cues" className="bg-[#080a0e] py-24">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 bg-cc-green/10 border border-cc-green/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
            <span className="text-xs text-cc-green font-mono tracking-wider">LIVE INTELLIGENCE FEED</span>
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-3">
            Active cues,<br /><span className="text-gradient-gold">right now.</span>
          </h2>
          <p className="text-cc-text-dim text-base max-w-lg">A sample of what's live on the platform. Every cue includes full breakdown, entry logic, and risk parameters.</p>
        </div>
        <a href="/request-access" className="inline-flex items-center gap-2 border border-cc-amber/30 text-cc-amber text-sm px-5 py-2.5 rounded-md hover:bg-cc-amber/10 transition-colors cursor-pointer whitespace-nowrap font-grotesk">
          View All Cues <i className="ri-arrow-right-line" />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveCues.map((cue) => (
          <div key={cue.id} className="bg-[#0d1117] border border-[#1a2030] rounded-lg p-5 cue-card-hover cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-base font-grotesk font-700 text-white">{cue.asset}</div>
                <div className="text-xs text-cc-muted mt-0.5">{cue.sector} · {cue.timeframe}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <CueBadge direction={cue.direction} />
                <span className={`text-xs number-font font-600 ${cue.change.startsWith('+') ? 'text-cc-green' : 'text-cc-red'}`}>{cue.change}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-cc-muted mb-1.5">AI Confidence</div>
              <ConfidenceBar value={cue.confidence} />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#080a0e] rounded p-2.5">
                <div className="text-xs text-cc-muted mb-0.5">Entry</div>
                <div className="text-xs font-mono text-white number-font">{cue.entry > 100 ? cue.entry.toLocaleString() : cue.entry}</div>
              </div>
              <div className="bg-[#080a0e] rounded p-2.5">
                <div className="text-xs text-cc-muted mb-0.5">Target</div>
                <div className="text-xs font-mono text-cc-green number-font">{cue.target > 100 ? cue.target.toLocaleString() : cue.target}</div>
              </div>
              <div className="bg-[#080a0e] rounded p-2.5">
                <div className="text-xs text-cc-muted mb-0.5">Stop</div>
                <div className="text-xs font-mono text-cc-red number-font">{cue.stopLoss > 100 ? cue.stopLoss.toLocaleString() : cue.stopLoss}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cc-muted">R/R Ratio</span>
              <span className="text-cc-amber font-mono number-font font-600">1 : {cue.riskReward}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingLiveCues;
