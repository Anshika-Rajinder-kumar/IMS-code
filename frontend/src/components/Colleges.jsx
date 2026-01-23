import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from './Sidebar';
import './Colleges.css';

const Colleges = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCollege, setEditingCollege] = useState(null);
  
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getColleges();
      setColleges(data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setError('Failed to load colleges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    coordinator: '',
    email: '',
    phone: '',
    visitDate: '',
    slots: '',
    status: 'SCHEDULED',
    notes: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCollege) {
        await api.updateCollege(editingCollege.id, formData);
      } else {
        await api.createCollege(formData);
      }
      await fetchColleges();
      setShowModal(false);
      setEditingCollege(null);
      setFormData({ name: '', location: '', coordinator: '', email: '', phone: '', visitDate: '', slots: '', status: 'SCHEDULED', notes: '' });
    } catch (error) {
      console.error('Error saving college:', error);
      alert('Failed to save college. Please try again.');
    }
  };

  const handleEdit = (college) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      location: college.location,
      coordinator: college.coordinator || '',
      email: college.email || '',
      phone: college.phone || '',
      visitDate: college.visitDate || '',
      slots: college.slots || '',
      status: college.status || 'SCHEDULED',
      notes: college.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this college?')) {
      try {
        await api.deleteCollege(id);
        await fetchColleges();
      } catch (error) {
        console.error('Error deleting college:', error);
        alert('Failed to delete college. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': 'badge-info',
      'COMPLETED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || college.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <div style={{ fontSize: '18px', color: '#666' }}>Loading colleges...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">College Management</h1>
            <p className="page-subtitle">Manage campus visits and recruitment activities</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              📥 Export List
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              ➕ Add College Visit
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="filters-row">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search colleges by name or location..."
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
                <option value="all">All</option>
                <option value="PLANNED">Planned</option>
                <option value="VISITED">Visited</option>
                <option value="PARTNERSHIP_SIGNED">Partnership Signed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Colleges Grid */}
        <div className="colleges-grid">
          {error && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e74c3c' }}>
              {error}
              <button onClick={fetchColleges} className="btn btn-outline" style={{ marginLeft: '12px' }}>
                Retry
              </button>
            </div>
          )}
          {!error && filteredColleges.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999', gridColumn: '1 / -1' }}>
              No colleges found. Add your first college to get started!
            </div>
          )}
          {!error && filteredColleges.map(college => (
            <div key={college.id} className="college-card fade-in">
              <div className="college-header">
                <div className="college-icon">🏫</div>
                <span className={`badge ${getStatusBadge(college.status)}`}>
                  {college.status === 'COMPLETED' ? '✓ Completed' : college.status === 'CANCELLED' ? '✗ Cancelled' : '📅 Scheduled'}
                </span>
              </div>
              
              <h3 className="college-name">{college.name}</h3>
              <p className="college-location">📍 {college.location}</p>
              
              <div className="college-details">
                <div className="detail-item">
                  <span className="detail-label">Coordinator:</span>
                  <span className="detail-value">{college.coordinator || 'Not assigned'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Available Slots:</span>
                  <span className="detail-value">{college.slots || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Visit Date:</span>
                  <span className="detail-value">{formatDate(college.visitDate)}</span>
                </div>
              </div>

              <div className="college-contact">
                {college.email && (
                  <div className="contact-item">
                    <span>📧</span>
                    <span>{college.email}</span>
                  </div>
                )}
                {college.phone && (
                  <div className="contact-item">
                    <span>📞</span>
                    <span>{college.phone}</span>
                  </div>
                )}
              </div>

              <div className="college-actions">
                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(college)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(college.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add College Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingCollege ? 'Edit College' : 'Add College Visit'}</h2>
                <button className="modal-close" onClick={() => {
                  setShowModal(false);
                  setEditingCollege(null);
                  setFormData({ name: '', location: '', coordinator: '', email: '', phone: '', visitDate: '', slots: '', status: 'SCHEDULED', notes: '' });
                }}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">College Name *</label>
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
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Coordinator *</label>
                    <input
                      type="text"
                      name="coordinator"
                      className="form-input"
                      value={formData.coordinator}
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
                    <label className="form-label">Visit Date *</label>
                    <input
                      type="date"
                      name="visitDate"
                      className="form-input"
                      value={formData.visitDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Available Slots *</label>
                    <input
                      type="number"
                      name="slots"
                      className="form-input"
                      value={formData.slots}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                      name="status"
                      className="form-input"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    className="form-textarea"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional information about the visit..."
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => {
                    setShowModal(false);
                    setEditingCollege(null);
                    setFormData({ name: '', location: '', coordinator: '', email: '', phone: '', visitDate: '', slots: '', status: 'SCHEDULED', notes: '' });
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCollege ? 'Update College' : 'Add College'}
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

export default Colleges;
