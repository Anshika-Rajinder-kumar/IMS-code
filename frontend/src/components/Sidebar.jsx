import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-circle-small">W</div>
          <span className="sidebar-title">Wissen IMS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className={`nav-item ${isActive('/dashboard')}`}>
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/colleges'); }} className={`nav-item ${isActive('/colleges')}`}>
          <span className="nav-icon">🏫</span>
          <span>Colleges</span>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/interns'); }} className={`nav-item ${isActive('/interns')}`}>
          <span className="nav-icon">👥</span>
          <span>Interns</span>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/documents'); }} className={`nav-item ${isActive('/documents')}`}>
          <span className="nav-icon">📁</span>
          <span>Documents</span>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/offers'); }} className={`nav-item ${isActive('/offers')}`}>
          <span className="nav-icon">📄</span>
          <span>Offer Letters</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">📈</span>
          <span>Reports</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user.name.charAt(0)}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.userType.toUpperCase()}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
