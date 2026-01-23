import React, { useEffect, useState } from 'react';
import './WebsiteResearchAuditorPendingPage.css';
import { useAuth } from '../../../hooks/useAuth';
import { auditApi, PendingResearchSubmission } from '../../../api/audit.api';
import { researchApi, Category } from '../../../api/research.api';

export default function WebsiteResearchAuditorPendingPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingResearchSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<PendingResearchSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  // Load submissions when category changes
  useEffect(() => {
    if (selectedCategory || (!loadingCategories && categories.length > 0)) {
      loadSubmissions();
    }
  }, [selectedCategory, loadingCategories]);

  const loadCategories = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingCategories(true);
      const userCats = await researchApi.getMyCategories();
      
      // Deduplicate categories by id before setting state
      let uniqueCategories: Category[] = [];
      if (userCats && userCats.length > 0) {
        const categoryMap = new Map<string, Category>();
        userCats.forEach((cat: Category) => {
          categoryMap.set(cat.id, cat);
        });
        uniqueCategories = Array.from(categoryMap.values());
      }
      
      setCategories(uniqueCategories);
      
      // Auto-select first category if user has exactly one
      if (uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0].id);
      } else if (uniqueCategories.length > 1) {
        // Let user choose - don't auto-select
        setSelectedCategory('');
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load your assigned categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubmissions = async () {
    try {
      setLoading(true);
      const data = await auditApi.getPendingResearch();
      
      const websiteSubmissions = data.filter(s => s.targetType === 'COMPANY');
      setAllSubmissions(websiteSubmissions);
      
      // Filter by selected category (client-side for consistency)
      // Backend already filters by auditor's categories, this is additional UI filtering
      const filtered = selectedCategory
        ? websiteSubmissions.filter(s => s.categoryId === selectedCategory)
        : websiteSubmissions;
      
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
      if (rejectionReasonId) {
        payload.rejectionReasonId = rejectionReasonId;
      }
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

  if (loadingCategories) {
    return <div className="wb-state-screen"><p>Loading categories…</p></div>;
  }

  if (categories.length === 0) {
    return <div className="wb-state-screen"><p>No categories assigned. Contact administrator.</p></div>;
  }

  if (categories.length > 1 && !selectedCategory) {
    return (
      <div className="wb-state-screen">
        <p>Select a category to view pending submissions:</p>
        <div style={{ marginTop: '1rem' }}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'block',
                margin: '0.5rem auto',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="wb-state-screen"><p>Loading submissions…</p></div>;
  }

  if (error) {
    return <div className="wb-state-screen error"><p>{error}</p></div>;
  }

  if (submissions.length === 0) {
    return <div className="wb-state-screen"><p>No pending submissions to review{selectedCategory ? ' in this category' : ''}.</p></div>;
  }

  return (
    <div className="wb-research-pending-container">
      {categories.length > 1 && (
        <div className="wb-category-selector" style={{ padding: '1rem', backgroundColor: '#f3f4f6', marginBottom: '1rem' }}>
          <label htmlFor="category-select" style={{ marginRight: '0.5rem', fontWeight: 600 }}>Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem', minWidth: '200px' }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span style={{ marginLeft: '1rem', color: '#6b7280' }}>
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} in {categories.find(c => c.id === selectedCategory)?.name}
          </span>
        </div>
      )}
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
  onApprove: (taskId: string) => void;
  onReject: (taskId: string, rejectionReasonId?: string) => void;
  formatTimeAgo: (date: string) => string;
}

function SubmissionCard({ 
  submission, 
  onApprove, 
  onReject,
  formatTimeAgo
}: SubmissionCardProps) {
  const [validationChecks, setValidationChecks] = useState({
    noRecentContact: false,
    companyName: false,
    companyLink: false,
    country: false,
    language: false,
  });
  const [suspicious, setSuspicious] = useState(false);
  const [suspiciousReason, setSuspiciousReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sub = submission.submission;
  if (!sub) return null;

  const allValidationsChecked = Object.values(validationChecks).every(v => v);
  const canApprove = allValidationsChecked && !suspicious;
  const canReject = rejectionReason || suspiciousReason;

  const handleApproveClick = async () => {
    if (!canApprove) return;
    setSubmitting(true);
    try {
      await onApprove(submission.id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = async () => {
    if (!canReject) return;
    setSubmitting(true);
    try {
      const reasonId = rejectionReason || suspiciousReason;
      await onReject(submission.id, reasonId);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleValidation = (key: keyof typeof validationChecks) => {
    setValidationChecks(prev => ({ ...prev, [key]: !prev[key] }));
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
            <span className="info-value">{submission.companyName || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <label>Company Link:</label>
            <a 
              href={`https://${submission.companyDomain}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="company-link"
            >
              {submission.companyDomain || 'N/A'}
            </a>
          </div>
          <div className="info-row">
            <label>Country:</label>
            <span className="info-value">{submission.companyCountry || 'N/A'}</span>
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
            <span className="info-value task-id" title={submission.id}>{submission.id}</span>
          </div>
          <div className="info-section-nested">
            <label className="nested-label">Worker</label>
            <div className="nested-items">
              <div className="nested-row">
                <span className="nested-key">ID:</span>
                <span className="nested-value">{submission.assignedToUserId}</span>
              </div>
              <div className="nested-row">
                <span className="nested-key">Name:</span>
                <span className="nested-value">{submission.workerName || 'Unknown'}</span>
              </div>
              <div className="nested-row">
                <span className="nested-key">Email:</span>
                <span className="nested-value">{submission.workerEmail || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="info-section-nested">
            <label className="nested-label">Category</label>
            <div className="nested-items">
              <div className="nested-row">
                <span className="nested-key">ID:</span>
                <span className="nested-value">{submission.categoryId}</span>
              </div>
              <div className="nested-row">
                <span className="nested-key">Name:</span>
                <span className="nested-value">{submission.categoryName || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3>Validation Checklist</h3>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.noRecentContact}
                onChange={() => toggleValidation('noRecentContact')}
              />
              <span>No recent contact (30 days)</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.companyName}
                onChange={() => toggleValidation('companyName')}
              />
              <span>Company Name: {submission.companyName || 'Unknown'}</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.companyLink}
                onChange={() => toggleValidation('companyLink')}
              />
              <span>Company Link: {submission.companyDomain || 'N/A'}</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.country}
                onChange={() => toggleValidation('country')}
              />
              <span>Country: {submission.companyCountry || 'N/A'}</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.language}
                onChange={() => toggleValidation('language')}
              />
              <span>Language: {sub.language || 'N/A'}</span>
            </label>
          </div>
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
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value) setSuspiciousReason('');
              }}
              className="rejection-select"
              disabled={suspicious}
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
            <label>Flag as Suspicious:</label>
            <select
              value={suspiciousReason}
              onChange={(e) => {
                setSuspiciousReason(e.target.value);
                if (e.target.value) setRejectionReason('');
              }}
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
        <button 
          onClick={handleRejectClick}
          disabled={!canReject || submitting}
          className="btn-reject"
          title={!canReject ? 'Select a rejection reason' : ''}
        >
          {submitting ? 'Processing...' : 'Reject'}
        </button>
        <button 
          onClick={handleApproveClick}
          disabled={!canApprove || submitting}
          className="btn-approve"
          title={!canApprove ? (suspicious ? 'Disable suspicious flag first' : 'Complete all validations') : ''}
        >
          {submitting ? 'Processing...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}
