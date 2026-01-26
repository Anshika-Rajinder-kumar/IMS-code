import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './LearningProgress.css';

const LearningProgress = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('courses'); // Default to courses
  const [loading, setLoading] = useState(true);
  const [assignedData, setAssignedData] = useState({ courses: [], projects: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchMyLearning();
  }, []);

  const fetchMyLearning = async () => {
    try {
      setLoading(true);
      const data = await api.getMyLearning();
      setAssignedData({
        courses: (data.courses || []).sort((a, b) => a.title.localeCompare(b.title)),
        projects: (data.projects || []).sort((a, b) => a.title.localeCompare(b.title))
      });
    } catch (err) {
      console.error('Error fetching learning data:', err);
      setError('Failed to load your assignments.');
    } finally {
      setLoading(false);
    }
  };

  const renderCourses = () => (
    <div className="modules-grid">
      {assignedData.courses.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
          <p style={{ color: '#666' }}>No courses have been assigned to you yet.</p>
        </div>
      ) : (
        assignedData.courses.map(course => (
          <div key={course.id} className="module-card">
            <div className="module-header">
              <h3>{course.title}</h3>
              <span className="badge badge-info">{course.difficulty}</span>
            </div>
            <p className="module-description" style={{ color: '#4b5563', margin: '12px 0', fontSize: '14px', lineHeight: '1.5' }}>
              {course.description}
            </p>
            <div className="module-meta" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              <span title="Duration">⏱️ {course.duration}</span>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }}>
              ▶️ Start Course
            </button>
          </div>
        ))
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="projects-list">
      {assignedData.projects.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>No projects have been assigned to you yet.</p>
        </div>
      ) : (
        assignedData.projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <span className="badge badge-info">{project.difficulty}</span>
            </div>
            <div className="project-info" style={{ marginTop: '16px', display: 'flex', gap: '20px' }}>
              <span>⏱️ Duration: {project.duration}</span>
              <span>🛠️ Type: Internship Project</span>
            </div>
            <div className="project-actions" style={{ marginTop: '20px' }}>
              <button className="btn btn-outline btn-sm">📂 View Details</button>
              <button className="btn btn-primary btn-sm">🚀 Get Started</button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Loading your learning journey...</p>
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
            <h1 className="page-title">My Learning Journey</h1>
            <p className="page-subtitle">Personalized courses and projects assigned to you</p>
          </div>
          {error && <div style={{ color: '#ef4444' }}>{error}</div>}
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 Assigned Courses
          </button>
          <button
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            🎯 Assigned Projects
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content" style={{ marginTop: '24px' }}>
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'projects' && renderProjects()}
        </div>
      </main>
    </div>
  );
};

export default LearningProgress;
