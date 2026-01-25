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
  const [candidates, setCandidates] = useState([]);
  const [hiringHistory, setHiringHistory] = useState([]);

  const [rounds] = useState([
    { id: 1, name: 'Aptitude Test', order: 1, icon: '📝' },
    { id: 2, name: 'Technical Round 1', order: 2, icon: '💻' },
    { id: 3, name: 'Technical Round 2', order: 3, icon: '🔧' },
    { id: 4, name: 'HR Round', order: 4, icon: '👔' },
    { id: 5, name: 'Selected', order: 5, icon: '✅' }
  ]);

  const [statusUpdate, setStatusUpdate] = useState({
    round: '',
    status: 'CLEARED',
    feedback: '',
    score: ''
  });

  // Fetch candidates and interns from backend
  useEffect(() => {
    fetchCandidatesAndInterns();
  }, []);

  const fetchCandidatesAndInterns = async () => {
    try {
      setLoading(true);
      // Fetch both candidates and interns
      const candidatesData = await api.getCandidates();
      const internsData = await api.getInterns();
      
      // Filter out SELECTED candidates (they've been converted to interns)
      // Only show candidates who are still in the recruitment pipeline
      const activeCandidates = candidatesData.filter(c => c.status !== 'SELECTED');
      
      // Mark candidates with type for distinction
      const markedCandidates = activeCandidates.map(c => ({ ...c, type: 'CANDIDATE' }));
      const markedInterns = internsData.map(i => ({ ...i, type: 'INTERN' }));
      
      // Combine both lists
      const combined = [...markedCandidates, ...markedInterns];
      setCandidates(combined);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load candidates: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hiring history for a candidate
  const fetchHiringHistory = async (internId) => {
    try {
      setLoading(true);
      const data = await api.getHiringRoundsByInternId(internId);
      setHiringHistory(data);
    } catch (error) {
      console.error('Error fetching hiring history:', error);
      alert('Failed to load hiring history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRowClick = async (candidate) => {
    setSelectedCandidate(candidate);
    setShowHistoryModal(true);
    // Fetch history based on type
    if (candidate.type === 'INTERN') {
      await fetchHiringHistory(candidate.id);
    } else {
      // Fetch candidate hiring round history
      try {
        setLoading(true);
        const data = await api.getCandidateHiringRoundsByCandidateId(candidate.id);
        setHiringHistory(data);
      } catch (error) {
        console.error('Error fetching candidate history:', error);
        setHiringHistory([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const isCandidate = selectedCandidate.type === 'CANDIDATE';
      
      // For candidates, update candidate status
      if (isCandidate) {
        // If marking as "Selected" with status "CLEARED", convert to intern
        if (statusUpdate.round === 'Selected' && statusUpdate.status === 'CLEARED') {
          const joinDate = prompt('Candidate will be converted to intern. Enter join date (YYYY-MM-DD):');
          if (!joinDate) {
            setLoading(false);
            return;
          }
          
          // Convert candidate to intern
          const newIntern = await api.convertCandidateToIntern(selectedCandidate.id, joinDate);
          
          // Update the new intern's hiring status to Selected/CLEARED
          await api.updateInternHiringStatus(
            newIntern.id,
            statusUpdate.round,
            statusUpdate.status,
            statusUpdate.score ? Number.parseFloat(statusUpdate.score) : null
          );
          
          alert('Candidate converted to intern successfully! Credentials sent via email.');
          
          // Refresh the list and close modal
          await fetchCandidatesAndInterns();
          setShowModal(false);
          setSelectedCandidate(null);
          setLoading(false);
          return;
        }
        
        // For other statuses, just update the candidate
        // Map hiring status - keep the actual round status (ON_HOLD, CLEARED, etc.)
        let candidateStatus = 'APPLIED';
        if (statusUpdate.round.includes('Aptitude')) candidateStatus = 'SCREENING';
        else if (statusUpdate.round.includes('Technical') || statusUpdate.round.includes('HR')) candidateStatus = 'INTERVIEWING';
        else if (statusUpdate.status === 'REJECTED') candidateStatus = 'REJECTED';
        
        // Create or update candidate hiring round entry
        const candidateRound = {
          candidate: { 
            id: selectedCandidate.id,
            name: selectedCandidate.name,
            email: selectedCandidate.email
          },
          roundName: statusUpdate.round,
          status: statusUpdate.status,
          score: statusUpdate.score ? Number.parseFloat(statusUpdate.score) : null,
          feedback: statusUpdate.feedback || '',
          interviewer: localStorage.getItem('userName') || 'Admin',
          scheduledAt: new Date().toISOString(),
          completedAt: statusUpdate.status !== 'PENDING' && statusUpdate.status !== 'ON_HOLD' ? new Date().toISOString() : null
        };

        try {
          await api.createOrUpdateCandidateHiringRound(candidateRound);
        } catch (error) {
          console.error('Error creating hiring round:', error);
          // Continue even if history creation fails
        }
        
        await api.updateCandidate(selectedCandidate.id, {
          ...selectedCandidate,
          hiringRound: statusUpdate.round,
          hiringStatus: statusUpdate.status, // Use the actual status (ON_HOLD, CLEARED, PENDING, etc.)
          hiringScore: statusUpdate.score ? Number.parseFloat(statusUpdate.score) : selectedCandidate.hiringScore,
          status: candidateStatus
        });
        
        await fetchCandidatesAndInterns();
        setShowModal(false);
        setSelectedCandidate(null);
        alert('Candidate status updated successfully!');
        setLoading(false);
        return;
      }

      // For interns, create or update hiring round
      const newRound = {
        intern: { id: selectedCandidate.id },
        roundName: statusUpdate.round,
        status: statusUpdate.status,
        score: statusUpdate.score ? parseFloat(statusUpdate.score) : null,
        feedback: statusUpdate.feedback,
        interviewer: localStorage.getItem('userName') || 'Admin',
        scheduledAt: new Date().toISOString(),
        completedAt: statusUpdate.status !== 'PENDING' ? new Date().toISOString() : null
      };

      await api.createOrUpdateHiringRound(newRound);

      // Update intern's hiring status
      await api.updateInternHiringStatus(
        selectedCandidate.id,
        statusUpdate.round,
        statusUpdate.status,
        statusUpdate.score ? parseFloat(statusUpdate.score) : null
      );

      // Refresh the candidates list
      await fetchCandidatesAndInterns();
      
      setShowModal(false);
      setSelectedCandidate(null);
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    } finally {
      setLoading(false);
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
                <th>Type</th>
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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
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
                    <td>
                      {candidate.type === 'CANDIDATE' ? (
                        <span className="badge badge-warning">👤 Candidate</span>
                      ) : (
                        <span className="badge badge-success">👥 Intern</span>
                      )}
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={(e) => handleUpdateStatus(candidate, e)}
                        >
                          Update Status
                        </button>
                        {candidate.type === 'CANDIDATE' && candidate.resumeUrl && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(api.getCandidateResumeUrl(candidate.id), '_blank');
                            }}
                          >
                            📄 View Resume
                          </button>
                        )}
                      </div>
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
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div>Loading history...</div>
                    </div>
                  ) : hiringHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                      <div>No recruitment history available yet</div>
                    </div>
                  ) : (
                    <div className="timeline">
                      {hiringHistory.map((history, index) => (
                        <div key={history.id} className="timeline-item">
                          <div className="timeline-marker">
                            <div className={`timeline-dot ${history.status.toLowerCase()}`}></div>
                            {index < hiringHistory.length - 1 && (
                              <div className="timeline-line"></div>
                            )}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <h4 className="timeline-round">{history.roundName}</h4>
                              <span className={`badge ${history.status === 'CLEARED' ? 'badge-success' : history.status === 'PENDING' || history.status === 'SCHEDULED' ? 'badge-warning' : 'badge-danger'}`}>
                                {getStatusIcon(history.status)} {history.status}
                              </span>
                            </div>
                            <div className="timeline-details">
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <span className="detail-label">📅 Date</span>
                                  <span className="detail-value">
                                    {history.completedAt 
                                      ? new Date(history.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : history.scheduledAt 
                                        ? new Date(history.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : 'Not scheduled'}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">👤 Interviewer</span>
                                  <span className="detail-value">{history.interviewer || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">⏱️ Duration</span>
                                  <span className="detail-value">{history.duration || 'N/A'}</span>
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
