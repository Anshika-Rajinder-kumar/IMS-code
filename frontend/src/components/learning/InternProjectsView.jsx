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
    const [selectedDate, setSelectedDate] = useState(null);
    const [formMode, setFormMode] = useState('log'); // 'log' or 'progress'
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressData, setProgressData] = useState({});
    const [currentIntern, setCurrentIntern] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            if (projects.length === 0) setLoading(true);
            const data = await api.getMyLearning();

            if (!data) {
                setLoading(false);
                return;
            }

            setProjects(data.projects || []);

            if (data.internId) {
                setCurrentIntern({
                    id: data.internId,
                    name: data.internName,
                    email: data.internEmail,
                    joinDate: data.joinDate
                });

                if (data.projects?.length > 0) {
                    const progress = await api.getProgressByIntern(data.internId);
                    const progressMap = {};
                    if (Array.isArray(progress)) {
                        progress.forEach(p => {
                            if (!progressMap[p.projectId]) {
                                progressMap[p.projectId] = [];
                            }
                            progressMap[p.projectId].push(p);
                        });
                    }
                    setProgressData(progressMap);

                    // Select first project by default if none selected
                    if (!selectedProject && data.projects.length > 0) {
                        setSelectedProject(data.projects[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (date = null, mode = 'log') => {
        if (selectedProject) {
            setSelectedDate(date);
            setFormMode(mode);
            setShowProgressModal(true);
        }
    };

    const handleProgressSubmit = async (formData) => {
        try {
            await api.createOrUpdateProjectProgress(formData);
            await fetchProjects();
            alert('Progress saved successfully!');
            setShowProgressModal(false);
        } catch (error) {
            console.error('Error saving progress:', error);
            throw error;
        }
    };

    // Calendar Logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const renderCalendar = () => {
        if (!selectedProject) {
            return (
                <div className="calendar-placeholder">
                    <div className="placeholder-icon">📅</div>
                    <p>Select a project to view your log history.</p>
                </div>
            );
        }

        const projectLogs = progressData[selectedProject.id] || [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty cells for first week
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        const joinDate = currentIntern?.joinDate ? new Date(currentIntern.joinDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayDate = new Date(year, month, d);
            const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

            const log = projectLogs.find(p => p.logDate === dateStr);

            let statusClass = '';
            let statusText = '-';

            if (joinDate && dayDate < joinDate) {
                statusText = 'N/A';
                statusClass = 'not-applicable';
            } else if (dayDate > today) {
                statusText = '-';
                statusClass = 'future';
            } else if (log) {
                statusText = 'LOGGED';
                statusClass = 'logged';
            } else if (!isWeekend) {
                statusText = 'MISSING';
                statusClass = 'missing';
            } else {
                statusText = 'WEEKEND';
                statusClass = 'not-applicable'; // Use N/A style for weekends to keep it clean
            }

            const isToday = dayDate.getTime() === today.getTime();

            days.push(
                <div
                    key={d}
                    className={`calendar-day ${statusClass} ${isToday ? 'selected' : ''}`}
                    onClick={() => {
                        // Allow updates for past days or today if not logged (or even if logged to edit?)
                        // User requirement: "intern can able to update the logs for each date... by selectiong the icon date"
                        // Assuming they can edit existing logs too
                        if (!isWeekend && (dayDate <= today)) {
                            // Pass the date string directly to avoid timezone issues
                            handleUpdate(dateStr, 'log');
                        }
                    }}
                    style={{ cursor: (!isWeekend && dayDate <= today) ? 'pointer' : 'default' }}
                >
                    <span className="day-number">{d}</span>
                    <div className="day-status-pill">{statusText}</div>
                    {log?.adminComment && <span className="tick-icon" title="Feedback Received">💬</span>}
                    {isToday && !log && !isWeekend && (
                        <span className="tick-icon" style={{ color: '#2563eb' }}>+</span>
                    )}
                </div>
            );
        }

        return (
            <div className="calendar-grid">
                {dayNames.map(name => <div key={name} className="day-name">{name}</div>)}
                {days}
            </div>
        );
    };

    if (loading) return <div className="dashboard-container"><Sidebar /><main className="main-content"><LearningLoader message="Loading your projects..." /></main></div>;

    // Calculate progress for selected project
    let displayPercentage = 0;
    if (selectedProject) {
        const projLogs = progressData[selectedProject.id] || [];
        if (projLogs.length > 0) {
            const latestLog = [...projLogs].sort((a, b) => b.logDate.localeCompare(a.logDate))[0];
            displayPercentage = latestLog.completionPercentage;
        }
    }

    const getProgressColor = (percentage) => {
        if (percentage < 25) return '#ef4444';
        if (percentage < 50) return '#f97316';
        if (percentage < 75) return '#eab308';
        return '#22c55e';
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1 className="page-title">My Projects</h1>
                        <p className="page-subtitle">Track your progress and submit daily logs</p>
                    </div>
                </header>

                {projects.length === 0 ? (
                    <LearningEmptyState
                        icon="📦"
                        title="No Projects Assigned Yet"
                        description="Your assigned projects will appear here. Contact your admin for project assignments."
                    />
                ) : (
                    <div className="project-split-view">
                        {/* Left Side: Project List & Status */}
                        <div className="project-list-section">
                            <div className="project-list-card">
                                <h3 className="calendar-card-title">Your Projects</h3>
                                {projects.map(project => (
                                    <div
                                        key={project.id}
                                        className={`project-list-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <div style={{ fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{project.title}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {(progressData[project.id] || []).length} logs submitted
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedProject && (
                                <div className="project-list-card" style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <h3 className="calendar-card-title" style={{ fontSize: '16px' }}>Current Progress</h3>
                                    <div className="circular-progress-main">
                                        <div
                                            className="completion-circle-large"
                                            style={{
                                                width: '140px',
                                                height: '140px',
                                                background: `conic-gradient(${getProgressColor(displayPercentage)} ${displayPercentage * 3.6}deg, #ffe0e0 0deg)`
                                            }}
                                        >
                                            <div className="completion-inner-large" style={{ width: '110px', height: '110px' }}>
                                                <span className="completion-value-large" style={{ fontSize: '32px' }}>
                                                    {displayPercentage}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '16px' }}>
                                        <button
                                            className="btn-get-started"
                                            onClick={() => handleUpdate(null, 'progress')}
                                            style={{ padding: '10px 16px', fontSize: '14px' }}
                                        >
                                            Update Progress
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Calendar */}
                        <div className="calendar-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 className="calendar-card-title" style={{ margin: 0 }}>
                                    {selectedProject ? `${selectedProject.title} - Log History` : 'Project Log History'}
                                </h3>
                                <div className="month-controls" style={{ margin: 0 }}>
                                    <button onClick={handlePrevMonth} className="month-btn">←</button>
                                    <span className="current-month-label">{monthName}</span>
                                    <button onClick={handleNextMonth} className="month-btn">→</button>
                                </div>
                            </div>
                            {renderCalendar()}
                        </div>
                    </div>
                )}
            </main>

            {showProgressModal && selectedProject && currentIntern && (
                <ProjectProgressForm
                    intern={currentIntern}
                    project={selectedProject}
                    initialDate={selectedDate} // Now passing a string or null
                    mode={formMode}
                    initialProgress={
                        // Check if we have a log for the selected date specifically
                        selectedDate
                            ? (progressData[selectedProject.id] || []).find(p => p.logDate === selectedDate) // Comparing strings
                            : (progressData[selectedProject.id] || []).length > 0
                                ? [...progressData[selectedProject.id]].sort((a, b) => b.logDate.localeCompare(a.logDate))[0]
                                : null
                    }
                    onClose={() => {
                        setShowProgressModal(false);
                        setSelectedDate(null);
                    }}
                    onSubmit={handleProgressSubmit}
                />
            )}
        </div>
    );
};

export default InternProjectsView;
