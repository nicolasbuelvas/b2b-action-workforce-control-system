import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import type { UserRole } from '../../types/roles';
import './auth.css';

const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  super_admin: '/super-admin/dashboard',
  sub_admin: '/sub-admin/dashboard',

  website_researcher: '/researcher/website/dashboard',
  linkedin_researcher: '/researcher/linkedin/dashboard',

  website_inquirer: '/inquirer/website/dashboard',
  linkedin_inquirer: '/inquirer/linkedin/dashboard',

  website_auditor: '/auditor/website/dashboard',
  linkedin_auditor: '/auditor/linkedin/dashboard',
};

export default function LoginPage() {
  const { login, loading } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const role = await login(email, password);
      setSuccess('Authentication successful. Redirecting…');

      const redirectPath = ROLE_REDIRECT_MAP[role];

      if (!redirectPath) {
        setError(`No redirect configured for role: ${role}`);
        return;
      }

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 300);
    } catch {
      setError('Invalid credentials. Please check and try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-icon">B2B</div>
          <h1>Workforce Portal</h1>
          <p>Task Verification & Control System</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error-message">{error}</div>}
          {success && <div className="auth-success-message">{success}</div>}

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
            {loading ? 'Authenticating…' : 'Sign In'}
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