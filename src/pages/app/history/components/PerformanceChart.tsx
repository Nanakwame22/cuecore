import { useMemo } from 'react';

interface Bar {
  label: string;
  pnl: number;
  outcome: 'win' | 'loss';
}

interface EquityPoint {
  label: string;
  equity: number;
}

interface Props {
  bars: Bar[];
  equityCurve: EquityPoint[];
  activeChart: 'equity' | 'pnl';
}

const PerformanceChart = ({ bars, equityCurve, activeChart }: Props) => {
  const pnlMin = useMemo(() => Math.min(...bars.map(b => b.pnl), 0), [bars]);
  const pnlMax = useMemo(() => Math.max(...bars.map(b => b.pnl), 0), [bars]);
  const pnlRange = pnlMax - pnlMin || 1;

  const eqMin = useMemo(() => Math.min(...equityCurve.map(p => p.equity)), [equityCurve]);
  const eqMax = useMemo(() => Math.max(...equityCurve.map(p => p.equity)), [equityCurve]);
  const eqRange = eqMax - eqMin || 1;

  const W = 600;
  const H = 160;
  const PAD = { top: 12, bottom: 28, left: 44, right: 12 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Equity curve path
  const eqPath = useMemo(() => {
    if (equityCurve.length < 2) return '';
    return equityCurve.map((p, i) => {
      const x = PAD.left + (i / (equityCurve.length - 1)) * chartW;
      const y = PAD.top + chartH - ((p.equity - eqMin) / eqRange) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [equityCurve, eqMin, eqRange, chartW, chartH]);

  const eqFill = useMemo(() => {
    if (equityCurve.length < 2) return '';
    const last = equityCurve[equityCurve.length - 1];
    const lastX = PAD.left + chartW;
    const lastY = PAD.top + chartH - ((last.equity - eqMin) / eqRange) * chartH;
    const firstX = PAD.left;
    const baseY = PAD.top + chartH;
    return `${eqPath} L${lastX.toFixed(1)},${baseY.toFixed(1)} L${firstX.toFixed(1)},${baseY.toFixed(1)} Z`;
  }, [eqPath, equityCurve, eqMin, eqRange, chartW, chartH]);

  // Y-axis labels
  const yLabels = useMemo(() => {
    if (activeChart === 'equity') {
      return [eqMin, eqMin + eqRange * 0.5, eqMax].map(v => ({
        y: PAD.top + chartH - ((v - eqMin) / eqRange) * chartH,
        label: `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
      }));
    }
    return [pnlMin, 0, pnlMax].map(v => ({
      y: PAD.top + chartH - ((v - pnlMin) / pnlRange) * chartH,
      label: `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
    }));
  }, [activeChart, eqMin, eqMax, eqRange, pnlMin, pnlMax, pnlRange, chartH]);

  const barWidth = bars.length > 0 ? Math.max(6, (chartW / bars.length) * 0.6) : 10;
  const zeroY = PAD.top + chartH - ((0 - pnlMin) / pnlRange) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D084" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00D084" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="eqLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00D084" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00D084" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((yl, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={yl.y} x2={W - PAD.right} y2={yl.y}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,4" />
          <text x={PAD.left - 6} y={yl.y + 4} textAnchor="end"
            fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">
            {yl.label}
          </text>
        </g>
      ))}

      {activeChart === 'equity' ? (
        <>
          <path d={eqFill} fill="url(#eqGrad)" />
          <path d={eqPath} fill="none" stroke="url(#eqLine)" strokeWidth="2" strokeLinejoin="round" />
          {equityCurve.map((p, i) => {
            const x = PAD.left + (i / (equityCurve.length - 1)) * chartW;
            const y = PAD.top + chartH - ((p.equity - eqMin) / eqRange) * chartH;
            return i === equityCurve.length - 1 ? (
              <circle key={i} cx={x} cy={y} r="3.5" fill="#00D084" />
            ) : null;
          })}
        </>
      ) : (
        <>
          {/* Zero line */}
          <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {bars.map((b, i) => {
            const x = PAD.left + (i / bars.length) * chartW + (chartW / bars.length - barWidth) / 2;
            const barH = Math.abs(((b.pnl - 0) / pnlRange) * chartH);
            const y = b.pnl >= 0 ? zeroY - barH : zeroY;
            return (
              <rect key={i} x={x} y={y} width={barWidth} height={Math.max(barH, 2)}
                fill={b.outcome === 'win' ? 'rgba(0,208,132,0.75)' : 'rgba(255,77,77,0.75)'}
                rx="2" />
            );
          })}
        </>
      )}

      {/* X-axis labels */}
      {bars.filter((_, i) => i % Math.ceil(bars.length / 6) === 0).map((b, i, arr) => {
        const origIdx = bars.indexOf(b);
        const x = PAD.left + (origIdx / bars.length) * chartW + (chartW / bars.length) / 2;
        return (
          <text key={i} x={x} y={H - 6} textAnchor="middle"
            fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">
            {b.label}
          </text>
        );
      })}
    </svg>
  );
};

export default PerformanceChart;
