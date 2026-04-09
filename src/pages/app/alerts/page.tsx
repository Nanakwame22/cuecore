import { useState } from 'react';
import AppLayout from '@/pages/app/components/AppLayout';
import { alertsData } from '@/mocks/appData';
import { usePlan } from '@/hooks/usePlan';
import UpgradeModal from '@/components/feature/UpgradeModal';

type Alert = typeof alertsData[0];

const AlertsPage = () => {
  const [alerts, setAlerts] = useState(alertsData);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({ asset: '', type: 'confidence', condition: 'above', value: '' });
  const [confThreshold, setConfThreshold] = useState(80);
  const { isPremium } = usePlan();
  const [upgradeModal, setUpgradeModal] = useState(false);

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleCreate = () => {
    if (!newAlert.asset) return;
    const created: Alert = {
      id: `a${Date.now()}`,
      asset: newAlert.asset.toUpperCase(),
      type: newAlert.type,
      condition: newAlert.condition,
      value: newAlert.value ? parseFloat(newAlert.value) : null,
      active: true,
      triggered: false,
      lastTriggered: null,
    };
    setAlerts(prev => [created, ...prev]);
    setNewAlert({ asset: '', type: 'confidence', condition: 'above', value: '' });
    setShowCreate(false);
  };

  return (
    <AppLayout title="Alerts" subtitle="Configure cue and price notifications">
      <div className="p-6 max-w-4xl">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-cc-muted">{alerts.filter(a => a.active).length} active alerts</div>
            <div className="w-px h-4 bg-[#1a2030]" />
            <div className="text-sm text-cc-muted">{alerts.filter(a => a.triggered).length} triggered today</div>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 text-sm font-grotesk font-500 px-4 py-2 rounded-md cursor-pointer transition-colors whitespace-nowrap"
            style={{ background: '#F59E0B', color: '#0A0C10' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
          >
            <i className="ri-add-line" /> New Alert
          </button>
        </div>

        {/* Create alert panel */}
        {showCreate && (
          <div className="bg-[#0d1117] border border-cc-amber/30 rounded-xl p-6 mb-6">
            <div className="text-sm font-grotesk font-700 text-cc-text mb-5">Create New Alert</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">ASSET</label>
                <input type="text" placeholder="BTC/USD" value={newAlert.asset} onChange={e => setNewAlert(p => ({ ...p, asset: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-md font-inter" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
              </div>
              <div>
                <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">TYPE</label>
                <select value={newAlert.type} onChange={e => setNewAlert(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-md font-inter cursor-pointer" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }}>
                  <option value="confidence">Confidence</option>
                  <option value="direction">Direction</option>
                  <option value="price">Price</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">CONDITION</label>
                <select value={newAlert.condition} onChange={e => setNewAlert(p => ({ ...p, condition: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-md font-inter cursor-pointer" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }}>
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="BUY">BUY signal</option>
                  <option value="SELL">SELL signal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">VALUE</label>
                <input type="number" placeholder="e.g. 85" value={newAlert.value} onChange={e => setNewAlert(p => ({ ...p, value: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-md font-inter" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleCreate} className="flex items-center gap-2 text-sm font-grotesk font-500 px-5 py-2 rounded-md cursor-pointer transition-colors whitespace-nowrap"
                style={{ background: '#F59E0B', color: '#0A0C10' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
                onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}>
                <i className="ri-save-line" /> Save Alert
              </button>
              <button onClick={() => setShowCreate(false)} className="text-sm text-cc-muted hover:text-cc-text transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            </div>
          </div>
        )}

        {/* Confidence threshold slider */}
        <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-grotesk font-700 text-cc-text mb-0.5">Global Confidence Threshold</div>
              <div className="text-xs text-cc-muted">Only receive alerts for cues above this confidence level</div>
            </div>
            <span className="text-xl font-grotesk font-700 text-cc-amber number-font">{confThreshold}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={confThreshold}
            onChange={e => setConfThreshold(Number(e.target.value))}
            className="w-full cursor-pointer"
            style={{ accentColor: '#F59E0B' }}
          />
          <div className="flex justify-between text-xs text-cc-muted mt-1">
            <span>50%</span>
            <span>95%</span>
          </div>
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-5 flex items-center gap-4">
              {/* Toggle */}
              <button
                onClick={() => toggleAlert(alert.id)}
                className="w-10 h-6 rounded-full flex-shrink-0 relative cursor-pointer transition-all"
                style={{ background: alert.active ? 'rgba(245,158,11,0.30)' : 'rgba(255,255,255,0.08)' }}
              >
                <div className="absolute top-1 w-4 h-4 rounded-full transition-all" style={{ background: alert.active ? '#F59E0B' : '#4E5A6B', left: alert.active ? '22px' : '2px' }} />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-grotesk font-700 text-cc-text text-sm">{alert.asset}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#8A95A8' }}>{alert.type}</span>
                  {alert.triggered && (
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(0,208,132,0.12)', color: '#00D084', border: '1px solid rgba(0,208,132,0.25)' }}>TRIGGERED</span>
                  )}
                </div>
                <div className="text-xs text-cc-muted">
                  {alert.type === 'confidence' && `Confidence ${alert.condition} ${alert.value}%`}
                  {alert.type === 'direction' && `${alert.condition} signal detected`}
                  {alert.type === 'price' && `Price ${alert.condition} ${alert.value}`}
                  {alert.lastTriggered && <span className="ml-2 text-cc-amber">Last: {alert.lastTriggered}</span>}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${alert.active ? 'text-cc-green' : 'text-cc-muted'}`}>
                  {alert.active ? 'ACTIVE' : 'PAUSED'}
                </span>
                <button onClick={() => deleteAlert(alert.id)} className="w-7 h-7 flex items-center justify-center text-cc-muted hover:text-cc-red transition-colors cursor-pointer rounded">
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery channels */}
        <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-grotesk font-700 text-cc-text">Delivery Channels</div>
            {!isPremium && (
              <span
                className="text-xs px-2 py-0.5 rounded font-mono flex items-center gap-1 cursor-pointer"
                style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.20)' }}
                onClick={() => setUpgradeModal(true)}
              >
                <i className="ri-vip-crown-line" /> Desk plan required for Slack &amp; Webhook
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'ri-mail-line', label: 'Email', active: true, premium: false },
              { icon: 'ri-slack-line', label: 'Slack', active: true, premium: true },
              { icon: 'ri-webhook-line', label: 'Webhook', active: false, premium: true },
              { icon: 'ri-smartphone-line', label: 'SMS', active: false, premium: false },
            ].map(ch => {
              const locked = ch.premium && !isPremium;
              return (
                <div
                  key={ch.label}
                  className="flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{
                    background: locked ? 'rgba(255,255,255,0.02)' : ch.active ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                    border: locked ? '1px dashed rgba(245,158,11,0.15)' : ch.active ? '1px solid rgba(245,158,11,0.20)' : '1px solid rgba(255,255,255,0.06)',
                    cursor: locked ? 'pointer' : 'default',
                  }}
                  onClick={() => locked && setUpgradeModal(true)}
                >
                  <i className={`${ch.icon} text-base ${locked ? 'text-cc-muted' : ch.active ? 'text-cc-amber' : 'text-cc-muted'}`} />
                  <span className={`text-sm ${locked ? 'text-cc-muted' : ch.active ? 'text-cc-text' : 'text-cc-muted'}`}>{ch.label}</span>
                  {locked
                    ? <i className="ri-lock-2-line text-xs text-cc-amber/50 ml-auto" />
                    : ch.active && <i className="ri-check-line text-cc-green text-xs ml-auto" />
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UpgradeModal
        open={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        featureName="Slack & Webhook Delivery"
        requiredPlan="desk"
      />
    </AppLayout>
  );
};

export default AlertsPage;
