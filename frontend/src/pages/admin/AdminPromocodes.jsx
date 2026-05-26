import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, DollarSign, Plus, Trash2, X, Loader2, FolderOpen, Tag, Percent, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../context/AuthContext';

const AdminPromocodes = () => {
  const { token } = useAuth();

  const [promocodes, setPromocodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Loader states
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPromocodes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/promocodes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPromocodes(data);
      }
    } catch (err) {
      console.error('Failed to load promo codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromocodes();
  }, []);

  const openAddDrawer = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('0');
    setExpiryDate('');
    setIsActive(true);
    setError('');
    setIsDrawerOpen(true);
  };

  const handleSavePromocode = async (e) => {
    e.preventDefault();
    if (!code || !discountType || discountValue === '') {
      setError('Please provide promo code, select a discount type, and input a value.');
      return;
    }

    setSaveLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/promocodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount || 0),
          expiryDate: expiryDate ? expiryDate : undefined,
          isActive,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDrawerOpen(false);
        fetchPromocodes(); // Reload listings
      } else {
        setError(data.message || 'Failed to save promo code.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to contact database.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeletePromocode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code? Active checkouts using this code will no longer accept it.')) return;

    try {
      const response = await fetch(`${API_URL}/promocodes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPromocodes(); // Reload listings
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="admin-promocodes-container">
      <style>{`
        .promocodes-grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .promocodes-grid-table th, .promocodes-grid-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid var(--border-glass);
        }
        .promocodes-grid-table th {
          font-family: var(--font-headers);
          font-weight: 700;
          color: var(--color-dark);
          text-transform: uppercase;
          font-size: 11px;
        }
        .badge-active {
          background: rgba(76, 175, 80, 0.08);
          color: var(--color-success);
          border: 1px solid rgba(76, 175, 80, 0.2);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 700;
        }
        .badge-expired {
          background: rgba(244, 67, 54, 0.08);
          color: var(--color-danger);
          border: 1px solid rgba(244, 67, 54, 0.2);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 700;
        }
        .badge-disabled {
          background: rgba(158, 158, 158, 0.08);
          color: var(--color-muted);
          border: 1px solid rgba(158, 158, 158, 0.2);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 700;
        }
        /* Glassmorphic Slide-in Form Drawer */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(43, 14, 21, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s ease;
        }
        .drawer-sheet {
          width: 460px;
          height: 100%;
          background: #ffffff;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
          padding: 30px;
          overflow-y: auto;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .drawer-close-btn {
          background: none;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div className="page-header" style={{ padding: '40px 0 10px 0' }}>
        <h1 className="page-title">Manage Promocodes</h1>
        <p className="page-subtitle">Configure e-commerce discount coupons and promotional campaign codes</p>
      </div>

      <div className="admin-layout">
        {/* Navigation Sidebar */}
        <nav className="admin-sidebar glass-panel">
          <Link to="/admin/dashboard" className="admin-menu-item">
            <LayoutDashboard size={16} />
            <span>Overview Stats</span>
          </Link>
          <Link to="/admin/products" className="admin-menu-item">
            <ShoppingBag size={16} />
            <span>Manage Products</span>
          </Link>
          <Link to="/admin/categories" className="admin-menu-item">
            <FolderOpen size={16} />
            <span>Manage Categories</span>
          </Link>
          <Link to="/admin/orders" className="admin-menu-item">
            <DollarSign size={16} />
            <span>Manage Orders</span>
          </Link>
          <Link to="/admin/promocodes" className="admin-menu-item active">
            <Tag size={16} />
            <span>Manage Promocodes</span>
          </Link>
        </nav>

        {/* Main Grid */}
        <main className="admin-main-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)' }}>
              Active Discount Coupons
            </h3>
            <button className="btn btn-primary" onClick={openAddDrawer} style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Plus size={14} /> Add Promocode
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Loader2 size={32} className="spinning-icon" style={{ margin: 'auto', color: 'var(--color-primary)', marginBottom: '16px' }} />
              <span style={{ color: 'var(--color-muted)' }}>Loading active campaign coupons...</span>
            </div>
          ) : promocodes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', color: 'var(--color-muted)' }}>
              <span>No campaign promo codes defined yet. Click "Add Promocode" to launch your first coupon event.</span>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="promocodes-grid-table">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount Rate / Value</th>
                    <th>Min. Cart Value</th>
                    <th>Expiry Date</th>
                    <th>Usage Statistics</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promocodes.map((promo) => {
                    const expired = isExpired(promo.expiryDate);
                    return (
                      <tr key={promo._id}>
                        <td style={{ fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '0.05em' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={13} style={{ color: 'var(--color-primary)' }} />
                            {promo.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                          {promo.discountType === 'percentage' ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Percent size={13} /> {promo.discountValue}% OFF
                            </span>
                          ) : (
                            `₱${promo.discountValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} OFF`
                          )}
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                          {promo.minOrderAmount > 0 ? `₱${promo.minOrderAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'No Minimum'}
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                          {promo.expiryDate ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} />
                              {new Date(promo.expiryDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                            </span>
                          ) : (
                            'Never Expires'
                          )}
                        </td>
                        <td style={{ fontSize: '13px', fontWeight: 600 }}>
                          {promo.usageCount} time{promo.usageCount !== 1 ? 's' : ''} used
                        </td>
                        <td>
                          {!promo.isActive ? (
                            <span className="badge-disabled">Disabled</span>
                          ) : expired ? (
                            <span className="badge-expired">Expired</span>
                          ) : (
                            <span className="badge-active">Active</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeletePromocode(promo._id)}
                            style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--color-danger)', border: '1px solid rgba(244,67,54,0.2)', display: 'flex', gap: '4px' }}
                          >
                            <Trash2 size={11} style={{ color: 'var(--color-danger)' }} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Slide-in Add Drawer Panel */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', fontSize: '20px' }}>
                Add New Coupon Event
              </h2>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600, marginBottom: '16px', padding: '10px', background: 'rgba(244,67,54,0.05)', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSavePromocode}>
              <div className="form-group">
                <label className="form-label">Promotional Code Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. WELCOME50, SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discount Benefit Type</label>
                <select
                  className="form-control"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  required
                >
                  <option value="percentage">Percentage discount (% off cart subtotal)</option>
                  <option value="fixed">Fixed cost discount (PHP credit off cart)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ width: '50%' }}>
                  <label className="form-label">Discount Value</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder={discountType === 'percentage' ? 'e.g. 15 for 15%' : 'e.g. 100 for ₱100'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group" style={{ width: '50%' }}>
                  <label className="form-label">Min. Cart Value (PHP)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 500"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date (Optional)</label>
                <input
                  type="date"
                  className="form-control"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', marginBottom: '30px' }}>
                <input
                  type="checkbox"
                  id="promo-active-checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="promo-active-checkbox" style={{ fontWeight: 600, color: 'var(--color-dark)', cursor: 'pointer', fontSize: '14px' }}>
                  Enable code immediately for customer checkouts
                </label>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: '15px' }}
              >
                {saveLoading ? <Loader2 size={16} className="spinning-icon" /> : <>Launch Promo Coupon</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromocodes;
