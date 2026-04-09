import { useEffect } from 'react';
import { usePlan, PlanTier } from '@/hooks/usePlan';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan?: 'desk' | 'institutional';
}

const planDetails = {
  desk: {
    label: 'Desk',
    price: '$499/mo',
    color: '#F59E0B',
    features: [
      'Unlimited cues across all timeframes',
      'AI Reasoning summaries per signal',
      'Full R/R breakdown & factor analysis',
      'Advanced chart overlays (VWAP, Bollinger Bands)',
      '90-day cue history & analytics',
      'Slack & Webhook alert delivery',
      'REST API + WebSocket stream access',
    ],
  },
  institutional: {
    label: 'Institutional',
    price: 'Custom',
    color: '#E5C97E',
    features: [
      'Everything in Desk',
      'Custom asset coverage & model tuning',
      'Co-location data feeds',
      'SLA guarantees & dedicated account team',
      'White-label options',
    ],
  },
};

const UpgradeModal = ({ open, onClose, featureName, requiredPlan = 'desk' }: UpgradeModalProps) => {
  const { setTier } = usePlan();
  const plan = planDetails[requiredPlan];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSimulateUpgrade = (tier: PlanTier) => {
    setTier(tier);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#0d1117', border: '1px solid rgba(245,158,11,0.30)' }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cc-amber to-transparent" />

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-cc-amber/30" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-cc-amber/30" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-cc-muted hover:text-cc-text transition-colors cursor-pointer rounded z-10"
        >
          <i className="ri-close-line text-lg" />
        </button>

        <div className="p-8">
          {/* Lock icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}
          >
            <i className="ri-lock-2-line text-2xl text-cc-amber" />
          </div>

          {/* Headline */}
          <div className="mb-1">
            <span
              className="text-xs font-mono tracking-wider px-2 py-0.5 rounded"
              style={{ background: 'rgba(245,158,11,0.10)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.20)' }}
            >
              {plan.label.toUpperCase()} PLAN REQUIRED
            </span>
          </div>
          <h2 className="font-grotesk text-xl font-700 text-white mt-3 mb-2">
            Unlock {featureName}
          </h2>
          <p className="text-sm text-cc-text-dim mb-6 leading-relaxed">
            This feature is available on the <strong className="text-cc-amber">{plan.label}</strong> plan and above.
            Upgrade to access the full CueCore intelligence suite.
          </p>

          {/* Feature list */}
          <div
            className="rounded-xl p-4 mb-6 space-y-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">INCLUDED IN {plan.label.toUpperCase()}</div>
            {plan.features.map(f => (
              <div key={f} className="flex items-start gap-2.5">
                <i className="ri-check-line text-cc-amber text-sm flex-shrink-0 mt-0.5" />
                <span className="text-sm text-cc-text-dim">{f}</span>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-cc-muted">Starting at</div>
              <div className="text-2xl font-grotesk font-700 text-white">{plan.price}</div>
            </div>
            <a
              href="/pricing"
              className="flex items-center gap-2 font-grotesk font-500 text-sm px-6 py-2.5 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              style={{ background: '#F59E0B', color: '#0A0C10' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
            >
              View Plans <i className="ri-arrow-right-line" />
            </a>
          </div>

          {/* Demo toggle — lets user preview premium without real auth */}
          <div
            className="rounded-lg p-3 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs text-cc-muted">Preview as:</span>
            <div className="flex gap-1">
              {(['analyst', 'desk', 'institutional'] as PlanTier[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleSimulateUpgrade(t)}
                  className="text-xs px-2.5 py-1 rounded cursor-pointer transition-all capitalize whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#8A95A8', border: '1px solid transparent' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.12)';
                    (e.currentTarget as HTMLElement).style.color = '#F59E0B';
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(245,158,11,0.30)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.color = '#8A95A8';
                    (e.currentTarget as HTMLElement).style.border = '1px solid transparent';
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
