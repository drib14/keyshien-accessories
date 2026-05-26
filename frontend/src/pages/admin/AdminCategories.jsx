import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, DollarSign, Plus, Edit2, Trash2, X, Upload, Loader2, FolderOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../context/AuthContext';

const AdminCategories = () => {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  // Loader states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddDrawer = () => {
    setEditingCategory(null);
    setName('');
    setImage('');
    setError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setImage(cat.image);
    setError('');
    setIsDrawerOpen(true);
  };

  // Cloudinary image uploader calling /api/upload/single
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setImage(data.url);
      } else {
        setError(data.message || 'Image upload failed. Ensure files are images under 5MB.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Connection failed during Cloudinary upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      setError('Please provide a category name and upload a cover image.');
      return;
    }

    setSaveLoading(true);
    setError('');

    try {
      let url = `${API_URL}/categories`;
      let method = 'POST';

      if (editingCategory) {
        url = `${API_URL}/categories/${editingCategory._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, image }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDrawerOpen(false);
        fetchCategories(); // Reload listings
      } else {
        setError(data.message || 'Failed to save category.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to contact database.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category? Products inside this category will remain, but filters will change.')) return;

    try {
      const response = await fetch(`${API_URL}/categories/${catId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCategories(); // Reload listings
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-categories-container">
      <style>{`
        .categories-grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .categories-grid-table th, .categories-grid-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid var(--border-glass);
        }
        .categories-grid-table th {
          font-family: var(--font-headers);
          font-weight: 700;
          color: var(--color-dark);
          text-transform: uppercase;
          font-size: 11px;
        }
        .category-thumb-preview {
          width: 50px;
          height: 50px;
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
          width: 100%;
          height: 140px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-glass);
        }
        .media-preview-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
        <h1 className="page-title">Manage Categories</h1>
        <p className="page-subtitle">Configure dynamic collections and category graphics</p>
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
          <Link to="/admin/categories" className="admin-menu-item active">
            <FolderOpen size={16} />
            <span>Manage Categories</span>
          </Link>
          <Link to="/admin/orders" className="admin-menu-item">
            <DollarSign size={16} />
            <span>Manage Orders</span>
          </Link>
        </nav>

        {/* Main Grid */}
        <main className="admin-main-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '18px', color: 'var(--color-dark)' }}>
              Accessories Categories
            </h3>
            <button className="btn btn-primary" onClick={openAddDrawer} style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Plus size={14} /> Add Category
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Loader2 size={32} className="spinning-icon" style={{ margin: 'auto', color: 'var(--color-primary)', marginBottom: '16px' }} />
              <span style={{ color: 'var(--color-muted)' }}>Loading active categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', color: 'var(--color-muted)' }}>
              <span>No categories defined. Click "Add Category" to create your first dynamic category.</span>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="categories-grid-table">
                <thead>
                  <tr>
                    <th>Cover Photo</th>
                    <th>Category Name</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td>
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&q=80'}
                          alt={cat.name}
                          className="category-thumb-preview"
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-dark)' }}>{cat.name}</td>
                      <td style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                        {new Date(cat.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => openEditDrawer(cat)}
                            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px' }}
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeleteCategory(cat._id)}
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
                {editingCategory ? 'Edit Category Details' : 'Add New Category'}
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

            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rings, Necklaces, Hair Clips"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Functional Cloudinary Image Uploader */}
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label">Category Cover Image</label>

                <div className="media-uploader-box" onClick={() => document.getElementById('cloudinary-file-input').click()}>
                  <Upload size={24} style={{ color: 'var(--color-primary)', margin: 'auto', marginBottom: '8px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)', display: 'block' }}>
                    {uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Cover Image'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>JPEG, PNG files under 5MB</span>

                  <input
                    type="file"
                    id="cloudinary-file-input"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </div>

                {image && (
                  <div className="media-preview-row">
                    <div className="media-preview-thumbnail">
                      <img src={image} alt="Thumbnail preview" />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saveLoading || uploadingImage}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: '15px' }}
              >
                {saveLoading ? <Loader2 size={16} className="spinning-icon" /> : <>Save Category Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
