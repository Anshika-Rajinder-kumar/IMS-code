import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './Offers.css';

const InternOffer = () => {
  const [user, setUser] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchOffer(parsedUser.id);
    }
  }, []);

  const fetchOffer = async (internId) => {
    try {
      setLoading(true);
      const data = await api.getLatestOfferByInternId(internId);
      setOfferData(data);
    } catch (error) {
      console.error('Error fetching offer:', error);
      // Offer not found is not an error - intern may not have offer yet
      setOfferData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!offerData) return;
    alert('Downloading offer letter as PDF...');
    // In real implementation, trigger PDF download from backend
    // window.location.href = api.baseURL + '/offers/' + offerData.id + '/download';
  };

  const handleAccept = async () => {
    const confirmed = window.confirm('Do you want to accept this offer? This action cannot be undone.');
    if (confirmed) {
      try {
        await api.acceptOffer(offerData.id);
        await fetchOffer(user.id); // Refresh offer data
        alert('🎉 Congratulations! You have accepted the offer. HR will contact you soon with next steps.');
      } catch (error) {
        console.error('Error accepting offer:', error);
        alert('Failed to accept offer: ' + error.message);
      }
    }
  };

  const handleDecline = async () => {
    const confirmed = window.confirm('Are you sure you want to decline this offer?');
    if (confirmed) {
      try {
        await api.rejectOffer(offerData.id);
        await fetchOffer(user.id); // Refresh offer data
        alert('Offer declined. Thank you for your time.');
      } catch (error) {
        console.error('Error declining offer:', error);
        alert('Failed to decline offer: ' + error.message);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <header className="dashboard-header">
            <div>
              <h1 className="page-title">My Offer Letter</h1>
              <p className="page-subtitle">View and manage your internship offer</p>
            </div>
          </header>
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Loading offer details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Determine offer status
  const getOfferStatus = () => {
    if (!offerData) return 'IN_PROGRESS';
    if (offerData.status === 'ACCEPTED') return 'ACCEPTED';
    if (offerData.status === 'GENERATED' || offerData.status === 'SENT') return 'GENERATED';
    return 'IN_PROGRESS';
  };

  const offerStatus = getOfferStatus();

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">My Offer Letter</h1>
            <p className="page-subtitle">View and manage your internship offer</p>
          </div>
        </header>

        {/* Offer Status */}
        {offerStatus === 'IN_PROGRESS' && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>⏳</div>
            <h2 style={{ marginBottom: '12px', color: '#333' }}>Offer Letter Generation in Progress</h2>
            <p style={{ color: '#666', fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px' }}>
              Your documents have been verified and you're doing great! Our HR team is currently preparing your offer letter. 
              You will be notified once it's ready.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              marginTop: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>💼</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', color: '#92400e' }}>Expected Timeline</div>
                <div style={{ fontSize: '14px', color: '#78350f' }}>Your offer will be ready within 2-3 business days</div>
              </div>
            </div>
          </div>
        )}

        {offerStatus === 'GENERATED' && (
          <>
            {/* Offer Ready Banner */}
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
              <div style={{ fontSize: '48px' }}>🎉</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Your Offer Letter is Ready!</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Congratulations! Your internship offer letter has been generated. Please review and accept it.
                </p>
              </div>
              <button 
                className="btn"
                style={{ background: 'white', color: '#059669' }}
                onClick={() => setShowPreview(true)}
              >
                📄 View Offer
              </button>
            </div>

            {/* Offer Summary Card */}
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
                      Duration
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      {offerData.duration}
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
                  
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Location
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      📍 {offerData.location}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Work Mode
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      {offerData.workMode}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                      Reporting Manager
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                      {offerData.reportingManager}
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                {offerData?.benefits && offerData.benefits.length > 0 && (
                  <div style={{ marginTop: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>🎁 Benefits & Perks</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {offerData.benefits.split(',').map((benefit, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span>{benefit.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
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
                      Please review the offer and take action. You can download, preview, or accept the offer.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={handleDownload}>
                      📥 Download PDF
                    </button>
                    <button className="btn btn-outline" onClick={() => setShowPreview(true)}>
                      👁️ Preview
                    </button>
                    <button className="btn btn-success" onClick={handleAccept}>
                      ✅ Accept Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {offerStatus === 'ACCEPTED' && (
          <>
            {/* Accepted Banner */}
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

            {/* Next Steps */}
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
                        Our HR team will reach out via email with onboarding details and schedule
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
                        Join on {new Date(offerData.startDate).toLocaleDateString('en-IN')} and begin your exciting journey!
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

            {/* Contact Info */}
            <div className="card" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <h3 className="card-title">📞 Need Help?</h3>
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ marginBottom: '16px', color: '#666' }}>
                  If you have any questions, feel free to reach out to our HR team:
                </p>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Email</div>
                    <div style={{ fontWeight: '600' }}>hr@wissentech.com</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontWeight: '600' }}>+91 80-1234-5678</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Offer Letter Preview</h2>
                <button className="modal-close" onClick={() => setShowPreview(false)}>×</button>
              </div>
              
              <div className="modal-body" style={{ maxHeight: '600px', overflow: 'auto' }}>
                {/* Offer Letter Template */}
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
                    We are pleased to offer you the position of <strong>{offerData.position}</strong> in the {offerData.department} department at Wissen Technology. We were impressed with your skills and believe you will be a valuable addition to our team.
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
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Department:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>{offerData.department}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Monthly Stipend:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>₹{offerData.stipend.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Duration:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>{offerData.duration}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Start Date:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>{new Date(offerData.startDate).toLocaleDateString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Location:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>{offerData.location}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}><strong>Work Mode:</strong></td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>{offerData.workMode}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0' }}><strong>Reporting To:</strong></td>
                          <td style={{ padding: '8px 0' }}>{offerData.reportingManager}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                    We look forward to having you join our team and contribute to exciting projects. Please confirm your acceptance by clicking the "Accept Offer" button.
                  </p>

                  <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>
                    Sincerely,<br />
                    <strong>HR Department</strong><br />
                    Wissen Technology
                  </p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={handleDownload}>
                  📥 Download
                </button>
                <button className="btn btn-success" onClick={() => {
                  setShowPreview(false);
                  handleAccept();
                }}>
                  ✅ Accept Offer
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
