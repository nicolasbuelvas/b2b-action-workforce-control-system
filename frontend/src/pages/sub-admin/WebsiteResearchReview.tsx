import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SubAdminReview.css';

interface ResearchTask {
  id: string;
  targetId: string;
  categoryId: string;
  status: string;
  createdAt: string;
  targetType?: string;
}

interface ResearchSubmission {
  id: string;
  contactName?: string;
  email?: string;
  phone?: string;
  country?: string;
  language?: string;
  techStack?: string;
  notes?: string;
  screenshotPath?: string;
}

export default function WebsiteResearchReview(): JSX.Element {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<ResearchTask | null>(null);
  const [submission, setSubmission] = useState<ResearchSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/subadmin/research/${taskId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load task');

        const data = await res.json();
        setTask(data.task);
        setSubmission(data.submission);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/subadmin/research/${taskId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to approve');

      navigate('/sub-admin/research/website');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/subadmin/research/${taskId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!res.ok) throw new Error('Failed to reject');

      navigate('/sub-admin/research/website');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRejecting(false);
      setShowRejectModal(false);
    }
  };

  if (loading) return <div className="review-page"><div className="loader">Loading...</div></div>;
  if (error) return <div className="review-page"><div className="error">{error}</div></div>;
  if (!task || !submission) return <div className="review-page"><div className="empty">No data found</div></div>;

  return (
    <div className="review-page">
      <header className="review-header">
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        <h2>Website Research Audit</h2>
        <div></div>
      </header>

      <div className="review-split">
        {/* LEFT: Researcher Data */}
        <aside className="review-side left-side">
          <h3>Researcher Submission</h3>
          
          <div className="field-group">
            <label>Contact Name</label>
            <p>{submission.contactName || '—'}</p>
          </div>

          <div className="field-group">
            <label>Email</label>
            <p>{submission.email || '—'}</p>
          </div>

          <div className="field-group">
            <label>Phone</label>
            <p>{submission.phone || '—'}</p>
          </div>

          <div className="field-group">
            <label>Country</label>
            <p>{submission.country || '—'}</p>
          </div>

          <div className="field-group">
            <label>Language</label>
            <p>{submission.language || '—'}</p>
          </div>

          <div className="field-group">
            <label>Tech Stack</label>
            <p className="tech-stack">{submission.techStack || '—'}</p>
          </div>

          <div className="field-group">
            <label>Notes</label>
            <p className="notes">{submission.notes || '—'}</p>
          </div>

          <div className="field-group">
            <label>Status</label>
            <span className={`badge status-${task.status.toLowerCase()}`}>
              {task.status}
            </span>
          </div>
        </aside>

        {/* RIGHT: Screenshot / Evidence */}
        <section className="review-side right-side">
          <h3>Evidence</h3>

          {submission.screenshotPath ? (
            <div className="screenshot-container">
              <img
                src={submission.screenshotPath}
                alt="Research evidence"
                className="screenshot-img"
              />
              <p className="caption">Screenshot / Evidence</p>
            </div>
          ) : (
            <div className="empty-evidence">No screenshot provided</div>
          )}
        </section>
      </div>

      {/* ACTIONS */}
      <footer className="review-footer">
        <div className="actions">
          <button
            onClick={handleApprove}
            disabled={approving}
            className="btn-approve"
          >
            {approving ? 'Approving...' : 'Approve'}
          </button>

          <button
            onClick={() => setShowRejectModal(true)}
            disabled={rejecting}
            className="btn-reject"
          >
            Reject
          </button>
        </div>
      </footer>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reject Submission</h3>
            <textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="reject-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="btn-confirm"
              >
                {rejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-cancel-modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
