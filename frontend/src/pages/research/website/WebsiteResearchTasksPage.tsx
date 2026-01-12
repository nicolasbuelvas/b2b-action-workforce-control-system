import React, { useState } from 'react';
import './WebsiteResearchTasksPage.css';

const MOCK_TARGETS = [
  { id: 'W-RES-01', domain: 'aerospace-dynamics.io', category: 'Manufacturing', priority: 'High', status: 'Unassigned' },
  { id: 'W-RES-02', domain: 'quantum-pay.net', category: 'Fintech', priority: 'Medium', status: 'Unassigned' },
  { id: 'W-RES-03', domain: 'green-energy-corp.com', category: 'Energy', priority: 'Low', status: 'Unassigned' }
];

export default function WebsiteResearchTasksPage() {
  const [activeTask, setActiveTask] = useState<any>(null);
  const [formData, setFormData] = useState({ email: '', phone: '', address: '', tech: '' });

  return (
    <div className="wb-res-tasks-container">
      <header className="wb-res-header">
        <div className="wb-res-title">
          <h1>Website Intelligence Terminal</h1>
          <p>Extracting deep-web corporate data and validating technology stacks.</p>
        </div>
        <div className="wb-res-stats">
          <div className="res-stat-item"><span>Points:</span> 1,450</div>
          <div className="res-stat-item"><span>Rank:</span> Gold</div>
        </div>
      </header>

      <div className="wb-res-main">
        <aside className="wb-res-list">
          <div className="list-search">
            <input type="text" placeholder="Filter domains..." />
          </div>
          {MOCK_TARGETS.map(target => (
            <div 
              key={target.id} 
              className={`target-card ${activeTask?.id === target.id ? 'active' : ''}`}
              onClick={() => setActiveTask(target)}
            >
              <div className={`priority-line ${target.priority.toLowerCase()}`}></div>
              <div className="target-card-info">
                <h4>{target.domain}</h4>
                <div className="target-card-meta">
                  <span>{target.category}</span>
                  <span className="dot">•</span>
                  <span>{target.priority} Priority</span>
                </div>
              </div>
            </div>
          ))}
        </aside>

        <main className="wb-res-editor">
          {activeTask ? (
            <div className="editor-view">
              <div className="editor-header">
                <h2>Inspecting: <span className="domain-txt">{activeTask.domain}</span></h2>
                <button className="btn-open-site" onClick={() => window.open(`https://${activeTask.domain}`, '_blank')}>
                  Open Target Website ↗
                </button>
              </div>

              <div className="editor-grid">
                <section className="form-section">
                  <h3>Required Data Extraction</h3>
                  <div className="form-group">
                    <label>Main Corporate Email</label>
                    <input type="email" placeholder="e.g. info@company.com" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>HQ Phone Number</label>
                    <input type="text" placeholder="+1..." 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Identified Tech Stack</label>
                    <textarea placeholder="List technologies found (React, Cloudflare, etc.)"
                      value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} />
                  </div>
                </section>

                <section className="submission-section">
                  <div className="evidence-upload-area">
                    <h3>Proof of Existence</h3>
                    <p>Upload a full-page PDF/Image of the "About" or "Contact" page.</p>
                    <div className="drop-zone">
                      <div className="drop-icon">📁</div>
                      <p>Drag and drop capture here or <span>browse</span></p>
                    </div>
                  </div>

                  <div className="submission-notes">
                    <h3>Internal Notes</h3>
                    <textarea placeholder="Any difficulties or special findings?"></textarea>
                  </div>

                  <div className="action-row">
                    <button className="btn-save-draft">Save Draft</button>
                    <button className="btn-submit-task">Submit for Audit</button>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🌐</div>
              <h3>Select a target domain to start the intelligence process</h3>
              <p>Your performance depends on the accuracy of the emails and technical data extracted.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}