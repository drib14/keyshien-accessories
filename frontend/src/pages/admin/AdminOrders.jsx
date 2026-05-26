import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, DollarSign, X, Eye, Truck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../context/AuthContext';

const AdminOrders = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        
        // If coming from recent orders link and highlightId matches, open drawer automatically!
        if (highlightId) {
          const highlighted = data.find(o => o._id === highlightId);
          if (highlighted) {
            setSelectedOrder(highlighted);
            setIsDrawerOpen(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [highlightId]);

  const handleUpdateStatus = async (status) => {
    if (!selectedOrder) return;

    setStatusLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrder._id}/fulfill`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updated = await response.json();
        // Update selected order detail view
        setSelectedOrder(updated);
        // Reload main orders grid
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div className="admin-orders-container">
      <style>{`
        .orders-grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .orders-grid-table th, .orders-grid-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid var(--border-glass);
        }
        .orders-grid-table th {
          font-family: var(--font-headers);
          font-weight: 700;
          color: var(--color-dark);
          text-transform: uppercase;
          font-size: 11px;
        }
        .orders-grid-table tr {
          cursor: pointer;
          transition: background 0.2s;
        }
        .orders-grid-table tr:hover td {
          background: rgba(255, 107, 139, 0.02);
        }
        /* Visual Drawer Panel */
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
          width: 480px;
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
        .status-update-row {
          display: flex;
          gap: 10px;
          margin-top: 15px;
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
        <h1 className="page-title">Manage Orders</h1>
        <p className="page-subtitle">Configure inventories, monitor sales, and manage checkouts</p>
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
          <Link to="/admin/orders" className="admin-menu-item active">
            <DollarSign size={16} />
            <span>Manage Orders</span>
          </Link>
        </nav>

        {/* Main Grid */}
        <main className="admin-main-panel">
          <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)' }}>
            Customer Orders List
          </h3>

          {loading && orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Loader2 size={32} className="spinning-icon" style={{ margin: 'auto', color: 'var(--color-primary)', marginBottom: '16px' }} />
              <span style={{ color: 'var(--color-muted)' }}>Retrieving customer checkouts...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', color: 'var(--color-muted)' }}>
              <span>No orders placed in catalog yet.</span>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="orders-grid-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Date Placed</th>
                    <th>Total Price</th>
                    <th>Paid</th>
                    <th>Fulfillment</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} onClick={() => handleRowClick(order)}>
                      <td style={{ fontWeight: 700, color: 'var(--color-dark)' }}>#{order._id.substring(0, 10)}...</td>
                      <td>{order.user?.name || 'Local User'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>₱{order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span className={`badge ${order.isPaid ? 'badge-paid' : 'badge-pending'}`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-delivered`} style={{ background: order.fulfillmentStatus === 'Delivered' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)', color: order.fulfillmentStatus === 'Delivered' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {order.fulfillmentStatus}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px' }}>
                          <Eye size={12} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Slide-in Order Details & Action Panel */}
      {isDrawerOpen && selectedOrder && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', fontSize: '20px' }}>
                Order Fulfillment Panel
              </h2>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Customer Billing</span>
                <strong style={{ color: 'var(--color-dark)' }}>{selectedOrder.user?.name || 'Local User'} ({selectedOrder.user?.email || 'N/A'})</strong>
              </div>

              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Fulfillment Status</span>
                <span className={`badge badge-delivered`} style={{ background: selectedOrder.fulfillmentStatus === 'Delivered' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)', color: selectedOrder.fulfillmentStatus === 'Delivered' ? 'var(--color-success)' : 'var(--color-warning)', marginTop: '4px' }}>
                  {selectedOrder.fulfillmentStatus}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginTop: '10px' }}>
                <h4 style={{ fontFamily: 'var(--font-headers)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={14} /> Update Shipping status
                </h4>
                
                {statusLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginTop: '10px' }}>
                    <Loader2 size={14} className="spinning-icon" /> Saving state changes...
                  </div>
                ) : (
                  <div className="status-update-row">
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '11px', flexGrow: 1 }}
                      disabled={selectedOrder.fulfillmentStatus === 'Processing'}
                      onClick={() => handleUpdateStatus('Processing')}
                    >
                      Process
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '11px', flexGrow: 1 }}
                      disabled={selectedOrder.fulfillmentStatus === 'Shipped'}
                      onClick={() => handleUpdateStatus('Shipped')}
                    >
                      Ship Item
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '8px 12px', fontSize: '11px', flexGrow: 1 }}
                      disabled={selectedOrder.fulfillmentStatus === 'Delivered'}
                      onClick={() => handleUpdateStatus('Delivered')}
                    >
                      Deliver
                    </button>
                  </div>
                )}
              </div>

              <hr style={{ border: '0', borderTop: '1px solid #ffccd5', margin: '15px 0' }} />

              <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '15px', color: 'var(--color-dark)' }}>
                Purchased Accessories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.orderItems?.map((item) => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-glass)' }} />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h5 style={{ fontWeight: 600, color: 'var(--color-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h5>
                      <span style={{ color: 'var(--color-muted)' }}>Qty: {item.qty}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>₱{(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Delivery Destination</span>
                <strong style={{ color: 'var(--color-dark)', display: 'block', fontSize: '13px', marginTop: '4px' }}>
                  {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                </strong>
                {selectedOrder.coordinates && selectedOrder.coordinates.lat && (
                  <span style={{ fontSize: '11px', color: 'var(--color-primary-hover)', display: 'block', marginTop: '2px' }}>
                    Geocoded Pinned location: {selectedOrder.coordinates.lat.toFixed(5)}, {selectedOrder.coordinates.lng.toFixed(5)}
                  </span>
                )}
              </div>

              <div style={{ marginTop: '10px' }}>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Checkout Total</span>
                <strong style={{ color: 'var(--color-accent)', fontSize: '20px', display: 'block', marginTop: '4px' }}>
                  ₱{selectedOrder.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
