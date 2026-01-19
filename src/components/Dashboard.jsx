import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const stats = [
    { title: 'Total Interns', value: '145', change: '+12%', icon: '👥', color: '#3b82f6' },
    { title: 'Active Onboarding', value: '28', change: '+5', icon: '📋', color: '#10b981' },
    { title: 'Colleges Visited', value: '32', change: '+3', icon: '🏫', color: '#f59e0b' },
    { title: 'Offers Generated', value: '89', change: '+18', icon: '📄', color: '#8b5cf6' },
  ];

  const recentInterns = [
    { id: 1, name: 'Rahul Sharma', college: 'IIT Delhi', status: 'Document Verification', date: '2026-01-15' },
    { id: 2, name: 'Priya Patel', college: 'BITS Pilani', status: 'Offer Generated', date: '2026-01-14' },
    { id: 3, name: 'Amit Kumar', college: 'NIT Trichy', status: 'Onboarding', date: '2026-01-13' },
    { id: 4, name: 'Sneha Reddy', college: 'VIT Vellore', status: 'Interview Scheduled', date: '2026-01-12' },
    { id: 5, name: 'Vikram Singh', college: 'IIT Bombay', status: 'Document Pending', date: '2026-01-11' },
  ];

  const upcomingVisits = [
    { college: 'IIT Madras', date: '2026-01-25', coordinator: 'Dr. Agarwal', slots: 50 },
    { college: 'Anna University', date: '2026-01-28', coordinator: 'Prof. Menon', slots: 40 },
    { college: 'SRM Institute', date: '2026-02-02', coordinator: 'Ms. Priya', slots: 60 },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      'Document Verification': 'badge-warning',
      'Offer Generated': 'badge-success',
      'Onboarding': 'badge-info',
      'Interview Scheduled': 'badge-secondary',
      'Document Pending': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-circle-small">W</div>
            <span className="sidebar-title">Wissen IMS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/colleges'); }} className="nav-item">
            <span className="nav-icon">🏫</span>
            <span>Colleges</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/interns'); }} className="nav-item">
            <span className="nav-icon">👥</span>
            <span>Interns</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/documents'); }} className="nav-item">
            <span className="nav-icon">📁</span>
            <span>Documents</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/offers'); }} className="nav-item">
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

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user.name}! Here's what's happening today.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              📥 Export Report
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/interns')}>
              ➕ Add Intern
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                <span style={{ fontSize: '32px' }}>{stat.icon}</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">{stat.title}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change positive">{stat.change} from last month</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Recent Interns */}
          <div className="card dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Recent Interns</h2>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/interns'); }} className="view-all-link">View All →</a>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>College</th>
                    <th>Status</th>
                    <th>Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInterns.map(intern => (
                    <tr key={intern.id}>
                      <td><strong>{intern.name}</strong></td>
                      <td>{intern.college}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(intern.status)}`}>
                          {intern.status}
                        </span>
                      </td>
                      <td>{intern.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming College Visits */}
          <div className="card dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Upcoming College Visits</h2>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/colleges'); }} className="view-all-link">Manage →</a>
            </div>
            <div className="visits-list">
              {upcomingVisits.map((visit, index) => (
                <div key={index} className="visit-item">
                  <div className="visit-icon">🏫</div>
                  <div className="visit-details">
                    <div className="visit-college">{visit.college}</div>
                    <div className="visit-meta">
                      <span>📅 {visit.date}</span>
                      <span>•</span>
                      <span>👤 {visit.coordinator}</span>
                      <span>•</span>
                      <span>🪑 {visit.slots} slots</span>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm">Details</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/colleges')}>
              <span className="action-icon">🏫</span>
              <span className="action-label">Add College Visit</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/interns')}>
              <span className="action-icon">👤</span>
              <span className="action-label">Register Intern</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/documents')}>
              <span className="action-icon">📄</span>
              <span className="action-label">Verify Documents</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/offers')}>
              <span className="action-icon">✉️</span>
              <span className="action-label">Generate Offer</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
