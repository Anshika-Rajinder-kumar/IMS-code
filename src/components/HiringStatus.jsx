import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './HiringStatus.css';

const HiringStatus = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRound, setFilterRound] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock student data
  const [students, setStudents] = useState([
    { 
      id: 1, 
      name: 'Rahul Kumar', 
      email: 'rahul.kumar@student.com', 
      phone: '9876543210',
      branch: 'Computer Science', 
      cgpa: 8.5, 
      graduationYear: 2026, 
      currentRound: 'HR Round',
      status: 'CLEARED',
      score: 92,
      appliedDate: '2026-01-10',
      lastUpdated: '2026-01-20'
    },
    { 
      id: 2, 
      name: 'Priya Sharma', 
      email: 'priya.sharma@student.com', 
      phone: '9876543211',
      branch: 'Information Technology', 
      cgpa: 8.8, 
      graduationYear: 2026, 
      currentRound: 'Technical Round 2',
      status: 'PENDING',
      score: 85,
      appliedDate: '2026-01-12',
      lastUpdated: '2026-01-21'
    },
    { 
      id: 3, 
      name: 'Amit Patel', 
      email: 'amit.patel@student.com', 
      phone: '9876543212',
      branch: 'Computer Science', 
      cgpa: 7.9, 
      graduationYear: 2026, 
      currentRound: 'Technical Round 1',
      status: 'CLEARED',
      score: 78,
      appliedDate: '2026-01-08',
      lastUpdated: '2026-01-18'
    },
    { 
      id: 4, 
      name: 'Sneha Reddy', 
      email: 'sneha.reddy@student.com', 
      phone: '9876543213',
      branch: 'Electronics', 
      cgpa: 8.2, 
      graduationYear: 2026, 
      currentRound: 'Aptitude Test',
      status: 'PENDING',
      score: null,
      appliedDate: '2026-01-15',
      lastUpdated: '2026-01-22'
    },
    { 
      id: 5, 
      name: 'Vijay Singh', 
      email: 'vijay.singh@student.com', 
      phone: '9876543214',
      branch: 'Computer Science', 
      cgpa: 9.1, 
      graduationYear: 2026, 
      currentRound: 'Selected',
      status: 'CLEARED',
      score: 96,
      appliedDate: '2026-01-05',
      lastUpdated: '2026-01-19'
    },
    { 
      id: 6, 
      name: 'Ananya Iyer', 
      email: 'ananya.iyer@student.com', 
      phone: '9876543215',
      branch: 'Information Technology', 
      cgpa: 8.6, 
      graduationYear: 2026, 
      currentRound: 'HR Round',
      status: 'PENDING',
      score: 88,
      appliedDate: '2026-01-11',
      lastUpdated: '2026-01-21'
    },
    { 
      id: 7, 
      name: 'Rohan Gupta', 
      email: 'rohan.gupta@student.com', 
      phone: '9876543216',
      branch: 'Mechanical', 
      cgpa: 7.5, 
      graduationYear: 2026, 
      currentRound: 'Technical Round 1',
      status: 'REJECTED',
      score: 55,
      appliedDate: '2026-01-09',
      lastUpdated: '2026-01-17'
    },
    { 
      id: 8, 
      name: 'Neha Verma', 
      email: 'neha.verma@student.com', 
      phone: '9876543217',
      branch: 'Electronics', 
      cgpa: 8.0, 
      graduationYear: 2026, 
      currentRound: 'Technical Round 2',
      status: 'CLEARED',
      score: 82,
      appliedDate: '2026-01-13',
      lastUpdated: '2026-01-20'
    },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'CLEARED': { class: 'badge-success', icon: '✅' },
      'PENDING': { class: 'badge-warning', icon: '⏳' },
      'REJECTED': { class: 'badge-danger', icon: '❌' },
      'ON_HOLD': { class: 'badge-secondary', icon: '⏸️' }
    };
    return statusMap[status] || { class: 'badge-secondary', icon: '📋' };
  };

  const getRoundColor = (round) => {
    const colorMap = {
      'Aptitude Test': '#3b82f6',
      'Technical Round 1': '#8b5cf6',
      'Technical Round 2': '#6366f1',
      'HR Round': '#f59e0b',
      'Selected': '#10b981',
      'Rejected': '#ef4444'
    };
    return colorMap[round] || '#6b7280';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesRound = filterRound === 'all' || student.currentRound === filterRound;
    return matchesSearch && matchesStatus && matchesRound;
  });

  const rounds = ['Aptitude Test', 'Technical Round 1', 'Technical Round 2', 'HR Round', 'Selected', 'Rejected'];

  const stats = {
    total: students.length,
    selected: students.filter(s => s.currentRound === 'Selected').length,
    pending: students.filter(s => s.status === 'PENDING').length,
    rejected: students.filter(s => s.status === 'REJECTED').length
  };

  const viewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">📋 Student Hiring Status</h1>
            <p className="page-subtitle">Track your students' progress through the recruitment pipeline</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={() => navigate('/students')}>
              ➕ Add Student
            </button>
            <button className="btn btn-primary">
              📥 Export Report
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon-box">👥</div>
            <div className="stat-details">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-icon-box">✅</div>
            <div className="stat-details">
              <div className="stat-value">{stats.selected}</div>
              <div className="stat-label">Selected</div>
            </div>
          </div>
          <div className="stat-card stat-card-yellow">
            <div className="stat-icon-box">⏳</div>
            <div className="stat-details">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card stat-card-red">
            <div className="stat-icon-box">❌</div>
            <div className="stat-details">
              <div className="stat-value">{stats.rejected}</div>
              <div className="stat-label">Not Selected</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card filters-card">
          <div className="filters-container">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filters-group">
              <select
                value={filterRound}
                onChange={(e) => setFilterRound(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Rounds</option>
                {rounds.map(round => (
                  <option key={round} value={round}>{round}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="CLEARED">Cleared</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="students-grid">
          {filteredStudents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No students found</div>
              <div className="empty-subtitle">Try adjusting your search or filters</div>
            </div>
          ) : (
            filteredStudents.map(student => {
              const statusBadge = getStatusBadge(student.status);
              return (
                <div key={student.id} className="student-card">
                  <div className="student-header">
                    <div className="student-avatar">
                      {student.name.charAt(0)}
                    </div>
                    <div className="student-info">
                      <h3 className="student-name">{student.name}</h3>
                      <p className="student-email">{student.email}</p>
                    </div>
                  </div>
                  
                  <div className="student-details">
                    <div className="detail-row">
                      <span className="detail-icon">🎓</span>
                      <span className="detail-text">{student.branch}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📊</span>
                      <span className="detail-text">CGPA: <strong>{student.cgpa}</strong></span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">Class of {student.graduationYear}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📞</span>
                      <span className="detail-text">{student.phone}</span>
                    </div>
                  </div>

                  <div className="student-status-section">
                    <div className="current-round" style={{ borderColor: getRoundColor(student.currentRound) }}>
                      <span className="round-label">Current Round</span>
                      <span className="round-name" style={{ color: getRoundColor(student.currentRound) }}>
                        {student.currentRound}
                      </span>
                    </div>
                    
                    <div className="status-row">
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.icon} {student.status}
                      </span>
                      {student.score && (
                        <span className="score-badge">
                          {student.score}%
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    className="view-details-btn"
                    onClick={() => viewDetails(student)}
                  >
                    View Details →
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {showModal && selectedStudent && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              
              <div className="modal-header">
                <div className="modal-avatar">{selectedStudent.name.charAt(0)}</div>
                <div>
                  <h2 className="modal-title">{selectedStudent.name}</h2>
                  <p className="modal-subtitle">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="modal-body">
                <div className="info-section">
                  <h3 className="section-title">📚 Academic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Branch</span>
                      <span className="info-value">{selectedStudent.branch}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">CGPA</span>
                      <span className="info-value">{selectedStudent.cgpa}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Graduation Year</span>
                      <span className="info-value">{selectedStudent.graduationYear}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{selectedStudent.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3 className="section-title">🎯 Recruitment Status</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Current Round</span>
                      <span className="info-value" style={{ color: getRoundColor(selectedStudent.currentRound) }}>
                        {selectedStudent.currentRound}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className={`status-badge ${getStatusBadge(selectedStudent.status).class}`}>
                        {getStatusBadge(selectedStudent.status).icon} {selectedStudent.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Score</span>
                      <span className="info-value">{selectedStudent.score ? `${selectedStudent.score}%` : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Applied Date</span>
                      <span className="info-value">{new Date(selectedStudent.appliedDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3 className="section-title">⏱️ Timeline</h3>
                  <div className="timeline-item">
                    <span className="timeline-dot"></span>
                    <div>
                      <div className="timeline-title">Last Updated</div>
                      <div className="timeline-date">{new Date(selectedStudent.lastUpdated).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HiringStatus;
