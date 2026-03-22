import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';

const ALLOWED_EMAILS = ['virajshah20050@gmail.com', 'ishan@ivydevs.com'];

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setInfo('Account created! You can now log in.');
        setMode('login');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <Sparkles size={28} color="white" />
          </div>
          <h1 className="login-title">IVY DEVS</h1>
          <p className="login-subtitle">Operating System</p>
        </div>

        {/* Welcome card */}
        <div className="login-welcome">
          <p className="login-welcome-text">Welcome back</p>
          <div className="login-avatars">
            <div className="login-avatar login-avatar-viraj" title="Viraj Shah">VS</div>
            <div className="login-avatar login-avatar-ishan" title="Ishan">IS</div>
          </div>
          <p className="login-welcome-names">Ishan & Viraj</p>
          <p className="login-welcome-hint">Login to continue to your workspace</p>
        </div>

        {/* Form card */}
        <div className="login-card">
          <div className="login-tabs-row">
            <button
              className={`login-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              className={`login-tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
            >
              <UserPlus size={14} /> Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-field-label">
                <Mail size={13} /> Email
              </label>
              <input
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label className="login-field-label">
                <Lock size={13} /> Password
              </label>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <div className="login-error">{error}</div>}
            {info && <div className="login-info">{info}</div>}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="login-footer">Ivy Devs · Private Workspace · {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
