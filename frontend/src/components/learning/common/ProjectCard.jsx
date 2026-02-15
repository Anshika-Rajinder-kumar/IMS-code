import React from 'react';

const ProjectCard = ({ project, progress, onUpdate, getProgressColor }) => {
    const hasProgress = !!progress;
    const completionPercentage = progress?.completionPercentage || 0;

    return (
        <div className="project-card">
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
                    {progress.adminComment && (
                        <div className="admin-feedback-badge">
                            <span className="feedback-icon">💬</span>
                            Admin: {progress.adminComment.substring(0, 50)}...
                        </div>
                    )}
                </div>
            )}

            <button
                className="btn-get-started"
                onClick={() => onUpdate(project)}
            >
                <span className="btn-icon">{hasProgress ? '📊' : '🚀'}</span>
                {hasProgress ? 'Update Progress' : 'Get Started'}
            </button>
        </div>
    );
};

export default ProjectCard;
