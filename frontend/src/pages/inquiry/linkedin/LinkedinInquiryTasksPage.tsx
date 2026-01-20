import React, { useState } from 'react';
import './LinkedinInquiryTasksPage.css';

interface InquiryTask {
  id: string;
  company: string;
  contact: string;
  role: string;
  status: string;
  stepsCompleted: number;
  totalSteps: number;
  lastUpdate?: string;
}

export default function LinkedinInquiryTasksPage() {
  const [tasks] = useState<InquiryTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<InquiryTask | null>(null);
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter(t =>
    `${t.company} ${t.contact}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inquiry-tasks-container">
      <header className="tasks-header">
        <div>
          <h1>Active LinkedIn Inquiries</h1>
          <p>Execute multi-step outreach actions for qualified leads.</p>
        </div>
        <div className="tasks-meta">
          <div className="meta-badge">Active Tasks</div>
          <div className="meta-badge cooldown">Earnings Pending</div>
        </div>
      </header>

      <div className="tasks-layout">
        {/* SIDEBAR */}
        <aside className="tasks-sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search company or contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="tasks-list">
            {filteredTasks.length === 0 && (
              <div className="empty-state">
                No LinkedIn inquiries assigned yet.
              </div>
            )}

            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`task-card ${
                  selectedTask?.id === task.id ? 'active' : ''
                }`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="task-info">
                  <h4>{task.company}</h4>
                  <p>
                    {task.contact} • {task.role}
                  </p>
                </div>
                <div className="task-progress-circle">
                  {task.stepsCompleted}/{task.totalSteps}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="task-execution-panel">
          {!selectedTask ? (
            <div className="empty-main">
              Select a task to begin the workflow.
            </div>
          ) : (
            <>
              <div className="exec-header">
                <div className="exec-title">
                  <h2>{selectedTask.company}</h2>
                  <span className={`status-pill ${selectedTask.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              <div className="workflow-stepper">
                {Array.from({ length: selectedTask.totalSteps }).map((_, i) => {
                  const stepNumber = i + 1;
                  const isCompleted = stepNumber <= selectedTask.stepsCompleted;
                  const isCurrent = stepNumber === selectedTask.stepsCompleted + 1;

                  return (
                    <div
                      key={stepNumber}
                      className={`step-block ${
                        isCompleted
                          ? 'completed'
                          : isCurrent
                          ? 'current'
                          : 'locked'
                      }`}
                    >
                      <div className="step-number">{stepNumber}</div>
                      <div className="step-content">
                        <div className="step-header">
                          <h4>
                            {stepNumber === 1 && 'Connection Request'}
                            {stepNumber === 2 && 'Intro Message'}
                            {stepNumber === 3 && 'Asset Sharing'}
                          </h4>
                          {stepNumber === 2 && (
                            <span className="cooldown-tag">Cooldown Required</span>
                          )}
                        </div>

                        {isCurrent && (
                          <>
                            <p className="instruction">
                              Perform the action on LinkedIn and upload a full-page screenshot.
                            </p>
                            <div className="upload-zone">
                              <input type="file" />
                            </div>
                            <button className="btn-submit-step">
                              Submit Proof
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <section className="target-guidelines">
                <h3>Worker Guidelines</h3>
                <ul>
                  <li>LinkedIn URL must be visible.</li>
                  <li>No cropped or edited screenshots.</li>
                  <li>Cooldown periods must be respected.</li>
                  <li>Manual audit required for payout.</li>
                </ul>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}