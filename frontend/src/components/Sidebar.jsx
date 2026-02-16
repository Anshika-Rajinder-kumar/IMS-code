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
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/colleges', label: 'Colleges' },
        { path: '/admin/course-project-pool', label: 'Courses / Projects' },
        { path: '/admin/learning-assignment', label: 'Assign Courses' },
        { path: '/admin/automated-assignment', label: 'Automated Assignment' },
        { path: '/intern-performance', label: 'Intern Performance' },
        { path: '/hiring-rounds', label: 'Hiring Rounds' },
        { path: '/interns', label: 'Interns' },
        { path: '/admin/attendance', label: 'Attendance Overview' },
        { path: '/documents', label: 'Documents' },
        { path: '/offers', label: 'Offer Letters' },

        { path: '/settings', label: 'Settings' }
      ];
    } else if (userType === 'COLLEGE') {
      return [
        { path: '/students', label: 'Students' },
        { path: '/bulk-upload', label: 'Bulk Upload' },
        { path: '/hiring-status', label: 'Hiring Status' },
        { path: '/settings', label: 'Settings' }
      ];
    } else if (userType === 'INTERN') {
      return [
        { path: '/my-projects', label: 'My Projects' },
        { path: '/attendance', label: 'Attendance' },
        { path: '/my-courses', label: 'My Courses' },
        { path: '/documents', label: 'My Documents' },
        { path: '/offer', label: 'My Offer' },
        { path: '/settings', label: 'Settings' }
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
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
