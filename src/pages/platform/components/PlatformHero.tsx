import { performanceMetrics } from '@/mocks/platformData';

const PlatformHero = () => (
  <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden bg-[#080a0e] pt-24 pb-16">
    {/* Grid bg */}
    <div className="absolute inset-0 grid-bg opacity-40" />

    {/* Amber glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-cc-amber/4 blur-3xl pointer-events-none" />

    {/* Corner marks */}
    <div className="absolute top-24 left-8 w-12 h-12 border-l-2 border-t-2 border-cc-amber/20" />
    <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-cc-amber/20" />

    <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1.5 mb-8">
          <i className="ri-cpu-line text-cc-amber text-xs" />
          <span className="text-xs text-cc-amber font-mono tracking-wider">THE INTELLIGENCE PLATFORM</span>
        </div>

        <h1 className="font-grotesk text-5xl md:text-6xl lg:text-7xl font-700 leading-[1.05] tracking-tight mb-6">
          <span className="text-white">Every cue is a</span>
          <br />
          <span className="text-gradient-gold">structured decision.</span>
        </h1>

        <p className="text-cc-text-dim text-xl leading-relaxed max-w-2xl mx-auto mb-10">
          CueCore isn't a screener. It's a full-stack intelligence system — ingesting raw market data, running multi-factor AI analysis, and delivering structured trade cues with complete context.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#signal-anatomy"
            className="inline-flex items-center gap-2 bg-cc-amber text-[#0A0C10] font-grotesk font-500 text-sm px-6 py-3 rounded-md hover:bg-cc-amber-light transition-colors cursor-pointer whitespace-nowrap"
          >
            Explore the Platform
            <i className="ri-arrow-down-line" />
          </a>
          <a
            href="/#pricing"
            className="inline-flex items-center gap-2 text-sm px-6 py-3 cursor-pointer whitespace-nowrap transition-colors"
            style={{ background: 'transparent', border: '1px solid rgba(245,158,11,0.40)', color: '#F59E0B', borderRadius: '6px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            View Pricing
          </a>
        </div>
      </div>

      {/* Performance metrics bar */}
      <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a2030]">
          <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
          <span className="text-xs font-mono text-cc-muted tracking-wider">LIVE PERFORMANCE METRICS — TRAILING 90 DAYS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-[#1a2030]">
          {performanceMetrics.map((m, i) => (
            <div key={i} className="px-5 py-4">
              <div className="text-xs text-cc-muted mb-1.5 tracking-wide">{m.label}</div>
              <div className="text-xl font-grotesk font-700 text-white number-font mb-1">{m.value}</div>
              <div className={`text-xs font-mono ${m.up ? 'text-cc-green' : 'text-cc-red'}`}>
                {m.up ? '▲' : '▼'} {m.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PlatformHero;
