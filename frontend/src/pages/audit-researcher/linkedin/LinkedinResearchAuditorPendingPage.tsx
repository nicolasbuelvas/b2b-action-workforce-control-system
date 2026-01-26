import React, { useEffect, useState } from 'react';
// Reuse website auditor styles for consistent UI
import '../website/WebsiteResearchAuditorPendingPage.css';
import { auditApi, PendingResearchSubmission } from '../../../api/audit.api';
import { researchApi, Category } from '../../../api/research.api';
import { useAuth } from '../../../hooks/useAuth';

export default function LinkedinResearchAuditorPendingPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingResearchSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<PendingResearchSubmission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (loadingCategories) return;

    if (!selectedCategory && categories.length === 1) {
      setSelectedCategory(categories[0].id);
      return;
    }

    if (!selectedCategory && categories.length > 1) {
      setSubmissions([]);
      return;
    }

    const filtered = selectedCategory
      ? allSubmissions.filter(s => s.categoryId === selectedCategory)
      : allSubmissions;

    setSubmissions(filtered);
  }, [selectedCategory, allSubmissions, loadingCategories, categories]);

  const loadCategories = async () => {
    if (!user?.id) return;

    try {
      setLoadingCategories(true);
      const rawCategories = await researchApi.getMyCategories();
      const list: Category[] = Array.isArray(rawCategories)
        ? rawCategories
        : (Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : []);

      const uniqueCategories = list.length > 0
        ? Array.from(new Map(list.map((cat: Category) => [cat.id, cat])).values())
        : [];

      setCategories(uniqueCategories);

      if (uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load your assigned categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await auditApi.getPendingResearch();
      const linkedinSubs = data.filter(s => s.targetType !== 'COMPANY');
      setAllSubmissions(linkedinSubs);

      const filtered = selectedCategory
        ? linkedinSubs.filter(s => s.categoryId === selectedCategory)
        : linkedinSubs;

      setSubmissions(filtered);
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

  const handleReject = async (taskId: string, rejectionReasonId?: string) => {
    try {
      const payload: any = { decision: 'REJECTED' };
      if (rejectionReasonId) payload.rejectionReasonId = rejectionReasonId;
      await auditApi.auditResearch(taskId, payload);
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

  const getDisplayUrl = (submission: PendingResearchSubmission) => {
    const fallback = submission.submission?.contactLinkedinUrl || submission.linkedInUrl || submission.targetId;
    if (!fallback) return '';
    return fallback.startsWith('http') ? fallback : `https://${fallback}`;
  };

  if (loadingCategories) {
    return <div className="wb-state-screen"><p>Loading categories…</p></div>;
  }

  if (categories.length === 0) {
    return <div className="wb-state-screen"><p>No categories assigned. Contact administrator.</p></div>;
  }

  return (
    <div className="wb-research-pending-container">
      {categories.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Select Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%', maxWidth: 300, padding: 10, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, fontWeight: 500 }}
          >
            <option value="">Choose a category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedCategory && categories.length > 1 && (
        <div style={{ background: '#fef3c7', padding: 20, borderRadius: 8, marginBottom: 20, border: '1px solid #fcd34d' }}>
          <p style={{ margin: 0, color: '#92400e' }}>📁 Please select a category from above to view pending submissions.</p>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee', padding: 15, borderRadius: 8, marginBottom: 20, color: '#c00' }}>{error}</div>
      )}

      {selectedCategory && !loading && submissions.length === 0 && (
        <div style={{ background: '#f3f4f6', padding: 20, borderRadius: 8, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>No pending LinkedIn research submissions for this category.</p>
        </div>
      )}

      {selectedCategory && submissions.length > 0 && (
        <>
          <header className="wb-pending-header">
            <h1>LinkedIn Research Audits</h1>
            <p>{submissions.length} pending submission{submissions.length !== 1 ? 's' : ''}</p>
          </header>

          <div className="submissions-grid">
            {submissions.map(submission => (
              <LinkedInSubmissionCard
                key={submission.id}
                submission={submission}
                onApprove={handleApprove}
                onReject={handleReject}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type CardProps = {
  submission: PendingResearchSubmission;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string, rejectionReasonId?: string) => void;
  formatTimeAgo: (date: string) => string;
};

function LinkedInSubmissionCard({ submission, onApprove, onReject, formatTimeAgo }: CardProps) {
  const [checks, setChecks] = useState({
    profileUrl: false,
    contactName: false,
    contactLink: false,
    country: false,
    language: false,
  });
  const [suspiciousReason, setSuspiciousReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayUrl = ((): string => {
    const fallback = submission.submission?.contactLinkedinUrl || submission.linkedInUrl || submission.targetId;
    if (!fallback) return '';
    return fallback.startsWith('http') ? fallback : `https://${fallback}`;
  })();

  const allChecked = Object.values(checks).every(Boolean);
  const canApprove = allChecked && !suspiciousReason;
  const canReject = Boolean(rejectionReason || suspiciousReason);

  const toggle = (key: keyof typeof checks) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

  const handleApprove = async () => {
    if (!canApprove) return;
    setSubmitting(true);
    try {
      await onApprove(submission.id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!canReject) return;
    setSubmitting(true);
    try {
      const reasonId = rejectionReason || suspiciousReason;
      await onReject(submission.id, reasonId);
    } finally {
      setSubmitting(false);
    }
  };

  const sub = submission.submission;

  return (
    <div className="submission-card">
      <div className="card-header">
        <span className="type-badge">LinkedIn Research</span>
        <span className="time-badge">{sub ? formatTimeAgo(sub.createdAt) : 'Pending'}</span>
      </div>
      <div className="card-body">
        <section className="info-section">
          <h3>Target</h3>
          <div className="info-row">
            <label>LinkedIn Profile/Search:</label>
            <a className="company-link" href={displayUrl} target="_blank" rel="noopener noreferrer">{displayUrl}</a>
          </div>
        </section>

        <section className="info-section">
          <h3>Contact Details</h3>
          <div className="info-row"><label>Contact Name:</label><span className="info-value">{sub?.contactName || submission.linkedInContactName || 'Unknown'}</span></div>
          <div className="info-row"><label>LinkedIn URL:</label><span className="info-value">{sub?.contactLinkedinUrl || submission.linkedInUrl || 'N/A'}</span></div>
          <div className="info-row"><label>Country:</label><span className="info-value">{sub?.country || submission.linkedInCountry || 'N/A'}</span></div>
          <div className="info-row"><label>Language:</label><span className="info-value">{sub?.language || submission.linkedInLanguage || 'N/A'}</span></div>
        </section>

        <section className="info-section">
          <h3>Submission Details</h3>
          <div className="info-row"><label>Task ID:</label><span className="info-value task-id" title={submission.id}>{submission.id}</span></div>
          <div className="info-section-nested">
            <label className="nested-label">Worker</label>
            <div className="nested-items">
              <div className="nested-row"><span className="nested-key">ID:</span><span className="nested-value">{submission.assignedToUserId}</span></div>
              <div className="nested-row"><span className="nested-key">Name:</span><span className="nested-value">{submission.workerName || 'Unknown'}</span></div>
              <div className="nested-row"><span className="nested-key">Email:</span><span className="nested-value">{submission.workerEmail || 'N/A'}</span></div>
            </div>
          </div>
          <div className="info-section-nested">
            <label className="nested-label">Category</label>
            <div className="nested-items">
              <div className="nested-row"><span className="nested-key">ID:</span><span className="nested-value">{submission.categoryId}</span></div>
              <div className="nested-row"><span className="nested-key">Name:</span><span className="nested-value">{submission.categoryName || 'Unknown'}</span></div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3>Validation Checklist</h3>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input type="checkbox" checked={checks.profileUrl} onChange={() => toggle('profileUrl')} />
              <span>Open the LinkedIn link and verify target matches</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={checks.contactName} onChange={() => toggle('contactName')} />
              <span>Contact Name present and correct</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={checks.contactLink} onChange={() => toggle('contactLink')} />
              <span>LinkedIn URL present and valid</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={checks.country} onChange={() => toggle('country')} />
              <span>Country present</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={checks.language} onChange={() => toggle('language')} />
              <span>Language present</span>
            </label>
          </div>
        </section>

        <section className="controls-section">
          <div className="control-group">
            <label>Rejection Reason:</label>
            <select
              value={rejectionReason}
              onChange={(e) => { setRejectionReason(e.target.value); if (e.target.value) setSuspiciousReason(''); }}
              className="rejection-select"
              disabled={Boolean(suspiciousReason)}
            >
              <option value="">Select reason...</option>
              <option value="INVALID_DATA">Invalid Data</option>
              <option value="INCOMPLETE">Incomplete Submission</option>
              <option value="WRONG_TARGET">Wrong Target</option>
              <option value="DUPLICATE">Duplicate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="control-group">
            <label>Flag as Suspicious:</label>
            <select
              value={suspiciousReason}
              onChange={(e) => { setSuspiciousReason(e.target.value); if (e.target.value) setRejectionReason(''); }}
              className={`suspicious-select ${suspiciousReason ? 'active' : ''}`}
            >
              <option value="">Not suspicious</option>
              <option value="SUSPICIOUS_CONTACT">Suspicious Contact</option>
              <option value="SUSPICIOUS_DATA">Suspicious Data</option>
              <option value="REQUIRES_REVIEW">Requires Further Review</option>
              <option value="POTENTIAL_FRAUD">Potential Fraud</option>
            </select>
          </div>
        </section>
      </div>
      <div className="card-actions">
        <button className="btn-reject" onClick={handleReject} disabled={!canReject || submitting}>{submitting ? 'Processing...' : 'Reject'}</button>
        <button className="btn-approve" onClick={handleApprove} disabled={!canApprove || submitting}>{submitting ? 'Processing...' : 'Approve'}</button>
      </div>
    </div>
  );
}
