import { User, Shield, Bell, CreditCard, LogOut, ChevronRight, Activity, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('qp_settings') || '{}'); } catch { return {}; }
  })();

  const user = {
    name:          localStorage.getItem('user_name') || stored.name || 'Trader',
    email:         localStorage.getItem('user_email') || stored.email || '',
    plan:          stored.plan  || 'QuantPulse Pro',
    joined:        'April 2026',
    accuracy:      '84.2%',
    modelsTrained: 142,
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const sections = [
    { icon: <User size={18} />,       label: 'Personal Information', sub: 'Manage your name and contact details',              action: () => navigate('/settings?tab=account') },
    { icon: <Shield size={18} />,     label: 'Security & Privacy',   sub: 'Update password and 2FA settings',                  action: () => navigate('/settings?tab=security') },
    { icon: <Bell size={18} />,       label: 'Notifications',        sub: 'Configure trade alerts and push notifications',      action: () => navigate('/settings?tab=notifications') },
    { icon: <CreditCard size={18} />, label: 'Billing & Plans',      sub: 'Manage your QuantPulse Pro subscription',            action: () => navigate('/settings?tab=billing') },
  ];

  return (
    <div className="page-shell">
      {/* Page header */}
      <header className="page-header">
        <div>
          <h1 className="heading-2 text-gradient">User Profile</h1>
          <p className="text-secondary mt-1">Manage your account settings and AI preferences</p>
        </div>
        <button className="btn-danger-ghost" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </header>

      <div className="profile-grid">
        {/* ── Avatar Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
          className="card glass profile-avatar-card"
        >
          {/* top glow strip */}
          <div className="profile-card-glow" />

          <div className="profile-card-body">
            {/* Avatar circle */}
            <div className="profile-avatar">
              <span className="profile-avatar-letter">{user.name[0]}</span>
            </div>

            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>

            <span className="badge badge-primary profile-plan-badge">
              <Award size={11} /> {user.plan}
            </span>

            {/* Stats row */}
            <div className="profile-stats-grid">
              <div className="profile-stat">
                <span className="profile-stat-label"><TrendingUp size={10} className="text-success-color" /> Win Rate</span>
                <span className="profile-stat-value">{user.accuracy}</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-label"><Activity size={10} className="text-primary" /> Models Run</span>
                <span className="profile-stat-value">{user.modelsTrained}</span>
              </div>
            </div>

            <p className="profile-joined">Member since {user.joined}</p>
          </div>
        </motion.div>

        {/* ── Settings Links ── */}
        <div className="profile-links-col">
          <div className="section-title mb-4">
            <span className="section-icon"><Shield size={14} /></span>
            Account Settings
          </div>

          {sections.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, ease: [0.16,1,0.3,1] }}
              onClick={s.action}
              className="profile-link-card"
            >
              <div className="profile-link-left">
                <span className="profile-link-icon">{s.icon}</span>
                <div>
                  <div className="profile-link-title">{s.label}</div>
                  <div className="profile-link-sub">{s.sub}</div>
                </div>
              </div>
              <ChevronRight size={17} className="profile-link-arrow" />
            </motion.button>
          ))}

          {/* API callout */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="profile-api-callout"
          >
            <h4 className="profile-api-title">QuantPulse API Access</h4>
            <p className="profile-api-body">
              As a Pro user, you have programmatic access to our ML endpoints. Navigate to{' '}
              <strong>Settings → API Keys</strong> to view and cycle your access keys.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
