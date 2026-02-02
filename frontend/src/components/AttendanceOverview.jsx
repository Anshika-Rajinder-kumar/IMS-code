import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from './Sidebar';
import './AttendanceOverview.css';

const AttendanceOverview = () => {
    const [interns, setInterns] = useState([]);
    const [selectedIntern, setSelectedIntern] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInterns();
    }, []);

    useEffect(() => {
        if (selectedIntern) {
            fetchAttendance();
        }
    }, [selectedIntern, selectedDate]);

    const fetchInterns = async () => {
        try {
            const data = await api.getInterns();
            setInterns(data);
            if (data.length > 0) setSelectedIntern(data[0].id);
        } catch (error) {
            console.error('Error fetching interns:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;
            const data = await api.getMonthlyAttendance(selectedIntern, year, month);
            setAttendanceRecords(data);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getInternData = () => {
        return interns.find(i => String(i.id) === String(selectedIntern));
    };

    const formatDuration = (seconds) => {
        if (!seconds || seconds < 0) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const calculateDurationSeconds = (start, end) => {
        if (!start || !end) return 0;
        const diff = new Date(end) - new Date(start);
        return Math.floor(diff / 1000);
    };

    const renderCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const intern = getInternData();
        const joinDate = intern?.joinDate ? new Date(intern.joinDate) : null;
        if (joinDate) joinDate.setHours(0, 0, 0, 0);

        const days = [];
        // Add empty cells for leading days
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(year, month, day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendanceRecords.find(r => r.date === dateStr);

            let statusClass = '';
            let statusLabel = '';
            let isFuture = currentDayDate > today;
            let isBeforeJoin = joinDate && currentDayDate < joinDate;
            let durationSeconds = 0;

            if (record) {
                statusClass = record.status.toLowerCase().replace('_', '-');
                statusLabel = record.status.replace('_', ' ');
                if (record.checkInTime && record.checkOutTime) {
                    durationSeconds = calculateDurationSeconds(record.checkInTime, record.checkOutTime);
                }
            } else if (isFuture) {
                statusClass = 'future';
                statusLabel = '-';
            } else if (isBeforeJoin) {
                statusClass = 'pre-join';
                statusLabel = 'N/A';
            } else {
                statusClass = 'absent';
                statusLabel = 'ABSENT';
            }

            days.push(
                <div key={day} className={`calendar-day ${statusClass}`}>
                    <div className="day-top">
                        <span className="day-number">{day}</span>
                        {record && (
                            <span className={`trust-indicator ${record.networkTrusted ? 'trusted' : 'untrusted'}`}>
                                {record.networkTrusted ? '✓' : '!'}
                            </span>
                        )}
                    </div>
                    <div className="day-status">{statusLabel}</div>
                    {record && (
                        <>
                            <div className="day-times">
                                <span title={`IP: ${record.ipAddress}\nUA: ${record.userAgent}`}>
                                    {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {record.checkOutTime && (
                                    <span> - {new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                            </div>
                            {durationSeconds > 0 && (
                                <div className="day-duration" title="Total Duration (HH:MM:SS)">
                                    {formatDuration(durationSeconds)}
                                </div>
                            )}
                        </>
                    )}
                </div>
            );
        }
        return days;
    };

    const renderStatistics = () => {
        const stats = {
            present: 0,
            halfDay: 0,
            absent: 0
        };

        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const intern = getInternData();
        const joinDate = intern?.joinDate ? new Date(intern.joinDate) : null;
        if (joinDate) joinDate.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(year, month, day);
            if (currentDayDate > today) continue;
            if (joinDate && currentDayDate < joinDate) continue;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendanceRecords.find(r => r.date === dateStr);

            if (record) {
                if (record.status === 'PRESENT') stats.present++;
                else if (record.status === 'HALF_DAY') stats.halfDay++;
                else stats.absent++;
            } else {
                stats.absent++;
            }
        }

        const total = stats.present + stats.halfDay + stats.absent;
        if (total === 0) return null;

        const presentDeg = (stats.present / total) * 360;
        const halfDayDeg = (stats.halfDay / total) * 360;

        // Simple SVG Pie Chart logic
        const radius = 50;
        const circumference = 2 * Math.PI * radius;

        const presentOffset = circumference - (stats.present / total) * circumference;
        const halfDayOffset = circumference - ((stats.present + stats.halfDay) / total) * circumference;
        const absentOffset = 0; // The base circle is absent color

        return (
            <div className="attendance-stats-card">
                <h3>Monthly Statistics</h3>
                <div className="stats-content">
                    <div className="chart-container">
                        <svg width="150" height="150" viewBox="0 0 120 120">
                            {/* Base circle for Absent */}
                            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#fed7d7" strokeWidth="15" />
                            {/* Half Day Slice */}
                            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#fefcbf" strokeWidth="15"
                                strokeDasharray={circumference}
                                strokeDashoffset={halfDayOffset}
                                transform="rotate(-90 60 60)" />
                            {/* Present Slice */}
                            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#c6f6d5" strokeWidth="15"
                                strokeDasharray={circumference}
                                strokeDashoffset={presentOffset}
                                transform="rotate(-90 60 60)" />
                            <text x="60" y="65" textAnchor="middle" className="chart-total-text">{total}</text>
                            <text x="60" y="80" textAnchor="middle" className="chart-sub-text">Total Days</text>
                        </svg>
                    </div>
                    <div className="stats-legend">
                        <div className="stat-item">
                            <span className="dot present"></span>
                            <span className="label">Present:</span>
                            <span className="value">{stats.present}</span>
                        </div>
                        <div className="stat-item">
                            <span className="dot half-day"></span>
                            <span className="label">Half Day:</span>
                            <span className="value">{stats.halfDay}</span>
                        </div>
                        <div className="stat-item">
                            <span className="dot absent"></span>
                            <span className="label">Absent:</span>
                            <span className="value">{stats.absent}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Attendance Overview</h1>
                </header>

                <div className="attendance-overview-wrapper">
                    <div className="attendance-main-section">
                        <div className="attendance-controls">
                            <div className="control-group">
                                <label>Select Intern:</label>
                                <select
                                    value={selectedIntern}
                                    onChange={(e) => setSelectedIntern(e.target.value)}
                                    className="select-input"
                                >
                                    {interns.map(intern => (
                                        <option key={intern.id} value={intern.id}>{intern.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="control-group">
                                <label>Select Month:</label>
                                <div className="month-picker">
                                    <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="btn-icon">←</button>
                                    <span className="current-month">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                                    <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="btn-icon">→</button>
                                </div>
                            </div>
                        </div>

                        <div className="calendar-container">
                            <div className="calendar-header">
                                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                            </div>
                            <div className="calendar-grid">
                                {loading ? <div className="loading-overlay">Loading...</div> : renderCalendar()}
                            </div>
                        </div>

                        <div className="attendance-legend">
                            <div className="legend-item"><span className="legend-box present"></span> Present</div>
                            <div className="legend-item"><span className="legend-box half-day"></span> Half Day</div>
                            <div className="legend-item"><span className="legend-box absent"></span> Absent</div>
                            <div className="legend-item"><span className="legend-box pre-join"></span> Not Joined</div>
                        </div>
                    </div>

                    <div className="attendance-side-section">
                        {renderStatistics()}
                        {getInternData() && (
                            <div className="intern-mini-info">
                                <h3>Intern Info</h3>
                                <p><strong>Joined:</strong> {getInternData().joinDate || 'N/A'}</p>
                                <p><strong>Status:</strong> {getInternData().status}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AttendanceOverview;
