import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus, Send, ArrowLeft, ShieldCheck, Award } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
      } else {
        setError('Failed to load product details');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (action) => {
    if (!product) return;
    if (action === 'inc') {
      setQty((prev) => Math.min(prev + 1, product.stock));
    } else {
      setQty((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setReviewLoading(true);
    setReviewSuccess('');
    setReviewError('');

    try {
      const response = await fetch(`${API_URL}/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (response.ok) {
        setReviewSuccess('Thank you! Review added successfully.');
        setComment('');
        setRating(5);
        // Reload details to show review
        fetchProductDetails();
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      setReviewError('Failed to submit review due to system error');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Loading accessory details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-headers)' }}>{error || 'Accessory not found'}</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <style>{`
        .product-detail-layout {
          display: flex;
          padding: 40px;
          gap: 50px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .product-gallery {
          width: 50%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .main-image-wrapper {
          width: 100%;
          padding-top: 100%; /* Square */
          position: relative;
          background: #faf2f4;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-glass);
          box-shadow: var(--shadow-md);
        }
        .main-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumbnails-grid {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .thumbnail-card {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          background: #faf2f4;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }
        .thumbnail-card.active {
          border-color: var(--color-primary);
        }
        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-info-panel {
          width: 50%;
          display: flex;
          flex-direction: column;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--color-muted);
          margin-bottom: 20px;
        }
        .detail-category {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-primary-hover);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .detail-name {
          font-family: var(--font-headers);
          font-size: 32px;
          color: var(--color-dark);
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .detail-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .detail-price {
          font-family: var(--font-headers);
          font-size: 30px;
          font-weight: 800;
          color: var(--color-accent);
          margin-bottom: 24px;
        }
        .detail-desc {
          font-size: 15px;
          color: var(--color-muted);
          line-height: 1.7;
          margin-bottom: 30px;
        }
        .detail-stock-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
        }
        .qty-adjuster {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-round);
          overflow: hidden;
          background: var(--bg-glass);
        }
        .qty-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--color-dark);
          transition: background 0.2s;
        }
        .qty-btn:hover {
          background: var(--color-secondary);
        }
        .qty-value {
          width: 40px;
          text-align: center;
          font-family: var(--font-headers);
          font-weight: 700;
          font-size: 15px;
        }
        .stock-indicator {
          font-size: 13px;
          font-weight: 600;
        }
        .reviews-section {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 40px;
        }
        .reviews-layout {
          display: flex;
          gap: 40px;
          margin-top: 24px;
        }
        .reviews-list {
          width: 60%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .review-card {
          padding: 20px;
          border-radius: var(--radius-md);
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .review-user {
          font-family: var(--font-headers);
          font-weight: 700;
          font-size: 14px;
        }
        .review-date {
          font-size: 11px;
          color: var(--color-muted);
        }
        .review-comment {
          font-size: 13px;
          color: var(--color-dark);
          line-height: 1.5;
        }
        .add-review-panel {
          width: 40%;
          padding: 24px;
          height: fit-content;
        }
        .rating-select {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .star-rating-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #ffb703;
        }
        @media (max-width: 992px) {
          .product-detail-layout {
            flex-direction: column;
            padding: 20px;
          }
          .product-gallery, .product-info-panel {
            width: 100%;
          }
          .reviews-layout {
            flex-direction: column;
          }
          .reviews-list, .add-review-panel {
            width: 100%;
          }
        }
      `}</style>

      <div className="product-detail-layout">
        {/* Left Side Gallery */}
        <div className="product-gallery">
          <Link to="/shop" className="back-link">
            <ArrowLeft size={14} /> Back to Store
          </Link>
          
          <div className="main-image-wrapper">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'}
              alt={product.name}
              className="main-image"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="thumbnails-grid">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail-card ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt="Thumbnail" className="thumbnail-img" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Info */}
        <div className="product-info-panel">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-rating">
            <div style={{ display: 'flex', color: '#ffb703', gap: '2px' }}>
              <Star size={16} fill="#ffb703" style={{ color: '#ffb703' }} />
            </div>
            <span style={{ color: 'var(--color-dark)', fontWeight: 700 }}>
              {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
            </span>
            <span style={{ color: 'var(--color-muted)' }}>
              ({product.numReviews} customer reviews)
            </span>
          </div>

          <div className="detail-price">₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          
          <p className="detail-desc">{product.description}</p>

          <hr style={{ border: '0', borderTop: '1px solid #ffccd5', marginBottom: '24px' }} />

          <div className="detail-stock-row">
            {product.stock > 0 ? (
              <>
                <div className="qty-adjuster">
                  <button className="qty-btn" onClick={() => handleQtyChange('dec')}>
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => handleQtyChange('inc')}>
                    <Plus size={14} />
                  </button>
                </div>
                <span className="stock-indicator" style={{ color: 'var(--color-success)' }}>
                  In Stock ({product.stock} items left)
                </span>
              </>
            ) : (
              <span className="stock-indicator" style={{ color: 'var(--color-danger)', fontSize: '16px' }}>
                Out of Stock
              </span>
            )}
          </div>

          {product.stock > 0 ? (
            <button className="btn btn-primary" onClick={handleAddToCart} style={{ padding: '16px 0', fontSize: '15px' }}>
              <ShoppingCart size={18} /> Add to Cart Basket
            </button>
          ) : (
            <button className="btn btn-secondary" disabled style={{ padding: '16px 0', cursor: 'not-allowed', color: 'var(--color-muted)' }}>
              Sold Out
            </button>
          )}

          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-muted)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
              <span>100% Authentic Product</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-muted)' }}>
              <Award size={14} style={{ color: 'var(--color-primary)' }} />
              <span>Surgical Quality Steel / Silver</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section">
        <hr style={{ border: '0', borderTop: '1px solid #ffccd5', marginBottom: '40px' }} />
        <h2 className="page-title" style={{ fontSize: '28px', textAlign: 'left' }}>Customer Feedback</h2>
        <p className="page-subtitle" style={{ textAlign: 'left' }}>Read what others say about this jewelry</p>

        <div className="reviews-layout">
          {/* Reviews List */}
          <div className="reviews-list">
            {product.reviews.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
                <span>No reviews for this product yet. Be the first to share your experience!</span>
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="review-card glass-panel">
                  <div className="review-header">
                    <div>
                      <span className="review-user">{rev.name}</span>
                      <div style={{ display: 'flex', color: '#ffb703', gap: '2px', marginTop: '4px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? '#ffb703' : 'none'}
                            style={{ color: '#ffb703' }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Panel */}
          <div className="add-review-panel glass-panel">
            <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)', marginBottom: '16px' }}>
              Add a Review
            </h3>

            {user ? (
              <form onSubmit={handleReviewSubmit}>
                {reviewSuccess && (
                  <div style={{ color: 'var(--color-success)', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                    {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                    {reviewError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <div className="rating-select">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        className="star-rating-btn"
                        onClick={() => setRating(num)}
                      >
                        <Star size={20} fill={num <= rating ? '#ffb703' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="Write your honest thoughts about the accessory..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 0' }}
                >
                  {reviewLoading ? 'Submitting...' : <>Submit Feedback <Send size={14} /></>}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginBottom: '15px' }}>
                  You must be logged in to leave a product review.
                </p>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Login to Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
