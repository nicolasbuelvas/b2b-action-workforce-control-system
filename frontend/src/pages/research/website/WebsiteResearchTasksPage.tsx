import React, { useState } from 'react';
import './WebsiteResearchTasksPage.css';

type WebsiteResearchTask = {
  id: string;
  domain: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unassigned' | 'in_progress' | 'submitted';
};

type ResearchFormData = {
  email: string;
  phone: string;
  techStack: string;
  notes: string;
};

export default function WebsiteResearchTasksPage() {
  /** 
   * IMPORTANT:
   * This array MUST be populated by backend integration.
   * Do NOT add mock data here.
   */
  const [tasks, setTasks] = useState<WebsiteResearchTask[]>([]);
  const [activeTask, setActiveTask] = useState<WebsiteResearchTask | null>(null);

  const [formData, setFormData] = useState<ResearchFormData>({
    email: '',
    phone: '',
    techStack: '',
    notes: ''
  });

  return (
    <div className="wb-res-tasks-container">
      {/* HEADER */}
      <header className="wb-res-header">
        <div className="wb-res-title">
          <h1>Website Intelligence Terminal</h1>
          <p>Analyze assigned domains and extract validated corporate intelligence.</p>
        </div>

        <div className="wb-res-stats">
          <div className="res-stat-item">Active Tasks</div>
          <div className="res-stat-item">Daily Progress</div>
        </div>
      </header>

      {/* MAIN */}
      <div className="wb-res-main">
        {/* TASK LIST */}
        <aside className="wb-res-list">
          <div className="list-search">
            <input type="text" placeholder="Search domain..." />
          </div>

          {tasks.length === 0 && (
            <div className="empty-list">
              <p>No tasks assigned yet.</p>
            </div>
          )}

          {tasks.map(task => (
            <div
              key={task.id}
              className={`target-card ${activeTask?.id === task.id ? 'active' : ''}`}
              onClick={() => setActiveTask(task)}
            >
              <div className={`priority-line ${task.priority}`} />
              <div className="target-card-info">
                <h4>{task.domain}</h4>
                <div className="target-card-meta">
                  <span>{task.category}</span>
                  <span>•</span>
                  <span>{task.priority.toUpperCase()}</span>
                  <span>•</span>
                  <span>{task.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </aside>

        {/* EDITOR */}
        <main className="wb-res-editor">
          {!activeTask ? (
            <div className="empty-state">
              <div className="empty-icon">🌐</div>
              <h3>Select a domain to start research</h3>
              <p>Choose a task from the left panel to begin.</p>
            </div>
          ) : (
            <div className="editor-view">
              <div className="editor-header">
                <h2>
                  Inspecting:{' '}
                  <span className="domain-txt">{activeTask.domain}</span>
                </h2>
                <button
                  className="btn-open-site"
                  onClick={() =>
                    window.open(`https://${activeTask.domain}`, '_blank')
                  }
                >
                  Open Website ↗
                </button>
              </div>

              <div className="editor-grid">
                {/* DATA EXTRACTION */}
                <section className="form-section">
                  <h3>Required Data Extraction</h3>

                  <div className="form-group">
                    <label>Corporate Email</label>
                    <input
                      type="email"
                      placeholder="info@company.com"
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 555..."
                      value={formData.phone}
                      onChange={e =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Identified Tech Stack</label>
                    <textarea
                      placeholder="React, Cloudflare, AWS, etc."
                      value={formData.techStack}
                      onChange={e =>
                        setFormData({ ...formData, techStack: e.target.value })
                      }
                    />
                  </div>
                </section>

                {/* SUBMISSION */}
                <section className="submission-section">
                  <div className="evidence-upload-area">
                    <h3>Proof of Existence</h3>
                    <p>Upload evidence from About / Contact pages.</p>

                    <div className="drop-zone">
                      <div className="drop-icon">📁</div>
                      <p>Drag & drop files or click to upload</p>
                    </div>
                  </div>

                  <div className="submission-notes">
                    <h3>Internal Notes</h3>
                    <textarea
                      placeholder="Optional notes for the auditor..."
                      value={formData.notes}
                      onChange={e =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>

                  <div className="action-row">
                    <button className="btn-save-draft">Save Draft</button>
                    <button className="btn-submit-task">
                      Submit for Audit
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}