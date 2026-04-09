import { useState } from 'react';
import NavBar from '@/pages/home/components/NavBar';
import TickerBar from '@/pages/home/components/TickerBar';
import LandingFooter from '@/pages/home/components/LandingFooter';
import { pricingPlans } from '@/mocks/landingData';

const featureMatrix = [
  { feature: 'Monthly Cues', analyst: '500', desk: 'Unlimited', institutional: 'Unlimited' },
  { feature: 'Timeframes', analyst: '1H, 4H', desk: '1H, 4H, 1D, 1W', institutional: '1H, 4H, 1D, 1W' },
  { feature: 'Asset Classes', analyst: 'Crypto, Equity', desk: 'All classes', institutional: 'All + Custom' },
  { feature: 'Confidence Scoring', analyst: true, desk: true, institutional: true },
  { feature: 'Full R/R Breakdown', analyst: false, desk: true, institutional: true },
  { feature: 'AI Reasoning Summary', analyst: false, desk: true, institutional: true },
  { feature: 'API Access', analyst: false, desk: true, institutional: true },
  { feature: 'Slack / Webhook Alerts', analyst: false, desk: true, institutional: true },
  { feature: 'Advanced Analytics', analyst: false, desk: true, institutional: true },
  { feature: 'Cue History (90d)', analyst: false, desk: true, institutional: true },
  { feature: 'Custom Asset Coverage', analyst: false, desk: false, institutional: true },
  { feature: 'Dedicated Model Tuning', analyst: false, desk: false, institutional: true },
  { feature: 'Co-location Data Feeds', analyst: false, desk: false, institutional: true },
  { feature: 'SLA Guarantees', analyst: false, desk: false, institutional: true },
  { feature: 'White-label Options', analyst: false, desk: false, institutional: true },
  { feature: 'Dedicated Account Team', analyst: false, desk: false, institutional: true },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — all plans include a 14-day free trial. No credit card required to start.' },
  { q: 'Can I switch plans?', a: 'Absolutely. You can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, ACH bank transfer, and wire transfer for Institutional plans.' },
  { q: 'Is there an annual discount?', a: 'Yes — annual billing saves 20% on Analyst and Desk plans. Contact sales for Institutional pricing.' },
  { q: 'What does "custom asset coverage" mean?', a: 'Institutional clients can request coverage of specific instruments not in our standard universe — including OTC assets, specific futures contracts, or custom indices.' },
];

const PricingPage = () => (
  <div className="min-h-screen bg-[#080a0e]">
    <NavBar />
    <div className="pt-16">
      <TickerBar />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-cc-amber/4 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1.5 mb-8">
            <i className="ri-price-tag-3-line text-cc-amber text-xs" />
            <span className="text-xs text-cc-amber font-mono tracking-wider">TRANSPARENT PRICING</span>
          </div>
          <h1 className="font-grotesk text-5xl md:text-6xl font-700 leading-tight tracking-tight text-white mb-6">
            Intelligence that pays<br /><span className="text-gradient-gold">for itself.</span>
          </h1>
          <p className="text-cc-text-dim text-xl leading-relaxed max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-xl overflow-hidden flex flex-col"
              style={{
                background: plan.highlighted ? '#0d1117' : '#0d1117',
                border: plan.highlighted ? '1px solid rgba(245,158,11,0.40)' : '1px solid #1a2030',
              }}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cc-amber to-transparent" />
              )}
              {plan.highlighted && (
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.30)' }}>
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className="p-8 flex-1">
                <div className="mb-6">
                  <div className="text-sm font-mono text-cc-muted tracking-wider mb-2">{plan.name.toUpperCase()}</div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-grotesk text-4xl font-700 text-white">{plan.price}</span>
                    {plan.period && <span className="text-cc-muted text-sm mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-cc-text-dim">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-cc-text-dim">
                      <i className="ri-check-line text-cc-amber text-base flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-8 pb-8">
                <a
                  href={plan.name === 'Institutional' ? '/request-access' : '/request-access'}
                  className="w-full flex items-center justify-center gap-2 font-grotesk font-500 text-sm py-3 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                  style={plan.highlighted
                    ? { background: '#F59E0B', color: '#0A0C10' }
                    : { background: 'transparent', border: '1px solid rgba(245,158,11,0.40)', color: '#F59E0B' }
                  }
                  onMouseEnter={e => {
                    if (plan.highlighted) (e.currentTarget as HTMLElement).style.background = '#FBBF24';
                    else (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)';
                  }}
                  onMouseLeave={e => {
                    if (plan.highlighted) (e.currentTarget as HTMLElement).style.background = '#F59E0B';
                    else (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {plan.cta} <i className="ri-arrow-right-line" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-cc-muted mt-6">
          All plans include a 14-day free trial. Annual billing saves 20%.
        </p>
      </section>

      {/* Feature matrix */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="font-grotesk text-3xl font-700 text-white mb-3">Full feature comparison</h2>
          <p className="text-cc-text-dim">Everything included in each plan, side by side.</p>
        </div>
        <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 border-b border-[#1a2030]">
            <div className="p-4 text-xs font-mono text-cc-muted tracking-wider">FEATURE</div>
            {['Analyst', 'Desk', 'Institutional'].map((p, i) => (
              <div key={p} className="p-4 text-center" style={i === 1 ? { borderLeft: '1px solid rgba(245,158,11,0.20)', borderRight: '1px solid rgba(245,158,11,0.20)', background: 'rgba(245,158,11,0.04)' } : { borderLeft: '1px solid #1a2030' }}>
                <div className="text-sm font-grotesk font-700 text-cc-text">{p}</div>
              </div>
            ))}
          </div>
          {featureMatrix.map((row, i) => (
            <div key={row.feature} className="grid grid-cols-4" style={{ borderBottom: i < featureMatrix.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div className="p-4 text-sm text-cc-text-dim">{row.feature}</div>
              {(['analyst', 'desk', 'institutional'] as const).map((plan, pi) => (
                <div key={plan} className="p-4 flex items-center justify-center" style={pi === 1 ? { borderLeft: '1px solid rgba(245,158,11,0.20)', borderRight: '1px solid rgba(245,158,11,0.20)', background: 'rgba(245,158,11,0.02)' } : { borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                  {typeof row[plan] === 'boolean' ? (
                    row[plan]
                      ? <i className="ri-check-line text-cc-green text-base" />
                      : <i className="ri-subtract-line text-cc-muted text-base" />
                  ) : (
                    <span className="text-xs font-mono text-cc-text">{row[plan] as string}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="font-grotesk text-3xl font-700 text-white mb-3">Pricing FAQ</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-[#0d1117] border border-[#1a2030] rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-cc-amber/30" />
          <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-cc-amber/30" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-cc-amber/30" />
          <h2 className="font-grotesk text-4xl font-700 text-white mb-4">Start your free trial today</h2>
          <p className="text-cc-text-dim text-lg mb-8 max-w-xl mx-auto">14 days, full Desk access, no credit card. See why 2,400+ traders trust CueCore.</p>
          <a href="/request-access" className="inline-flex items-center gap-2 bg-cc-amber text-[#0A0C10] font-grotesk font-500 text-sm px-10 py-3.5 rounded-md hover:bg-cc-amber-light transition-colors cursor-pointer whitespace-nowrap">
            Request Early Access <i className="ri-arrow-right-line" />
          </a>
        </div>
      </section>

      <LandingFooter />
    </div>
  </div>
);

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden">
      <button className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer" onClick={() => setOpen(!open)}>
        <span className="text-sm font-inter text-cc-text font-500">{q}</span>
        <i className={`text-cc-amber text-base transition-transform duration-200 flex-shrink-0 ml-4 ${open ? 'ri-subtract-line' : 'ri-add-line'}`} />
      </button>
      {open && (
        <div className="px-6 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm text-cc-text-dim leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
