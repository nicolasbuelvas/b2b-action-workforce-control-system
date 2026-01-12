import React, { useState } from 'react';
import './LinkedinEvidenceUploadsPage.css';

export default function LinkedinEvidenceUploadsPage() {
  const [files, setFiles] = useState([
    { id: 1, name: 'screenshot_conv_miles.png', type: 'Conversation', size: '1.2 MB', status: 'verified' },
    { id: 2, name: 'profile_check_dyson.jpg', type: 'Profile Proof', size: '2.5 MB', status: 'pending' },
  ]);

  return (
    <div className="li-uploads">
      <header className="page-header">
        <div className="title-area">
          <h1>LinkedIn Asset Vault</h1>
          <p>Secure management of evidence for multi-step outreach tasks.</p>
        </div>
        <div className="header-meta">
          <div className="storage-info">
            <span>Storage Used: <strong>12.4 GB / 50 GB</strong></span>
            <div className="storage-bar"><div className="fill" style={{ width: '25%' }}></div></div>
          </div>
        </div>
      </header>

      <div className="upload-main">
        <section className="dropzone-section">
          <div className="li-dropzone">
            <span className="dz-icon">📸</span>
            <h3>Upload New Proof</h3>
            <p>Drag and drop PNG, JPG or PDF. Maximum file size: 10MB.</p>
            <button className="btn-dz">Browse Files</button>
          </div>

          <div className="upload-guidelines">
            <h4>LinkedIn Evidence Requirements</h4>
            <ul>
              <li>Full Browser Capture: Must show LinkedIn's navigation bar.</li>
              <li>Timestamp Visible: Your system clock must be visible in the shot.</li>
              <li>Clear Text: Messages must be readable without zooming.</li>
              <li>Unedited: No cropping, blurring, or blacking out content.</li>
            </ul>
          </div>
        </section>

        <section className="file-library">
          <div className="library-header">
            <h3>Recent Uploads</h3>
            <div className="library-filters">
              <select><option>All Proofs</option><option>Conversations</option></select>
            </div>
          </div>

          <div className="file-grid">
            {files.map(file => (
              <div key={file.id} className="file-card">
                <div className="file-preview">
                  <div className="file-type-icon">📄</div>
                </div>
                <div className="file-details">
                  <div className="file-top">
                    <span className="file-tag">{file.type}</span>
                    <span className={`status-dot ${file.status}`}></span>
                  </div>
                  <p className="file-name">{file.name}</p>
                  <div className="file-footer">
                    <span>{file.size}</span>
                    <div className="file-actions">
                      <button className="btn-icon">👁️</button>
                      <button className="btn-icon">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}