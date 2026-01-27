import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import './adminDisapprovalReasons.css';

interface DisapprovalReason {
  id: string;
  description: string;
  reasonType: 'rejection' | 'flag';
  applicableRoles: string[];
  categoryIds: string[];
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

const AUDITOR_ROLES = [
  { value: 'website_inquirer_auditor', label: 'Website Inquirer Auditor' },
  { value: 'linkedin_inquirer_auditor', label: 'LinkedIn Inquirer Auditor' },
  { value: 'website_research_auditor', label: 'Website Research Auditor' },
  { value: 'linkedin_research_auditor', label: 'LinkedIn Research Auditor' },
];

export default function AdminDisapprovalReasonsPage() {
  const [reasons, setReasons] = useState<DisapprovalReason[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReason, setEditingReason] = useState<DisapprovalReason | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form state
  const [formDescription, setFormDescription] = useState('');
  const [formReasonType, setFormReasonType] = useState<'rejection' | 'flag'>('rejection');
  const [formApplicableRoles, setFormApplicableRoles] = useState<string[]>([]);
  const [formCategoryIds, setFormCategoryIds] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    loadCategories();
    loadReasons();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get('/admin/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadReasons = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRole) params.role = filterRole;
      if (filterType) params.reasonType = filterType;
      if (filterCategory) params.categoryId = filterCategory;

      const res = await axios.get('/admin/disapproval-reasons', { params });
      setReasons(res.data);
    } catch (err) {
      console.error('Failed to load reasons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(loadReasons, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterRole, filterType, filterCategory]);

  const openCreateModal = () => {
    setEditingReason(null);
    setFormDescription('');
    setFormReasonType('rejection');
    setFormApplicableRoles([]);
    setFormCategoryIds([]);
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (reason: DisapprovalReason) => {
    setEditingReason(reason);
    setFormDescription(reason.description);
    setFormReasonType(reason.reasonType);
    setFormApplicableRoles(reason.applicableRoles);
    setFormCategoryIds(reason.categoryIds);
    setFormIsActive(reason.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formDescription.trim()) {
      alert('Description is required');
      return;
    }
    if (formApplicableRoles.length === 0) {
      alert('Please select at least one auditor role');
      return;
    }

    const payload = {
      description: formDescription.trim(),
      reasonType: formReasonType,
      applicableRoles: formApplicableRoles,
      categoryIds: formCategoryIds,
      isActive: formIsActive,
    };

    try {
      if (editingReason) {
        await axios.patch(`/admin/disapproval-reasons/${editingReason.id}`, payload);
      } else {
        await axios.post('/admin/disapproval-reasons', payload);
      }

      setShowModal(false);
      loadReasons();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save disapproval reason');
    }
  };

  const handleDelete = async (reason: DisapprovalReason) => {
    if (!window.confirm(`Are you sure you want to delete "${reason.description}"?`)) {
      return;
    }

    try {
      await axios.delete(`/admin/disapproval-reasons/${reason.id}`);
      loadReasons();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete disapproval reason');
    }
  };

  const toggleRoleSelection = (role: string) => {
    setFormApplicableRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleCategorySelection = (categoryId: string) => {
    setFormCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const filteredReasons = reasons;

  return (
    <div className="admin-disapproval-container">
      <header className="page-header">
        <h1>Disapproval & Flag Reasons</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Create Reason
        </button>
      </header>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          {AUDITOR_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="rejection">Rejection</option>
          <option value="flag">Flag</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading reasons...</div>
      ) : (
        <table className="reasons-table">
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
            {filteredReasons.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No disapproval reasons found. Create one to get started.
                </td>
              </tr>
            ) : (
              filteredReasons.map((reason) => (
                <tr key={reason.id}>
                  <td>{reason.description}</td>
                  <td>
                    <span className={`type-badge type-${reason.reasonType}`}>
                      {reason.reasonType === 'rejection' ? 'Rejection' : 'Flag'}
                    </span>
                  </td>
                  <td>
                    {reason.applicableRoles.length > 0
                      ? reason.applicableRoles
                          .map((role) => AUDITOR_ROLES.find((r) => r.value === role)?.label || role)
                          .join(', ')
                      : 'None'}
                  </td>
                  <td>
                    {reason.categoryIds.length > 0
                      ? reason.categoryIds
                          .map((catId) => categories.find((c) => c.id === catId)?.name || catId)
                          .join(', ')
                      : 'Global (All)'}
                  </td>
                  <td>
                    <span className={`status-badge status-${reason.isActive ? 'active' : 'inactive'}`}>
                      {reason.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-edit" onClick={() => openEditModal(reason)}>
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(reason)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingReason ? 'Edit Disapproval Reason' : 'Create Disapproval Reason'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Description*</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter reason description..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason Type*</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input
                      type="radio"
                      checked={formReasonType === 'rejection'}
                      onChange={() => setFormReasonType('rejection')}
                    />
                    <span>Rejection</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      checked={formReasonType === 'flag'}
                      onChange={() => setFormReasonType('flag')}
                    />
                    <span>Flag</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Applicable Auditor Roles* (select at least one)</label>
                <div className="checkbox-group">
                  {AUDITOR_ROLES.map((role) => (
                    <label key={role.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formApplicableRoles.includes(role.value)}
                        onChange={() => toggleRoleSelection(role.value)}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Categories (leave empty for global access to all categories)</label>
                <div className="checkbox-group">
                  {categories.map((cat) => (
                    <label key={cat.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formCategoryIds.includes(cat.id)}
                        onChange={() => toggleCategorySelection(cat.id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <span>Active (visible to auditors)</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingReason ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
