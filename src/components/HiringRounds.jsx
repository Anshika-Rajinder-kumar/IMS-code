import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import Toast from './Toast';
import './HiringRounds.css';

const HiringRounds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRound, setSelectedRound] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [hiringHistory, setHiringHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRoundForFeedback, setSelectedRoundForFeedback] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Old modal states (keeping for backward compatibility with old modal code)
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    round: '',
    status: 'CLEARED',
    feedback: '',
    score: ''
  });

  const [rounds] = useState([
    { id: 1, name: 'Aptitude Test', order: 1, icon: '📝', color: '#3b82f6' },
    { id: 2, name: 'Technical Round 1', order: 2, icon: '💻', color: '#8b5cf6' },
    { id: 3, name: 'Technical Round 2', order: 3, icon: '🔧', color: '#6366f1' },
    { id: 4, name: 'HR Round', order: 4, icon: '👔', color: '#f59e0b' },
    { id: 5, name: 'Selected', order: 5, icon: '✅', color: '#10b981' }
  ]);

  const [feedbackForm, setFeedbackForm] = useState({
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
      setToast({ message: 'Failed to load candidates: ' + error.message, type: 'error' });
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
      setToast({ message: 'Failed to load hiring history: ' + error.message, type: 'error' });
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
    setLoadingHistory(true);
    setResumeUrl(null);

    try {
      // Fetch hiring history based on type
      let history;
      if (candidate.type === 'INTERN') {
        history = await api.getHiringRoundsByInternId(candidate.id);
      } else {
        history = await api.getCandidateHiringRoundsByCandidateId(candidate.id);
      }
      setHiringHistory(history);

      // Load resume URL for preview (API returns URL string, not blob)
      try {
        const url = api.getCandidateResumeUrl(candidate.id);
        setResumeUrl(url);
      } catch (error) {
        console.error('Error loading resume:', error);
        setResumeUrl(null);
      }
    } catch (error) {
      console.error('Error loading hiring history:', error);
      setHiringHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRoundClick = (round) => {
    // Check if any previous round was rejected
    const currentRoundIndex = rounds.findIndex(r => r.name === round.name);
    const previousRounds = rounds.slice(0, currentRoundIndex);
    const hasRejectedPrevious = previousRounds.some(r => {
      const roundData = hiringHistory.find(h => h.roundName === r.name);
      return roundData?.status === 'REJECTED';
    });

    if (hasRejectedPrevious) {
      setToast({ message: 'Cannot update this round. Previous round was rejected.', type: 'warning' });
      return;
    }

    // Find existing feedback for this round
    const existingRound = hiringHistory.find(h => h.roundName === round.name);
    
    setSelectedRoundForFeedback(round);
    setFeedbackForm({
      status: existingRound?.status || 'PENDING',
      feedback: existingRound?.feedback || '',
      score: existingRound?.score || ''
    });
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    try {
      setSubmittingFeedback(true);
      
      const isCandidate = selectedCandidate.type === 'CANDIDATE';
      
      // If marking as "Selected" and it's a candidate, convert to intern
      if (selectedRoundForFeedback.name === 'Selected' && feedbackForm.status === 'CLEARED' && isCandidate) {
        const newIntern = await api.convertCandidateToIntern(selectedCandidate.id, null);
        
        await api.updateInternHiringStatus(
          newIntern.id,
          selectedRoundForFeedback.name,
          feedbackForm.status,
          feedbackForm.score ? parseFloat(feedbackForm.score) : null
        );
        
        setToast({ message: 'Candidate converted to intern successfully!', type: 'success' });
        setShowFeedbackModal(false);
        setSelectedCandidate(null);
        await fetchCandidatesAndInterns();
        return;
      }
      
      // For candidates in earlier rounds
      if (isCandidate) {
        await api.createOrUpdateCandidateHiringRound({
          candidate: { id: selectedCandidate.id },
          roundName: selectedRoundForFeedback.name,
          status: feedbackForm.status,
          feedback: feedbackForm.feedback,
          score: feedbackForm.score ? parseFloat(feedbackForm.score) : null
        });
        
        // Update candidate status
        await api.updateCandidate(selectedCandidate.id, {
          ...selectedCandidate,
          hiringRound: selectedRoundForFeedback.name,
          hiringStatus: feedbackForm.status,
          hiringScore: feedbackForm.score ? parseFloat(feedbackForm.score) : selectedCandidate.hiringScore
        });
      } else {
        // For interns, create or update hiring round
        await api.createOrUpdateHiringRound({
          intern: { id: selectedCandidate.id },
          roundName: selectedRoundForFeedback.name,
          status: feedbackForm.status,
          feedback: feedbackForm.feedback,
          score: feedbackForm.score ? parseFloat(feedbackForm.score) : null
        });
      }
      
      setToast({ message: 'Feedback saved successfully!', type: 'success' });
      setShowFeedbackModal(false);
      
      // Refresh history
      if (isCandidate) {
        const data = await api.getCandidateHiringRoundsByCandidateId(selectedCandidate.id);
        setHiringHistory(data);
      } else {
        await fetchHiringHistory(selectedCandidate.id);
      }
      
    } catch (error) {
      console.error('Error saving feedback:', error);
      setToast({ message: 'Failed to save feedback: ' + error.message, type: 'error' });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getRoundStatus = (roundName) => {
    const round = hiringHistory.find(h => h.roundName === roundName);
    return round?.status || 'PENDING';
  };

  const getRoundData = (roundName) => {
    return hiringHistory.find(h => h.roundName === roundName);
  };

  // Old modal handler (keeping for backward compatibility)
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const isCandidate = selectedCandidate.type === 'CANDIDATE';
      
      // For candidates, update candidate status
      if (isCandidate) {
        // If marking as "Selected" with status "CLEARED", convert to intern
        if (statusUpdate.round === 'Selected' && statusUpdate.status === 'CLEARED') {
          const newIntern = await api.convertCandidateToIntern(selectedCandidate.id, null);
          
          await api.updateInternHiringStatus(
            newIntern.id,
            statusUpdate.round,
            statusUpdate.status,
            statusUpdate.score ? Number.parseFloat(statusUpdate.score) : null
          );
          
          setToast({ message: 'Candidate converted to intern successfully!', type: 'success' });
          await fetchCandidatesAndInterns();
          setShowModal(false);
          setSelectedCandidate(null);
          setLoading(false);
          return;
        }
        
        await api.updateCandidateHiringRound({
          candidateId: selectedCandidate.id,
          roundName: statusUpdate.round,
          status: statusUpdate.status,
          feedback: statusUpdate.feedback,
          score: statusUpdate.score ? Number.parseFloat(statusUpdate.score) : null
        });
        
        await api.updateCandidate(selectedCandidate.id, {
          ...selectedCandidate,
          hiringRound: statusUpdate.round,
          hiringStatus: statusUpdate.status,
          hiringScore: statusUpdate.score ? Number.parseFloat(statusUpdate.score) : selectedCandidate.hiringScore
        });
        
        setToast({ message: 'Candidate status updated successfully!', type: 'success' });
      } else {
        // For interns
        await api.createOrUpdateHiringRound({
          intern: { id: selectedCandidate.id },
          roundName: statusUpdate.round,
          status: statusUpdate.status,
          feedback: statusUpdate.feedback,
          score: statusUpdate.score ? parseFloat(statusUpdate.score) : null
        });

        await api.updateInternHiringStatus(
          selectedCandidate.id,
          statusUpdate.round,
          statusUpdate.status,
          statusUpdate.score ? parseFloat(statusUpdate.score) : null
        );
        
        setToast({ message: 'Status updated successfully!', type: 'success' });
      }

      await fetchCandidatesAndInterns();
      setShowModal(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update status: ' + error.message, type: 'error' });
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
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
                    className={`hoverable-row ${selectedCandidate?.id === candidate.id ? 'candidate-row-selected' : ''}`}
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

        {/* Split Screen Modal: Resume Preview + Interactive Timeline */}
        {selectedCandidate && (
          <div className="modal-overlay" onClick={() => {
            setSelectedCandidate(null);
            setHiringHistory([]);
            setResumeUrl(null);
          }}>
            <div className="split-screen-modal" onClick={(e) => e.stopPropagation()}>
              {/* Left Panel: Resume Preview */}
              <div className="resume-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>📄 Resume Preview</h3>
                  <button 
                    className="close-panel-button"
                    onClick={() => {
                      setSelectedCandidate(null);
                      setHiringHistory([]);
                      setResumeUrl(null);
                    }}
                    title="Close Panel"
                  >
                    ✕
                  </button>
              </div>
              
              <div className="candidate-summary" style={{ marginBottom: '16px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar-large">{selectedCandidate.name.charAt(0)}</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{selectedCandidate.name}</h4>
                    <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>{selectedCandidate.email}</p>
                  </div>
                </div>
              </div>

              <div className="resume-preview">
                {loadingHistory ? (
                  <div className="resume-preview-placeholder">
                    <div className="icon">⏳</div>
                    <p>Loading resume...</p>
                  </div>
                ) : resumeUrl ? (
                  <embed 
                    src={resumeUrl} 
                    type="application/pdf" 
                    width="100%" 
                    height="100%"
                    style={{ border: 'none' }}
                  />
                ) : (
                  <div className="resume-preview-placeholder">
                    <div className="icon">📄</div>
                    <p>No resume available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Interactive Timeline */}
            <div className="timeline-panel">
              <h3>🎯 Recruitment Timeline</h3>
              
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                  <p>Loading timeline...</p>
                </div>
              ) : (
                <div className="interactive-timeline">
                  {rounds.map((round, index) => {
                    const status = getRoundStatus(round.name);
                    const roundData = getRoundData(round.name);
                    const statusClass = status.toLowerCase().replace(/_/g, '_');
                    
                    // Check if any previous round was rejected
                    const previousRounds = rounds.slice(0, index);
                    const isDisabled = previousRounds.some(r => {
                      const rData = hiringHistory.find(h => h.roundName === r.name);
                      return rData?.status === 'REJECTED';
                    });

                    return (
                      <div key={round.id} className="timeline-round-item">
                        {/* Connector Line */}
                        {index < rounds.length - 1 && <div className="timeline-connector"></div>}
                        
                        {/* Round Circle */}
                        <div 
                          className={`round-circle ${statusClass} ${isDisabled ? 'disabled' : ''}`}
                          onClick={() => !isDisabled && handleRoundClick(round)}
                          title={isDisabled ? 'Disabled due to previous rejection' : `Click to add/edit feedback for ${round.name}`}
                          style={{ 
                            backgroundColor: status === 'PENDING' ? round.color + '20' : undefined,
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {status === 'CLEARED' ? '✅' : 
                           status === 'REJECTED' ? '❌' : 
                           status === 'ON_HOLD' ? '⏸️' : 
                           round.icon}
                        </div>

                        {/* Round Info */}
                        <div className="round-info">
                          <div className="round-name">
                            {round.name}
                            <span className={`round-status-badge ${statusClass}`}>
                              {status}
                            </span>
                          </div>

                          {roundData && (
                            <>
                              <div className="round-details">
                                {roundData.completedAt && (
                                  <div className="round-detail-item">
                                    <span>📅</span>
                                    <span>{new Date(roundData.completedAt).toLocaleDateString('en-IN', { 
                                      day: 'numeric', 
                                      month: 'short', 
                                      year: 'numeric' 
                                    })}</span>
                                  </div>
                                )}
                                {roundData.score && (
                                  <div className="round-detail-item">
                                    <span>📊</span>
                                    <span><strong>{roundData.score}%</strong></span>
                                  </div>
                                )}
                                {roundData.interviewer && (
                                  <div className="round-detail-item">
                                    <span>👤</span>
                                    <span>{roundData.interviewer}</span>
                                  </div>
                                )}
                              </div>

                              {roundData.feedback && (
                                <div className="round-feedback">
                                  <strong>💬 Feedback:</strong>
                                  {roundData.feedback}
                                </div>
                              )}
                            </>
                          )}

                          {!roundData && status === 'PENDING' && (
                            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '8px 0 0 0' }}>
                              Click the circle to add feedback
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedRoundForFeedback && (
          <div className="feedback-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
            <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
              <div className="feedback-modal-header">
                <h3>💬 Feedback for {selectedRoundForFeedback.name}</h3>
                <button className="close-button" onClick={() => setShowFeedbackModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmitFeedback}>
                <div className="feedback-form-group">
                  <label>Status *</label>
                  <div className="status-radio-group">
                    <div className="status-radio-option">
                      <input
                        type="radio"
                        id="status-cleared"
                        name="status"
                        value="CLEARED"
                        checked={feedbackForm.status === 'CLEARED'}
                        onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                      />
                      <label htmlFor="status-cleared" className="status-radio-label">
                        ✅ Cleared
                      </label>
                    </div>

                    <div className="status-radio-option">
                      <input
                        type="radio"
                        id="status-pending"
                        name="status"
                        value="PENDING"
                        checked={feedbackForm.status === 'PENDING'}
                        onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                      />
                      <label htmlFor="status-pending" className="status-radio-label">
                        ⏳ Pending
                      </label>
                    </div>

                    <div className="status-radio-option">
                      <input
                        type="radio"
                        id="status-on-hold"
                        name="status"
                        value="ON_HOLD"
                        checked={feedbackForm.status === 'ON_HOLD'}
                        onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                      />
                      <label htmlFor="status-on-hold" className="status-radio-label">
                        ⏸️ On Hold
                      </label>
                    </div>

                    <div className="status-radio-option">
                      <input
                        type="radio"
                        id="status-rejected"
                        name="status"
                        value="REJECTED"
                        checked={feedbackForm.status === 'REJECTED'}
                        onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                      />
                      <label htmlFor="status-rejected" className="status-radio-label">
                        ❌ Rejected
                      </label>
                    </div>
                  </div>
                </div>

                <div className="feedback-form-group">
                  <label>Score (0-100)</label>
                  <input
                    type="number"
                    className="feedback-input"
                    placeholder="Enter score (optional)"
                    min="0"
                    max="100"
                    value={feedbackForm.score}
                    onChange={(e) => setFeedbackForm({...feedbackForm, score: e.target.value})}
                  />
                </div>

                <div className="feedback-form-group">
                  <label>Feedback</label>
                  <textarea
                    className="feedback-textarea"
                    placeholder="Enter your feedback or comments..."
                    value={feedbackForm.feedback}
                    onChange={(e) => setFeedbackForm({...feedbackForm, feedback: e.target.value})}
                  />
                </div>

                <div className="feedback-modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submittingFeedback}
                  >
                    {submittingFeedback ? 'Saving...' : 'Save Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* OLD MODALS BELOW - KEEPING FOR NOW FOR BACKWARD COMPATIBILITY */}

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
