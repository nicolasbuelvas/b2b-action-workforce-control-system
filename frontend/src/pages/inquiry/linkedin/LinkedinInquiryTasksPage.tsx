import React, { useState } from 'react';
import './LinkedinInquiryTasksPage.css';

const MOCK_TASKS = [
  { id: 'TSK-101', company: 'Cyberdyne Systems', contact: 'Miles Dyson', role: 'Director', status: 'In Progress', stepsCompleted: 1, totalSteps: 3, lastUpdate: '2h ago' },
  { id: 'TSK-102', company: 'Wayne Ent.', contact: 'Lucius Fox', role: 'CEO', status: 'Pending', stepsCompleted: 0, totalSteps: 3, lastUpdate: 'New' },
  { id: 'TSK-103', company: 'Stark Ind.', contact: 'Pepper Potts', role: 'COO', status: 'Waiting Cooldown', stepsCompleted: 1, totalSteps: 3, lastUpdate: '1d ago' },
];

export default function LinkedinInquiryTasksPage() {
  const [selectedTask, setSelectedTask] = useState(MOCK_TASKS[0]);

  return (
    <div className="inquiry-tasks-container">
      <header className="tasks-header">
        <div className="welcome-section">
          <h1>Active LinkedIn Inquiries</h1>
          <p>Execute multi-step outreach actions for qualified leads.</p>
        </div>
        <div className="tasks-meta">
          <div className="meta-badge">Tasks Active: 12</div>
          <div className="meta-badge cooldown">Total Earned: $145.50</div>
        </div>
      </header>

      <div className="tasks-layout">
        <aside className="tasks-sidebar">
          <div className="search-box">
            <input type="text" placeholder="Filter by company or contact..." />
          </div>
          <div className="tasks-list">
            {MOCK_TASKS.map(task => (
              <div 
                key={task.id} 
                className={`task-card ${selectedTask.id === task.id ? 'active' : ''}`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="task-info">
                  <h4>{task.company}</h4>
                  <p>{task.contact} • {task.role}</p>
                </div>
                <div className="task-progress-circle">
                  <span>{task.stepsCompleted}/{task.totalSteps}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="task-execution-panel">
          <div className="exec-header">
            <div className="exec-title">
              <h2>Action Workflow: {selectedTask.company}</h2>
              <span className={`status-pill-small ${selectedTask.status.toLowerCase().replace(' ', '-')}`}>
                {selectedTask.status}
              </span>
            </div>
          </div>

          <div className="workflow-stepper">
            {[1, 2, 3].map(num => (
              <div key={num} className={`step-block ${num <= selectedTask.stepsCompleted ? 'completed' : num === selectedTask.stepsCompleted + 1 ? 'current' : 'locked'}`}>
                <div className="step-number">{num}</div>
                <div className="step-content">
                  <div className="step-header">
                    <h4>{num === 1 ? 'Connection Request' : num === 2 ? 'Intro Message' : 'Catalogue Sharing'}</h4>
                    {num === 2 && <span className="cooldown-tag">24h Cooldown Active</span>}
                  </div>
                  {num === selectedTask.stepsCompleted + 1 && (
                    <div className="step-actions">
                      <p className="instruction">Log into LinkedIn, perform the action, and upload a full-page screenshot.</p>
                      <div className="upload-zone">
                        <span>Click to upload or drag screenshot</span>
                        <input type="file" />
                      </div>
                      <button className="btn-submit-step">Submit Action Proof</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <section className="target-guidelines">
            <h3>Worker Guidelines</h3>
            <ul>
              <li>Always include the LinkedIn profile URL in the screenshot.</li>
              <li>Wait for the cooldown timer to finish before sending the next message.</li>
              <li>Manual review by Auditor is required for payment release.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}