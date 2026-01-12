import React, { useState } from 'react';
import './WebsiteEvidenceUploadsPage.css';

export default function WebsiteEvidenceUploadsPage() {
  const [uploads, setUploads] = useState([
    { id: 1, file: 'screenshot_homepage.png', size: '2.4 MB', status: 'ready', type: 'Main' },
    { id: 2, file: 'contact_page_capture.png', size: '1.8 MB', status: 'uploading', progress: 65, type: 'Evidence' },
  ]);

  return (
    <div className="uploads-container">
      <header className="uploads-header">
        <h1>Evidence Storage Terminal</h1>
        <p>Manage high-resolution captures for Website Inquiry tasks.</p>
      </header>

      <div className="uploads-layout">
        <main className="uploads-main">
          <div className="bulk-upload-card">
            <div className="upload-box">
              <span className="icon">📂</span>
              <h3>Batch Upload Evidence</h3>
              <p>Drag multiple PNG/JPG captures or click to select files</p>
              <button className="btn-browse">Select Files</button>
            </div>
          </div>

          <div className="active-uploads">
            <h3>Current Queue ({uploads.length})</h3>
            <div className="upload-list">
              {uploads.map(up => (
                <div key={up.id} className="upload-item">
                  <div className="file-icon">🖼️</div>
                  <div className="file-info">
                    <p className="f-name">{up.file} <span>({up.size})</span></p>
                    {up.status === 'uploading' ? (
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${up.progress}%` }}></div>
                      </div>
                    ) : (
                      <span className="status-done">Ready to Link</span>
                    )}
                  </div>
                  <div className="file-type-select">
                    <select>
                      <option>Main Screenshot</option>
                      <option>Tech Stack Proof</option>
                      <option>Contact Page</option>
                    </select>
                  </div>
                  <button className="btn-remove">✕</button>
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="storage-sidebar">
          <div className="storage-card">
            <h3>Storage Used</h3>
            <div className="storage-gauge">
              <div className="gauge-fill" style={{ width: '45%' }}></div>
            </div>
            <p><strong>4.5 GB</strong> of 10 GB (45%)</p>
          </div>

          <div className="audit-guidelines">
            <h3>Capture Standards</h3>
            <ul>
              <li>Resolution: 1920px minimum width.</li>
              <li>Must show the full URL in the browser bar.</li>
              <li>Visible system clock in the bottom right.</li>
              <li>No editing or blurring allowed.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}