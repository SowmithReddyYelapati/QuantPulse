import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff,
  ChevronRight, AlertCircle, TrendingUp, Zap, ShieldCheck, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_name', res.data.name);
      localStorage.setItem('user_email', email); // always store email
      if (rememberMe) localStorage.setItem('remember_me', 'true');
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <TrendingUp size={18} />, text: 'LSTM-Powered AI Predictions', color: '#6366f1' },
    { icon: <Zap size={18} />, text: 'Real-Time Market Intelligence', color: '#06b6d4' },
    { icon: <ShieldCheck size={18} />, text: 'Institutional-Grade Security', color: '#10b981' },
  ];

  const stats = [
    { value: '94.2%', label: 'Model Accuracy' },
    { value: '40+', label: 'Indicators' },
    { value: '< 2s', label: 'Prediction Time' },
  ];

  return (
    <div className="auth-page">
      {/* ─── Left Panel: Form ───────────────────────────── */}
      <div className="auth-form-panel">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="auth-form-inner"
        >
          {/* Logo (mobile) */}
          <div className="auth-mobile-logo">
            <div className="auth-logo-mark">
              <BarChart2 size={20} strokeWidth={2.5} />
            </div>
            <span className="auth-logo-text">QuantPulse</span>
          </div>

          {/* Heading */}
          <div className="auth-heading-block">
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">Sign in to your institutional dashboard</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="auth-error"
              >
                <AlertCircle size={16} className="auth-error-icon" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input
                  type="email"
                  required
                  className="auth-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                <a href="#" className="auth-link-small">Forgot password?</a>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="auth-input auth-input-padded"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-input-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="auth-checkbox-custom"></span>
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>Sign In <ChevronRight size={17} /></>
              )}
            </button>
          </form>

          <p className="auth-switch-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-link">Start for free</Link>
          </p>
        </motion.div>
      </div>

      {/* ─── Right Panel: Hero ──────────────────────────── */}
      <div className="auth-hero-panel">
        <div className="auth-hero-glow auth-hero-glow-1" />
        <div className="auth-hero-glow auth-hero-glow-2" />

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="auth-hero-content"
        >
          {/* Logo */}
          <div className="auth-hero-logo">
            <div className="auth-logo-mark">
              <BarChart2 size={22} strokeWidth={2.5} />
            </div>
            <span className="auth-logo-text">QuantPulse</span>
            <span className="auth-hero-badge">Institutional</span>
          </div>

          {/* Hero Heading */}
          <h2 className="auth-hero-heading">
            Trade with the<br />
            <span className="auth-hero-heading-accent">precision of AI</span>
          </h2>
          <p className="auth-hero-sub">
            Ensemble ML models, real-time signals, and SHAP explainability — built for the modern trader.
          </p>

          {/* Feature list */}
          <div className="auth-hero-features">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="auth-hero-feature"
              >
                <span className="auth-hero-feature-icon" style={{ color: f.color }}>
                  {f.icon}
                </span>
                <span className="auth-hero-feature-text">{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="auth-hero-stats">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="auth-hero-stat"
              >
                <span className="auth-hero-stat-value">{s.value}</span>
                <span className="auth-hero-stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
