import { useState, useMemo } from 'react';
import PerformanceChart from './PerformanceChart';

interface HistoryEntry {
  id: string;
  asset: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timeframe: string;
  entry: number;
  exit: number;
  target: number;
  stopLoss: number;
  riskReward: number;
  outcome: 'win' | 'loss';
  pnlPct: number;
  sector: string;
  openedAt: string;
  closedAt: string;
}

interface Props {
  data: HistoryEntry[];
}

const StatCard = ({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: string }) => (
  <div className="bg-[#0a0e17] border border-[#1a2030] rounded-xl p-4 flex flex-col gap-1">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
        <i className={`${icon} text-sm`} style={{ color }} />
      </div>
      <span className="text-xs text-cc-muted">{label}</span>
    </div>
    <div className="text-xl font-grotesk font-700 number-font" style={{ color }}>{value}</div>
    <div className="text-xs text-cc-muted">{sub}</div>
  </div>
);

const SectorBar = ({ sector, wins, losses, total }: { sector: string; wins: number; losses: number; total: number }) => {
  const winPct = total > 0 ? (wins / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs font-mono text-cc-muted truncate">{sector}</div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${winPct}%`, background: winPct >= 60 ? '#00D084' : winPct >= 40 ? '#F59E0B' : '#FF4D4D' }} />
      </div>
      <div className="text-xs font-mono w-10 text-right" style={{ color: winPct >= 60 ? '#00D084' : winPct >= 40 ? '#F59E0B' : '#FF4D4D' }}>
        {winPct.toFixed(0)}%
      </div>
      <div className="text-xs text-cc-muted w-12 text-right">{wins}W/{losses}L</div>
    </div>
  );
};

const PerformanceTracker = ({ data }: Props) => {
  const [activeChart, setActiveChart] = useState<'equity' | 'pnl'>('equity');
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'streaks'>('overview');

  const stats = useMemo(() => {
    const wins = data.filter(d => d.outcome === 'win');
    const losses = data.filter(d => d.outcome === 'loss');
    const winRate = data.length > 0 ? (wins.length / data.length) * 100 : 0;
    const totalPnl = data.reduce((s, d) => s + d.pnlPct, 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, d) => s + d.pnlPct, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, d) => s + d.pnlPct, 0) / losses.length) : 0;
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
    const avgRR = data.length > 0 ? data.reduce((s, d) => s + d.riskReward, 0) / data.length : 0;
    const avgConf = data.length > 0 ? data.reduce((s, d) => s + d.confidence, 0) / data.length : 0;
    const bestTrade = data.reduce((best, d) => d.pnlPct > best.pnlPct ? d : best, data[0] ?? { pnlPct: 0, asset: '—' });
    const worstTrade = data.reduce((worst, d) => d.pnlPct < worst.pnlPct ? d : worst, data[0] ?? { pnlPct: 0, asset: '—' });

    // Expectancy = (winRate * avgWin) - (lossRate * avgLoss)
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

    return { wins: wins.length, losses: losses.length, winRate, totalPnl, avgWin, avgLoss, profitFactor, avgRR, avgConf, bestTrade, worstTrade, expectancy };
  }, [data]);

  // Equity curve: cumulative PnL over time
  const equityCurve = useMemo(() => {
    let cum = 0;
    return data.map(d => {
      cum += d.pnlPct;
      return { label: d.asset, equity: cum };
    });
  }, [data]);

  const pnlBars = useMemo(() => data.map(d => ({
    label: d.asset.split('/')[0],
    pnl: d.pnlPct,
    outcome: d.outcome,
  })), [data]);

  // Sector breakdown
  const sectorStats = useMemo(() => {
    const map: Record<string, { wins: number; losses: number }> = {};
    data.forEach(d => {
      if (!map[d.sector]) map[d.sector] = { wins: 0, losses: 0 };
      if (d.outcome === 'win') map[d.sector].wins++;
      else map[d.sector].losses++;
    });
    return Object.entries(map).map(([sector, v]) => ({ sector, ...v, total: v.wins + v.losses }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  // Timeframe breakdown
  const tfStats = useMemo(() => {
    const map: Record<string, { wins: number; losses: number; pnl: number }> = {};
    data.forEach(d => {
      if (!map[d.timeframe]) map[d.timeframe] = { wins: 0, losses: 0, pnl: 0 };
      if (d.outcome === 'win') map[d.timeframe].wins++;
      else map[d.timeframe].losses++;
      map[d.timeframe].pnl += d.pnlPct;
    });
    return Object.entries(map).map(([tf, v]) => ({ tf, ...v, total: v.wins + v.losses, winRate: v.wins / (v.wins + v.losses) * 100 }))
      .sort((a, b) => ['1H', '4H', '1D', '1W'].indexOf(a.tf) - ['1H', '4H', '1D', '1W'].indexOf(b.tf));
  }, [data]);

  // Streak analysis
  const streaks = useMemo(() => {
    let curStreak = 0;
    let curType: 'win' | 'loss' | null = null;
    let maxWin = 0;
    let maxLoss = 0;
    const streakList: { type: 'win' | 'loss'; count: number; start: string; end: string }[] = [];
    let streakStart = 0;

    data.forEach((d, i) => {
      if (d.outcome === curType) {
        curStreak++;
      } else {
        if (curType !== null && curStreak > 0) {
          streakList.push({ type: curType, count: curStreak, start: data[streakStart].asset, end: data[i - 1].asset });
          if (curType === 'win') maxWin = Math.max(maxWin, curStreak);
          else maxLoss = Math.max(maxLoss, curStreak);
        }
        curType = d.outcome;
        curStreak = 1;
        streakStart = i;
      }
    });
    if (curType && curStreak > 0) {
      streakList.push({ type: curType, count: curStreak, start: data[streakStart].asset, end: data[data.length - 1].asset });
      if (curType === 'win') maxWin = Math.max(maxWin, curStreak);
      else maxLoss = Math.max(maxLoss, curStreak);
    }

    return { maxWin, maxLoss, list: streakList.slice(-8).reverse() };
  }, [data]);

  // Direction breakdown
  const dirStats = useMemo(() => {
    const map: Record<string, { wins: number; losses: number; pnl: number }> = {};
    data.forEach(d => {
      if (!map[d.direction]) map[d.direction] = { wins: 0, losses: 0, pnl: 0 };
      if (d.outcome === 'win') map[d.direction].wins++;
      else map[d.direction].losses++;
      map[d.direction].pnl += d.pnlPct;
    });
    return map;
  }, [data]);

  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0a0e17' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <i className="ri-bar-chart-2-line text-cc-amber text-sm" />
          </div>
          <div>
            <div className="text-sm font-grotesk font-700 text-cc-text">Signal Performance Tracker</div>
            <div className="text-xs text-cc-muted">Based on real entry vs exit prices · {data.length} closed signals</div>
          </div>
        </div>
        <div className="flex gap-1">
          {(['overview', 'breakdown', 'streaks'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="text-xs px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-all whitespace-nowrap"
              style={activeTab === tab
                ? { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }
                : { background: 'transparent', color: '#4E5A6B', border: '1px solid transparent' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'overview' && (
          <>
            {/* Key metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W / ${stats.losses}L`} color="#00D084" icon="ri-trophy-line" />
              <StatCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} sub={`Avg win ${stats.avgWin.toFixed(1)}% / loss ${stats.avgLoss.toFixed(1)}%`} color="#F59E0B" icon="ri-scales-line" />
              <StatCard label="Expectancy" value={`${stats.expectancy >= 0 ? '+' : ''}${stats.expectancy.toFixed(2)}%`} sub="Per trade expected return" color={stats.expectancy >= 0 ? '#00D084' : '#FF4D4D'} icon="ri-funds-line" />
              <StatCard label="Total P&L" value={`${stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(1)}%`} sub={`Avg R/R ${stats.avgRR.toFixed(2)}:1`} color={stats.totalPnl >= 0 ? '#00D084' : '#FF4D4D'} icon="ri-line-chart-line" />
            </div>

            {/* Chart */}
            <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-mono text-cc-muted">
                  {activeChart === 'equity' ? 'Cumulative P&L Curve' : 'Per-Trade P&L Bars'}
                </div>
                <div className="flex gap-1">
                  {(['equity', 'pnl'] as const).map(c => (
                    <button key={c} onClick={() => setActiveChart(c)}
                      className="text-xs px-2.5 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
                      style={activeChart === c
                        ? { background: 'rgba(0,208,132,0.12)', color: '#00D084', border: '1px solid rgba(0,208,132,0.3)' }
                        : { background: 'transparent', color: '#4E5A6B', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {c === 'equity' ? 'Equity Curve' : 'P&L Bars'}
                    </button>
                  ))}
                </div>
              </div>
              <PerformanceChart bars={pnlBars} equityCurve={equityCurve} activeChart={activeChart} />
            </div>

            {/* Best / Worst + Direction stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Best & Worst */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs font-mono text-cc-muted mb-3">BEST &amp; WORST SIGNALS</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center rounded" style={{ background: 'rgba(0,208,132,0.12)' }}>
                        <i className="ri-arrow-up-line text-cc-green text-xs" />
                      </div>
                      <span className="text-xs text-cc-text font-mono">{stats.bestTrade?.asset}</span>
                      <span className="text-xs text-cc-muted">{stats.bestTrade?.timeframe} {stats.bestTrade?.direction}</span>
                    </div>
                    <span className="text-sm font-700 font-mono text-cc-green">+{stats.bestTrade?.pnlPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center rounded" style={{ background: 'rgba(255,77,77,0.12)' }}>
                        <i className="ri-arrow-down-line text-cc-red text-xs" />
                      </div>
                      <span className="text-xs text-cc-text font-mono">{stats.worstTrade?.asset}</span>
                      <span className="text-xs text-cc-muted">{stats.worstTrade?.timeframe} {stats.worstTrade?.direction}</span>
                    </div>
                    <span className="text-sm font-700 font-mono text-cc-red">{stats.worstTrade?.pnlPct}%</span>
                  </div>
                  <div className="pt-2 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cc-muted">Avg confidence on wins</span>
                      <span className="font-mono text-cc-amber">{stats.avgConf.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direction breakdown */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs font-mono text-cc-muted mb-3">DIRECTION BREAKDOWN</div>
                <div className="space-y-3">
                  {Object.entries(dirStats).map(([dir, v]) => {
                    const total = v.wins + v.losses;
                    const wr = total > 0 ? (v.wins / total) * 100 : 0;
                    const dirColor = dir === 'BUY' ? '#00D084' : dir === 'SELL' ? '#FF4D4D' : '#F59E0B';
                    return (
                      <div key={dir} className="flex items-center gap-3">
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded w-10 text-center" style={{ background: `${dirColor}18`, color: dirColor, border: `1px solid ${dirColor}30` }}>{dir}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${wr}%`, background: dirColor }} />
                        </div>
                        <span className="text-xs font-mono w-10 text-right" style={{ color: dirColor }}>{wr.toFixed(0)}%</span>
                        <span className="text-xs text-cc-muted w-16 text-right">{v.wins}W / {v.losses}L</span>
                        <span className={`text-xs font-mono w-14 text-right ${v.pnl >= 0 ? 'text-cc-green' : 'text-cc-red'}`}>
                          {v.pnl >= 0 ? '+' : ''}{v.pnl.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'breakdown' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sector win rates */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs font-mono text-cc-muted mb-4">WIN RATE BY SECTOR</div>
              <div className="space-y-3">
                {sectorStats.map(s => (
                  <SectorBar key={s.sector} sector={s.sector} wins={s.wins} losses={s.losses} total={s.total} />
                ))}
              </div>
            </div>

            {/* Timeframe breakdown */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs font-mono text-cc-muted mb-4">WIN RATE BY TIMEFRAME</div>
              <div className="space-y-3">
                {tfStats.map(t => (
                  <div key={t.tf} className="flex items-center gap-3">
                    <div className="w-10 text-xs font-mono text-cc-text">{t.tf}</div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${t.winRate}%`, background: t.winRate >= 60 ? '#00D084' : t.winRate >= 40 ? '#F59E0B' : '#FF4D4D' }} />
                    </div>
                    <span className="text-xs font-mono w-10 text-right" style={{ color: t.winRate >= 60 ? '#00D084' : t.winRate >= 40 ? '#F59E0B' : '#FF4D4D' }}>
                      {t.winRate.toFixed(0)}%
                    </span>
                    <span className="text-xs text-cc-muted w-12 text-right">{t.wins}W/{t.losses}L</span>
                    <span className={`text-xs font-mono w-14 text-right ${t.pnl >= 0 ? 'text-cc-green' : 'text-cc-red'}`}>
                      {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Entry accuracy */}
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs font-mono text-cc-muted mb-3">ENTRY ACCURACY (vs target hit)</div>
                <div className="space-y-2">
                  {data.slice(0, 5).map(d => {
                    const entryToTarget = Math.abs(d.target - d.entry);
                    const entryToExit = Math.abs(d.exit - d.entry);
                    const accuracy = entryToTarget > 0 ? Math.min((entryToExit / entryToTarget) * 100, 100) : 0;
                    return (
                      <div key={d.id} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-cc-muted w-16 truncate">{d.asset}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${accuracy}%`, background: d.outcome === 'win' ? '#00D084' : '#FF4D4D' }} />
                        </div>
                        <span className="text-xs font-mono w-10 text-right text-cc-muted">{accuracy.toFixed(0)}%</span>
                        <span className="text-xs font-mono w-8 text-right" style={{ color: d.outcome === 'win' ? '#00D084' : '#FF4D4D' }}>
                          {d.outcome === 'win' ? 'HIT' : 'SL'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streaks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Streak summary */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs font-mono text-cc-muted mb-4">STREAK RECORDS</div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,208,132,0.06)', border: '1px solid rgba(0,208,132,0.15)' }}>
                  <div className="text-2xl font-grotesk font-700 text-cc-green number-font">{streaks.maxWin}</div>
                  <div className="text-xs text-cc-muted mt-1">Best Win Streak</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.15)' }}>
                  <div className="text-2xl font-grotesk font-700 text-cc-red number-font">{streaks.maxLoss}</div>
                  <div className="text-xs text-cc-muted mt-1">Worst Loss Streak</div>
                </div>
              </div>

              {/* Confidence vs outcome scatter */}
              <div className="text-xs font-mono text-cc-muted mb-3">CONFIDENCE vs OUTCOME</div>
              <div className="space-y-1.5">
                {[90, 80, 70, 60].map(threshold => {
                  const bucket = data.filter(d => d.confidence >= threshold && d.confidence < threshold + 10);
                  const bWins = bucket.filter(d => d.outcome === 'win').length;
                  const bTotal = bucket.length;
                  const bWr = bTotal > 0 ? (bWins / bTotal) * 100 : 0;
                  return (
                    <div key={threshold} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-cc-muted w-16">{threshold}-{threshold + 9}%</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${bWr}%`, background: '#F59E0B' }} />
                      </div>
                      <span className="text-xs font-mono w-10 text-right text-cc-amber">{bTotal > 0 ? `${bWr.toFixed(0)}%` : '—'}</span>
                      <span className="text-xs text-cc-muted w-10 text-right">{bTotal} sig</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak history */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs font-mono text-cc-muted mb-4">STREAK HISTORY</div>
              <div className="space-y-2">
                {streaks.list.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{ background: s.type === 'win' ? 'rgba(0,208,132,0.05)' : 'rgba(255,77,77,0.05)', border: `1px solid ${s.type === 'win' ? 'rgba(0,208,132,0.12)' : 'rgba(255,77,77,0.12)'}` }}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(s.count, 6) }).map((_, j) => (
                        <div key={j} className="w-2 h-2 rounded-sm"
                          style={{ background: s.type === 'win' ? '#00D084' : '#FF4D4D' }} />
                      ))}
                      {s.count > 6 && <span className="text-xs text-cc-muted ml-1">+{s.count - 6}</span>}
                    </div>
                    <span className="text-xs font-mono" style={{ color: s.type === 'win' ? '#00D084' : '#FF4D4D' }}>
                      {s.count}x {s.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-cc-muted ml-auto">{s.start} → {s.end}</span>
                  </div>
                ))}
                {streaks.list.length === 0 && (
                  <div className="text-xs text-cc-muted text-center py-4">Not enough data for streak analysis</div>
                )}
              </div>

              {/* R/R realized vs planned */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs font-mono text-cc-muted mb-3">REALIZED vs PLANNED R/R</div>
                <div className="space-y-2">
                  {data.slice(0, 5).map(d => {
                    const plannedRR = d.riskReward;
                    const risk = Math.abs(d.entry - d.stopLoss);
                    const realizedRR = risk > 0 ? Math.abs(d.exit - d.entry) / risk : 0;
                    const ratio = plannedRR > 0 ? (realizedRR / plannedRR) * 100 : 0;
                    return (
                      <div key={d.id} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-cc-muted w-16 truncate">{d.asset}</span>
                        <span className="text-xs font-mono text-cc-muted w-12">Plan {plannedRR}:1</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${Math.min(ratio, 100)}%`, background: ratio >= 80 ? '#00D084' : ratio >= 50 ? '#F59E0B' : '#FF4D4D' }} />
                        </div>
                        <span className="text-xs font-mono w-14 text-right text-cc-muted">
                          Got {realizedRR.toFixed(1)}:1
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTracker;
