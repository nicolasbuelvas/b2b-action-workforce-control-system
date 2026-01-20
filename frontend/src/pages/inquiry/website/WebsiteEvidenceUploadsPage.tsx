import React, { useState } from 'react';
import './WebsiteEvidenceUploadsPage.css';

type UploadStatus = 'uploading' | 'ready';

interface EvidenceUpload {
  id: string;
  filename: string;
  size: string;
  status: UploadStatus;
  progress?: number;
  evidenceType: string;
}

export default function WebsiteEvidenceUploadsPage() {
  const [uploads, setUploads] = useState<EvidenceUpload[]>([]);
  const [storageUsedPercent, setStorageUsedPercent] = useState<number>(0);
  const [storageUsedLabel, setStorageUsedLabel] = useState<string>('0 GB');
  const [storageTotalLabel, setStorageTotalLabel] = useState<string>('0 GB');

  return (
    <div className="uploads-container">
      <header className="uploads-header">
        <h1>Evidence Storage Terminal</h1>
        <p>Manage high-resolution captures for Website Inquiry tasks.</p>
      </header>

      <div className="uploads-layout">
        {/* MAIN */}
        <main className="uploads-main">
          <div className="bulk-upload-card">
            <div className="upload-box">
              <span className="icon">📂</span>
              <h3>Batch Upload Evidence</h3>
              <p>Drag PNG/JPG screenshots or click to select files</p>
              <button className="btn-browse">Select Files</button>
            </div>
          </div>

          <div className="active-uploads">
            <h3>Current Queue ({uploads.length})</h3>

            {uploads.length === 0 && (
              <div className="empty-state">
                No evidence files uploaded yet
              </div>
            )}

            <div className="upload-list">
              {uploads.map(upload => (
                <div key={upload.id} className="upload-item">
                  <div className="file-icon">🖼️</div>

                  <div className="file-info">
                    <p className="f-name">
                      {upload.filename} <span>({upload.size})</span>
                    </p>

                    {upload.status === 'uploading' && (
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${upload.progress ?? 0}%` }}
                        />
                      </div>
                    )}

                    {upload.status === 'ready' && (
                      <span className="status-done">Ready to Link</span>
                    )}
                  </div>

                  <div className="file-type-select">
                    <select value={upload.evidenceType} readOnly>
                      <option>Main Screenshot</option>
                      <option>Tech Stack Proof</option>
                      <option>Contact Page</option>
                      <option>Other Evidence</option>
                    </select>
                  </div>

                  <button className="btn-remove" aria-label="Remove upload">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="storage-sidebar">
          <div className="storage-card">
            <h3>Storage Used</h3>

            <div className="storage-gauge">
              <div
                className="gauge-fill"
                style={{ width: `${storageUsedPercent}%` }}
              />
            </div>

            <p>
              <strong>{storageUsedLabel}</strong> of {storageTotalLabel} (
              {storageUsedPercent}%)
            </p>
          </div>

          <div className="audit-guidelines">
            <h3>Capture Standards</h3>
            <ul>
              <li>Minimum width: 1920px.</li>
              <li>Full URL visible in browser address bar.</li>
              <li>System clock visible on screen.</li>
              <li>No cropping, masking or blurring.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}