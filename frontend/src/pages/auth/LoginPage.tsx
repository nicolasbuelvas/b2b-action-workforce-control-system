import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import './auth.css';

export default function LoginPage() {
  const { login, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch {
      setError('Invalid credentials. Please check and try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          {}
          <div className="auth-logo-icon">B2B</div>
          <h1>Workforce Portal</h1>
          <p>Task Verification & Control System</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error-message">{error}</div>}

          <div className="auth-field">
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              placeholder="nicolas@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-auth-primary" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>© 2026 B2B System Core</p>
          <span className="auth-version">v1.0.4</span>
        </div>
      </div>
    </div>
  );
}