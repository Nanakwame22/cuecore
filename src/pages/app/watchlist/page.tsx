import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { watchlistAssets } from '@/mocks/appData';
import { useLivePrices } from '@/hooks/useLivePrices';
import { useRealSignals } from '@/hooks/useRealSignals';

// ── Helpers ───────────────────────────────────────────────────────────────────

const dirStyle = (d: string) => {
  if (d === 'BUY')  return { bg: 'rgba(0,208,132,0.12)',  color: '#00D084', border: 'rgba(0,208,132,0.25)' };
  if (d === 'SELL') return { bg: 'rgba(255,77,77,0.12)',   color: '#FF4D4D', border: 'rgba(255,77,77,0.25)' };
  return               { bg: 'rgba(107,114,128,0.12)',  color: '#9CA3AF', border: 'rgba(107,114,128,0.20)' };
};

const sectorBadge = (s: string) => {
  switch (s) {
    case 'Crypto':    return { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' };
    case 'Equity':    return { color: '#60A5FA', bg: 'rgba(96,165,250,0.10)' };
    case 'Forex':     return { color: '#A78BFA', bg: 'rgba(167,139,250,0.10)' };
    case 'Commodity': return { color: '#34D399', bg: 'rgba(52,211,153,0.10)' };
    default:          return { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' };
  }
};

const fmtPrice = (p: number, symbol: string) => {
  if (!p || p === 0) return '—';
  if ((symbol.includes('/') && !symbol.includes('USD/')) && p < 100) return p.toFixed(5);
  if (symbol === 'EUR/USD' || symbol === 'GBP/USD') return p.toFixed(5);
  if (p < 10) return p.toFixed(4);
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const fmtAmt = (amt: number, symbol: string) => {
  const sign = amt >= 0 ? '+' : '';
  if (Math.abs(amt) < 0.001) return `${sign}${amt.toFixed(6)}`;
  if (Math.abs(amt) < 1)     return `${sign}${amt.toFixed(4)}`;
  if (Math.abs(amt) < 1000)  return `${sign}${amt.toFixed(2)}`;
  return `${sign}${amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const timeAgo = (ms: number) => {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 5)  return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

const SECTORS = ['All', 'Crypto', 'Equity', 'Forex', 'Commodity', 'Index'];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ w = 'w-16' }: { w?: string }) => (
  <div className={`h-3.5 ${w} rounded animate-pulse ml-auto`} style={{ background: 'rgba(255,255,255,0.06)' }} />
);

// ── Flash hook — highlights price cell on change ───────────────────────────
const useFlash = (value: number | null | undefined) => {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (value == null || prev.current == null) { prev.current = value; return; }
    if (value > prev.current) setFlash('up');
    else if (value < prev.current) setFlash('down');
    prev.current = value;
    const t = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [value]);

  return flash;
};

// ── Row component (isolated so flash hook works per-row) ──────────────────────
const WatchlistRow = ({
  asset,
  livePrice,
  liveChange,
  liveAmt,
  liveLoading,
  liveError,
  lastUpdated,
  direction,
  confidence,
  expanded,
  onExpand,
}: {
  asset: typeof watchlistAssets[number];
  livePrice:   number | null;
  liveChange:  number | null;
  liveAmt:     number | null;
  liveLoading: boolean;
  liveError:   boolean;
  lastUpdated: number;
  direction:   'BUY' | 'SELL' | 'HOLD';
  confidence:  number;
  expanded:    boolean;
  onExpand:    () => void;
}) => {
  const flash = useFlash(livePrice);
  const ds    = dirStyle(direction);
  const sc    = sectorBadge(asset.sector);
  const up    = (liveChange ?? asset.change) >= 0;

  const displayPrice  = livePrice  ?? asset.price;
  const displayChange = liveChange ?? asset.change;
  const displayAmt    = liveAmt    ?? asset.changeAmt;

  return (
    <>
      <div
        className="grid grid-cols-12 px-5 py-4 cursor-pointer items-center transition-colors"
        style={{ background: expanded ? 'rgba(245,158,11,0.04)' : 'transparent' }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        onClick={onExpand}
      >
        {/* Asset name */}
        <div className="col-span-3 flex items-center gap-2.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: direction === 'BUY' ? '#00D084' : direction === 'SELL' ? '#FF4D4D' : '#9CA3AF' }}
          />
          <div>
            <div className="font-mono font-bold text-sm" style={{ color: '#E8EEF4' }}>{asset.symbol}</div>
            <div className="text-xs" style={{ color: '#5A7080' }}>{asset.name}</div>
          </div>
        </div>

        {/* Live price — flashes on update */}
        <div className="col-span-2 text-right">
          {liveLoading ? (
            <Skeleton />
          ) : (
            <div
              className="flex flex-col items-end transition-colors duration-500 rounded px-1"
              style={
                flash === 'up'   ? { background: 'rgba(0,208,132,0.15)' }
                : flash === 'down' ? { background: 'rgba(255,77,77,0.15)' }
                : {}
              }
            >
              <span className="font-mono text-sm font-semibold" style={{ color: flash === 'up' ? '#00D084' : flash === 'down' ? '#FF4D4D' : '#E8EEF4' }}>
                {fmtPrice(displayPrice, asset.symbol)}
              </span>
              {livePrice !== null && !liveError && (
                <span className="text-xs font-mono" style={{ color: '#00D084', fontSize: '10px' }}>● LIVE</span>
              )}
            </div>
          )}
        </div>

        {/* % change */}
        <div className="col-span-2 text-right">
          {liveLoading ? (
            <Skeleton w="w-12" />
          ) : (
            <div className="flex flex-col items-end">
              <span className="font-mono text-sm font-semibold" style={{ color: up ? '#00D084' : '#FF4D4D' }}>
                {up ? '+' : ''}{displayChange.toFixed(2)}%
              </span>
              <span className="font-mono text-xs" style={{ color: up ? 'rgba(0,208,132,0.6)' : 'rgba(255,77,77,0.6)', fontSize: '10px' }}>
                {fmtAmt(displayAmt, asset.symbol)}
              </span>
            </div>
          )}
        </div>

        {/* CUE direction — from real signal engine */}
        <div className="col-span-1 flex justify-center">
          <span
            className="text-xs px-2 py-0.5 rounded font-mono font-bold"
            style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
          >
            {direction}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="col-span-2 px-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${confidence}%`,
                  background: confidence >= 85 ? '#00D084' : confidence >= 70 ? '#F59E0B' : '#FF4D4D',
                }}
              />
            </div>
            <span className="text-xs font-mono w-8 text-right" style={{ color: '#F59E0B' }}>{confidence}%</span>
          </div>
        </div>

        {/* Sector */}
        <div className="col-span-1 text-right">
          <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: sc.bg, color: sc.color }}>
            {asset.sector}
          </span>
        </div>

        {/* Volume + expand chevron */}
        <div className="col-span-1 text-right flex items-center justify-end gap-2">
          <span className="text-xs font-mono" style={{ color: '#5A7080' }}>{asset.volume}</span>
          <i
            className={`ri-arrow-down-s-line text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}
            style={{ color: '#334155' }}
          />
        </div>
      </div>

      {/* ── Expanded detail row ── */}
      {expanded && (
        <div
          className="px-5 py-4 grid grid-cols-4 gap-4 border-t"
          style={{ background: 'rgba(8,10,14,0.6)', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <div>
            <div className="text-xs mb-1" style={{ color: '#334155' }}>Market Cap</div>
            <div className="text-sm font-mono font-semibold" style={{ color: '#E8EEF4' }}>{asset.mktCap}</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: '#334155' }}>24H Volume</div>
            <div className="text-sm font-mono font-semibold" style={{ color: '#E8EEF4' }}>{asset.volume}</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: '#334155' }}>Price Change</div>
            <div className="text-sm font-mono font-semibold" style={{ color: up ? '#00D084' : '#FF4D4D' }}>
              {fmtAmt(displayAmt, asset.symbol)}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: '#334155' }}>Last Updated</div>
            <div className="text-sm font-mono font-semibold" style={{ color: '#E8EEF4' }}>
              {lastUpdated > 0 ? timeAgo(lastUpdated) : '—'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const WatchlistPage = () => {
  const [sector,    setSector]    = useState('All');
  const [search,    setSearch]    = useState('');
  const [sortBy,    setSortBy]    = useState<'symbol' | 'change' | 'confidence'>('confidence');
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [now,       setNow]       = useState(Date.now());

  // Tick clock for "X ago" labels
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);
  void now; // used implicitly via timeAgo re-render

  const symbols = watchlistAssets.map(a => a.symbol);
  const { prices, refresh } = useLivePrices(symbols);

  // Real signals — override mock direction + confidence when available
  const { signals: realSignals, scanning, lastScanned } = useRealSignals();

  const getSignalFor = useCallback((symbol: string) => {
    return realSignals.find(s => s.asset === symbol) ?? null;
  }, [realSignals]);

  const filtered = watchlistAssets
    .filter(a =>
      (sector === 'All' || a.sector === sector) &&
      (search === '' ||
        a.symbol.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === 'symbol')  return a.symbol.localeCompare(b.symbol);
      if (sortBy === 'change') {
        const ca = prices[a.symbol]?.change ?? a.change;
        const cb = prices[b.symbol]?.change ?? b.change;
        return Math.abs(cb) - Math.abs(ca);
      }
      // confidence sort: prefer real signal confidence
      const confA = getSignalFor(a.symbol)?.confidence ?? a.confidence;
      const confB = getSignalFor(b.symbol)?.confidence ?? b.confidence;
      return confB - confA;
    });

  // Count how many have live prices loaded
  const liveCount = symbols.filter(s => prices[s] && !prices[s].loading && !prices[s].error).length;
  const totalCount = symbols.length;

  return (
    <AppLayout title="Watchlist" subtitle="Tracked instruments with live prices and real signal cues">
      <div className="p-6 space-y-4">

        {/* ── Controls ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#334155' }} />
            <input
              type="text"
              placeholder="Search symbol or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.08)', color: '#E8EEF4' }}
            />
          </div>

          {/* Sector filters */}
          <div className="flex gap-1 flex-wrap">
            {SECTORS.map(s => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className="text-xs px-3 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap font-medium"
                style={sector === s
                  ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#5A7080', border: '1px solid transparent' }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Scan status */}
            {scanning && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: '#F59E0B' }}>
                <i className="ri-loader-4-line animate-spin" /> Scanning…
              </span>
            )}
            {!scanning && lastScanned && (
              <span className="text-xs" style={{ color: '#334155' }}>
                Signals: {timeAgo(lastScanned)}
              </span>
            )}

            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg cursor-pointer transition-all"
              style={{ background: 'rgba(0,208,132,0.08)', border: '1px solid rgba(0,208,132,0.20)', color: '#00D084' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,208,132,0.14)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,208,132,0.08)')}
            >
              <i className="ri-refresh-line text-xs" />
              Refresh Prices
            </button>

            <span className="text-xs" style={{ color: '#334155' }}>Sort:</span>
            {(['confidence', 'change', 'symbol'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="text-xs px-3 py-2 rounded-lg cursor-pointer transition-all capitalize"
                style={sortBy === s
                  ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#5A7080', border: '1px solid transparent' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Header */}
          <div
            className="grid grid-cols-12 px-5 py-3 text-xs font-mono tracking-wider"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#334155' }}
          >
            <div className="col-span-3">ASSET</div>
            <div className="col-span-2 text-right">LIVE PRICE</div>
            <div className="col-span-2 text-right">24H CHANGE</div>
            <div className="col-span-1 text-center">CUE</div>
            <div className="col-span-2 text-center">CONFIDENCE</div>
            <div className="col-span-1 text-right">SECTOR</div>
            <div className="col-span-1 text-right">VOLUME</div>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map(asset => {
              const live    = prices[asset.symbol];
              const signal  = getSignalFor(asset.symbol);

              return (
                <WatchlistRow
                  key={asset.id}
                  asset={asset}
                  livePrice={live && !live.loading && !live.error ? live.price       : null}
                  liveChange={live && !live.loading && !live.error ? live.change      : null}
                  liveAmt={live && !live.loading && !live.error   ? live.changeAmt   : null}
                  liveLoading={live?.loading ?? true}
                  liveError={live?.error ?? false}
                  lastUpdated={live?.lastUpdated ?? 0}
                  direction={signal?.direction ?? asset.direction}
                  confidence={signal?.confidence ?? asset.confidence}
                  expanded={expanded === asset.id}
                  onExpand={() => setExpanded(prev => prev === asset.id ? null : asset.id)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#334155' }}>
            {filtered.length} instruments · {realSignals.length} live signals
          </span>
          <div className="flex items-center gap-4">
            {/* Live price progress */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(liveCount / totalCount) * 100}%`, background: '#00D084' }}
                />
              </div>
              <span className="text-xs font-mono" style={{ color: '#334155' }}>
                {liveCount}/{totalCount} live
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D084' }} />
              <span className="text-xs" style={{ color: '#334155' }}>Twelve Data · refreshes every 30s</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WatchlistPage;
