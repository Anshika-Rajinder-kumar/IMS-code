import React, { useState, useEffect } from 'react';
import './Candidates.css';
import api from '../services/api';

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    collegeId: '',
    collegeName: '',
    branch: '',
    cgpa: '',
    address: '',
    hiringRound: 'Applied',
    hiringStatus: 'NOT_STARTED',
    status: 'APPLIED'
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates();
    fetchColleges();
  }, []);

  const fetchCandidates = async () => {
    try {
      const data = await api.getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      alert('Failed to fetch candidates');
    }
  };

  const fetchColleges = async () => {
    try {
      const data = await api.getColleges();
      setColleges(data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill college name when college is selected
    if (name === 'collegeId') {
      const selectedCollege = colleges.find(c => c.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        collegeId: value,
        collegeName: selectedCollege ? selectedCollege.name : ''
      }));
    }

    if (e.target.type === 'file') {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCandidate(editingId, formData);
        alert('Candidate updated successfully!');
      } else {
        await api.createCandidate(formData, resumeFile);
        alert('Candidate added successfully!');
      }
      resetForm();
      fetchCandidates();
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert(error.response?.data?.message || 'Failed to save candidate');
    }
  };

  const handleEdit = (candidate) => {
    setFormData({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      emergencyContact: candidate.emergencyContact || '',
      collegeId: candidate.collegeId || '',
      collegeName: candidate.collegeName,
      branch: candidate.branch,
      cgpa: candidate.cgpa,
      address: candidate.address || '',
      hiringRound: candidate.hiringRound || 'Applied',
      hiringStatus: candidate.hiringStatus || 'NOT_STARTED',
      status: candidate.status
    });
    setEditingId(candidate.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.deleteCandidate(id);
        alert('Candidate deleted successfully!');
        fetchCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Failed to delete candidate');
      }
    }
  };

  const handleConvertToIntern = async (candidateId) => {
    const joinDate = prompt('Enter join date (YYYY-MM-DD):');
    if (!joinDate) return;

    try {
      await api.convertCandidateToIntern(candidateId, joinDate);
      alert('Candidate converted to intern successfully! Credentials sent via email.');
      fetchCandidates();
    } catch (error) {
      console.error('Error converting candidate:', error);
      alert(error.response?.data?.message || 'Failed to convert candidate to intern');
    }
  };

  const handleBulkConvert = async () => {
    if (selectedCandidates.length === 0) {
      alert('Please select candidates to convert');
      return;
    }

    const joinDate = prompt('Enter join date for all selected candidates (YYYY-MM-DD):');
    if (!joinDate) return;

    try {
      for (const candidateId of selectedCandidates) {
        await api.convertCandidateToIntern(candidateId, joinDate);
      }
      alert(`${selectedCandidates.length} candidates converted to interns successfully!`);
      setSelectedCandidates([]);
      fetchCandidates();
    } catch (error) {
      console.error('Error converting candidates:', error);
      alert('Some candidates could not be converted');
    }
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      emergencyContact: '',
      collegeId: '',
      collegeName: '',
      branch: '',
      cgpa: '',
      address: '',
      hiringRound: 'Applied',
      hiringStatus: 'NOT_STARTED',
      status: 'APPLIED'
    });
    setEditingId(null);
    setShowForm(false);
    setResumeFile(null);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.collegeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || candidate.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPLIED': return 'badge-applied';
      case 'SCREENING': return 'badge-screening';
      case 'INTERVIEW_SCHEDULED': return 'badge-scheduled';
      case 'INTERVIEWING': return 'badge-interviewing';
      case 'SELECTED': return 'badge-selected';
      case 'REJECTED': return 'badge-rejected';
      case 'WITHDRAWN': return 'badge-withdrawn';
      default: return 'badge-default';
    }
  };

  return (
    <div className="candidates-container">
      <div className="candidates-header">
        <h1>Candidate Management</h1>
        <p className="subtitle">Manage job applicants before they become interns</p>
      </div>

      <div className="candidates-actions">
        <div className="search-filter-group">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
        <div className="button-group">
          {selectedCandidates.length > 0 && (
            <button onClick={handleBulkConvert} className="btn-bulk-convert">
              Convert {selectedCandidates.length} to Interns
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="btn-add">
            {showForm ? 'Cancel' : '+ Add Candidate'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="candidate-form-card">
          <h2>{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h2>
          <form onSubmit={handleSubmit} className="candidate-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>College *</label>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Branch *</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CGPA *</label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  placeholder="e.g., 8.5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Resume</label>
              <input
                type="file"
                name="resume"
                onChange={handleInputChange}
                accept=".pdf,.doc,.docx"
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? 'Update Candidate' : 'Add Candidate'}
              </button>
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="candidates-table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCandidates(filteredCandidates.filter(c => c.status === 'SELECTED').map(c => c.id));
                    } else {
                      setSelectedCandidates([]);
                    }
                  }}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>College</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Status</th>
              <th>Resume</th>
              <th>Hiring Round</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No candidates found</td>
              </tr>
            ) : (
              filteredCandidates.map(candidate => (
                <tr key={candidate.id}>
                  <td>
                    {candidate.status === 'SELECTED' && (
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleSelectCandidate(candidate.id)}
                      />
                    )}
                  </td>
                  <td>{candidate.name}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.collegeName}</td>
                  <td>{candidate.branch}</td>
                  <td>{candidate.cgpa}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(candidate.status)}`}>
                      {candidate.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {candidate.resumePath ? (
                      <button
                        className="btn-edit"
                        style={{ background: '#10b981', color: 'white', border: 'none' }}
                        onClick={() => window.open(api.getCandidateResumeUrl(candidate.id), '_blank')}
                      >
                        Resume
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{candidate.hiringRound || 'N/A'}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleEdit(candidate)} className="btn-edit">
                      Edit
                    </button>
                    {candidate.status === 'SELECTED' && (
                      <button
                        onClick={() => handleConvertToIntern(candidate.id)}
                        className="btn-convert"
                      >
                        Convert to Intern
                      </button>
                    )}
                    <button onClick={() => handleDelete(candidate.id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Candidates;
