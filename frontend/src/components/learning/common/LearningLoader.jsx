import React from 'react';

const LearningLoader = ({ message = 'Loading...' }) => (
    <div className="loading-container">
        <div className="spinner-large"></div>
        <p>{message}</p>
    </div>
);

export default LearningLoader;
