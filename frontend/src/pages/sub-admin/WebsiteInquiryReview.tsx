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
    companyName?: string;
    email?: string;
    phone?: string;
    industry?: string;
  };
  inquiry_actions?: InquiryAction[];
  inquiry_submission_snapshots?: InquirySnapshot[];
}

export const WebsiteInquiryReview: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<InquiryTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

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

  const companyName = task.contact?.companyName || 'N/A';
  const email = task.contact?.email || 'N/A';
  const phone = task.contact?.phone || 'N/A';
  const industry = task.contact?.industry || 'N/A';
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

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'COMPLETED':
      case 'SUCCESS':
        return 'status-approved';
      case 'FAILED':
      case 'ERROR':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="review-page">
      <div className="review-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Website Inquiry Audit</h2>
        <span className={`badge ${getStatusColor(task.status)}`}>{task.status}</span>
      </div>

      <div className="review-split">
        {/* Left: Inquiry Actions */}
        <div className="review-side left-side">
          <h3>Inquiry Actions</h3>

          {actions.length > 0 ? (
            <div>
              {actions.map((action) => (
                <div key={action.id} className="field-group" style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '12px' }}>
                  <label>{action.actionType}</label>
                  <p>Status: <span className={`badge ${getActionStatusColor(action.status)}`}>{action.status}</span></p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {new Date(action.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-evidence">
              <p>No actions recorded</p>
            </div>
          )}

          <div className="field-group" style={{ marginTop: '24px' }}>
            <label>Target Information</label>
            <p><strong>Company:</strong> {companyName}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Industry:</strong> {industry}</p>
          </div>

          <div className="field-group">
            <label>Created Date</label>
            <p>{new Date(task.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Right: Submission Snapshots */}
        <div className="review-side right-side">
          <h3>Submission Evidence</h3>

          {snapshots.length > 0 ? (
            <div>
              {snapshots.map((snapshot, idx) => (
                <div key={snapshot.id} className="field-group" style={{ borderLeft: '3px solid #10b981', paddingLeft: '12px' }}>
                  <label>Snapshot {idx + 1}</label>
                  {snapshot.screenshot_path ? (
                    <img
                      src={snapshot.screenshot_path}
                      alt={`Snapshot ${idx + 1}`}
                      className="screenshot-img"
                      onClick={() => window.open(snapshot.screenshot_path, '_blank')}
                    />
                  ) : (
                    <div className="empty-evidence">
                      <p>No screenshot</p>
                    </div>
                  )}
                  {snapshot.message_content && (
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px', fontStyle: 'italic' }}>
                      "{snapshot.message_content}"
                    </p>
                  )}
                  {snapshot.is_duplicate && (
                    <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, marginTop: '4px' }}>
                      ⚠ Marked as Duplicate
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    {new Date(snapshot.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-evidence">
              <p>No submission snapshots</p>
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

export default WebsiteInquiryReview;
