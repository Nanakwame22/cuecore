import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlan } from '@/hooks/usePlan';
import UpgradeModal from '@/components/feature/UpgradeModal';

const navItems = [
  { icon: 'ri-dashboard-3-line', label: 'Dashboard', path: '/app/dashboard' },
  { icon: 'ri-eye-line', label: 'Watchlist', path: '/app/watchlist' },
  { icon: 'ri-flashlight-line', label: 'Cue Engine', path: '/app/cue-engine' },
  { icon: 'ri-line-chart-line', label: 'Charts', path: '/app/charts' },
  { icon: 'ri-notification-3-line', label: 'Alerts', path: '/app/alerts' },
  { icon: 'ri-history-line', label: 'History', path: '/app/history' },
];

const bottomItems = [
  { icon: 'ri-settings-3-line', label: 'Settings', path: '/app/settings' },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const { isPremium, name: planName } = usePlan();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className="flex flex-col h-screen transition-all duration-300 flex-shrink-0 relative"
      style={{
        width: collapsed ? '64px' : '224px',
        background: 'linear-gradient(180deg, #0D1520 0%, #0A1018 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle ambient glow top */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div
        className="h-14 flex items-center px-4 flex-shrink-0 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <a href="/" className="flex items-center gap-2.5 cursor-pointer overflow-hidden">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 relative">
            <div
              className="w-5 h-5 rotate-45 relative"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                boxShadow: '0 0 12px rgba(245,158,11,0.5)',
              }}
            >
              <div className="absolute inset-1 bg-[#0A1018]" />
            </div>
          </div>
          {!collapsed && (
            <span className="font-grotesk font-700 text-white text-base tracking-tight whitespace-nowrap">
              Cue<span style={{ color: '#F59E0B' }}>Core</span>
            </span>
          )}
        </a>
        <button
          className="ml-auto w-6 h-6 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 rounded-md hover:bg-white/5"
          style={{ color: '#3D5060' }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`text-sm ${collapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'}`} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto relative z-10">
        {!collapsed && (
          <div className="px-4 mb-3">
            <span className="text-[10px] font-mono tracking-widest" style={{ color: '#2A3A4A' }}>NAVIGATION</span>
          </div>
        )}
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 cursor-pointer transition-all duration-150 group relative mb-0.5"
              style={{
                padding: collapsed ? '10px 0' : '9px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active
                  ? 'linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)'
                  : 'transparent',
                borderLeft: active ? '2px solid #F59E0B' : '2px solid transparent',
                color: active ? '#F0F2F6' : '#4A6070',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.color = '#C8D8E4';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#4A6070';
                }
              }}
            >
              <div
                className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                style={{ color: active ? '#F59E0B' : 'inherit' }}
              >
                <i className={`${item.icon} text-base`} />
              </div>
              {!collapsed && (
                <span className="text-sm font-inter whitespace-nowrap flex-1 text-left tracking-tight">{item.label}</span>
              )}
              {active && !collapsed && (
                <div className="w-1 h-1 rounded-full bg-cc-amber ml-auto" />
              )}
              {collapsed && (
                <div
                  className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs text-cc-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-inter"
                  style={{ background: '#1A2535', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
                >
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Upgrade CTA */}
        {!isPremium && !collapsed && (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => setUpgradeModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.05) 100%)',
                border: '1px solid rgba(245,158,11,0.18)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(245,158,11,0.16) 0%, rgba(245,158,11,0.08) 100%)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.30)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.05) 100%)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.18)';
              }}
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <i className="ri-vip-crown-line text-cc-amber text-xs" />
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-grotesk font-700 text-cc-amber whitespace-nowrap">Upgrade to Desk</div>
                <div className="text-[10px] whitespace-nowrap" style={{ color: '#4A6070' }}>Unlock all features</div>
              </div>
              <i className="ri-arrow-right-s-line text-cc-amber text-sm ml-auto" />
            </button>
          </div>
        )}

        {!isPremium && collapsed && (
          <button
            onClick={() => setUpgradeModal(true)}
            className="w-full flex items-center justify-center py-3 cursor-pointer group relative"
          >
            <i className="ri-vip-crown-line text-cc-amber text-base" />
            <div
              className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs text-cc-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
              style={{ background: '#1A2535', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Upgrade to Desk
            </div>
          </button>
        )}

        {/* Settings */}
        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 cursor-pointer transition-all duration-150 group relative"
              style={{
                padding: collapsed ? '10px 0' : '9px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(245,158,11,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #F59E0B' : '2px solid transparent',
                color: active ? '#F0F2F6' : '#4A6070',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.color = '#C8D8E4';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#4A6070';
                }
              }}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`${item.icon} text-base`} />
              </div>
              {!collapsed && (
                <span className="text-sm font-inter whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}

        {/* User card */}
        <div
          className="mx-3 my-3 rounded-xl flex items-center gap-2.5 overflow-hidden"
          style={{
            padding: collapsed ? '8px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.10))',
              border: '1px solid rgba(245,158,11,0.30)',
              boxShadow: '0 0 8px rgba(245,158,11,0.15)',
            }}
          >
            <span className="text-xs font-grotesk font-700 text-cc-amber">JW</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <div className="text-xs text-cc-text font-inter truncate font-500">James Whitfield</div>
              <div className="flex items-center gap-1 mt-0.5">
                {isPremium
                  ? <i className="ri-vip-crown-fill text-cc-amber" style={{ fontSize: '9px' }} />
                  : <i className="ri-circle-fill" style={{ fontSize: '6px', color: '#2A3A4A' }} />
                }
                <span className="truncate" style={{ color: isPremium ? '#F59E0B' : '#2A3A4A', fontSize: '10px', fontFamily: 'monospace' }}>
                  {planName} Plan
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        open={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        featureName="Desk Plan Features"
        requiredPlan="desk"
      />
    </aside>
  );
};

export default AppSidebar;
