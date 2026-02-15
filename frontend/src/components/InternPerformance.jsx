import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './InternPerformance.css';

const InternPerformance = () => {
  const [allProgress, setAllProgress] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternId, setSelectedInternId] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateProgress, setSelectedDateProgress] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);

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

  const getProgressColor = (percentage) => {
    if (percentage < 25) return '#ef4444';
    if (percentage < 50) return '#f97316';
    if (percentage < 75) return '#eab308';
    return '#22c55e';
  };

  // Filter logic
  const currentIntern = interns.find(i => i.id === parseInt(selectedInternId));
  const internProjects = currentIntern?.assignedProjects || [];

  const filteredProgress = allProgress.filter(p => {
    const isInternMatch = selectedInternId === 'all' || p.internId === parseInt(selectedInternId);
    const isProjectMatch = selectedProjectId === 'all' || p.projectId === parseInt(selectedProjectId);
    return isInternMatch && isProjectMatch;
  });

  // Calendar logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const renderCalendar = () => {
    if (selectedInternId === 'all' || selectedProjectId === 'all') {
      return (
        <div className="calendar-placeholder">
          <div className="placeholder-icon">📅</div>
          <p>Please select an intern and project to view the daily log calendar.</p>
        </div>
      );
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    const joinDate = currentIntern?.joinDate ? new Date(currentIntern.joinDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(year, month, d);
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

      const log = filteredProgress.find(p => p.logDate === dateStr);

      let statusClass = '';
      let statusText = '-';

      if (joinDate && dayDate < joinDate) {
        statusText = 'N/A';
        statusClass = 'not-applicable';
      } else if (dayDate > today) {
        statusText = '-';
        statusClass = 'future';
      } else if (log) {
        statusText = 'LOGGED';
        statusClass = 'logged';
      } else if (!isWeekend) {
        statusText = 'MISSING';
        statusClass = 'missing';
      } else {
        statusText = 'WEEKEND';
        statusClass = 'weekend';
      }

      const isSelected = selectedDateProgress?.logDate === dateStr;

      days.push(
        <div
          key={d}
          className={`calendar-day ${statusClass} ${isSelected ? 'selected' : ''}`}
          onClick={() => {
            if (log) {
              setSelectedDateProgress(log);
              setAdminComment(log.adminComment || '');
            } else {
              setSelectedDateProgress({ logDate: dateStr, isDummy: true });
              setAdminComment('');
            }
          }}
        >
          <span className="day-number">{d}</span>
          <div className="day-status-pill">{statusText}</div>
          {log?.adminComment && <span className="tick-icon">✔️</span>}
        </div>
      );
    }

    return (
      <div className="calendar-grid">
        {dayNames.map(name => <div key={name} className="day-name">{name}</div>)}
        {days}
      </div>
    );
  };

  const getLogStats = () => {
    if (selectedInternId === 'all' || selectedProjectId === 'all') return null;

    const loggedDays = filteredProgress.length;
    const reviewedDays = filteredProgress.filter(p => p.adminComment).length;

    // Estimate missing days since joinDate
    const joinDate = currentIntern?.joinDate ? new Date(currentIntern.joinDate) : null;
    let missingDays = 0;
    if (joinDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let tempDate = new Date(joinDate);
      while (tempDate <= today) {
        const isWeekend = tempDate.getDay() === 0 || tempDate.getDay() === 6;
        const dateStr = tempDate.toISOString().split('T')[0];
        const log = filteredProgress.find(p => p.logDate === dateStr);
        if (!log && !isWeekend) missingDays++;
        tempDate.setDate(tempDate.getDate() + 1);
      }
    }

    return { loggedDays, missingDays, reviewedDays };
  };

  const handleSaveComment = async () => {
    if (!selectedDateProgress || selectedDateProgress.isDummy) return;

    const wordCount = adminComment.trim().split(/\s+/).length;
    if (wordCount < 1 || wordCount > 50) {
      alert('Admin review comment must be between 1 and 50 words.');
      return;
    }

    try {
      setSavingComment(true);
      await api.updateProjectProgressComment(selectedDateProgress.id, adminComment);

      const updatedData = await api.getAllProjectProgress();
      setAllProgress(updatedData);

      const newLog = updatedData.find(p => p.id === selectedDateProgress.id);
      setSelectedDateProgress(newLog);

      alert('Review comment saved successfully!');
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment');
    } finally {
      setSavingComment(false);
    }
  };

  // Logic for the Progress Dashboard
  let displayPercentage = 0;
  let displayLabel = 'Overall Progress';
  let projectTitle = 'No Project Selected';
  let projectDesc = 'Select an intern and their assigned project to see details and track progress.';

  if (selectedInternId !== 'all') {
    if (selectedProjectId === 'all') {
      // Calculate Average Progress across all assigned projects
      if (internProjects.length > 0) {
        projectTitle = 'Intern Performance Summary';
        projectDesc = `Average completion across all ${internProjects.length} projects.`;
        displayLabel = 'Average Progress';

        let totalPct = 0;
        internProjects.forEach(proj => {
          const projLogs = allProgress.filter(p => p.internId === parseInt(selectedInternId) && p.projectId === proj.id);
          if (projLogs.length > 0) {
            const latestProjLog = [...projLogs].sort((a, b) => b.logDate.localeCompare(a.logDate))[0];
            totalPct += latestProjLog.completionPercentage;
          }
        });
        displayPercentage = Math.round(totalPct / internProjects.length);
      }
    } else {
      // Specific Project selected
      const currentProject = internProjects.find(p => p.id === parseInt(selectedProjectId));
      projectTitle = currentProject?.title || 'Project Details';
      projectDesc = currentProject?.description || '';

      const projLogs = filteredProgress.filter(p => p.projectId === parseInt(selectedProjectId));
      if (projLogs.length > 0) {
        const latestProjLog = [...projLogs].sort((a, b) => b.logDate.localeCompare(a.logDate))[0];
        displayPercentage = latestProjLog.completionPercentage;
      }
    }
  }

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

  const stats = getLogStats();

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Intern Performance Overview</h1>
            <p className="page-subtitle">Select an intern and project to view daily activity logs</p>
          </div>
        </header>

        {/* Selection Row */}
        <div className="selection-card">
          <div className="selection-group">
            <label>Select Intern:</label>
            <select
              value={selectedInternId}
              onChange={(e) => {
                setSelectedInternId(e.target.value);
                setSelectedProjectId('all');
                setSelectedDateProgress(null);
              }}
              className="selection-select"
            >
              <option value="all">Select Intern...</option>
              {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>

          <div className="selection-group">
            <label>Select Project:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedDateProgress(null);
              }}
              className="selection-select"
              disabled={selectedInternId === 'all'}
            >
              <option value="all">All Projects (Average)</option>
              {internProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div className="selection-group month-nav">
            <label>Select Month:</label>
            <div className="month-controls">
              <button onClick={handlePrevMonth} className="month-btn">←</button>
              <span className="current-month-label">{monthName}</span>
              <button onClick={handleNextMonth} className="month-btn">→</button>
            </div>
          </div>
        </div>

        <div className="performance-split-view">
          {/* Left Side: Dashboard (Hide if no intern selected) */}
          <div className="performance-dashboard">
            {selectedInternId !== 'all' ? (
              <>
                <div className="project-highlight-card">
                  <div className="circular-progress-main">
                    <div
                      className="completion-circle-large"
                      style={{
                        background: `conic-gradient(${getProgressColor(displayPercentage)} ${displayPercentage * 3.6}deg, #ffe0e0 0deg)`
                      }}
                    >
                      <div className="completion-inner-large">
                        <span className="completion-value-large">
                          {displayPercentage}%
                        </span>
                        <span className="completion-label-large">{displayLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="project-info-section">
                    <h2 className="project-title-large">{projectTitle}</h2>
                    <p className="project-desc-large">{projectDesc}</p>
                  </div>

                  {stats && (
                    <div className="quick-stats-grid">
                      <div className="quick-stat-item">
                        <span className="stat-icon logged">●</span>
                        <div className="stat-info">
                          <span className="stat-num">{stats.loggedDays}</span>
                          <span className="stat-txt">Logged Days</span>
                        </div>
                      </div>
                      <div className="quick-stat-item">
                        <span className="stat-icon reviewed">●</span>
                        <div className="stat-info">
                          <span className="stat-num">{stats.reviewedDays}</span>
                          <span className="stat-txt">Reviewed</span>
                        </div>
                      </div>
                      <div className="quick-stat-item">
                        <span className="stat-icon missing">●</span>
                        <div className="stat-info">
                          <span className="stat-num">{stats.missingDays}</span>
                          <span className="stat-txt">Missing</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="intern-mini-profile">
                  <h3>Intern Info</h3>
                  <div className="info-row">
                    <span>Joined:</span>
                    <strong>{currentIntern?.joinDate || 'N/A'}</strong>
                  </div>
                  <div className="info-row">
                    <span>Status:</span>
                    <span className={`status-badge ${currentIntern?.status?.toLowerCase()}`}>
                      {currentIntern?.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="selection-placeholder-card">
                <div className="placeholder-icon">👤</div>
                <p>Please select an intern to view their performance metrics and project dashboard.</p>
              </div>
            )}
          </div>

          {/* Right Side: Calendar */}
          <div className="calendar-card">
            <h3 className="calendar-card-title">Project Log History</h3>
            {renderCalendar()}
          </div>
        </div>

        {/* Selected Log Details & Review Section */}
        {selectedDateProgress && (
          <div className="log-detail-section">
            <header className="log-detail-header">
              <h3>Log Details for {selectedDateProgress.logDate}</h3>
              {selectedDateProgress.isDummy && <span className="no-log-warning">No entry made for this date</span>}
            </header>

            {!selectedDateProgress.isDummy ? (
              <div className="log-content-grid">
                <div className="log-answers">
                  <div className="answer-item">
                    <h4><span className="ans-icon"></span> Key Achievements</h4>
                    <p>{selectedDateProgress.achievements || 'Not specified'}</p>
                  </div>
                  <div className="answer-item">
                    <h4><span className="ans-icon"></span> Challenges Faced</h4>
                    <p>{selectedDateProgress.challenges || 'No challenges reported'}</p>
                  </div>
                  <div className="answer-item">
                    <h4><span className="ans-icon"></span> Plan for Tomorrow</h4>
                    <p>{selectedDateProgress.nextSteps || 'Not specified'}</p>
                  </div>
                </div>

                <div className="admin-review-box">
                  <h4><span className="ans-icon">💬</span> Admin Review</h4>
                  <textarea
                    className="admin-comment-input"
                    placeholder="Enter your feedback here (Max 50 words)..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows="5"
                  />
                  <div className="review-meta">
                    <span className="word-count">
                      Word count: {adminComment.trim() ? adminComment.trim().split(/\s+/).length : 0}
                    </span>
                    <button
                      className="btn-save-review"
                      onClick={handleSaveComment}
                      disabled={savingComment}
                    >
                      {savingComment ? 'Saving...' : 'Save Comment'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-log-state">
                <p>No log entry found for this date. Daily updates are expected on working days.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default InternPerformance;
