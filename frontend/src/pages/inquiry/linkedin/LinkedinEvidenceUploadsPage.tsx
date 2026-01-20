import React from 'react';
import './LinkedinEvidenceUploadsPage.css';

export interface LinkedinEvidenceFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'verified' | 'pending';
}

interface Props {
  files?: LinkedinEvidenceFile[];
  storageUsed?: string;
  storageTotal?: string;
  storagePercent?: number;
}

export default function LinkedinEvidenceUploadsPage({
  files = [],
  storageUsed = '0 GB',
  storageTotal = '0 GB',
  storagePercent = 0,
}: Props) {
  return (
    <div className="li-uploads">
      <header className="page-header">
        <div className="title-area">
          <h1>LinkedIn Asset Vault</h1>
          <p>Secure management of evidence for multi-step outreach tasks.</p>
        </div>

        <div className="header-meta">
          <div className="storage-info">
            <span>
              Storage Used:{' '}
              <strong>
                {storageUsed} / {storageTotal}
              </strong>
            </span>
            <div className="storage-bar">
              <div
                className="fill"
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="upload-main">
        <section className="dropzone-section">
          <div className="li-dropzone">
            <span className="dz-icon">📸</span>
            <h3>Upload New Proof</h3>
            <p>Drag and drop PNG, JPG or PDF. Maximum file size: 500 KB.</p>
            <button className="btn-dz">Browse Files</button>
          </div>

          <div className="upload-guidelines">
            <h4>LinkedIn Evidence Requirements</h4>
            <ul>
              <li>Full Browser Capture: Must show LinkedIn navigation bar.</li>
              <li>Timestamp Visible: System clock must be visible.</li>
              <li>Clear Text: Messages must be readable.</li>
              <li>Unedited: No cropping, blurring or masking.</li>
            </ul>
          </div>
        </section>

        <section className="file-library">
          <div className="library-header">
            <h3>Recent Uploads</h3>
            <div className="library-filters">
              <select>
                <option>All Proofs</option>
                <option>Conversations</option>
                <option>Profile Proof</option>
              </select>
            </div>
          </div>

          {files.length === 0 ? (
            <div className="empty-library">
              <p>No evidence uploaded yet.</p>
            </div>
          ) : (
            <div className="file-grid">
              {files.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-preview">
                    <div className="file-type-icon">📄</div>
                  </div>

                  <div className="file-details">
                    <div className="file-top">
                      <span className="file-tag">{file.type}</span>
                      <span className={`status-dot ${file.status}`} />
                    </div>

                    <p className="file-name" title={file.name}>
                      {file.name}
                    </p>

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
          )}
        </section>
      </div>
    </div>
  );
}