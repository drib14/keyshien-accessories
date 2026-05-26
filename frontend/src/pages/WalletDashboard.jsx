import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet, Award, ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../context/AuthContext';

const WalletDashboard = () => {
  const { user, token, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Topup States
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  // Redeem States
  const [redeemPoints, setRedeemPoints] = useState(10);
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Status Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Top-up Verification States
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const checkTopupStatus = async () => {
      const topupSuccess = searchParams.get('topup_success');
      const sessionId = searchParams.get('session_id');
      const amount = searchParams.get('amount');

      if (topupSuccess === 'true' && sessionId && amount) {
        setVerifying(true);
        setError('');
        setSuccess('');

        try {
          const res = await fetch(`${API_URL}/payments/verify-topup/${sessionId}/${amount}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (res.ok && data.success) {
            setSuccess(`Successfully verified! ₱${Number(amount).toFixed(2)} has been credited to your wallet.`);
            // Refresh Context Profile to update navbar and context state
            await refreshProfile();
          } else {
            setError(data.message || 'Verification of wallet top-up failed.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to verify top-up transaction.');
        } finally {
          setVerifying(false);
          // Clear query params so page refresh doesn't re-trigger verification
          navigate('/wallet', { replace: true });
        }
      }

      // Check if cancelled
      if (searchParams.get('topup_cancelled') === 'true') {
        setError('Wallet top-up payment was cancelled.');
        navigate('/wallet', { replace: true });
      }
    };

    checkTopupStatus();
  }, [searchParams, token, refreshProfile, navigate]);

  // Handle Wallet Top-up
  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) {
      setError('Please provide a valid top-up amount');
      return;
    }

    setTopupLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/payments/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (response.ok && data.checkoutUrl) {
        // Redirect to Paymongo checkout
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.message || 'Failed to create top-up payment session.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initiate top-up payment with Paymongo.');
    } finally {
      setTopupLoading(false);
    }
  };

  // Handle Reward Points Redemption
  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (redeemPoints < 10) {
      setError('You must redeem at least 10 points.');
      return;
    }
    if ((user?.rewardPoints || 0) < redeemPoints) {
      setError('Insufficient reward points balance.');
      return;
    }

    setRedeemLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/auth/redeem-rewards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points: redeemPoints }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || `Redeemed ${redeemPoints} points successfully!`);
        await refreshProfile();
      } else {
        setError(data.message || 'Redemption failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to contact rewards redemption server.');
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div className="wallet-page-container">
      <style>{`
        .wallet-layout {
          display: flex;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px;
          gap: 40px;
        }
        .wallet-cards-column {
          width: 450px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .wallet-forms-column {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .wallet-bal-card {
          padding: 30px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          box-shadow: var(--shadow-lg);
        }
        .rewards-bal-card {
          padding: 30px;
          position: relative;
          overflow: hidden;
        }
        .card-label {
          font-family: var(--font-headers);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.85;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-value {
          font-size: 38px;
          font-weight: 800;
          margin-top: 10px;
          font-family: var(--font-headers);
        }
        .card-subtitle {
          font-size: 12px;
          opacity: 0.75;
          margin-top: 6px;
        }
        .quick-amounts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 10px;
        }
        .quick-amount-btn {
          padding: 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
          background: var(--bg-primary);
          color: var(--color-dark);
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .quick-amount-btn:hover {
          background: var(--color-secondary);
          color: var(--color-accent);
          transform: translateY(-1px);
        }
        .wallet-info-panel {
          padding: 24px;
          background: var(--bg-glass);
        }
        .verifying-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(43, 14, 21, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          z-index: 2000;
        }
        @media (max-width: 900px) {
          .wallet-layout {
            flex-direction: column;
            padding: 20px;
          }
          .wallet-cards-column, .wallet-forms-column {
            width: 100%;
          }
        }
      `}</style>

      {/* Verification Overlay Loader */}
      {verifying && (
        <div className="verifying-overlay">
          <Loader2 size={50} className="spinning-icon" style={{ color: 'var(--color-primary)', marginBottom: '20px' }} />
          <h2 style={{ fontFamily: 'var(--font-headers)', fontWeight: 800 }}>Verifying Top-Up...</h2>
          <p style={{ opacity: 0.8, fontSize: '14px', marginTop: '6px' }}>Validating Paymongo secure sandbox checkout session</p>
        </div>
      )}

      <div className="page-header" style={{ padding: '40px 0 10px 0' }}>
        <h1 className="page-title">Wallet & Rewards</h1>
        <p className="page-subtitle">Add credits, manage points redemptions, and view transaction status</p>
      </div>

      <div className="wallet-layout">
        {/* Left Side: Balances Cards */}
        <div className="wallet-cards-column">
          {/* Active Balance Card */}
          <div className="wallet-bal-card glass-panel">
            <span className="card-label">
              <Wallet size={16} /> Keyshien Wallet Balance
            </span>
            <h2 className="card-value">₱{Number(user?.walletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            <span className="card-subtitle">Use your wallet balance at checkout for instant order processing</span>
          </div>

          {/* Reward Points Card */}
          <div className="rewards-bal-card glass-panel">
            <span className="card-label" style={{ color: 'var(--color-accent)' }}>
              <Award size={16} /> Reward Points
            </span>
            <h2 className="card-value" style={{ color: 'var(--color-dark)' }}>{user?.rewardPoints || 0} pts</h2>
            <span className="card-subtitle" style={{ color: 'var(--color-muted)', display: 'block', marginTop: '6px' }}>
              Redeem reward points for wallet credits!
            </span>
            <span style={{ fontSize: '11px', display: 'block', fontWeight: 600, color: 'var(--color-primary-hover)', marginTop: '4px' }}>
              *Earn 1 point per ₱100 spent on any purchase.
            </span>
          </div>

          {/* Info card */}
          <div className="wallet-info-panel glass-panel" style={{ fontSize: '13px', lineHeight: '1.5' }}>
            <h4 style={{ color: 'var(--color-dark)', marginBottom: '8px', fontWeight: 700 }}>Conversion System</h4>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--color-muted)' }}>
              <li><strong>Redemption rate:</strong> 10 points = ₱1.00 wallet credit.</li>
              <li>Points are earned dynamically on order checkouts as soon as payment is confirmed.</li>
              <li>Paymongo checkout sandbox simulates card/e-wallet transactions securely.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Inputs and Exchanges Forms */}
        <div className="wallet-forms-column">
          {error && (
            <div style={{ color: 'var(--color-danger)', padding: '12px 16px', background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ color: 'var(--color-success)', padding: '12px 16px', background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Top up form card */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Top-Up Wallet Balance
            </h3>
            <form onSubmit={handleTopupSubmit}>
              <div className="form-group">
                <label className="form-label">Top-Up Amount (PHP)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter top-up amount, e.g. 500"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="50"
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <span className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Quick Amounts</span>
                <div className="quick-amounts-grid">
                  {['100', '200', '500', '1000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="quick-amount-btn"
                      onClick={() => setTopupAmount(amt)}
                    >
                      ₱{amt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={topupLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: '15px' }}
              >
                {topupLoading ? (
                  <Loader2 size={16} className="spinning-icon" />
                ) : (
                  <>
                    Proceed to Paymongo Sandbox <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Points conversion card */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Redeem Reward Points
            </h3>
            <form onSubmit={handleRedeemSubmit}>
              <div className="form-group">
                <label className="form-label">Redemption Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(Math.max(10, Number(e.target.value)))}
                  step="10"
                  min="10"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: 'rgba(255,107,139,0.04)', padding: '12px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', marginBottom: '24px' }}>
                <span style={{ color: 'var(--color-muted)' }}>Conversion Reward Credit:</span>
                <strong style={{ color: 'var(--color-accent)' }}>₱{Number(redeemPoints / 10).toFixed(2)}</strong>
              </div>

              <button
                type="submit"
                disabled={redeemLoading || (user?.rewardPoints || 0) < redeemPoints || (user?.rewardPoints || 0) < 10}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '14px 0', fontSize: '15px' }}
              >
                {redeemLoading ? (
                  <Loader2 size={16} className="spinning-icon" />
                ) : (
                  <>Redeem for Wallet Credits</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
