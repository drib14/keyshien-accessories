import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2, KeyRound, CheckCircle, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const { sendResetCode, verifyResetCode, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Step state: 1 = Email submission, 2 = Code verification, 3 = Reset password, 4 = Success!
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  
  // 6-digit code states
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Password reset states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle focusing behavior on code box entries
  const handleCodeChange = (index, value) => {
    if (isNaN(value)) return; // Allow numbers only

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1); // Keep only the last character
    setCode(newCode);

    // Auto-advance to the next input if value is typed
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    // Auto-retreat to the previous input if backspace is pressed on an empty box
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const newCode = pasteData.split('');
      setCode(newCode);
      // Focus on the last input box
      inputRefs.current[5].focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      await sendResetCode(email);
      setSuccess('Verification code sent successfully!');
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send verification code. Check email.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyResetCode(email, fullCode);
      setSuccess('Verification code verified successfully!');
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const fullCode = code.join('');
      await resetPassword(email, fullCode, password);
      setStep(4);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reset password. Code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <style>{`
        .forgot-layout {
          max-width: 460px;
          margin: 60px auto;
          padding: 40px;
        }
        .forgot-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .forgot-title {
          font-family: var(--font-headers);
          font-weight: 800;
          font-size: 26px;
          color: var(--color-dark);
          margin-bottom: 8px;
        }
        .forgot-desc {
          color: var(--color-muted);
          font-size: 14px;
          line-height: 1.5;
        }
        .back-to-signin {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-muted);
          margin-bottom: 20px;
          transition: color 0.2s;
        }
        .back-to-signin:hover {
          color: var(--color-primary);
        }
        /* 6 Box Code Inputs */
        .code-inputs-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin: 24px 0;
        }
        .code-box-input {
          width: 50px;
          height: 54px;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-glass);
          background: var(--bg-glass);
          color: var(--color-accent);
          font-size: 24px;
          font-weight: 800;
          text-align: center;
          outline: none;
          transition: all 0.2s;
        }
        .code-box-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(255, 107, 139, 0.15);
          background: #ffffff;
        }
      `}</style>

      <div className="forgot-layout glass-panel">
        <Link to="/login" className="back-to-signin">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <div>
            <div className="forgot-header">
              <h2 className="forgot-title">Reset Password 💖</h2>
              <p className="forgot-desc">
                Enter your registered email address below, and we'll mail you a secure 6-digit verification code.
              </p>
            </div>

            {error && (
              <div style={{ color: 'var(--color-danger)', padding: '10px 14px', background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '42px' }}
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {loading ? <Loader2 size={16} className="spinning-icon" /> : <>Send Verification Code <Send size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Code Verification */}
        {step === 2 && (
          <div>
            <div className="forgot-header">
              <h2 className="forgot-title">Enter Verification Code 📬</h2>
              <p className="forgot-desc">
                We sent a 6-digit code to <strong>{email}</strong>. Enter the digits below to unlock reset panels.
              </p>
            </div>

            {error && (
              <div style={{ color: 'var(--color-danger)', padding: '10px 14px', background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCodeSubmit}>
              <div className="code-inputs-row" onPaste={handlePaste}>
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    className="code-box-input"
                    value={digit}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: '15px', marginBottom: '14px' }}
              >
                {loading ? <Loader2 size={16} className="spinning-icon" /> : <>Verify Code <ShieldCheck size={16} /></>}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px 0', fontSize: '13px' }}
                onClick={handleEmailSubmit}
                disabled={loading}
              >
                Resend 6-digit Code
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Reset Password Form */}
        {step === 3 && (
          <div>
            <div className="forgot-header">
              <h2 className="forgot-title">Set New Password 🔑</h2>
              <p className="forgot-desc">
                Code verified! Type your new secure login password below.
              </p>
            </div>

            {error && (
              <div style={{ color: 'var(--color-danger)', padding: '10px 14px', background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '42px' }}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '42px' }}
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? <Loader2 size={16} className="spinning-icon" /> : <>Save Password & Login</>}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--color-success)', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <CheckCircle size={56} fill="rgba(76, 175, 80, 0.1)" />
            </div>
            <h2 className="forgot-title">Password Reset!</h2>
            <p className="forgot-desc" style={{ marginBottom: '30px' }}>
              Your password has been updated successfully! You can now log into your Keyshien Accessories account using your new credentials.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 30px' }}>
              Sign In Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
