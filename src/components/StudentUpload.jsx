import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './StudentUpload.css';

const StudentUpload = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    cgpa: '',
    graduationYear: '',
    skills: '',
    resumeFile: null
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchStudents();
    }
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      const collegeName = userData.collegeName;

      // Fetch candidates instead of interns
      const data = await api.getCandidatesByCollegeName(collegeName);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resumeFile') {
      setFormData({ ...formData, resumeFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setUploadProgress(20);

      const userData = JSON.parse(localStorage.getItem('user'));

      // Get college ID from colleges list
      const colleges = await api.getColleges();
      const college = colleges.find(c => c.name === userData.collegeName);

      if (!college) {
        throw new Error('College not found');
      }

      // Create candidate profile (not intern yet)
      const candidateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        collegeId: college.id,
        collegeName: userData.collegeName,
        branch: formData.branch,
        cgpa: formData.cgpa,
        address: '',
        emergencyContact: '',
        status: 'APPLIED',
        hiringRound: 'Applied',
        hiringStatus: 'NOT_STARTED'
      };

      setUploadProgress(50);
      const createdCandidate = await api.createCandidate(candidateData, formData.resumeFile);

      setUploadProgress(100);
      await fetchStudents();
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        branch: '',
        cgpa: '',
        graduationYear: '',
        skills: '',
        resumeFile: null
      });
      alert('Student added successfully! They are now in the candidate pool.');
    } catch (err) {
      console.error('Error uploading student:', err);
      alert('Failed to upload student: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleBulkUpload = () => {
    alert('Bulk upload via CSV coming soon! You will be able to upload multiple students at once.');
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      'PENDING': '⏳',
      'CLEARED': '✅',
      'REJECTED': '❌',
      'ON_HOLD': '⏸️'
    };
    return statusMap[status] || '📋';
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Student Management</h1>
            <p className="page-subtitle">Upload and track student applications</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={handleBulkUpload}>
              📥 Bulk Upload CSV
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              ➕ Add Student
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>👥</div>
            <div>
              <div className="stat-value">{students.length}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
            <div>
              <div className="stat-value">{students.filter(s => s.hiringStatus === 'CLEARED').length}</div>
              <div className="stat-label">Selected</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
            <div>
              <div className="stat-value">{students.filter(s => s.hiringStatus === 'PENDING').length}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>❌</div>
            <div>
              <div className="stat-value">{students.filter(s => s.hiringStatus === 'REJECTED').length}</div>
              <div className="stat-label">Not Selected</div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Uploaded Students</h3>
          </div>

          <div className="students-list">
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                <h3 style={{ marginBottom: '8px', color: '#374151' }}>No students uploaded yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Start by adding students to your recruitment pool</p>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  Upload First Student
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Graduation Year</th>
                    <th>Current Round</th>
                    <th>Status</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="student-avatar">{student.name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{student.name}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{student.branch || 'N/A'}</td>
                      <td>
                        <span className="cgpa-badge">{student.cgpa || 'N/A'}</span>
                      </td>
                      <td>{student.graduationYear || 'N/A'}</td>
                      <td>
                        <span className="badge badge-info">
                          {student.hiringRound || 'Applied'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '20px', marginRight: '8px' }}>
                          {getStatusIcon(student.hiringStatus)}
                        </span>
                        {student.hiringStatus || 'PENDING'}
                      </td>
                      <td>
                        {student.resumePath ? (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => window.open(api.getCandidateResumeUrl(student.id), '_blank')}
                          >
                            📄 View Resume
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>No Resume</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add Student Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Upload Student Details</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {uploadProgress > 0 && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}

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
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Branch *</label>
                      <select
                        name="branch"
                        className="form-input"
                        value={formData.branch}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select branch...</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">CGPA *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cgpa"
                        className="form-input"
                        value={formData.cgpa}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Graduation Year *</label>
                      <input
                        type="number"
                        name="graduationYear"
                        className="form-input"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        min="2020"
                        max="2030"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills (comma-separated)</label>
                    <input
                      type="text"
                      name="skills"
                      className="form-input"
                      placeholder="Java, Python, React, SQL..."
                      value={formData.skills}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Resume</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        name="resumeFile"
                        onChange={handleInputChange}
                        accept=".pdf,.doc,.docx"
                        id="resumeFile"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="resumeFile" className="file-upload-label">
                        <div className="file-upload-icon">📄</div>
                        <div>
                          {formData.resumeFile ? (
                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                              ✓ {formData.resumeFile.name}
                            </span>
                          ) : (
                            <>
                              <span style={{ fontWeight: '600', display: 'block' }}>
                                Click to upload resume
                              </span>
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                PDF, DOC, DOCX up to 5MB
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Student'}
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

export default StudentUpload;
