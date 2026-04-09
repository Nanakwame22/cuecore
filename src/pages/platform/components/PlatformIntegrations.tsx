import { integrations } from '@/mocks/platformData';

const deliveryChannels = [
  { icon: 'ri-dashboard-line', label: 'Web Dashboard', desc: 'Real-time cue feed with full reasoning and analytics' },
  { icon: 'ri-smartphone-line', label: 'Mobile App', desc: 'iOS & Android push notifications with cue summaries' },
  { icon: 'ri-code-s-slash-line', label: 'REST API', desc: 'Pull cues programmatically into your own systems' },
  { icon: 'ri-wifi-line', label: 'WebSocket Stream', desc: 'Live streaming feed for low-latency integrations' },
  { icon: 'ri-slack-line', label: 'Slack / Telegram', desc: 'Instant alerts delivered to your team channels' },
  { icon: 'ri-webhook-line', label: 'Webhooks', desc: 'Custom HTTP callbacks to any endpoint you control' },
];

const PlatformIntegrations = () => (
  <section className="bg-[#080a0e] py-28">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
          <span className="text-xs text-cc-amber font-mono tracking-wider">DELIVERY &amp; INTEGRATIONS</span>
        </div>
        <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-4">
          Cues delivered<br /><span className="text-gradient-gold">wherever you work.</span>
        </h2>
        <p className="text-cc-text-dim text-lg max-w-2xl mx-auto">
          CueCore fits into your existing workflow. Whether you're on a trading desk, running an algo, or monitoring from your phone — signals reach you in real-time.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Delivery channels */}
        <div className="flex-1">
          <div className="text-xs font-mono text-cc-muted tracking-wider mb-4">DELIVERY CHANNELS</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deliveryChannels.map((ch, i) => (
              <div key={i} className="bg-[#0d1117] border border-[#1a2030] rounded-lg p-4 flex items-start gap-3 cue-card-hover cursor-default group">
                <div className="w-9 h-9 flex items-center justify-center bg-cc-amber/10 border border-cc-amber/20 rounded-md flex-shrink-0 group-hover:bg-cc-amber/15 transition-colors">
                  <i className={`${ch.icon} text-cc-amber text-sm`} />
                </div>
                <div>
                  <div className="text-sm font-grotesk font-500 text-white mb-0.5">{ch.label}</div>
                  <div className="text-xs text-cc-text-dim leading-relaxed">{ch.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Broker integrations */}
        <div className="lg:w-72">
          <div className="text-xs font-mono text-cc-muted tracking-wider mb-4">BROKER &amp; PLATFORM INTEGRATIONS</div>
          <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl overflow-hidden">
            {integrations.map((intg, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#1a2030]/60 last:border-0 hover:bg-[#131820] transition-colors cursor-default">
                <div className="w-8 h-8 flex items-center justify-center bg-[#080a0e] border border-[#1a2030] rounded-md">
                  <i className={`${intg.icon} text-cc-text-dim text-sm`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white">{intg.name}</div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)', color: '#F59E0B' }}
                >
                  {intg.category}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-[#0d1117] border border-[#1a2030] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-add-circle-line text-cc-amber text-sm" />
              <span className="text-sm font-grotesk font-500 text-white">Custom Integration</span>
            </div>
            <p className="text-xs text-cc-text-dim leading-relaxed">
              Need a custom integration? Our API supports any execution system. Enterprise clients get dedicated integration support.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PlatformIntegrations;
