import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import Toast from './Toast';
import './Documents.css';

const InternDocuments = () => {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [toast, setToast] = useState(null);

  // Required document templates
  const documentTemplates = [
    { 
      label: 'Aadhaar Card',
      name: 'AADHAAR',
      description: 'Government issued identity proof',
      required: true,
      type: 'IDENTITY'
    },
    { 
      label: 'PAN Card',
      name: 'PAN',
      description: 'Permanent Account Number card',
      required: true,
      type: 'IDENTITY'
    },
    { 
      label: '10th Certificate',
      name: 'CLASS_10',
      description: 'Class 10th mark sheet or certificate',
      required: true,
      type: 'EDUCATION'
    },
    { 
      label: '12th Certificate',
      name: 'CLASS_12',
      description: 'Class 12th mark sheet or certificate',
      required: true,
      type: 'EDUCATION'
    },
    { 
      label: 'Degree Certificate',
      name: 'DEGREE',
      description: 'Bachelor degree or provisional certificate',
      required: true,
      type: 'EDUCATION'
    },
    { 
      label: 'Resume/CV',
      name: 'RESUME',
      description: 'Updated resume in PDF format',
      required: true,
      type: 'EDUCATION'
    },
    { 
      label: 'Passport Size Photo',
      name: 'PHOTO',
      description: 'Recent passport size photograph',
      required: true,
      type: 'IDENTITY'
    },
    { 
      label: 'Bank Passbook',
      name: 'BANK_PASSBOOK',
      description: 'First page of bank passbook or cancelled cheque',
      required: true,
      type: 'OTHER'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.internId) {
        fetchDocuments(parsedUser.internId);
      } else {
        alert('Intern ID not found. Please log out and log in again.');
      }
    }
  }, []);

  const fetchDocuments = async (internId) => {
    try {
      setLoading(true);
      const data = await api.getDocumentsByInternId(internId);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert('Failed to load documents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadClick = (template) => {
    setSelectedDoc(template);
    setUploadFile(null);
    setShowUploadModal(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      const uploadedDoc = await api.uploadDocument(
        user.internId,
        selectedDoc.name,
        selectedDoc.label,
        selectedDoc.icon,
        selectedDoc.description,
        selectedDoc.type,
        uploadFile
      );

      // Start Camunda document verification workflow
      if (uploadedDoc && uploadedDoc.id) {
        try {
          await api.startDocumentVerification(uploadedDoc.id, user.internId);
          console.log('Document verification workflow started for doc:', uploadedDoc.id);
        } catch (workflowErr) {
          console.error('Failed to start document workflow:', workflowErr);
          // Don't fail the upload if workflow fails
        }
      }

      // Refresh documents
      await fetchDocuments(user.internId);
      
      setShowUploadModal(false);
      setUploadFile(null);
      setToast({ message: 'Document uploaded successfully! It will be verified by HR.', type: 'success' });
    } catch (error) {
      console.error('Error uploading document:', error);
      setToast({ message: 'Failed to upload document: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async (doc) => {
    setSelectedDoc({...doc, isReplace: true});
    setUploadFile(null);
    setShowUploadModal(true);
  };

  const handleViewDocument = async (docId) => {
    try {
      const token = api.getAuthToken();
      const url = `${api.baseURL}/documents/${docId}/view`;
      // Open in new tab with auth header by creating a blob URL
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('View failed');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to view document: ' + error.message);
    }
  };

  const handleDownloadDocument = async (docId, docName) => {
    try {
      const token = api.getAuthToken();
      const response = await fetch(`${api.baseURL}/documents/${docId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'type:', blob.type);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      console.log('Content-Disposition header:', contentDisposition);
      
      let filename = 'document';
      
      // Extract filename from Content-Disposition header if available
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
          console.log('Extracted filename:', filename);
        }
      }
      
      // Fallback to docName if no filename in header
      if (filename === 'document' && docName) {
        filename = docName + '.pdf'; // Add default extension
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('Download initiated for:', filename);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document: ' + error.message);
    }
  };

  const handleDelete = async (docId) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    if (confirmed) {
      try {
        setLoading(true);
        await api.deleteDocument(docId);
        await fetchDocuments(user.internId);
        alert('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'VERIFIED': 'badge-success',
      'PENDING': 'badge-warning',
      'REJECTED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusIcon = (status) => {
    return status;
  };

  const getStatusMessage = (status) => {
    const messageMap = {
      'VERIFIED': 'Your document has been verified',
      'PENDING': 'Your document is under verification',
      'REJECTED': 'Your document was rejected. Please upload a new one.'
    };
    return messageMap[status] || '';
  };

  // Merge templates with uploaded documents
  const getMergedDocuments = () => {
    return documentTemplates.map(template => {
      const uploadedDoc = documents.find(d => d.name === template.name);
      return {
        ...template,
        ...uploadedDoc,
        uploaded: !!uploadedDoc,
        id: uploadedDoc?.id
      };
    });
  };

  const requiredDocuments = getMergedDocuments();
  const verifiedCount = documents.filter(d => d.status === 'VERIFIED').length;
  const pendingCount = documents.filter(d => d.status === 'PENDING').length;
  const rejectedCount = documents.filter(d => d.status === 'REJECTED').length;
  const uploadedCount = documents.length;
  const totalRequired = documentTemplates.filter(d => d.required).length;

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
            <h1 className="page-title">My Documents</h1>
            <p className="page-subtitle">Upload and manage your required documents</p>
          </div>
          <div className="header-actions">
            <div style={{ 
              padding: '8px 16px', 
              background: uploadedCount === totalRequired ? '#d1fae5' : '#fef3c7',
              color: uploadedCount === totalRequired ? '#065f46' : '#78350f',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {uploadedCount} / {totalRequired} Documents Uploaded
            </div>
          </div>
        </header>

        {/* Document Stats */}
        <div className="stats-bar" style={{ marginBottom: '32px' }}>
          <div className="stat-item">
            <div>
              <div className="stat-number">{uploadedCount}/{totalRequired}</div>
              <div className="stat-label">Uploaded</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number">{verifiedCount}</div>
              <div className="stat-label">Verified</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number">{pendingCount}</div>
              <div className="stat-label">Under Review</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number">{totalRequired - uploadedCount}</div>
              <div className="stat-label">Pending Upload</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600' }}>Overall Progress</span>
            <span style={{ fontWeight: '600', color: '#10b981' }}>
              {Math.round((uploadedCount / totalRequired) * 100)}%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '12px', 
            background: '#e5e7eb', 
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(uploadedCount / totalRequired) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              transition: 'width 0.3s ease',
              borderRadius: '6px'
            }}></div>
          </div>
        </div>

        {/* Documents List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Required Documents</h3>
            <span style={{ fontSize: '14px', color: '#666' }}>
              All documents are mandatory for onboarding
            </span>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              {requiredDocuments.map((doc, index) => (
                <div 
                  key={doc.id || `template-${index}`}
                  style={{
                    border: doc.uploaded 
                      ? (doc.status === 'VERIFIED' ? '2px solid #10b981' : 
                         doc.status === 'PENDING' ? '2px solid #f59e0b' : '2px solid #e5e7eb')
                      : '2px dashed #d1d5db',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: doc.uploaded 
                      ? (doc.status === 'VERIFIED' ? '#f0fdf4' : 
                         doc.status === 'PENDING' ? '#fffbeb' : '#fff')
                      : '#fafafa',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    
                    {/* Document Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                          {doc.label}
                        </h4>
                        {doc.required && (
                          <span style={{ 
                            fontSize: '11px', 
                            padding: '2px 8px', 
                            background: '#fee2e2', 
                            color: '#991b1b',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>
                            REQUIRED
                          </span>
                        )}
                        {doc.status && (
                          <span className={`badge ${getStatusBadge(doc.status)}`}>
                            {doc.status}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                        {doc.description}
                      </p>
                      
                      {/* File Details if uploaded */}
                      {doc.uploaded && (
                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          <span>{doc.filePath?.split('/').pop() || 'Document'}</span>
                          <span>{doc.size || 'Unknown size'}</span>
                          <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</span>
                          {doc.verifiedBy && (
                            <span style={{ color: '#10b981', fontWeight: '500' }}>
                              Verified by {doc.verifiedBy}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {!doc.uploaded ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleUploadClick(doc)}
                          style={{ minWidth: '120px' }}
                        >
                          📤 Upload
                        </button>
                      ) : (
                        <>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleViewDocument(doc.id)}
                          >
                            👁️ View
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDownloadDocument(doc.id, doc.name)}
                          >
                            📥 Download
                          </button>
                          {doc.status !== 'VERIFIED' && (
                            <>
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => handleReplace(doc)}
                              >
                                🔄 Replace
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(doc.id)}
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Message */}
                  {doc.uploaded && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      background: doc.status === 'VERIFIED' ? '#d1fae5' : 
                                 doc.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: doc.status === 'VERIFIED' ? '#065f46' : 
                             doc.status === 'PENDING' ? '#78350f' : '#991b1b'
                    }}>
                      {doc.status === 'VERIFIED' && 'Your document has been verified and approved'}
                      {doc.status === 'PENDING' && 'Your document is under review by HR team'}
                      {doc.status === 'REJECTED' && 'Your document was rejected. Please upload a new one'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">📋 Upload Guidelines</h3>
          </div>
          <div style={{ padding: '20px' }}>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '8px', color: '#666' }}>
              <li>All documents must be clear and readable</li>
              <li>Accepted formats: PDF, JPG, PNG (Maximum size: 5MB per file)</li>
              <li>Ensure document names match the labels provided</li>
              <li>For certificates, upload complete documents (not cropped)</li>
              <li>Your documents will be verified within 24-48 hours</li>
              <li>You can replace documents until they are verified</li>
            </ul>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && selectedDoc && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h2 className="modal-title">
                  Upload {selectedDoc.label}
                </h2>
                <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleUpload}>
                <div className="modal-body">
                  <div style={{ 
                    padding: '16px', 
                    background: '#f0fdf4', 
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#166534' }}>
                      Document: {selectedDoc.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#15803d' }}>
                      {selectedDoc.description}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Select File *</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      required
                    />
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                    </small>
                  </div>

                  {uploadFile && (
                    <div style={{
                      padding: '12px',
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <div style={{ fontSize: '13px', color: '#166534' }}>
                        <strong>Selected:</strong> {uploadFile.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                        Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  )}

                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#78350f'
                  }}>
                    <strong>⚠️ Important:</strong> Make sure the document is clear, readable, and matches the required document type.
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    📤 Upload Document
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

export default InternDocuments;
