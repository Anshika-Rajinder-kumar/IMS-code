import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Offers.css';

const Offers = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    position: 'Software Engineering Intern',
    department: 'Technology',
    stipend: '25000',
    duration: '6 months',
    startDate: '',
    location: 'Bangalore, India',
    reportingManager: '',
    workMode: 'Hybrid'
  });

  const [interns] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@example.com', college: 'IIT Delhi', cgpa: '8.5', status: 'ready' },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@example.com', college: 'BITS Pilani', cgpa: '9.2', status: 'generated' },
    { id: 3, name: 'Amit Kumar', email: 'amit.kumar@example.com', college: 'NIT Trichy', cgpa: '8.8', status: 'sent' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@example.com', college: 'VIT Vellore', cgpa: '9.0', status: 'ready' },
  ]);

  const [offers, setOffers] = useState([
    { id: 1, internName: 'Priya Patel', position: 'Software Engineering Intern', generatedDate: '2026-01-15', status: 'generated' },
    { id: 2, internName: 'Amit Kumar', position: 'Data Analytics Intern', generatedDate: '2026-01-12', status: 'sent' },
  ]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateOffer = (intern) => {
    setSelectedIntern(intern);
    setShowGenerateModal(true);
  };

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    const newOffer = {
      id: offers.length + 1,
      internName: selectedIntern.name,
      position: formData.position,
      generatedDate: new Date().toISOString().split('T')[0],
      status: 'generated'
    };
    setOffers([...offers, newOffer]);
    setShowGenerateModal(false);
  };

  const handlePreview = (intern) => {
    setSelectedIntern(intern);
    setShowPreview(true);
  };

  const handleDownload = () => {
    alert('Offer letter downloaded successfully!');
  };

  const handleSendEmail = () => {
    alert(`Offer letter sent to ${selectedIntern?.email}`);
    setShowPreview(false);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ready': 'badge-info',
      'generated': 'badge-warning',
      'sent': 'badge-success'
    };
    return statusMap[status] || 'badge-secondary';
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Offer Letter Management</h1>
            <p className="page-subtitle">Generate and manage intern offer letters</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              📊 Offer Report
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-bar" style={{ marginBottom: '32px' }}>
          <div className="stat-item">
            <span className="stat-icon">📄</span>
            <div>
              <div className="stat-number">{offers.length}</div>
              <div className="stat-label">Total Offers</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <div>
              <div className="stat-number">{offers.filter(o => o.status === 'sent').length}</div>
              <div className="stat-label">Sent</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏳</span>
            <div>
              <div className="stat-number">{interns.filter(i => i.status === 'ready').length}</div>
              <div className="stat-label">Ready to Generate</div>
            </div>
          </div>
        </div>

        <div className="offers-layout">
          {/* Ready Interns */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Interns Ready for Offer</h3>
            </div>
            <div className="interns-ready-list">
              {interns.filter(i => i.status === 'ready').map(intern => (
                <div key={intern.id} className="ready-intern-item">
                  <div className="intern-avatar-small">
                    {intern.name.charAt(0)}
                  </div>
                  <div className="intern-info-compact">
                    <div className="intern-name-small">{intern.name}</div>
                    <div className="intern-details-small">{intern.college} • CGPA: {intern.cgpa}</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleGenerateOffer(intern)}
                  >
                    ✍️ Generate Offer
                  </button>
                </div>
              ))}
              {interns.filter(i => i.status === 'ready').length === 0 && (
                <div className="empty-message">
                  No interns ready for offer generation
                </div>
              )}
            </div>
          </div>

          {/* Generated Offers */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Generated Offers</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Intern Name</th>
                    <th>Position</th>
                    <th>Generated Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(offer => (
                    <tr key={offer.id}>
                      <td><strong>{offer.internName}</strong></td>
                      <td>{offer.position}</td>
                      <td>{offer.generatedDate}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(offer.status)}`}>
                          {offer.status === 'sent' ? '✓ ' : ''}
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              const intern = interns.find(i => i.name === offer.internName);
                              handlePreview(intern);
                            }}
                          >
                            👁️ Preview
                          </button>
                          <button className="btn btn-outline btn-sm">
                            ⬇️ Download
                          </button>
                          {offer.status !== 'sent' && (
                            <button className="btn btn-primary btn-sm">
                              📧 Send
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Generate Offer Modal */}
        {showGenerateModal && (
          <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Generate Offer Letter</h2>
                <button className="modal-close" onClick={() => setShowGenerateModal(false)}>✕</button>
              </div>

              <div className="selected-intern-banner">
                <div className="intern-avatar">{selectedIntern?.name.charAt(0)}</div>
                <div>
                  <h3>{selectedIntern?.name}</h3>
                  <p>{selectedIntern?.college} • {selectedIntern?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitOffer}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Position *</label>
                    <input
                      type="text"
                      name="position"
                      className="form-input"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <input
                      type="text"
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Monthly Stipend (₹) *</label>
                    <input
                      type="text"
                      name="stipend"
                      className="form-input"
                      value={formData.stipend}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      className="form-input"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-input"
                      value={formData.startDate}
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
                    <label className="form-label">Reporting Manager *</label>
                    <input
                      type="text"
                      name="reportingManager"
                      className="form-input"
                      value={formData.reportingManager}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Mode *</label>
                    <select
                      name="workMode"
                      className="form-input"
                      value={formData.workMode}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowGenerateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Generate Offer Letter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedIntern && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="modal-content modal-large offer-preview" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Offer Letter Preview</h2>
                <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
              </div>

              {/* Offer Letter Preview */}
              <div className="offer-letter">
                <div className="offer-header">
                  <div className="company-letterhead">
                    <div className="company-logo-large">W</div>
                    <h1>WISSEN TECHNOLOGY</h1>
                    <p>Innovation • Excellence • Growth</p>
                  </div>
                </div>

                <div className="offer-date">
                  <strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                <div className="offer-to">
                  <strong>{selectedIntern.name}</strong><br />
                  {selectedIntern.email}<br />
                  {selectedIntern.college}
                </div>

                <div className="offer-subject">
                  <strong>Subject: Offer of Internship</strong>
                </div>

                <div className="offer-body">
                  <p>Dear {selectedIntern.name},</p>

                  <p>
                    We are pleased to offer you an internship position at Wissen Technology. We were impressed with your 
                    credentials and believe you will be a valuable addition to our team.
                  </p>

                  <h3>Position Details:</h3>
                  <table className="offer-details-table">
                    <tbody>
                      <tr>
                        <td><strong>Position:</strong></td>
                        <td>{formData.position}</td>
                      </tr>
                      <tr>
                        <td><strong>Department:</strong></td>
                        <td>{formData.department}</td>
                      </tr>
                      <tr>
                        <td><strong>Duration:</strong></td>
                        <td>{formData.duration}</td>
                      </tr>
                      <tr>
                        <td><strong>Start Date:</strong></td>
                        <td>{formData.startDate || 'To be decided'}</td>
                      </tr>
                      <tr>
                        <td><strong>Location:</strong></td>
                        <td>{formData.location}</td>
                      </tr>
                      <tr>
                        <td><strong>Work Mode:</strong></td>
                        <td>{formData.workMode}</td>
                      </tr>
                      <tr>
                        <td><strong>Stipend:</strong></td>
                        <td>₹{formData.stipend} per month</td>
                      </tr>
                      <tr>
                        <td><strong>Reporting Manager:</strong></td>
                        <td>{formData.reportingManager || 'To be assigned'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Terms & Conditions:</h3>
                  <ul className="offer-terms">
                    <li>This offer is contingent upon successful completion of your background verification and document submission.</li>
                    <li>You will be required to adhere to company policies and code of conduct during your internship period.</li>
                    <li>The internship duration may be extended based on your performance and business requirements.</li>
                    <li>You will be eligible for a performance review at the end of your internship period.</li>
                  </ul>

                  <p>
                    Please confirm your acceptance of this offer by signing and returning this letter by{' '}
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}.
                  </p>

                  <p>
                    We look forward to welcoming you to the Wissen family and wish you a successful and enriching 
                    internship experience.
                  </p>

                  <div className="offer-signature">
                    <div>
                      <strong>For Wissen Technology</strong><br /><br />
                      _____________________<br />
                      Authorized Signatory<br />
                      HR Department
                    </div>
                  </div>

                  <div className="offer-acceptance">
                    <strong>Acceptance</strong><br /><br />
                    I accept the above terms and conditions.<br /><br />
                    _____________________<br />
                    {selectedIntern.name}<br />
                    Date: _______________
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowPreview(false)}>
                  Close
                </button>
                <button className="btn btn-outline" onClick={handleDownload}>
                  ⬇️ Download PDF
                </button>
                <button className="btn btn-primary" onClick={handleSendEmail}>
                  📧 Send via Email
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Offers;
