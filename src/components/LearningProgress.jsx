import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './LearningProgress.css';

const LearningProgress = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Mock learning data (in real app, fetch from API)
  const [learningData, setLearningData] = useState({
    overallProgress: 65,
    currentWeek: 8,
    totalWeeks: 24,
    completedModules: 12,
    totalModules: 18,
    upcomingDeadline: '2026-01-30',
    mentor: 'Sarah Johnson',
    rating: 4.5
  });

  const [modules, setModules] = useState([
    {
      id: 1,
      title: 'Java Fundamentals',
      progress: 100,
      status: 'completed',
      duration: '2 weeks',
      topics: ['OOP', 'Collections', 'Exception Handling'],
      deadline: '2026-01-10',
      score: 95
    },
    {
      id: 2,
      title: 'Spring Boot Framework',
      progress: 80,
      status: 'in-progress',
      duration: '3 weeks',
      topics: ['REST APIs', 'JPA', 'Security'],
      deadline: '2026-01-30',
      score: null
    },
    {
      id: 3,
      title: 'React Development',
      progress: 45,
      status: 'in-progress',
      duration: '3 weeks',
      topics: ['Components', 'Hooks', 'State Management'],
      deadline: '2026-02-15',
      score: null
    },
    {
      id: 4,
      title: 'Database Design',
      progress: 0,
      status: 'upcoming',
      duration: '2 weeks',
      topics: ['SQL', 'PostgreSQL', 'Optimization'],
      deadline: '2026-02-28',
      score: null
    }
  ]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'E-Commerce Backend API',
      description: 'Build a REST API for an e-commerce platform',
      status: 'completed',
      progress: 100,
      dueDate: '2026-01-15',
      grade: 'A',
      feedback: 'Excellent implementation with proper error handling'
    },
    {
      id: 2,
      title: 'Inventory Management System',
      description: 'Full-stack application for inventory tracking',
      status: 'in-progress',
      progress: 70,
      dueDate: '2026-02-05',
      grade: null,
      feedback: null
    },
    {
      id: 3,
      title: 'Real-time Chat Application',
      description: 'Build a chat app with WebSocket support',
      status: 'not-started',
      progress: 0,
      dueDate: '2026-02-20',
      grade: null,
      feedback: null
    }
  ]);

  const [attendance, setAttendance] = useState({
    present: 38,
    absent: 2,
    totalDays: 40,
    percentage: 95
  });

  const [assessments, setAssessments] = useState([
    { id: 1, title: 'Java Quiz 1', date: '2026-01-05', score: 92, maxScore: 100 },
    { id: 2, title: 'Spring Boot Assignment', date: '2026-01-12', score: 88, maxScore: 100 },
    { id: 3, title: 'React Mid-term', date: '2026-01-20', score: 85, maxScore: 100 },
    { id: 4, title: 'Database Assessment', date: '2026-01-25', score: null, maxScore: 100 }
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': { class: 'badge-success', text: 'Completed' },
      'in-progress': { class: 'badge-warning', text: 'In Progress' },
      'upcoming': { class: 'badge-info', text: 'Upcoming' },
      'not-started': { class: 'badge-secondary', text: 'Not Started' }
    };
    return statusMap[status] || statusMap['not-started'];
  };

  const getGradeBadge = (grade) => {
    const gradeMap = {
      'A': 'badge-success',
      'B': 'badge-info',
      'C': 'badge-warning',
      'D': 'badge-danger'
    };
    return gradeMap[grade] || 'badge-secondary';
  };

  const renderOverview = () => (
    <div className="overview-content">
      {/* Progress Summary */}
      <div className="progress-summary">
        <div className="progress-card main-progress">
          <div className="progress-header">
            <h3>Overall Progress</h3>
            <span className="progress-percentage">{learningData.overallProgress}%</span>
          </div>
          <div className="progress-bar-large">
            <div 
              className="progress-fill-large" 
              style={{ width: `${learningData.overallProgress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <div>
              <span className="info-label">Week:</span>
              <span className="info-value">{learningData.currentWeek} / {learningData.totalWeeks}</span>
            </div>
            <div>
              <span className="info-label">Modules:</span>
              <span className="info-value">{learningData.completedModules} / {learningData.totalModules}</span>
            </div>
          </div>
        </div>

        <div className="side-cards">
          <div className="progress-card">
            <div className="card-icon" style={{ background: '#dbeafe' }}>📚</div>
            <div>
              <div className="card-value">{learningData.completedModules}</div>
              <div className="card-label">Modules Completed</div>
            </div>
          </div>
          <div className="progress-card">
            <div className="card-icon" style={{ background: '#dcfce7' }}>⭐</div>
            <div>
              <div className="card-value">{learningData.rating}</div>
              <div className="card-label">Performance Rating</div>
            </div>
          </div>
          <div className="progress-card">
            <div className="card-icon" style={{ background: '#fef3c7' }}>📅</div>
            <div>
              <div className="card-value">{attendance.percentage}%</div>
              <div className="card-label">Attendance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Focus */}
      <div className="section-row">
        <div className="card flex-1">
          <div className="card-header">
            <h3 className="card-title">Current Focus</h3>
          </div>
          <div className="current-modules">
            {modules.filter(m => m.status === 'in-progress').map(module => (
              <div key={module.id} className="module-card-compact">
                <div className="module-header-compact">
                  <h4>{module.title}</h4>
                  <span className={`badge ${getStatusBadge(module.status).class}`}>
                    {getStatusBadge(module.status).text}
                  </span>
                </div>
                <div className="progress-bar-small">
                  <div className="progress-fill-small" style={{ width: `${module.progress}%` }}></div>
                </div>
                <div className="module-footer-compact">
                  <span>📅 Due: {new Date(module.deadline).toLocaleDateString()}</span>
                  <span>{module.progress}% Complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ minWidth: '300px' }}>
          <div className="card-header">
            <h3 className="card-title">Mentor Details</h3>
          </div>
          <div className="mentor-card">
            <div className="mentor-avatar">
              {learningData.mentor.split(' ').map(n => n[0]).join('')}
            </div>
            <h4>{learningData.mentor}</h4>
            <p>Senior Software Engineer</p>
            <div className="mentor-actions">
              <button className="btn btn-outline btn-sm">📧 Email</button>
              <button className="btn btn-outline btn-sm">💬 Chat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModules = () => (
    <div className="modules-grid">
      {modules.map(module => (
        <div key={module.id} className="module-card">
          <div className="module-status-indicator" data-status={module.status}></div>
          <div className="module-header">
            <h3>{module.title}</h3>
            <span className={`badge ${getStatusBadge(module.status).class}`}>
              {getStatusBadge(module.status).text}
            </span>
          </div>
          <div className="module-meta">
            <span>⏱️ {module.duration}</span>
            <span>📅 {new Date(module.deadline).toLocaleDateString()}</span>
          </div>
          <div className="module-topics">
            {module.topics.map((topic, idx) => (
              <span key={idx} className="topic-tag">{topic}</span>
            ))}
          </div>
          <div className="module-progress">
            <div className="progress-header-small">
              <span>Progress</span>
              <span>{module.progress}%</span>
            </div>
            <div className="progress-bar-small">
              <div className="progress-fill-small" style={{ width: `${module.progress}%` }}></div>
            </div>
          </div>
          {module.score && (
            <div className="module-score">
              <span>Score: </span>
              <span className="score-value">{module.score}%</span>
            </div>
          )}
          <button className="btn btn-primary btn-block">
            {module.status === 'completed' ? '📖 Review' : '▶️ Continue Learning'}
          </button>
        </div>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="projects-list">
      {projects.map(project => (
        <div key={project.id} className="project-card">
          <div className="project-header">
            <div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
            <span className={`badge ${getStatusBadge(project.status).class}`}>
              {getStatusBadge(project.status).text}
            </span>
          </div>
          <div className="project-progress">
            <div className="progress-header-small">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="progress-bar-small">
              <div className="progress-fill-small" style={{ width: `${project.progress}%` }}></div>
            </div>
          </div>
          <div className="project-footer">
            <div className="project-info">
              <span>📅 Due: {new Date(project.dueDate).toLocaleDateString()}</span>
              {project.grade && (
                <span className={`badge ${getGradeBadge(project.grade)}`}>
                  Grade: {project.grade}
                </span>
              )}
            </div>
            {project.feedback && (
              <div className="project-feedback">
                <strong>Feedback:</strong> {project.feedback}
              </div>
            )}
          </div>
          <div className="project-actions">
            <button className="btn btn-outline btn-sm">📂 View Details</button>
            {project.status !== 'completed' && (
              <button className="btn btn-primary btn-sm">📤 Submit Work</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAssessments = () => (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Assessment History</h3>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Assessment</th>
            <th>Date</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map(assessment => (
            <tr key={assessment.id}>
              <td style={{ fontWeight: '600' }}>{assessment.title}</td>
              <td>{new Date(assessment.date).toLocaleDateString()}</td>
              <td>
                {assessment.score !== null ? (
                  `${assessment.score} / ${assessment.maxScore}`
                ) : (
                  <span style={{ color: '#9ca3af' }}>Pending</span>
                )}
              </td>
              <td>
                {assessment.score !== null ? (
                  <span className={`score-badge ${
                    (assessment.score / assessment.maxScore * 100) >= 80 ? 'score-high' : 
                    (assessment.score / assessment.maxScore * 100) >= 60 ? 'score-medium' : 'score-low'
                  }`}>
                    {Math.round(assessment.score / assessment.maxScore * 100)}%
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {assessment.score !== null ? (
                  <span className="badge badge-success">Graded</span>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">My Learning Journey</h1>
            <p className="page-subtitle">Track your progress and achievements</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              📊 Download Report
            </button>
            <button className="btn btn-primary">
              📚 View Resources
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveTab('modules')}
          >
            📚 Modules
          </button>
          <button 
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            🎯 Projects
          </button>
          <button 
            className={`tab ${activeTab === 'assessments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assessments')}
          >
            📝 Assessments
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'modules' && renderModules()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'assessments' && renderAssessments()}
        </div>
      </main>
    </div>
  );
};

export default LearningProgress;
