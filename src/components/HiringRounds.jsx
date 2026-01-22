import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './HiringRounds.css';

const HiringRounds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRound, setSelectedRound] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Dummy candidates data
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phone: '9876543210',
      collegeName: 'ABC Engineering College',
      branch: 'Computer Science',
      cgpa: 8.5,
      hiringRound: 'HR Round',
      hiringStatus: 'PENDING',
      hiringScore: 88,
      graduationYear: 2026
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '9876543211',
      collegeName: 'XYZ Institute of Technology',
      branch: 'Information Technology',
      cgpa: 8.8,
      hiringRound: 'Technical Round 2',
      hiringStatus: 'CLEARED',
      hiringScore: 92,
      graduationYear: 2026
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '9876543212',
      collegeName: 'DEF University',
      branch: 'Computer Science',
      cgpa: 7.9,
      hiringRound: 'Technical Round 1',
      hiringStatus: 'CLEARED',
      hiringScore: 78,
      graduationYear: 2026
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      phone: '9876543213',
      collegeName: 'GHI College',
      branch: 'Electronics',
      cgpa: 8.2,
      hiringRound: 'Aptitude Test',
      hiringStatus: 'PENDING',
      hiringScore: null,
      graduationYear: 2026
    },
    {
      id: 5,
      name: 'Vijay Singh',
      email: 'vijay.singh@example.com',
      phone: '9876543214',
      collegeName: 'ABC Engineering College',
      branch: 'Computer Science',
      cgpa: 9.1,
      hiringRound: 'Selected',
      hiringStatus: 'CLEARED',
      hiringScore: 96,
      graduationYear: 2026
    },
    {
      id: 6,
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      phone: '9876543215',
      collegeName: 'XYZ Institute of Technology',
      branch: 'Information Technology',
      cgpa: 8.6,
      hiringRound: 'HR Round',
      hiringStatus: 'CLEARED',
      hiringScore: 90,
      graduationYear: 2026
    },
    {
      id: 7,
      name: 'Rohan Gupta',
      email: 'rohan.gupta@example.com',
      phone: '9876543216',
      collegeName: 'JKL Engineering',
      branch: 'Mechanical',
      cgpa: 7.5,
      hiringRound: 'Technical Round 1',
      hiringStatus: 'REJECTED',
      hiringScore: 55,
      graduationYear: 2026
    },
    {
      id: 8,
      name: 'Neha Verma',
      email: 'neha.verma@example.com',
      phone: '9876543217',
      collegeName: 'MNO College',
      branch: 'Electronics',
      cgpa: 8.0,
      hiringRound: 'Technical Round 2',
      hiringStatus: 'PENDING',
      hiringScore: 82,
      graduationYear: 2026
    }
  ]);

  const [rounds, setRounds] = useState([
    { id: 1, name: 'Aptitude Test', order: 1, icon: '📝' },
    { id: 2, name: 'Technical Round 1', order: 2, icon: '💻' },
    { id: 3, name: 'Technical Round 2', order: 3, icon: '🔧' },
    { id: 4, name: 'HR Round', order: 4, icon: '👔' },
    { id: 5, name: 'Selected', order: 5, icon: '✅' }
  ]);

  // Mock candidate history
  const getCandidateHistory = (candidateId) => {
    const histories = {
      1: [
        {
          round: 'Aptitude Test',
          status: 'CLEARED',
          score: 85,
          feedback: 'Good logical reasoning and problem-solving skills. Strong performance in quantitative section.',
          date: '2026-01-10',
          interviewer: 'System Test',
          duration: '90 mins'
        },
        {
          round: 'Technical Round 1',
          status: 'CLEARED',
          score: 82,
          feedback: 'Solid understanding of data structures and algorithms. Good coding practices demonstrated.',
          date: '2026-01-15',
          interviewer: 'Rajesh Kumar',
          duration: '60 mins'
        },
        {
          round: 'Technical Round 2',
          status: 'CLEARED',
          score: 88,
          feedback: 'Excellent problem-solving approach. Strong grasp of system design concepts.',
          date: '2026-01-18',
          interviewer: 'Priya Sharma',
          duration: '60 mins'
        },
        {
          round: 'HR Round',
          status: 'PENDING',
          score: null,
          feedback: 'Scheduled for tomorrow',
          date: '2026-01-23',
          interviewer: 'Anita Desai',
          duration: 'Scheduled'
        }
      ],
      2: [
        {
          round: 'Aptitude Test',
          status: 'CLEARED',
          score: 92,
          feedback: 'Outstanding performance. Excellent analytical and reasoning skills.',
          date: '2026-01-09',
          interviewer: 'System Test',
          duration: '90 mins'
        },
        {
          round: 'Technical Round 1',
          status: 'CLEARED',
          score: 90,
          feedback: 'Very strong technical foundation. Excellent understanding of core concepts.',
          date: '2026-01-14',
          interviewer: 'Vikram Singh',
          duration: '60 mins'
        },
        {
          round: 'Technical Round 2',
          status: 'CLEARED',
          score: 92,
          feedback: 'Impressive coding skills and problem-solving abilities. Ready for next round.',
          date: '2026-01-19',
          interviewer: 'Meera Patel',
          duration: '60 mins'
        }
      ],
      3: [
        {
          round: 'Aptitude Test',
          status: 'CLEARED',
          score: 78,
          feedback: 'Decent performance. Could improve on time management.',
          date: '2026-01-11',
          interviewer: 'System Test',
          duration: '90 mins'
        },
        {
          round: 'Technical Round 1',
          status: 'CLEARED',
          score: 78,
          feedback: 'Good basic understanding. Needs more practice with advanced concepts.',
          date: '2026-01-16',
          interviewer: 'Amit Sharma',
          duration: '60 mins'
        }
      ],
      5: [
        {
          round: 'Aptitude Test',
          status: 'CLEARED',
          score: 95,
          feedback: 'Exceptional performance across all sections. Top scorer.',
          date: '2026-01-08',
          interviewer: 'System Test',
          duration: '90 mins'
        },
        {
          round: 'Technical Round 1',
          status: 'CLEARED',
          score: 94,
          feedback: 'Outstanding technical knowledge and problem-solving skills.',
          date: '2026-01-13',
          interviewer: 'Karthik Rao',
          duration: '60 mins'
        },
        {
          round: 'Technical Round 2',
          status: 'CLEARED',
          score: 96,
          feedback: 'Excellent system design skills. Strong candidate for complex projects.',
          date: '2026-01-17',
          interviewer: 'Divya Nair',
          duration: '60 mins'
        },
        {
          round: 'HR Round',
          status: 'CLEARED',
          score: 96,
          feedback: 'Great communication skills, team player, and cultural fit. Highly recommended.',
          date: '2026-01-20',
          interviewer: 'Anita Desai',
          duration: '45 mins'
        }
      ]
    };
    return histories[candidateId] || [];
  };

  const [statusUpdate, setStatusUpdate] = useState({
    round: '',
    status: 'CLEARED',
    feedback: '',
    score: ''
  });

  const handleUpdateStatus = (candidate, e) => {
    if (e) e.stopPropagation();
    setSelectedCandidate(candidate);
    setShowModal(true);
    setStatusUpdate({
      round: '',
      status: 'CLEARED',
      feedback: '',
      score: ''
    });
  };

  const handleRowClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowHistoryModal(true);
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    
    // Update candidate in the dummy data
    const updatedCandidates = candidates.map(c => {
      if (c.id === selectedCandidate.id) {
        return {
          ...c,
          hiringRound: statusUpdate.round,
          hiringStatus: statusUpdate.status,
          hiringScore: statusUpdate.score ? parseInt(statusUpdate.score) : c.hiringScore
        };
      }
      return c;
    });
    
    setCandidates(updatedCandidates);
    setShowModal(false);
    setSelectedCandidate(null);
    
    if (statusUpdate.round === 'Selected' && statusUpdate.status === 'CLEARED') {
      alert(`${selectedCandidate.name} has been selected! Congratulations!`);
    }
  };

  const getRoundBadge = (round) => {
    const roundMap = {
      'Aptitude Test': 'badge-info',
      'Technical Round 1': 'badge-primary',
      'Technical Round 2': 'badge-primary',
      'HR Round': 'badge-warning',
      'Selected': 'badge-success',
      'Rejected': 'badge-danger'
    };
    return roundMap[round] || 'badge-secondary';
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      'CLEARED': '✅',
      'PENDING': '⏳',
      'REJECTED': '❌',
      'ON_HOLD': '⏸️'
    };
    return statusMap[status] || '📋';
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.collegeName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRound = selectedRound === 'all' || candidate.hiringRound === selectedRound;
    return matchesSearch && matchesRound;
  });

  const getStatsByRound = (roundName) => {
    return candidates.filter(c => c.hiringRound === roundName).length;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Hiring Rounds Management</h1>
            <p className="page-subtitle">Track candidates through recruitment pipeline</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              📊 Hiring Report
            </button>
            <button className="btn btn-primary" onClick={() => alert('Bulk import feature coming soon!')}>
              📥 Import Candidates
            </button>
          </div>
        </header>

        {/* Hiring Pipeline Stats */}
        <div className="hiring-pipeline">
          {rounds.map(round => (
            <div key={round.id} className="pipeline-stage">
              <div className="stage-icon">{round.icon}</div>
              <div className="stage-name">{round.name}</div>
              <div className="stage-count">{getStatsByRound(round.name)}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="filters-row">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>Round:</label>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="form-input"
              >
                <option value="all">All Rounds</option>
                {rounds.map(round => (
                  <option key={round.id} value={round.name}>{round.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>College</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Current Round</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <div style={{ color: '#666' }}>No candidates found</div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(candidate => (
                  <tr 
                    key={candidate.id}
                    onClick={() => handleRowClick(candidate)}
                    style={{ cursor: 'pointer' }}
                    className="hoverable-row"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar">{candidate.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{candidate.name}</div>
                          <div style={{ fontSize: '13px', color: '#666' }}>{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{candidate.collegeName || 'N/A'}</td>
                    <td>{candidate.branch || 'N/A'}</td>
                    <td>
                      <span className="cgpa-badge">{candidate.cgpa || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge ${getRoundBadge(candidate.hiringRound)}`}>
                        {candidate.hiringRound || 'Not Started'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '20px' }}>
                        {getStatusIcon(candidate.hiringStatus || 'PENDING')}
                      </span>
                      <span style={{ marginLeft: '8px' }}>
                        {candidate.hiringStatus || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      {candidate.hiringScore ? (
                        <span className="score-badge">{candidate.hiringScore}%</span>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => handleUpdateStatus(candidate, e)}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Update Status Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Hiring Status</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              
              <form onSubmit={handleSubmitUpdate}>
                <div className="modal-body">
                  <div className="candidate-info">
                    <div className="avatar-large">{selectedCandidate?.name.charAt(0)}</div>
                    <div>
                      <h3>{selectedCandidate?.name}</h3>
                      <p>{selectedCandidate?.collegeName}</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Round *</label>
                    <select
                      className="form-input"
                      value={statusUpdate.round}
                      onChange={(e) => setStatusUpdate({...statusUpdate, round: e.target.value})}
                      required
                    >
                      <option value="">Choose round...</option>
                      {rounds.map(round => (
                        <option key={round.id} value={round.name}>{round.icon} {round.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                      className="form-input"
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                      required
                    >
                      <option value="CLEARED">✅ Cleared</option>
                      <option value="PENDING">⏳ Pending</option>
                      <option value="REJECTED">❌ Rejected</option>
                      <option value="ON_HOLD">⏸️ On Hold</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Score (Optional)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter score (0-100)"
                      value={statusUpdate.score}
                      onChange={(e) => setStatusUpdate({...statusUpdate, score: e.target.value})}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Feedback</label>
                    <textarea
                      className="form-input"
                      rows="4"
                      placeholder="Enter feedback or comments..."
                      value={statusUpdate.feedback}
                      onChange={(e) => setStatusUpdate({...statusUpdate, feedback: e.target.value})}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Candidate History Modal */}
        {showHistoryModal && selectedCandidate && (
          <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
            <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="avatar-large">{selectedCandidate.name.charAt(0)}</div>
                  <div>
                    <h2 style={{ margin: 0 }}>{selectedCandidate.name}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>{selectedCandidate.email}</p>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setShowHistoryModal(false)}>✕</button>
              </div>
              
              <div className="modal-body">
                <div className="candidate-summary">
                  <div className="summary-item">
                    <span className="summary-label">🏫 College</span>
                    <span className="summary-value">{selectedCandidate.collegeName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">🎓 Branch</span>
                    <span className="summary-value">{selectedCandidate.branch}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">📊 CGPA</span>
                    <span className="summary-value">{selectedCandidate.cgpa}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">📞 Phone</span>
                    <span className="summary-value">{selectedCandidate.phone}</span>
                  </div>
                </div>

                <div className="history-section">
                  <h3 className="history-title">📋 Recruitment Journey</h3>
                  {getCandidateHistory(selectedCandidate.id).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                      <div>No recruitment history available yet</div>
                    </div>
                  ) : (
                    <div className="timeline">
                      {getCandidateHistory(selectedCandidate.id).map((history, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-marker">
                            <div className={`timeline-dot ${history.status.toLowerCase()}`}></div>
                            {index < getCandidateHistory(selectedCandidate.id).length - 1 && (
                              <div className="timeline-line"></div>
                            )}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <h4 className="timeline-round">{history.round}</h4>
                              <span className={`badge ${history.status === 'CLEARED' ? 'badge-success' : history.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                                {getStatusIcon(history.status)} {history.status}
                              </span>
                            </div>
                            <div className="timeline-details">
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <span className="detail-label">📅 Date</span>
                                  <span className="detail-value">{new Date(history.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">👤 Interviewer</span>
                                  <span className="detail-value">{history.interviewer}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">⏱️ Duration</span>
                                  <span className="detail-value">{history.duration}</span>
                                </div>
                                {history.score && (
                                  <div className="detail-item">
                                    <span className="detail-label">📊 Score</span>
                                    <span className="detail-value">
                                      <span className="score-badge">{history.score}%</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                              {history.feedback && (
                                <div className="feedback-box">
                                  <strong>💬 Feedback:</strong>
                                  <p>{history.feedback}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowHistoryModal(false)}>
                  Close
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={(e) => {
                    setShowHistoryModal(false);
                    handleUpdateStatus(selectedCandidate, e);
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HiringRounds;
