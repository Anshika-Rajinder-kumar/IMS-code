import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import api from '../services/api';
import './Interns.css';

const Interns = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingIntern, setEditingIntern] = useState(null);

  const [interns, setInterns] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    collegeName: '',
    branch: '',
    cgpa: '',
    joinDate: '',
    address: '',
    emergencyContact: '',
    status: 'DOCUMENT_PENDING'
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInterns();
  }, [navigate]);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const data = await api.get('/interns');
      setInterns(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch interns');
      console.error('Error fetching interns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Convert cgpa to number
      const dataToSend = {
        ...formData,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null
      };
      if (editingIntern) {
        await api.put(`/interns/${editingIntern.id}`, dataToSend);
      } else {
        await api.post('/interns', dataToSend);
      }
      await fetchInterns();
      setShowModal(false);
      setEditingIntern(null);
      setFormData({ name: '', email: '', phone: '', collegeName: '', branch: '', cgpa: '', joinDate: '', address: '', emergencyContact: '', status: 'DOCUMENT_PENDING' });
      setError('');
    } catch (err) {
      setError(editingIntern ? 'Failed to update intern' : 'Failed to create intern');
      console.error('Error saving intern:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (intern) => {
    setEditingIntern(intern);
    setFormData({
      name: intern.name,
      email: intern.email,
      phone: intern.phone,
      collegeName: intern.collegeName || '',
      branch: intern.branch || '',
      cgpa: intern.cgpa || '',
      joinDate: intern.joinDate || '',
      address: intern.address || '',
      emergencyContact: intern.emergencyContact || '',
      status: intern.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this intern?')) {
      try {
        await api.delete(`/interns/${id}`);
        await fetchInterns();
      } catch (err) {
        console.error('Error deleting intern:', err);
        alert('Failed to delete intern');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DOCUMENT_PENDING': 'badge-danger',
      'DOCUMENT_VERIFICATION': 'badge-warning',
      'DOCUMENT_VERIFIED': 'badge-success',
      'INTERVIEW_SCHEDULED': 'badge-secondary',
      'OFFER_GENERATED': 'badge-success',
      'ONBOARDING': 'badge-info',
      'ACTIVE': 'badge-success',
      'COMPLETED': 'badge-info',
      'TERMINATED': 'badge-secondary'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (intern.collegeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intern.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || intern.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Intern Management</h1>
            <p className="page-subtitle">Track and manage all interns throughout the hiring lifecycle</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              📥 Export Data
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              ➕ Add Intern
            </button>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <div>
              <div className="stat-number">{interns.length}</div>
              <div className="stat-label">Total Interns</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <div>
              <div className="stat-number">{interns.filter(i => i.status === 'ACTIVE').length}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📋</span>
            <div>
              <div className="stat-number">{interns.filter(i => i.status === 'ONBOARDING').length}</div>
              <div className="stat-label">Onboarding</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏳</span>
            <div>
              <div className="stat-number">{interns.filter(i => i.status === 'DOCUMENT_PENDING').length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#fee', color: '#c33', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading...
          </div>
        )}

        {/* Filters and View Toggle */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="filters-row">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, college, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="DOCUMENT_PENDING">Document Pending</option>
                <option value="DOCUMENT_VERIFICATION">Document Verification</option>
                <option value="DOCUMENT_VERIFIED">Document Verified</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="OFFER_GENERATED">Offer Generated</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
              <button
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && !loading && (
          <div className="interns-grid">
            {filteredInterns.map(intern => (
              <div key={intern.id} className="intern-card fade-in">
                <div className="intern-photo">
                  <span style={{ fontSize: '48px' }}>{intern.name.toLowerCase().includes('a') ? '👩‍💼' : '👨‍💼'}</span>
                </div>
                
                <h3 className="intern-name">{intern.name}</h3>
                <p className="intern-college">{intern.collegeName || 'N/A'}</p>
                
                <div className="intern-badge-container">
                  <span className={`badge ${getStatusBadge(intern.status)}`}>
                    {formatStatus(intern.status)}
                  </span>
                </div>

                <div className="intern-details">
                  <div className="detail-row">
                    <span className="detail-icon">🎓</span>
                    <span>{intern.branch || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📊</span>
                    <span>CGPA: {intern.cgpa || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span>{intern.joinDate || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📧</span>
                    <span className="detail-email">{intern.email}</span>
                  </div>
                </div>

                <div className="intern-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(intern)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/documents`)}>
                    📁 Documents
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && !loading && (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>College</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterns.map(intern => (
                    <tr key={intern.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{intern.name.toLowerCase().includes('a') ? '👩‍💼' : '👨‍💼'}</span>
                          <div>
                            <strong>{intern.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{intern.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{intern.collegeName || 'N/A'}</td>
                      <td>{intern.branch || 'N/A'}</td>
                      <td><strong>{intern.cgpa || 'N/A'}</strong></td>
                      <td>
                        <span className={`badge ${getStatusBadge(intern.status)}`}>
                          {formatStatus(intern.status)}
                        </span>
                      </td>
                      <td>{intern.joinDate || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleEdit(intern)}>Edit</button>
                          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/documents`)}>Documents</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Intern Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => {
            setShowModal(false);
            setEditingIntern(null);
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingIntern ? 'Edit Intern' : 'Add New Intern'}</h2>
                <button className="modal-close" onClick={() => {
                  setShowModal(false);
                  setEditingIntern(null);
                }}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      className="form-input"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">College *</label>
                    <input
                      type="text"
                      name="collegeName"
                      className="form-input"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch *</label>
                    <input
                      type="text"
                      name="branch"
                      className="form-input"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">CGPA *</label>
                    <input
                      type="text"
                      name="cgpa"
                      className="form-input"
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Join Date *</label>
                    <input
                      type="date"
                      name="joinDate"
                      className="form-input"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                      name="status"
                      className="form-input"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="DOCUMENT_PENDING">Document Pending</option>
                      <option value="DOCUMENT_VERIFICATION">Document Verification</option>
                      <option value="DOCUMENT_VERIFIED">Document Verified</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="OFFER_GENERATED">Offer Generated</option>
                      <option value="ONBOARDING">Onboarding</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-textarea"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full address..."
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => {
                    setShowModal(false);
                    setEditingIntern(null);
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingIntern ? 'Update Intern' : 'Add Intern'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Interns;
