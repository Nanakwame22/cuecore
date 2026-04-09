import { howItWorks } from '@/mocks/landingData';

const LandingHowItWorks = () => (
  <section id="how-it-works" className="bg-[#0d1117] border-y border-[#1a2030] py-24">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
          <span className="text-xs text-cc-amber font-mono tracking-wider">HOW IT WORKS</span>
        </div>
        <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-4">
          From raw data to<br /><span className="text-gradient-gold">actionable cues.</span>
        </h2>
        <p className="text-cc-text-dim text-lg max-w-xl mx-auto">
          Four stages. Milliseconds. Every cue is traceable back to the data that generated it.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {howItWorks.map((step, i) => (
          <div key={i} className="relative">
            {i < howItWorks.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-cc-amber/30 to-transparent z-10" />
            )}
            <div className="bg-[#080a0e] border border-[#1a2030] rounded-lg p-6 h-full">
              <div className="text-4xl font-grotesk font-700 text-cc-amber/20 number-font mb-4">{step.step}</div>
              <h3 className="font-grotesk font-600 text-white text-base mb-3">{step.title}</h3>
              <p className="text-cc-text-dim text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingHowItWorks;
