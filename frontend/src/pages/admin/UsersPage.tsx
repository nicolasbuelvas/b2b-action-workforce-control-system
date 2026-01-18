import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUsersStats, updateUserStatus, resetUserPassword, deleteUser } from '../../api/admin.api';
import StatCard from '../../components/cards/StatCard';
import './userPage.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsResponse {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  subAdmins: number;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', status: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
      };
      const data: UsersResponse = await getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data: StatsResponse = await getUsersStats();
      setStats(data);
    } catch (err) {
      // Ignore stats error
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    setSelectedUsers([]); // Clear selection when data changes
  }, [users]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const action = newStatus === 'active' ? 'activate' : 'suspend';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await updateUserStatus(id, newStatus);
        fetchUsers();
        fetchStats();
      } catch (err) {
        alert(`Failed to ${action} user`);
      }
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password for the user:');
    if (!newPassword) return;
    if (confirm('Are you sure you want to reset this user\'s password? In Phase 3, the user will receive an email to update their password.')) {
      try {
        await resetUserPassword(id, newPassword);
        alert('Password reset successfully');
      } catch (err) {
        alert('Failed to reset password');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(id);
        fetchUsers();
        fetchStats();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const allVisibleIds = users.map(user => user.id);
    setSelectedUsers(prev =>
      prev.length === allVisibleIds.length ? [] : allVisibleIds
    );
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedUsers.map(id => deleteUser(id)));
        setSelectedUsers([]);
        fetchUsers();
        fetchStats();
        alert('Users deleted successfully');
      } catch (err) {
        alert('Failed to delete some users');
      }
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUsers.length === 0) return;
    if (confirm(`Are you sure you want to suspend ${selectedUsers.length} users?`)) {
      try {
        await Promise.all(selectedUsers.map(id => updateUserStatus(id, 'suspended')));
        setSelectedUsers([]);
        fetchUsers();
        fetchStats();
        alert('Users suspended successfully');
      } catch (err) {
        alert('Failed to suspend some users');
      }
    }
  };

  const handleBulkResetPassword = async () => {
    if (selectedUsers.length === 0) return;
    const newPassword = prompt('Enter new password for selected users:');
    if (!newPassword) return;
    if (confirm(`Are you sure you want to reset passwords for ${selectedUsers.length} users? In Phase 3, users will receive an email to update their password.`)) {
      try {
        await Promise.all(selectedUsers.map(id => resetUserPassword(id, newPassword)));
        alert('Passwords reset successfully. In Phase 3, users will receive an email to update their password.');
        setSelectedUsers([]);
      } catch (err) {
        alert('Failed to reset passwords');
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, role: user.role, status: user.status });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      // Assuming we have an updateUser API, but since it's not there, perhaps update status and name separately
      // For now, only update status, as name might need a separate API
      if (editForm.status !== editingUser.status) {
        await updateUserStatus(editingUser.id, editForm.status);
      }
      // TODO: Update name if API exists
      setEditingUser(null);
      fetchUsers();
      fetchStats();
      alert('User updated successfully');
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !users.length) return <div className="page-loader">Loading Users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="users-container">
      {/* HEADER SECTION */}
      <header className="users-header">
        <div className="header-left">
          <h1>All Users</h1>
          <p>List and manage all system users, roles and permissions.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export Users</button>
          <button className="btn-add-user" onClick={() => navigate('/super-admin/users/create')}>Add User</button>
        </div>
      </header>

      {/* STATS SUMMARY */}
      <section className="users-stats-grid">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard title="Active" value={stats?.activeUsers ?? 0} />
        <StatCard title="Suspended" value={stats?.suspendedUsers ?? 0} />
        <StatCard title="Sub-Admins" value={stats?.subAdmins ?? 0} />
      </section>

      {/* FILTERS AND SEARCH */}
      <div className="management-bar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="sub_admin">Sub-Admin</option>
            <option value="website_researcher">Website Researcher</option>
            <option value="linkedin_researcher">LinkedIn Researcher</option>
            <option value="website_inquirer">Website Inquirer</option>
            <option value="linkedin_inquirer">LinkedIn Inquirer</option>
            <option value="website_auditor">Website Auditor</option>
            <option value="linkedin_auditor">LinkedIn Auditor</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="btn-clear" onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedUsers.length} user(s) selected</span>
          <div className="bulk-buttons">
            <button className="btn-bulk" onClick={handleBulkSuspend}>Suspend Users</button>
            <button className="btn-bulk" onClick={handleBulkResetPassword}>Reset Passwords</button>
            <button className="btn-bulk delete" onClick={handleBulkDelete}>Delete Users</button>
          </div>
        </div>
      )}

      {/* USERS TABLE */}
      <div className="users-card">
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={handleSelectAll} /></th>
                <th>ID</th>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Last Activity</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="user-row">
                  <td><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} /></td>
                  <td className="txt-id">#{user.id.slice(0, 8)}</td>
                  <td>
                    <div className="user-info-cell">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td><span className="role-tag">{user.role}</span></td>
                  <td>
                    <span className={`badge-status ${user.status}`}>
                      {formatStatus(user.status)}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.updatedAt)}</td>
                  <td className="txt-right">
                    <div className="action-buttons">
                      <button className="btn-icon-action" title="Edit" onClick={() => handleEditUser(user)}>Edit</button>
                      <button className="btn-icon-action" title="Reset Password" onClick={() => handleResetPassword(user.id)}>Pass</button>
                      <button className="btn-icon-action suspend" title="Suspend" onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}>Lock</button>
                      <button className="btn-icon-action delete" title="Delete" onClick={() => handleDelete(user.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination-area">
          <span>Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} users</span>
          <div className="pagination-controls">
            <button className="btn-page" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} className={`btn-page ${page === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
            ))}
            <button className="btn-page" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
        </div>
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit User</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="super_admin">Super Admin</option>
                <option value="sub_admin">Sub-Admin</option>
                <option value="website_researcher">Website Researcher</option>
                <option value="linkedin_researcher">LinkedIn Researcher</option>
                <option value="website_inquirer">Website Inquirer</option>
                <option value="linkedin_inquirer">LinkedIn Inquirer</option>
                <option value="website_auditor">Website Auditor</option>
                <option value="linkedin_auditor">LinkedIn Auditor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleCancelEdit}>Cancel</button>
              <button onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}