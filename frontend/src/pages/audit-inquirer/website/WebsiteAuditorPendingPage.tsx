import React, { useEffect, useState } from "react";
import "./WebsiteAuditorPendingPage.css";

/* =====================
   Data Contracts
===================== */

interface WorkerInfo {
  id: string;
  name: string;
  level: string;
}

interface WebsiteTarget {
  domain: string;
  industry: string;
}

interface SubmissionData {
  ceoEmail: string;
  phone: string;
  techStack: string;
}

interface WebsiteAuditTask {
  taskId: string;
  worker: WorkerInfo;
  target: WebsiteTarget;
  submittedAt: string;
  evidenceImageUrl: string;
  submission: SubmissionData;
}

/* =====================
   Component
===================== */

export default function WebsiteAuditorPendingPage() {
  const [task, setTask] = useState<WebsiteAuditTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [validation, setValidation] = useState({
    email: false,
    phone: false,
    techStack: false,
  });

  const [feedback, setFeedback] = useState("");

  const isApproved =
    validation.email && validation.phone && validation.techStack;

  /* =====================
     Data Load Placeholder
     (Backend will inject)
  ===================== */
  useEffect(() => {
    /*
      EXPECTED:
      Backend injects task data here.
      This component assumes a FULLY POPULATED task.
    */
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="wb-state-screen">
        <p>Loading audit task…</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="wb-state-screen error">
        <p>Unable to load audit task.</p>
      </div>
    );
  }

  return (
    <div className="wb-pending-container">
      {/* =====================
          Header
      ===================== */}
      <header className="wb-pending-header">
        <div>
          <span className="type-badge">Website Audit</span>
          <h1>Task {task.taskId}</h1>
        </div>

        <div className="worker-info">
          <p>
            Submitted by <strong>{task.worker.name}</strong>
          </p>
          <span>
            {task.worker.level} • ID {task.worker.id}
          </span>
        </div>
      </header>

      {/* =====================
          Main Grid
      ===================== */}
      <div className="wb-audit-grid">
        {/* Evidence */}
        <main className="wb-evidence-frame">
          <div className="browser-mockup">
            <div className="browser-bar">
              <div className="circles">
                <span />
                <span />
                <span />
              </div>
              <div className="url-bar">
                https://{task.target.domain}
              </div>
            </div>

            <div className="evidence-scroll">
              <img
                src={task.evidenceImageUrl}
                alt="Website evidence"
              />
            </div>
          </div>
        </main>

        {/* Validation Panel */}
        <aside className="wb-validation-panel">
          {/* Target Info */}
          <section className="val-section">
            <h3>Target Information</h3>

            <div className="info-row">
              <label>Domain</label>
              <p>{task.target.domain}</p>
            </div>

            <div className="info-row">
              <label>Industry</label>
              <p>{task.target.industry}</p>
            </div>
          </section>

          {/* Checklist */}
          <section className="val-section">
            <h3>Verification Checklist</h3>
            <p className="instruction">
              Validate each item against the captured website.
            </p>

            <ChecklistItem
              label="CEO Email"
              value={task.submission.ceoEmail}
              checked={validation.email}
              onChange={(v) =>
                setValidation({ ...validation, email: v })
              }
            />

            <ChecklistItem
              label="Phone Number"
              value={task.submission.phone}
              checked={validation.phone}
              onChange={(v) =>
                setValidation({ ...validation, phone: v })
              }
            />

            <ChecklistItem
              label="Tech Stack"
              value={task.submission.techStack}
              checked={validation.techStack}
              onChange={(v) =>
                setValidation({ ...validation, techStack: v })
              }
            />
          </section>

          {/* Decision */}
          <section className="val-section decision-card">
            <label>Auditor Feedback</label>
            <textarea
              placeholder="Required if rejecting"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <div className="btn-stack">
              <button
                className="btn-approve"
                disabled={!isApproved}
              >
                Approve & Pay Worker
              </button>

              <button
                className="btn-reject"
                disabled={!feedback}
              >
                Reject Submission
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* =====================
   Subcomponents
===================== */

function ChecklistItem({
  label,
  value,
  checked,
  onChange,
}: {
  label: string;
  value: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={`check-item ${checked ? "checked" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label>
        <strong>{label}</strong>
        <code>{value}</code>
      </label>
    </div>
  );
}