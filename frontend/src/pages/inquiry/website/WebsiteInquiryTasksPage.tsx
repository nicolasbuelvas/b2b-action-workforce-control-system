import React, { useState } from 'react';
import './WebsiteInquiryTasksPage.css';

const MOCK_INQUIRY_TASKS = [
  { id: 'INQ-W-881', domain: 'skyline-architects.com', action: 'Contact Form Submission', contactName: 'Sarah Miller', reward: '$2.00' },
  { id: 'INQ-W-882', domain: 'oceanic-logistics.io', action: 'Direct Email to CEO', contactName: 'Mark Chen', reward: '$3.50' },
  { id: 'INQ-W-883', domain: 'vertex-solar.net', action: 'Support Ticket Inquiry', contactName: 'Alex Reed', reward: '$1.80' },
];

export default function WebsiteInquiryTasksPage() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [step, setStep] = useState(1);

  return (
    <div className="inq-tasks-container">
      <header className="inq-tasks-header">
        <div className="title-group">
          <h1>Website Outreach Tasks</h1>
          <p>Execute contact actions and provide verifiable evidence for payment.</p>
        </div>
        <div className="task-counter">
          <span>Active Tasks: <strong>{MOCK_INQUIRY_TASKS.length}</strong></span>
        </div>
      </header>

      <div className="inq-layout">
        <aside className="tasks-sidebar">
          {MOCK_INQUIRY_TASKS.map(task => (
            <div 
              key={task.id} 
              className={`task-selector-card ${selectedTask?.id === task.id ? 'active' : ''}`}
              onClick={() => { setSelectedTask(task); setStep(1); }}
            >
              <div className="task-id-badge">{task.id}</div>
              <h4>{task.domain}</h4>
              <p>{task.action}</p>
              <div className="task-footer">
                <span className="reward">{task.reward}</span>
                <span className="status">Available</span>
              </div>
            </div>
          ))}
        </aside>

        <main className="task-execution-area">
          {selectedTask ? (
            <div className="execution-card">
              <div className="exec-steps">
                <div className={`step ${step >= 1 ? 'done' : ''}`}>1. Instructions</div>
                <div className={`step ${step >= 2 ? 'done' : ''}`}>2. Action</div>
                <div className={`step ${step >= 3 ? 'done' : ''}`}>3. Proof</div>
              </div>

              {step === 1 && (
                <div className="step-content">
                  <h2>Step 1: Instructions for {selectedTask.domain}</h2>
                  <div className="instruction-box">
                    <p><strong>Action Required:</strong> {selectedTask.action}</p>
                    <p><strong>Target Person:</strong> {selectedTask.contactName}</p>
                    <hr />
                    <p>Go to the website, find the contact section, and send the pre-approved inquiry message regarding their technical services. <strong>Do not use spammy language.</strong></p>
                  </div>
                  <button className="btn-next" onClick={() => setStep(2)}>I understand, start action</button>
                </div>
              )}

              {step === 2 && (
                <div className="step-content">
                  <h2>Step 2: Execution Terminal</h2>
                  <div className="terminal-box">
                    <p>Target URL: <code>https://{selectedTask.domain}/contact</code></p>
                    <div className="copy-block">
                      <label>Message to send:</label>
                      <textarea readOnly value={`Hello ${selectedTask.contactName}, I am interested in your infrastructure services...`} />
                      <button className="btn-copy">Copy Message</button>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="btn-back" onClick={() => setStep(1)}>Back</button>
                    <button className="btn-next" onClick={() => setStep(3)}>Action Completed</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-content">
                  <h2>Step 3: Upload Proof of Contact</h2>
                  <div className="upload-zone">
                    <div className="upload-icon">📸</div>
                    <p>Drag the screenshot of the "Message Sent" confirmation here.</p>
                    <input type="file" id="proof-upload" hidden />
                    <label htmlFor="proof-upload" className="btn-upload">Select Image</label>
                  </div>
                  <div className="action-buttons">
                    <button className="btn-back" onClick={() => setStep(2)}>Back</button>
                    <button className="btn-finish">Submit for Audit</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-task-selected">
              <div className="empty-illustration">📨</div>
              <h3>Select a task from the sidebar to begin</h3>
              <p>Each task must be completed within 30 minutes of selection.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}