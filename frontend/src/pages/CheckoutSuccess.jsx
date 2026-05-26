import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Eye, Loader2, ArrowRight } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  const { token } = useAuth();

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId || !sessionId) {
        setError('Missing transaction identifiers');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/payments/verify/${sessionId}/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess(true);
          setOrder(data.order);
        } else {
          // Double check if order is already paid as fallback
          const orderCheckRes = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (orderCheckRes.ok) {
            const orderData = await orderCheckRes.json();
            if (orderData.isPaid) {
              setSuccess(true);
              setOrder(orderData);
            } else {
              setError(data.message || 'Payment verification failed');
            }
          } else {
            setError('Payment verification failed');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to contact verification server');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyPayment();
    }
  }, [orderId, sessionId, token]);

  return (
    <div className="success-page-container">
      <style>{`
        .success-box {
          max-width: 600px;
          margin: 60px auto;
          padding: 40px;
          text-align: center;
        }
        .success-icon-wrapper {
          color: var(--color-success);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-icon-wrapper svg {
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .success-title {
          font-family: var(--font-headers);
          font-size: 28px;
          color: var(--color-dark);
          margin-bottom: 12px;
        }
        .success-desc {
          color: var(--color-muted);
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .order-meta-info {
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: left;
          margin-bottom: 30px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 10px;
          border-bottom: 1px solid #faf2f4;
          padding-bottom: 8px;
        }
        .meta-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>

      <div className="success-box glass-panel">
        {verifying ? (
          <div style={{ padding: '40px 0' }}>
            <Loader2 size={40} className="spinning-icon" style={{ color: 'var(--color-primary)', margin: 'auto', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)' }}>Verifying Payment Status...</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginTop: '6px' }}>Please do not close this window while we verify your invoice.</p>
          </div>
        ) : error && !success ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ color: 'var(--color-danger)', fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h2 className="success-title">Verification Issue</h2>
            <p className="success-desc">
              We couldn't verify your transaction automatically. If you paid and funds were debited, please contact our support at jhondribramirez7@gmail.com with Order ID: <strong>{orderId}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to="/orders" className="btn btn-secondary">
                View My Orders
              </Link>
              <Link to="/shop" className="btn btn-primary">
                Return to Store
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="success-icon-wrapper">
              <CheckCircle size={60} fill="rgba(76, 175, 80, 0.1)" />
            </div>
            <h2 className="success-title">Payment Confirmed!</h2>
            <p className="success-desc">
              Thank you for shopping with Keyshien Accessories! Your payment was verified successfully. We are now preparing your handcrafted jewels for shipment.
            </p>

            {order && (
              <div className="order-meta-info">
                <h4 style={{ fontFamily: 'var(--font-headers)', fontSize: '14px', marginBottom: '14px', color: 'var(--color-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transaction Invoice Details
                </h4>
                <div className="meta-row">
                  <span>Order Reference</span>
                  <strong style={{ color: 'var(--color-dark)' }}>#{order._id}</strong>
                </div>
                <div className="meta-row">
                  <span>Amount Paid</span>
                  <strong style={{ color: 'var(--color-accent)' }}>₱{order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="meta-row">
                  <span>Status</span>
                  <span className="badge badge-paid">Paid</span>
                </div>
                <div className="meta-row">
                  <span>Shipping Destination</span>
                  <span style={{ textAlign: 'right', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to={`/orders/${orderId}`} className="btn btn-secondary">
                <Eye size={14} /> View Live Order Tracking
              </Link>
              <Link to="/shop" className="btn btn-primary">
                Explore More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
