import React, { useEffect, useState } from 'react';
import './WebsiteResearchAuditorPendingPage.css';
import { useAuth } from '../../../hooks/useAuth';
import { auditApi, PendingResearchSubmission, DisapprovalReason } from '../../../api/audit.api';
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
  const [rejectionReasons, setRejectionReasons] = useState<DisapprovalReason[]>([]);
  const [flagReasons, setFlagReasons] = useState<DisapprovalReason[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setRejectionReasons([]);
      setFlagReasons([]);
      return;
    }
    loadReasons(selectedCategory);
  }, [selectedCategory]);

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

      console.log('[Auditor] Raw categories:', rawCategories);
      const uniqueCategories = list.length > 0
        ? Array.from(new Map(list.map((cat: Category) => [cat.id, cat])).values())
        : [];

      setCategories(uniqueCategories);

      if (uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0].id);
      } else if (uniqueCategories.length > 1) {
        setSelectedCategory('');
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
      
      const websiteSubmissions = data.filter(s => s.targetType === 'COMPANY');
      setAllSubmissions(websiteSubmissions);

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

  const loadReasons = async (categoryId: string) => {
    try {
      setLoadingReasons(true);
      const [rejections, flags] = await Promise.all([
        auditApi.getDisapprovalReasons({ role: 'website_research_auditor', reasonType: 'rejection', categoryId }),
        auditApi.getDisapprovalReasons({ role: 'website_research_auditor', reasonType: 'flag', categoryId }),
      ]);
      setRejectionReasons(Array.isArray(rejections) ? rejections : []);
      setFlagReasons(Array.isArray(flags) ? flags : []);
    } catch (err) {
      console.error('Failed to load disapproval reasons', err);
    } finally {
      setLoadingReasons(false);
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

  const handleReject = async (taskId: string, reasonId: string) => {
    try {
      await auditApi.auditResearch(taskId, { decision: 'REJECTED', reasonId });
      setSubmissions(prev => prev.filter(s => s.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject submission');
    }
  };

  const handleFlag = async (taskId: string, reasonId: string) => {
    try {
      await auditApi.auditResearch(taskId, { decision: 'FLAGGED', reasonId });
      setSubmissions(prev => prev.filter(s => s.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to flag submission');
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

  return (
    <div className="wb-research-pending-container">
      {/* CATEGORY SELECTOR - ALWAYS VISIBLE */}
      {categories.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Select Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <option value="">Choose a category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* WARNING IF NO CATEGORY SELECTED */}
      {!selectedCategory && categories.length > 1 && (
        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fcd34d' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            📁 Please select a category from above to view pending submissions.
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#c00' }}>
          {error}
        </div>
      )}

      {/* MAIN CONTENT - ONLY SHOW IF CATEGORY SELECTED */}
      {selectedCategory && categories.length > 0 && (
        <>
          {loading && (
            <div className="wb-state-screen"><p>Loading submissions…</p></div>
          )}

          {!loading && submissions.length === 0 && (
            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#666' }}>No pending submissions to review in this category.</p>
            </div>
          )}

          {!loading && submissions.length > 0 && (
            <>
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
                    onFlag={handleFlag}
                    rejectionReasons={rejectionReasons}
                    flagReasons={flagReasons}
                    loadingReasons={loadingReasons}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: PendingResearchSubmission;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string, reasonId: string) => void;
  onFlag: (taskId: string, reasonId: string) => void;
  rejectionReasons: DisapprovalReason[];
  flagReasons: DisapprovalReason[];
  loadingReasons: boolean;
  formatTimeAgo: (date: string) => string;
}

function SubmissionCard({ 
  submission, 
  onApprove, 
  onReject,
  onFlag,
  rejectionReasons,
  flagReasons,
  loadingReasons,
  formatTimeAgo
}: SubmissionCardProps) {
  const [validationChecks, setValidationChecks] = useState({
    noRecentContact: false,
    companyName: false,
    companyLink: false,
    country: false,
    language: false,
  });
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [selectedFlagReason, setSelectedFlagReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sub = submission.submission;
  if (!sub) return null;

  const allValidationsChecked = Object.values(validationChecks).every(v => v);
  const canApprove = allValidationsChecked;
  const canReject = Boolean(selectedRejectionReason);
  const canFlag = Boolean(selectedFlagReason);

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
    if (!canReject || !selectedRejectionReason) return;
    setSubmitting(true);
    try {
      await onReject(submission.id, selectedRejectionReason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlagClick = async () => {
    if (!canFlag || !selectedFlagReason) return;
    setSubmitting(true);
    try {
      await onFlag(submission.id, selectedFlagReason);
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
              value={selectedRejectionReason} 
              onChange={(e) => {
                setSelectedRejectionReason(e.target.value);
                if (e.target.value) setSelectedFlagReason('');
              }}
              className="rejection-select"
              disabled={loadingReasons || !!selectedFlagReason}
            >
              <option value="">Select reason...</option>
              {rejectionReasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.description}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Flag Reason:</label>
            <select
              value={selectedFlagReason}
              onChange={(e) => {
                setSelectedFlagReason(e.target.value);
                if (e.target.value) setSelectedRejectionReason('');
              }}
              className={`suspicious-select ${selectedFlagReason ? 'active' : ''}`}
              disabled={loadingReasons || !!selectedRejectionReason}
            >
              <option value="">Not flagged</option>
              {flagReasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.description}
                </option>
              ))}
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
          onClick={handleFlagClick}
          disabled={!canFlag || submitting}
          className="btn-flag"
          title={!canFlag ? 'Select a flag reason' : ''}
        >
          {submitting ? 'Processing...' : 'Flag'}
        </button>
        <button 
          onClick={handleApproveClick}
          disabled={!canApprove || submitting}
          className="btn-approve"
          title={!canApprove ? (selectedFlagReason ? 'Clear flag reason first' : 'Complete all validations') : ''}
        >
          {submitting ? 'Processing...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}
