import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Settings.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    documentUpload: true,
    offerGenerated: true,
    internOnboarding: true,
    collegeVisit: false
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        department: parsedUser.department || '',
        designation: parsedUser.designation || ''
      });
    }
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Notification settings saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const renderProfile = () => (
    <div className="settings-section">
      <h3 className="section-title">Profile Information</h3>
      <p className="section-subtitle">Update your account profile information</p>
      
      <form onSubmit={handleProfileUpdate}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              value={profileData.department}
              onChange={(e) => setProfileData({...profileData, department: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Designation</label>
          <input
            type="text"
            className="form-input"
            value={profileData.designation}
            onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );

  const renderSecurity = () => (
    <div className="settings-section">
      <h3 className="section-title">Change Password</h3>
      <p className="section-subtitle">Ensure your account is using a strong password</p>
      
      <form onSubmit={handlePasswordUpdate}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-input"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-input"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );

  const renderNotifications = () => (
    <div className="settings-section">
      <h3 className="section-title">Notification Preferences</h3>
      <p className="section-subtitle">Manage how you receive notifications</p>
      
      <form onSubmit={handleNotificationUpdate}>
        <div className="notification-group">
          <h4>General Notifications</h4>
          <div className="toggle-item">
            <div>
              <strong>Email Notifications</strong>
              <p>Receive notifications via email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="toggle-item">
            <div>
              <strong>SMS Notifications</strong>
              <p>Receive notifications via SMS</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="notification-group">
          <h4>Activity Notifications</h4>
          <div className="toggle-item">
            <div>
              <strong>Document Upload</strong>
              <p>Get notified when interns upload documents</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.documentUpload}
                onChange={(e) => setNotificationSettings({...notificationSettings, documentUpload: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="toggle-item">
            <div>
              <strong>Offer Generated</strong>
              <p>Get notified when offer letters are generated</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.offerGenerated}
                onChange={(e) => setNotificationSettings({...notificationSettings, offerGenerated: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="toggle-item">
            <div>
              <strong>Intern Onboarding</strong>
              <p>Get notified about intern onboarding updates</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.internOnboarding}
                onChange={(e) => setNotificationSettings({...notificationSettings, internOnboarding: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="toggle-item">
            <div>
              <strong>College Visit</strong>
              <p>Get notified about upcoming college visits</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.collegeVisit}
                onChange={(e) => setNotificationSettings({...notificationSettings, collegeVisit: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your account settings and preferences</p>
          </div>
        </header>

        {successMessage && (
          <div className="alert alert-success">
            ✓ {successMessage}
          </div>
        )}

        <div className="settings-container">
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button 
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
            <button 
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'notifications' && renderNotifications()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
