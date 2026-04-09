import { useState, ReactNode } from 'react';
import { usePlan } from '@/hooks/usePlan';
import UpgradeModal from './UpgradeModal';

interface PremiumGateProps {
  featureName: string;
  requiredPlan?: 'desk' | 'institutional';
  children: ReactNode;
  /** If true, renders children with a blur overlay instead of replacing them */
  overlay?: boolean;
  /** Custom locked placeholder height */
  lockedHeight?: string;
}

const PremiumGate = ({
  featureName,
  requiredPlan = 'desk',
  children,
  overlay = false,
  lockedHeight = '120px',
}: PremiumGateProps) => {
  const { isPremium, isInstitutional } = usePlan();
  const [modalOpen, setModalOpen] = useState(false);

  const hasAccess =
    requiredPlan === 'desk' ? isPremium : isInstitutional;

  if (hasAccess) return <>{children}</>;

  if (overlay) {
    return (
      <>
        <div className="relative">
          <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}>
            {children}
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <div
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(10,12,16,0.85)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <i className="ri-lock-2-line text-cc-amber text-lg" />
              <span className="text-xs font-mono text-cc-amber tracking-wider">
                {requiredPlan === 'desk' ? 'DESK' : 'INSTITUTIONAL'} PLAN
              </span>
              <span className="text-xs text-cc-muted">Click to unlock</span>
            </div>
          </div>
        </div>
        <UpgradeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          featureName={featureName}
          requiredPlan={requiredPlan}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-all"
        style={{
          height: lockedHeight,
          background: 'rgba(245,158,11,0.03)',
          border: '1px dashed rgba(245,158,11,0.20)',
        }}
        onClick={() => setModalOpen(true)}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.06)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.35)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.03)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.20)';
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.10)' }}
        >
          <i className="ri-lock-2-line text-cc-amber text-base" />
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-cc-amber tracking-wider">
            {requiredPlan === 'desk' ? 'DESK' : 'INSTITUTIONAL'} PLAN
          </div>
          <div className="text-xs text-cc-muted mt-0.5">{featureName} · Click to upgrade</div>
        </div>
      </div>
      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={featureName}
        requiredPlan={requiredPlan}
      />
    </>
  );
};

export default PremiumGate;
