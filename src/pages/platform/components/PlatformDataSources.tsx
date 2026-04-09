import { dataSources } from '@/mocks/platformData';

const PlatformDataSources = () => (
  <section className="bg-[#080a0e] py-28">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        {/* Left: Copy */}
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
            <span className="text-xs text-cc-amber font-mono tracking-wider">DATA INFRASTRUCTURE</span>
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-6">
            Institutional data.<br /><span className="text-gradient-gold">Real-time, always.</span>
          </h2>
          <p className="text-cc-text-dim text-lg leading-relaxed mb-8">
            CueCore ingests from 8 primary data sources — exchange feeds, dark pool prints, options chains, and alternative data — all normalized and fused in real-time.
          </p>
          <p className="text-cc-text-dim text-base leading-relaxed mb-8">
            Our co-located infrastructure sits within milliseconds of major exchange matching engines. You're not getting delayed data dressed up as real-time.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '8', label: 'Data Sources' },
              { value: '< 5ms', label: 'Avg Latency' },
              { value: '99.97%', label: 'Uptime SLA' },
            ].map((s) => (
              <div key={s.label} className="bg-[#0d1117] border border-[#1a2030] rounded-lg p-4 text-center">
                <div className="text-2xl font-grotesk font-700 text-cc-amber number-font mb-1">{s.value}</div>
                <div className="text-xs text-cc-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Data source grid */}
        <div className="lg:w-1/2">
          <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a2030]">
              <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
              <span className="text-xs font-mono text-cc-muted tracking-wider">ACTIVE DATA FEEDS</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-[#1a2030]">
              {dataSources.map((source, i) => (
                <div key={i} className="p-4 hover:bg-[#131820] transition-colors cursor-default group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-cc-amber/8 border border-cc-amber/15 rounded-md group-hover:bg-cc-amber/12 transition-colors">
                      <i className={`${source.icon} text-cc-amber text-sm`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cc-green" />
                      <span className="text-xs font-mono text-cc-green">LIVE</span>
                    </div>
                  </div>
                  <div className="text-sm font-grotesk font-500 text-white mb-0.5">{source.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cc-muted">{source.type}</span>
                    <span className="text-xs font-mono text-cc-amber">{source.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PlatformDataSources;
