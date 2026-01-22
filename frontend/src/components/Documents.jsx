import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './Documents.css';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [internsWithDocs, setInternsWithDocs] = useState([]);

  useEffect(() => {
    fetchInternsWithDocuments();
  }, []);

  const fetchInternsWithDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching interns...');
      const interns = await api.get('/interns');
      console.log('Interns received:', interns);
      
      // Fetch documents for each intern
      const internsWithDocsData = await Promise.all(
        interns.map(async (intern) => {
          try {
            const docs = await api.get(`/documents/intern/${intern.id}`);
            console.log(`Documents for intern ${intern.id}:`, docs);
            return {
              ...intern,
              documents: docs || []
            };
          } catch (err) {
            console.error(`Error fetching docs for intern ${intern.id}:`, err);
            return {
              ...intern,
              documents: []
            };
          }
        })
      );
      
      console.log('Interns with documents:', internsWithDocsData);
      setInternsWithDocs(internsWithDocsData);
    } catch (err) {
      setError('Failed to fetch interns and documents');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (docId, internId) => {
    try {
      await api.put(`/documents/${docId}/verify`);
      alert('Document verified successfully!');
      await fetchInternsWithDocuments();
    } catch (err) {
      console.error('Error verifying document:', err);
      alert('Failed to verify document');
    }
  };

  const handleRejectDocument = async (docId, internId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.put(`/documents/${docId}/reject`, { reason });
        alert('Document rejected');
        await fetchInternsWithDocuments();
      } catch (err) {
        console.error('Error rejecting document:', err);
        alert('Failed to reject document');
      }
    }
  };

  const handleVerifyInternStatus = async (internId) => {
    const intern = internsWithDocs.find(i => i.id === internId);
    
    if (intern.status !== 'DOCUMENT_VERIFICATION') {
      alert('Intern status is not DOCUMENT_VERIFICATION');
      return;
    }

    const confirmed = window.confirm(`Change status to DOCUMENT_VERIFIED for ${intern.name}?`);
    if (confirmed) {
      try {
        console.log('Updating intern status to DOCUMENT_VERIFIED for intern ID:', internId);
        // Update intern status using PUT endpoint with full intern data
        await api.put(`/interns/${internId}`, {
          ...intern,
          status: 'DOCUMENT_VERIFIED'
        });
        
        alert('Intern status updated to DOCUMENT_VERIFIED!');
        await fetchInternsWithDocuments();
      } catch (err) {
        console.error('Error updating intern status:', err);
        alert('Failed to update intern status: ' + err.message);
      }
    }
  };

  const handleVerifyAllDocuments = async (internId) => {
    const intern = internsWithDocs.find(i => i.id === internId);
    const pendingDocs = intern.documents.filter(d => d.status === 'PENDING');
    
    if (pendingDocs.length === 0) {
      alert('No pending documents to verify');
      return;
    }

    const confirmed = window.confirm(`Verify all ${pendingDocs.length} pending documents for ${intern.name}?`);
    if (confirmed) {
      try {
        await Promise.all(
          pendingDocs.map(doc => api.put(`/documents/${doc.id}/verify`))
        );
        
        alert('All documents verified!');
        await fetchInternsWithDocuments();
      } catch (err) {
        console.error('Error verifying documents:', err);
        alert('Failed to verify all documents');
      }
    }
  };

  const getDocumentStatusBadge = (status) => {
    const statusMap = {
      'VERIFIED': 'badge-success',
      'PENDING': 'badge-warning',
      'REJECTED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DOCUMENT_PENDING': 'badge-danger',
      'DOCUMENT_VERIFICATION': 'badge-warning',
      'DOCUMENT_VERIFIED': 'badge-success',
      'INTERVIEW_SCHEDULED': 'badge-info',
      'OFFER_GENERATED': 'badge-success',
      'ONBOARDING': 'badge-info',
      'ACTIVE': 'badge-success',
      'COMPLETED': 'badge-secondary',
      'TERMINATED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const getDocumentIcon = (type) => {
    const iconMap = {
      'PDF': '📄',
      'JPG': '🖼️',
      'PNG': '🖼️',
      'DOC': '📝',
      'DOCX': '📝'
    };
    return iconMap[type?.toUpperCase()] || '📎';
  };

  const getVerificationStatus = (docs) => {
    if (!docs || docs.length === 0) return 'NO_DOCS';
    const allVerified = docs.every(d => d.status === 'VERIFIED');
    const hasPending = docs.some(d => d.status === 'PENDING');
    const hasRejected = docs.some(d => d.status === 'REJECTED');
    
    if (allVerified) return 'ALL_VERIFIED';
    if (hasPending) return 'PENDING';
    if (hasRejected) return 'REJECTED';
    return 'PENDING';
  };

  const filteredInterns = internsWithDocs.filter(intern => {
    // Only show interns with DOCUMENT_VERIFICATION or DOCUMENT_VERIFIED status
    const hasCorrectStatus = intern.status === 'DOCUMENT_VERIFICATION' || intern.status === 'DOCUMENT_VERIFIED';
    if (!hasCorrectStatus) return false;
    
    const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (intern.collegeName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    
    // Filter by intern status, not document status
    if (filterStatus === 'VERIFIED') return matchesSearch && intern.status === 'DOCUMENT_VERIFIED';
    if (filterStatus === 'PENDING') return matchesSearch && intern.status === 'DOCUMENT_VERIFICATION';
    
    return matchesSearch;
  });

  const totalDocs = internsWithDocs.reduce((acc, i) => acc + (i.documents?.length || 0), 0);
  const verifiedDocs = internsWithDocs.reduce((acc, i) => 
    acc + (i.documents?.filter(d => d.status === 'VERIFIED').length || 0), 0);
  const pendingDocs = internsWithDocs.reduce((acc, i) => 
    acc + (i.documents?.filter(d => d.status === 'PENDING').length || 0), 0);
  const rejectedDocs = internsWithDocs.reduce((acc, i) => 
    acc + (i.documents?.filter(d => d.status === 'REJECTED').length || 0), 0);

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Document Verification</h1>
            <p className="page-subtitle">Review and verify intern documents</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={fetchInternsWithDocuments}>
              🔄 Refresh
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-bar" style={{ marginBottom: '24px' }}>
          <div className="stat-item">
            <span className="stat-icon">📁</span>
            <div>
              <div className="stat-number">{totalDocs}</div>
              <div className="stat-label">Total Documents</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <div>
              <div className="stat-number">{verifiedDocs}</div>
              <div className="stat-label">Verified</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏳</span>
            <div>
              <div className="stat-number">{pendingDocs}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">❌</span>
            <div>
              <div className="stat-number">{rejectedDocs}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#fee', color: '#c33', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by intern name or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All
              </button>
              <button 
                className={`btn ${filterStatus === 'VERIFIED' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('VERIFIED')}
              >
                ✅ Document Verified
              </button>
              <button 
                className={`btn ${filterStatus === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('PENDING')}
              >
                ⏳ Under Verification
              </button>
            </div>
          </div>
        </div>

        {/* Interns with Documents */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading...
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No interns found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredInterns.map(intern => {
              const verificationStatus = getVerificationStatus(intern.documents);
              const verifiedCount = intern.documents?.filter(d => d.status === 'VERIFIED').length || 0;
              const totalCount = intern.documents?.length || 0;
              
              return (
                <div key={intern.id} className="card">
                  {/* Intern Header */}
                  <div style={{ 
                    padding: '20px', 
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div className="intern-avatar" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                      {intern.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                        {intern.name}
                      </h3>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {intern.collegeName || 'N/A'} • {intern.email}
                      </p>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={`badge ${getStatusBadge(intern.status)}`}>
                          Intern Status: {formatStatus(intern.status)}
                        </span>
                        <span className={`badge ${
                          verificationStatus === 'ALL_VERIFIED' ? 'badge-success' :
                          verificationStatus === 'PENDING' ? 'badge-warning' :
                          verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-secondary'
                        }`}>
                          {verifiedCount} / {totalCount} Documents Verified
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                      {intern.status === 'DOCUMENT_VERIFICATION' && (
                        <button
                          className="btn btn-success"
                          onClick={() => handleVerifyInternStatus(intern.id)}
                        >
                          ✅ Verify Status
                        </button>
                      )}
                      {intern.documents && intern.documents.length > 0 && (
                        <button
                          className="btn btn-outline"
                          onClick={() => handleVerifyAllDocuments(intern.id)}
                          disabled={!intern.documents.some(d => d.status === 'PENDING')}
                        >
                          📄 Verify All Documents
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Documents List */}
                  <div style={{ padding: '20px' }}>
                    {intern.documents && intern.documents.length > 0 ? (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {intern.documents.map(doc => (
                          <div 
                            key={doc.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              backgroundColor: '#f9fafb'
                            }}
                          >
                            <div style={{ fontSize: '32px' }}>
                              {getDocumentIcon(doc.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {doc.name}
                              </div>
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {doc.type} • {doc.size} • Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                              </div>
                              {doc.rejectionReason && (
                                <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '4px' }}>
                                  Reason: {doc.rejectionReason}
                                </div>
                              )}
                            </div>
                            <span className={`badge ${getDocumentStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                            {doc.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleVerifyDocument(doc.id, intern.id)}
                                >
                                  ✓ Verify
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRejectDocument(doc.id, intern.id)}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No documents uploaded yet
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Documents;
