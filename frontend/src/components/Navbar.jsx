import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Store, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar-container glass-panel">
      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 40px;
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          background: rgba(255, 248, 249, 0.85);
          border-bottom: 1px solid var(--border-glass);
        }
        .navbar-logo-link {
          font-family: var(--font-headers);
          font-weight: 800;
          font-size: 24px;
          color: var(--color-dark);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .navbar-brand-logo {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--color-primary);
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast);
        }
        .navbar-brand-logo:hover {
          transform: scale(1.05);
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 30px;
          list-style: none;
        }
        .nav-link {
          font-family: var(--font-headers);
          font-weight: 600;
          font-size: 15px;
          color: var(--color-dark);
          padding: 6px 0;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 50%;
          background: var(--color-primary);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .action-icon-btn {
          position: relative;
          color: var(--color-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          transition: all 0.2s;
        }
        .action-icon-btn:hover {
          background: var(--color-secondary);
          color: var(--color-accent);
          transform: translateY(-2px);
        }
        .cart-badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--color-accent);
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }
        .user-nav-dropdown {
          position: relative;
          display: inline-block;
        }
        .user-nav-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 10px;
          width: 180px;
          background: #ffffff;
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          padding: 8px;
          display: none;
          z-index: 101;
        }
        .user-nav-menu.show {
          display: block;
        }
        .dropdown-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-dark);
          border-radius: var(--radius-sm);
          transition: background 0.2s;
        }
        .dropdown-menu-item:hover {
          background: var(--bg-primary);
          color: var(--color-accent);
        }
        .initials-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          font-family: var(--font-headers);
        }
        .nav-wallet-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-round);
          background: rgba(255, 107, 139, 0.1);
          border: 1px solid rgba(255, 107, 139, 0.25);
          color: var(--color-accent);
          font-family: var(--font-headers);
          font-weight: 700;
          font-size: 13px;
          transition: all var(--transition-fast);
          cursor: pointer;
        }
        .nav-wallet-pill:hover {
          background: rgba(255, 107, 139, 0.2);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .navbar-links {
            display: none;
          }
          .navbar-container {
            padding: 16px 20px;
          }
        }
      `}</style>

      <Link to="/" className="navbar-logo-link">
        <img src="/logo.jpg" alt="Keyshien Logo" className="navbar-brand-logo" />
        <span>Keyshien's Accessories</span>
      </Link>

      <ul className="navbar-links">
        {user && user.role === 'admin' ? (
          <>
            <li><Link to="/admin/dashboard" className="nav-link">Dashboard</Link></li>
            <li><Link to="/admin/products" className="nav-link">Products</Link></li>
            <li><Link to="/admin/categories" className="nav-link">Categories</Link></li>
            <li><Link to="/admin/orders" className="nav-link">Orders</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/shop" className="nav-link">Shop</Link></li>
            {user && <li><Link to="/orders" className="nav-link">My Orders</Link></li>}
          </>
        )}
      </ul>

      <div className="navbar-actions">
        {user && user.role !== 'admin' && (
          <Link to="/wallet" className="nav-wallet-pill" title="My Wallet Balance">
            <Wallet size={14} />
            <span>₱{Number(user.walletBalance || 0).toFixed(2)}</span>
          </Link>
        )}

        <Link to="/cart" className="action-icon-btn" title="View Cart">
          <ShoppingBag size={18} />
          {getCartCount() > 0 && <span className="cart-badge-count">{getCartCount()}</span>}
        </Link>

        {user ? (
          <div className="user-nav-dropdown" ref={dropdownRef}>
            <button
              className="action-icon-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="Account Menu"
              style={{ overflow: 'hidden' }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className="initials-avatar">{getInitials(user.name)}</div>
              )}
            </button>
            <div className={`user-nav-menu glass-panel ${dropdownOpen ? 'show' : ''}`}>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="dropdown-menu-item" onClick={() => setDropdownOpen(false)}>
                  <LayoutDashboard size={14} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link to="/profile" className="dropdown-menu-item" onClick={() => setDropdownOpen(false)}>
                <User size={14} />
                <span>My Profile</span>
              </Link>
              {user.role !== 'admin' && (
                <Link to="/wallet" className="dropdown-menu-item" onClick={() => setDropdownOpen(false)}>
                  <Wallet size={14} />
                  <span>My Wallet</span>
                </Link>
              )}
              <Link to="/shop" className="dropdown-menu-item" onClick={() => setDropdownOpen(false)}>
                <Store size={14} />
                <span>Browse Store</span>
              </Link>
              <hr style={{ border: '0', borderTop: '1px solid #ffccd5', margin: '6px 0' }} />
              <button
                onClick={handleLogout}
                className="dropdown-menu-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                <LogOut size={14} style={{ color: 'var(--color-danger)' }} />
                <span style={{ color: 'var(--color-danger)' }}>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
