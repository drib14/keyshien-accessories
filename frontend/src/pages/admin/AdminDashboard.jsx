import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, DollarSign, ArrowRight, Loader2, ArrowUpRight, FolderOpen, Upload, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings States
  const [heroImage, setHeroImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, settingRes] = await Promise.all([
          fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/settings/hero_image`),
        ]);

        if (ordersRes.ok && productsRes.ok) {
          const ordersData = await ordersRes.json();
          const productsData = await productsRes.json();
          setOrders(ordersData);
          setProducts(productsData);
        }

        if (settingRes.ok) {
          const settingData = await settingRes.json();
          if (settingData && settingData.value) {
            setHeroImage(settingData.value);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Aggregate stats
  const totalRevenue = orders.reduce((acc, order) => order.isPaid ? acc + order.totalPrice : acc, 0);
  const paidOrdersCount = orders.filter(o => o.isPaid).length;
  const activeStockCount = products.reduce((acc, p) => acc + p.stock, 0);

  // Custom visual SVG chart data (e.g. Sales over time)
  const getSalesSplinePoints = () => {
    if (orders.length === 0) return '0,100 300,100';
    // Group last 6 orders
    const graphOrders = orders.slice(0, 6).reverse();
    const maxVal = Math.max(...graphOrders.map(o => o.totalPrice), 1000);
    
    return graphOrders
      .map((order, idx) => {
        const x = (idx / 5) * 280 + 10;
        const y = 90 - (order.totalPrice / maxVal) * 70;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setSettingsSuccess('');
    setSettingsError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Upload to Cloudinary
      const uploadRes = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.message || 'Image upload failed.');
      }

      // 2. Save settings to DB
      const settingsRes = await fetch(`${API_URL}/settings/hero_image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: uploadData.url }),
      });

      const settingsData = await settingsRes.json();

      if (settingsRes.ok) {
        setHeroImage(uploadData.url);
        setSettingsSuccess('Homepage Crafts hero banner image updated successfully! 💖');
      } else {
        throw new Error(settingsData.message || 'Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      setSettingsError(err.message || 'Failed to update hero crafts banner image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <style>{`
        .admin-layout {
          display: flex;
          padding: 40px;
          gap: 40px;
        }
        .admin-sidebar {
          width: 240px;
          flex-shrink: 0;
          padding: 20px;
          height: fit-content;
        }
        .admin-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          font-family: var(--font-headers);
          font-weight: 700;
          font-size: 14px;
          color: var(--color-muted);
          border-radius: var(--radius-sm);
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .admin-menu-item:hover {
          color: var(--color-primary-hover);
          background: rgba(255, 107, 139, 0.05);
        }
        .admin-menu-item.active {
          color: var(--color-accent);
          background: rgba(255, 107, 139, 0.1);
        }
        .admin-main-panel {
          flex-grow: 1;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 40px;
        }
        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          color: var(--color-accent);
        }
        .analytics-layout {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
        }
        .chart-box {
          width: 50%;
          padding: 24px;
        }
        .recent-orders-box {
          width: 50%;
          padding: 24px;
        }
        .dashboard-svg-chart {
          width: 100%;
          height: 180px;
          margin-top: 20px;
        }
        @media (max-width: 992px) {
          .admin-layout {
            flex-direction: column;
            padding: 20px;
          }
          .admin-sidebar {
            width: 100%;
            display: flex;
            gap: 10px;
            overflow-x: auto;
          }
          .admin-menu-item {
            margin-bottom: 0;
            white-space: nowrap;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .analytics-layout {
            flex-direction: column;
          }
          .chart-box, .recent-orders-box {
            width: 100%;
          }
        }
      `}</style>

      <div className="page-header" style={{ padding: '40px 0 10px 0' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Configure inventories, monitor sales, and manage checkouts</p>
      </div>

      <div className="admin-layout">
        {/* Navigation Sidebar */}
        <nav className="admin-sidebar glass-panel">
          <Link to="/admin/dashboard" className="admin-menu-item active">
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
          <Link to="/admin/promocodes" className="admin-menu-item">
            <Tag size={16} />
            <span>Manage Promocodes</span>
          </Link>
        </nav>

        {/* Overview Stats */}
        <main className="admin-main-panel">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Loader2 size={40} className="spinning-icon" style={{ margin: 'auto', color: 'var(--color-primary)', marginBottom: '16px' }} />
              <span style={{ color: 'var(--color-muted)' }}>Calculating sales matrix...</span>
            </div>
          ) : (
            <div>
              {/* Stat Boxes */}
              <div className="stats-grid">
                <div className="stat-card glass-panel">
                  <div>
                    <span style={{ color: 'var(--color-muted)', fontSize: '13px', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</span>
                    <h3 style={{ fontSize: '26px', color: 'var(--color-dark)', marginTop: '4px' }}>
                      ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-success)' }}>
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="stat-card glass-panel">
                  <div>
                    <span style={{ color: 'var(--color-muted)', fontSize: '13px', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Paid Checkouts</span>
                    <h3 style={{ fontSize: '26px', color: 'var(--color-dark)', marginTop: '4px' }}>{paidOrdersCount}</h3>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-accent)' }}>
                    <ShoppingBag size={20} />
                  </div>
                </div>

                <div className="stat-card glass-panel">
                  <div>
                    <span style={{ color: 'var(--color-muted)', fontSize: '13px', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Active Stocks</span>
                    <h3 style={{ fontSize: '26px', color: 'var(--color-dark)', marginTop: '4px' }}>{activeStockCount} units</h3>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-primary)' }}>
                    <Users size={20} />
                  </div>
                </div>
              </div>

              {/* Graphic Analytics & Recents */}
              <div className="analytics-layout">
                {/* SVG spline Sales Spline Curve */}
                <div className="chart-box glass-panel">
                  <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '16px', color: 'var(--color-dark)' }}>
                    Monthly Sales splines
                  </h3>
                  <svg viewBox="0 0 300 100" className="dashboard-svg-chart">
                    <defs>
                      <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="10" y1="20" x2="290" y2="20" stroke="#f6ecef" strokeWidth="0.5" />
                    <line x1="10" y1="55" x2="290" y2="55" stroke="#f6ecef" strokeWidth="0.5" />
                    <line x1="10" y1="90" x2="290" y2="90" stroke="#f6ecef" strokeWidth="0.5" />
                    
                    {/* Sales Curve Line */}
                    <polyline
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="2.5"
                      points={getSalesSplinePoints()}
                    />
                    
                    {/* Shadow Area below Curve */}
                    <polyline
                      fill="url(#chart-grad)"
                      stroke="none"
                      points={`10,90 ${getSalesSplinePoints()} 290,90`}
                    />
                  </svg>
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block', textAlign: 'center', marginTop: '10px' }}>
                    Visual tracking curve based on last 6 checkouts
                  </span>
                </div>

                {/* Recent Orders log */}
                <div className="recent-orders-box glass-panel">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '16px', color: 'var(--color-dark)' }}>
                      Recent Checkouts
                    </h3>
                    <Link to="/admin/orders" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      All Orders <ArrowRight size={12} />
                    </Link>
                  </div>

                  {orders.length === 0 ? (
                    <p style={{ color: 'var(--color-muted)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                      No orders placed in catalog yet.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {orders.slice(0, 4).map((order) => (
                        <div key={order._id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '13px', borderBottom: '1px solid #faf2f4', paddingBottom: '8px' }}>
                          <div>
                            <strong style={{ color: 'var(--color-dark)' }}>#{order._id.substring(0, 10)}...</strong>
                            <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px' }}>
                              ₱{order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} • {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                          <Link to={`/admin/orders?highlight=${order._id}`} style={{ color: 'var(--color-accent)' }}>
                            <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Crafts Hero Banner Settings */}
              <div className="glass-panel" style={{ padding: '30px', marginTop: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '16px', color: 'var(--color-dark)', marginBottom: '10px' }}>
                  Dynamic Homepage Craft Banner
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                  Manage the main hero banner graphic displayed on the storefront home screen. Upload a high-resolution portrait or landscape image of your handmade crafts.
                </p>

                {settingsSuccess && (
                  <div style={{ color: 'var(--color-success)', background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.15)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                    {settingsSuccess}
                  </div>
                )}
                {settingsError && (
                  <div style={{ color: 'var(--color-danger)', background: 'rgba(244,67,54,0.05)', border: '1px solid rgba(244,67,54,0.15)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                    {settingsError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {heroImage ? (
                    <img 
                      src={heroImage} 
                      alt="Hero preview" 
                      style={{ width: '220px', height: '140px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '2px solid var(--border-glass)', boxShadow: 'var(--shadow-sm)' }} 
                    />
                  ) : (
                    <div style={{ width: '220px', height: '140px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '2px dashed var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '12px' }}>
                      No hero image set
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => document.getElementById('admin-hero-file').click()}
                      disabled={uploading}
                      style={{ display: 'flex', gap: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={14} className="spinning-icon" /> Uploading to Cloudinary...
                        </>
                      ) : (
                        <>
                          <Upload size={14} /> Upload Banner Craft Photo
                        </>
                      )}
                    </button>
                    <input 
                      type="file" 
                      id="admin-hero-file" 
                      style={{ display: 'none' }} 
                      onChange={handleHeroImageUpload} 
                      disabled={uploading} 
                    />
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>JPEG or PNG files under 5MB</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
