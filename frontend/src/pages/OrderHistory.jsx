import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, MapPin, Loader2, ArrowLeft, Package, Clock, Truck, ShieldCheck } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

const OrderHistory = () => {
  const { id } = useParams(); // Selected Order ID (optional)
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch list of orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && !id) {
      fetchOrders();
    }
  }, [token, id]);

  // Fetch individual order details if ID is present
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      setDetailLoading(true);
      setMapLoaded(false);
      try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSelectedOrder(data);
          
          // Trigger dynamic loading of Leaflet map for coordinate plotting
          if (data.coordinates && data.coordinates.lat) {
            setTimeout(() => loadOrderMap(data.coordinates), 200);
          }
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    if (token && id) {
      fetchOrderDetails();
    }
  }, [token, id]);

  // Function to initialize Leaflet map in order details page
  const loadOrderMap = (coords) => {
    // Check if Leaflet is loaded
    if (!window.L) {
      // Inject CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Inject JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        initLeaflet(coords);
      };
      document.body.appendChild(script);
    } else {
      initLeaflet(coords);
    }
  };

  const initLeaflet = (coords) => {
    const L = window.L;
    const dest = [coords.lat, coords.lng];
    
    // Clear old map container if it exists
    const container = L.DomUtil.get('order-leaflet-map');
    if (container) {
      container._leaflet_id = null;
    }

    const map = L.map('order-leaflet-map').setView(dest, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      maxZoom: 20,
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-pink-marker',
      html: `<div style="background: var(--color-accent); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(255, 10, 84, 0.5);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker(dest, { icon: customIcon }).addTo(map)
      .bindPopup('<b>Shipping Address</b><br>Coordinates captured via LocationIQ.').openPopup();

    setMapLoaded(true);
  };

  // Helper to determine active step in progress bar
  const getFulfillmentStep = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  const fulfillmentStep = selectedOrder ? getFulfillmentStep(selectedOrder.fulfillmentStatus) : 0;

  return (
    <div className="orders-page-container">
      <style>{`
        .orders-layout {
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .orders-list-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .orders-list-table th, .orders-list-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid var(--border-glass);
        }
        .orders-list-table th {
          font-family: var(--font-headers);
          font-weight: 700;
          color: var(--color-dark);
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
        }
        .orders-list-table td {
          font-size: 14px;
        }
        .orders-list-table tr:hover td {
          background: rgba(255, 107, 139, 0.02);
        }
        /* Visual Tracker Style */
        .order-detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .tracker-card {
          padding: 30px;
          margin-bottom: 30px;
        }
        .progress-bar-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 40px 0;
          padding: 0 40px;
        }
        .progress-line-backdrop {
          position: absolute;
          top: 24px;
          left: 80px;
          right: 80px;
          height: 4px;
          background: #ffccd5;
          z-index: 1;
        }
        .progress-line-fill {
          position: absolute;
          top: 24px;
          left: 80px;
          height: 4px;
          background: var(--color-primary);
          z-index: 2;
          transition: width 0.5s ease;
        }
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 3;
          width: 100px;
        }
        .step-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #ffccd5;
          color: var(--color-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .progress-step.active .step-icon-wrapper {
          border-color: var(--color-primary);
          color: var(--color-primary);
          box-shadow: 0 0 15px rgba(255, 107, 139, 0.3);
        }
        .progress-step.completed .step-icon-wrapper {
          border-color: var(--color-accent);
          background: var(--color-accent);
          color: #ffffff;
          box-shadow: 0 0 15px rgba(255, 10, 84, 0.3);
        }
        .step-label {
          font-family: var(--font-headers);
          font-size: 13px;
          font-weight: 700;
          margin-top: 10px;
          color: var(--color-muted);
        }
        .progress-step.active .step-label {
          color: var(--color-dark);
        }
        .progress-step.completed .step-label {
          color: var(--color-accent);
        }
        .detail-meta-layout {
          display: flex;
          gap: 30px;
        }
        .meta-text-box {
          width: 50%;
          padding: 24px;
        }
        .meta-map-box {
          width: 50%;
          padding: 24px;
          height: 300px;
          position: relative;
        }
        #order-leaflet-map {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-md);
        }
        @media (max-width: 768px) {
          .orders-layout {
            padding: 20px;
          }
          .detail-meta-layout {
            flex-direction: column;
          }
          .meta-text-box, .meta-map-box {
            width: 100%;
          }
          .progress-bar-container {
            padding: 0;
            overflow-x: auto;
          }
          .progress-line-backdrop, .progress-line-fill {
            display: none;
          }
        }
      `}</style>

      <div className="orders-layout">
        {/* VIEW 1: Individual Order detailed progress tracker */}
        {id ? (
          detailLoading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Loader2 size={40} className="spinning-icon" style={{ margin: 'auto', color: 'var(--color-primary)', marginBottom: '16px' }} />
              <span style={{ color: 'var(--color-muted)', fontWeight: 600 }}>Loading order tracking details...</span>
            </div>
          ) : !selectedOrder ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2 style={{ fontFamily: 'var(--font-headers)' }}>Order not found</h2>
              <Link to="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Back to Orders
              </Link>
            </div>
          ) : (
            <div>
              <div className="order-detail-header">
                <Link to="/orders" className="back-link" style={{ marginBottom: 0 }}>
                  <ArrowLeft size={14} /> Back to Orders History
                </Link>
                <span className="badge badge-paid" style={{ background: selectedOrder.isPaid ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)', color: selectedOrder.isPaid ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {selectedOrder.isPaid ? 'Paid' : 'Unpaid Checkout'}
                </span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-headers)', fontSize: '28px', color: 'var(--color-dark)', marginBottom: '4px' }}>
                Track Order #{selectedOrder._id}
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginBottom: '30px' }}>
                Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Progress Visual Tracker */}
              <div className="tracker-card glass-panel">
                <h4 style={{ fontFamily: 'var(--font-headers)', textTransform: 'uppercase', fontSize: '12px', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
                  Fulfillment Progress
                </h4>

                <div className="progress-bar-container">
                  <div className="progress-line-backdrop"></div>
                  <div 
                    className="progress-line-fill"
                    style={{ width: `${(fulfillmentStep / 3) * 78}%` }}
                  ></div>

                  <div className={`progress-step ${fulfillmentStep >= 0 ? (fulfillmentStep > 0 ? 'completed' : 'active') : ''}`}>
                    <div className="step-icon-wrapper">
                      <Clock size={20} />
                    </div>
                    <span className="step-label">Ordered</span>
                  </div>

                  <div className={`progress-step ${fulfillmentStep >= 1 ? (fulfillmentStep > 1 ? 'completed' : 'active') : ''}`}>
                    <div className="step-icon-wrapper">
                      <Package size={20} />
                    </div>
                    <span className="step-label">Processing</span>
                  </div>

                  <div className={`progress-step ${fulfillmentStep >= 2 ? (fulfillmentStep > 2 ? 'completed' : 'active') : ''}`}>
                    <div className="step-icon-wrapper">
                      <Truck size={20} />
                    </div>
                    <span className="step-label">Shipped</span>
                  </div>

                  <div className={`progress-step ${fulfillmentStep >= 3 ? 'completed' : ''}`}>
                    <div className="step-icon-wrapper">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="step-label">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Meta details & Delivery maps */}
              <div className="detail-meta-layout">
                {/* Meta details */}
                <div className="meta-text-box glass-panel">
                  <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '16px', color: 'var(--color-dark)', marginBottom: '16px' }}>
                    Shipping Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Delivery Location</span>
                      <strong style={{ color: 'var(--color-dark)' }}>
                        {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Payment Method</span>
                      <strong style={{ color: 'var(--color-dark)' }}>{selectedOrder.paymentMethod}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Total Price</span>
                      <strong style={{ color: 'var(--color-accent)', fontSize: '18px' }}>₱{selectedOrder.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>

                  <hr style={{ border: '0', borderTop: '1px solid #ffccd5', margin: '20px 0' }} />

                  <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '15px', color: 'var(--color-dark)', marginBottom: '12px' }}>
                    Order Items
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedOrder.orderItems.map((item) => (
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
                </div>

                {/* Interactive Map Visualizer */}
                <div className="meta-map-box glass-panel">
                  {selectedOrder.coordinates && selectedOrder.coordinates.lat ? (
                    <>
                      <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '16px', color: 'var(--color-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} style={{ color: 'var(--color-accent)' }} /> Delivery Geolocation
                      </h3>
                      <div id="order-leaflet-map"></div>
                      {!mapLoaded && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Loader2 size={24} className="spinning-icon" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', textAlign: 'center', padding: '20px' }}>
                      <span>No delivery coordinates pinned for this order.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
          /* VIEW 2: List of all user's orders */
          <div>
            <h1 className="page-title" style={{ textAlign: 'left' }}>Order History</h1>
            <p className="page-subtitle" style={{ textAlign: 'left' }}>Track past purchases and live delivery status</p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Loading your orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', marginTop: '30px' }}>
                <h3 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', marginBottom: '10px' }}>No Orders Found</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '20px' }}>You haven't placed any purchases with us yet.</p>
                <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div className="glass-panel" style={{ overflowX: 'auto', marginTop: '30px' }}>
                <table className="orders-list-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date Placed</th>
                      <th>Total Amount</th>
                      <th>Paid</th>
                      <th>Fulfillment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td style={{ fontWeight: 700, color: 'var(--color-dark)' }}>#{order._id.substring(0, 10)}...</td>
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
                          <Link to={`/orders/${order._id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                            <Eye size={12} /> Track
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
