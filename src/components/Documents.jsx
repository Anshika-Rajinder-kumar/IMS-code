import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Documents.css';

const Documents = () => {
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [interns, setInterns] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      college: 'IIT Delhi',
      email: 'rahul.sharma@example.com',
      documents: [
        { id: 1, name: 'Resume', type: 'PDF', status: 'verified', uploadDate: '2026-01-10', size: '245 KB' },
        { id: 2, name: 'Degree Certificate', type: 'PDF', status: 'verified', uploadDate: '2026-01-10', size: '1.2 MB' },
        { id: 3, name: 'Photo ID', type: 'JPG', status: 'pending', uploadDate: '2026-01-15', size: '892 KB' },
        { id: 4, name: 'Address Proof', type: 'PDF', status: 'pending', uploadDate: '2026-01-15', size: '520 KB' },
        { id: 5, name: 'Bank Details', type: 'PDF', status: 'rejected', uploadDate: '2026-01-12', size: '180 KB', reason: 'Document not clear' },
      ]
    },
    {
      id: 2,
      name: 'Priya Patel',
      college: 'BITS Pilani',
      email: 'priya.patel@example.com',
      documents: [
        { id: 1, name: 'Resume', type: 'PDF', status: 'verified', uploadDate: '2026-01-08', size: '320 KB' },
        { id: 2, name: 'Degree Certificate', type: 'PDF', status: 'verified', uploadDate: '2026-01-08', size: '980 KB' },
        { id: 3, name: 'Photo ID', type: 'JPG', status: 'verified', uploadDate: '2026-01-09', size: '650 KB' },
        { id: 4, name: 'Address Proof', type: 'PDF', status: 'verified', uploadDate: '2026-01-09', size: '440 KB' },
        { id: 5, name: 'Bank Details', type: 'PDF', status: 'verified', uploadDate: '2026-01-09', size: '210 KB' },
      ]
    },
    {
      id: 3,
      name: 'Amit Kumar',
      college: 'NIT Trichy',
      email: 'amit.kumar@example.com',
      documents: [
        { id: 1, name: 'Resume', type: 'PDF', status: 'pending', uploadDate: '2026-01-16', size: '280 KB' },
        { id: 2, name: 'Degree Certificate', type: 'PDF', status: 'pending', uploadDate: '2026-01-16', size: '1.1 MB' },
        { id: 3, name: 'Photo ID', type: 'JPG', status: 'pending', uploadDate: '2026-01-16', size: '720 KB' },
      ]
    },
  ]);

  const handleVerify = (internId, docId) => {
    setInterns(interns.map(intern => {
      if (intern.id === internId) {
        return {
          ...intern,
          documents: intern.documents.map(doc => 
            doc.id === docId ? { ...doc, status: 'verified' } : doc
          )
        };
      }
      return intern;
    }));
  };

  const handleReject = (internId, docId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      setInterns(interns.map(intern => {
        if (intern.id === internId) {
          return {
            ...intern,
            documents: intern.documents.map(doc => 
              doc.id === docId ? { ...doc, status: 'rejected', reason } : doc
            )
          };
        }
        return intern;
      }));
    }
  };

  const getDocumentStatusBadge = (status) => {
    const statusMap = {
      'verified': 'badge-success',
      'pending': 'badge-warning',
      'rejected': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getDocumentIcon = (type) => {
    const iconMap = {
      'PDF': '📄',
      'JPG': '🖼️',
      'PNG': '🖼️',
      'DOC': '📝',
      'DOCX': '📝'
    };
    return iconMap[type] || '📎';
  };

  const getCompletionPercentage = (documents) => {
    const verified = documents.filter(doc => doc.status === 'verified').length;
    return Math.round((verified / documents.length) * 100);
  };

  const filteredInterns = interns.filter(intern =>
    intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button className="btn btn-outline">
              📊 Verification Report
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-bar" style={{ marginBottom: '24px' }}>
          <div className="stat-item">
            <span className="stat-icon">📁</span>
            <div>
              <div className="stat-number">{interns.reduce((acc, i) => acc + i.documents.length, 0)}</div>
              <div className="stat-label">Total Documents</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <div>
              <div className="stat-number">{interns.reduce((acc, i) => acc + i.documents.filter(d => d.status === 'verified').length, 0)}</div>
              <div className="stat-label">Verified</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏳</span>
            <div>
              <div className="stat-number">{interns.reduce((acc, i) => acc + i.documents.filter(d => d.status === 'pending').length, 0)}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">❌</span>
            <div>
              <div className="stat-number">{interns.reduce((acc, i) => acc + i.documents.filter(d => d.status === 'rejected').length, 0)}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search interns by name or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="documents-layout">
          {/* Interns List */}
          <div className="interns-sidebar-list">
            {filteredInterns.map(intern => {
              const completion = getCompletionPercentage(intern.documents);
              const pendingDocs = intern.documents.filter(d => d.status === 'pending').length;
              
              return (
                <div
                  key={intern.id}
                  className={`intern-list-item ${selectedIntern?.id === intern.id ? 'active' : ''}`}
                  onClick={() => setSelectedIntern(intern)}
                >
                  <div className="intern-avatar">
                    {intern.name.charAt(0)}
                  </div>
                  <div className="intern-list-info">
                    <div className="intern-list-name">{intern.name}</div>
                    <div className="intern-list-college">{intern.college}</div>
                    <div className="completion-bar">
                      <div className="completion-fill" style={{ width: `${completion}%` }}></div>
                    </div>
                    <div className="completion-text">{completion}% Complete</div>
                  </div>
                  {pendingDocs > 0 && (
                    <div className="pending-badge">{pendingDocs}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Document Details */}
          <div className="documents-main">
            {selectedIntern ? (
              <>
                <div className="card" style={{ marginBottom: '24px' }}>
                  <div className="intern-header-section">
                    <div className="intern-header-avatar">
                      {selectedIntern.name.charAt(0)}
                    </div>
                    <div className="intern-header-info">
                      <h2>{selectedIntern.name}</h2>
                      <p>{selectedIntern.college}</p>
                      <p className="intern-email">{selectedIntern.email}</p>
                    </div>
                    <div className="completion-badge">
                      <div className="completion-circle">
                        <svg width="80" height="80">
                          <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 35}`}
                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - getCompletionPercentage(selectedIntern.documents) / 100)}`}
                            transform="rotate(-90 40 40)"
                          />
                        </svg>
                        <div className="completion-percentage">{getCompletionPercentage(selectedIntern.documents)}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Documents ({selectedIntern.documents.length})</h3>
                  </div>
                  
                  <div className="documents-list">
                    {selectedIntern.documents.map(doc => (
                      <div key={doc.id} className="document-item">
                        <div className="document-icon">
                          {getDocumentIcon(doc.type)}
                        </div>
                        
                        <div className="document-info">
                          <div className="document-name">{doc.name}</div>
                          <div className="document-meta">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>Uploaded: {doc.uploadDate}</span>
                          </div>
                          {doc.status === 'rejected' && doc.reason && (
                            <div className="rejection-reason">
                              ⚠️ Reason: {doc.reason}
                            </div>
                          )}
                        </div>

                        <div className="document-status">
                          <span className={`badge ${getDocumentStatusBadge(doc.status)}`}>
                            {doc.status === 'verified' && '✓ '}
                            {doc.status === 'rejected' && '✗ '}
                            {doc.status === 'pending' && '⏳ '}
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </div>

                        <div className="document-actions">
                          <button className="btn btn-outline btn-sm">
                            👁️ View
                          </button>
                          <button className="btn btn-outline btn-sm">
                            ⬇️ Download
                          </button>
                          {doc.status !== 'verified' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleVerify(selectedIntern.id, doc.id)}
                            >
                              ✓ Verify
                            </button>
                          )}
                          {doc.status !== 'rejected' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(selectedIntern.id, doc.id)}
                            >
                              ✗ Reject
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>Select an Intern</h3>
                <p>Choose an intern from the list to view and verify their documents</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;
