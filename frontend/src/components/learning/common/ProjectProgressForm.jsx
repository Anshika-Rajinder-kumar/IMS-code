import React, { useState } from 'react';
import './ProjectProgressForm.css';

const ProjectProgressForm = ({ intern, project, initialProgress, initialDate, mode = 'log', onClose, onSubmit }) => {
  // mode: 'log' (calendar click) or 'progress' (button click)

  // Helper to format date for display/input
  const formatDate = (dateInput) => {
    try {
      if (!dateInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      if (typeof dateInput === 'string') return dateInput; // Already YYYY-MM-DD

      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Date formatting error", e);
      return new Date().toISOString().split('T')[0];
    }
  };

  const [formData, setFormData] = useState({
    completionPercentage: initialProgress?.completionPercentage || 0,
    logDate: initialProgress?.logDate || formatDate(initialDate),
    description: initialProgress?.description || '',
    achievements: initialProgress?.achievements || '',
    challenges: initialProgress?.challenges || '',
    nextSteps: initialProgress?.nextSteps || ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      completionPercentage: value
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (mode === 'log') {
      if (!formData.logDate) {
        newErrors.logDate = 'Please select a date';
      }
      if (!formData.achievements.trim()) {
        newErrors.achievements = 'Please share your daily achievements';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // In progress mode, we might not have a date selected, so default to today if needed, 
      // but the backend might expect a date for the UNIQUE constraint if we are creating a new row.
      // However, 'progress' mode implies updating the PROJECT status overall, but our DB is daily logs.
      // If we just update progress, we probably should upsert a log for TODAY?
      // Or maybe the user just wants to update the percentage on the project entity itself?
      // But ProjectProgress is the only place we store percentage.
      // So 'Update Progress' likely means "Update status as of TODAY".

      const submissionData = {
        internId: intern.id,
        projectId: project.id,
        ...formData,
        completionPercentage: parseInt(formData.completionPercentage)
      };

      // If in progress mode, we ensure we are logging for TODAY unless a log exists? 
      // Actually, if we are in progress mode, we are likely creating a new log for today or updating today's log.
      if (mode === 'progress') {
        submissionData.logDate = new Date().toLocaleDateString('en-CA');
        // We might want to keep existing text if we are updating today's log?
        // The initialProgress prop should handle that if passed correctly.
      }

      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error submitting progress:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCompletionColor = () => {
    const percentage = formData.completionPercentage;
    if (percentage < 25) return '#ef4444';
    if (percentage < 50) return '#f97316';
    if (percentage < 75) return '#eab308';
    return '#22c55e';
  };

  const getCompletionEmoji = () => {
    const percentage = formData.completionPercentage;
    if (percentage === 0) return '🚀';
    if (percentage < 25) return '👶';
    if (percentage < 50) return '🔥';
    if (percentage < 75) return '💪';
    if (percentage < 100) return '';
    return '🎉';
  };

  return (
    <div className="progress-modal-overlay" onClick={onClose}>
      <div className="progress-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="progress-modal-header">
          <div>
            <h2 className="progress-modal-title">
              <span className="progress-emoji">{mode === 'log' ? '📝' : '📊'}</span>
              {mode === 'log' ? (initialProgress ? 'View/Edit Daily Log' : 'New Daily Log') : 'Update Project Progress'}
            </h2>
            <p className="progress-modal-subtitle">
              {project.title}
            </p>
          </div>
          <button className="progress-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="progress-form">

          {/* LOG MODE: Admin Feedback */}
          {mode === 'log' && initialProgress?.adminComment && (
            <div className="progress-section admin-feedback-section" style={{ background: '#f5f3ff', padding: '16px', borderRadius: '12px', border: '1px solid #ddd6fe', marginBottom: '20px' }}>
              <label className="progress-label" style={{ color: '#6d28d9' }}>
                <span className="label-icon">💬</span>
                Admin Feedback
              </label>
              <p style={{ margin: 0, fontSize: '14px', color: '#4c1d95', lineHeight: '1.5' }}>
                {initialProgress.adminComment}
              </p>
            </div>
          )}

          {/* LOG MODE: Date Display */}
          {mode === 'log' && (
            <div className="progress-section highlight-section">
              <label className="progress-label">
                <span className="label-icon">📅</span>
                Date
              </label>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                {(() => {
                  try {
                    const dStr = formData.logDate;
                    if (!dStr) return '';
                    const [y, m, d] = dStr.split('-').map(Number);
                    if (!y || !m || !d) return dStr;
                    const localDate = new Date(y, m - 1, d);
                    return localDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                  } catch (e) {
                    return formData.logDate;
                  }
                })()}
              </div>
            </div>
          )}

          {/* PROGRESS MODE: Slider */}
          {mode === 'progress' && (
            <div className="progress-section">
              <label className="progress-label">
                <span className="label-icon">{getCompletionEmoji()}</span>
                Overall Project Completion
              </label>
              <div className="percentage-display" style={{ color: getCompletionColor() }}>
                {formData.completionPercentage}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.completionPercentage}
                onChange={handleSliderChange}
                className="completion-slider"
                style={{
                  background: `linear-gradient(to right, ${getCompletionColor()} 0%, ${getCompletionColor()} ${formData.completionPercentage}%, #e5e7eb ${formData.completionPercentage}%, #e5e7eb 100%)`
                }}
              />
              <div className="percentage-labels">
                <span>Started</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* LOG MODE: Text Fields */}
          {mode === 'log' && (
            <>
              <div className="progress-section">
                <label className="progress-label">
                  <span className="label-icon"></span>
                  Key Achievements *
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  placeholder="What did you accomplish?"
                  className={`progress-textarea ${errors.achievements ? 'error' : ''}`}
                  rows="3"
                />
                {errors.achievements && <span className="error-text">{errors.achievements}</span>}
              </div>

              <div className="progress-section">
                <label className="progress-label">
                  <span className="label-icon"></span>
                  Challenges Faced
                </label>
                <textarea
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleChange}
                  placeholder="Any difficulties or blockers?"
                  className="progress-textarea"
                  rows="2"
                />
              </div>

              <div className="progress-section">
                <label className="progress-label">
                  <span className="label-icon"></span>
                  Plan for Tomorrow
                </label>
                <textarea
                  name="nextSteps"
                  value={formData.nextSteps}
                  onChange={handleChange}
                  placeholder="What's next?"
                  className="progress-textarea"
                  rows="2"
                />
              </div>
            </>
          )}

          <div className="progress-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save {mode === 'log' ? 'Log' : 'Progress'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectProgressForm;
