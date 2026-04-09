import { useState } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { historyData } from '@/mocks/appData';
import { usePlan } from '@/hooks/usePlan';
import PremiumGate from '@/components/feature/PremiumGate';
import PerformanceTracker from './components/PerformanceTracker';

const directionStyle = (d: string) => {
  if (d === 'BUY') return { bg: 'rgba(0,208,132,0.12)', color: '#00D084', border: 'rgba(0,208,132,0.25)' };
  if (d === 'SELL') return { bg: 'rgba(255,77,77,0.12)', color: '#FF4D4D', border: 'rgba(255,77,77,0.25)' };
  return { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', border: 'rgba(107,114,128,0.25)' };
};

const HistoryPage = () => {
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [sectorFilter, setSectorFilter] = useState('All');
  const { isPremium } = usePlan();

  const sectors = ['All', 'Crypto', 'Equity', 'Forex', 'Commodity'];

  const allFiltered = historyData.filter(h =>
    (outcomeFilter === 'all' || h.outcome === outcomeFilter) &&
    (sectorFilter === 'All' || h.sector === sectorFilter)
  );

  // Analyst plan: only last 3 entries visible
  const visibleData = isPremium ? allFiltered : allFiltered.slice(0, 3);
  const lockedCount = isPremium ? 0 : Math.max(0, allFiltered.length - 3);

  const wins = historyData.filter(h => h.outcome === 'win').length;
  const losses = historyData.filter(h => h.outcome === 'loss').length;
  const winRate = ((wins / historyData.length) * 100).toFixed(1);
  const avgRR = (historyData.reduce((s, h) => s + h.riskReward, 0) / historyData.length).toFixed(2);
  const bestPnl = Math.max(...historyData.map(h => h.pnlPct));
  const worstPnl = Math.min(...historyData.map(h => h.pnlPct));

  return (
    <AppLayout title="History" subtitle="Closed cue outcomes and performance analytics">
      <div className="p-6">
        {/* Plan notice for Analyst */}
        {!isPremium && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)' }}
          >
            <i className="ri-lock-2-line text-cc-amber text-sm" />
            <span className="text-sm text-cc-text-dim">
              You&apos;re on the <strong className="text-cc-amber">Analyst plan</strong> — showing last 3 cues only.
              <a href="/pricing" className="text-cc-amber ml-1 hover:underline cursor-pointer">Upgrade to Desk</a> for 90-day history.
            </span>
          </div>
        )}

        {/* Performance Tracker */}
        <PerformanceTracker data={historyData} />

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Win Rate', value: `${winRate}%`, sub: `${wins}W / ${losses}L`, color: '#00D084' },
            { label: 'Avg R/R', value: `${avgRR}:1`, sub: 'Closed positions', color: '#F59E0B' },
            { label: 'Best Cue', value: `+${bestPnl}%`, sub: 'SOL/USD 4H BUY', color: '#00D084' },
            { label: 'Worst Cue', value: `${worstPnl}%`, sub: 'TSLA 1D BUY', color: '#FF4D4D' },
          ].map(s => (
            <div key={s.label} className="stat-card rounded-2xl p-5">
              <div className="text-[10px] font-mono tracking-wider mb-3" style={{ color: '#2A3A4A' }}>{s.label.toUpperCase()}</div>
              <div className="text-2xl font-grotesk font-700 number-font mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] font-inter" style={{ color: '#3D5060' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex gap-1">
            {(['all', 'win', 'loss'] as const).map(o => (
              <button key={o} onClick={() => setOutcomeFilter(o)} className="text-xs px-3 py-2 rounded cursor-pointer transition-all capitalize whitespace-nowrap"
                style={outcomeFilter === o ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' } : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B', border: '1px solid transparent' }}>
                {o === 'all' ? 'All' : o === 'win' ? 'Wins' : 'Losses'}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-[#1a2030]" />
          <div className="flex gap-1">
            {sectors.map(s => (
              <button key={s} onClick={() => setSectorFilter(s)} className="text-xs px-3 py-2 rounded cursor-pointer transition-all whitespace-nowrap"
                style={sectorFilter === s ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' } : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B', border: '1px solid transparent' }}>
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-cc-muted">{isPremium ? allFiltered.length : `${visibleData.length} of ${allFiltered.length}`} cues</div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1520 0%, #0A1018 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="grid grid-cols-12 px-5 py-3 text-[10px] font-mono tracking-widest" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: '#2A3A4A' }}>
            <div className="col-span-2">ASSET</div>
            <div className="col-span-1 text-center">DIR</div>
            <div className="col-span-1 text-center">TF</div>
            <div className="col-span-2 text-right">ENTRY</div>
            <div className="col-span-2 text-right">EXIT</div>
            <div className="col-span-1 text-center">R/R</div>
            <div className="col-span-1 text-center">CONF</div>
            <div className="col-span-1 text-right">P&amp;L</div>
            <div className="col-span-1 text-center">OUTCOME</div>
          </div>
          <div className="divide-y divide-[#1a2030]/50">
            {visibleData.map(h => {
              const ds = directionStyle(h.direction);
              return (
                <div key={h.id} className="grid grid-cols-12 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer items-center">
                  <div className="col-span-2">
                    <div className="font-grotesk font-700 text-cc-text text-sm">{h.asset}</div>
                    <div className="text-xs text-cc-muted">{h.openedAt}</div>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>{h.direction}</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-xs font-mono text-cc-muted">{h.timeframe}</span>
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm text-cc-text">{h.entry.toLocaleString()}</div>
                  <div className="col-span-2 text-right font-mono text-sm text-cc-text">{h.exit.toLocaleString()}</div>
                  <div className="col-span-1 text-center font-mono text-xs text-cc-amber">{h.riskReward}:1</div>
                  <div className="col-span-1 text-center font-mono text-xs text-cc-amber">{h.confidence}%</div>
                  <div className={`col-span-1 text-right font-mono text-sm font-700 ${h.pnlPct >= 0 ? 'text-cc-green' : 'text-cc-red'}`}>
                    {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct}%
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className="text-xs px-2 py-0.5 rounded font-mono"
                      style={h.outcome === 'win'
                        ? { background: 'rgba(0,208,132,0.12)', color: '#00D084', border: '1px solid rgba(0,208,132,0.25)' }
                        : { background: 'rgba(255,77,77,0.12)', color: '#FF4D4D', border: '1px solid rgba(255,77,77,0.25)' }}>
                      {h.outcome.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Locked rows gate */}
        {lockedCount > 0 && (
          <div className="mt-3">
            <PremiumGate featureName={`90-Day History (${lockedCount} more cues)`} requiredPlan="desk" lockedHeight="80px" />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
