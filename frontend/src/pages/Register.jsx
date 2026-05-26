import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Loader2, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="registration-success-panel glass-panel">
        <style>{`
          .registration-success-panel {
            max-width: 500px;
            margin: 80px auto;
            padding: 40px;
            text-align: center;
          }
          .inbox-icon-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(255, 107, 139, 0.1);
            color: var(--color-primary-hover);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px auto;
          }
        `}</style>
        <div className="inbox-icon-wrapper">
          <Inbox size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', marginBottom: '12px' }}>
          Verification Link Sent!
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
          We have sent a premium verification email to <strong>{email}</strong>. Please check your inbox and click the verification link to activate your Keyshien Accessories account.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="register-page-container">
      <style>{`
        .register-layout {
          max-width: 450px;
          margin: 60px auto;
          padding: 40px;
        }
        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .register-logo {
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

      <div className="register-layout glass-panel">
        <div className="register-header">
          <h2 className="register-logo">Create Account 💖</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>Join Keyshien Accessories store today</p>
        </div>

        {error && (
          <div style={{ color: 'var(--color-danger)', padding: '10px 14px', background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="auth-icon-wrapper">
              <User size={16} className="auth-icon" />
              <input
                type="text"
                className="form-control auth-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label className="form-label">Password</label>
            <div className="auth-icon-wrapper">
              <Lock size={16} className="auth-icon" />
              <input
                type="password"
                className="form-control auth-control"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
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
            {loading ? <Loader2 size={16} className="spinning-icon" /> : <>Create Account <UserPlus size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '13px', color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
