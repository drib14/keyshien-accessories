import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Tag, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80');
  const [loading, setLoading] = useState(true);

  // Promo Carousel States
  const [promos, setPromos] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, categoriesRes, settingsRes, promosRes] = await Promise.all([
          fetch(`${API_URL}/products?sort=newest`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/settings/hero_image`),
          fetch(`${API_URL}/promocodes/active`)
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setFeaturedProducts(productsData.slice(0, 4));
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData && settingsData.value) {
            setHeroImage(settingsData.value);
          }
        }

        if (promosRes.ok) {
          const promosData = await promosRes.json();
          setPromos(promosData);
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Automatic slide rotation every 4.5 seconds if multiple exist
  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prevIndex) => (prevIndex + 1) % promos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [promos]);

  const handlePrevPromo = () => {
    setCurrentPromoIndex((prev) => (prev === 0 ? promos.length - 1 : prev - 1));
  };

  const handleNextPromo = () => {
    setCurrentPromoIndex((prev) => (prev === promos.length - 1 ? 0 : prev + 1));
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(''), 2000);
  };

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

        /* Promo Carousel Styling */
        .promo-carousel-section {
          padding: 60px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .promo-carousel-container {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 107, 139, 0.12) 100%);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 40px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 180px;
          box-shadow: var(--shadow-glass);
          transition: all 0.3s ease;
        }
        .promo-slide {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          animation: slideInFade 0.4s ease-in-out;
          gap: 30px;
        }
        .promo-info-col {
          flex-grow: 1;
          text-align: left;
        }
        .promo-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--color-accent);
          color: #ffffff;
          font-weight: 800;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          font-family: var(--font-headers);
        }
        .promo-headline {
          font-size: 32px;
          font-weight: 800;
          color: var(--color-dark);
          font-family: var(--font-headers);
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .promo-headline span {
          color: var(--color-accent);
        }
        .promo-subline {
          font-size: 13px;
          color: var(--color-muted);
          font-weight: 500;
          margin-bottom: 0;
        }
        .promo-action-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .coupon-cut-out {
          border: 2px dashed var(--color-primary);
          background: #ffffff;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-family: var(--font-headers);
          font-size: 20px;
          font-weight: 800;
          color: var(--color-dark);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          box-shadow: var(--shadow-sm);
        }
        .promo-copy-btn {
          font-size: 12px;
          padding: 8px 18px;
          font-weight: 700;
          border-radius: var(--radius-round);
          transition: all 0.2s;
        }
        .promo-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          color: var(--color-dark);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
          outline: none;
        }
        .promo-nav-btn:hover {
          background: var(--color-secondary);
          color: var(--color-accent);
          transform: translateY(-50%) scale(1.05);
        }
        .promo-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
        }
        .promo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 107, 139, 0.25);
          cursor: pointer;
          transition: all 0.2s;
        }
        .promo-dot.active {
          background: var(--color-accent);
          width: 20px;
          border-radius: 4px;
        }
        @keyframes slideInFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .promo-carousel-section {
            padding: 40px 20px;
          }
          .promo-carousel-container {
            padding: 30px 24px;
          }
          .promo-slide {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
          .promo-headline {
            font-size: 24px;
          }
          .promo-info-col {
            text-align: center;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={12} />
            <span>Premium Handcrafted Crafts</span>
          </div>
          <h1 className="hero-title">
            Dreamy Accessories & <span>Cute Handmade Crafts</span>
          </h1>
          <p className="hero-desc">
            Discover a curated collection of dreamy crocheted items, aesthetic charms, and cute hand-designed accessories crafted with absolute love and precision.
          </p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary">
              Explore Store <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn btn-secondary">
              View Catalog
            </Link>
          </div>
        </div>

        <div className="hero-image-panel">
          <div className="hero-img-backdrop"></div>
          <img
            src={heroImage}
            alt="Handmade Crafts"
            className="hero-img-main"
          />
          <div className="hero-floating-card glass-panel">
            <div style={{ background: 'var(--color-primary)', width: 10, height: 10, borderRadius: '50%' }}></div>
            <div style={{ fontFamily: 'var(--font-headers)', fontSize: 12, fontWeight: 700 }}>
              💖 Crafted With Love
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

      {/* Dynamic Promocodes Carousel */}
      {promos.length > 0 && (
        <section className="promo-carousel-section">
          <div className="promo-carousel-container glass-panel">
            {/* Left Nav Button */}
            {promos.length > 1 && (
              <button 
                onClick={handlePrevPromo} 
                className="promo-nav-btn" 
                style={{ left: '15px' }}
                aria-label="Previous promo"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {/* Current Slide */}
            <div className="promo-slide">
              <div className="promo-info-col">
                <div className="promo-badge-tag">
                  <Sparkles size={11} fill="rgba(255,255,255,0.2)" /> Active Campaign
                </div>
                <h3 className="promo-headline">
                  Get <span>{promos[currentPromoIndex].discountType === 'percentage' ? `${promos[currentPromoIndex].discountValue}%` : `₱${promos[currentPromoIndex].discountValue}`} OFF</span> Handcrafted Accessories
                </h3>
                <p className="promo-subline">
                  {promos[currentPromoIndex].minOrderAmount > 0 
                    ? `*Applicable for cart subtotal of ₱${promos[currentPromoIndex].minOrderAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} and above.`
                    : '*No minimum purchase required! Shop your handcrafted crafts now.'}
                </p>
              </div>

              <div className="promo-action-col">
                <div className="coupon-cut-out">
                  {promos[currentPromoIndex].code}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(promos[currentPromoIndex].code)}
                  className={`btn ${copiedCode === promos[currentPromoIndex].code ? 'btn-primary' : 'btn-secondary'} promo-copy-btn`}
                >
                  {copiedCode === promos[currentPromoIndex].code ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={13} /> Copied!
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Copy size={13} /> Copy Code
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Right Nav Button */}
            {promos.length > 1 && (
              <button 
                onClick={handleNextPromo} 
                className="promo-nav-btn" 
                style={{ right: '15px' }}
                aria-label="Next promo"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* Dots Indicator */}
          {promos.length > 1 && (
            <div className="promo-dots">
              {promos.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentPromoIndex(index)}
                  className={`promo-dot ${currentPromoIndex === index ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories Showcase */}
      <section className="categories-section">
        <h2 className="page-title" style={{ fontSize: '32px' }}>Shop by Category</h2>
        <p className="page-subtitle">Handpicked accessories grouped by your style statement</p>
        
        {categories.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px', marginTop: '20px', color: 'var(--color-muted)', textAlign: 'center' }}>
            <span>No categories defined yet. Log in as Admin to manage.</span>
          </div>
        ) : (
          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {categories.map((cat) => (
              <Link key={cat._id} to={`/shop?category=${encodeURIComponent(cat.name)}`} className="category-card glass-panel">
                <img
                  src={cat.image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80"}
                  alt={cat.name}
                  className="category-img"
                />
                <div className="category-overlay">
                  <h3 className="category-title">{cat.name}</h3>
                  <span className="category-count">Explore Collection</span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
