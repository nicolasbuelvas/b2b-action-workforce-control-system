import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminCRUD.css';

type DisapprovalReason = {
  id: string;
  reason: string;
  description: string;
  applicableTo: 'research' | 'inquiry' | 'both';
  isActive: boolean;
  createdAt: string;
};

export default function SubAdminDisapprovalReasons(): JSX.Element {
  const [items, setItems] = useState<DisapprovalReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DisapprovalReason | null>(null);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    applicableTo: 'both' as 'research' | 'inquiry' | 'both',
  });

  const loadReasons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/disapproval-reasons');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load reasons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReasons();
  }, [loadReasons]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ reason: '', description: '', applicableTo: 'both' });
    setShowModal(true);
  };

  const handleEdit = (item: DisapprovalReason) => {
    setEditingItem(item);
    setFormData({
      reason: item.reason,
      description: item.description || '',
      applicableTo: item.applicableTo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await client.patch(`/subadmin/disapproval-reasons/${editingItem.id}`, formData);
      } else {
        await client.post('/subadmin/disapproval-reasons', formData);
      }
      setShowModal(false);
      loadReasons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save disapproval reason');
    }
  };

  const toggleActive = async (item: DisapprovalReason) => {
    try {
      await client.patch(`/subadmin/disapproval-reasons/${item.id}`, {
        isActive: !item.isActive,
      });
      loadReasons();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  return (
    <div className="sa-crud-page">
      <header className="sa-page-header">
        <div>
          <h2>Disapproval Reasons</h2>
          <p className="muted">
            Manage reasons used by auditors when rejecting submissions
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Reason
        </button>
      </header>

      <main className="sa-main">
        {loading && <div className="loading-state">Loading...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Description</th>
                  <th>Applicable To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={!item.isActive ? 'inactive-row' : ''}>
                    <td className="font-semibold">{item.reason}</td>
                    <td>{item.description || '—'}</td>
                    <td>
                      <span className="badge-pill">{item.applicableTo}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${item.isActive ? 'status-active' : 'status-inactive'}`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-sm btn-secondary" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button className="btn-sm btn-outline" onClick={() => toggleActive(item)}>
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className="empty-state">
                <p>No disapproval reasons created yet.</p>
                <button className="btn-primary" onClick={handleCreate}>
                  Create First Reason
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Edit Disapproval Reason' : 'Create Disapproval Reason'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="reason">Reason *</label>
                <input
                  type="text"
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  placeholder="e.g., Incomplete Information, Invalid URL"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed explanation for auditors"
                />
              </div>
              <div className="form-group">
                <label htmlFor="applicableTo">Applicable To *</label>
                <select
                  id="applicableTo"
                  value={formData.applicableTo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicableTo: e.target.value as 'research' | 'inquiry' | 'both',
                    })
                  }
                  required
                >
                  <option value="both">Both Research & Inquiry</option>
                  <option value="research">Research Only</option>
                  <option value="inquiry">Inquiry Only</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}