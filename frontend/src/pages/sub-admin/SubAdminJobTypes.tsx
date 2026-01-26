import React, { useState, useEffect } from 'react';
import { client } from '../../api/client';
import './SubAdminCRUD.css';

interface JobType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SubAdminJobTypes(): JSX.Element {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<JobType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadJobTypes();
  }, []);

  const loadJobTypes = async () => {
    try {
      setLoading(true);
      const response = await client.get('/subadmin/job-types');
      setJobTypes(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load job types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (item: JobType) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await client.patch(`/subadmin/job-types/${editingItem.id}`, formData);
      } else {
        await client.post('/subadmin/job-types', formData);
      }
      setShowModal(false);
      loadJobTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save job type');
    }
  };

  const handleToggleActive = async (item: JobType) => {
    try {
      await client.patch(`/subadmin/job-types/${item.id}`, { isActive: !item.isActive });
      loadJobTypes();
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="sa-crud-page">
      <header className="sa-page-header">
        <div>
          <h2>Job Types</h2>
          <p className="muted">Manage job title categories for task creation</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Job Type
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
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobTypes.map((item) => (
                  <tr key={item.id} className={!item.isActive ? 'inactive-row' : ''}>
                    <td className="font-semibold">{item.name}</td>
                    <td>{item.description || '—'}</td>
                    <td>
                      <span className={`status-badge ${item.isActive ? 'status-active' : 'status-inactive'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-sm btn-secondary" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button className="btn-sm btn-outline" onClick={() => handleToggleActive(item)}>
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {jobTypes.length === 0 && (
              <div className="empty-state">
                <p>No job types created yet.</p>
                <button className="btn-primary" onClick={handleCreate}>
                  Create First Job Type
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Edit Job Type' : 'Create Job Type'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., CEO, Project Manager, Engineering Manager"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Optional description"
                />
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
