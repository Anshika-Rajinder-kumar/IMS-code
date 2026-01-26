import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './CourseProjectPool.css';

const CourseProjectPool = () => {
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        difficulty: 'Beginner'
    });

    useEffect(() => {
        fetchPools();
    }, []);

    const fetchPools = async () => {
        try {
            setLoading(true);
            const [coursesData, projectsData] = await Promise.all([
                api.getCoursePool(),
                api.getProjectPool()
            ]);
            setCourses(coursesData.sort((a, b) => a.title.localeCompare(b.title)));
            setProjects(projectsData.sort((a, b) => a.title.localeCompare(b.title)));
        } catch (err) {
            console.error('Error fetching pools:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'courses') {
                await api.createCourse(formData);
            } else {
                await api.createProject(formData);
            }
            alert(`${activeTab === 'courses' ? 'Course' : 'Project'} added successfully!`);
            setShowModal(false);
            setFormData({ title: '', description: '', duration: '', difficulty: 'Beginner' });
            fetchPools();
        } catch (err) {
            alert('Error adding item: ' + err.message);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type === 'course' ? 'course' : 'project'}?`)) return;

        try {
            if (type === 'course') {
                await api.deleteCourse(id);
            } else {
                await api.deleteProject(id);
            }
            alert('Deleted successfully!');
            fetchPools();
        } catch (err) {
            alert(err.message);
        }
    };

    const renderPoolList = (items, type) => (
        <div className="pool-grid">
            {items.length === 0 ? (
                <div className="empty-pool card">
                    <p>No {type}s available in the pool.</p>
                </div>
            ) : (
                items.map(item => (
                    <div key={item.id} className="pool-item card">
                        <div className="pool-item-header">
                            <h3>{item.title}</h3>
                            <span className="badge badge-info">{item.difficulty}</span>
                        </div>
                        <p className="pool-item-desc">{item.description}</p>
                        <div className="pool-item-footer">
                            <span className="duration">⏱️ {item.duration}</span>
                            <button
                                className="btn-delete-icon"
                                onClick={() => handleDelete(item.id, type)}
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1 className="page-title">Course & Project Pool</h1>
                        <p className="page-subtitle">Manage the master list of learning resources</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        ➕ Add {activeTab === 'courses' ? 'New Course' : 'New Project'}
                    </button>
                </header>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        📚 Courses Pool
                    </button>
                    <button
                        className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        🎯 Projects Pool
                    </button>
                </div>

                <div className="pool-content" style={{ marginTop: '24px' }}>
                    {loading ? (
                        <div className="status-msg">Loading pool items...</div>
                    ) : (
                        activeTab === 'courses' ? renderPoolList(courses, 'course') : renderPoolList(projects, 'project')
                    )}
                </div>

                {/* Add Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add {activeTab === 'courses' ? 'Course' : 'Project'}</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Duration *</label>
                                        <input
                                            type="text"
                                            name="duration"
                                            placeholder="e.g. 2 weeks"
                                            className="form-input"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Difficulty *</label>
                                        <select
                                            name="difficulty"
                                            className="form-input"
                                            value={formData.difficulty}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save to Pool</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CourseProjectPool;
