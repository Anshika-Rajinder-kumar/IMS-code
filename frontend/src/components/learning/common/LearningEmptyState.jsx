import React from 'react';

const LearningEmptyState = ({ icon, title, description }) => (
    <div className="empty-state">
        <div className="empty-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

export default LearningEmptyState;
