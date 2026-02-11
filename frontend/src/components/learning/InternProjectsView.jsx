import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import ProjectCard from './common/ProjectCard';
import LearningLoader from './common/LearningLoader';
import LearningEmptyState from './common/LearningEmptyState';
import ProjectProgressForm from './common/ProjectProgressForm';
import api from '../../services/api';
import '../InternProjectView.css';

const InternProjectsView = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressData, setProgressData] = useState({});
    const [currentIntern, setCurrentIntern] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await api.getMyLearning();
            setProjects(data.projects || []);

            if (data.internId) {
                setCurrentIntern({
                    id: data.internId,
                    name: data.internName,
                    email: data.internEmail
                });

                if (data.projects?.length > 0) {
                    const progress = await api.getProgressByIntern(data.internId);
                    const progressMap = {};
                    progress.forEach(p => {
                        progressMap[p.projectId] = p;
                    });
                    setProgressData(progressMap);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (project) => {
        setSelectedProject(project);
        setShowProgressModal(true);
    };

    const handleProgressSubmit = async (formData) => {
        try {
            await api.createOrUpdateProjectProgress(formData);
            await fetchProjects();
            alert('Progress saved successfully!');
        } catch (error) {
            console.error('Error saving progress:', error);
            throw error;
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage < 25) return '#ef4444';
        if (percentage < 50) return '#f97316';
        if (percentage < 75) return '#eab308';
        return '#22c55e';
    };

    if (loading) return <div className="dashboard-container"><Sidebar /><main className="main-content"><LearningLoader message="Loading your projects..." /></main></div>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1 className="page-title"> My Projects</h1>
                        <p className="page-subtitle">Track your project progress and achieve your goals</p>
                    </div>
                </header>

                <section className="learning-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">🚀</span>
                            Assigned Projects
                        </h2>
                        <span className="badge-count">{projects.length} Projects</span>
                    </div>

                    {projects.length === 0 ? (
                        <LearningEmptyState
                            icon="📦"
                            title="No Projects Assigned Yet"
                            description="Your assigned projects will appear here. Contact your admin for project assignments."
                        />
                    ) : (
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    progress={progressData[project.id]}
                                    onUpdate={handleUpdate}
                                    getProgressColor={getProgressColor}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {showProgressModal && selectedProject && currentIntern && (
                <ProjectProgressForm
                    intern={currentIntern}
                    project={selectedProject}
                    onClose={() => {
                        setShowProgressModal(false);
                        setSelectedProject(null);
                    }}
                    onSubmit={handleProgressSubmit}
                />
            )}
        </div>
    );
};

export default InternProjectsView;
