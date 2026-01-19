import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Colleges.css';

const Colleges = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [colleges, setColleges] = useState([
    { id: 1, name: 'IIT Delhi', location: 'New Delhi', coordinator: 'Dr. Rajesh Kumar', email: 'placement@iitd.ac.in', phone: '+91 11 2659 1111', visitDate: '2026-02-15', status: 'scheduled', slots: 50 },
    { id: 2, name: 'BITS Pilani', location: 'Pilani, Rajasthan', coordinator: 'Prof. Meera Sharma', email: 'placements@bits-pilani.ac.in', phone: '+91 1596 245073', visitDate: '2026-02-20', status: 'scheduled', slots: 40 },
    { id: 3, name: 'IIT Bombay', location: 'Mumbai', coordinator: 'Dr. Anil Patil', email: 'placement@iitb.ac.in', phone: '+91 22 2576 4999', visitDate: '2026-01-18', status: 'completed', slots: 60 },
    { id: 4, name: 'NIT Trichy', location: 'Tiruchirappalli', coordinator: 'Ms. Priya Reddy', email: 'placements@nitt.edu', phone: '+91 431 250 3000', visitDate: '2026-02-28', status: 'scheduled', slots: 35 },
    { id: 5, name: 'VIT Vellore', location: 'Vellore, Tamil Nadu', coordinator: 'Dr. Suresh Babu', email: 'placements@vit.ac.in', phone: '+91 416 220 2020', visitDate: '2026-01-10', status: 'completed', slots: 45 },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    coordinator: '',
    email: '',
    phone: '',
    visitDate: '',
    slots: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCollege = {
      id: colleges.length + 1,
      ...formData,
      status: 'scheduled'
    };
    setColleges([...colleges, newCollege]);
    setShowModal(false);
    setFormData({ name: '', location: '', coordinator: '', email: '', phone: '', visitDate: '', slots: '', notes: '' });
  };

  const getStatusBadge = (status) => {
    return status === 'completed' ? 'badge-success' : 'badge-warning';
  };

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || college.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Colleges Grid */}
        <div className="colleges-grid">
          {filteredColleges.map(college => (
            <div key={college.id} className="college-card fade-in">
              <div className="college-header">
                <div className="college-icon">🏫</div>
                <span className={`badge ${getStatusBadge(college.status)}`}>
                  {college.status === 'completed' ? '✓ Completed' : '📅 Scheduled'}
                </span>
              </div>
              
              <h3 className="college-name">{college.name}</h3>
              <p className="college-location">📍 {college.location}</p>
              
              <div className="college-details">
                <div className="detail-item">
                  <span className="detail-label">Coordinator:</span>
                  <span className="detail-value">{college.coordinator}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Visit Date:</span>
                  <span className="detail-value">{college.visitDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Available Slots:</span>
                  <span className="detail-value">{college.slots} students</span>
                </div>
              </div>

              <div className="college-contact">
                <div className="contact-item">
                  <span>📧</span>
                  <span>{college.email}</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>{college.phone}</span>
                </div>
              </div>

              <div className="college-actions">
                <button className="btn btn-outline btn-sm">
                  ✏️ Edit
                </button>
                <button className="btn btn-primary btn-sm">
                  👁️ View Details
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
                <h2>Add College Visit</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
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
                    <label className="form-label">Coordinator Name *</label>
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

                <div className="form-group">
                  <label className="form-label">Available Slots *</label>
                  <input
                    type="number"
                    name="slots"
                    className="form-input"
                    value={formData.slots}
                    onChange={handleInputChange}
                    required
                  />
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
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add College Visit
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
