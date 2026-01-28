import React, { useState } from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';
import './BulkUpload.css';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const downloadTemplate = () => {
    const csvContent = "name,email,phone,branch,cgpa,graduationYear,emergencyContact,address,resumePath\n" +
      "John Doe,john.doe@example.com,9876543210,Computer Science,8.5,2026,9876543211,\"123 Main St, New York\",resumes/john_doe_resume.pdf\n" +
      "Jane Smith,jane.smith@example.com,9876543212,Information Technology,9.0,2025,9876543213,\"456 Park Ave, Boston\",resumes/jane_smith_resume.pdf\n" +
      "Alice Johnson,alice.johnson@example.com,9876543214,Electronics,8.2,2026,9876543215,\"789 Oak Dr, Chicago\",resumes/alice_johnson_resume.pdf";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a CSV file');
      e.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      setResult(null);

      // Check if collegeId exists
      if (!user.collegeId) {
        alert('College ID not found. Please log out and log in again.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('collegeId', user.collegeId.toString());
      formData.append('collegeName', user.collegeName);

      console.log('Uploading with collegeId:', user.collegeId, 'collegeName:', user.collegeName);
      console.log('FormData entries:', Array.from(formData.entries()));
      
      const response = await api.bulkUploadCandidates(formData);
      console.log('Upload response:', response);
      setResult(response);
      setFile(null);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to upload file: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Bulk Upload Candidates</h1>
            <p className="page-subtitle">Upload multiple candidates using CSV file</p>
          </div>
        </header>

        <div className="bulk-upload-container">
          {/* Instructions Card */}
          <div className="card">
            <h2 className="card-title">Instructions</h2>
            <div className="instructions">
              <ol>
                <li>Download the CSV template below</li>
                <li>Fill in the candidate details in the template</li>
                <li>Required fields: name, email, phone, branch, cgpa</li>
                <li>Optional fields: graduationYear, emergencyContact, address</li>
                <li>Upload the completed CSV file</li>
              </ol>
              <button className="btn btn-outline" onClick={downloadTemplate}>
                Download CSV Template
              </button>
            </div>
          </div>

          {/* Upload Card */}
          <div className="card">
            <h2 className="card-title">Upload CSV File</h2>
            <div className="upload-section">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="fileInput"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="fileInput" className="file-input-label">
                  {file ? file.name : 'Choose CSV File'}
                </label>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Candidates'}
              </button>
            </div>
          </div>

          {/* Results Card */}
          {result && (
            <div className="card">
              <h2 className="card-title">Upload Results</h2>
              <div className="results">
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-value">{result.totalRows}</div>
                    <div className="stat-label">Total Rows</div>
                  </div>
                  <div className="stat-card success">
                    <div className="stat-value">{result.successCount}</div>
                    <div className="stat-label">Successful</div>
                  </div>
                  <div className="stat-card error">
                    <div className="stat-value">{result.failureCount}</div>
                    <div className="stat-label">Failed</div>
                  </div>
                </div>

                {result.successMessages && result.successMessages.length > 0 && (
                  <div className="messages-section">
                    <h3 className="messages-title success-title">Successful Uploads</h3>
                    <div className="messages-list">
                      {result.successMessages.map((msg, idx) => (
                        <div key={idx} className="message success-message">{msg}</div>
                      ))}
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="messages-section">
                    <h3 className="messages-title error-title">Errors</h3>
                    <div className="messages-list">
                      {result.errors.map((error, idx) => (
                        <div key={idx} className="message error-message">{error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BulkUpload;
