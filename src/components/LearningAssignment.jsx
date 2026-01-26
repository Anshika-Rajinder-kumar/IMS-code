import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './LearningAssignment.css';

const LearningAssignment = () => {
    const [interns, setInterns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIntern, setSelectedIntern] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchActiveInterns();
        fetchPools();
    }, []);

    const fetchActiveInterns = async (term = '') => {
        try {
            setLoading(true);
            const data = await api.getActiveInterns(term);
            setInterns(data);
        } catch (err) {
            console.error('Error fetching interns:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPools = async () => {
        try {
            const [courses, projects] = await Promise.all([
                api.getCoursePool(),
                api.getProjectPool()
            ]);
            setAvailableCourses(courses.sort((a, b) => a.title.localeCompare(b.title)));
            setAvailableProjects(projects.sort((a, b) => a.title.localeCompare(b.title)));
        } catch (err) {
            console.error('Error fetching pools:', err);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchActiveInterns(value);
    };

    const handleInternSelect = (intern) => {
        setSelectedIntern(intern);
        const assignedCourseIds = intern.assignedCourses ? intern.assignedCourses.map(c => c.id) : [];
        const assignedProjectIds = intern.assignedProjects ? intern.assignedProjects.map(p => p.id) : [];
        setSelectedCourses(assignedCourseIds);
        setSelectedProjects(assignedProjectIds);
        setInitialAssignment({ courses: assignedCourseIds, projects: assignedProjectIds });
        setHasChanges(false);
    };

    const [initialAssignment, setInitialAssignment] = useState({ courses: [], projects: [] });

    useEffect(() => {
        if (!selectedIntern) return;

        const coursesChanged = JSON.stringify([...selectedCourses].sort()) !== JSON.stringify([...initialAssignment.courses].sort());
        const projectsChanged = JSON.stringify([...selectedProjects].sort()) !== JSON.stringify([...initialAssignment.projects].sort());

        setHasChanges(coursesChanged || projectsChanged);
    }, [selectedCourses, selectedProjects, initialAssignment]);

    const handleCourseToggle = (courseId) => {
        setSelectedCourses(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const handleProjectToggle = (projectId) => {
        setSelectedProjects(prev =>
            prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
        );
    };

    const handleSave = async () => {
        if (!selectedIntern) return;
        try {
            setSaving(true);
            setStatusMessage({ text: '', type: '' });
            await api.assignLearning(selectedIntern.id, selectedCourses, selectedProjects);
            setStatusMessage({ text: '✅ Courses assigned successfully!', type: 'success' });

            // Refresh intern list to get updated assignments
            const updatedInterns = await api.getActiveInterns(searchTerm);
            setInterns(updatedInterns);
            const updatedSelected = updatedInterns.find(i => i.id === selectedIntern.id);
            if (updatedSelected) {
                handleInternSelect(updatedSelected);
            }

            setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setStatusMessage({ text: '❌ Failed to save: ' + err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content assignment-page">
                <header className="dashboard-header">
                    <h1 className="page-title">Assign Courses</h1>
                    <p className="page-subtitle">Assign courses and projects to active interns</p>
                </header>

                <div className="assignment-layout">
                    {/* Left Panel: Active Interns */}
                    <div className="intern-list-panel card">
                        <div className="panel-header">
                            <h3>Active Interns</h3>
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search name, email, college..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                        <div className="intern-list">
                            {loading ? (
                                <p className="status-msg">Loading interns...</p>
                            ) : interns.length === 0 ? (
                                <p className="status-msg">No active interns found.</p>
                            ) : (
                                interns.map(intern => (
                                    <div
                                        key={intern.id}
                                        className={`intern-item ${selectedIntern?.id === intern.id ? 'active' : ''}`}
                                        onClick={() => handleInternSelect(intern)}
                                    >
                                        <div className="intern-avatar">
                                            {intern.name.charAt(0)}
                                        </div>
                                        <div className="intern-info">
                                            <div className="intern-name">{intern.name}</div>
                                            <div className="intern-meta">{intern.email}</div>
                                            <div className="intern-meta">{intern.collegeName}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Assignment Form */}
                    <div className="assignment-panel card">
                        {!selectedIntern ? (
                            <div className="empty-state">
                                <span style={{ fontSize: '48px' }}>👈</span>
                                <h3>Select an intern to start assigning</h3>
                            </div>
                        ) : (
                            <>
                                <div className="panel-header">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <h3>Assigning for: {selectedIntern.name}</h3>
                                        <button
                                            className="btn btn-primary"
                                            disabled={!hasChanges || saving}
                                            onClick={handleSave}
                                        >
                                            {saving ? 'Saving...' : '💾 Save Changes'}
                                        </button>
                                    </div>
                                </div>

                                {statusMessage.text && (
                                    <div className={`status-banner ${statusMessage.type}`} style={{
                                        margin: '0 24px',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                                        color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                                    }}>
                                        {statusMessage.text}
                                    </div>
                                )}

                                <div className="assignment-sections">
                                    <div className="assignment-section">
                                        <h4>📚 Course Pool</h4>
                                        <div className="checkbox-list">
                                            {availableCourses.map(course => (
                                                <label key={course.id} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCourses.includes(course.id)}
                                                        onChange={() => handleCourseToggle(course.id)}
                                                    />
                                                    <div className="item-detail">
                                                        <span className="item-title">{course.title}</span>
                                                        <span className="item-subtitle">{course.duration} • {course.difficulty}</span>
                                                    </div>
                                                </label>
                                            ))}
                                            {availableCourses.length === 0 && <p className="empty-msg">No courses in pool.</p>}
                                        </div>
                                    </div>

                                    <div className="assignment-section">
                                        <h4>🎯 Project Pool</h4>
                                        <div className="checkbox-list">
                                            {availableProjects.map(project => (
                                                <label key={project.id} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProjects.includes(project.id)}
                                                        onChange={() => handleProjectToggle(project.id)}
                                                    />
                                                    <div className="item-detail">
                                                        <span className="item-title">{project.title}</span>
                                                        <span className="item-subtitle">{project.duration} • {project.difficulty}</span>
                                                    </div>
                                                </label>
                                            ))}
                                            {availableProjects.length === 0 && <p className="empty-msg">No projects in pool.</p>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LearningAssignment;
