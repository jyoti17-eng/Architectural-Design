import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || 'architect',
    preferences: {
      theme: user?.preferences?.theme || 'light',
      units: user?.preferences?.units || 'metric'
    }
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/api/users/profile', profile);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/users/password', {
        currentPassword: e.target.currentPassword.value,
        newPassword: e.target.newPassword.value
      });
      toast.success('Password updated successfully!');
      e.target.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Profile Settings</h1>
      </header>

      <main className="dashboard-content">
        <div style={{ 
          borderBottom: '1px solid #e2e8f0', 
          marginBottom: '24px',
          display: 'flex',
          gap: '24px'
        }}>
          {['profile', 'password', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 0',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
                color: activeTab === tab ? '#667eea' : '#64748b',
                fontWeight: activeTab === tab ? '600' : '400',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="projects-section">
            <h3 style={{ marginBottom: '24px' }}>Profile Information</h3>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Role
                </label>
                <select
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="architect">Architect</option>
                  <option value="engineer">Engineer</option>
                  <option value="designer">Designer</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Theme
                  </label>
                  <select
                    value={profile.preferences.theme}
                    onChange={(e) => setProfile({
                      ...profile, 
                      preferences: {...profile.preferences, theme: e.target.value}
                    })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Units
                  </label>
                  <select
                    value={profile.preferences.units}
                    onChange={(e) => setProfile({
                      ...profile, 
                      preferences: {...profile.preferences, units: e.target.value}
                    })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="projects-section">
            <h3 style={{ marginBottom: '24px' }}>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                  required
                  minLength="6"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="projects-section">
            <h3 style={{ marginBottom: '24px' }}>Your Statistics</h3>
            {stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.projects.reduce((sum, p) => sum + p.count, 0)}</div>
                  <div className="stat-label">Total Projects</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.designs.reduce((sum, d) => sum + d.count, 0)}</div>
                  <div className="stat-label">Total Designs</div>
                </div>
                {stats.projects.map((project, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-number">{project.count}</div>
                    <div className="stat-label">{project._id} Projects</div>
                  </div>
                ))}
                {stats.designs.map((design, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-number">{design.count}</div>
                    <div className="stat-label">{design._id} Designs</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                Loading statistics...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;


