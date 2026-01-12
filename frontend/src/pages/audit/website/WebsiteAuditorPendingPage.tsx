import React, { useState } from 'react';
import './WebsiteAuditorPendingPage.css';

const MOCK_WEBSITE_TASK = {
  id: "WBA-9921",
  worker: { name: "Elena Rodriguez", level: "Senior Auditor Candidate", id: "W-505" },
  target: {
    domain: "tech-solutions-global.com",
    industry: "SaaS / Cloud Services",
    requiredData: ["CEO Email", "HQ Phone", "Tech Stack"]
  },
  submission: {
    timestamp: "2026-01-11 16:45",
    foundData: {
      ceoEmail: "m.ross@tech-solutions-global.com",
      phone: "+1 (555) 902-1122",
      stack: "React, Node.js, AWS, Salesforce"
    },
    evidenceUrl: "https://via.placeholder.com/1200x2500/0f172a/ffffff?text=Full+Website+Capture+Analysis",
    hash: "SHA256:e3b0c44298fc1c149afbf4c8996fb"
  }
};

export default function WebsiteAuditorPendingPage() {
  const [validation, setValidation] = useState({ email: false, phone: false, stack: false });
  const [comment, setComment] = useState('');

  const isFullyValidated = validation.email && validation.phone && validation.stack;

  return (
    <div className="wb-pending-container">
      <header className="wb-pending-header">
        <div className="header-left">
          <span className="type-badge">Website Audit</span>
          <h1>Task: {MOCK_WEBSITE_TASK.id}</h1>
        </div>
        <div className="header-right">
          <div className="worker-info">
            <p>Submitted by <strong>{MOCK_WEBSITE_TASK.worker.name}</strong></p>
            <span>Worker ID: {MOCK_WEBSITE_TASK.worker.id}</span>
          </div>
        </div>
      </header>

      <div className="wb-audit-grid">
        <main className="wb-evidence-frame">
          <div className="browser-mockup">
            <div className="browser-bar">
              <div className="circles"><span></span><span></span><span></span></div>
              <div className="url-bar">https://{MOCK_WEBSITE_TASK.target.domain}</div>
            </div>
            <div className="evidence-scroll">
              <img src={MOCK_WEBSITE_TASK.submission.evidenceUrl} alt="Website capture" />
            </div>
          </div>
        </main>

        <aside className="wb-validation-panel">
          <section className="val-section info-card">
            <h3>Website Intelligence</h3>
            <div className="info-row">
              <label>Domain</label>
              <p>{MOCK_WEBSITE_TASK.target.domain}</p>
            </div>
            <div className="info-row">
              <label>Industry</label>
              <p>{MOCK_WEBSITE_TASK.target.industry}</p>
            </div>
          </section>

          <section className="val-section checklist-card">
            <h3>Verification Checklist</h3>
            <p className="instruction">Compare the submitted data with the screenshot on the left.</p>
            
            <div className="check-item">
              <input type="checkbox" id="c1" onChange={(e) => setValidation({...validation, email: e.target.checked})} />
              <label htmlFor="c1">
                <strong>CEO Email Found:</strong>
                <code>{MOCK_WEBSITE_TASK.submission.foundData.ceoEmail}</code>
              </label>
            </div>

            <div className="check-item">
              <input type="checkbox" id="c2" onChange={(e) => setValidation({...validation, phone: e.target.checked})} />
              <label htmlFor="c2">
                <strong>Phone Number:</strong>
                <code>{MOCK_WEBSITE_TASK.submission.foundData.phone}</code>
              </label>
            </div>

            <div className="check-item">
              <input type="checkbox" id="c3" onChange={(e) => setValidation({...validation, stack: e.target.checked})} />
              <label htmlFor="c3">
                <strong>Tech Stack:</strong>
                <code>{MOCK_WEBSITE_TASK.submission.foundData.stack}</code>
              </label>
            </div>
          </section>

          <section className="val-section decision-card">
            <label>Auditor Feedback</label>
            <textarea 
              placeholder="If rejecting, please specify why..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="btn-stack">
              <button className="btn-approve" disabled={!isFullyValidated}>
                Approve & Pay Worker
              </button>
              <button className="btn-reject" disabled={!comment}>
                Reject Submission
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}