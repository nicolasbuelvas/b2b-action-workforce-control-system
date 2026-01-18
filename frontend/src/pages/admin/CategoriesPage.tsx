import { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import { getAdminCategories, createCategory, updateCategory, deleteCategory, getUsers } from '../../api/admin.api';
import './categoriesPage.css';

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  config: {
    cooldownRules: {
      cooldownDays: number;
      dailyLimits: {
        researcher: number;
        inquirer: number;
        auditor: number;
      };
    };
  };
  subAdminCategories: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  metrics?: {
    totalResearchers: number;
    totalInquirers: number;
    totalAuditors: number;
    approvalRate: number;
    totalApprovedActions: number;
  };
}

interface SubAdmin {
  id: string;
  name: string;
  email: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedSubAdmins, setSelectedSubAdmins] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
    loadSubAdmins();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubAdmins = async () => {
    try {
      const data = await getUsers({ role: 'SUB_ADMIN' });
      setSubAdmins(data.users || []);
    } catch (error) {
      console.error('Failed to load sub-admins:', error);
    }
  };

  const handleCreateCategory = async (data: { name: string; config: { cooldownRules: { cooldownDays: number; dailyLimits: { researcher: number; inquirer: number; auditor: number } } } }) => {
    try {
      await createCategory(data);
      await loadCategories();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleEditCategory = async (category: Category) => {
    try {
      await updateCategory(category.id, category);
      await loadCategories();
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleBulkActivate = async () => {
    // TODO: implement
  };

  const handleBulkDeactivate = async () => {
    // TODO: implement
  };

  const handleBulkDelete = async () => {
    // TODO: implement
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSubAdmins = categories.reduce((acc, cat) => acc + cat.subAdminCategories.length, 0);
  const activeCategories = categories.filter(cat => cat.isActive).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(filteredCategories.map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  if (loading) return <div className="page-loader">Loading Categories...</div>;

  return (
    <div className="categories-container">
      {/* HEADER */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Categories</h1>
          <p>Manage system categories, target links, and cooldown rules.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export List</button>
          <button className="btn-add-category" onClick={() => setShowCreateModal(true)}>+ Add Category</button>
        </div>
      </header>

      {/* STATS SUMMARY */}
      <section className="categories-stats-grid">
        <StatCard title="Total Categories" value={categories.length} />
        <StatCard title="Active Categories" value={activeCategories} />
        <StatCard title="Sub-Admin Assigned" value={totalSubAdmins} />
        <StatCard title="Total Approved Actions" value={categories.reduce((acc, cat) => acc + (cat.metrics?.totalApprovedActions || 0), 0)} />
      </section>

      {/* MANAGEMENT BAR */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by category name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select><option>Status: All</option></select>
          <button className="btn-clear">Clear</button>
        </div>
        {selectedCategories.length > 0 && (
          <div className="bulk-actions">
            <button className="btn-bulk" onClick={handleBulkActivate}>Activate Selected</button>
            <button className="btn-bulk" onClick={handleBulkDeactivate}>Deactivate Selected</button>
            <button className="btn-bulk delete" onClick={handleBulkDelete}>Delete Selected</button>
          </div>
        )}
      </div>

      {/* CATEGORIES TABLE */}
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
                <th>ID & Name</th>
                <th>Status</th>
                <th>Assigned Sub-Admins</th>
                <th className="txt-center">Researchers</th>
                <th className="txt-center">Inquirers</th>
                <th className="txt-center">Auditors</th>
                <th>Approval Rate</th>
                <th>Limits / Cooldown</th>
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
                      onChange={(e) => handleSelectCategory(cat.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className="cat-info-cell">
                      <span className="cat-id">{cat.id.slice(0, 8)}</span>
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
                      {cat.subAdminCategories.length > 0 ? (
                        cat.subAdminCategories.slice(0, 2).map(sac => (
                          <span key={sac.user.id} className="admin-tag" title={sac.user.email}>
                            {sac.user.name}
                          </span>
                        ))
                      ) : (
                        <span className="no-admins">Unassigned</span>
                      )}
                      {cat.subAdminCategories.length > 2 && (
                        <span className="admin-tag">+{cat.subAdminCategories.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{cat.metrics?.totalResearchers || 0}</span>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{cat.metrics?.totalInquirers || 0}</span>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{cat.metrics?.totalAuditors || 0}</span>
                  </td>
                  <td>
                    <span className="approval-rate">{cat.metrics?.approvalRate || 0}%</span>
                  </td>
                  <td>
                    <div className="limit-info">
                      <span className="limit-val" title="Daily Limits">
                        R: {cat.config.cooldownRules?.dailyLimits?.researcher || 0} | I: {cat.config.cooldownRules?.dailyLimits?.inquirer || 0} | A: {cat.config.cooldownRules?.dailyLimits?.auditor || 0}
                      </span>
                      <span className="cooldown-val" title="Cooldown Days">{cat.config.cooldownRules?.cooldownDays || 30}d Cooldown</span>
                    </div>
                  </td>
                  <td className="txt-right">
                    <div className="action-buttons">
                      <button className="btn-icon-act edit" onClick={() => {
                        setEditingCategory(cat);
                        setSelectedSubAdmins(cat.subAdminCategories.map(sac => sac.user.id));
                      }}>Edit</button>
                      <button className="btn-icon-act delete" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Category</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = {
                name: formData.get('name') as string,
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
              handleCreateCategory(data);
            }}>
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" name="name" required />
              </div>
              <div className="form-group">
                <label>Cooldown (Days before same company can be contacted again)</label>
                <input type="number" name="cooldownDays" defaultValue={30} required />
              </div>
              <div className="form-group">
                <label>Daily Limit (Max approved actions per day)</label>
                <div className="limits-grid">
                  <div className="limit-input">
                    <label>Researcher</label>
                    <input type="number" name="researcherLimit" defaultValue={200} required />
                  </div>
                  <div className="limit-input">
                    <label>Inquirer</label>
                    <input type="number" name="inquirerLimit" defaultValue={50} required />
                  </div>
                  <div className="limit-input">
                    <label>Auditor</label>
                    <input type="number" name="auditorLimit" defaultValue={300} required />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Category</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedCategory = {
                ...editingCategory,
                name: formData.get('name') as string,
                config: {
                  ...editingCategory.config,
                  cooldownRules: {
                    ...editingCategory.config.cooldownRules,
                    cooldownDays: Number(formData.get('cooldownDays')),
                    dailyLimits: {
                      researcher: Number(formData.get('researcherLimit')),
                      inquirer: Number(formData.get('inquirerLimit')),
                      auditor: Number(formData.get('auditorLimit')),
                    },
                  },
                },
                subAdminIds: selectedSubAdmins,
              };
              handleEditCategory(updatedCategory);
            }}>
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" name="name" defaultValue={editingCategory.name} required />
              </div>
              <div className="form-group">
                <label>Cooldown (Days before same company can be contacted again)</label>
                <input type="number" name="cooldownDays" defaultValue={editingCategory.config.cooldownRules?.cooldownDays || 30} required />
              </div>
              <div className="form-group">
                <label>Daily Limit (Max approved actions per day)</label>
                <div className="limits-grid">
                  <div className="limit-input">
                    <label>Researcher</label>
                    <input type="number" name="researcherLimit" defaultValue={editingCategory.config.cooldownRules?.dailyLimits?.researcher || 200} required />
                  </div>
                  <div className="limit-input">
                    <label>Inquirer</label>
                    <input type="number" name="inquirerLimit" defaultValue={editingCategory.config.cooldownRules?.dailyLimits?.inquirer || 50} required />
                  </div>
                  <div className="limit-input">
                    <label>Auditor</label>
                    <input type="number" name="auditorLimit" defaultValue={editingCategory.config.cooldownRules?.dailyLimits?.auditor || 300} required />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Permissions & Scope</label>
                <p className="form-help">Assign Sub-Admins to restrict category access. Leave empty for global access.</p>
                <div className="subadmin-selector">
                  <input
                    type="text"
                    placeholder="Search Sub-Admins..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          const admin = subAdmins.find(sa => sa.name.toLowerCase().includes(value.toLowerCase()) || sa.email.toLowerCase().includes(value.toLowerCase()));
                          if (admin && !selectedSubAdmins.includes(admin.id)) {
                            setSelectedSubAdmins([...selectedSubAdmins, admin.id]);
                          }
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <div className="selected-admins">
                    {selectedSubAdmins.map(id => {
                      const admin = subAdmins.find(sa => sa.id === id);
                      return admin ? (
                        <span key={id} className="admin-tag">
                          {admin.name}
                          <button type="button" onClick={() => setSelectedSubAdmins(selectedSubAdmins.filter(sid => sid !== id))}>×</button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setEditingCategory(null);
                  setSelectedSubAdmins([]);
                }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}