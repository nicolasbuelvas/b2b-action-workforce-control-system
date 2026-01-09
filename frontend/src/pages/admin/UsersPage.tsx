import { useState } from 'react';
import StatCard from '../../components/cards/StatCard';
import './userPage.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdDate: string;
  lastLogin: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Datos de ejemplo (Mock Data)
  const [users] = useState<User[]>([
    { id: '101', name: 'John Doe', email: 'john@company.com', role: 'Website Researcher', status: 'Active', createdDate: '2025-12-01', lastLogin: '2026-01-08' },
    { id: '102', name: 'Jane Smith', email: 'jane@network.com', role: 'Sub-Admin', status: 'Active', createdDate: '2025-11-15', lastLogin: '2026-01-09' },
    { id: '103', name: 'Robert Fox', email: 'robert@tasks.com', role: 'LinkedIn Inquirer', status: 'Suspended', createdDate: '2025-10-20', lastLogin: '2025-12-20' },
    { id: '104', name: 'Alice Wong', email: 'alice@audit.com', role: 'Website Auditor', status: 'Inactive', createdDate: '2025-09-05', lastLogin: '2026-01-02' },
  ]);

  return (
    <div className="users-container">
      {/* WORK IN PROGRESS BADGE */}
      <div className="wip-banner">
        <span>SYSTEM MODULE: WORK IN PROGRESS (W.I.P)</span>
      </div>

      {/* HEADER SECTION */}
      <header className="users-header">
        <div className="header-left">
          <h1>All Users</h1>
          <p>List and manage all system users, roles and permissions.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export Users</button>
          <button className="btn-add-user">Add User</button>
        </div>
      </header>

      {/* STATS SUMMARY */}
      <section className="users-stats-grid">
        <StatCard title="Total Users" value={324} />
        <StatCard title="Active" value={310} />
        <StatCard title="Suspended" value={14} />
        <StatCard title="Sub-Admins" value={5} />
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
            <option>All Roles</option>
            <option>Super Admin</option>
            <option>Sub-Admin</option>
            <option>Website Researcher</option>
            <option>LinkedIn Researcher</option>
            <option>Website Inquirer</option>
            <option>LinkedIn Inquirer</option>
            <option>Website Auditor</option>
            <option>LinkedIn Auditor</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
          <button className="btn-clear">Clear Filters</button>
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
                  <td className="txt-id">#{user.id}</td>
                  <td>
                    <div className="user-info-cell">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td><span className="role-tag">{user.role}</span></td>
                  <td>
                    <span className={`badge-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.createdDate}</td>
                  <td>{user.lastLogin}</td>
                  <td className="txt-right">
                    <div className="action-buttons">
                      <button className="btn-icon-action" title="Edit">Edit</button>
                      <button className="btn-icon-action" title="Reset Password">Pass</button>
                      <button className="btn-icon-action suspend" title="Suspend">Lock</button>
                      <button className="btn-icon-action delete" title="Delete">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination-area">
          <span>Showing 1 to 10 of 324 users</span>
          <div className="pagination-controls">
            <button className="btn-page" disabled>Previous</button>
            <button className="btn-page active">1</button>
            <button className="btn-page">2</button>
            <button className="btn-page">3</button>
            <button className="btn-page">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}