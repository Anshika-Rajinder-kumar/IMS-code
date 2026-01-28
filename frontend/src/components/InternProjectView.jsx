import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProjectProgressForm from './ProjectProgressForm';
import api from '../services/api';
import './InternProjectView.css';

const InternProjectView = () => {
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState({});
  const [currentIntern, setCurrentIntern] = useState(null);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const data = await api.getMyLearning();
      setProjects(data.projects || []);
      setCourses(data.courses || []);
      
      // Store intern info from the response
      if (data.internId) {
        setCurrentIntern({
          id: data.internId,
          name: data.internName,
          email: data.internEmail
        });
        
        // Fetch progress for all projects
        const progress = await api.getProgressByIntern(data.internId);
        const progressMap = {};
        progress.forEach(p => {
          progressMap[p.projectId] = p;
        });
        setProgressData(progressMap);
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = (project) => {
    setSelectedProject(project);
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (formData) => {
    try {
      await api.createOrUpdateProjectProgress(formData);
      await fetchLearningData(); // Refresh to get updated progress
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 25) return '#ef4444';
    if (percentage < 50) return '#f97316';
    if (percentage < 75) return '#eab308';
    return '#22c55e';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading your learning path...</p>
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
            <h1 className="page-title">🎓 My Learning Journey</h1>
            <p className="page-subtitle">Track your progress and achieve your goals</p>
          </div>
        </header>

        {/* Projects Section */}
        <section className="learning-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🚀</span>
              My Projects
            </h2>
            <span className="badge-count">{projects.length} Projects</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Projects Assigned Yet</h3>
              <p>Your assigned projects will appear here. Contact your admin for project assignments.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => {
                const progress = progressData[project.id];
                const hasProgress = !!progress;
                const completionPercentage = progress?.completionPercentage || 0;

                return (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      <div className="project-icon">💼</div>
                      <div className="project-badges">
                        <span className="badge badge-difficulty">{project.difficulty}</span>
                        <span className="badge badge-duration">{project.duration}</span>
                      </div>
                    </div>

                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>

                    {hasProgress && (
                      <div className="progress-indicator">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span 
                            className="progress-percentage"
                            style={{ color: getProgressColor(completionPercentage) }}
                          >
                            {completionPercentage}%
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill"
                            style={{
                              width: `${completionPercentage}%`,
                              background: getProgressColor(completionPercentage)
                            }}
                          ></div>
                        </div>
                        {progress.description && (
                          <p className="last-update">
                            <span className="update-icon">📝</span>
                            {progress.description.substring(0, 80)}
                            {progress.description.length > 80 && '...'}
                          </p>
                        )}
                      </div>
                    )}

                    <button 
                      className="btn-get-started"
                      onClick={() => handleGetStarted(project)}
                    >
                      <span className="btn-icon">{hasProgress ? '📊' : '🚀'}</span>
                      {hasProgress ? 'Update Progress' : 'Get Started'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Courses Section */}
        <section className="learning-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📚</span>
              My Courses
            </h2>
            <span className="badge-count">{courses.length} Courses</span>
          </div>

          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Courses Assigned Yet</h3>
              <p>Your assigned courses will appear here. Contact your admin for course assignments.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-icon">📖</div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-footer">
                    <span className="course-badge">{course.duration}</span>
                    <span className="course-badge">{course.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Progress Form Modal */}
      {showProgressModal && selectedProject && currentIntern && (
        <ProjectProgressForm
          intern={currentIntern}
          project={selectedProject}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedProject(null);
          }}
          onSubmit={handleProgressSubmit}
        />
      )}
    </div>
  );
};

export default InternProjectView;
