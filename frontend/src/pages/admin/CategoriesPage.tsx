import { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUsers,
  assignCategorySubAdmins, // <-- import the POST API
} from '../../api/admin.api';
import './categoriesPage.css';

/**
 * CategoriesPage.tsx
 * * FIXES APPLIED:
 * 1. Correct Sub-Admin Fetching: Uses getUsers({ role: 'sub_admin' }) matching UsersPage pattern.
 * 2. Response Normalization: Defensively handles { users: [] }, { results: [] }, or direct arrays.
 * 3. Case-Insensitive Filtering: Ensures role comparison is robust.
 * 4. Relationship Mapping: Correctly reads 'subAdminCategories' to display assigned users.
 * 5. Payload Validation: Includes 'subAdminIds' in the updateCategory call.
 * 6. Debugging: Added console.debug logs for data tracing.
 */

/* ----------------------------- Types ----------------------------------- */

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  config: {
    cooldownRules?: {
      cooldownDays?: number;
      dailyLimits?: {
        researcher?: number;
        inquirer?: number;
        auditor?: number;
      };
    };
  };
  subAdminCategories: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  metrics?: {
    totalResearchers?: number;
    totalInquirers?: number;
    totalAuditors?: number;
    approvalRate?: number;
    totalApprovedActions?: number;
  };
}

/* ----------------------------- Component ------------------------------- */

export default function CategoriesPage() {
  /* ---------- Data & Loading State ---------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [subAdmins, setSubAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /* ---------- UI State ---------- */
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  /* For sub-admin assignment UI */
  const [selectedSubAdminIds, setSelectedSubAdminIds] = useState<string[]>([]);
  const [subAdminQuery, setSubAdminQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  /* ---------- Lifecycle: Load Initial Data ---------- */
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([loadCategories(), loadSubAdmins()]);
      setLoading(false);
    };
    initPage();
  }, []);

  /* ---------- Load Functions ---------- */

  async function loadCategories() {
    try {
      const data = await getAdminCategories();
      const cats = Array.isArray(data) ? data : data?.categories ?? data;
      setCategories(cats || []);
      console.debug('[Categories] Categories loaded:', cats?.length);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  }

  async function loadSubAdmins() {
    try {
      // Step 1: Call getUsers with role filter matching UsersPage pattern
      const params = { role: 'sub_admin', limit: 100 };
      const data = await getUsers(params);
      
      console.debug('[Categories] Raw getUsers response:', data);

      // Step 2: Normalize response safely
      let usersList: User[] = [];
      if (data?.users && Array.isArray(data.users)) {
        usersList = data.users;
      } else if (data?.results && Array.isArray(data.results)) {
        usersList = data.results;
      } else if (Array.isArray(data)) {
        usersList = data;
      }

      // Step 3: Frontend Filter (Extra Safety)
      const filtered = usersList.filter((u) => {
        if (!u || !u.role) {
          console.debug('[Categories] User missing role:', u);
          return false;
        }
        return u.role.toLowerCase() === 'sub_admin';
      });

      console.debug('[Categories] Filtered sub-admins count:', filtered.length);
      setSubAdmins(filtered);
    } catch (err) {
      console.error('Failed to load sub-admins:', err);
      setSubAdmins([]);
    }
  }

  /* ---------- Search Filtering ---------- */

  const filteredCategories = categories.filter((cat) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (cat.name || '').toLowerCase().includes(q) ||
      (cat.id || '').toLowerCase().includes(q)
    );
  });

  const availableSubAdminsForSelection = subAdmins.filter((sa) => {
    const q = subAdminQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (sa.email || '').toLowerCase().includes(q) ||
      (sa.name || '').toLowerCase().includes(q)
    );
  });

  /* ---------- CRUD Handlers ---------- */

  const handleCreateCategory = async (payload: any) => {
    try {
      await createCategory(payload);
      await loadCategories();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Error creating category.');
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      setIsSaving(true);
      const formData = new FormData(e.currentTarget as HTMLFormElement);

      // PATCH payload: only category fields, NO subAdminIds
      const patchPayload = {
        name: (formData.get('name') as string).trim(),
        isActive: editingCategory.isActive,
        config: {
          cooldownRules: {
            cooldownDays: Number(formData.get('cooldownDays')),
            dailyLimits: {
              researcher: Number(formData.get('researcherLimit')),
              inquirer: Number(formData.get('inquirerLimit')),
              auditor: Number(formData.get('auditorLimit')),
            },
          },
        },
      };

      // Debug log for PATCH
      console.debug('[Categories] PATCH /categories/:id payload:', patchPayload);

      await updateCategory(editingCategory.id, patchPayload);

      // Only assign sub-admins if changed
      const prevIds = (editingCategory.subAdminCategories || []).map(sac => sac.userId).sort();
      const nextIds = [...selectedSubAdminIds].sort();
      const assignmentsChanged =
        prevIds.length !== nextIds.length ||
        prevIds.some((id, idx) => id !== nextIds[idx]);

      if (assignmentsChanged) {
        try {
          // Debug log for POST
          console.debug('[Categories] POST /categories/:id/sub-admins payload:', {
            categoryId: editingCategory.id,
            subAdminIds: selectedSubAdminIds,
          });
          await assignCategorySubAdmins(editingCategory.id, selectedSubAdminIds);
        } catch (err) {
          console.error('Failed to assign sub-admins:', err);
          alert('Category updated, but failed to assign sub-admins: ' + (err as any)?.message);
        }
      }

      await loadCategories();
      setEditingCategory(null);
      setSelectedSubAdminIds([]);
    } catch (err) {
      console.error('Failed to update category:', err);
      alert('Error updating category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  /* ---------- Selection Helpers ---------- */

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedCategories(filteredCategories.map((c) => c.id));
    else setSelectedCategories([]);
  };

  const toggleCategorySelection = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSubAdminId = (id: string) => {
    setSelectedSubAdminIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  /* ---------- Render Helpers ---------- */

  if (loading) return <div className="page-loader">Loading Categories...</div>;

  return (
    <div className="categories-container">
      {/* Header */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Categories</h1>
          <p>Manage system categories and sub-admin assignments.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export List</button>
          <button className="btn-add-category" onClick={() => setShowCreateModal(true)}>
            + Add Category
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="categories-stats-grid">
        <StatCard title="Total Categories" value={categories.length} />
        <StatCard title="Active" value={categories.filter(c => c.isActive).length} />
        <StatCard 
          title="Assigned Admins" 
          value={categories.reduce((acc, cat) => acc + (cat.subAdminCategories?.length || 0), 0)} 
        />
        <StatCard 
          title="Total Approved" 
          value={categories.reduce((acc, cat) => acc + (cat.metrics?.totalApprovedActions || 0), 0)} 
        />
      </section>

      {/* Management Bar */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className="btn-clear" onClick={() => setSearchTerm('')}>Clear</button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Name</th>
                <th>Status</th>
                <th>Assigned Sub-Admins</th>
                <th className="txt-center">Limits</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="cat-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategorySelection(cat.id)}
                    />
                  </td>
                  <td>
                    <div className="cat-info-cell">
                      <span className="cat-id">#{cat.id.slice(0, 8)}</span>
                      <strong className="cat-name">{cat.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${cat.isActive ? 'active' : 'inactive'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="subadmin-tags">
                      {/* Step 4: Display assigned sub-admins */}
                      {cat.subAdminCategories?.length ? (
                        cat.subAdminCategories.map((sac) => (
                          <span key={sac.userId} className="admin-tag">
                            {sac.user?.name || 'Unknown'}
                          </span>
                        ))
                      ) : (
                        <span className="no-admins">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="txt-center">
                    <div className="limit-info">
                      <span className="limit-val">
                        R:{cat.config?.cooldownRules?.dailyLimits?.researcher || 0} | 
                        I:{cat.config?.cooldownRules?.dailyLimits?.inquirer || 0} | 
                        A:{cat.config?.cooldownRules?.dailyLimits?.auditor || 0}
                      </span>
                      <span className="cooldown-val">{cat.config?.cooldownRules?.cooldownDays || 30}d Cooldown</span>
                    </div>
                  </td>
                  <td className="txt-right">
                    <div className="action-buttons">
                      <button
                        className="btn-icon-act edit"
                        onClick={() => {
                          setEditingCategory(cat);
                          // Prefill selected IDs from relationship
                          const assignedIds = cat.subAdminCategories?.map(sac => sac.userId) || [];
                          setSelectedSubAdminIds(assignedIds);
                          setSubAdminQuery('');
                        }}
                      >
                        Edit
                      </button>
                      <button className="btn-icon-act delete" onClick={() => handleDeleteCategory(cat.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Category</h2>
            <form onSubmit={handleEditCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" name="name" defaultValue={editingCategory.name} required />
              </div>

              <div className="form-group">
                <label>Cooldown (Days)</label>
                <input
                  type="number"
                  name="cooldownDays"
                  defaultValue={editingCategory.config?.cooldownRules?.cooldownDays ?? 30}
                  required
                />
              </div>

              <div className="limits-grid">
                <div className="limit-input">
                  <label>Researcher Limit</label>
                  <input
                    type="number"
                    name="researcherLimit"
                    defaultValue={editingCategory.config?.cooldownRules?.dailyLimits?.researcher ?? 0}
                    required
                  />
                </div>
                <div className="limit-input">
                  <label>Inquirer Limit</label>
                  <input
                    type="number"
                    name="inquirerLimit"
                    defaultValue={editingCategory.config?.cooldownRules?.dailyLimits?.inquirer ?? 0}
                    required
                  />
                </div>
                <div className="limit-input">
                  <label>Auditor Limit</label>
                  <input
                    type="number"
                    name="auditorLimit"
                    defaultValue={editingCategory.config?.cooldownRules?.dailyLimits?.auditor ?? 0}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Assign Sub-Admins</label>
                <p className="form-help">Select sub-admins who can manage this category.</p>
                
                <div className="subadmin-selector">
                  <input
                    type="text"
                    placeholder="Filter by name or email..."
                    value={subAdminQuery}
                    onChange={(e) => setSubAdminQuery(e.target.value)}
                  />
                  
                  <div className="subadmin-dropdown" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', marginTop: '5px' }}>
                    {availableSubAdminsForSelection.map((sa) => (
                      <div key={sa.id} className="subadmin-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                        <span>{sa.name} ({sa.email})</span>
                        <button
                          type="button"
                          className={`btn-small ${selectedSubAdminIds.includes(sa.id) ? 'selected' : ''}`}
                          onClick={() => toggleSubAdminId(sa.id)}
                        >
                          {selectedSubAdminIds.includes(sa.id) ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    ))}
                    {availableSubAdminsForSelection.length === 0 && (
                      <div style={{ padding: '8px', color: '#999' }}>No sub-admins found</div>
                    )}
                  </div>

                  <div className="selected-admins" style={{ marginTop: '10px' }}>
                    {selectedSubAdminIds.map((id) => {
                      const user = subAdmins.find(u => u.id === id);
                      return (
                        <span key={id} className="admin-tag">
                          {user?.name || id}
                          <button type="button" onClick={() => toggleSubAdminId(id)}>×</button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setEditingCategory(null)}>Cancel</button>
                <button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal (Minimal logic for brevity) */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Category</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleCreateCategory({
                name: fd.get('name'),
                config: { cooldownRules: { cooldownDays: 30, dailyLimits: { researcher: 100, inquirer: 50, auditor: 100 }}}
              });
            }}>
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" name="name" required />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}