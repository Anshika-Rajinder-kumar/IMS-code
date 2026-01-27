import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './InternPerformance.css';

const InternPerformance = () => {
  const [allProgress, setAllProgress] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState('all');
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progressData, internsData] = await Promise.all([
        api.getAllProjectProgress(),
        api.getActiveInterns()
      ]);
      setAllProgress(progressData);
      setInterns(internsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = selectedIntern === 'all' 
    ? allProgress 
    : allProgress.filter(p => p.internId === parseInt(selectedIntern));

  const getProgressColor = (percentage) => {
    if (percentage < 25) return '#ef4444';
    if (percentage < 50) return '#f97316';
    if (percentage < 75) return '#eab308';
    return '#22c55e';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (progress) => {
    setSelectedProgress(progress);
    setShowDetailModal(true);
  };

  const getInternStats = (internId) => {
    const internProgress = allProgress.filter(p => p.internId === internId);
    if (internProgress.length === 0) return null;

    const totalProjects = internProgress.length;
    const avgCompletion = Math.round(
      internProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / totalProjects
    );
    const completedProjects = internProgress.filter(p => p.completionPercentage === 100).length;

    return { totalProjects, avgCompletion, completedProjects };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading performance data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Intern Performance Monitor</h1>
            <p className="page-subtitle">Track individual progress and project completion</p>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{interns.length}</div>
              <div className="stat-label">Active Interns</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{allProgress.length}</div>
              <div className="stat-label">Progress Reports</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {allProgress.filter(p => p.completionPercentage === 100).length}
              </div>
              <div className="stat-label">Completed Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {allProgress.length > 0 
                  ? Math.round(allProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / allProgress.length)
                  : 0}%
              </div>
              <div className="stat-label">Avg Completion</div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-label">
            Filter by Intern:
          </div>
          <select 
            value={selectedIntern} 
            onChange={(e) => setSelectedIntern(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Interns</option>
            {interns.map(intern => {
              const stats = getInternStats(intern.id);
              return (
                <option key={intern.id} value={intern.id}>
                  {intern.name} {stats && `(${stats.totalProjects} projects, ${stats.avgCompletion}% avg)`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Intern Performance Cards (when filtering by specific intern) */}
        {selectedIntern !== 'all' && (
          <div className="intern-performance-card">
            {(() => {
              const intern = interns.find(i => i.id === parseInt(selectedIntern));
              const stats = getInternStats(parseInt(selectedIntern));
              
              if (!intern || !stats) return null;

              return (
                <>
                  <div className="performance-header">
                    <div className="intern-info">
                      <div className="intern-avatar">
                        {intern.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="intern-name">{intern.name}</h3>
                        <p className="intern-email">{intern.email}</p>
                      </div>
                    </div>
                    <div className="performance-stats">
                      <div className="mini-stat">
                        <span className="mini-stat-value">{stats.totalProjects}</span>
                        <span className="mini-stat-label">Projects</span>
                      </div>
                      <div className="mini-stat">
                        <span 
                          className="mini-stat-value"
                          style={{ color: getProgressColor(stats.avgCompletion) }}
                        >
                          {stats.avgCompletion}%
                        </span>
                        <span className="mini-stat-label">Avg Progress</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-stat-value">{stats.completedProjects}</span>
                        <span className="mini-stat-label">Completed</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Progress List */}
        <div className="progress-list">
          {filteredProgress.length === 0 ? (
            <div className="empty-state">
              <h3>No Progress Reports Yet</h3>
              <p>Progress updates from interns will appear here.</p>
            </div>
          ) : (
            <div className="progress-grid">
              {filteredProgress.map((progress) => (
                <div key={progress.id} className="progress-item">
                  <div className="progress-item-header">
                    <div className="intern-badge">
                      {progress.internName}
                    </div>
                    <span className="progress-date">
                      {formatDate(progress.updatedAt)}
                    </span>
                  </div>

                  <h3 className="progress-project-title">
                    {progress.projectTitle}
                  </h3>

                  <div className="progress-bar-section">
                    <div className="progress-bar-header">
                      <span 
                        className="progress-percent"
                        style={{ color: getProgressColor(progress.completionPercentage) }}
                      >
                        {progress.completionPercentage}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-inner"
                        style={{
                          width: `${progress.completionPercentage}%`,
                          background: getProgressColor(progress.completionPercentage)
                        }}
                      ></div>
                    </div>
                  </div>

                  {progress.description && (
                    <p className="progress-description">
                      {progress.description.substring(0, 120)}
                      {progress.description.length > 120 && '...'}
                    </p>
                  )}

                  <div className="progress-tags">
                    {progress.achievements && (
                      <span className="progress-tag tag-achievement">
                        Achievements
                      </span>
                    )}
                    {progress.challenges && (
                      <span className="progress-tag tag-challenge">
                        Challenges
                      </span>
                    )}
                    {progress.nextSteps && (
                      <span className="progress-tag tag-nextsteps">
                        Next Steps
                      </span>
                    )}
                  </div>

                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewDetails(progress)}
                  >
                    View Full Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedProgress && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div>
                <h2 className="detail-modal-title">
                  {selectedProgress.projectTitle}
                </h2>
                <p className="detail-modal-subtitle">
                  by {selectedProgress.internName}
                </p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-body">
              <div className="detail-section">
                <div className="detail-section-header">
                  <h3>Progress</h3>
                </div>
                <div className="completion-display">
                  <div 
                    className="completion-circle"
                    style={{ 
                      background: `conic-gradient(${getProgressColor(selectedProgress.completionPercentage)} ${selectedProgress.completionPercentage * 3.6}deg, #f3f4f6 0deg)`
                    }}
                  >
                    <div className="completion-inner">
                      <span className="completion-value">
                        {selectedProgress.completionPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-header">
                  <h3>Description</h3>
                </div>
                <p className="detail-text">{selectedProgress.description || 'No description provided'}</p>
              </div>

              {selectedProgress.achievements && (
                <div className="detail-section">
                  <div className="detail-section-header">
                    <h3>Achievements</h3>
                  </div>
                  <p className="detail-text">{selectedProgress.achievements}</p>
                </div>
              )}

              {selectedProgress.challenges && (
                <div className="detail-section">
                  <div className="detail-section-header">
                    <h3>Challenges</h3>
                  </div>
                  <p className="detail-text">{selectedProgress.challenges}</p>
                </div>
              )}

              {selectedProgress.nextSteps && (
                <div className="detail-section">
                  <div className="detail-section-header">
                    <h3>Next Steps</h3>
                  </div>
                  <p className="detail-text">{selectedProgress.nextSteps}</p>
                </div>
              )}

              <div className="detail-footer">
                <span className="detail-timestamp">
                  Last updated: {formatDate(selectedProgress.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternPerformance;
