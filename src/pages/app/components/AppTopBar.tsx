import { useState } from 'react';
import { SignalNotification } from '@/hooks/useSignalAlerts';
import NotificationDrawer from '@/components/feature/NotificationDrawer';

interface AppTopBarProps {
  title: string;
  subtitle?: string;
  notifications: SignalNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const AppTopBar = ({
  title, subtitle, notifications, unreadCount,
  onMarkAllRead, onMarkRead, soundEnabled, onToggleSound,
}: AppTopBarProps) => {
  const [searchVal, setSearchVal] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-6 flex-shrink-0 relative z-30"
        style={{
          background: 'rgba(10,16,24,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Left: title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-grotesk font-700 tracking-tight" style={{ color: '#E8EEF4' }}>{title}</h1>
            {subtitle && (
              <p className="text-[11px] mt-0.5 font-inter" style={{ color: '#3D5060' }}>{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <i className="ri-search-line absolute left-3 text-sm pointer-events-none" style={{ color: '#3D5060' }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-44 pl-8 pr-3 py-1.5 text-xs rounded-lg font-inter outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#C8D8E4',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.30)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-5 hidden md:block" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Live indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{
              background: 'rgba(0,208,132,0.06)',
              border: '1px solid rgba(0,208,132,0.15)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#00D084' }} />
            <span className="text-[10px] font-mono tracking-widest" style={{ color: '#00D084' }}>LIVE</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute signal alerts' : 'Unmute signal alerts'}
            className="w-8 h-8 flex items-center justify-center transition-all cursor-pointer rounded-lg group relative"
            style={{
              color: soundEnabled ? '#F59E0B' : '#2A3A4A',
              background: soundEnabled ? 'rgba(245,158,11,0.08)' : 'transparent',
              border: soundEnabled ? '1px solid rgba(245,158,11,0.15)' : '1px solid transparent',
            }}
            onMouseEnter={e => {
              if (!soundEnabled) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.color = '#8FA3B3';
              }
            }}
            onMouseLeave={e => {
              if (!soundEnabled) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#2A3A4A';
              }
            }}
          >
            <i className={`text-sm ${soundEnabled ? 'ri-volume-up-line' : 'ri-volume-mute-line'}`} />
            <span
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[10px] font-mono px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: '#1A2535', color: '#8FA3B3', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {soundEnabled ? 'Sound on' : 'Sound off'}
            </span>
          </button>

          {/* Notification bell */}
          <button
            onClick={() => setDrawerOpen(v => !v)}
            className="w-8 h-8 flex items-center justify-center transition-all cursor-pointer relative rounded-lg"
            style={{
              color: drawerOpen ? '#F59E0B' : '#4A6070',
              background: drawerOpen ? 'rgba(245,158,11,0.08)' : 'transparent',
              border: drawerOpen ? '1px solid rgba(245,158,11,0.15)' : '1px solid transparent',
            }}
            onMouseEnter={e => {
              if (!drawerOpen) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.color = '#8FA3B3';
              }
            }}
            onMouseLeave={e => {
              if (!drawerOpen) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#4A6070';
              }
            }}
          >
            <i className="ri-notification-3-line text-sm" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-700 px-0.5"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#0A0C10',
                  boxShadow: '0 0 6px rgba(245,158,11,0.5)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.10))',
              border: '1px solid rgba(245,158,11,0.30)',
              boxShadow: '0 0 8px rgba(245,158,11,0.12)',
            }}
          >
            <span className="text-xs font-grotesk font-700 text-cc-amber">JW</span>
          </div>
        </div>
      </header>

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />
    </>
  );
};

export default AppTopBar;
