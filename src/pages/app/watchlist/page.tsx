import { useState } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { watchlistAssets } from '@/mocks/appData';
import { useLivePrices } from '@/hooks/useLivePrices';

const directionStyle = (d: string) => {
  if (d === 'BUY')  return { bg: 'rgba(0,208,132,0.12)', color: '#00D084', border: 'rgba(0,208,132,0.25)' };
  if (d === 'SELL') return { bg: 'rgba(255,77,77,0.12)',  color: '#FF4D4D', border: 'rgba(255,77,77,0.25)' };
  return { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', border: 'rgba(107,114,128,0.25)' };
};

const sectors = ['All', 'Crypto', 'Equity', 'Forex', 'Commodity', 'Index'];

const fmtPrice = (p: number, symbol: string) => {
  if (p === 0) return '—';
  if (symbol.includes('/') && p < 100) return p.toFixed(4);
  if (p < 10) return p.toFixed(3);
  return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const PriceSkeleton = () => (
  <div className="h-4 w-16 rounded animate-pulse ml-auto" style={{ background: 'rgba(255,255,255,0.07)' }} />
);

const WatchlistPage = () => {
  const [sector, setSector]   = useState('All');
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState<'symbol' | 'change' | 'confidence'>('confidence');

  const symbols = watchlistAssets.map(a => a.symbol);
  const { prices, refresh } = useLivePrices(symbols);

  const filtered = watchlistAssets
    .filter(a =>
      (sector === 'All' || a.sector === sector) &&
      (search === '' ||
        a.symbol.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === 'symbol')     return a.symbol.localeCompare(b.symbol);
      if (sortBy === 'change') {
        const ca = prices[a.symbol]?.change ?? a.change;
        const cb = prices[b.symbol]?.change ?? b.change;
        return Math.abs(cb) - Math.abs(ca);
      }
      return b.confidence - a.confidence;
    });

  return (
    <AppLayout title="Watchlist" subtitle="Tracked instruments with live prices">
      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted text-sm" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-md font-inter"
              style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.09)', color: '#E8EEF4' }}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {sectors.map(s => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className="text-xs px-3 py-2 rounded cursor-pointer transition-all whitespace-nowrap"
                style={sector === s
                  ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#5A7080', border: '1px solid transparent' }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* Live refresh button */}
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded cursor-pointer transition-all whitespace-nowrap"
              style={{ background: 'rgba(0,208,132,0.08)', border: '1px solid rgba(0,208,132,0.20)', color: '#00D084' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,208,132,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,208,132,0.08)')}
            >
              <i className="ri-refresh-line text-xs" />
              Refresh
            </button>
            <span className="text-xs text-cc-muted">Sort:</span>
            {(['confidence', 'change', 'symbol'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="text-xs px-3 py-2 rounded cursor-pointer transition-all capitalize whitespace-nowrap"
                style={sortBy === s
                  ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#5A7080', border: '1px solid transparent' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header */}
          <div
            className="grid grid-cols-12 px-5 py-3 text-xs font-mono text-cc-muted tracking-wider"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="col-span-3">ASSET</div>
            <div className="col-span-2 text-right">LIVE PRICE</div>
            <div className="col-span-2 text-right">24H CHANGE</div>
            <div className="col-span-1 text-center">CUE</div>
            <div className="col-span-2 text-center">CONFIDENCE</div>
            <div className="col-span-1 text-right">SECTOR</div>
            <div className="col-span-1 text-right">VOLUME</div>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {filtered.map(asset => {
              const ds    = directionStyle(asset.direction);
              const live  = prices[asset.symbol];
              const livePrice  = live && !live.loading && !live.error ? live.price  : null;
              const liveChange = live && !live.loading && !live.error ? live.change : null;

              return (
                <div
                  key={asset.id}
                  className="grid grid-cols-12 px-5 py-4 transition-colors cursor-pointer items-center"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="col-span-3">
                    <div className="font-grotesk font-700 text-cc-text text-sm">{asset.symbol}</div>
                    <div className="text-xs text-cc-muted">{asset.name}</div>
                  </div>

                  {/* Live price */}
                  <div className="col-span-2 text-right">
                    {live?.loading ? (
                      <PriceSkeleton />
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm text-cc-text">
                          {livePrice !== null ? fmtPrice(livePrice, asset.symbol) : fmtPrice(asset.price, asset.symbol)}
                        </span>
                        {livePrice !== null && (
                          <span className="text-xs font-mono" style={{ color: '#00D084', fontSize: '10px' }}>LIVE</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Live change */}
                  <div className="col-span-2 text-right">
                    {live?.loading ? (
                      <PriceSkeleton />
                    ) : (
                      <span className={`font-mono text-sm ${(liveChange ?? asset.change) >= 0 ? 'text-cc-green' : 'text-cc-red'}`}>
                        {(liveChange ?? asset.change) >= 0 ? '+' : ''}{(liveChange ?? asset.change).toFixed(2)}%
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>
                      {asset.direction}
                    </span>
                  </div>

                  <div className="col-span-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full bg-cc-amber" style={{ width: `${asset.confidence}%` }} />
                      </div>
                      <span className="text-xs font-mono text-cc-amber w-8 text-right">{asset.confidence}%</span>
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#8FA3B3' }}>
                      {asset.sector}
                    </span>
                  </div>

                  <div className="col-span-1 text-right text-xs font-mono text-cc-muted">{asset.volume}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-cc-muted">{filtered.length} instruments</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
            <span className="text-xs text-cc-muted">Live prices via Twelve Data · refreshes every 30s</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WatchlistPage;
