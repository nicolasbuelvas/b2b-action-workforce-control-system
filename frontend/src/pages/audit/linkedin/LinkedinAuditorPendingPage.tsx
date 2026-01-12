import React, { useState, useEffect } from 'react';
import './LinkedinAuditorPendingPage.css';

interface ActionStep {
  id: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  screenshotUrl: string;
  hash: string;
  notes: string;
}

const MOCK_SUBMISSION = {
  id: "SUB-8829",
  worker: { id: "W-402", name: "Chen Wei", rank: "Top 5" },
  target: { 
    name: "Jonathan Harker", 
    role: "Head of Procurement", 
    company: "Transylvania Logistics",
    linkedinUrl: "https://linkedin.com/in/jharker-proc"
  },
  steps: [
    { id: 1, type: 'Connection Request', status: 'approved', timestamp: '2026-01-11 09:00', screenshotUrl: 'https://via.placeholder.com/1200x800/1e293b/ffffff?text=LinkedIn+Connection+Proof', hash: 'H-992188X', notes: 'Visible connection note included.' },
    { id: 2, type: 'Direct Message A', status: 'pending', timestamp: '2026-01-11 10:15', screenshotUrl: 'https://via.placeholder.com/1200x800/334155/ffffff?text=Message+A+Proof', hash: 'H-773211Y', notes: 'First outreach message.' },
    { id: 3, type: 'Direct Message B (Follow-up)', status: 'pending', timestamp: '2026-01-11 14:20', screenshotUrl: 'https://via.placeholder.com/1200x800/475569/ffffff?text=Message+B+Proof', hash: 'H-441092Z', notes: 'Catalogue shared.' }
  ] as ActionStep[]
};

export default function LinkedinAuditorPendingPage() {
  const [currentStepIdx, setCurrentStepIdx] = useState(1); // Muestra el paso 2 por defecto (index 1)
  const [rejectionReason, setRejectionReason] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  const activeStep = MOCK_SUBMISSION.steps[currentStepIdx];

  const handleApprove = () => {
    console.log(`Step ${activeStep.id} approved`);
    if (currentStepIdx < MOCK_SUBMISSION.steps.length - 1) setCurrentStepIdx(prev => prev + 1);
  };

  return (
    <div className="li-audit-container">
      <header className="li-audit-header">
        <div className="li-header-main">
          <h1>Pending Review: <span className="text-id">{MOCK_SUBMISSION.id}</span></h1>
          <div className="worker-badge">
            <span className="worker-icon">👤</span>
            <div>
              <p className="w-name">{MOCK_SUBMISSION.worker.name}</p>
              <p className="w-rank">{MOCK_SUBMISSION.worker.rank}</p>
            </div>
          </div>
        </div>
        <div className="audit-timer">Review Time: 02:45</div>
      </header>

      <div className="li-audit-content">
        <aside className="li-sidebar-data">
          <section className="li-data-card target-info">
            <h3>Target Profile Details</h3>
            <div className="data-grid">
              <div className="data-item"><label>Full Name</label><span>{MOCK_SUBMISSION.target.name}</span></div>
              <div className="data-item"><label>Role</label><span>{MOCK_SUBMISSION.target.role}</span></div>
              <div className="data-item"><label>Company</label><span>{MOCK_SUBMISSION.target.company}</span></div>
              <a href={MOCK_SUBMISSION.target.linkedinUrl} target="_blank" className="li-external-link">Verify Profile on LinkedIn</a>
            </div>
          </section>

          <section className="li-data-card timeline-info">
            <h3>Multi-Action Progress</h3>
            <div className="li-timeline">
              {MOCK_SUBMISSION.steps.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={`timeline-item ${idx === currentStepIdx ? 'active' : ''} ${step.status}`}
                  onClick={() => setCurrentStepIdx(idx)}
                >
                  <div className="t-status-icon">{step.status === 'approved' ? '✓' : idx + 1}</div>
                  <div className="t-text">
                    <p className="t-type">{step.type}</p>
                    <p className="t-time">{step.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="li-data-card step-details">
            <h3>Step {activeStep.id} Verification</h3>
            <div className="verification-details">
              <div className="v-row"><span>Action Type:</span><strong>{activeStep.type}</strong></div>
              <div className="v-row"><span>Image Hash:</span><code className="v-hash">{activeStep.hash}</code></div>
              <div className="v-row"><span>Status:</span><span className={`v-badge ${activeStep.status}`}>{activeStep.status.toUpperCase()}</span></div>
              <p className="v-notes"><strong>Note:</strong> {activeStep.notes}</p>
            </div>
          </section>

          <section className="li-audit-decision">
            <div className="decision-actions">
              <button className="btn-approve" onClick={handleApprove}>Approve Step</button>
              <button className="btn-fraud">Report Fraud</button>
            </div>
            <div className="rejection-box">
              <textarea 
                placeholder="Reason for rejection (mandatory if rejecting)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <button className="btn-reject" disabled={!rejectionReason}>Reject Item</button>
            </div>
          </section>
        </aside>

        <main className="li-evidence-view">
          <div className="evidence-toolbar">
            <button onClick={() => setIsZoomed(!isZoomed)}>{isZoomed ? 'Actual Size' : 'Zoom In'}</button>
            <button>Download Evidence</button>
            <div className="evidence-info">Step {activeStep.id} Screenshot - {activeStep.hash}</div>
          </div>
          <div className={`screenshot-container ${isZoomed ? 'zoomed' : ''}`}>
            <img src={activeStep.screenshotUrl} alt="Evidence proof" />
          </div>
        </main>
      </div>
    </div>
  );
}