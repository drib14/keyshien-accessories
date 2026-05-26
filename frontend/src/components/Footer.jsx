import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <style>{`
        .footer-container {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-glass);
          padding: 40px 40px 20px 40px;
          text-align: center;
          margin-top: auto;
          position: relative;
          z-index: 10;
        }
        .footer-logo {
          font-family: var(--font-headers);
          font-weight: 800;
          font-size: 20px;
          color: var(--color-dark);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .footer-tagline {
          font-size: 13px;
          color: var(--color-muted);
          margin-bottom: 24px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        .footer-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          list-style: none;
          margin-bottom: 30px;
        }
        .footer-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-muted);
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--color-primary);
        }
        .footer-copy {
          font-size: 11px;
          color: var(--color-muted);
          border-top: 1px solid #f9ecef;
          padding-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
      `}</style>

      <div className="footer-logo">
        <Heart size={16} fill="var(--color-primary)" style={{ color: 'var(--color-primary)' }} />
        <span>Keyshien Accessories</span>
      </div>
      
      <p className="footer-tagline">
        Elevate your everyday style with our exquisite handpicked rings, premium necklaces, earrings, and hair accessories curated in soft rose harmony.
      </p>

      <ul className="footer-links">
        <li><a href="/shop" className="footer-link">Explore Shop</a></li>
        <li><a href="/profile" className="footer-link">My Account</a></li>
        <li><a href="/orders" className="footer-link">Order Status</a></li>
      </ul>

      <div className="footer-copy">
        <span>&copy; {new Date().getFullYear()} Keyshien Accessories. Crafted with</span>
        <Heart size={10} fill="var(--color-accent)" style={{ color: 'var(--color-accent)' }} />
        <span>in the Philippines.</span>
      </div>
    </footer>
  );
};

export default Footer;
