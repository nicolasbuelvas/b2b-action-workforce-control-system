import React, { useEffect, useState } from 'react';
import './WebsiteAuditorPendingPage.css';
import { useAuth } from '../../../hooks/useAuth';
import { auditApi, PendingInquirySubmission } from '../../../api/audit.api';
import { researchApi, Category } from '../../../api/research.api';

export default function WebsiteAuditorPendingPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingInquirySubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<PendingInquirySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);

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
      const data = await auditApi.getPendingInquiry();
      
      setAllSubmissions(data);

      const filtered = selectedCategory
        ? data.filter(s => s.categoryId === selectedCategory)
        : data;

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
      await auditApi.auditInquiry(taskId, { decision: 'APPROVED' });
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
      await auditApi.auditInquiry(taskId, payload);
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

  return (
    <div className="wb-inquiry-pending-container">
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
                  <h1>Website Inquiry Audits</h1>
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
            </>
          )}
        </>
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: PendingInquirySubmission;
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
    actionMatches: false,
    screenshotValid: false,
    targetCorrect: false,
    noManipulation: false,
    messageValid: false,
  });
  const [suspicious, setSuspicious] = useState(false);
  const [suspiciousReason, setSuspiciousReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!submission) return null;

  const allValidationsChecked = Object.values(validationChecks).every(v => v);
  const canApprove = allValidationsChecked && !suspicious && !submission.isDuplicate;
  const canReject = rejectionReason || suspiciousReason || submission.isDuplicate;

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
      // Force DUPLICATE reason if system detected duplicate
      const reasonId = submission.isDuplicate ? 'DUPLICATE' : (rejectionReason || suspiciousReason);
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
        <span className="type-badge">Website Inquiry</span>
        <span className="time-badge">{formatTimeAgo(submission.createdAt)}</span>
      </div>

      <div className="card-content-wrapper">
        <div className="card-body">
        <section className="info-section">
          <h3>Context</h3>
          <div className="info-row">
            <label>Company Name:</label>
            <span className="info-value">{submission.companyName}</span>
          </div>
          <div className="info-row">
            <label>Company Link:</label>
            <a 
              href={`https://${submission.companyDomain}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="company-link"
            >
              {submission.companyDomain}
            </a>
          </div>
          <div className="info-row">
            <label>Country:</label>
            <span className="info-value">{submission.companyCountry}</span>
          </div>
          <div className="info-row">
            <label>Language:</label>
            <span className="info-value">{submission.language}</span>
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

        {/* SYSTEM DUPLICATE DETECTION */}
        <section className="info-section">
          <h3>Duplicate Detection (System)</h3>
          <div className="checkbox-group">
            <label 
              className="checkbox-item" 
              style={{
                background: submission.isDuplicate ? '#fee2e2' : '#d1fae5',
                padding: '12px',
                borderRadius: '6px',
                border: submission.isDuplicate ? '2px solid #dc2626' : '2px solid #10b981',
                cursor: 'not-allowed',
                opacity: 1
              }}
            >
              <input
                type="checkbox"
                checked={!submission.isDuplicate}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
              <span style={{ 
                fontWeight: '600',
                color: submission.isDuplicate ? '#dc2626' : '#059669'
              }}>
                {submission.isDuplicate ? '☒ Screenshot is DUPLICATED (System Detected)' : '☑ Screenshot is NOT duplicated'}
              </span>
            </label>
          </div>
          {submission.isDuplicate && (
            <div style={{ 
              background: '#fef2f2', 
              padding: '12px', 
              borderRadius: '6px', 
              marginTop: '10px',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              fontSize: '13px'
            }}>
              ⚠️ <strong>System Alert:</strong> This screenshot has been flagged as a duplicate. Approval is disabled. You must reject this submission.
            </div>
          )}
        </section>

        <section className="info-section">
          <h3>Validation Checklist</h3>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.actionMatches}
                onChange={() => toggleValidation('actionMatches')}
              />
              <span>Action matches submission type</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.screenshotValid}
                onChange={() => toggleValidation('screenshotValid')}
              />
              <span>Screenshot is valid proof of action</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.targetCorrect}
                onChange={() => toggleValidation('targetCorrect')}
              />
              <span>Target website/LinkedIn is correct</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.noManipulation}
                onChange={() => toggleValidation('noManipulation')}
              />
              <span>No signs of manipulation or forgery</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={validationChecks.messageValid}
                onChange={() => toggleValidation('messageValid')}
              />
              <span>Outreach message matches template</span>
            </label>
          </div>
        </section>

        <section className="controls-section">
          <div className="control-group">
            <label>Rejection Reason:</label>
            <select 
              value={submission.isDuplicate ? 'DUPLICATE' : rejectionReason}
              onChange={(e) => {
                if (!submission.isDuplicate) {
                  setRejectionReason(e.target.value);
                  if (e.target.value) setSuspiciousReason('');
                }
              }}
              className="rejection-select"
              disabled={suspicious || submission.isDuplicate}
              style={submission.isDuplicate ? { background: '#fee2e2', border: '2px solid #dc2626', cursor: 'not-allowed' } : {}}
            >
              <option value="">Select reason...</option>
              <option value="INVALID_DATA">Invalid Data</option>
              <option value="INCOMPLETE">Incomplete Submission</option>
              <option value="DUPLICATE">Duplicate Screenshot</option>
              <option value="WRONG_TARGET">Wrong Target</option>
              <option value="MANIPULATED">Manipulated Screenshot</option>
              <option value="OTHER">Other</option>
            </select>
            {submission.isDuplicate && (
              <small style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Automatically set to "Duplicate" - cannot be changed
              </small>
            )}
          </div>

          <div className="control-group">
            <label>Flag as Suspicious:</label>
            <select
              value={submission.isDuplicate ? 'POTENTIAL_FRAUD' : suspiciousReason}
              onChange={(e) => {
                if (!submission.isDuplicate) {
                  setSuspiciousReason(e.target.value);
                  if (e.target.value) setRejectionReason('');
                }
              }}
              className={`suspicious-select ${(suspiciousReason || submission.isDuplicate) ? 'active' : ''}`}
              disabled={submission.isDuplicate}
              style={submission.isDuplicate ? { background: '#fee2e2', border: '2px solid #dc2626', cursor: 'not-allowed' } : {}}
            >
              <option value="">Not suspicious</option>
              <option value="SUSPICIOUS_CONTACT">Suspicious Contact Pattern</option>
              <option value="SUSPICIOUS_DATA">Suspicious Data</option>
              <option value="REQUIRES_REVIEW">Requires Further Review</option>
              <option value="POTENTIAL_FRAUD">Potential Fraud / Duplicate</option>
            </select>
            {submission.isDuplicate && (
              <small style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Automatically flagged as suspicious - cannot be changed
              </small>
            )}
          </div>
        </section>
        </div>

        <div className="screenshot-panel">
          <h3>Screenshot</h3>
          <div className="screenshot-container">
            {submission.screenshotUrl ? (
              <img 
                src={submission.screenshotUrl} 
                alt="Inquiry submission screenshot" 
                className="screenshot-image"
              />
            ) : (
              <div className="no-screenshot">No screenshot available</div>
            )}
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button 
          onClick={handleRejectClick}
          disabled={!canReject || submitting}
          className="btn-reject"
          title={!canReject ? 'Select a rejection reason' : (submission.isDuplicate ? 'Duplicate screenshot - must reject' : '')}
          style={submission.isDuplicate ? { background: '#dc2626', fontWeight: '600' } : {}}
        >
          {submitting ? 'Processing...' : (submission.isDuplicate ? '⚠️ Reject Duplicate' : 'Reject')}
        </button>
        <button 
          onClick={handleApproveClick}
          disabled={!canApprove || submitting}
          className="btn-approve"
          title={!canApprove ? (submission.isDuplicate ? 'Cannot approve duplicate screenshot' : (suspicious ? 'Disable suspicious flag first' : 'Complete all validations')) : ''}
          style={submission.isDuplicate ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
        >
          {submitting ? 'Processing...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}