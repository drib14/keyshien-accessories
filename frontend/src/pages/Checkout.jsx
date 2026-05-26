import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MapSelector from '../components/MapSelector';
import { API_URL } from '../context/AuthContext';

const Checkout = () => {
  const { cartItems, shippingAddress, coordinates, saveShippingAddress, saveCoordinates, getCartSubtotal, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getCartSubtotal();
  const shipping = subtotal > 1500 ? 0 : 80;
  const total = subtotal + shipping;

  const handleLocationSelected = (locationData) => {
    setAddress(locationData.address || '');
    setCity(locationData.city || '');
    setPostalCode(locationData.postalCode || '');
    
    // Save in context
    saveShippingAddress({
      address: locationData.address || '',
      city: locationData.city || '',
      postalCode: locationData.postalCode || '',
      country: 'Philippines'
    });
    
    saveCoordinates({
      lat: locationData.lat,
      lng: locationData.lng
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode) {
      setError('Please fill in all shipping details');
      return;
    }

    setOrderLoading(true);
    setError('');

    try {
      const orderItems = cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item.product,
      }));

      const shippingAddressData = { address, city, postalCode, country: 'Philippines' };

      // 1. Create the order in database
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItems,
          shippingAddress: shippingAddressData,
          coordinates,
          paymentMethod: 'Paymongo',
          totalPrice: total,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // 2. Create Paymongo Checkout Session
      const paymentResponse = await fetch(`${API_URL}/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: orderData._id,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || 'Failed to initialize payment gateway');
      }

      // 3. Clear cart basket locally
      clearCart();

      // 4. Redirect user to Paymongo Sandbox Payment Page!
      window.location.href = paymentData.checkoutUrl;
    } catch (err) {
      console.error(err);
      setError(err.message || 'System checkout error. Please check product stock and try again.');
      setOrderLoading(false);
    }
  };

  return (
    <div className="checkout-page-container">
      <style>{`
        .checkout-layout {
          display: flex;
          padding: 40px;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .checkout-form-section {
          flex-grow: 1;
        }
        .form-card {
          padding: 30px;
          margin-bottom: 24px;
        }
        .form-row {
          display: flex;
          gap: 20px;
        }
        .form-row .form-group {
          width: 50%;
        }
        .checkout-summary-section {
          width: 400px;
          flex-shrink: 0;
        }
        .order-summary-box {
          padding: 24px;
          position: sticky;
          top: 100px;
        }
        .checkout-items-list {
          margin: 20px 0;
          max-height: 200px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 6px;
        }
        .checkout-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }
        .checkout-item-thumb {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          border: 1px solid var(--border-glass);
        }
        .checkout-item-details {
          flex-grow: 1;
          min-width: 0;
        }
        .checkout-item-name {
          font-weight: 600;
          color: var(--color-dark);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .payment-method-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-md);
          background: rgba(255, 107, 139, 0.05);
          font-weight: 700;
          font-size: 14px;
          color: var(--color-accent);
          margin-top: 10px;
        }
      `}</style>

      <div className="page-header" style={{ padding: '40px 0 10px 0' }}>
        <h1 className="page-title">Secure Checkout</h1>
        <p className="page-subtitle">Verify shipping address and execute payment</p>
      </div>

      <div className="checkout-layout">
        {/* Shipping Form & Map Geocoder */}
        <div className="checkout-form-section">
          {error && (
            <div style={{ color: 'var(--color-danger)', padding: '12px 18px', background: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '14px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePlaceOrder}>
            <div className="form-card glass-panel">
              <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)', marginBottom: '20px', display: 'flex', alignContent: 'center', gap: '8px' }}>
                <MapPin size={18} style={{ color: 'var(--color-accent)' }} /> 1. Shipping Destination
              </h3>

              <div className="form-group">
                <label className="form-label">Street / House Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 12 Rose Gold Street, Beverly Hills Subdivision"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City / Province</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Quezon City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Interactive LocationIQ Map */}
              <label className="form-label" style={{ marginTop: '10px' }}>Pin Exact Delivery Coordinates</label>
              <MapSelector
                onLocationSelected={handleLocationSelected}
                initialCoords={coordinates ? [coordinates.lat, coordinates.lng] : null}
              />
            </div>

            <div className="form-card glass-panel">
              <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)', marginBottom: '16px', display: 'flex', alignContent: 'center', gap: '8px' }}>
                <CreditCard size={18} style={{ color: 'var(--color-primary)' }} /> 2. Payment Gateway Method
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: '1.5' }}>
                All transaction processes are securely managed. You will be redirected to Paymongo secure checkout to complete your transaction via Credit/Debit card or GCash/Maya e-wallets.
              </p>

              <div className="payment-method-badge">
                <CreditCard size={18} />
                <span>Paymongo Gateway (Cards, GCash, PayMaya, GrabPay)</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side summary basket */}
        <div className="checkout-summary-section">
          <div className="order-summary-box glass-panel">
            <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)' }}>Order Basket</h3>
            
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div key={item.product} className="checkout-item-row">
                  <img src={item.image} alt={item.name} className="checkout-item-thumb" />
                  <div className="checkout-item-details">
                    <h5 className="checkout-item-name">{item.name}</h5>
                    <span style={{ color: 'var(--color-muted)', fontSize: '11px' }}>Qty: {item.qty}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-dark)', flexShrink: 0 }}>
                    ₱{(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #ffccd5', margin: '15px 0' }} />

            <div className="summary-row" style={{ fontSize: '13px', marginBottom: '10px' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row" style={{ fontSize: '13px', marginBottom: '10px' }}>
              <span>Shipping Fee</span>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>{shipping === 0 ? 'FREE' : `₱${shipping.toFixed(2)}`}</span>
            </div>

            <div className="summary-total-row" style={{ marginTop: '12px', paddingTop: '12px' }}>
              <span style={{ fontSize: '16px' }}>Checkout Total</span>
              <span style={{ color: 'var(--color-accent)', fontSize: '24px' }}>₱{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 0', marginTop: '24px', fontSize: '15px' }}
            >
              {orderLoading ? (
                <>
                  <Loader2 size={16} className="spinning-icon" /> Creating Checkout...
                </>
              ) : (
                <>
                  Proceed to Paymongo Gateway <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-muted)', marginTop: '20px' }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
              <span>PCI-DSS SSL Encrypted Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
