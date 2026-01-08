import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import '../../styles/auth.css';

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
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>B2B Platform</h1>
          <p>Accede a tu panel</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          © 2026 B2B Workforce System
        </div>
      </div>
    </div>
  );
}