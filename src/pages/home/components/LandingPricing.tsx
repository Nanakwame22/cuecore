import { pricingPlans } from '@/mocks/landingData';

const LandingPricing = () => (
  <section id="pricing" className="bg-[#0d1117] border-t border-[#1a2030] py-24">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
          <span className="text-xs text-cc-amber font-mono tracking-wider">PRICING</span>
        </div>
        <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-4">
          Intelligence at every<br /><span className="text-gradient-gold">scale.</span>
        </h2>
        <p className="text-cc-text-dim text-lg max-w-xl mx-auto">Start with a 14-day free trial. No credit card required.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {pricingPlans.map((plan, i) => (
          <div key={i} className={`relative rounded-lg p-6 flex flex-col ${plan.highlighted ? 'bg-cc-amber/5 border-2 border-cc-amber/40' : 'bg-[#080a0e] border border-[#1a2030]'}`}>
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cc-amber text-black text-xs font-grotesk font-700 px-3 py-1 rounded-full whitespace-nowrap">MOST POPULAR</div>
            )}
            <div className="mb-6">
              <div className="text-xs font-mono text-cc-muted tracking-wider mb-2">{plan.name.toUpperCase()}</div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-grotesk font-700 text-white number-font">{plan.price}</span>
                {plan.period && <span className="text-cc-muted text-sm mb-1">{plan.period}</span>}
              </div>
              <p className="text-cc-text-dim text-sm">{plan.description}</p>
            </div>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2.5 text-sm text-cc-text-dim">
                  <i className="ri-check-line text-cc-green text-sm flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className={`w-full text-center text-sm font-grotesk font-600 py-3 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                plan.highlighted
                  ? 'bg-cc-amber text-black hover:bg-cc-amber-dim'
                  : 'border border-[#1a2030] text-cc-text-dim hover:border-cc-amber/30 hover:text-white'
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingPricing;
