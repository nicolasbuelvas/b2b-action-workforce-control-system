import React, { useMemo, useState, useEffect } from 'react';
import './WebsiteInquiryTasksPage.css';
import { inquiryApi, InquiryTask } from '../../../api/inquiry.api';

export interface WebsiteInquiryTask extends InquiryTask {
  domain?: string;
  action?: string;
  contactName?: string;
  reward?: string;
  contactUrl?: string;
  prefilledMessage?: string;
}

interface Props {
  tasks?: WebsiteInquiryTask[]; // ⬅️ IMPORTANTE: ahora es opcional
  onSubmitProof?: (taskId: string, file: File) => void;
}

export default function WebsiteInquiryTasksPage({
  tasks: initialTasks = [], // ⬅️ DEFAULT SEGURO
  onSubmitProof,
}: Props) {
  const [tasks, setTasks] = useState<WebsiteInquiryTask[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] =
    useState<WebsiteInquiryTask | null>(null);
  const [step, setStep] = useState<number>(1);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Load tasks from API on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await inquiryApi.getWebsiteTasks();
        setTasks(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const hasTasks = useMemo(() => tasks.length > 0, [tasks]);

  return (
    <div className="inq-tasks-container">
      <header className="inq-tasks-header">
        <div className="title-group">
          <h1>Website Outreach Tasks</h1>
          <p>Execute contact actions and submit verifiable proof for review.</p>
        </div>

        <div className="task-counter">
          <span>
            Active Tasks: <strong>{tasks.length}</strong>
          </span>
        </div>
      </header>

      <div className="inq-layout">
        <aside className="tasks-sidebar">
          {!hasTasks && (
            <div className="empty-tasks">
              <p>No tasks available at the moment.</p>
            </div>
          )}

          {tasks.map(task => (
            <div
              key={task.id}
              className={`task-selector-card ${
                selectedTask?.id === task.id ? 'active' : ''
              }`}
              onClick={() => {
                setSelectedTask(task);
                setStep(1);
                setProofFile(null);
              }}
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
          {!selectedTask ? (
            <div className="no-task-selected">
              <div className="empty-illustration">📨</div>
              <h3>Select a task to begin</h3>
              <p>Each task must be completed accurately to receive payment.</p>
            </div>
          ) : (
            <div className="execution-card">
              <div className="exec-steps">
                <div className={`step ${step >= 1 ? 'done' : ''}`}>
                  1. Instructions
                </div>
                <div className={`step ${step >= 2 ? 'done' : ''}`}>
                  2. Action
                </div>
                <div className={`step ${step >= 3 ? 'done' : ''}`}>
                  3. Proof
                </div>
              </div>

              {step === 1 && (
                <div className="step-content">
                  <h2>Instructions</h2>
                  <div className="instruction-box">
                    <p>
                      <strong>Domain:</strong> {selectedTask.domain}
                    </p>
                    <p>
                      <strong>Action:</strong> {selectedTask.action}
                    </p>
                    <p>
                      <strong>Contact:</strong> {selectedTask.contactName}
                    </p>
                    <hr />
                    <p>
                      Visit the website and complete the required contact
                      action. Do not use automation or spam tools.
                    </p>
                  </div>

                  <button className="btn-next" onClick={() => setStep(2)}>
                    Start Action
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="step-content">
                  <h2>Execution</h2>

                  <div className="terminal-box">
                    <p>
                      Target URL:{' '}
                      <code>
                        {selectedTask.contactUrl ??
                          `https://${selectedTask.domain}`}
                      </code>
                    </p>

                    {selectedTask.prefilledMessage && (
                      <div className="copy-block">
                        <label>Message to send:</label>
                        <textarea
                          readOnly
                          value={selectedTask.prefilledMessage}
                        />
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-back"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      className="btn-next"
                      onClick={() => setStep(3)}
                    >
                      Action Completed
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-content">
                  <h2>Submit Proof</h2>

                  <div className="upload-zone">
                    <div className="upload-icon">📸</div>
                    <p>
                      Upload a screenshot showing confirmation of contact.
                    </p>

                    <input
                      type="file"
                      id="proof-upload"
                      accept="image/*"
                      hidden
                      onChange={e =>
                        setProofFile(e.target.files?.[0] ?? null)
                      }
                    />

                    <label
                      htmlFor="proof-upload"
                      className="btn-upload"
                    >
                      Select Image
                    </label>

                    {proofFile && (
                      <p className="file-name">{proofFile.name}</p>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-back"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </button>

                    <button
                      className="btn-finish"
                      disabled={!proofFile}
                      onClick={() =>
                        proofFile &&
                        onSubmitProof?.(
                          selectedTask.id,
                          proofFile
                        )
                      }
                    >
                      Submit for Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}