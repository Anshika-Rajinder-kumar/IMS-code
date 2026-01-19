import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Interns.css';

const Interns = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [interns, setInterns] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 98765 43210', college: 'IIT Delhi', branch: 'Computer Science', cgpa: '8.5', status: 'Document Verification', joinDate: '2026-02-01', photo: '👨‍💼' },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 98765 43211', college: 'BITS Pilani', branch: 'Electronics', cgpa: '9.2', status: 'Offer Generated', joinDate: '2026-02-15', photo: '👩‍💼' },
    { id: 3, name: 'Amit Kumar', email: 'amit.kumar@example.com', phone: '+91 98765 43212', college: 'NIT Trichy', branch: 'Mechanical', cgpa: '8.8', status: 'Onboarding', joinDate: '2026-01-20', photo: '👨‍💼' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '+91 98765 43213', college: 'VIT Vellore', branch: 'Information Technology', cgpa: '9.0', status: 'Interview Scheduled', joinDate: '2026-03-01', photo: '👩‍💼' },
    { id: 5, name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 98765 43214', college: 'IIT Bombay', branch: 'Computer Science', cgpa: '8.7', status: 'Document Pending', joinDate: '2026-02-20', photo: '👨‍💼' },
    { id: 6, name: 'Ananya Menon', email: 'ananya.menon@example.com', phone: '+91 98765 43215', college: 'IIT Madras', branch: 'Civil Engineering', cgpa: '8.4', status: 'Active', joinDate: '2026-01-15', photo: '👩‍💼' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    cgpa: '',
    joinDate: '',
    address: '',
    emergencyContact: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIntern = {
      id: interns.length + 1,
      ...formData,
      status: 'Document Pending',
      photo: formData.name.toLowerCase().includes('a') ? '👩‍💼' : '👨‍💼'
    };
    setInterns([...interns, newIntern]);
    setShowModal(false);
    setFormData({ name: '', email: '', phone: '', college: '', branch: '', cgpa: '', joinDate: '', address: '', emergencyContact: '' });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Document Verification': 'badge-warning',
      'Offer Generated': 'badge-success',
      'Onboarding': 'badge-info',
      'Interview Scheduled': 'badge-secondary',
      'Document Pending': 'badge-danger',
      'Active': 'badge-success'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intern.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              <div className="stat-number">{interns.filter(i => i.status === 'Active').length}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📋</span>
            <div>
              <div className="stat-number">{interns.filter(i => i.status === 'Onboarding').length}</div>
              <div className="stat-label">Onboarding</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏳</span>
            <div>
              <div className="stat-number">{interns.filter(i => i.status === 'Document Pending').length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

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
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Document Verification">Document Verification</option>
                <option value="Offer Generated">Offer Generated</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Document Pending">Document Pending</option>
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
        {viewMode === 'grid' && (
          <div className="interns-grid">
            {filteredInterns.map(intern => (
              <div key={intern.id} className="intern-card fade-in">
                <div className="intern-photo">
                  <span style={{ fontSize: '48px' }}>{intern.photo}</span>
                </div>
                
                <h3 className="intern-name">{intern.name}</h3>
                <p className="intern-college">{intern.college}</p>
                
                <div className="intern-badge-container">
                  <span className={`badge ${getStatusBadge(intern.status)}`}>
                    {intern.status}
                  </span>
                </div>

                <div className="intern-details">
                  <div className="detail-row">
                    <span className="detail-icon">🎓</span>
                    <span>{intern.branch}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📊</span>
                    <span>CGPA: {intern.cgpa}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span>{intern.joinDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📧</span>
                    <span className="detail-email">{intern.email}</span>
                  </div>
                </div>

                <div className="intern-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/documents`)}>
                    📁 Documents
                  </button>
                  <button className="btn btn-primary btn-sm">
                    👁️ View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
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
                          <span style={{ fontSize: '24px' }}>{intern.photo}</span>
                          <div>
                            <strong>{intern.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{intern.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{intern.college}</td>
                      <td>{intern.branch}</td>
                      <td><strong>{intern.cgpa}</strong></td>
                      <td>
                        <span className={`badge ${getStatusBadge(intern.status)}`}>
                          {intern.status}
                        </span>
                      </td>
                      <td>{intern.joinDate}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline btn-sm">Edit</button>
                          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/documents`)}>View</button>
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
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Intern</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
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
                      name="college"
                      className="form-input"
                      value={formData.college}
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
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Intern
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
