import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import Toast from './Toast';
import './Offers.css';

const Offers = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewHTML, setPreviewHTML] = useState('');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    position: 'Software Engineering Intern',
    department: 'Technology',
    stipend: 25000,
    duration: '6 months',
    startDate: '',
    location: 'Bangalore, India',
    reportingManager: '',
    workMode: 'HYBRID'
  });

  const [interns, setInterns] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchInterns();
    fetchOffers();
  }, []);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const data = await api.get('/interns');
      setInterns(data);
    } catch (err) {
      console.error('Error fetching interns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      console.log('Fetching offers...');
      const data = await api.get('/offers');
      console.log('Offers received:', data);
      console.log('Number of offers:', data?.length || 0);
      setOffers(data);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
  };

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

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const offerData = {
        ...formData,
        intern: { id: selectedIntern.id }
      };

      console.log('Creating offer with data:', offerData);

      // Create the offer
      const createdOffer = await api.post('/offers', offerData);
      console.log('Offer created:', createdOffer);

      // Update intern status to OFFER_GENERATED
      await api.put(`/interns/${selectedIntern.id}`, {
        ...selectedIntern,
        status: 'OFFER_GENERATED'
      });

      // Close modal first
      setShowGenerateModal(false);

      // Refresh data - wait a bit to ensure backend has processed
      setTimeout(async () => {
        await fetchOffers();
        await fetchInterns();
        setToast({ message: 'Offer generated successfully! Intern status updated to OFFER_GENERATED.', type: 'success' });
      }, 500);

    } catch (err) {
      setError('Failed to generate offer: ' + (err.message || 'Unknown error'));
      console.error('Error generating offer:', err);
      setToast({ message: 'Failed to generate offer. Check console for details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (offerId) => {
    try {
      setLoading(true);
      const html = await api.getOfferPreview(offerId);
      setPreviewHTML(html);
      setShowPreview(true);
    } catch (err) {
      console.error('Error fetching preview:', err);
      setToast({ message: 'Failed to load preview', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (offerId) => {
    try {
      setToast({ message: '⏳ Preparing your official PDF...', type: 'info' });
      await api.downloadOffer(offerId);
      setToast({ message: '✅ Offer letter downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error downloading offer:', error);
      setToast({ message: '❌ Download failed: ' + error.message, type: 'error' });
    }
  };

  const handleSendEmail = async (offerId) => {
    try {
      setToast({ message: '📨 Sending offer letter...', type: 'info' });
      await api.sendOffer(offerId);
      setToast({ message: '✅ Offer letter sent successfully!', type: 'success' });
      fetchOffers();
    } catch (error) {
      console.error('Error sending offer:', error);
      setToast({ message: 'Failed to send offer letter: ' + error.message, type: 'error' });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DRAFT': 'badge-secondary',
      'GENERATED': 'badge-warning',
      'SENT': 'badge-info',
      'ACCEPTED': 'badge-success',
      'REJECTED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const getInternsReadyForOffer = () => {
    return interns.filter(i =>
      i.status === 'DOCUMENT_VERIFIED'
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Offer Letter Management</h1>
            <p className="page-subtitle">Generate and manage intern offer letters</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              Offer Report
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-bar" style={{ marginBottom: '32px' }}>
          <div className="stat-item">
            <div>
              <div className="stat-number">{offers.length}</div>
              <div className="stat-label">Total Offers</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number">{offers.filter(o => o.status === 'SENT').length}</div>
              <div className="stat-label">Sent</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number">{getInternsReadyForOffer().length}</div>
              <div className="stat-label">Ready to Generate</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#fee', color: '#c33', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <div className="offers-layout">
          {/* Ready Interns */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Interns Ready for Offer</h3>
            </div>
            <div className="interns-ready-list">
              {getInternsReadyForOffer().map(intern => (
                <div key={intern.id} className="ready-intern-item">
                  <div className="intern-avatar-small">
                    {intern.name.charAt(0)}
                  </div>
                  <div className="intern-info-compact">
                    <div className="intern-name-small">{intern.name}</div>
                    <div className="intern-details-small">{intern.collegeName || 'N/A'} • CGPA: {intern.cgpa || 'N/A'}</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleGenerateOffer(intern)}
                  >
                    Generate Offer
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
                  {offers && offers.length > 0 ? (
                    offers.map(offer => (
                      <tr key={offer.id}>
                        <td><strong>{offer.intern?.name || 'N/A'}</strong></td>
                        <td>{offer.position}</td>
                        <td>{offer.generatedAt ? new Date(offer.generatedAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(offer.status)}`}>
                            {formatStatus(offer.status)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handlePreview(offer.id)}
                            >
                              Preview
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleDownload(offer.id)}
                            >
                              Download
                            </button>
                            {offer.status !== 'SENT' && offer.status !== 'ACCEPTED' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSendEmail(offer.id)}
                              >
                                Send
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                        No offers generated yet
                      </td>
                    </tr>
                  )}
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
                      type="number"
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
                      <option value="ONSITE">On-site</option>
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
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
        {showPreview && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="modal-content modal-large offer-preview" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', height: '90vh', padding: 0 }}>
              <div className="modal-header" style={{ padding: '20px' }}>
                <h2>Official Offer Letter Preview</h2>
                <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ height: 'calc(100% - 130px)', padding: 0, overflow: 'hidden' }}>
                <iframe
                  title="Offer Letter Preview"
                  srcDoc={previewHTML}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#f5f5f5'
                  }}
                />
              </div>

              <div className="modal-actions" style={{ padding: '20px', borderTop: '1px solid #ddd' }}>
                <button className="btn btn-outline" onClick={() => setShowPreview(false)}>
                  Close
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
