import NavBar from '@/pages/home/components/NavBar';
import TickerBar from '@/pages/home/components/TickerBar';
import LandingFooter from '@/pages/home/components/LandingFooter';

const steps = [
  {
    step: '01',
    icon: 'ri-database-2-line',
    title: 'Data Ingestion',
    subtitle: 'Raw market intelligence at scale',
    description: 'CueCore connects to 14 institutional-grade data feeds simultaneously — NYSE, CME, CBOE, Reuters, Bloomberg, dark pool aggregators, and social sentiment APIs. Every tick, every print, every headline is ingested in real-time.',
    details: [
      { label: 'Data Sources', value: '14 live feeds' },
      { label: 'Instruments', value: '1,800+' },
      { label: 'Tick Latency', value: '<12ms' },
      { label: 'Daily Records', value: '4.2B+' },
    ],
    tags: ['Level 2 Order Book', 'Dark Pool Prints', 'Options Flow', 'News NLP', 'Social Sentiment', 'Macro Events'],
  },
  {
    step: '02',
    icon: 'ri-brain-line',
    title: 'AI Analysis',
    subtitle: 'Multi-factor intelligence engine',
    description: 'Our proprietary model evaluates 40+ technical indicators simultaneously — RSI, MACD, Bollinger Bands, VWAP, volume anomalies, order book imbalance, and more. Each factor is weighted dynamically based on market regime.',
    details: [
      { label: 'Indicators', value: '40+ factors' },
      { label: 'Model Layers', value: '7 stacked' },
      { label: 'Regime Detection', value: 'Real-time' },
      { label: 'Backtested On', value: '12 years' },
    ],
    tags: ['RSI Divergence', 'MACD Confluence', 'Volume Anomaly', 'Order Imbalance', 'Sentiment Score', 'Macro Context'],
  },
  {
    step: '03',
    icon: 'ri-shield-check-line',
    title: 'R/R Filtering',
    subtitle: 'Only high-quality setups pass',
    description: 'Before any cue is generated, it must pass our proprietary Risk/Reward gate. Setups with R/R below 1.5:1 are suppressed. Confidence below 65% is suppressed. This is why our signal-to-noise ratio is exceptional.',
    details: [
      { label: 'Min R/R Gate', value: '1.5:1' },
      { label: 'Min Confidence', value: '65%' },
      { label: 'Suppression Rate', value: '~78%' },
      { label: 'Avg R/R Passed', value: '2.18:1' },
    ],
    tags: ['R/R Gate', 'Confidence Threshold', 'Stop Placement', 'Target Logic', 'Position Sizing', 'Drawdown Control'],
  },
  {
    step: '04',
    icon: 'ri-flashlight-line',
    title: 'Cue Generation',
    subtitle: 'Structured, actionable intelligence',
    description: 'When all conditions align, a structured cue is generated with complete context: direction (BUY/SELL/HOLD), entry price, target, stop-loss, R/R ratio, confidence score, and a reasoning summary. Every field is machine-generated.',
    details: [
      { label: 'Avg Generation Time', value: '<800ms' },
      { label: 'Cues/Day', value: '200–400' },
      { label: 'Avg Confidence', value: '84.7%' },
      { label: 'Timeframes', value: '1H, 4H, 1D, 1W' },
    ],
    tags: ['Entry Price', 'Target Level', 'Stop Loss', 'R/R Ratio', 'Confidence Score', 'Reasoning Summary'],
  },
  {
    step: '05',
    icon: 'ri-send-plane-line',
    title: 'Delivery',
    subtitle: 'Real-time to your workflow',
    description: 'Cues are delivered to your dashboard in real-time. Configure alerts via Slack, webhook, email, or SMS. Every cue is tracked from open to close — outcomes feed back into the model for continuous improvement.',
    details: [
      { label: 'Dashboard Latency', value: '<200ms' },
      { label: 'Alert Channels', value: '5 options' },
      { label: 'API Access', value: 'REST + WS' },
      { label: 'Outcome Tracking', value: 'Automated' },
    ],
    tags: ['Live Dashboard', 'Slack Alerts', 'Webhook', 'Email', 'REST API', 'WebSocket'],
  },
];

const faqs = [
  { q: 'How is CueCore different from a screener?', a: 'A screener shows you what\'s happening. CueCore tells you what to do about it — with a complete structured cue including entry, target, stop, R/R, and confidence. It\'s the difference between raw data and actionable intelligence.' },
  { q: 'What assets does CueCore cover?', a: 'CueCore covers 1,800+ instruments across Equities (US & international), Crypto (spot & perpetuals), Forex (major & minor pairs), Commodities (metals, energy, agriculture), and major Indices.' },
  { q: 'How is the confidence score calculated?', a: 'Confidence is a composite score derived from indicator confluence, volume confirmation, sentiment alignment, and historical pattern similarity. It represents the model\'s certainty in the setup, not the direction.' },
  { q: 'Can I use CueCore with my existing broker?', a: 'Yes. CueCore is a pure intelligence layer — it doesn\'t execute trades. You receive cues and act on them through your existing broker or trading platform. We integrate with most major platforms via API.' },
  { q: 'How are outcomes tracked?', a: 'Every cue is tracked from generation to close. When price hits the target or stop-loss, the outcome is recorded automatically. This data feeds back into the model and is visible in your History dashboard.' },
];

const HowItWorksPage = () => (
  <div className="min-h-screen bg-[#080a0e]">
    <NavBar />
    <div className="pt-16">
      <TickerBar />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-cc-amber/4 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1.5 mb-8">
            <i className="ri-route-line text-cc-amber text-xs" />
            <span className="text-xs text-cc-amber font-mono tracking-wider">THE INTELLIGENCE PIPELINE</span>
          </div>
          <h1 className="font-grotesk text-5xl md:text-6xl font-700 leading-tight tracking-tight text-white mb-6">
            From raw data to<br /><span className="text-gradient-gold">structured cue</span>
          </h1>
          <p className="text-cc-text-dim text-xl leading-relaxed max-w-2xl mx-auto">
            Every CueCore signal passes through a 5-stage intelligence pipeline — from multi-source data ingestion to R/R-filtered cue delivery. Here's exactly how it works.
          </p>
        </div>
      </section>

      {/* Pipeline steps */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="bg-[#0d1117] border border-[#1a2030] rounded-xl overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left: step info */}
                <div className="flex-1 p-8">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}>
                        <i className={`${step.icon} text-cc-amber text-xl`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-cc-amber tracking-widest">STEP {step.step}</span>
                        {i < steps.length - 1 && (
                          <div className="flex-1 h-px" style={{ background: 'rgba(245,158,11,0.15)' }} />
                        )}
                      </div>
                      <h2 className="font-grotesk text-2xl font-700 text-white mb-1">{step.title}</h2>
                      <p className="text-cc-amber text-sm mb-4">{step.subtitle}</p>
                      <p className="text-cc-text-dim leading-relaxed mb-6">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.tags.map(tag => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: metrics */}
                <div className="lg:w-72 p-8 flex-shrink-0" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs font-mono text-cc-muted tracking-wider mb-4">KEY METRICS</div>
                  <div className="space-y-4">
                    {step.details.map(d => (
                      <div key={d.label} className="flex items-center justify-between">
                        <span className="text-xs text-cc-muted">{d.label}</span>
                        <span className="text-sm font-grotesk font-700 text-cc-text number-font">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flow connector */}
        <div className="flex justify-center mt-8 mb-16">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
            <span className="w-2 h-2 rounded-full bg-cc-green pulse-dot" />
            <span className="text-sm font-mono text-cc-amber">End-to-end latency: &lt;1 second from market event to cue delivery</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-grotesk text-3xl font-700 text-white mb-3">Common questions</h2>
          <p className="text-cc-text-dim">Everything you need to know about the CueCore intelligence system.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="bg-[#0d1117] border border-[#1a2030] rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-cc-amber/30" />
          <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-cc-amber/30" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-cc-amber/30" />
          <h2 className="font-grotesk text-4xl font-700 text-white mb-4">See it in action</h2>
          <p className="text-cc-text-dim text-lg mb-8 max-w-xl mx-auto">Start your 14-day free trial and experience the full intelligence pipeline live.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/request-access" className="inline-flex items-center gap-2 bg-cc-amber text-[#0A0C10] font-grotesk font-500 text-sm px-8 py-3.5 rounded-md hover:bg-cc-amber-light transition-colors cursor-pointer whitespace-nowrap">
              Request Early Access <i className="ri-arrow-right-line" />
            </a>
            <a href="/pricing" className="inline-flex items-center gap-2 text-sm px-8 py-3.5 cursor-pointer whitespace-nowrap transition-colors" style={{ background: 'transparent', border: '1px solid rgba(245,158,11,0.40)', color: '#F59E0B', borderRadius: '6px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              View Pricing
            </a>
          </div>
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
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
        onClick={() => setOpen(!open)}
      >
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

export default HowItWorksPage;
