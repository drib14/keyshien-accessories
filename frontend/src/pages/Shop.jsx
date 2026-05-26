import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';

const categories = [
  'All',
  'Rings',
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Hair Clips',
  'Bags',
  'Keychains',
];

const Shop = () => {
  const queryParams = new URLSearchParams(useLocation().search);
  const initialCategory = queryParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  // Trigger search whenever filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/products?`;
        
        if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
        if (category !== 'All') url += `category=${encodeURIComponent(category)}&`;
        if (minPrice) url += `minPrice=${minPrice}&`;
        if (maxPrice) url += `maxPrice=${maxPrice}&`;
        if (sort) url += `sort=${sort}&`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to search products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [keyword, category, minPrice, maxPrice, sort]);

  // Handle category coming from other pages after initial mount
  useEffect(() => {
    const newCat = queryParams.get('category');
    if (newCat) setCategory(newCat);
  }, [useLocation().search]);

  return (
    <div className="shop-page-container">
      <style>{`
        .shop-layout {
          display: flex;
          padding: 40px;
          gap: 40px;
        }
        .filter-sidebar {
          width: 260px;
          flex-shrink: 0;
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .filter-section-title {
          font-family: var(--font-headers);
          font-size: 15px;
          font-weight: 700;
          color: var(--color-dark);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .category-filter-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 30px;
        }
        .category-filter-item {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-muted);
          cursor: pointer;
          transition: all 0.2s;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
        }
        .category-filter-item:hover {
          color: var(--color-primary);
          background: rgba(255, 107, 139, 0.05);
        }
        .category-filter-item.active {
          color: var(--color-accent);
          background: rgba(255, 107, 139, 0.1);
          font-weight: 700;
        }
        .price-range-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 30px;
        }
        .price-input {
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
          background: var(--bg-primary);
          font-size: 13px;
          outline: none;
        }
        .price-input:focus {
          border-color: var(--color-primary);
        }
        .shop-results-container {
          flex-grow: 1;
        }
        .shop-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 20px;
        }
        .shop-search-bar {
          position: relative;
          max-width: 400px;
          width: 100%;
        }
        .shop-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted);
        }
        .shop-search-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1px solid var(--border-glass);
          background: var(--bg-glass);
          border-radius: var(--radius-round);
          color: var(--color-dark);
          outline: none;
          font-family: var(--font-body);
        }
        .shop-search-input:focus {
          border-color: var(--color-primary);
          background: #ffffff;
        }
        .sort-select {
          padding: 12px 20px;
          border-radius: var(--radius-round);
          border: 1px solid var(--border-glass);
          background: var(--bg-glass);
          color: var(--color-dark);
          outline: none;
          font-family: var(--font-headers);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }
        .sort-select:focus {
          border-color: var(--color-primary);
        }
        .no-results-panel {
          text-align: center;
          padding: 80px 40px;
          background: var(--bg-glass);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }
        @media (max-width: 992px) {
          .shop-layout {
            flex-direction: column;
            padding: 20px;
          }
          .filter-sidebar {
            width: 100%;
            position: relative;
            top: 0;
            margin-bottom: 20px;
          }
          .category-filter-list {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
          }
          .category-filter-item {
            padding: 6px 12px;
            border: 1px solid var(--border-glass);
          }
          .shop-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .shop-search-bar {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="page-header" style={{ padding: '40px 0 10px 0' }}>
        <h1 className="page-title">Explore Collection</h1>
        <p className="page-subtitle">Find your perfect accessory statement</p>
      </div>

      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar glass-panel">
          <h3 className="filter-section-title">
            <SlidersHorizontal size={14} style={{ color: 'var(--color-primary)' }} /> Filters
          </h3>
          
          <hr style={{ border: '0', borderTop: '1px solid #ffccd5', margin: '15px 0' }} />

          <h4 style={{ fontFamily: 'var(--font-headers)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--color-muted)', fontWeight: 700 }}>
            Categories
          </h4>
          <ul className="category-filter-list">
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-filter-item ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'All' ? 'All Accessories' : cat}
              </li>
            ))}
          </ul>

          <h4 style={{ fontFamily: 'var(--font-headers)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--color-muted)', fontWeight: 700 }}>
            Price Range (PHP)
          </h4>
          <div className="price-range-inputs">
            <input
              type="number"
              placeholder="Min"
              className="price-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span style={{ color: 'var(--color-muted)' }}>-</span>
            <input
              type="number"
              placeholder="Max"
              className="price-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '10px 0', fontSize: '12px' }}
            onClick={() => {
              setKeyword('');
              setCategory('All');
              setMinPrice('');
              setMaxPrice('');
              setSort('newest');
            }}
          >
            Reset Filters
          </button>
        </aside>

        {/* Catalog Products */}
        <main className="shop-results-container">
          <div className="shop-controls">
            <div className="shop-search-bar">
              <span className="shop-search-icon">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search accessories by name..."
                className="shop-search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">New Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Loader2 size={40} className="spinning-icon" style={{ margin: 'auto', color: 'var(--color-primary)', marginBottom: '16px' }} />
              <span style={{ color: 'var(--color-muted)', fontWeight: 600 }}>Filtering cute accessories...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="no-results-panel">
              <h3 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', marginBottom: '10px' }}>
                No Accessories Found
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                We couldn't find any products matching your active filters. Try resetting the criteria.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setKeyword('');
                  setCategory('All');
                  setMinPrice('');
                  setMaxPrice('');
                }}
              >
                Clear Search filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
