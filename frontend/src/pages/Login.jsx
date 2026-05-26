import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <style>{`
        .login-layout {
          max-width: 450px;
          margin: 60px auto;
          padding: 40px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .login-logo {
          font-family: var(--font-headers);
          font-weight: 800;
          font-size: 28px;
          color: var(--color-dark);
          margin-bottom: 6px;
        }
        .auth-icon-wrapper {
          position: relative;
        }
        .auth-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted);
        }
        .auth-control {
          padding-left: 42px !important;
        }
      `}</style>

      <div className="login-layout glass-panel">
        <div className="login-header">
          <h2 className="login-logo">Welcome Back 💖</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>Sign in to Keyshien Accessories store</p>
        </div>

        {error && (
          <div style={{ color: 'var(--color-danger)', padding: '10px 14px', background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLocalSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="auth-icon-wrapper">
              <Mail size={16} className="auth-icon" />
              <input
                type="email"
                className="form-control auth-control"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--color-primary-hover)' }}>Forgot Password?</Link>
            </div>
            <div className="auth-icon-wrapper">
              <Lock size={16} className="auth-icon" />
              <input
                type="password"
                className="form-control auth-control"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 0', fontSize: '15px' }}
          >
            {loading ? <Loader2 size={16} className="spinning-icon" /> : <>Sign In <LogIn size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '13px', color: 'var(--color-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
