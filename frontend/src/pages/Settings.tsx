import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, Key, RefreshCw, Zap, CheckCircle, User, CreditCard } from 'lucide-react';

const STORAGE_KEY = 'qp_settings';
const defaultPrefs = {
  emailAlerts: true, pushAlerts: false, signalAlerts: true,
  dataRefreshRate: '30s', riskTolerance: 'medium',
  apiKey: 'sk_live_quantpulse_*****************',
  twoFactor: false, sessionTimeout: '30m',
  plan: 'QuantPulse Pro', billingCycle: 'monthly',
  name: localStorage.getItem('user_name') || '',
  email: localStorage.getItem('user_email') || '',
};
function loadPrefs() {
  const base = { ...defaultPrefs };
  // always prefer live localStorage auth values over saved prefs
  base.name  = localStorage.getItem('user_name')  || base.name;
  base.email = localStorage.getItem('user_email') || base.email;
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? { ...base, ...JSON.parse(r), name: base.name, email: base.email } : base; }
  catch { return base; }
}
function savePrefs(p: typeof defaultPrefs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

/* ── Toggle ── */
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button" role="switch" aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`settings-toggle ${checked ? 'settings-toggle-on' : ''}`}
  >
    <span className={`settings-toggle-thumb ${checked ? 'settings-toggle-thumb-on' : ''}`} />
  </button>
);

const TABS = [
  { id: 'trading',       label: 'Trading',      icon: <Zap size={15} /> },
  { id: 'account',       label: 'Account',       icon: <User size={15} /> },
  { id: 'notifications', label: 'Alerts',        icon: <Bell size={15} /> },
  { id: 'security',      label: 'Security',      icon: <Shield size={15} /> },
  { id: 'billing',       label: 'Billing',       icon: <CreditCard size={15} /> },
  { id: 'api',           label: 'API Keys',      icon: <Key size={15} /> },
];

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'trading';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    const onStorage = () => setPrefs(loadPrefs());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = (key: keyof typeof prefs) => setPrefs((p: typeof defaultPrefs) => ({ ...p, [key]: !(p[key]) }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    savePrefs(prefs);
    // Keep auth keys in sync so Profile always shows the same values
    localStorage.setItem('user_name', prefs.name);
    localStorage.setItem('user_email', prefs.email);
    setTimeout(() => { setLoading(false); setSuccess(true); setTimeout(() => setSuccess(false), 3000); }, 600);
  };

  const tabContent: Record<string, React.ReactNode> = {
    trading: (
      <div className="space-y-6">
        <div className="settings-field">
          <label className="settings-label">Data Refresh Rate</label>
          <select className="settings-select" value={prefs.dataRefreshRate}
            onChange={e => setPrefs((p: typeof defaultPrefs) => ({ ...p, dataRefreshRate: e.target.value }))}>
            <option value="15s">Every 15 Seconds (High CPU)</option>
            <option value="30s">Every 30 Seconds (Recommended)</option>
            <option value="1m">Every 1 Minute</option>
            <option value="5m">Every 5 Minutes</option>
          </select>
        </div>
        <div className="settings-field">
          <label className="settings-label">AI Risk Tolerance</label>
          <select className="settings-select" value={prefs.riskTolerance}
            onChange={e => setPrefs((p: typeof defaultPrefs) => ({ ...p, riskTolerance: e.target.value }))}>
            <option value="low">Conservative (Low Risk)</option>
            <option value="medium">Balanced (Medium Risk)</option>
            <option value="high">Aggressive (High Risk)</option>
          </select>
          <p className="settings-hint">Adjusts confidence threshold for Buy/Sell signals.</p>
        </div>
      </div>
    ),

    account: (
      <div className="space-y-6">
        <div className="settings-field">
          <label className="settings-label">Full Name</label>
          <input className="settings-input" value={prefs.name}
            onChange={e => setPrefs((p: typeof defaultPrefs) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
        </div>
        <div className="settings-field">
          <label className="settings-label">Email Address</label>
          <input type="email" className="settings-input" value={prefs.email}
            onChange={e => setPrefs((p: typeof defaultPrefs) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
        </div>
        <p className="settings-hint">Changes are saved to local storage and reflected on your Profile page.</p>
      </div>
    ),

    notifications: (
      <div className="space-y-3">
        {([
          { label: 'Email Alerts',         sub: 'Receive predictions and signals via email',       key: 'emailAlerts'  },
          { label: 'Push Alerts',          sub: 'Browser push notifications on signal change',     key: 'pushAlerts'   },
          { label: 'Signal Change Alerts', sub: 'Notify when Buy / Sell / Hold signal flips',      key: 'signalAlerts' },
        ] as const).map(item => (
          <div key={item.key} className="settings-row">
            <div>
              <div className="settings-row-title">{item.label}</div>
              <div className="settings-row-sub">{item.sub}</div>
            </div>
            <Toggle checked={prefs[item.key] as boolean} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    ),

    security: (
      <div className="space-y-5">
        <div className="settings-row">
          <div>
            <div className="settings-row-title">Two-Factor Authentication</div>
            <div className="settings-row-sub">Require a TOTP code on every login</div>
          </div>
          <Toggle checked={prefs.twoFactor as boolean} onChange={() => toggle('twoFactor')} />
        </div>
        <div className="settings-field">
          <label className="settings-label">Session Timeout</label>
          <select className="settings-select" value={prefs.sessionTimeout}
            onChange={e => setPrefs((p: typeof defaultPrefs) => ({ ...p, sessionTimeout: e.target.value }))}>
            <option value="15m">15 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div className="settings-danger-zone">
          <div className="settings-danger-title">Danger Zone</div>
          <p className="settings-hint mb-4">Clears all cached data and resets settings to defaults.</p>
          <button type="button" className="btn-danger-outline"
            onClick={() => { localStorage.removeItem(STORAGE_KEY); setPrefs({ ...defaultPrefs }); }}>
            Reset All Settings
          </button>
        </div>
      </div>
    ),

    billing: (
      <div className="space-y-5">
        <div className="settings-plan-card">
          <div className="settings-plan-left">
            <div className="settings-plan-name">QuantPulse Pro</div>
            <div className="settings-plan-sub">Next billing: June 1, 2026</div>
          </div>
          <span className="badge badge-success">Active</span>
        </div>
        <div className="settings-field">
          <label className="settings-label">Billing Cycle</label>
          <select className="settings-select" value={prefs.billingCycle}
            onChange={e => setPrefs((p: typeof defaultPrefs) => ({ ...p, billingCycle: e.target.value }))}>
            <option value="monthly">Monthly — $29/mo</option>
            <option value="annual">Annual — $199/yr (save 43%)</option>
          </select>
        </div>
      </div>
    ),

    api: (
      <div className="space-y-5">
        <div className="settings-field">
          <label className="settings-label">ML Access Key</label>
          <div className="settings-api-row">
            <input type="password" value={prefs.apiKey} readOnly
              className="settings-input mono flex-1" />
            <button type="button" className="btn btn-ghost settings-api-cycle" title="Cycle key">
              <RefreshCw size={16} />
            </button>
          </div>
          <p className="settings-hint">Use this key to call the QuantPulse ML API programmatically.</p>
        </div>
      </div>
    ),
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <h1 className="heading-2 text-gradient">System Settings</h1>
          <p className="text-secondary mt-1">Configure your QuantPulse trading engine preferences</p>
        </div>
      </header>

      <form onSubmit={handleSave}>
        <div className="settings-layout">
          {/* Sidebar */}
          <nav className="settings-sidebar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`settings-tab-btn ${activeTab === tab.id ? 'settings-tab-active' : ''}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          {/* Panel */}
          <div className="card glass settings-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="section-header">
                  <div className="section-title">
                    <span className="section-icon">{TABS.find(t => t.id === activeTab)?.icon}</span>
                    {TABS.find(t => t.id === activeTab)?.label} Settings
                  </div>
                </div>
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <AnimatePresence>
            {success && (
              <motion.span
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="settings-saved"
              >
                <CheckCircle size={15} /> Saved successfully!
              </motion.span>
            )}
          </AnimatePresence>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '140px' }} disabled={loading}>
            {loading ? <span className="animate-spin" style={{display:'inline-block',width:'1rem',height:'1rem',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%'}} /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
