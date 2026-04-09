import { features } from '@/mocks/landingData';

const LandingFeatures = () => (
  <section id="features" className="bg-[#080a0e] py-24">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
          <span className="text-xs text-cc-amber font-mono tracking-wider">PLATFORM CAPABILITIES</span>
        </div>
        <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-4">
          Built for the way<br /><span className="text-gradient-gold">professionals trade.</span>
        </h2>
        <p className="text-cc-text-dim text-lg max-w-2xl mx-auto">
          Every feature in CueCore is designed around one principle: signal quality over signal quantity.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div key={i} className="bg-[#0d1117] border border-[#1a2030] rounded-lg p-6 cue-card-hover cursor-default group">
            <div className="w-10 h-10 flex items-center justify-center bg-cc-amber/10 border border-cc-amber/20 rounded-md mb-5 group-hover:bg-cc-amber/15 transition-colors">
              <i className={`${f.icon} text-cc-amber text-lg`} />
            </div>
            <h3 className="font-grotesk font-600 text-white text-base mb-2">{f.title}</h3>
            <p className="text-cc-text-dim text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingFeatures;
