import React, { useState } from 'react';
import { User, Lock, Save, Loader2, KeyRound, Upload } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserProfile = () => {
  const { user, token, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const profileData = { name, avatar };
      if (password) {
        profileData.password = password;
      }

      await updateProfile(profileData);
      setSuccess('Profile details saved successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

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
        setAvatar(data.url);
        setSuccess('Avatar photo uploaded successfully! Click "Save Settings Changes" to apply.');
      } else {
        setError(data.message || 'Avatar upload failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed during avatar upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-page-container">
      <style>{`
        .profile-layout {
          max-width: 600px;
          margin: 40px auto;
          padding: 40px;
        }
        .avatar-settings-row {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 30px;
        }
        .profile-avatar-preview {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--color-primary);
          box-shadow: var(--shadow-sm);
        }
        .profile-avatar-preview-initials {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 32px;
          font-family: var(--font-headers);
          border: 3px solid var(--color-primary);
          box-shadow: var(--shadow-sm);
        }
        .avatar-upload-btn-wrapper {
          position: relative;
          display: inline-block;
        }
      `}</style>

      <div className="page-header" style={{ padding: '40px 0 10px 0' }}>
        <h1 className="page-title">My Account Profile</h1>
        <p className="page-subtitle">Manage your personal settings and login details</p>
      </div>

      <div className="profile-layout glass-panel">
        {success && (
          <div style={{ color: 'var(--color-success)', padding: '10px 14px', background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ color: 'var(--color-danger)', padding: '10px 14px', background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="avatar-settings-row">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="profile-avatar-preview" />
            ) : (
              <div className="profile-avatar-preview-initials">
                {getInitials(name)}
              </div>
            )}
            
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label">Profile Avatar Image</label>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => document.getElementById('avatar-file-input').click()}
                  style={{ display: 'flex', gap: '6px', padding: '10px 16px', fontSize: '13px' }}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 size={14} className="spinning-icon" />
                  ) : (
                    <>
                      <Upload size={14} /> Upload Image File
                    </>
                  )}
                </button>
                <input
                  type="file"
                  id="avatar-file-input"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                
                <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>- or edit URL below -</span>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Avatar Image URL</label>
            <input
              type="text"
              className="form-control"
              placeholder="https://example.com/avatar.jpg"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input type="text" className="form-control" value={user?.email || ''} disabled style={{ background: '#f5eaed', cursor: 'not-allowed', color: 'var(--color-muted)' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #ffccd5', margin: '30px 0 20px 0' }} />
          <h3 style={{ fontFamily: 'var(--font-headers)', fontSize: '15px', color: 'var(--color-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={16} /> Security: Update Password (Optional)
          </h3>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Leave blank to keep current password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 0', fontSize: '15px' }}
          >
            {loading ? <Loader2 size={16} className="spinning-icon" /> : <>Save Settings Changes <Save size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
