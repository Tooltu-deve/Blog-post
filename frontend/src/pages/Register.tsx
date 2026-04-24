import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';

type Step = 'register' | 'confirm';

export default function Register() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('register');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp({
        username: form.email,
        password: form.password,
        options: {
          userAttributes: {
            email: form.email,
            given_name: form.firstName,
            family_name: form.lastName,
          },
        },
      });
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmSignUp({ username: form.email, confirmationCode: code });
      await signIn({ username: form.email, password: form.password });
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  if (step === 'confirm') {
    return (
      <main className="container auth-container">
        <div className="auth-card">
          <h1>Check your email</h1>
          <p className="auth-subtitle">
            We sent a verification code to <strong>{form.email}</strong>.
          </p>

          <form onSubmit={handleConfirm} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">Verification code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                className="form-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container auth-container">
      <div className="auth-card">
        <h1>Create an account</h1>
        <p className="auth-subtitle">Join the blog community</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                className="form-input"
                value={form.firstName}
                onChange={set('firstName')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="form-input"
                value={form.lastName}
                onChange={set('lastName')}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={set('email')}
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
              onChange={set('password')}
              required
              minLength={8}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
