import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminCRUD.css';
import './SubAdminNotices.css';

type Notice = {
  id: string;
  title: string;
  message: string;
  targetRole: string;
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
  expiresAt?: string | null;
  active: boolean;
};

export default function SubAdminNotices(): JSX.Element {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: 'all',
    priority: 'normal' as 'high' | 'normal' | 'low',
  });

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/notices');
      setNotices(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error('fetchNotices error', e);
      setError(e.message || 'Failed to load notices');
      setNotices(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreate = () => {
    setFormData({
      title: '',
      message: '',
      targetRole: 'all',
      priority: 'normal',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For now, this is frontend-only
      // Backend implementation can be added later
      alert(`Notice would be sent to: ${formData.targetRole}\n\nTitle: ${formData.title}\n\nMessage: ${formData.message}`);
      setShowModal(false);
      fetchNotices();
    } catch (err: any) {
      alert('Failed to send notice');
    }
  };

  return (
    <div className="subadmin-notices">
      <header className="sa-page-header">
        <div>
          <h2>Notices & Announcements</h2>
          <p className="muted">
            Send notices to specific roles or all users in your categories
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Create Notice
        </button>
      </header>

      <main className="sa-main">
        {loading && <div className="loading-state">Loading notices…</div>}
        {error && <div className="error-message">Error: {error}</div>}

        {!loading && !error && notices && notices.length === 0 && (
          <div className="empty-state">
            <p>There are no active notices at this time.</p>
            <button className="btn-primary" onClick={handleCreate}>
              Create First Notice
            </button>
          </div>
        )}

        {!loading && !error && notices && notices.length > 0 && (
          <ul className="notice-list">
            {notices.map((n) => (
              <li key={n.id} className={`notice-item priority-${n.priority}`}>
                <div className="notice-header">
                  <div>
                    <h3>{n.title}</h3>
                    <span className="notice-target">To: {n.targetRole}</span>
                  </div>
                  <span className={`badge priority-${n.priority}`}>
                    {n.priority.toUpperCase()}
                  </span>
                </div>

                <p className="notice-message">{n.message}</p>

                <div className="notice-meta">
                  <span>
                    Created: {new Date(n.createdAt).toLocaleString()}
                  </span>
                  {n.expiresAt && (
                    <span>
                      Expires: {new Date(n.expiresAt).toLocaleString()}
                    </span>
                  )}
                  <span className={n.active ? 'status-active' : 'status-inactive'}>
                    {n.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Create Notice</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Notice title"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  required
                  placeholder="Notice message..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="targetRole">Send To *</label>
                  <select
                    id="targetRole"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    required
                  >
                    <option value="all">All Roles</option>
                    <option value="researcher">Researchers</option>
                    <option value="inquirer">Inquirers</option>
                    <option value="auditor">Auditors</option>
                    <option value="website_researcher">Website Researchers</option>
                    <option value="linkedin_researcher">LinkedIn Researchers</option>
                    <option value="website_inquirer">Website Inquirers</option>
                    <option value="linkedin_inquirer">LinkedIn Inquirers</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as 'high' | 'normal' | 'low' })
                    }
                    required
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

