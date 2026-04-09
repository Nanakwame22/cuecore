import { platformCapabilities } from '@/mocks/platformData';

const PlatformCapabilities = () => (
  <section className="bg-[#080a0e] py-28">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
          <span className="text-xs text-cc-amber font-mono tracking-wider">CORE CAPABILITIES</span>
        </div>
        <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-4">
          Engineered for<br /><span className="text-gradient-gold">professional-grade performance.</span>
        </h2>
        <p className="text-cc-text-dim text-lg max-w-2xl mx-auto">
          Six foundational capabilities that separate CueCore from every other signal service on the market.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {platformCapabilities.map((cap, i) => (
          <div key={i} className="bg-[#0d1117] border border-[#1a2030] rounded-lg p-6 cue-card-hover cursor-default group relative overflow-hidden">
            {/* Subtle corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-cc-amber/3 rounded-bl-full" />

            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 flex items-center justify-center bg-cc-amber/10 border border-cc-amber/20 rounded-lg group-hover:bg-cc-amber/15 transition-colors">
                <i className={`${cap.icon} text-cc-amber text-lg`} />
              </div>
              <div className="text-right">
                <div className="text-xl font-grotesk font-700 text-cc-amber number-font">{cap.metric}</div>
                <div className="text-xs text-cc-muted">{cap.metricLabel}</div>
              </div>
            </div>

            <h3 className="font-grotesk font-600 text-white text-base mb-2">{cap.title}</h3>
            <p className="text-cc-text-dim text-sm leading-relaxed">{cap.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PlatformCapabilities;
