import React from 'react';

const CourseCard = ({ course }) => (
    <div className="course-card">
        <div className="course-icon">📖</div>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        <div className="course-footer">
            <span className="course-badge">{course.duration}</span>
            <span className="course-badge">{course.difficulty}</span>
        </div>
    </div>
);

export default CourseCard;
