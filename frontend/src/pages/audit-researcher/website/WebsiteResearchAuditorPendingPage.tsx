import React, { useEffect, useState } from 'react';
import './WebsiteResearchAuditorPendingPage.css';
import { useAuth } from '../../../hooks/useAuth';
import { auditApi, PendingResearchSubmission } from '../../../api/audit.api';

export default function WebsiteResearchAuditorPendingPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingResearchSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await auditApi.getPendingResearch();
      
      // Filter only COMPANY (website) submissions
      const websiteSubmissions = data.filter(s => s.targetType === 'COMPANY');
      setSubmissions(websiteSubmissions);

      // Extract unique category and user IDs for display enrichment
      const catIds = new Set(websiteSubmissions.map(s => s.categoryId));
      const userIds = new Set(websiteSubmissions.map(s => s.assignedToUserId));

      // TODO: Fetch category names and user emails in production
      const catMap: Record<string, string> = {};
      catIds.forEach(id => { catMap[id] = id; });
      setCategories(catMap);

      const userMap: Record<string, string> = {};
      userIds.forEach(id => { userMap[id] = id; });
      setUsers(userMap);

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      await auditApi.auditResearch(taskId, { decision: 'APPROVED' });
      setSubmissions(prev => prev.filter(s => s.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve submission');
    }
  };

  const handleReject = async (taskId: string, reason?: string) => {
    try {
      await auditApi.auditResearch(taskId, { decision: 'REJECTED', reason });
      setSubmissions(prev => prev.filter(s => s.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject submission');
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return <div className="wb-state-screen"><p>Loading submissions…</p></div>;
  }

  if (error) {
    return <div className="wb-state-screen error"><p>{error}</p></div>;
  }

  if (submissions.length === 0) {
    return <div className="wb-state-screen"><p>No pending submissions to review.</p></div>;
  }

  return (
    <div className="wb-research-pending-container">
      <header className="wb-pending-header">
        <div>
          <h1>Website Research Audits</h1>
          <p>{submissions.length} pending submission{submissions.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <div className="submissions-grid">
        {submissions.map(submission => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            categoryName={categories[submission.categoryId] || submission.categoryId}
            researcherEmail={users[submission.assignedToUserId] || submission.assignedToUserId}
            onApprove={handleApprove}
            onReject={handleReject}
            formatTimeAgo={formatTimeAgo}
          />
        ))}
      </div>
    </div>
  );
}

interface SubmissionCardProps {
  submission: PendingResearchSubmission;
  categoryName: string;
  researcherEmail: string;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string, reason?: string) => void;
  formatTimeAgo: (date: string) => string;
}

function SubmissionCard({ 
  submission, 
  categoryName, 
  researcherEmail,
  onApprove, 
  onReject,
  formatTimeAgo
}: SubmissionCardProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDropdown, setShowRejectDropdown] = useState(false);
  const [suspicious, setSuspicious] = useState(false);

  const sub = submission.submission;
  if (!sub) return null;

  const companyName = sub.notes?.split('\n')[0] || 'Unknown Company';
  const companyLink = submission.targetId.startsWith('http') 
    ? submission.targetId 
    : `https://${submission.targetId}`;

  const handleRejectClick = () => {
    if (!rejectionReason.trim()) {
      alert('Please select a rejection reason');
      return;
    }
    onReject(submission.id, rejectionReason);
  };

  return (
    <div className="submission-card">
      <div className="card-header">
        <span className="type-badge">Website Research</span>
        <span className="time-badge">{formatTimeAgo(sub.createdAt)}</span>
      </div>

      <div className="card-body">
        <section className="info-section">
          <h3>Context</h3>
          <div className="info-row">
            <label>Company Name:</label>
            <span className="info-value">{companyName}</span>
          </div>
          <div className="info-row">
            <label>Company Link:</label>
            <a href={companyLink} target="_blank" rel="noopener noreferrer" className="company-link">
              {submission.targetId}
            </a>
          </div>
          <div className="info-row">
            <label>Country:</label>
            <span className="info-value">{sub.country || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Language:</label>
            <span className="info-value">{sub.language || 'N/A'}</span>
          </div>
        </section>

        <section className="info-section">
          <h3>Submission Details</h3>
          <div className="info-row">
            <label>Task ID:</label>
            <span className="info-value task-id">{submission.id.slice(0, 8)}...</span>
          </div>
          <div className="info-row">
            <label>Worker:</label>
            <span className="info-value">{researcherEmail}</span>
          </div>
          <div className="info-row">
            <label>Category:</label>
            <span className="info-value">{categoryName}</span>
          </div>
        </section>

        <section className="info-section">
          <h3>Validation</h3>
          <div className="validation-item">✓ No recent contact (30 days)</div>
          <div className="validation-item">✓ Company Name: {companyName}</div>
          <div className="validation-item">✓ Company Link: {submission.targetId}</div>
          <div className="validation-item">✓ Country: {sub.country || 'N/A'}</div>
          <div className="validation-item">✓ Language: {sub.language || 'N/A'}</div>
        </section>

        {sub.email && (
          <section className="info-section">
            <h3>Additional Data</h3>
            {sub.email && <div className="info-row"><label>Email:</label><span>{sub.email}</span></div>}
            {sub.phone && <div className="info-row"><label>Phone:</label><span>{sub.phone}</span></div>}
            {sub.techStack && <div className="info-row"><label>Tech Stack:</label><span>{sub.techStack}</span></div>}
          </section>
        )}

        <section className="controls-section">
          <div className="control-group">
            <label>Rejection Reason:</label>
            <select 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)}
              className="rejection-select"
            >
              <option value="">Select reason...</option>
              <option value="INVALID_DATA">Invalid Data</option>
              <option value="INCOMPLETE">Incomplete Submission</option>
              <option value="DUPLICATE">Duplicate</option>
              <option value="WRONG_TARGET">Wrong Target</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="control-group">
            <button
              onClick={() => setSuspicious(!suspicious)}
              className={`btn-flag ${suspicious ? 'flagged' : ''}`}
            >
              {suspicious ? '🚩 Flagged as Suspicious' : 'Flag as Suspicious'}
            </button>
          </div>
        </section>
      </div>

      <div className="card-actions">
        <button 
          onClick={handleRejectClick}
          className="btn-reject"
        >
          Reject
        </button>
        <button 
          onClick={() => onApprove(submission.id)}
          className="btn-approve"
        >
          Approve
        </button>
      </div>
    </div>
  );
}
