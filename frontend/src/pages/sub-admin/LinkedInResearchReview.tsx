import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResearchTask, approveResearchTask, rejectResearchTask, flagResearchTask } from '../../api/subadmin.api';
import './SubAdminReview.css';

interface ResearchTask {
  id: string;
  targetId: string;
  categoryId: string;
  status: string;
  assignedToUserId: string;
  createdAt: string;
  targettype: string;
  contact?: {
    contactName?: string;
    contactLinkedinUrl?: string;
    country?: string;
    language?: string;
    researchSubmission?: {
      id?: string;
      screenshotPath?: string;
    };
  };
}

export const LinkedInResearchReview: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<ResearchTask | null>(null);
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

        const data = await getResearchTask(taskId);
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
      await approveResearchTask(taskId);
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
      await rejectResearchTask(taskId, rejectReason);
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
      await flagResearchTask(taskId);
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag task');
      setActionInProgress(false);
    }
  };

  if (loading) return <div className="loader">Loading task...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!task) return <div className="empty">Task not found</div>;

  const contactName = task.contact?.contactName || 'N/A';
  const contactLinkedinUrl = task.contact?.contactLinkedinUrl || 'N/A';
  const country = task.contact?.country || 'N/A';
  const language = task.contact?.language || 'N/A';
  const screenshotPath = task.contact?.researchSubmission?.screenshotPath;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'SUBMITTED':
        return 'status-flagged';
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
        <h2>LinkedIn Research Audit</h2>
        <span className={`badge ${getStatusColor(task.status)}`}>{task.status}</span>
      </div>

      <div className="review-split">
        {/* Left: Researcher Data */}
        <div className="review-side left-side">
          <h3>Research Data</h3>

          <div className="field-group">
            <label>Contact Name</label>
            <p>{contactName}</p>
          </div>

          <div className="field-group">
            <label>LinkedIn URL</label>
            {contactLinkedinUrl !== 'N/A' ? (
              <p>
                <a href={contactLinkedinUrl} target="_blank" rel="noopener noreferrer">
                  {contactLinkedinUrl}
                </a>
              </p>
            ) : (
              <p>{contactLinkedinUrl}</p>
            )}
          </div>

          <div className="field-group">
            <label>Country</label>
            <p>{country}</p>
          </div>

          <div className="field-group">
            <label>Language</label>
            <p>{language}</p>
          </div>

          <div className="field-group">
            <label>Task Status</label>
            <span className={`badge ${getStatusColor(task.status)}`}>{task.status}</span>
          </div>

          <div className="field-group">
            <label>Created Date</label>
            <p>{new Date(task.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Right: Evidence */}
        <div className="review-side right-side">
          <h3>Evidence</h3>

          {screenshotPath ? (
            <div className="screenshot-container">
              <img
                src={screenshotPath}
                alt="Research Evidence"
                className="screenshot-img"
                onClick={() => window.open(screenshotPath, '_blank')}
              />
              <p className="caption">Click to enlarge</p>
            </div>
          ) : (
            <div className="empty-evidence">
              <p>No evidence uploaded</p>
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

export default LinkedInResearchReview;
