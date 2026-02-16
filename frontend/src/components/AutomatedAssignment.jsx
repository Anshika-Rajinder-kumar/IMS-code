import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './AutomatedAssignment.css';

const AutomatedAssignment = () => {
    const [interns, setInterns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIntern, setSelectedIntern] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [saving, setSaving] = useState(false);
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
            setAvailableCourses(courses);
            setAvailableProjects(projects);
        } catch (err) {
            console.error('Error fetching pools:', err);
        }
    };

    const fetchInternAnalysis = async (internId) => {
        try {
            setProcessing(true);
            const data = await api.get(`/v1/automated-assignment/analysis?internId=${internId}`);
            if (data) {
                setResult(data);
                setStatusMessage({ text: 'Retrieved existing AI analysis.', type: 'info' });
            } else {
                setResult(null);
                setStatusMessage({ text: '', type: '' });
            }
        } catch (err) {
            console.error('Error fetching analysis:', err);
        } finally {
            setProcessing(false);
        }
    };

    const handleInternSelect = (intern) => {
        setSelectedIntern(intern);
        setResult(null);
        setStatusMessage({ text: '', type: '' });
        setSelectedCourses(intern.assignedCourses ? intern.assignedCourses.map(c => c.id) : []);
        setSelectedProjects(intern.assignedProjects ? intern.assignedProjects.map(p => p.id) : []);

        // Fetch existing analysis if any
        fetchInternAnalysis(intern.id);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (!file || !selectedIntern) return;

        try {
            setProcessing(true);
            setResult(null);
            setStatusMessage({ text: 'Processing resume... Parsing skills and analyzing gaps.', type: 'info' });

            const formData = new FormData();
            formData.append('file', file);

            const data = await api.uploadFile(`/v1/automated-assignment/upload?internId=${selectedIntern.id}`, formData);

            setResult(data);

            if (data.gapReport) {
                setStatusMessage({ text: 'Resume processed! Assignments have been recommended.', type: 'success' });
                fetchActiveInterns(searchTerm);
            }
        } catch (err) {
            setStatusMessage({ text: 'Error: ' + err.message, type: 'error' });
            console.error('Upload error:', err);
        } finally {
            setProcessing(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleOverride = async () => {
        try {
            setSaving(true);
            await api.post(`/v1/automated-assignment/override?internId=${selectedIntern.id}`, {
                projectIds: selectedProjects,
                courseIds: selectedCourses
            });

            setStatusMessage({ text: 'Assignments updated successfully!', type: 'success' });

            // Refresh intern data to update UI
            const updatedInterns = await api.getActiveInterns(searchTerm);
            setInterns(updatedInterns);
            const current = updatedInterns.find(i => i.id === selectedIntern.id);
            if (current) setSelectedIntern(current);

        } catch (err) {
            setStatusMessage({ text: 'Error: ' + err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const renderSkillGaps = (gapReport) => {
        const { matchingSkills, missingSkills, matchPercentage } = gapReport;

        return (
            <div className="ai-insights-grid">
                <div className="insight-card score-card">
                    <div className="match-wheel" style={{ '--percentage': `${matchPercentage}` }}>
                        <div className="wheel-inner">
                            <span className="score-value">{matchPercentage.toFixed(0)}%</span>
                            <span className="score-label">Match</span>
                        </div>
                    </div>
                    <div className="insight-text">
                        <h5>Match Score</h5>
                        <p>Based on {selectedIntern.name}'s resume vs Project requirements.</p>
                    </div>
                </div>

                <div className="insight-card breakdown-card">
                    <div className="breakdown-section">
                        <div className="breakdown-section-header">✅ Matching ({matchingSkills.length})</div>
                        <div className="skills-cloud-mini">
                            {matchingSkills.map(s => <span key={s} className="skill-chip match">{s}</span>)}
                        </div>
                    </div>
                    <div className="breakdown-line"></div>
                    <div className="breakdown-section">
                        <div className="breakdown-section-header">❌ Missing ({missingSkills.length})</div>
                        <div className="skills-cloud-mini">
                            {missingSkills.map(s => <span key={s} className="skill-chip gap">{s}</span>)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="assignment-container">
            <Sidebar />
            <main className="assignment-main">
                <div className="assignment-glass-header">
                    <div>
                        <h1 className="assignment-title">Assignment System</h1>
                        <p className="assignment-subtitle">Automated Skill Gap Analysis & Resource Allocation</p>
                    </div>
                    {statusMessage.text && (
                        <div className={`assignment-toast ${statusMessage.type} fade-in`}>
                            {statusMessage.type === 'success' ? '✅' : 'ℹ️'} {statusMessage.text}
                        </div>
                    )}
                </div>

                <div className="assignment-split">
                    <aside className="assignment-sidebar shadow-premium">
                        <div className="sidebar-search">
                            <input
                                type="text"
                                className="search-pill"
                                placeholder="Search by name or branch..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); fetchActiveInterns(e.target.value); }}
                            />
                        </div>
                        <div className="intern-scroll">
                            {interns.map(intern => (
                                <div
                                    key={intern.id}
                                    className={`intern-card-mini ${selectedIntern?.id === intern.id ? 'active' : ''}`}
                                    onClick={() => handleInternSelect(intern)}
                                >
                                    <div className="intern-info">
                                        <span className="intern-name">{intern.name}</span>
                                        <span className="intern-branch">{intern.branch}</span>
                                    </div>
                                    <div className="intern-status-dot active"></div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <section className="assignment-content">
                        {selectedIntern ? (
                            <div className="intern-workspace fade-in">
                                <div className="workspace-header">
                                    <div className="intern-profile-hero">
                                        <div className="avatar-placeholder">{selectedIntern.name[0]}</div>
                                        <div>
                                            <h2>{selectedIntern.name}</h2>
                                            <p>{selectedIntern.branch} | {selectedIntern.email}</p>
                                        </div>
                                    </div>
                                    <div className="workspace-actions">
                                        <label className="btn-ai-scan">
                                            {processing ? (
                                                <span className="ai-loader"></span>
                                            ) : (
                                                ' Upload & Analyze Resume'
                                            )}
                                            <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                                        </label>
                                    </div>
                                </div>

                                {result ? (
                                    <div className="ai-report-view">
                                        <div className="report-row">
                                            <div className="report-col-main">
                                                <div className="card-premium glass-morph">
                                                    <h4> Extracted Skills</h4>
                                                    <div className="full-skills-cloud">
                                                        {result.extractedSkills.map(s => (
                                                            <span key={s} className="skill-tag-animated">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="card-premium glass-morph mt-4">
                                                    <h4> Skills Gap Analysis: {result.gapReport.projectTitle}</h4>
                                                    {renderSkillGaps(result.gapReport)}
                                                </div>
                                            </div>

                                            <aside className="report-col-side">
                                                <div className="card-premium ai-summary-card">
                                                    <h5>Project and Course Recommendations</h5>
                                                    <div className="rec-item">
                                                        <span className="rec-label">Project:</span>
                                                        <div className="rec-value highlight">{result.assignedProject?.title || result.gapReport.projectTitle}</div>
                                                    </div>
                                                    <div className="rec-item">
                                                        <span className="rec-label">Target Courses:</span>
                                                        {result.recommendedCourses.map(c => (
                                                            <div key={c.id} className="rec-value-pill">{c.title}</div>
                                                        ))}
                                                        {result.recommendedCourses.length === 0 && <div className="rec-value empty">No courses needed</div>}
                                                    </div>
                                                </div>
                                            </aside>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="workflow-status card-premium">
                                        <div className="workflow-icon">📄</div>
                                        <h4>Process Resume to Begin</h4>
                                        <p>Upload the intern's latest resume to extract skills and automatically find the best project match.</p>
                                    </div>
                                )}

                                <div className="manual-override-workspace mt-5">
                                    <div className="section-title-alt">
                                        <h3>Finalize Project & Course Assignments</h3>
                                        <p>Modify recommendations if needed</p>
                                    </div>

                                    <div className="override-grid">
                                        <div className="override-card">
                                            <h5>Projects Pool</h5>
                                            <div className="chip-selection">
                                                {availableProjects.map(p => (
                                                    <button
                                                        key={p.id}
                                                        className={`chip-btn ${selectedProjects.includes(p.id) ? 'selected' : ''}`}
                                                        onClick={() => setSelectedProjects(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                                    >
                                                        {p.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="override-card">
                                            <h5>Learning Path</h5>
                                            <div className="chip-selection">
                                                {availableCourses.map(c => (
                                                    <button
                                                        key={c.id}
                                                        className={`chip-btn secondary ${selectedCourses.includes(c.id) ? 'selected' : ''}`}
                                                        onClick={() => setSelectedCourses(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                                                    >
                                                        {c.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="override-footer">
                                        <button className="btn-premium-action" onClick={handleOverride} disabled={saving}>
                                            {saving ? 'Syncing...' : ' Assign Projects & Courses'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-workspace fade-in">
                                <div className="ai-pulse"></div>
                                <h3>Skill Assignment Engine</h3>
                                <p>Select an intern from the left panel to start the AI analysis workflow.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AutomatedAssignment;
