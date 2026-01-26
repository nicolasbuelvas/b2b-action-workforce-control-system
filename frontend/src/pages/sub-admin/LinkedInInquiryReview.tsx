import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInquiryTask, approveInquiryTask, rejectInquiryTask, flagInquiryTask } from '../../api/subadmin.api';
import './SubAdminReview.css';

interface InquiryAction {
  id: string;
  actionType: string;
  status: string;
  created_at: string;
}

interface InquirySnapshot {
  id: string;
  screenshot_path?: string;
  is_duplicate: boolean;
  message_content?: string;
  created_at: string;
}

interface InquiryTask {
  id: string;
  targetId: string;
  categoryId: string;
  status: string;
  assignedToUserId: string;
  createdAt: string;
  targettype: string;
  contact?: {
    profileName?: string;
    profileUrl?: string;
    country?: string;
  };
  inquiry_actions?: InquiryAction[];
  inquiry_submission_snapshots?: InquirySnapshot[];
}

// LinkedIn inquiry strict 3-step flow: OUTREACH → ASK_FOR_EMAIL → SEND_CATALOGUE
const LINKEDIN_STEPS = ['OUTREACH', 'ASK_FOR_EMAIL', 'SEND_CATALOGUE'];

export const LinkedInInquiryReview: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<InquiryTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [stepValidation, setStepValidation] = useState<{ [key: string]: { completed: boolean; blocked: boolean; email_not_required: boolean } }>({});

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (!taskId) {
          setError('Task ID not provided');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const data = await getInquiryTask(taskId);
        setTask(data);
        validateSteps(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const validateSteps = (taskData: InquiryTask) => {
    const actions = taskData.inquiry_actions || [];
    const validation: { [key: string]: { completed: boolean; blocked: boolean; email_not_required: boolean } } = {};
    let emailFound = false;

    LINKEDIN_STEPS.forEach((step, index) => {
      const action = actions.find((a) => a.actionType === step);
      const isCompleted = action && (action.status === 'COMPLETED' || action.status === 'SUCCESS');

      const prevStep = index > 0 ? LINKEDIN_STEPS[index - 1] : undefined;
      const prevCompleted = prevStep ? (validation[prevStep]?.completed || false) : true;

      validation[step] = {
        completed: isCompleted,
        blocked: index > 0 && !prevCompleted,
        email_not_required: step === 'SEND_CATALOGUE' && emailFound,
      };

      if (step === 'ASK_FOR_EMAIL' && isCompleted) {
        const snapshot = taskData.inquiry_submission_snapshots?.find(
          (s) => s.created_at >= (action?.created_at || '')
        );
        emailFound = snapshot?.message_content?.toLowerCase().includes('email') || false;
      }
    });

    setStepValidation(validation);
  };

  const handleApprove = async () => {
    if (!taskId) return;
    try {
      setActionInProgress(true);
      await approveInquiryTask(taskId);
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve task');
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!taskId) return;
    try {
      setActionInProgress(true);
      await rejectInquiryTask(taskId, rejectReason);
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject task');
      setActionInProgress(false);
    }
  };

  const handleFlag = async () => {
    if (!taskId) return;
    try {
      setActionInProgress(true);
      await flagInquiryTask(taskId);
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag task');
      setActionInProgress(false);
    }
  };

  if (loading) return <div className="loader">Loading task...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!task) return <div className="empty">Task not found</div>;

  const profileName = task.contact?.profileName || 'N/A';
  const profileUrl = task.contact?.profileUrl || 'N/A';
  const country = task.contact?.country || 'N/A';
  const actions = task.inquiry_actions || [];
  const snapshots = task.inquiry_submission_snapshots || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
      case 'COMPLETED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'FLAGGED':
        return 'status-flagged';
      default:
        return 'status-pending';
    }
  };

  const getStepColor = (step: string) => {
    const validation = stepValidation[step];
    if (!validation) return 'status-pending';
    if (validation.completed) return 'status-approved';
    if (validation.blocked) return 'status-rejected';
    return 'status-pending';
  };

  const renderStepIndicator = (step: string, index: number) => {
    const validation = stepValidation[step];
    let icon = '○';
    let color = 'status-pending';

    if (validation?.completed) {
      icon = '✓';
      color = 'status-approved';
    } else if (validation?.blocked) {
      icon = '✗';
      color = 'status-rejected';
    }

    return (
      <div key={step} style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className={`badge ${color}`}>{icon} STEP {index + 1}</span>
          <strong>{step}</strong>
        </div>

        {validation?.blocked && (
          <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, marginLeft: '32px' }}>
            ⚠ Blocked - Previous step must be completed first
          </p>
        )}

        {validation?.email_not_required && (
          <p style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginLeft: '32px' }}>
            ℹ Email not provided, can proceed to catalogue step
          </p>
        )}

        {!validation?.blocked && !validation?.completed && (
          <p style={{ fontSize: '12px', color: '#64748b', marginLeft: '32px' }}>
            Awaiting completion...
          </p>
        )}

        {validation?.completed && (
          <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginLeft: '32px' }}>
            ✓ Completed
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="review-page">
      <div className="review-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>LinkedIn Inquiry Audit</h2>
        <span className={`badge ${getStatusColor(task.status)}`}>{task.status}</span>
      </div>

      <div className="review-split">
        {/* Left: LinkedIn 3-Step Flow */}
        <div className="review-side left-side">
          <h3>LinkedIn Inquiry Flow (Strict 3-Step)</h3>

          <div style={{ marginBottom: '24px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#166534', fontWeight: 600 }}>
              Required Workflow:
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#166534' }}>
              OUTREACH → ASK_FOR_EMAIL → SEND_CATALOGUE (Steps cannot be skipped)
            </p>
          </div>

          {LINKEDIN_STEPS.map((step, index) => renderStepIndicator(step, index))}

          <div className="field-group" style={{ marginTop: '24px' }}>
            <label>Profile Information</label>
            <p><strong>Name:</strong> {profileName}</p>
            {profileUrl !== 'N/A' ? (
              <p><strong>URL:</strong> <a href={profileUrl} target="_blank" rel="noopener noreferrer">{profileUrl}</a></p>
            ) : (
              <p><strong>URL:</strong> {profileUrl}</p>
            )}
            <p><strong>Country:</strong> {country}</p>
          </div>

          <div className="field-group">
            <label>Created Date</label>
            <p>{new Date(task.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Right: Action Details & Snapshots */}
        <div className="review-side right-side">
          <h3>Action Details & Evidence</h3>

          {actions.length > 0 ? (
            <div>
              {actions.map((action, idx) => {
                const relatedSnapshots = snapshots.filter(
                  (s) => new Date(s.created_at) >= new Date(action.created_at)
                );
                return (
                  <div key={action.id} style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong>{action.actionType}</strong>
                      <span className={`badge ${getStatusColor(action.status)}`}>{action.status}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0' }}>
                      {new Date(action.created_at).toLocaleString()}
                    </p>

                    {relatedSnapshots.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        {relatedSnapshots.map((snapshot, sidx) => (
                          <div key={snapshot.id} style={{ marginBottom: '8px' }}>
                            {snapshot.screenshot_path && (
                              <img
                                src={snapshot.screenshot_path}
                                alt={`${action.actionType} snapshot ${sidx + 1}`}
                                className="screenshot-img"
                                onClick={() => window.open(snapshot.screenshot_path, '_blank')}
                                style={{ marginBottom: '8px' }}
                              />
                            )}
                            {snapshot.message_content && (
                              <p style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', margin: '4px 0' }}>
                                "{snapshot.message_content}"
                              </p>
                            )}
                            {snapshot.is_duplicate && (
                              <p style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                                ⚠ Duplicate detected
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-evidence">
              <p>No actions recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="review-footer">
        <div className="actions">
          <button
            className="btn-approve"
            onClick={handleApprove}
            disabled={actionInProgress}
          >
            ✓ Approve
          </button>
          <button
            className="btn-reject"
            onClick={() => setShowRejectModal(true)}
            disabled={actionInProgress}
          >
            ✗ Reject
          </button>
          <button
            className="btn-reject"
            onClick={handleFlag}
            disabled={actionInProgress}
            style={{ background: '#f59e0b' }}
          >
            ⚠ Flag for Review
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Task</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              Please provide a reason for rejection:
            </p>
            <textarea
              className="reject-textarea"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <div className="modal-actions">
              <button
                className="btn-confirm"
                onClick={handleReject}
                disabled={actionInProgress || !rejectReason.trim()}
              >
                Confirm Rejection
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={actionInProgress}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInInquiryReview;
