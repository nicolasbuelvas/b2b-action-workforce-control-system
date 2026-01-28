import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import './adminDisapprovalReasons.css';

interface CompanyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCompanyTypesPage() {
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CompanyType | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadCompanyTypes();
  }, []);

  const loadCompanyTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/company-types');
      setCompanyTypes(res.data || []);
    } catch (err) {
      console.error('Failed to load company types:', err);
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

  const openEditModal = (item: CompanyType) => {
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
        await axios.patch(`/admin/company-types/${editingItem.id}`, payload);
      } else {
        await axios.post('/admin/company-types', payload);
      }

      setShowModal(false);
      loadCompanyTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save company type');
    }
  };

  const handleDelete = async (item: CompanyType) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await axios.delete(`/admin/company-types/${item.id}`);
      loadCompanyTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete company type');
    }
  };

  const handleToggleActive = async (item: CompanyType) => {
    try {
      await axios.patch(`/admin/company-types/${item.id}`, {
        isActive: !item.isActive,
      });
      loadCompanyTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to toggle active status');
    }
  };

  return (
    <div className="sa-crud-page">
      <div className="sa-page-header">
        <h1>Company Types</h1>
        <button className="btn-create" onClick={openCreateModal}>
          + Create Company Type
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && companyTypes.length === 0 && (
        <p className="empty-state">No company types found. Create one to get started.</p>
      )}

      {!loading && companyTypes.length > 0 && (
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
            <h2>{editingItem ? 'Edit Company Type' : 'Create Company Type'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Solar Lighting EPC, SaaS, Manufacturing"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this company type..."
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
