import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminCRUD.css';

interface Category {
  id: string;
  name: string;
}

type DisapprovalReason = {
  id: string;
  description: string;
  reasonType: 'rejection' | 'flag';
  applicableRoles: string[];
  categoryIds: string[];
  isActive: boolean;
  createdAt: string;
};

const AUDITOR_ROLES = [
  { value: 'website_inquirer_auditor', label: 'Website Inquirer Auditor' },
  { value: 'linkedin_inquirer_auditor', label: 'LinkedIn Inquirer Auditor' },
  { value: 'website_research_auditor', label: 'Website Research Auditor' },
  { value: 'linkedin_research_auditor', label: 'LinkedIn Research Auditor' },
];

export default function SubAdminDisapprovalReasons(): JSX.Element {
  const [items, setItems] = useState<DisapprovalReason[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DisapprovalReason | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    reasonType: 'rejection' as 'rejection' | 'flag',
    applicableRoles: [] as string[],
    categoryIds: [] as string[],
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

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await client.get('/subadmin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadReasons();
    loadCategories();
  }, [loadReasons, loadCategories]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      description: '',
      reasonType: 'rejection',
      applicableRoles: [],
      categoryIds: [],
    });
    setShowModal(true);
  };

  const handleEdit = (item: DisapprovalReason) => {
    setEditingItem(item);
    setFormData({
      description: item.description,
      reasonType: item.reasonType,
      applicableRoles: item.applicableRoles,
      categoryIds: item.categoryIds,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.description.trim()) {
        alert('Description is required');
        return;
      }
      if (formData.applicableRoles.length === 0) {
        alert('Please select at least one auditor role');
        return;
      }

      const payload = {
        description: formData.description,
        reasonType: formData.reasonType,
        applicableRoles: formData.applicableRoles,
        categoryIds: formData.categoryIds,
      };

      if (editingItem) {
        await client.patch(`/subadmin/disapproval-reasons/${editingItem.id}`, payload);
      } else {
        await client.post('/subadmin/disapproval-reasons', payload);
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

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableRoles: prev.applicableRoles.includes(role)
        ? prev.applicableRoles.filter((r) => r !== role)
        : [...prev.applicableRoles, role],
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((c) => c !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
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
                  <th>Description</th>
                  <th>Type</th>
                  <th>Applicable Roles</th>
                  <th>Categories</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={!item.isActive ? 'inactive-row' : ''}>
                    <td className="font-semibold">{item.description}</td>
                    <td>
                      <span className={`badge-pill type-${item.reasonType}`}>
                        {item.reasonType === 'rejection' ? 'Rejection' : 'Flag'}
                      </span>
                    </td>
                    <td>
                      {item.applicableRoles.length > 0
                        ? item.applicableRoles
                            .map((role) => AUDITOR_ROLES.find((r) => r.value === role)?.label || role)
                            .join(', ')
                        : 'None'}
                    </td>
                    <td>
                      {item.categoryIds.length > 0
                        ? item.categoryIds
                            .map((catId) => categories.find((c) => c.id === catId)?.name || catId)
                            .join(', ')
                        : 'All'}
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
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                  placeholder="Enter reason description..."
                />
              </div>
              <div className="form-group">
                <label>Reason Type *</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      checked={formData.reasonType === 'rejection'}
                      onChange={() => setFormData({ ...formData, reasonType: 'rejection' })}
                    />
                    <span>Rejection</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      checked={formData.reasonType === 'flag'}
                      onChange={() => setFormData({ ...formData, reasonType: 'flag' })}
                    />
                    <span>Flag</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Applicable Auditor Roles * (select at least one)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {AUDITOR_ROLES.map((role) => (
                    <label key={role.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.applicableRoles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Categories (leave empty for global access)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {categories.map((cat) => (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
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