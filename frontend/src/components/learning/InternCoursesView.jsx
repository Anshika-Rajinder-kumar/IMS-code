import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import CourseCard from './common/CourseCard';
import LearningLoader from './common/LearningLoader';
import LearningEmptyState from './common/LearningEmptyState';
import api from '../../services/api';
import '../InternProjectView.css';

const InternCoursesView = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await api.getMyLearning();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="dashboard-container"><Sidebar /><main className="main-content"><LearningLoader message="Loading your courses..." /></main></div>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1 className="page-title"> My Courses</h1>
                        <p className="page-subtitle">Manage your assigned courses and learning resources</p>
                    </div>
                </header>

                <section className="learning-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">📚</span>
                            Assigned Courses
                        </h2>
                        <span className="badge-count">{courses.length} Courses</span>
                    </div>

                    {courses.length === 0 ? (
                        <LearningEmptyState
                            icon="📚"
                            title="No Courses Assigned Yet"
                            description="Your assigned courses will appear here. Contact your admin for course assignments."
                        />
                    ) : (
                        <div className="courses-grid">
                            {courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default InternCoursesView;
