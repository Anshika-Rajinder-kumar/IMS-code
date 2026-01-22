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

  // Role-based navigation items
  const getNavigationItems = () => {
    const userType = user.userType?.toUpperCase();
    
    if (userType === 'ADMIN' || userType === 'HR') {
      return [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/colleges', icon: '🏫', label: 'Colleges' },
        { path: '/hiring-rounds', icon: '🎯', label: 'Hiring Rounds' },
        { path: '/interns', icon: '👥', label: 'Interns' },
        { path: '/documents', icon: '📁', label: 'Documents' },
        { path: '/offers', icon: '📄', label: 'Offer Letters' },
        { path: '/reports', icon: '📈', label: 'Reports' },
        { path: '/settings', icon: '⚙️', label: 'Settings' }
      ];
    } else if (userType === 'COLLEGE') {
      return [
        { path: '/students', icon: '👨‍🎓', label: 'Students' },
        { path: '/hiring-status', icon: '📋', label: 'Hiring Status' },
        { path: '/settings', icon: '⚙️', label: 'Settings' }
      ];
    } else if (userType === 'INTERN') {
      return [
        { path: '/learning', icon: '📚', label: 'My Learning' },
        { path: '/documents', icon: '📁', label: 'My Documents' },
        { path: '/offer', icon: '📄', label: 'My Offer' },
        { path: '/settings', icon: '⚙️', label: 'Settings' }
      ];
    }
    
    return [];
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-circle-small">W</div>
          <span className="sidebar-title">Wissen IMS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {getNavigationItems().map((item) => (
          <a 
            key={item.path}
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate(item.path); }} 
            className={`nav-item ${isActive(item.path)}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
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
