import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card-wrapper glass-panel glass-panel-hover">
      <style>{`
        .product-card-wrapper {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          height: 100%;
        }
        .product-card-image-container {
          position: relative;
          width: 100%;
          padding-top: 100%; /* 1:1 Aspect Ratio */
          overflow: hidden;
          background: #faf2f4;
        }
        .product-card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .product-card-wrapper:hover .product-card-image {
          transform: scale(1.08);
        }
        .product-card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid var(--border-glass);
          color: var(--color-primary-hover);
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: var(--radius-round);
          text-transform: uppercase;
        }
        .product-card-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .product-card-category {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        .product-card-name {
          font-family: var(--font-headers);
          font-size: 16px;
          font-weight: 700;
          color: var(--color-dark);
          margin-bottom: 8px;
          line-height: 1.3;
          height: 42px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .product-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #ffb703;
          margin-bottom: 12px;
        }
        .product-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }
        .product-card-price {
          font-family: var(--font-headers);
          font-size: 18px;
          font-weight: 800;
          color: var(--color-accent);
        }
        .product-card-cart-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 8px rgba(255, 107, 139, 0.2);
        }
        .product-card-cart-btn:hover {
          background: var(--color-accent);
          transform: scale(1.1);
        }
        .product-card-cart-btn.disabled {
          background: #e0d0d3;
          color: #a09093;
          box-shadow: none;
          cursor: not-allowed;
        }
      `}</style>

      <div className="product-card-image-container">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'}
          alt={product.name}
          className="product-card-image"
        />
        <div className="product-card-badge">{product.category}</div>
      </div>

      <div className="product-card-info">
        <span className="product-card-category">{product.category}</span>
        <h4 className="product-card-name">{product.name}</h4>
        
        <div className="product-card-rating">
          <Star size={12} fill="#ffb703" style={{ color: '#ffb703' }} />
          <span>{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
          <span style={{ color: 'var(--color-muted)', fontWeight: 4 }}>
            ({product.numReviews})
          </span>
        </div>

        <div className="product-card-bottom">
          <span className="product-card-price">₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="product-card-cart-btn"
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>
          ) : (
            <button
              disabled
              className="product-card-cart-btn disabled"
              title="Out of Stock"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
