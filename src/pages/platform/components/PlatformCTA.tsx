const PlatformCTA = () => (
  <section className="bg-[#080a0e] py-28">
    <div className="max-w-7xl mx-auto px-6">
      <div className="relative bg-[#0d1117] border border-[#1a2030] rounded-2xl overflow-hidden px-8 py-16 text-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-cc-amber/5 blur-3xl pointer-events-none" />

        {/* Corner marks */}
        <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-cc-amber/30" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-cc-amber/30" />

        {/* Section divider line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-cc-amber/30" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
            <span className="text-xs text-cc-amber font-mono tracking-wider">EARLY ACCESS OPEN</span>
          </div>

          <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-6 leading-tight">
            Ready to trade with<br /><span className="text-gradient-gold">institutional intelligence?</span>
          </h2>

          <p className="text-cc-text-dim text-lg leading-relaxed mb-10">
            Join 2,400+ professional traders and desks already using CueCore. Start with a 14-day free trial — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/#pricing"
              className="inline-flex items-center gap-2 bg-cc-amber text-[#0A0C10] font-grotesk font-500 text-sm px-8 py-3.5 rounded-md hover:bg-cc-amber-light transition-colors cursor-pointer whitespace-nowrap"
            >
              Start Free Trial
              <i className="ri-arrow-right-line" />
            </a>
            <a
              href="/#pricing"
              className="inline-flex items-center gap-2 text-sm px-8 py-3.5 cursor-pointer whitespace-nowrap transition-colors"
              style={{ background: 'transparent', border: '1px solid rgba(245,158,11,0.40)', color: '#F59E0B', borderRadius: '6px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              Contact Sales
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-cc-muted">
            {[
              { icon: 'ri-shield-check-line', text: '14-day free trial' },
              { icon: 'ri-close-circle-line', text: 'No credit card required' },
              { icon: 'ri-lock-line', text: 'SOC 2 Type II compliant' },
              { icon: 'ri-customer-service-line', text: 'Dedicated onboarding' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                <i className={`${item.icon} text-cc-amber text-sm`} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PlatformCTA;
