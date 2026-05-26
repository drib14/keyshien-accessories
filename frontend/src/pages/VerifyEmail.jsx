import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage('Verification token is missing.');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify/${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess(true);
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setMessage(data.message || 'Verification token is invalid or has expired.');
        }
      } catch (err) {
        console.error(err);
        setMessage('Network error, failed to contact the verification server.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="verify-email-page">
      <style>{`
        .verify-box {
          max-width: 500px;
          margin: 80px auto;
          padding: 40px;
          text-align: center;
        }
        .verify-icon-success {
          color: var(--color-success);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .verify-icon-error {
          color: var(--color-danger);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="verify-box glass-panel">
        {verifying ? (
          <div>
            <Loader2 size={40} className="spinning-icon" style={{ color: 'var(--color-primary)', margin: 'auto', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)' }}>Confirming Verification Token...</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginTop: '6px' }}>Please wait a moment while we update your credentials.</p>
          </div>
        ) : success ? (
          <div>
            <div className="verify-icon-success">
              <CheckCircle size={56} fill="rgba(76, 175, 80, 0.1)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', marginBottom: '12px' }}>
              Verification Successful!
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
              {message} Your email is now verified. You can log in and explore our collection of premium accessories!
            </p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 30px' }}>
              Sign In Now
            </Link>
          </div>
        ) : (
          <div>
            <div className="verify-icon-error">
              <AlertTriangle size={56} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', marginBottom: '12px' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
              {message} Please ensure you copied the link correctly or request another verification link from our support.
            </p>
            <Link to="/register" className="btn btn-primary" style={{ padding: '12px 30px' }}>
              Register Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
