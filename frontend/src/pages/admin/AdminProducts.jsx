import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, DollarSign, Plus, Edit2, Trash2, X, Upload, Loader2, FolderOpen, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../context/AuthContext';

const AdminProducts = () => {
  const { token } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer/Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  
  // Action state loaders
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        setDbCategories(data);
        if (data.length > 0 && !editingProduct) {
          setCategory(data[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAddDrawer = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory(dbCategories.length > 0 ? dbCategories[0].name : '');
    setImages([]);
    setError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setStock(product.stock);
    setCategory(product.category);
    setImages(product.images || []);
    setError('');
    setIsDrawerOpen(true);
  };

  // 100% active custom Cloudinary Image Uploader!
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setError('');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImages((prev) => [...prev, ...data.urls]);
      } else {
        setError(data.message || 'Image upload failed. Ensure files are images under 5MB.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Connection failed during upload.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !stock || images.length === 0) {
      setError('Please fill in all details and upload at least one image');
      return;
    }

    setSaveLoading(true);
    setError('');

    const payload = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      images,
    };

    try {
      let url = `${API_URL}/products`;
      let method = 'POST';

      if (editingProduct) {
        url = `${API_URL}/products/${editingProduct._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDrawerOpen(false);
        fetchProducts(); // Reload grid
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to contact product catalog database');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this accessory from catalog?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProducts(); // Reload grid
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-products-container">
      <style>{`
        .products-grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .products-grid-table th, .products-grid-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid var(--border-glass);
        }
        .products-grid-table th {
          font-family: var(--font-headers);
          font-weight: 700;
          color: var(--color-dark);
          text-transform: uppercase;
          font-size: 11px;
        }
        .product-thumb-preview {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          border: 1px solid var(--border-glass);
          background: #faf2f4;
        }
        /* Glassmorphic Slide-in Form Drawer */
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
          width: 460px;
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
        .drawer-close-btn {
          background: none;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
        }
        .media-uploader-box {
          border: 2px dashed var(--border-glass);
          border-radius: var(--radius-md);
          padding: 24px;
          text-align: center;
          background: var(--bg-primary);
          cursor: pointer;
          position: relative;
          transition: border-color 0.2s;
        }
        .media-uploader-box:hover {
          border-color: var(--color-primary);
        }
        .media-preview-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        .media-preview-thumbnail {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border-glass);
        }
        .media-preview-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-remove-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(0,0,0,0.6);
          color: #ffffff;
          border-radius: 50%;
          border: none;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 10px;
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
        <h1 className="page-title">Manage Products</h1>
        <p className="page-subtitle">Configure inventories, monitor sales, and manage checkouts</p>
      </div>

      <div className="admin-layout">
        {/* Navigation Sidebar */}
        <nav className="admin-sidebar glass-panel">
          <Link to="/admin/dashboard" className="admin-menu-item">
            <LayoutDashboard size={16} />
            <span>Overview Stats</span>
          </Link>
          <Link to="/admin/products" className="admin-menu-item active">
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

        {/* Main Grid */}
        <main className="admin-main-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)' }}>
              Accessories Grid Catalog
            </h3>
            <button className="btn btn-primary" onClick={openAddDrawer} style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Plus size={14} /> Add Product
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Loader2 size={32} className="spinning-icon" style={{ margin: 'auto', color: 'var(--color-primary)', marginBottom: '16px' }} />
              <span style={{ color: 'var(--color-muted)' }}>Syncing active catalog...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', color: 'var(--color-muted)' }}>
              <span>No accessories in catalog. Click "Add Product" to create your first listing.</span>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="products-grid-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&q=80'}
                          alt={product.name}
                          className="product-thumb-preview"
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-dark)' }}>{product.name}</td>
                      <td style={{ fontSize: '13px' }}>{product.category}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: product.stock === 0 ? 'var(--color-danger)' : 'inherit' }}>
                          {product.stock === 0 ? 'Out of stock' : `${product.stock} units`}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>⭐ {product.rating > 0 ? product.rating.toFixed(1) : 'New'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => openEditDrawer(product)}
                            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px' }}
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeleteProduct(product._id)}
                            style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--color-danger)', border: '1px solid rgba(244,67,54,0.2)', display: 'flex', gap: '4px' }}
                          >
                            <Trash2 size={11} style={{ color: 'var(--color-danger)' }} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Slide-in Add/Edit Drawer Panel */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 style={{ fontFamily: 'var(--font-headers)', color: 'var(--color-dark)', fontSize: '20px' }}>
                {editingProduct ? 'Edit Accessory Details' : 'Add New Accessory'}
              </h2>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600, marginBottom: '16px', padding: '10px', background: 'rgba(244,67,54,0.05)', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Accessory Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dreamy Rose Gold Heart Necklace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rings, Necklaces, Custom Crafts"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ width: '50%' }}>
                  <label className="form-label">Price (PHP)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ width: '50%' }}>
                  <label className="form-label">Stock Units</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide premium accessory description details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Functional Cloudinary Image Uploader */}
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label">Accessory Images</label>
                
                <div className="media-uploader-box" onClick={() => document.getElementById('cloudinary-file-input').click()}>
                  <Upload size={24} style={{ color: 'var(--color-primary)', margin: 'auto', marginBottom: '8px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)', display: 'block' }}>
                    {uploadingImages ? 'Uploading to Cloudinary...' : 'Upload Images'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>JPEG, PNG files under 5MB</span>
                  
                  <input
                    type="file"
                    id="cloudinary-file-input"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                </div>

                {images.length > 0 && (
                  <div className="media-preview-row">
                    {images.map((imgUrl, index) => (
                      <div key={index} className="media-preview-thumbnail">
                        <img src={imgUrl} alt="Thumbnail preview" />
                        <button type="button" className="media-remove-btn" onClick={() => removeImage(index)}>
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saveLoading || uploadingImages}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: '15px' }}
              >
                {saveLoading ? <Loader2 size={16} className="spinning-icon" /> : <>Save Accessory Listing Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
