import React, { useEffect, useState } from 'react';
import './LinkedinResearchAuditorPendingPage.css';
import { useAuth } from '../../../hooks/useAuth';

interface ResearchSubmission {
  id: string;
  researchTaskId: string;
  targetId: string;
  categoryId: string;
  categoryName: string;
  researcherName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionData: {
    contactName?: string;
    contactLinkedinUrl?: string;
    country?: string;
    language?: string;
    notes?: string;
  };
}

export default function LinkedinResearchAuditorPendingPage() {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<ResearchSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Backend will inject submission data
    setLoading(false);
  }, []);

  const handleApprove = async () => {
    if (!submission) return;
    setSubmitting(true);
    // Backend will handle approval
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!submission || !feedback.trim()) {
      alert('Feedback is required for rejection');
      return;
    }
    setSubmitting(true);
    // Backend will handle rejection with feedback
    setSubmitting(false);
  };

  if (loading) {
    return <div className="wb-state-screen"><p>Loading submission…</p></div>;
  }

  if (error || !submission) {
    return <div className="wb-state-screen error"><p>Unable to load submission.</p></div>;
  }

  return (
    <div className="wb-research-pending-container">
      <header className="wb-pending-header">
        <div>
          <span className="type-badge">LinkedIn Research</span>
          <h1>Review Submission</h1>
        </div>
        <div className="researcher-info">
          <p>Submitted by <strong>{submission.researcherName}</strong></p>
          <span>{submission.categoryName}</span>
        </div>
      </header>

      <div className="review-layout">
        <main className="review-content">
          <section className="submission-section">
            <h2>Target Information</h2>
            <div className="info-group">
              <label>LinkedIn Search/Profile</label>
              <div className="info-display">
                <a href={submission.targetId.startsWith('http') ? submission.targetId : `https://${submission.targetId}`} target="_blank" rel="noopener noreferrer">
                  {submission.targetId}
                </a>
              </div>
            </div>
          </section>

          <section className="submission-section">
            <h2>Contact Details</h2>
            {submission.submissionData.contactName && (
              <div className="info-group">
                <label>Contact Name</label>
                <div className="info-display">{submission.submissionData.contactName}</div>
              </div>
            )}
            {submission.submissionData.contactLinkedinUrl && (
              <div className="info-group">
                <label>LinkedIn URL</label>
                <div className="info-display">
                  <a href={submission.submissionData.contactLinkedinUrl} target="_blank" rel="noopener noreferrer">
                    {submission.submissionData.contactLinkedinUrl}
                  </a>
                </div>
              </div>
            )}
            {submission.submissionData.country && (
              <div className="info-group">
                <label>Country</label>
                <div className="info-display">{submission.submissionData.country}</div>
              </div>
            )}
            {submission.submissionData.language && (
              <div className="info-group">
                <label>Language</label>
                <div className="info-display">{submission.submissionData.language}</div>
              </div>
            )}
            {submission.submissionData.notes && (
              <div className="info-group">
                <label>Notes</label>
                <div className="info-display">{submission.submissionData.notes}</div>
              </div>
            )}
          </section>

          <section className="submission-section">
            <h2>Decision</h2>
            <div className="decision-group">
              <label>Feedback (required for rejection)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback if rejecting this submission..."
                rows={4}
              />
            </div>

            <div className="action-buttons">
              <button
                className="btn-approve"
                onClick={handleApprove}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : '✓ Approve'}
              </button>
              <button
                className="btn-reject"
                onClick={handleReject}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : '✕ Reject'}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
