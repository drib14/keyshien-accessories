import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products?sort=newest`);
        if (response.ok) {
          const data = await response.json();
          // Take first 4 for featured grid
          setFeaturedProducts(data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch products for home:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <style>{`
        .hero-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 80px 40px;
          gap: 40px;
          position: relative;
        }
        .hero-content {
          max-width: 550px;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 107, 139, 0.1);
          color: var(--color-accent);
          font-family: var(--font-headers);
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: var(--radius-round);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }
        .hero-title {
          font-size: 56px;
          font-weight: 800;
          color: var(--color-dark);
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .hero-title span {
          background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          color: var(--color-muted);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .hero-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .hero-image-panel {
          position: relative;
          width: 460px;
          height: 460px;
          flex-shrink: 0;
        }
        .hero-img-backdrop {
          position: absolute;
          width: 85%;
          height: 85%;
          bottom: 0;
          left: 0;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
          transform: rotate(-5deg);
        }
        .hero-img-main {
          position: absolute;
          width: 85%;
          height: 85%;
          top: 0;
          right: 0;
          border-radius: var(--radius-lg);
          object-fit: cover;
          box-shadow: var(--shadow-lg);
          border: 4px solid #ffffff;
        }
        .hero-floating-card {
          position: absolute;
          bottom: 30px;
          right: -20px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .categories-section {
          padding: 60px 40px;
          text-align: center;
        }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-top: 35px;
        }
        .category-card {
          position: relative;
          height: 240px;
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
        }
        .category-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s;
        }
        .category-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(43, 14, 21, 0.7) 10%, rgba(43, 14, 21, 0) 60%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
          text-align: left;
        }
        .category-title {
          font-family: var(--font-headers);
          font-size: 20px;
          color: #ffffff;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .category-count {
          color: var(--color-secondary);
          font-size: 12px;
          font-weight: 500;
        }
        .category-card:hover .category-img {
          transform: scale(1.08);
        }
        .featured-section {
          padding: 60px 40px;
        }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          padding: 40px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
        }
        .feature-item {
          text-align: center;
          padding: 20px;
        }
        .feature-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          color: var(--color-accent);
        }
        .feature-title {
          font-family: var(--font-headers);
          font-size: 16px;
          font-weight: 700;
          color: var(--color-dark);
          margin-bottom: 6px;
        }
        .feature-desc {
          font-size: 12px;
          color: var(--color-muted);
          line-height: 1.5;
        }
        @media (max-width: 992px) {
          .hero-section {
            flex-direction: column;
            text-align: center;
            padding: 40px 20px;
          }
          .hero-buttons {
            justify-content: center;
          }
          .hero-image-panel {
            width: 320px;
            height: 320px;
          }
          .category-grid {
            grid-template-columns: 1fr;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={12} />
            <span>Premium Handcrafted Jewels</span>
          </div>
          <h1 className="hero-title">
            Charming Accessories for Your <span>Everyday Sparkle</span>
          </h1>
          <p className="hero-desc">
            Discover a curated collection of dreamy rose-gold necklaces, aesthetic earrings, and cute hand-designed accessories designed to make you feel beautiful every single day.
          </p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary">
              Browse Collection <ArrowRight size={16} />
            </Link>
            <Link to="/shop?category=Necklaces" className="btn btn-secondary">
              View Necklaces
            </Link>
          </div>
        </div>

        <div className="hero-image-panel">
          <div className="hero-img-backdrop"></div>
          <img
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
            alt="Accessories"
            className="hero-img-main"
          />
          <div className="hero-floating-card glass-panel">
            <div style={{ background: 'var(--color-primary)', width: 10, height: 10, borderRadius: '50%' }}></div>
            <div style={{ fontFamily: 'var(--font-headers)', fontSize: 12, fontWeight: 700 }}>
              💖 20% Off Storewide
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="features-grid">
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Truck size={20} />
          </div>
          <h4 className="feature-title">Fast Shipping</h4>
          <p className="feature-desc">Prompt nationwide delivery straight to your doorstep.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <ShieldCheck size={20} />
          </div>
          <h4 className="feature-title">Secure Checkout</h4>
          <p className="feature-desc">Fully encrypted payments powered by Paymongo.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Sparkles size={20} />
          </div>
          <h4 className="feature-title">Premium Quality</h4>
          <p className="feature-desc">All products are handcrafted with absolute attention to detail.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <RefreshCw size={20} />
          </div>
          <h4 className="feature-title">Easy Returns</h4>
          <p className="feature-desc">7-day hassle-free replacement on item defects.</p>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="categories-section">
        <h2 className="page-title" style={{ fontSize: '32px' }}>Shop by Category</h2>
        <p className="page-subtitle">Handpicked accessories grouped by your style statement</p>
        
        <div className="category-grid">
          <Link to="/shop?category=Rings" className="category-card glass-panel">
            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80"
              alt="Rings"
              className="category-img"
            />
            <div className="category-overlay">
              <h3 className="category-title">Elegant Rings</h3>
              <span className="category-count">Explore Collection</span>
            </div>
          </Link>
          <Link to="/shop?category=Necklaces" className="category-card glass-panel">
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80"
              alt="Necklaces"
              className="category-img"
            />
            <div className="category-overlay">
              <h3 className="category-title">Charming Necklaces</h3>
              <span className="category-count">Explore Collection</span>
            </div>
          </Link>
          <Link to="/shop?category=Earrings" className="category-card glass-panel">
            <img
              src="https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&q=80"
              alt="Earrings"
              className="category-img"
            />
            <div className="category-overlay">
              <h3 className="category-title">Pastel Earrings</h3>
              <span className="category-count">Explore Collection</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <div>
            <h2 className="page-title" style={{ fontSize: '32px', textAlign: 'left' }}>New Arrivals</h2>
            <p className="page-subtitle" style={{ textAlign: 'left' }}>Fresh accessories just uploaded to our store</p>
          </div>
          <Link to="/shop" className="btn btn-secondary">
            View All Store <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Loading new items...</span>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--color-muted)' }}>No products in catalog yet. Visit Admin Dashboard to add some!</p>
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
