import React, { useState } from 'react';
import './ProjectProgressForm.css';

const ProjectProgressForm = ({ intern, project, initialProgress, initialDate, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    completionPercentage: initialProgress?.completionPercentage || 0,
    logDate: initialProgress?.logDate || (initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    description: '',
    achievements: '',
    challenges: '',
    nextSteps: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
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

    if (!formData.logDate) {
      newErrors.logDate = 'Please select a date';
    }

    if (!formData.achievements.trim()) {
      newErrors.achievements = 'Please share your daily achievements';
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
      await onSubmit({
        internId: intern.id,
        projectId: project.id,
        ...formData,
        completionPercentage: parseInt(formData.completionPercentage)
      });
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
              <span className="progress-emoji">📊</span>
              {initialProgress ? 'Edit Daily Log' : 'New Daily Log'}
            </h2>
            <p className="progress-modal-subtitle">
              Track your journey on <strong>{project.title}</strong>
            </p>
          </div>
          <button className="progress-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="progress-form">
          {/* Admin Comment Read-Only Section */}
          {initialProgress?.adminComment && (
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

          {/* Date Selection */}
          <div className="progress-section highlight-section">
            <label className="progress-label">
              <span className="label-icon">📅</span>
              Select Date for Entry
            </label>
            <input
              type="date"
              name="logDate"
              value={formData.logDate}
              onChange={handleChange}
              min={intern.joinDate}
              max={new Date().toISOString().split('T')[0]}
              disabled={!!initialDate || !!initialProgress} // Disable date change if editing or specific date clicked
              className={`progress-date-input ${errors.logDate ? 'error' : ''}`}
            />
            {errors.logDate && <span className="error-text">{errors.logDate}</span>}
            <p className="field-hint">Record daily updates between {intern.joinDate || 'joining date'} and today.</p>
          </div>

          {/* Completion Percentage */}
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

          {/* Achievements */}
          <div className="progress-section">
            <label className="progress-label">
              <span className="label-icon"></span>
              Key Achievements *
            </label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              placeholder="What did you accomplish today?"
              className={`progress-textarea ${errors.achievements ? 'error' : ''}`}
              rows="3"
            />
            {errors.achievements && <span className="error-text">{errors.achievements}</span>}
          </div>

          {/* Challenges */}
          <div className="progress-section">
            <label className="progress-label">
              <span className="label-icon"></span>
              Challenges Faced
            </label>
            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="Any difficulties or blockers encountered today?"
              className="progress-textarea"
              rows="2"
            />
          </div>

          {/* Next Steps */}
          <div className="progress-section">
            <label className="progress-label">
              <span className="label-icon"></span>
              Plan for Tomorrow
            </label>
            <textarea
              name="nextSteps"
              value={formData.nextSteps}
              onChange={handleChange}
              placeholder="What do you plan to work on next?"
              className="progress-textarea"
              rows="2"
            />
          </div>

          {/* Action Buttons */}
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
                  Save Progress
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
