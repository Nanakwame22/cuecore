import { useState } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { usePlan } from '@/hooks/usePlan';
import PremiumGate from '@/components/feature/PremiumGate';

const tabs = ['Profile', 'Preferences', 'API Access', 'Notifications', 'Billing'];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [saved, setSaved] = useState(false);
  const { isPremium, name: planName } = usePlan();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppLayout title="Settings" subtitle="Account and platform configuration">
      <div className="p-6 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-lg w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-sm px-4 py-2 rounded-md cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5"
              style={activeTab === tab ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' } : { color: '#8A95A8', border: '1px solid transparent' }}
            >
              {tab === 'API Access' && !isPremium && <i className="ri-lock-2-line text-xs" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Save toast */}
        {saved && (
          <div className="fixed top-6 right-6 flex items-center gap-2 px-4 py-3 rounded-lg z-50" style={{ background: 'rgba(0,208,132,0.15)', border: '1px solid rgba(0,208,132,0.30)' }}>
            <i className="ri-check-line text-cc-green" />
            <span className="text-sm text-cc-green">Settings saved</span>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className="space-y-6">
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
              <div className="text-sm font-grotesk font-700 text-cc-text mb-5">Personal Information</div>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-cc-amber/20 border-2 border-cc-amber/30 flex items-center justify-center">
                  <span className="text-xl font-grotesk font-700 text-cc-amber">JW</span>
                </div>
                <div>
                  <div className="text-sm font-grotesk font-700 text-cc-text">James Whitfield</div>
                  <div className="text-xs text-cc-muted">Desk Plan · Member since Jan 2026</div>
                  <button className="text-xs text-cc-amber hover:text-cc-amber-light transition-colors cursor-pointer mt-1">Change avatar</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'FIRST NAME', value: 'James', name: 'first_name' },
                  { label: 'LAST NAME', value: 'Whitfield', name: 'last_name' },
                  { label: 'EMAIL ADDRESS', value: 'james@whitfield.io', name: 'email' },
                  { label: 'FIRM / ORGANIZATION', value: 'Independent', name: 'firm' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">{f.label}</label>
                    <input type="text" defaultValue={f.value} className="w-full px-4 py-3 text-sm rounded-md font-inter"
                      style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
              <div className="text-sm font-grotesk font-700 text-cc-text mb-5">Change Password</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['CURRENT PASSWORD', 'NEW PASSWORD', 'CONFIRM PASSWORD'].map(l => (
                  <div key={l}>
                    <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">{l}</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 text-sm rounded-md font-inter"
                      style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 text-sm font-grotesk font-500 px-6 py-2.5 rounded-md cursor-pointer transition-colors whitespace-nowrap"
              style={{ background: '#F59E0B', color: '#0A0C10' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}>
              <i className="ri-save-line" /> Save Changes
            </button>
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="space-y-4">
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
              <div className="text-sm font-grotesk font-700 text-cc-text mb-5">Display Preferences</div>
              <div className="space-y-5">
                {[
                  { label: 'Default Timeframe', options: ['1H', '4H', '1D', '1W'], selected: '4H' },
                  { label: 'Default Asset Class', options: ['All', 'Crypto', 'Equity', 'Forex', 'Commodity'], selected: 'All' },
                  { label: 'Minimum Confidence', options: ['60%', '70%', '75%', '80%', '85%', '90%'], selected: '75%' },
                ].map(pref => (
                  <div key={pref.label} className="flex items-center justify-between">
                    <span className="text-sm text-cc-text-dim">{pref.label}</span>
                    <div className="flex gap-1">
                      {pref.options.map(opt => (
                        <button key={opt} className="text-xs px-2.5 py-1.5 rounded cursor-pointer transition-all whitespace-nowrap"
                          style={opt === pref.selected ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' } : { background: 'rgba(255,255,255,0.05)', color: '#4E5A6B', border: '1px solid transparent' }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
              <div className="text-sm font-grotesk font-700 text-cc-text mb-5">Dashboard Layout</div>
              <div className="space-y-4">
                {[
                  { label: 'Show Ticker Bar', enabled: true },
                  { label: 'Show Performance Stats', enabled: true },
                  { label: 'Compact Cue Cards', enabled: false },
                  { label: 'Auto-refresh Feed', enabled: true },
                ].map(pref => (
                  <ToggleRow key={pref.label} label={pref.label} defaultEnabled={pref.enabled} />
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 text-sm font-grotesk font-500 px-6 py-2.5 rounded-md cursor-pointer transition-colors whitespace-nowrap"
              style={{ background: '#F59E0B', color: '#0A0C10' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}>
              <i className="ri-save-line" /> Save Preferences
            </button>
          </div>
        )}

        {activeTab === 'API Access' && (
          <PremiumGate featureName="API Access & Keys" requiredPlan="desk" lockedHeight="200px">
            <div className="space-y-4">
              <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
                <div className="text-sm font-grotesk font-700 text-cc-text mb-2">API Keys</div>
                <p className="text-xs text-cc-muted mb-5">Use these keys to access the CueCore REST API and WebSocket feed.</p>
                <div className="space-y-4">
                  {[
                    { label: 'LIVE API KEY', value: 'cc_live_k8x2m9p4q7r1n3t6w0y5z', masked: true },
                    { label: 'WEBHOOK SECRET', value: 'whsec_a4b8c2d6e0f3g7h1i5j9k', masked: true },
                  ].map(key => (
                    <div key={key.label}>
                      <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">{key.label}</label>
                      <div className="flex items-center gap-2">
                        <input type="password" defaultValue={key.value} readOnly className="flex-1 px-4 py-3 text-sm rounded-md font-mono"
                          style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
                        <button className="px-3 py-3 rounded-md text-xs text-cc-amber cursor-pointer transition-colors whitespace-nowrap"
                          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
                          <i className="ri-file-copy-line" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">API ENDPOINTS</div>
                  <div className="space-y-2">
                    {[
                      { method: 'GET', path: '/v1/cues', desc: 'List active cues' },
                      { method: 'GET', path: '/v1/cues/:id', desc: 'Get cue detail' },
                      { method: 'GET', path: '/v1/watchlist', desc: 'Get watchlist' },
                      { method: 'WS', path: '/v1/stream', desc: 'Real-time cue stream' },
                    ].map(ep => (
                      <div key={ep.path} className="flex items-center gap-3 text-xs">
                        <span className="font-mono px-2 py-0.5 rounded" style={{ background: ep.method === 'WS' ? 'rgba(245,158,11,0.12)' : 'rgba(0,208,132,0.12)', color: ep.method === 'WS' ? '#F59E0B' : '#00D084' }}>{ep.method}</span>
                        <span className="font-mono text-cc-text">{ep.path}</span>
                        <span className="text-cc-muted">{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PremiumGate>
        )}

        {activeTab === 'Notifications' && (
          <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
            <div className="text-sm font-grotesk font-700 text-cc-text mb-5">Notification Settings</div>
            <div className="space-y-4">
              {[
                { label: 'New high-confidence cue (90%+)', enabled: true },
                { label: 'Alert triggered', enabled: true },
                { label: 'Cue outcome recorded (win/loss)', enabled: true },
                { label: 'Daily performance summary', enabled: false },
                { label: 'Weekly intelligence report', enabled: true },
                { label: 'Platform updates and announcements', enabled: false },
              ].map(n => (
                <ToggleRow key={n.label} label={n.label} defaultEnabled={n.enabled} />
              ))}
            </div>
            <button onClick={handleSave} className="mt-6 flex items-center gap-2 text-sm font-grotesk font-500 px-6 py-2.5 rounded-md cursor-pointer transition-colors whitespace-nowrap"
              style={{ background: '#F59E0B', color: '#0A0C10' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}>
              <i className="ri-save-line" /> Save Notifications
            </button>
          </div>
        )}

        {activeTab === 'Billing' && (
          <div className="space-y-4">
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-grotesk font-700 text-cc-text">Current Plan</div>
                <span className="text-xs px-3 py-1 rounded-full font-mono" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
                  {planName.toUpperCase()} PLAN
                </span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-grotesk font-700 text-white">
                  {planName === 'Analyst' ? '$149' : planName === 'Desk' ? '$499' : 'Custom'}
                </span>
                {planName !== 'Institutional' && <span className="text-cc-muted text-sm mb-1">/month</span>}
              </div>
              <p className="text-xs text-cc-muted mb-5">Next billing date: May 8, 2026</p>
              <div className="flex gap-3">
                {planName !== 'Institutional' && (
                  <a href="/pricing" className="text-sm px-4 py-2 rounded-md cursor-pointer transition-colors whitespace-nowrap"
                    style={{ background: 'transparent', border: '1px solid rgba(245,158,11,0.40)', color: '#F59E0B' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {planName === 'Analyst' ? 'Upgrade to Desk' : 'Upgrade to Institutional'}
                  </a>
                )}
                <button className="text-sm px-4 py-2 rounded-md cursor-pointer transition-colors text-cc-muted hover:text-cc-text whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  Cancel Plan
                </button>
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-6">
              <div className="text-sm font-grotesk font-700 text-cc-text mb-4">Billing History</div>
              <div className="space-y-3">
                {[
                  { date: 'Apr 8, 2026', amount: '$499.00', status: 'Paid' },
                  { date: 'Mar 8, 2026', amount: '$499.00', status: 'Paid' },
                  { date: 'Feb 8, 2026', amount: '$499.00', status: 'Paid' },
                  { date: 'Jan 8, 2026', amount: '$499.00', status: 'Paid' },
                ].map(inv => (
                  <div key={inv.date} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-sm text-cc-text-dim">{inv.date}</span>
                    <span className="text-sm font-mono text-cc-text">{inv.amount}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(0,208,132,0.12)', color: '#00D084', border: '1px solid rgba(0,208,132,0.25)' }}>{inv.status}</span>
                    <button className="text-xs text-cc-amber hover:text-cc-amber-light transition-colors cursor-pointer">Download</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const ToggleRow = ({ label, defaultEnabled }: { label: string; defaultEnabled: boolean }) => {
  const [enabled, setEnabled] = useState(defaultEnabled);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-cc-text-dim">{label}</span>
      <button onClick={() => setEnabled(!enabled)} className="w-10 h-6 rounded-full relative cursor-pointer transition-all flex-shrink-0"
        style={{ background: enabled ? 'rgba(245,158,11,0.30)' : 'rgba(255,255,255,0.08)' }}>
        <div className="absolute top-1 w-4 h-4 rounded-full transition-all" style={{ background: enabled ? '#F59E0B' : '#4E5A6B', left: enabled ? '22px' : '2px' }} />
      </button>
    </div>
  );
};

export default SettingsPage;
