import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import api from '../services/api';
import Toast from './Toast';
import './HiringStatus.css';

const HiringStatus = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRound, setFilterRound] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiringHistory, setHiringHistory] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchStudents(parsedUser);
    }
  }, []);

  const fetchStudents = async (userData) => {
    try {
      setLoading(true);
      // Fetch both candidates and interns
      const candidatesData = await api.getCandidates();
      const internsData = await api.getInterns();

      // Combine and remove duplicates based on email (interns take precedence)
      const emailMap = new Map();

      // Add candidates first
      candidatesData.forEach(candidate => {
        emailMap.set(candidate.email, { ...candidate, type: 'candidate' });
      });

      // Override with interns (they are the latest/selected version)
      internsData.forEach(intern => {
        emailMap.set(intern.email, { ...intern, type: 'intern' });
      });

      // Convert back to array
      const combined = Array.from(emailMap.values());

      // Filter by college if college user
      const filteredData = userData.userType === 'COLLEGE' && userData.collegeName
        ? combined.filter(student => student.collegeName && student.collegeName === userData.collegeName)
        : combined;

      setStudents(filteredData);
    } catch (error) {
      console.error('Error fetching students:', error);
      setToast({ message: 'Failed to load students: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'CLEARED': { class: 'badge-success', icon: '' },
      'PENDING': { class: 'badge-warning', icon: '' },
      'REJECTED': { class: 'badge-danger', icon: '' },
      'ON_HOLD': { class: 'badge-secondary', icon: '' }
    };
    return statusMap[status] || { class: 'badge-secondary', icon: '' };
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
    const matchesStatus = filterStatus === 'all' || student.hiringStatus === filterStatus;
    const matchesRound = filterRound === 'all' || student.hiringRound === filterRound;
    return matchesSearch && matchesStatus && matchesRound;
  });

  const rounds = ['Aptitude Test', 'Technical Round 1', 'Technical Round 2', 'HR Round', 'Selected', 'Rejected'];

  const viewDetails = async (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    // Fetch hiring history based on student type
    try {
      if (student.type === 'intern' || student.status === 'ACTIVE' || student.status === 'ONBOARDING' || student.joinDate) {
        // It's an intern - fetch by intern ID
        const history = await api.getHiringRoundsByInternId(student.id);
        setHiringHistory(history);
      } else {
        // It's a candidate - fetch by candidate ID
        const history = await api.getCandidateHiringRoundsByCandidateId(student.id);
        setHiringHistory(history);
      }
    } catch (error) {
      console.error('Error fetching hiring history:', error);
      setHiringHistory([]);
    }
  };

  const stats = {
    total: students.length,
    selected: students.filter(s => s.hiringRound === 'Selected').length,
    pending: students.filter(s => s.hiringStatus === 'PENDING').length,
    rejected: students.filter(s => s.hiringStatus === 'REJECTED').length
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Sidebar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
            <div className="stat-details">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-details">
              <div className="stat-value">{stats.selected}</div>
              <div className="stat-label">Selected</div>
            </div>
          </div>
          <div className="stat-card stat-card-yellow">
            <div className="stat-details">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card stat-card-red">
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
                      <span className="detail-text">{student.branch}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-text">CGPA: <strong>{student.cgpa}</strong></span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-text">Class of {student.graduationYear || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-text">{student.phone}</span>
                    </div>
                  </div>

                  <div className="student-status-section">
                    <div className="current-round" style={{ borderColor: getRoundColor(student.hiringRound) }}>
                      <span className="round-label">Current Round</span>
                      <span className="round-name" style={{ color: getRoundColor(student.hiringRound) }}>
                        {student.hiringRound || 'Not Started'}
                      </span>
                    </div>

                    <div className="status-row">
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.icon} {student.hiringStatus || 'NOT_STARTED'}
                      </span>
                      {student.hiringScore && (
                        <span className="score-badge">
                          {student.hiringScore}%
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
                  <h3 className="section-title"> Recruitment Status</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Current Round</span>
                      <span className="info-value" style={{ color: getRoundColor(selectedStudent.hiringRound) }}>
                        {selectedStudent.hiringRound || 'Not Started'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className={`status-badge ${getStatusBadge(selectedStudent.hiringStatus).class}`}>
                        {getStatusBadge(selectedStudent.hiringStatus).icon} {selectedStudent.hiringStatus || 'NOT_STARTED'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Score</span>
                      <span className="info-value">{selectedStudent.hiringScore ? `${selectedStudent.hiringScore}%` : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Applied Date</span>
                      <span className="info-value">{selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3 className="section-title">⏱️ Hiring Timeline</h3>
                  {hiringHistory.length === 0 ? (
                    <div className="timeline-item">
                      <span className="timeline-dot"></span>
                      <div>
                        <div className="timeline-title">No hiring rounds yet</div>
                        <div className="timeline-date">Application received on {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
                      </div>
                    </div>
                  ) : (
                    hiringHistory.map((round, index) => (
                      <div key={round.id} className="timeline-item">
                        <span className="timeline-dot" style={{ backgroundColor: round.status === 'CLEARED' ? '#10b981' : round.status === 'REJECTED' ? '#ef4444' : '#f59e0b' }}></span>
                        <div>
                          <div className="timeline-title">{round.roundName}</div>
                          <div className="timeline-date">
                            {round.completedAt ? new Date(round.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                          </div>
                          <div className="timeline-details">
                            <span className={`status-badge ${getStatusBadge(round.status).class}`}>
                              {getStatusBadge(round.status).icon} {round.status}
                            </span>
                            {round.score && <span className="score-badge">{round.score}%</span>}
                          </div>
                          {round.feedback && (
                            <div className="timeline-feedback">
                              <em>"{round.feedback}"</em>
                            </div>
                          )}
                          {round.interviewer && (
                            <div className="timeline-interviewer">
                              👤 {round.interviewer}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
