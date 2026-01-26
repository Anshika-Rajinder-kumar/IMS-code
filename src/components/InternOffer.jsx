import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import api from '../services/api';
import Toast from './Toast';
import './Offers.css';

const InternOffer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [internData, setInternData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [signedOfferFile, setSignedOfferFile] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.internId) {
        fetchInternData(parsedUser.internId);
        fetchDocuments(parsedUser.internId);
        fetchOffer(parsedUser.internId);
      } else {
        alert('Intern ID not found. Please log out and log in again.');
        setLoading(false);
      }
    }
  }, []);

  const fetchInternData = async (internId) => {
    try {
      const data = await api.getInternById(internId);
      setInternData(data);
    } catch (error) {
      console.error('Error fetching intern data:', error);
    }
  };

  const fetchDocuments = async (internId) => {
    try {
      const data = await api.getDocumentsByInternId(internId);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchOffer = async (internId) => {
    try {
      const data = await api.getLatestOfferByInternId(internId);
      setOfferData(data);
    } catch (error) {
      console.error('Error fetching offer:', error);
      setOfferData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!offerData) return;
    try {
      await api.downloadOffer(offerData.id);
    } catch (error) {
      console.error('Error downloading offer:', error);
      alert('Failed to download offer letter: ' + error.message);
    }
  };

  const handleAccept = async () => {
    setShowUploadModal(true);
  };
  
  const handleUploadAndAccept = async () => {
    if (!signedOfferFile) {
      alert('Please upload the signed offer letter before accepting.');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('signedOffer', signedOfferFile);
      
      await api.acceptOfferWithFile(offerData.id, formData);
      await fetchOffer(user.internId);
      await fetchInternData(user.internId);
      setShowUploadModal(false);
      setToast({ message: 'Congratulations! You have accepted the offer. HR will contact you soon with next steps.', type: 'success' });
    } catch (error) {
      console.error('Error accepting offer:', error);
      setToast({ message: 'Failed to accept offer: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    const confirmed = window.confirm('Are you sure you want to decline this offer?');
    if (confirmed) {
      try {
        await api.rejectOffer(offerData.id);
        await fetchOffer(user.internId);
        setToast({ message: 'Offer declined. Thank you for your time.', type: 'info' });
      } catch (error) {
        console.error('Error declining offer:', error);
        setToast({ message: 'Failed to decline offer: ' + error.message, type: 'error' });
      }
    }
  };

  // Calculate document upload progress
  const getDocumentStats = () => {
    const requiredDocs = ['AADHAAR', 'PAN', 'CLASS_10', 'CLASS_12', 'DEGREE', 'PHOTO', 'BANK_PASSBOOK'];
    const uploadedDocs = documents.filter(doc => requiredDocs.includes(doc.name));
    const verifiedDocs = uploadedDocs.filter(doc => doc.status === 'VERIFIED');
    const pendingDocs = uploadedDocs.filter(doc => doc.status === 'PENDING');
    const rejectedDocs = uploadedDocs.filter(doc => doc.status === 'REJECTED');
    
    return {
      total: requiredDocs.length,
      uploaded: uploadedDocs.length,
      verified: verifiedDocs.length,
      pending: pendingDocs.length,
      rejected: rejectedDocs.length,
      allUploaded: uploadedDocs.length === requiredDocs.length,
      allVerified: verifiedDocs.length === requiredDocs.length
    };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <header className="dashboard-header">
            <div>
              <h1 className="page-title">📜 My Offer Letter</h1>
              <p className="page-subtitle">View and manage your internship offer</p>
            </div>
          </header>
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Loading offer details...</p>
          </div>
        </main>
      </div>
    );
  }

  const docStats = getDocumentStats();
  const internStatus = internData?.status || 'DOCUMENT_PENDING';

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
            <h1 className="page-title">My Offer Letter</h1>
            <p className="page-subtitle">View and manage your internship offer</p>
          </div>
        </header>

        {/* Status: Documents Not Uploaded */}
        {internStatus === 'DOCUMENT_PENDING' && !docStats.allUploaded && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ marginBottom: '12px', color: '#333' }}>Documents Required</h2>
            <p style={{ color: '#666', fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px' }}>
              Please upload all required documents to proceed with your offer letter generation.
            </p>
            
            <div style={{
              display: 'inline-block',
              padding: '20px 32px',
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>
                {docStats.uploaded} / {docStats.total}
              </div>
              <div style={{ fontSize: '14px', color: '#78350f' }}>Documents Uploaded</div>
            </div>

            <div>
              <button 
                className="btn btn-primary" 
                style={{ padding: '12px 32px', fontSize: '16px' }}
                onClick={() => navigate('/documents')}
              >
                Upload Documents
              </button>
            </div>
          </div>
        )}

        {/* Status: Documents Uploaded - Under Verification */}
        {docStats.allUploaded && !docStats.allVerified && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ marginBottom: '12px', color: '#333' }}>Documents Under Verification</h2>
            <p style={{ color: '#666', fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px' }}>
              All required documents have been uploaded successfully! Our HR team is currently reviewing them.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                padding: '16px 24px',
                background: '#dcfce7',
                border: '2px solid #10b981',
                borderRadius: '12px',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#065f46' }}>
                  {docStats.verified}
                </div>
                <div style={{ fontSize: '14px', color: '#065f46' }}>Verified</div>
              </div>

              <div style={{
                padding: '16px 24px',
                background: '#fef3c7',
                border: '2px solid #fbbf24',
                borderRadius: '12px',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>
                  {docStats.pending}
                </div>
                <div style={{ fontSize: '14px', color: '#92400e' }}>Pending</div>
              </div>

              {docStats.rejected > 0 && (
                <div style={{
                  padding: '16px 24px',
                  background: '#fee2e2',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  minWidth: '150px'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#991b1b' }}>
                    {docStats.rejected}
                  </div>
                  <div style={{ fontSize: '14px', color: '#991b1b' }}>Rejected</div>
                </div>
              )}
            </div>

            {docStats.rejected > 0 && (
              <div style={{
                background: '#fee2e2',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                maxWidth: '600px',
                margin: '0 auto 24px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
                  Some Documents Were Rejected
                </div>
                <div style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '16px' }}>
                  Please re-upload the rejected documents to continue with verification.
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={() => navigate('/documents')}
                >
                  📄 View & Re-upload Documents
                </button>
              </div>
            )}

            <p style={{ fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
              You will be notified once all documents are verified. Estimated time: 1-2 business days.
            </p>
          </div>
        )}

        {/* Status: Documents Verified - Offer Letter in Progress */}
        {docStats.allVerified && !offerData && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ marginBottom: '12px', color: '#333' }}>Offer Letter Being Prepared</h2>
            <p style={{ color: '#666', fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px' }}>
              Excellent! All your documents have been verified. Our HR team is now preparing your offer letter.
            </p>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: '#dbeafe',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              marginTop: '16px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', color: '#1e40af' }}>All Documents Verified</div>
                <div style={{ fontSize: '14px', color: '#1e3a8a' }}>Offer letter will be ready within 2-3 business days</div>
              </div>
            </div>
          </div>
        )}

        {/* Status: Offer Letter Generated */}
        {offerData && offerData.status !== 'ACCEPTED' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Your Offer Letter is Ready!</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Congratulations! Your internship offer letter has been generated. Please review and accept it.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Offer Summary</h3>
                <span className="badge badge-success">Generated</span>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Position
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      {offerData.position}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Department
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      {offerData.department}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Monthly Stipend
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                      ₹{offerData?.stipend?.toLocaleString() || '0'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Start Date
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      {new Date(offerData.startDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '32px', 
                  padding: '20px', 
                  background: '#fffbeb', 
                  border: '2px solid #fbbf24',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>📋 Action Required</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Please review the offer and take action.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={handleDownload}>
                      Download PDF
                    </button>
                    <button className="btn btn-outline" onClick={() => setShowPreview(true)}>
                      Preview
                    </button>
                    <button className="btn btn-success" onClick={handleAccept}>
                      Accept Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Status: Offer Accepted */}
        {offerData && offerData.status === 'ACCEPTED' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: 'white',
              padding: '32px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎊</div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Offer Accepted!</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
                Welcome to Wissen Technology! Your journey starts on {new Date(offerData.startDate).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🚀 Next Steps</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: '#dbeafe', 
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>1</div>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>HR will contact you</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Our HR team will reach out via email with onboarding details
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: '#dbeafe', 
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>2</div>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>Complete pre-joining formalities</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Submit any pending documents and complete background verification
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: '#dbeafe', 
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>3</div>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>Start your internship</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Join on {new Date(offerData.startDate).toLocaleDateString('en-IN')} and begin your journey!
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button className="btn btn-primary" onClick={handleDownload}>
                    📥 Download Offer Letter
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preview Modal */}
        {showPreview && offerData && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Offer Letter Preview</h2>
                <button className="modal-close" onClick={() => setShowPreview(false)}>×</button>
              </div>
              
              <div className="modal-body" style={{ maxHeight: '600px', overflow: 'auto' }}>
                <div style={{ padding: '40px', background: 'white', fontFamily: 'serif' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ color: '#1e40af', margin: '0 0 8px 0' }}>Wissen Technology</h1>
                    <p style={{ margin: 0, color: '#666' }}>Bangalore, India</p>
                  </div>

                  <div style={{ marginBottom: '24px', textAlign: 'right', color: '#666' }}>
                    Date: {new Date(offerData.generatedAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <strong>{user?.name}</strong><br />
                    {user?.email}
                  </div>

                  <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>
                    Subject: Internship Offer - {offerData.position}
                  </h2>

                  <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                    Dear {user?.name},
                  </p>

                  <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                    We are pleased to offer you the position of <strong>{offerData.position}</strong> in the {offerData.department} department at Wissen Technology.
                  </p>

                  <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Offer Details:</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Position:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>{offerData.position}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Monthly Stipend:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>₹{offerData.stipend.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Start Date:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>{new Date(offerData.startDate).toLocaleDateString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0' }}><strong>Location:</strong></td>
                          <td style={{ padding: '8px 0' }}>{offerData.location}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={handleDownload}>
                  Download
                </button>
                <button className="btn btn-success" onClick={() => {
                  setShowPreview(false);
                  handleAccept();
                }}>
                  Accept Offer
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Upload Signed Offer Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📤 Upload Signed Offer Letter</h2>
                <button className="close-btn" onClick={() => setShowUploadModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #fbbf24', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '20px' 
                }}>
                  <p style={{ margin: 0, color: '#92400e' }}>
                    <strong>⚠️ Important:</strong> Please download the offer letter, sign it, scan/take a clear photo, and upload it below to accept the offer.
                  </p>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <button className="btn btn-outline" onClick={handleDownload} style={{ width: '100%' }}>
                    📥 Download Offer Letter
                  </button>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Upload Signed Offer Letter (PDF/Image)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSignedOfferFile(e.target.files[0])}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                  {signedOfferFile && (
                    <p style={{ marginTop: '8px', color: '#059669', fontSize: '14px' }}>
                      Selected: {signedOfferFile.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleUploadAndAccept}
                  disabled={!signedOfferFile}
                  style={{ opacity: signedOfferFile ? 1 : 0.5 }}
                >
                  Upload & Accept Offer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InternOffer;
