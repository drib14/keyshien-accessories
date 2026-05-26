import React, { useState } from 'react';
import { User, Lock, Save, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [loading, setLoading] = useState(false);
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
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.value);
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
          gap: 20px;
          margin-bottom: 30px;
        }
        .profile-avatar-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--color-primary);
          background: #f0f0f0;
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
            <img src={avatar || 'https://res.cloudinary.com/dwquuisuj/image/upload/v1700000000/default_avatar.png'} alt="Avatar" className="profile-avatar-preview" />
            <div style={{ flexGrow: 1 }}>
              <label className="form-label">Avatar Image URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={handleAvatarChange}
              />
            </div>
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
            disabled={loading}
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
