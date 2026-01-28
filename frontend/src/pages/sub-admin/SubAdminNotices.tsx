import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import { useAuthContext } from '../../context/AuthContext';
import './SubAdminCRUD.css';
import './SubAdminNotices.css';

type Notice = {
  id: string;
  title: string;
  message: string;
  targetType: string;
  targetRoleIds: string[];
  targetCategoryIds: string[];
  targetUserIds: string[];
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
};

type Role = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function SubAdminNotices(): JSX.Element {
  const { user } = useAuthContext();
  const isSuperAdmin = user?.role === 'super_admin';
  
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Filters
  const [viewMode, setViewMode] = useState<'sent' | 'received'>('sent');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  
  // Search state for dropdowns
  const [categorySearchText, setCategorySearchText] = useState<string>('');
  const [userSearchText, setUserSearchText] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'ROLE' as 'ROLE' | 'CATEGORY' | 'USER' | 'ALL',
    targetRoleIds: [] as string[],
    targetCategoryIds: [] as string[],
    targetUserIds: [] as string[],
    priority: 'normal' as 'high' | 'normal' | 'low',
  });

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (viewMode) params.append('viewMode', viewMode);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterRole) params.append('roleId', filterRole);
      if (searchText) params.append('search', searchText);
      
      const response = await client.get(`/subadmin/notices?${params.toString()}`);
      setNotices(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error('fetchNotices error', e);
      setError(e.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, [viewMode, filterCategory, filterRole, searchText]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await client.get('/subadmin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await client.get('/roles');
      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      console.error('Failed to load roles', e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await client.get('/subadmin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
    fetchCategories();
    fetchRoles();
    fetchUsers();
  }, [fetchNotices, fetchCategories, fetchRoles, fetchUsers]);

  const handleCreate = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      message: '',
      targetType: 'ROLE',
      targetRoleIds: [],
      targetCategoryIds: [],
      targetUserIds: [],
      priority: 'normal',
    });
    setCategorySearchText('');
    setUserSearchText('');
    setShowModal(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      message: notice.message,
      targetType: notice.targetType as any,
      targetRoleIds: notice.targetRoleIds || [],
      targetCategoryIds: notice.targetCategoryIds || [],
      targetUserIds: notice.targetUserIds || [],
      priority: notice.priority,
    });
    setCategorySearchText('');
    setUserSearchText('');
    setShowModal(true);
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await client.delete(`/subadmin/notices/${noticeId}`);
      fetchNotices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await client.patch(`/subadmin/notices/${editingNotice.id}`, formData);
      } else {
        await client.post('/subadmin/notices', formData);
      }
      setShowModal(false);
      setEditingNotice(null);
      fetchNotices();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${editingNotice ? 'update' : 'send'} notice`);
    }
  };

  const formatTargetType = (notice: Notice) => {
    if (notice.targetType === 'ALL') return 'All Users';
    if (notice.targetType === 'ROLE') {
      const roleNames = roles
        .filter(r => notice.targetRoleIds?.includes(r.id))
        .map(r => r.name)
        .join(', ');
      return `Roles: ${roleNames || 'N/A'}`;
    }
    if (notice.targetType === 'CATEGORY') {
      const catNames = categories
        .filter(c => notice.targetCategoryIds?.includes(c.id))
        .map(c => c.name)
        .join(', ');
      return `Categories: ${catNames || 'N/A'}`;
    }
    if (notice.targetType === 'USER') return `${notice.targetUserIds?.length || 0} user(s)`;
    return notice.targetType;
  };

  return (
    <div className="subadmin-notices">
      <header className="sa-page-header">
        <div>
          <h2>Notices & Announcements</h2>
          <p className="muted">
            {viewMode === 'sent' ? 'Notices you have sent' : 'Notices you have received'}
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Create Notice
        </button>
      </header>

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontWeight: 600, fontSize: '14px' }}>View:</label>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as 'sent' | 'received')}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
        </div>

        {(isSuperAdmin || viewMode === 'received') && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, fontSize: '14px' }}>Category:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {isSuperAdmin && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, fontSize: '14px' }}>Role:</label>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' }}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
          <label style={{ fontWeight: 600, fontSize: '14px' }}>Search:</label>
          <input 
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by title or message..."
            style={{ 
              padding: '6px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              flex: 1,
              maxWidth: '300px'
            }}
          />
        </div>

        {(filterCategory || filterRole || searchText) && (
          <button 
            onClick={() => {
              setFilterCategory('');
              setFilterRole('');
              setSearchText('');
            }}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '4px', 
              background: '#f44336', 
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <main className="sa-main">
        {loading && <div className="loading-state">Loading notices…</div>}
        {error && <div className="error-message">Error: {error}</div>}

        {!loading && !error && notices.length === 0 && (
          <div className="empty-state">
            <p>No notices found.</p>
            <button className="btn-primary" onClick={handleCreate}>
              Create Notice
            </button>
          </div>
        )}

        {!loading && !error && notices.length > 0 && (
          <ul className="notice-list">
            {notices.map((n) => (
              <li key={n.id} className={`notice-item priority-${n.priority}`}>
                <div className="notice-header">
                  <div>
                    <h3>{n.title}</h3>
                    <span className="notice-target">To: {formatTargetType(n)}</span>
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
                  <span className={n.isActive ? 'status-active' : 'status-inactive'}>
                    {n.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {viewMode === 'sent' && (
                  <div className="notice-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleEdit(n)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleDelete(n.id)}
                      style={{ padding: '6px 12px', fontSize: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setCategorySearchText('');
          setUserSearchText('');
        }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>{editingNotice ? 'Edit Notice' : 'Create Notice'}</h3>
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
                  <label htmlFor="targetType">Send To *</label>
                  <select
                    id="targetType"
                    value={formData.targetType}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      targetType: e.target.value as any,
                      targetRoleIds: [],
                      targetCategoryIds: [],
                      targetUserIds: []
                    })}
                    required
                  >
                    <option value="ALL">All Users</option>
                    <option value="ROLE">Specific Roles</option>
                    <option value="CATEGORY">Specific Categories</option>
                    <option value="USER">Specific User</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as any })
                    }
                    required
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {formData.targetType === 'ROLE' && (
                <div className="form-group">
                  <label>Select Roles *</label>
                  <div className="checkbox-group">
                    {roles.filter(r => !['sub_admin', 'super_admin'].includes(r.name)).map(role => (
                      <label key={role.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.targetRoleIds.includes(role.id)}
                          onChange={(e) => {
                            const newRoleIds = e.target.checked
                              ? [...formData.targetRoleIds, role.id]
                              : formData.targetRoleIds.filter(id => id !== role.id);
                            setFormData({ ...formData, targetRoleIds: newRoleIds });
                          }}
                        />
                        {role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.targetType === 'CATEGORY' && (
                <div className="form-group">
                  <label>Select Categories *</label>
                  {categories.length > 5 && (
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearchText}
                      onChange={(e) => setCategorySearchText(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        marginBottom: '8px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px' 
                      }}
                    />
                  )}
                  <div className="checkbox-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {categories
                      .filter(cat => cat.name.toLowerCase().includes(categorySearchText.toLowerCase()))
                      .map(cat => (
                        <label key={cat.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.targetCategoryIds.includes(cat.id)}
                            onChange={(e) => {
                              const newCatIds = e.target.checked
                                ? [...formData.targetCategoryIds, cat.id]
                                : formData.targetCategoryIds.filter(id => id !== cat.id);
                              setFormData({ ...formData, targetCategoryIds: newCatIds });
                            }}
                          />
                          {cat.name}
                        </label>
                      ))}
                  </div>
                  {categories.filter(cat => cat.name.toLowerCase().includes(categorySearchText.toLowerCase())).length === 0 && (
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>No categories found</p>
                  )}
                </div>
              )}

              {formData.targetType === 'USER' && (
                <div className="form-group">
                  <label htmlFor="targetUser">Select User *</label>
                  {users.length > 10 && (
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        marginBottom: '8px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px' 
                      }}
                    />
                  )}
                  <select
                    id="targetUser"
                    value={formData.targetUserIds[0] || ''}
                    onChange={(e) => setFormData({ ...formData, targetUserIds: [e.target.value] })}
                    required
                    style={{ width: '100%' }}
                  >
                    <option value="">Choose a user...</option>
                    {users
                      .filter(user => 
                        user.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
                        user.email.toLowerCase().includes(userSearchText.toLowerCase())
                      )
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                  {users.filter(user => 
                    user.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
                    user.email.toLowerCase().includes(userSearchText.toLowerCase())
                  ).length === 0 && (
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>No users found</p>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowModal(false);
                  setCategorySearchText('');
                  setUserSearchText('');
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNotice ? 'Update Notice' : 'Send Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

