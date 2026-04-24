import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, signInWithRedirect } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn({ username: form.email, password: form.password });
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'Google' | 'Facebook') => {
    try {
      await signInWithRedirect({ provider });
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} sign-in failed`);
    }
  };

  return (
    <main className="container auth-container">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <div className="auth-social">
          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={() => handleSocial('Google')}
          >
            Continue with Google
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={() => handleSocial('Facebook')}
          >
            Continue with Facebook
          </button>
        </div>

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
