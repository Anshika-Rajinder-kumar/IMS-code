import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalInterns: 0,
    totalOffers: 0,
    activeInterns: 0
  });
  const [recentInterns, setRecentInterns] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const dashboardStats = await api.getDashboardStats();
      setStats(dashboardStats);

      // Fetch recent interns (limit to 5)
      const allInterns = await api.getInterns();
      const sortedInterns = allInterns
        .sort((a, b) => new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt))
        .slice(0, 5);
      setRecentInterns(sortedInterns);

      // Fetch upcoming college visits
      const colleges = await api.getColleges();
      const plannedColleges = colleges
        .filter(c => c.status === 'SCHEDULED' && c.visitDate)
        .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))
        .slice(0, 3);
      setUpcomingVisits(plannedColleges);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayStats = [
    { title: 'Total Interns', value: stats.totalInterns || '0', change: '+12%', icon: '👥', color: '#3b82f6' },
    { title: 'Active Interns', value: stats.activeInterns || '0', change: '+5', icon: '📋', color: '#10b981' },
    { title: 'Total Colleges', value: stats.totalColleges || '0', change: '+3', icon: '🏫', color: '#f59e0b' },
    { title: 'Offers Generated', value: stats.totalOffers || '0', change: '+18', icon: '📄', color: '#8b5cf6' },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      'DOCUMENT_PENDING': 'badge-danger',
      'DOCUMENT_VERIFICATION': 'badge-warning',
      'DOCUMENT_VERIFIED': 'badge-success',
      'INTERVIEW_SCHEDULED': 'badge-info',
      'OFFER_GENERATED': 'badge-success',
      'ONBOARDING': 'badge-info',
      'ACTIVE': 'badge-success',
      'COMPLETED': 'badge-secondary',
      'TERMINATED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

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
          {displayStats.map((stat, index) => (
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInterns.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No interns found. Add your first intern to get started!
                      </td>
                    </tr>
                  ) : (
                    recentInterns.map(intern => (
                      <tr key={intern.id}>
                        <td><strong>{intern.name}</strong></td>
                        <td>{intern.collegeName || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(intern.status)}`}>
                            {formatStatus(intern.status)}
                          </span>
                        </td>
                        <td>{formatDate(intern.appliedDate || intern.createdAt)}</td>
                        <td>
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => navigate('/interns')}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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
              {upcomingVisits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No upcoming visits scheduled
                </div>
              ) : (
                upcomingVisits.map((visit, index) => (
                  <div key={index} className="visit-item">
                    <div className="visit-icon">🏫</div>
                    <div className="visit-details">
                      <div className="visit-college">{visit.name}</div>
                      <div className="visit-meta">
                        <span>📅 {formatDate(visit.visitDate)}</span>
                        <span>•</span>
                        <span>👤 {visit.coordinator || 'TBA'}</span>
                        <span>•</span>
                        <span>📍 {visit.location}</span>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/colleges')}>Details</button>
                  </div>
                ))
              )}
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
