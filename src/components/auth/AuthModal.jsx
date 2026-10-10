import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import mosqueBg from '../../assets/welcome-mosque.jpg';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', age: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = (event) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') await login(form.name, form.age, form.password);
      else await register(form.name, form.age, form.password);
      onClose();
    } catch (reason) {
      setError(reason.message || 'Unable to continue. Please try again.');
    } finally { setLoading(false); }
  };

  return <>
    <div className="auth-bg"><img src={mosqueBg} alt="" /><div className="auth-bg-gradient" /></div>
    <div className="auth-hero"><div className="auth-brand-row"><span className="auth-brand-label">Peace Be Upon Him</span></div><h1 className="auth-hero-title">Islamic<br />Community</h1></div>
    <div className="auth-overlay">
      <div className="auth-sheet" role="dialog" aria-modal="true" aria-label="Account access">
        <p className="auth-sheet-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
        <p className="auth-sheet-sub">Use your name, age, and password to keep your profile and history.</p>
        <div className="auth-tabs" role="tablist">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')} role="tab" aria-selected={mode === 'login'}>Sign in</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')} role="tab" aria-selected={mode === 'register'}>Create account</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <input className="auth-input" type="text" name="name" placeholder="Your name" value={form.name} onChange={setField} autoComplete="name" autoFocus required />
          <input className="auth-input" type="number" name="age" placeholder="Your age" value={form.age} onChange={setField} min="5" max="120" required />
          <input className="auth-input" type="password" name="password" placeholder="Password (at least 4 characters)" value={form.password} onChange={setField} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="4" required />
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          <button type="button" className="auth-btn-secondary" onClick={onClose}>Continue as guest</button>
        </form>
        <footer className="auth-footer">Your password is stored as a one-way hash. We store only your profile and personal activity history.</footer>
      </div>
    </div>
  </>;
}
