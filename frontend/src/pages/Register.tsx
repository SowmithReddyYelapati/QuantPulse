import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle2,
  ArrowRight, AlertCircle, BarChart2, TrendingUp, Zap, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '../config/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let s = 0;
    if (formData.password.length > 6) s++;
    if (/[A-Z]/.test(formData.password)) s++;
    if (/[0-9]/.test(formData.password)) s++;
    if (/[^A-Za-z0-9]/.test(formData.password)) s++;
    setStrength(s);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email: formData.email, password: formData.password, name: formData.name
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['', '#ef4444', '#f59e0b', '#06b6d4', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const perks = [
    { icon: <TrendingUp size={16} />, text: 'AI-powered market predictions' },
    { icon: <Zap size={16} />, text: 'Real-time signals & watchlists' },
    { icon: <ShieldCheck size={16} />, text: 'Bank-grade security' },
    { icon: <CheckCircle2 size={16} />, text: 'No credit card required' },
  ];

  return (
    <div className="auth-page auth-page-register">
      {/* ─── Left Panel: Hero ─────────────── */}
      <div className="auth-hero-panel">
        <div className="auth-hero-glow auth-hero-glow-1" />
        <div className="auth-hero-glow auth-hero-glow-2" />
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="auth-hero-content"
        >
          <div className="auth-hero-logo">
            <div className="auth-logo-mark">
              <BarChart2 size={22} strokeWidth={2.5} />
            </div>
            <span className="auth-logo-text">QuantPulse</span>
            <span className="auth-hero-badge">Pro</span>
          </div>

          <h2 className="auth-hero-heading">
            Your edge in the<br />
            <span className="auth-hero-heading-accent">market starts here</span>
          </h2>
          <p className="auth-hero-sub">
            Join thousands of traders who leverage our institutional ML engine for alpha-generating insights.
          </p>

          <div className="auth-hero-perks">
            {perks.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="auth-hero-feature"
              >
                <span className="auth-hero-feature-icon" style={{ color: '#6366f1' }}>{p.icon}</span>
                <span className="auth-hero-feature-text">{p.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Decorative card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="auth-hero-card"
          >
            <div className="auth-hero-card-header">
              <span className="auth-hero-card-dot" />
              <span className="auth-hero-card-title">Live Prediction Engine</span>
            </div>
            <div className="auth-hero-card-bars">
              {[72, 45, 88, 60, 95].map((w, i) => (
                <motion.div
                  key={i}
                  className="auth-hero-bar-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                >
                  <div className="auth-hero-bar-bg">
                    <motion.div
                      className="auth-hero-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ opacity: 0.4 + i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="auth-hero-card-footer">
              <span>LSTM Ensemble</span>
              <span className="text-success-color">94.2% accuracy</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Right Panel: Form ─────────────── */}
      <div className="auth-form-panel">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="auth-form-inner"
        >
          <div className="auth-mobile-logo">
            <div className="auth-logo-mark"><BarChart2 size={20} strokeWidth={2.5} /></div>
            <span className="auth-logo-text">QuantPulse</span>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-success-state"
              >
                <div className="auth-success-icon-wrap">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="auth-heading">Account created!</h2>
                <p className="auth-subheading">Redirecting you to sign in…</p>
              </motion.div>
            ) : (
              <motion.div key="form">
                <div className="auth-heading-block">
                  <h1 className="auth-heading">Create your account</h1>
                  <p className="auth-subheading">Start your 14-day free trial — no card required</p>
                </div>

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

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><User size={16} /></span>
                      <input
                        type="text" name="name" required
                        className="auth-input"
                        placeholder="e.g. Jane Smith"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Email Address</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><Mail size={16} /></span>
                      <input
                        type="email" name="email" required
                        className="auth-input"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><Lock size={16} /></span>
                      <input
                        type={showPassword ? 'text' : 'password'} name="password" required
                        className="auth-input auth-input-padded"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-input-toggle">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="auth-strength">
                        <div className="auth-strength-bars">
                          {[1, 2, 3, 4].map(i => (
                            <div
                              key={i}
                              className="auth-strength-bar"
                              style={{ backgroundColor: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.08)' }}
                            />
                          ))}
                        </div>
                        <span className="auth-strength-label" style={{ color: strengthColors[strength] }}>
                          {strengthLabels[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Confirm Password</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><Lock size={16} /></span>
                      <input
                        type={showPassword ? 'text' : 'password'} name="confirmPassword" required
                        className={`auth-input ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'auth-input-error' : ''}`}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <span className="auth-field-error">Passwords do not match</span>
                    )}
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                      <span className="auth-spinner" />
                    ) : (
                      <>Create Account <ArrowRight size={17} /></>
                    )}
                  </button>
                </form>

                <p className="auth-switch-text">
                  Already have an account?{' '}
                  <Link to="/login" className="auth-switch-link">Sign in</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
