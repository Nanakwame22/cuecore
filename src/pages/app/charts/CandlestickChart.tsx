import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { OHLCBar } from '@/mocks/appData';
import { ChartType } from './page';

interface SignalOverlay {
  direction: 'BUY' | 'SELL' | 'HOLD';
  entry: number;
  stopLoss: number;
  target: number;
  riskReward: number;
}

interface Props {
  bars: OHLCBar[];
  liveBar?: OHLCBar | null;
  livePrice?: number;
  barProgress?: number;
  chartType: ChartType;
  showVWAP: boolean;
  showBB: boolean;
  showVolume: boolean;
  showRSI: boolean;
  showMACD: boolean;
  showMA: boolean;
  signal?: SignalOverlay | null;
}

const PADDING_LEFT = 12;
const PADDING_RIGHT = 64;
const PRICE_LABELS = 6;
const RSI_LABELS = [30, 50, 70];

// Compute Heikin Ashi bars from OHLC
const toHeikinAshi = (bars: OHLCBar[]): OHLCBar[] => {
  const result: OHLCBar[] = [];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const haClose = (b.open + b.high + b.low + b.close) / 4;
    const haOpen = i === 0 ? (b.open + b.close) / 2 : (result[i - 1].open + result[i - 1].close) / 2;
    const haHigh = Math.max(b.high, haOpen, haClose);
    const haLow = Math.min(b.low, haOpen, haClose);
    result.push({ ...b, open: haOpen, high: haHigh, low: haLow, close: haClose, bullish: haClose >= haOpen });
  }
  return result;
};

const CandlestickChart = ({ bars, liveBar, livePrice, barProgress = 0, chartType, showVWAP, showBB, showVolume, showRSI, showMACD, showMA, signal }: Props) => {
  // Blink state for live price label
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(t);
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 520 });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const dragOffset = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Panel heights
  const totalH = containerSize.height;
  const bottomPanelCount = (showRSI ? 1 : 0) + (showMACD ? 1 : 0);
  const volH = showVolume ? Math.round(totalH * 0.13) : 0;
  const indicatorH = bottomPanelCount > 0 ? Math.round(totalH * 0.14) : 0;
  const priceH = totalH - volH - indicatorH * bottomPanelCount;

  const W = containerSize.width;
  const drawW = W - PADDING_LEFT - PADDING_RIGHT;

  // Merge live bar into the tail of bars
  const allBars = liveBar ? [...bars, liveBar] : bars;

  // Zoom/pan: visible bar count
  const visibleCount = Math.max(20, Math.round(allBars.length / zoom));
  const maxOffset = Math.max(0, allBars.length - visibleCount);
  const clampedOffset = Math.max(0, Math.min(offset, maxOffset));
  const rawVisibleBars = allBars.slice(clampedOffset, clampedOffset + visibleCount);
  const visibleBars = chartType === 'heikin_ashi' ? toHeikinAshi(rawVisibleBars) : rawVisibleBars;

  // Index of the live bar in visible slice (last item if live bar is visible)
  const liveBarVisibleIdx = liveBar && clampedOffset + visibleCount >= allBars.length
    ? visibleBars.length - 1
    : -1;

  const barSlotW = drawW / visibleCount;
  const candleW = Math.max(1.5, Math.min(barSlotW * 0.6, 14));

  const toX = useCallback((i: number) => PADDING_LEFT + i * barSlotW + barSlotW / 2, [barSlotW]);

  // Computed data
  const computed = useMemo(() => {
    if (!visibleBars.length) return null;

    const highs = visibleBars.map(b => b.high);
    const lows = visibleBars.map(b => b.low);
    const rawMax = Math.max(...highs);
    const rawMin = Math.min(...lows);
    const pad = (rawMax - rawMin) * 0.08;
    const maxH = rawMax + pad;
    const minL = rawMin - pad;

    // VWAP
    let cumTPV = 0, cumVol = 0;
    const vwap = visibleBars.map(b => {
      const tp = (b.high + b.low + b.close) / 3;
      cumTPV += tp * b.volume;
      cumVol += b.volume;
      return cumTPV / cumVol;
    });

    // Bollinger Bands (20-period)
    const period = 20;
    const bbUpper: (number | null)[] = [];
    const bbLower: (number | null)[] = [];
    const bbMid: (number | null)[] = [];
    for (let i = 0; i < visibleBars.length; i++) {
      if (i < period - 1) { bbUpper.push(null); bbLower.push(null); bbMid.push(null); continue; }
      const slice = visibleBars.slice(i - period + 1, i + 1).map(b => b.close);
      const mean = slice.reduce((a, v) => a + v, 0) / period;
      const std = Math.sqrt(slice.reduce((a, v) => a + (v - mean) ** 2, 0) / period);
      bbUpper.push(mean + 2 * std);
      bbLower.push(mean - 2 * std);
      bbMid.push(mean);
    }

    // MA20 and MA50
    const ma20: (number | null)[] = visibleBars.map((_, i) => {
      if (i < 19) return null;
      return visibleBars.slice(i - 19, i + 1).reduce((a, b) => a + b.close, 0) / 20;
    });
    const ma50: (number | null)[] = visibleBars.map((_, i) => {
      if (i < 49) return null;
      return visibleBars.slice(i - 49, i + 1).reduce((a, b) => a + b.close, 0) / 50;
    });

    // Price labels
    const step = (maxH - minL) / (PRICE_LABELS - 1);
    const priceLabels = Array.from({ length: PRICE_LABELS }, (_, i) => maxH - step * i);

    // Support/Resistance (simple: local highs/lows)
    const srLevels: number[] = [];
    for (let i = 3; i < visibleBars.length - 3; i++) {
      const isLocalHigh = visibleBars[i].high > visibleBars[i - 1].high && visibleBars[i].high > visibleBars[i + 1].high
        && visibleBars[i].high > visibleBars[i - 2].high && visibleBars[i].high > visibleBars[i + 2].high;
      const isLocalLow = visibleBars[i].low < visibleBars[i - 1].low && visibleBars[i].low < visibleBars[i + 1].low
        && visibleBars[i].low < visibleBars[i - 2].low && visibleBars[i].low < visibleBars[i + 2].low;
      if (isLocalHigh) srLevels.push(visibleBars[i].high);
      if (isLocalLow) srLevels.push(visibleBars[i].low);
    }
    // Deduplicate close levels
    const dedupedSR = srLevels.filter((v, i, arr) => !arr.slice(0, i).some(u => Math.abs(u - v) / v < 0.005));

    // Volume stats
    const maxVol = Math.max(...visibleBars.map(b => b.volume));
    const avgVol = visibleBars.reduce((a, b) => a + b.volume, 0) / visibleBars.length;

    // RSI (14)
    const rsiPeriod = 14;
    const rsiValues: (number | null)[] = [];
    let avgGain = 0, avgLoss = 0;
    for (let i = 0; i < visibleBars.length; i++) {
      if (i === 0) { rsiValues.push(null); continue; }
      const change = visibleBars[i].close - visibleBars[i - 1].close;
      const gain = Math.max(0, change);
      const loss = Math.max(0, -change);
      if (i < rsiPeriod) {
        avgGain += gain / rsiPeriod;
        avgLoss += loss / rsiPeriod;
        rsiValues.push(null);
      } else if (i === rsiPeriod) {
        avgGain = (avgGain * (rsiPeriod - 1) + gain) / rsiPeriod;
        avgLoss = (avgLoss * (rsiPeriod - 1) + loss) / rsiPeriod;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiValues.push(100 - 100 / (1 + rs));
      } else {
        avgGain = (avgGain * (rsiPeriod - 1) + gain) / rsiPeriod;
        avgLoss = (avgLoss * (rsiPeriod - 1) + loss) / rsiPeriod;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiValues.push(100 - 100 / (1 + rs));
      }
    }

    // MACD (12, 26, 9)
    const ema = (data: number[], period: number): number[] => {
      const k = 2 / (period + 1);
      const result: number[] = [];
      let prev = data[0];
      for (let i = 0; i < data.length; i++) {
        const val = i === 0 ? data[0] : data[i] * k + prev * (1 - k);
        result.push(val);
        prev = val;
      }
      return result;
    };
    const closes = visibleBars.map(b => b.close);
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = ema(macdLine, 9);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);

    return { maxH, minL, vwap, bbUpper, bbLower, bbMid, ma20, ma50, priceLabels, srLevels: dedupedSR, maxVol, avgVol, rsiValues, macdLine, signalLine, histogram };
  }, [visibleBars]);

  if (!computed || priceH <= 0) return null;

  const { maxH, minL, vwap, bbUpper, bbLower, bbMid, ma20, ma50, priceLabels, srLevels, maxVol, avgVol, rsiValues, macdLine, signalLine, histogram } = computed;

  const range = maxH - minL;
  const toY = (price: number, h: number = priceH) =>
    range > 0 ? ((maxH - price) / range) * h : h / 2;

  // RSI Y mapping
  const rsiH = indicatorH;
  const toRsiY = (v: number) => ((100 - v) / 100) * (rsiH - 20) + 10;

  // MACD Y mapping
  const macdH = indicatorH;
  const macdMax = Math.max(...computed.histogram.map(Math.abs), 0.0001) * 1.4;
  const toMacdY = (v: number) => macdH / 2 - (v / macdMax) * (macdH / 2 - 8);

  // Polyline builder
  const polyline = (points: (number | null)[], yFn: (v: number) => number) =>
    points.map((v, i) => v !== null ? `${toX(i)},${yFn(v)}` : null).filter(Boolean).join(' ');

  // Hover bar
  const hoveredBar = hoverIdx !== null ? visibleBars[hoverIdx] : null;
  const hoveredRsi = hoverIdx !== null ? rsiValues[hoverIdx] : null;
  const hoveredMacd = hoverIdx !== null ? macdLine[hoverIdx] : null;

  // Mouse handlers
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - PADDING_LEFT;
    const idx = Math.floor(x / barSlotW);
    if (idx >= 0 && idx < visibleBars.length) setHoverIdx(idx);
    else setHoverIdx(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.max(0.5, Math.min(5, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = e.clientX;
    dragOffset.current = clampedOffset;
  };

  const handleMouseMoveGlobal = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current;
    const barsPerPx = visibleCount / drawW;
    const newOffset = Math.round(dragOffset.current - dx * barsPerPx);
    setOffset(Math.max(0, Math.min(maxOffset, newOffset)));
  };

  const handleMouseUp = () => { isDragging.current = false; };

  // Signal overlay lines
  const hasSignal = signal && signal.direction !== 'HOLD';
  const signalInRange = hasSignal && signal!.entry >= minL && signal!.entry <= maxH;

  const formatPrice = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p >= 10 ? p.toFixed(2) : p.toFixed(4);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col select-none" style={{ cursor: isDragging.current ? 'grabbing' : 'crosshair' }}>
      <svg
        width="100%"
        height={totalH}
        onMouseMove={(e) => { handleMouseMove(e); handleMouseMoveGlobal(e); }}
        onMouseLeave={() => { setHoverIdx(null); isDragging.current = false; }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ display: 'block' }}
      >
        {/* ── PRICE CHART PANEL ── */}
        <g>
          {/* Panel background */}
          <rect x={0} y={0} width={W} height={priceH} fill="transparent" />

          {/* Grid lines */}
          {priceLabels.map((p, i) => (
            <line key={i} x1={PADDING_LEFT} y1={toY(p)} x2={W - PADDING_RIGHT} y2={toY(p)}
              stroke="#1e2d42" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.8" />
          ))}

          {/* Support/Resistance levels */}
          {srLevels.slice(0, 6).map((level, i) => (
            <g key={i}>
              <line x1={PADDING_LEFT} y1={toY(level)} x2={W - PADDING_RIGHT} y2={toY(level)}
                stroke="#334155" strokeWidth="0.8" strokeDasharray="6,4" opacity="0.6" />
            </g>
          ))}

          {/* Signal R/R overlay */}
          {signalInRange && signal && (
            <>
              {/* Risk zone (red) */}
              {signal.direction === 'BUY' && (
                <rect
                  x={PADDING_LEFT} y={toY(signal.entry)}
                  width={W - PADDING_LEFT - PADDING_RIGHT}
                  height={toY(signal.stopLoss) - toY(signal.entry)}
                  fill="rgba(239,68,68,0.07)" />
              )}
              {signal.direction === 'SELL' && (
                <rect
                  x={PADDING_LEFT} y={toY(signal.stopLoss)}
                  width={W - PADDING_LEFT - PADDING_RIGHT}
                  height={toY(signal.entry) - toY(signal.stopLoss)}
                  fill="rgba(239,68,68,0.07)" />
              )}
              {/* Reward zone (green) */}
              {signal.direction === 'BUY' && (
                <rect
                  x={PADDING_LEFT} y={toY(signal.target)}
                  width={W - PADDING_LEFT - PADDING_RIGHT}
                  height={toY(signal.entry) - toY(signal.target)}
                  fill="rgba(34,197,94,0.07)" />
              )}
              {signal.direction === 'SELL' && (
                <rect
                  x={PADDING_LEFT} y={toY(signal.entry)}
                  width={W - PADDING_LEFT - PADDING_RIGHT}
                  height={toY(signal.target) - toY(signal.entry)}
                  fill="rgba(34,197,94,0.07)" />
              )}
              {/* Entry line */}
              <line x1={PADDING_LEFT} y1={toY(signal.entry)} x2={W - PADDING_RIGHT} y2={toY(signal.entry)}
                stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="6,3" />
              <rect x={W - PADDING_RIGHT} y={toY(signal.entry) - 9} width={PADDING_RIGHT - 2} height={18} fill="#1e40af" rx="3" />
              <text x={W - PADDING_RIGHT + 4} y={toY(signal.entry) + 4} fontSize="9" fill="#93c5fd" fontFamily="monospace" fontWeight="600">ENTRY</text>
              {/* Stop loss line */}
              <line x1={PADDING_LEFT} y1={toY(signal.stopLoss)} x2={W - PADDING_RIGHT} y2={toY(signal.stopLoss)}
                stroke="#FF4D4D" strokeWidth="1.5" strokeDasharray="4,3" />
              <rect x={W - PADDING_RIGHT} y={toY(signal.stopLoss) - 9} width={PADDING_RIGHT - 2} height={18} fill="#7f1d1d" rx="3" />
              <text x={W - PADDING_RIGHT + 4} y={toY(signal.stopLoss) + 4} fontSize="9" fill="#fca5a5" fontFamily="monospace" fontWeight="600">SL</text>
              {/* Target line */}
              <line x1={PADDING_LEFT} y1={toY(signal.target)} x2={W - PADDING_RIGHT} y2={toY(signal.target)}
                stroke="#00D084" strokeWidth="1.5" strokeDasharray="4,3" />
              <rect x={W - PADDING_RIGHT} y={toY(signal.target) - 9} width={PADDING_RIGHT - 2} height={18} fill="#064e3b" rx="3" />
              <text x={W - PADDING_RIGHT + 4} y={toY(signal.target) + 4} fontSize="9" fill="#6ee7b7" fontFamily="monospace" fontWeight="600">TP</text>
              {/* R/R badge */}
              <rect x={PADDING_LEFT + 8} y={toY(signal.entry) - 22} width={72} height={18} fill="#1e40af" rx="4" opacity="0.9" />
              <text x={PADDING_LEFT + 14} y={toY(signal.entry) - 9} fontSize="10" fill="#93c5fd" fontFamily="monospace" fontWeight="700">
                R/R {signal.riskReward.toFixed(1)}:1
              </text>
            </>
          )}

          {/* Bollinger Bands */}
          {showBB && (
            <>
              <polyline points={polyline(bbUpper, v => toY(v))} fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
              <polyline points={polyline(bbLower, v => toY(v))} fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
              <polyline points={polyline(bbMid, v => toY(v))} fill="none" stroke="#a78bfa" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.35" />
            </>
          )}

          {/* MA lines */}
          {showMA && (
            <>
              <polyline points={polyline(ma20, v => toY(v))} fill="none" stroke="#F59E0B" strokeWidth="1.2" opacity="0.8" />
              <polyline points={polyline(ma50, v => toY(v))} fill="none" stroke="#f472b6" strokeWidth="1.2" opacity="0.8" />
            </>
          )}

          {/* VWAP */}
          {showVWAP && (
            <polyline points={polyline(vwap, v => toY(v))} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.85" />
          )}

          {/* Line chart */}
          {chartType === 'line' && (
            <>
              {/* Area fill */}
              <defs>
                <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D084" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#00D084" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <polygon
                points={[
                  `${PADDING_LEFT},${priceH}`,
                  ...visibleBars.map((b, i) => `${toX(i)},${toY(b.close)}`),
                  `${toX(visibleBars.length - 1)},${priceH}`,
                ].join(' ')}
                fill="url(#lineAreaGrad)"
              />
              <polyline
                points={visibleBars.map((b, i) => `${toX(i)},${toY(b.close)}`).join(' ')}
                fill="none" stroke="#00D084" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
              />
              {/* Hover dot */}
              {hoverIdx !== null && visibleBars[hoverIdx] && (
                <circle cx={toX(hoverIdx)} cy={toY(visibleBars[hoverIdx].close)} r={4} fill="#00D084" stroke="#080a0e" strokeWidth="2" />
              )}
              {/* Invisible hover targets */}
              {visibleBars.map((_, i) => (
                <rect key={i} x={toX(i) - barSlotW / 2} y={0} width={barSlotW} height={priceH}
                  fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
              ))}
            </>
          )}

          {/* Bars chart */}
          {chartType === 'bars' && visibleBars.map((bar, i) => {
            const cx = toX(i);
            const isBull = bar.bullish;
            const color = isBull ? '#00D084' : '#FF4D4D';
            const isHov = hoverIdx === i;
            return (
              <g key={i} onMouseEnter={() => setHoverIdx(i)}>
                {isHov && <rect x={cx - barSlotW / 2} y={0} width={barSlotW} height={priceH} fill="rgba(255,255,255,0.02)" />}
                {/* Vertical line high-low */}
                <line x1={cx} y1={toY(bar.high)} x2={cx} y2={toY(bar.low)} stroke={color} strokeWidth="1.5" opacity={isHov ? 1 : 0.8} />
                {/* Open tick left */}
                <line x1={cx - candleW} y1={toY(bar.open)} x2={cx} y2={toY(bar.open)} stroke={color} strokeWidth="1.5" opacity={isHov ? 1 : 0.8} />
                {/* Close tick right */}
                <line x1={cx} y1={toY(bar.close)} x2={cx + candleW} y2={toY(bar.close)} stroke={color} strokeWidth="1.5" opacity={isHov ? 1 : 0.8} />
              </g>
            );
          })}

          {/* Candles / Heikin Ashi */}
          {(chartType === 'candles' || chartType === 'heikin_ashi') && visibleBars.map((bar, i) => {
            const cx = toX(i);
            const isBull = bar.bullish;
            const bodyTop = toY(Math.max(bar.open, bar.close));
            const bodyBot = toY(Math.min(bar.open, bar.close));
            const bodyH = Math.max(1.5, bodyBot - bodyTop);
            const isHov = hoverIdx === i;
            const bullColor = '#00D084';
            const bearColor = '#FF4D4D';
            const color = isBull ? bullColor : bearColor;

            return (
              <g key={i} onMouseEnter={() => setHoverIdx(i)}>
                {isHov && <rect x={cx - barSlotW / 2} y={0} width={barSlotW} height={priceH} fill="rgba(255,255,255,0.02)" />}
                <line x1={cx} y1={toY(bar.high)} x2={cx} y2={toY(bar.low)} stroke={color} strokeWidth="1" opacity={isHov ? 1 : 0.8} />
                <rect x={cx - candleW / 2} y={bodyTop} width={candleW} height={bodyH}
                  fill={color} stroke={color} strokeWidth="0.5"
                  opacity={isHov ? 1 : 0.88} rx="0.5" />
              </g>
            );
          })}

          {/* ── Live price line ── */}
          {livePrice !== undefined && livePrice > 0 && livePrice >= minL && livePrice <= maxH && (
            <>
              {/* Dashed horizontal live price line */}
              <line
                x1={PADDING_LEFT} y1={toY(livePrice)}
                x2={W - PADDING_RIGHT} y2={toY(livePrice)}
                stroke="#F59E0B" strokeWidth="1" strokeDasharray="4,3" opacity="0.85"
              />
              {/* Live bar progress fill on the right edge */}
              {liveBarVisibleIdx >= 0 && (
                <rect
                  x={toX(liveBarVisibleIdx) - barSlotW / 2}
                  y={0} width={barSlotW * barProgress} height={2}
                  fill="#F59E0B" opacity="0.7" rx="1"
                />
              )}
              {/* Live price label */}
              <rect
                x={W - PADDING_RIGHT}
                y={toY(livePrice) - 9}
                width={PADDING_RIGHT - 2} height={18}
                fill={blink ? '#F59E0B' : '#D97706'} rx="3"
              />
              <text
                x={W - PADDING_RIGHT + 3}
                y={toY(livePrice) + 4}
                fontSize="9" fill="white" fontFamily="monospace" fontWeight="700"
              >
                {formatPrice(livePrice)}
              </text>
              {/* Blinking dot on the live bar */}
              {liveBarVisibleIdx >= 0 && (
                <circle
                  cx={toX(liveBarVisibleIdx)}
                  cy={toY(livePrice)}
                  r={blink ? 3.5 : 2.5}
                  fill="#F59E0B"
                  opacity={blink ? 1 : 0.6}
                />
              )}
            </>
          )}

          {/* Crosshair */}
          {hoverIdx !== null && (
            <>
              <line x1={toX(hoverIdx)} y1={0} x2={toX(hoverIdx)} y2={priceH} stroke="#334155" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.8" />
              <line x1={PADDING_LEFT} y1={hoveredBar ? toY(hoveredBar.close) : 0} x2={W - PADDING_RIGHT} y2={hoveredBar ? toY(hoveredBar.close) : 0}
                stroke="#334155" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.8" />
              {hoveredBar && (
                <>
                  <rect x={W - PADDING_RIGHT} y={toY(hoveredBar.close) - 9} width={PADDING_RIGHT - 2} height={18} fill="#162030" rx="3" />
                  <text x={W - PADDING_RIGHT + 4} y={toY(hoveredBar.close) + 4} fontSize="9" fill="#94a3b8" fontFamily="monospace">
                    {formatPrice(hoveredBar.close)}
                  </text>
                </>
              )}
            </>
          )}

          {/* Price axis labels */}
          {priceLabels.map((p, i) => (
            <text key={i} x={W - PADDING_RIGHT + 6} y={toY(p) + 4} fontSize="10" fill="#475569" fontFamily="monospace">
              {formatPrice(p)}
            </text>
          ))}

          {/* Overlay legend */}
          <g transform={`translate(${PADDING_LEFT + 8}, 14)`}>
            {showVWAP && (
              <g>
                <line x1="0" y1="5" x2="14" y2="5" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="18" y="9" fontSize="10" fill="#38bdf8" fontFamily="monospace">VWAP</text>
              </g>
            )}
            {showBB && (
              <g transform="translate(60,0)">
                <line x1="0" y1="5" x2="14" y2="5" stroke="#a78bfa" strokeWidth="1.5" />
                <text x="18" y="9" fontSize="10" fill="#a78bfa" fontFamily="monospace">BB(20)</text>
              </g>
            )}
            {showMA && (
              <>
                <g transform="translate(120,0)">
                  <line x1="0" y1="5" x2="14" y2="5" stroke="#F59E0B" strokeWidth="1.5" />
                  <text x="18" y="9" fontSize="10" fill="#F59E0B" fontFamily="monospace">MA20</text>
                </g>
                <g transform="translate(180,0)">
                  <line x1="0" y1="5" x2="14" y2="5" stroke="#f472b6" strokeWidth="1.5" />
                  <text x="18" y="9" fontSize="10" fill="#f472b6" fontFamily="monospace">MA50</text>
                </g>
              </>
            )}
          </g>
        </g>

        {/* ── VOLUME PANEL ── */}
        {showVolume && (
          <g transform={`translate(0, ${priceH})`}>
            <rect x={0} y={0} width={W} height={volH} fill="rgba(13,20,32,0.8)" />
            <line x1={PADDING_LEFT} y1={0} x2={W - PADDING_RIGHT} y2={0} stroke="#1e2d42" strokeWidth="1" />
            <text x={PADDING_LEFT + 4} y={12} fontSize="9" fill="#334155" fontFamily="monospace" fontWeight="600">VOLUME</text>
            {/* Avg volume line */}
            {(() => {
              const avgY = volH - (avgVol / maxVol) * (volH - 16) - 4;
              return <line x1={PADDING_LEFT} y1={avgY} x2={W - PADDING_RIGHT} y2={avgY} stroke="#334155" strokeWidth="0.8" strokeDasharray="4,3" opacity="0.8" />;
            })()}
            {visibleBars.map((bar, i) => {
              const cx = toX(i);
              const bh = Math.max(2, (bar.volume / maxVol) * (volH - 16));
              const isAboveAvg = bar.volume > avgVol;
              return (
                <rect key={i} x={cx - candleW / 2} y={volH - bh} width={candleW} height={bh}
                  fill={bar.bullish ? (isAboveAvg ? 'rgba(0,208,132,0.5)' : 'rgba(0,208,132,0.22)') : (isAboveAvg ? 'rgba(255,77,77,0.5)' : 'rgba(255,77,77,0.22)')}
                  rx="0.5" />
              );
            })}
            {hoverIdx !== null && (
              <line x1={toX(hoverIdx)} y1={0} x2={toX(hoverIdx)} y2={volH} stroke="#334155" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5" />
            )}
          </g>
        )}

        {/* ── RSI PANEL ── */}
        {showRSI && (
          <g transform={`translate(0, ${priceH + volH})`}>
            <rect x={0} y={0} width={W} height={rsiH} fill="rgba(13,20,32,0.8)" />
            <line x1={PADDING_LEFT} y1={0} x2={W - PADDING_RIGHT} y2={0} stroke="#1e2d42" strokeWidth="1" />
            <text x={PADDING_LEFT + 4} y={12} fontSize="9" fill="#334155" fontFamily="monospace" fontWeight="600">RSI(14)</text>
            {/* Zone bands */}
            <rect x={PADDING_LEFT} y={toRsiY(70)} width={W - PADDING_LEFT - PADDING_RIGHT} height={toRsiY(30) - toRsiY(70)} fill="rgba(167,139,250,0.04)" />
            {/* 40-65 preferred BUY zone */}
            <rect x={PADDING_LEFT} y={toRsiY(65)} width={W - PADDING_LEFT - PADDING_RIGHT} height={toRsiY(40) - toRsiY(65)} fill="rgba(0,208,132,0.05)" />
            {RSI_LABELS.map(level => (
              <g key={level}>
                <line x1={PADDING_LEFT} y1={toRsiY(level)} x2={W - PADDING_RIGHT} y2={toRsiY(level)}
                  stroke={level === 70 ? 'rgba(255,77,77,0.3)' : level === 30 ? 'rgba(0,208,132,0.3)' : 'rgba(51,65,85,0.6)'}
                  strokeWidth="0.8" strokeDasharray="3,3" />
                <text x={W - PADDING_RIGHT + 4} y={toRsiY(level) + 4} fontSize="9" fill="#334155" fontFamily="monospace">{level}</text>
              </g>
            ))}
            <polyline points={polyline(rsiValues, v => toRsiY(v))} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            {hoverIdx !== null && hoveredRsi !== null && typeof hoveredRsi === 'number' && (
              <>
                <line x1={toX(hoverIdx)} y1={0} x2={toX(hoverIdx)} y2={rsiH} stroke="#334155" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5" />
                <circle cx={toX(hoverIdx)} cy={toRsiY(hoveredRsi)} r={3} fill="#a78bfa" />
                <rect x={W - PADDING_RIGHT} y={toRsiY(hoveredRsi) - 9} width={PADDING_RIGHT - 2} height={18} fill="#4c1d95" rx="3" />
                <text x={W - PADDING_RIGHT + 4} y={toRsiY(hoveredRsi) + 4} fontSize="9" fill="#c4b5fd" fontFamily="monospace">{(hoveredRsi as number).toFixed(1)}</text>
              </>
            )}
          </g>
        )}

        {/* ── MACD PANEL ── */}
        {showMACD && (
          <g transform={`translate(0, ${priceH + volH + (showRSI ? indicatorH : 0)})`}>
            <rect x={0} y={0} width={W} height={macdH} fill="rgba(13,20,32,0.8)" />
            <line x1={PADDING_LEFT} y1={0} x2={W - PADDING_RIGHT} y2={0} stroke="#1e2d42" strokeWidth="1" />
            <text x={PADDING_LEFT + 4} y={12} fontSize="9" fill="#334155" fontFamily="monospace" fontWeight="600">MACD(12,26,9)</text>
            {/* Zero line */}
            <line x1={PADDING_LEFT} y1={macdH / 2} x2={W - PADDING_RIGHT} y2={macdH / 2} stroke="#1e2d42" strokeWidth="0.8" />
            {/* Histogram */}
            {computed.histogram.map((v, i) => {
              const cx = toX(i);
              const y0 = toMacdY(0);
              const y1 = toMacdY(v);
              const isBull = v >= 0;
              return (
                <rect key={i} x={cx - candleW / 2} y={Math.min(y0, y1)} width={candleW} height={Math.abs(y0 - y1)}
                  fill={isBull ? 'rgba(0,208,132,0.45)' : 'rgba(255,77,77,0.45)'} rx="0.5" />
              );
            })}
            {/* MACD line */}
            <polyline points={polyline(computed.macdLine, v => toMacdY(v))} fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            {/* Signal line */}
            <polyline points={polyline(computed.signalLine, v => toMacdY(v))} fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4,2" />
            {hoverIdx !== null && hoveredMacd !== null && typeof hoveredMacd === 'number' && (
              <>
                <line x1={toX(hoverIdx)} y1={0} x2={toX(hoverIdx)} y2={macdH} stroke="#334155" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5" />
                <circle cx={toX(hoverIdx)} cy={toMacdY(hoveredMacd)} r={3} fill="#60a5fa" />
              </>
            )}
            {/* MACD legend */}
            <g transform={`translate(${PADDING_LEFT + 60}, 8)`}>
              <line x1="0" y1="5" x2="12" y2="5" stroke="#60a5fa" strokeWidth="1.5" />
              <text x="16" y="9" fontSize="9" fill="#60a5fa" fontFamily="monospace">MACD</text>
              <line x1="52" y1="5" x2="64" y2="5" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3,2" />
              <text x="68" y="9" fontSize="9" fill="#F59E0B" fontFamily="monospace">Signal</text>
            </g>
          </g>
        )}
      </svg>

      {/* Hover tooltip */}
      {hoveredBar && hoverIdx !== null && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            top: 8,
            left: Math.min(toX(hoverIdx) + 12, W - 200),
            background: '#0d1420',
            border: '1px solid #1e2d42',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: 180,
          }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-xs text-slate-600">Open</span>
            <span className="text-xs font-mono font-semibold text-slate-300">{formatPrice(hoveredBar.open)}</span>
            <span className="text-xs text-slate-600">High</span>
            <span className="text-xs font-mono font-semibold" style={{ color: '#00D084' }}>{formatPrice(hoveredBar.high)}</span>
            <span className="text-xs text-slate-600">Low</span>
            <span className="text-xs font-mono font-semibold" style={{ color: '#FF4D4D' }}>{formatPrice(hoveredBar.low)}</span>
            <span className="text-xs text-slate-600">Close</span>
            <span className="text-xs font-mono font-semibold" style={{ color: hoveredBar.bullish ? '#00D084' : '#FF4D4D' }}>{formatPrice(hoveredBar.close)}</span>
            <span className="text-xs text-slate-600">Volume</span>
            <span className="text-xs font-mono font-semibold text-slate-400">{(hoveredBar.volume * 100).toFixed(1)}M</span>
            {hoveredRsi !== null && typeof hoveredRsi === 'number' && (
              <>
                <span className="text-xs text-slate-600">RSI</span>
                <span className="text-xs font-mono font-semibold" style={{ color: hoveredRsi > 70 ? '#FF4D4D' : hoveredRsi < 30 ? '#00D084' : '#a78bfa' }}>{hoveredRsi.toFixed(1)}</span>
              </>
            )}
            {hoveredMacd !== null && typeof hoveredMacd === 'number' && (
              <>
                <span className="text-xs text-slate-600">MACD</span>
                <span className="text-xs font-mono font-semibold" style={{ color: hoveredMacd >= 0 ? '#00D084' : '#FF4D4D' }}>{hoveredMacd.toFixed(4)}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
