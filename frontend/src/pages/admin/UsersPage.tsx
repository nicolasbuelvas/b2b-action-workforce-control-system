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
    if (confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        await resetUserPassword(id);
        alert('Password reset initiated');
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

      {/* USERS TABLE */}
      <div className="users-card">
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
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
                  <td><input type="checkbox" /></td>
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
                      <button className="btn-icon-action" title="Edit" onClick={() => navigate(`/super-admin/users/${user.id}/edit`)}>Edit</button>
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
    </div>
  );
}