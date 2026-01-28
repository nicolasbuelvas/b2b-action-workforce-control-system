import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import './adminDisapprovalReasons.css';

interface JobType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminJobTypesPage() {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<JobType | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadJobTypes();
  }, []);

  const loadJobTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/job-types');
      setJobTypes(res.data || []);
    } catch (err) {
      console.error('Failed to load job types:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDescription('');
    setShowModal(true);
  };

  const openEditModal = (item: JobType) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert('Name is required');
      return;
    }

    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
      };

      if (editingItem) {
        await axios.patch(`/admin/job-types/${editingItem.id}`, payload);
      } else {
        await axios.post('/admin/job-types', payload);
      }

      setShowModal(false);
      loadJobTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save job type');
    }
  };

  const handleDelete = async (item: JobType) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await axios.delete(`/admin/job-types/${item.id}`);
      loadJobTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete job type');
    }
  };

  const handleToggleActive = async (item: JobType) => {
    try {
      await axios.patch(`/admin/job-types/${item.id}`, {
        isActive: !item.isActive,
      });
      loadJobTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to toggle active status');
    }
  };

  return (
    <div className="sa-crud-page">
      <div className="sa-page-header">
        <h1>Job Types</h1>
        <button className="btn-create" onClick={openCreateModal}>
          + Create Job Type
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && jobTypes.length === 0 && (
        <p className="empty-state">No job types found. Create one to get started.</p>
      )}

      {!loading && jobTypes.length > 0 && (
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
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td>{item.description || '—'}</td>
                <td>
                  <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => openEditModal(item)}>
                    Edit
                  </button>
                  <button
                    className={`btn-toggle ${item.isActive ? 'deactivate' : 'activate'}`}
                    onClick={() => handleToggleActive(item)}
                  >
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(item)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Job Type' : 'Create Job Type'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. CEO, Project Manager, Engineering Manager"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this job type..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
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
