import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, updateQty, removeFromCart, getCartSubtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = getCartSubtotal();
  const shipping = subtotal > 1500 ? 0 : 80; // Free shipping above ₱1,500
  const total = subtotal + shipping;

  const handleCheckoutRedirect = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-panel">
        <style>{`
          .cart-empty-panel {
            text-align: center;
            padding: 80px 40px;
            max-width: 600px;
            margin: 40px auto;
          }
          .empty-icon-wrapper {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 107, 139, 0.1);
            color: var(--color-primary-hover);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
          }
        `}</style>
        <div className="empty-icon-wrapper">
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', marginBottom: '12px' }}>
          Your Cart is Empty
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '15px', marginBottom: '30px' }}>
          Before you can checkout, you must add some beautiful accessories to your basket. We have a lot of items waitng for you!
        </p>
        <Link to="/shop" className="btn btn-primary">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <style>{`
        .cart-layout {
          display: flex;
          padding: 40px;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cart-items-section {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cart-item-card {
          display: flex;
          align-items: center;
          padding: 16px;
          gap: 20px;
        }
        .cart-item-img {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          background: #faf2f4;
          border: 1px solid var(--border-glass);
        }
        .cart-item-details {
          flex-grow: 1;
          min-width: 0;
        }
        .cart-item-name {
          font-family: var(--font-headers);
          font-weight: 700;
          font-size: 16px;
          color: var(--color-dark);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cart-item-price {
          font-weight: 700;
          color: var(--color-accent);
          font-size: 15px;
        }
        .cart-qty-select {
          padding: 6px 12px;
          border-radius: var(--radius-round);
          border: 1px solid var(--border-glass);
          background: var(--bg-primary);
          color: var(--color-dark);
          outline: none;
          cursor: pointer;
          font-family: var(--font-headers);
          font-weight: 600;
        }
        .cart-remove-btn {
          background: none;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .cart-remove-btn:hover {
          background: rgba(244, 67, 54, 0.1);
          color: var(--color-danger);
        }
        .cart-summary-section {
          width: 380px;
          flex-shrink: 0;
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .summary-title {
          font-family: var(--font-headers);
          font-size: 18px;
          color: var(--color-dark);
          margin-bottom: 20px;
        }
        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 14px;
          color: var(--color-muted);
        }
        .summary-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-headers);
          font-weight: 800;
          font-size: 20px;
          color: var(--color-dark);
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px dashed var(--border-glass);
        }
        @media (max-width: 992px) {
          .cart-layout {
            flex-direction: column;
            padding: 20px;
          }
          .cart-summary-section {
            width: 100%;
          }
        }
      `}</style>

      <div className="page-header" style={{ padding: '40px 0 10px 0' }}>
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">Review items in your cute pink basket</p>
      </div>

      <div className="cart-layout">
        {/* Items List */}
        <div className="cart-items-section">
          {cartItems.map((item) => (
            <div key={item.product} className="cart-item-card glass-panel">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              
              <div className="cart-item-details">
                <Link to={`/products/${item.product}`}>
                  <h4 className="cart-item-name">{item.name}</h4>
                </Link>
                <span className="cart-item-price">₱{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Quantity Selector */}
              <select
                className="cart-qty-select"
                value={item.qty}
                onChange={(e) => updateQty(item.product, e.target.value)}
              >
                {[...Array(item.stock).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>
                    Qty: {x + 1}
                  </option>
                ))}
              </select>

              <button
                className="cart-remove-btn"
                onClick={() => removeFromCart(item.product)}
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <Link to="/shop" className="btn btn-secondary" style={{ width: 'fit-content', marginTop: '10px' }}>
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        {/* Cart Summary Panel */}
        <div className="cart-summary-section glass-panel">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>
              ₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="summary-row">
            <span>Shipping Fee</span>
            <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>
              {shipping === 0 ? 'FREE' : `₱${shipping.toFixed(2)}`}
            </span>
          </div>
          {shipping > 0 && (
            <div style={{ fontSize: '11px', color: 'var(--color-primary-hover)', marginTop: '-8px', marginBottom: '14px' }}>
              Add ₱{(1500 - subtotal).toFixed(2)} more for FREE shipping!
            </div>
          )}

          <div className="summary-total-row">
            <span>Total</span>
            <span style={{ color: 'var(--color-accent)' }}>
              ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleCheckoutRedirect}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 0', marginTop: '30px', fontSize: '15px' }}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
