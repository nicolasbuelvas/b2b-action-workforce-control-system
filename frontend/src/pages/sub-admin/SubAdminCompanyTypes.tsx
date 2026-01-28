import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import './SubAdminCRUD.css';

interface CompanyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SubAdminCompanyTypes(): JSX.Element {
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CompanyType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCompanyTypes();
  }, []);

  const loadCompanyTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/subadmin/company-types');
      setCompanyTypes(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load company types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (item: CompanyType) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.patch(`/subadmin/company-types/${editingItem.id}`, formData);
      } else {
        await axios.post('/subadmin/company-types', formData);
      }
      setShowModal(false);
      loadCompanyTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save company type');
    }
  };

  const handleToggleActive = async (item: CompanyType) => {
    try {
      await axios.patch(`/subadmin/company-types/${item.id}`, { isActive: !item.isActive });
      loadCompanyTypes();
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (item: CompanyType) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await axios.delete(`/subadmin/company-types/${item.id}`);
      loadCompanyTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete company type');
    }
  };

  return (
    <div className="sa-crud-page">
      <header className="sa-page-header">
        <div>
          <h2>Company Types</h2>
          <p className="muted">Manage company type categories for task creation</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Company Type
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
                {companyTypes.map((item) => (
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
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {companyTypes.length === 0 && (
              <div className="empty-state">
                <p>No company types created yet.</p>
                <button className="btn-primary" onClick={handleCreate}>
                  Create First Company Type
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Edit Company Type' : 'Create Company Type'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Solar Lighting EPC, SaaS, Manufacturing"
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
