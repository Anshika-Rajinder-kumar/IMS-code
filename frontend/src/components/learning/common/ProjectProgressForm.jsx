import React, { useState } from 'react';
import './ProjectProgressForm.css';

const ProjectProgressForm = ({ intern, project, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    completionPercentage: 0,
    description: '',
    challenges: '',
    achievements: '',
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
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe what you have completed';
    }
    
    if (formData.completionPercentage > 0 && !formData.achievements.trim()) {
      newErrors.achievements = 'Please share your achievements';
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
    if (percentage < 100) return '🎯';
    return '🎉';
  };

  return (
    <div className="progress-modal-overlay" onClick={onClose}>
      <div className="progress-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="progress-modal-header">
          <div>
            <h2 className="progress-modal-title">
              <span className="progress-emoji">📊</span>
              Update Project Progress
            </h2>
            <p className="progress-modal-subtitle">
              Track your journey on <strong>{project.title}</strong>
            </p>
          </div>
          <button className="progress-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="progress-form">
          {/* Completion Percentage */}
          <div className="progress-section highlight-section">
            <label className="progress-label">
              <span className="label-icon">{getCompletionEmoji()}</span>
              How much have you completed?
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
              <span>Just Started</span>
              <span>In Progress</span>
              <span>Almost There</span>
              <span>Complete!</span>
            </div>
          </div>

          {/* Description */}
          <div className="progress-section">
            <label className="progress-label">
              <span className="label-icon">📝</span>
              What have you completed so far? *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the work you've completed, features implemented, modules finished, etc."
              className={`progress-textarea ${errors.description ? 'error' : ''}`}
              rows="4"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Achievements */}
          <div className="progress-section">
            <label className="progress-label">
              <span className="label-icon">🏆</span>
              Key Achievements {formData.completionPercentage > 0 && '*'}
            </label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              placeholder="What are you proud of? What milestones did you reach?"
              className={`progress-textarea ${errors.achievements ? 'error' : ''}`}
              rows="3"
            />
            {errors.achievements && <span className="error-text">{errors.achievements}</span>}
          </div>

          {/* Challenges */}
          <div className="progress-section">
            <label className="progress-label">
              <span className="label-icon">🚧</span>
              Challenges Faced (Optional)
            </label>
            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="What difficulties did you encounter? What blockers are you facing?"
              className="progress-textarea"
              rows="3"
            />
          </div>

          {/* Next Steps */}
          <div className="progress-section">
            <label className="progress-label">
              <span className="label-icon">🎯</span>
              Next Steps (Optional)
            </label>
            <textarea
              name="nextSteps"
              value={formData.nextSteps}
              onChange={handleChange}
              placeholder="What are you planning to work on next?"
              className="progress-textarea"
              rows="3"
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
