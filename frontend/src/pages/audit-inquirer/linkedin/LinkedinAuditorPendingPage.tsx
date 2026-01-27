import React, { useEffect, useState } from 'react';
import './LinkedinAuditorPendingPage.css';
import { useAuth } from '../../../hooks/useAuth';
import { auditApi, PendingLinkedInInquirySubmission, LinkedInInquiryAction } from '../../../api/audit.api';
import { researchApi, Category } from '../../../api/research.api';

export default function LinkedinAuditorPendingPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingLinkedInInquirySubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<PendingLinkedInInquirySubmission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    setCurrentIndex(0);
  }, [selectedCategory, allSubmissions, loadingCategories, categories]);

  const loadCategories = async () => {
    if (!user?.id) return;

    try {
      setLoadingCategories(true);
      const rawCategories = await researchApi.getMyCategories();

      const list: Category[] = Array.isArray(rawCategories)
        ? rawCategories
        : (Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : []);

      console.log('[LinkedinAuditor] Raw categories:', rawCategories);
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
      const data = await auditApi.getPendingLinkedInInquiry();
      
      setAllSubmissions(data);

      const filtered = selectedCategory
        ? data.filter(s => s.categoryId === selectedCategory)
        : data;

      setSubmissions(filtered);
      setCurrentIndex(0);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
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
    return <div className="li-state-screen"><p>Loading categories…</p></div>;
  }

  if (categories.length === 0) {
    return <div className="li-state-screen"><p>No categories assigned. Contact administrator.</p></div>;
  }

  return (
    <div className="li-inquiry-pending-container">
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
            <div className="li-state-screen"><p>Loading submissions…</p></div>
          )}

          {!loading && submissions.length === 0 && (
            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#666' }}>No pending submissions to review in this category.</p>
            </div>
          )}

          {!loading && submissions.length > 0 && (
            <>
              <header className="li-pending-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1>LinkedIn Inquiry Audits</h1>
                  <p>{submissions.length} pending submission{submissions.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))}
                    disabled={currentIndex === 0}
                    className="btn-nav"
                  >
                    ← Previous
                  </button>
                  <span style={{ fontWeight: 600 }}>{currentIndex + 1} / {submissions.length}</span>
                  <button
                    onClick={() => setCurrentIndex(prev => (prev < submissions.length - 1 ? prev + 1 : prev))}
                    disabled={currentIndex >= submissions.length - 1}
                    className="btn-nav"
                  >
                    Next →
                  </button>
                </div>
              </header>

              <div className="submissions-grid" style={{ gridTemplateColumns: '1fr' }}>
                <SubmissionCard
                  key={submissions[currentIndex].id}
                  submission={submissions[currentIndex]}
                  onRefresh={() => {
                    loadSubmissions();
                  }}
                  formatTimeAgo={formatTimeAgo}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: PendingLinkedInInquirySubmission;
  onRefresh: () => void;
  formatTimeAgo: (date: string) => string;
}

function SubmissionCard({ 
  submission, 
  onRefresh,
  formatTimeAgo
}: SubmissionCardProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(
    submission.actions && submission.actions.length > 0 ? submission.actions[0].id : null
  );
  const [submitting, setSubmitting] = useState(false);

  if (!submission) return null;

  const actionTypeMap: Record<string, string> = {
    'LINKEDIN_OUTREACH': 'Step 1: LinkedIn Outreach',
    'LINKEDIN_EMAIL_REQUEST': 'Step 2: Email Request',
    'LINKEDIN_CATALOGUE': 'Step 3: Catalogue Request'
  };

  const handleApproveAction = async (actionId: string) => {
    try {
      setSubmitting(true);
      await auditApi.auditLinkedInInquiry(submission.id, actionId, { decision: 'APPROVED' });
      alert('Action approved successfully!');
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve action');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectAction = async (actionId: string) => {
    try {
      setSubmitting(true);
      await auditApi.auditLinkedInInquiry(submission.id, actionId, { decision: 'REJECTED' });
      alert('Action rejected successfully!');
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject action');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="li-submission-card">
      <div className="li-card-header">
        <span className="li-type-badge">LinkedIn Inquiry (3-Step)</span>
        <span className="li-time-badge">{formatTimeAgo(submission.createdAt)}</span>
      </div>

      <div className="li-card-content-wrapper">
        <div className="li-card-body">
          {/* WORKER DETAILS */}
          <section className="li-info-section">
            <h3>Worker Information</h3>
            <div className="li-info-row">
              <label>Name:</label>
              <span className="li-info-value">{submission.workerName || '—'}</span>
            </div>
            <div className="li-info-row">
              <label>Email:</label>
              <span className="li-info-value">{submission.workerEmail || '—'}</span>
            </div>
            <div className="li-info-row">
              <label>User ID:</label>
              <span className="li-info-value task-id" title={submission.assignedToUserId}>{submission.assignedToUserId}</span>
            </div>
          </section>

          {/* TASK DETAILS */}
          <section className="li-info-section">
            <h3>Task Information</h3>
            <div className="li-info-row">
              <label>Task ID:</label>
              <span className="li-info-value task-id" title={submission.id}>{submission.id}</span>
            </div>
            <div className="li-info-row">
              <label>Category:</label>
              <span className="li-info-value">{submission.categoryName || '—'}</span>
            </div>
            <div className="li-info-row">
              <label>Status:</label>
              <span className="li-info-value" style={{ fontWeight: '600', color: '#0ea5e9' }}>
                {submission.status}
              </span>
            </div>
          </section>

          {/* MULTI-STEP TIMELINE */}
          <section className="li-info-section">
            <h3>Multi-Action Progress</h3>
            <div className="li-timeline">
              {submission.actions && submission.actions.map((action, index) => (
                <div 
                  key={action.id} 
                  className="li-timeline-item"
                  style={{
                    marginBottom: index < submission.actions.length - 1 ? '16px' : '0'
                  }}
                >
                  {/* Timeline dot */}
                  <div 
                    className="li-timeline-dot"
                    style={{
                      background: 
                        action.status === 'APPROVED' ? '#10b981' :
                        action.status === 'REJECTED' ? '#ef4444' :
                        '#f59e0b'
                    }}
                  />

                  {/* Step info */}
                  <div className="li-timeline-content">
                    <h4>{actionTypeMap[action.actionType] || action.actionType}</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                      <span 
                        className="li-status-badge"
                        style={{
                          background:
                            action.status === 'APPROVED' ? '#d1fae5' :
                            action.status === 'REJECTED' ? '#fee2e2' :
                            '#fef3c7',
                          color:
                            action.status === 'APPROVED' ? '#065f46' :
                            action.status === 'REJECTED' ? '#7c2d12' :
                            '#92400e',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {action.status}
                      </span>
                      {action.isDuplicate && (
                        <span 
                          className="li-duplicate-badge"
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ⚠️ Duplicate Screenshot
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand/collapse button */}
                  <button 
                    onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                    className="li-expand-btn"
                  >
                    {expandedAction === action.id ? '−' : '+'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* EXPANDED ACTION DETAILS */}
          {expandedAction && submission.actions && (
            (() => {
              const action = submission.actions.find(a => a.id === expandedAction);
              if (!action) return null;

              return (
                <section className="li-info-section li-action-details">
                  <h3>Review: {actionTypeMap[action.actionType] || action.actionType}</h3>
                  
                  {action.isDuplicate && (
                    <div style={{ 
                      background: '#fee2e2', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      marginBottom: '15px',
                      border: '2px solid #dc2626',
                      color: '#991b1b',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      🚫 <strong>System Alert: Duplicate.</strong> This screenshot matches a previously submitted image.
                    </div>
                  )}

                  <div className="li-action-screenshot" style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Screenshot Evidence</h4>
                    {action.screenshotUrl ? (
                      <img 
                        src={action.screenshotUrl} 
                        alt={`${action.actionType} screenshot`} 
                        className="li-screenshot-image"
                        onClick={() => window.open(action.screenshotUrl, '_blank')}
                        style={{ cursor: 'pointer' }}
                        title="Click to open in new tab"
                      />
                    ) : (
                      <div className="li-no-screenshot">No screenshot available</div>
                    )}
                  </div>

                  <div className="li-action-controls" style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleRejectAction(action.id)}
                      disabled={submitting || action.status !== 'PENDING'}
                      className="li-btn-reject"
                    >
                      {submitting ? 'Processing...' : 'Reject'}
                    </button>
                    <button 
                      onClick={() => handleApproveAction(action.id)}
                      disabled={submitting || action.status !== 'PENDING'}
                      className="li-btn-approve"
                    >
                      {submitting ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </section>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}