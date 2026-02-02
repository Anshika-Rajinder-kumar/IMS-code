import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from './Sidebar';
import Toast from './Toast';
import './Attendance.css';

const Attendance = () => {
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            setLoading(true);
            const data = await api.getTodayAttendance();
            setAttendance(data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setToast({ message: 'Failed to fetch attendance status', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            const data = await api.checkIn();
            setAttendance(data);
            setToast({ message: 'Checked in successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.message || 'Check-in failed', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        const confirmCheckOut = window.confirm("Are you sure to check-out?");
        if (!confirmCheckOut) return;

        try {
            setActionLoading(true);
            const data = await api.checkOut();
            setAttendance(data);
            setToast({ message: 'Checked out successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.message || 'Check-out failed', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (dateTimeString) => {
        if (!dateTimeString) return '--:--';
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PRESENT': return 'status-present';
            case 'HALF_DAY': return 'status-half-day';
            case 'ABSENT': return 'status-absent';
            default: return 'status-none';
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Daily Attendance</h1>
                        <p className="subtitle">{today}</p>
                    </div>
                </header>

                <div className="attendance-card">
                    {loading ? (
                        <div className="loader">Loading...</div>
                    ) : (
                        <>
                            <div className="attendance-status-section">
                                <span className="status-label">Today's Status:</span>
                                <span className={`status-badge ${getStatusBadgeClass(attendance?.status)}`}>
                                    {attendance?.status || 'NOT MARKED'}
                                </span>
                            </div>

                            {attendance && attendance.networkTrusted === false && (
                                <div className="network-warning">
                                    <span className="warning-icon">⚠️</span>
                                    <span>Attendance marked from an untrusted network.</span>
                                </div>
                            )}

                            <div className="attendance-times">
                                <div className="time-box">
                                    <span className="time-label">Check-In</span>
                                    <span className="time-value">{formatTime(attendance?.checkInTime)}</span>
                                </div>
                                <div className="time-box">
                                    <span className="time-label">Check-Out</span>
                                    <span className="time-value">{formatTime(attendance?.checkOutTime)}</span>
                                </div>
                            </div>

                            <div className="attendance-actions">
                                <button
                                    className="btn btn-primary check-in-btn"
                                    onClick={handleCheckIn}
                                    disabled={attendance !== null || actionLoading}
                                >
                                    {actionLoading && attendance === null ? 'Checking in...' : 'Check-In'}
                                </button>
                                <button
                                    className="btn btn-secondary check-out-btn"
                                    onClick={handleCheckOut}
                                    disabled={!attendance || attendance.checkOutTime !== null || actionLoading}
                                >
                                    {actionLoading && attendance?.checkInTime && !attendance.checkOutTime ? 'Checking out...' : 'Check-Out'}
                                </button>
                            </div>

                            <div className="attendance-info">
                                <p>Note: Check-in records you as <strong>HALF_DAY</strong>. Check-out updates status to <strong>PRESENT</strong>.</p>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Attendance;
