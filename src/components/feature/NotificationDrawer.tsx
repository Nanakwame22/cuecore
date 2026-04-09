import { useEffect, useRef } from 'react';
import { SignalNotification } from '@/hooks/useSignalAlerts';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: SignalNotification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  unreadCount: number;
}

const dirColor = (d: string) => {
  if (d === 'BUY') return { color: '#00D084', bg: 'rgba(0,208,132,0.10)', border: 'rgba(0,208,132,0.22)' };
  if (d === 'SELL') return { color: '#FF4D4D', bg: 'rgba(255,77,77,0.10)', border: 'rgba(255,77,77,0.22)' };
  return { color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.22)' };
};

const fmtTime = (date: Date) => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const fmtEntry = (v: number | string) => {
  if (typeof v === 'string') return v;
  if (v < 10) return v.toFixed(3);
  if (v < 100) return v.toFixed(2);
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const NotificationDrawer = ({
  open, onClose, notifications, onMarkAllRead, onMarkRead, unreadCount,
}: NotificationDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: 'rgba(0,0,0,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-14 right-0 z-50 h-[calc(100vh-56px)] w-80 flex flex-col transition-transform duration-300"
        style={{
          background: '#0A0C10',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-grotesk font-700 text-cc-text">Signal Alerts</span>
            {unreadCount > 0 && (
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                style={{ background: '#F59E0B', color: '#0A0C10', fontWeight: 700 }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-cc-muted hover:text-cc-amber transition-colors cursor-pointer whitespace-nowrap"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-cc-muted hover:text-cc-text transition-colors cursor-pointer"
            >
              <i className="ri-close-line" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <i className="ri-notification-off-line text-cc-muted text-lg" />
              </div>
              <span className="text-xs text-cc-muted">No alerts yet</span>
              <span className="text-xs text-cc-muted/60 text-center px-6">New high-confidence signals will appear here in real time</span>
            </div>
          ) : (
            <div className="divide-y divide-[#1a2030]/40">
              {notifications.map(n => {
                const ds = dirColor(n.direction);
                return (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className="px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
                    style={{ background: n.read ? 'transparent' : 'rgba(245,158,11,0.025)' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cc-amber flex-shrink-0 mt-1" />
                        )}
                        <span className="font-grotesk font-700 text-cc-text text-sm">{n.asset}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-mono font-700"
                          style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                        >
                          {n.direction}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8' }}
                        >
                          {n.timeframe}
                        </span>
                      </div>
                      <span className="text-xs text-cc-muted flex-shrink-0">{fmtTime(n.timestamp)}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs mb-2 ml-3.5">
                      <span className="text-cc-muted">Entry <span className="text-cc-text font-mono">{fmtEntry(n.entry)}</span></span>
                      <span className="text-cc-muted">R/R <span className="text-cc-amber font-mono">{n.rr}:1</span></span>
                    </div>

                    <div className="flex items-center justify-between ml-3.5">
                      <div className="flex-1 h-1 rounded-full mr-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${n.confidence}%`, background: 'rgba(245,158,11,0.65)' }}
                        />
                      </div>
                      <span className="text-xs font-mono font-700 text-cc-amber">{n.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 text-xs text-cc-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
            <span>Monitoring {'>'}80% confidence signals live</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
