import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import mosqueBg from '../../assets/welcome-mosque.jpg';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.fullName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await register(form.email, form.password, form.fullName);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fullscreen Background */}
      <div className="auth-bg">
        <img src={mosqueBg} alt="Al-Masjid an-Nabawi" />
        <div className="auth-bg-gradient" />
      </div>

      {/* Hero Brand */}
      <div className="auth-hero">
        <div className="auth-brand-row">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" />
          </svg>
          <span className="auth-brand-label">Peace Be Upon Him</span>
        </div>
        <h1 className="auth-hero-title">
          Islamic<br />Community
        </h1>
        <div className="auth-hero-dots">
          <span className="dot-inactive" />
          <span className="dot-active" />
          <span className="dot-inactive" />
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="auth-overlay">
        <div className="auth-sheet">
          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >
              Log In
            </button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => { setTab('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Full Name — only for signup */}
            {tab === 'signup' && (
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
                <input
                  className="auth-input"
                  id="auth-fullname"
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required={tab === 'signup'}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div className="auth-input-group">
              <span className="auth-input-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <input
                className="auth-input"
                id="auth-email"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <span className="auth-input-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <input
                className="auth-input"
                id="auth-password"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {/* Error message */}
            {error && <p className="auth-error">{error}</p>}

            {/* Primary button */}
            <button
              className="auth-btn-primary"
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Please wait…' : tab === 'login' ? 'Log In' : 'Create Account'}
            </button>

            {/* Secondary: skip */}
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={onClose}
            >
              Continue as guest
            </button>
          </form>

          {/* Footer */}
          <footer className="auth-footer">
            By continuing, you agree to Peace Be Upon Him's<br />
            <a href="/about">Privacy Policy</a> and <a href="/about">Terms of Use</a>
          </footer>

          {/* Home indicator bar */}
          <div className="auth-home-bar" />
        </div>
      </div>
    </>
  );
}
