import React, { useState, useEffect } from 'react';
import { client } from '../../api/client';
import './SubAdminCRUD.css';

interface User {
  id: string;
  email: string;
  role: string;
  status: 'approved' | 'pending' | 'disapproved';
  createdAt: string;
}

export default function SubAdminUsers(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'website_researcher',
    status: 'approved' as 'approved' | 'pending' | 'disapproved',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Placeholder - backend endpoint to be implemented
      // const response = await client.get('/subadmin/users');
      // setUsers(response.data || []);
      setUsers([]);
    } catch (err: any) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      email: '',
      password: '',
      role: 'website_researcher',
      status: 'approved',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Placeholder - backend endpoint to be implemented
      // await client.post('/subadmin/users', formData);
      alert('User creation functionality - backend endpoint to be implemented');
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      alert('Failed to create user');
    }
  };

  return (
    <div className="sa-crud-page">
      <header className="sa-page-header">
        <div>
          <h2>User Management</h2>
          <p className="muted">
            Create and manage users for Researcher, Inquirer, and Auditor roles within your categories
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Create User
        </button>
      </header>

      <main className="sa-main">
        {loading && <div className="loading-state">Loading users...</div>}

        {!loading && (
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-semibold">{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-sm btn-secondary">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="empty-state">
                <p>No users yet. Create users to assign tasks.</p>
                <button className="btn-primary" onClick={handleCreate}>
                  Create First User
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create User</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Secure password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <optgroup label="Research">
                    <option value="website_researcher">Website Researcher</option>
                    <option value="linkedin_researcher">LinkedIn Researcher</option>
                  </optgroup>
                  <optgroup label="Inquiry">
                    <option value="website_inquirer">Website Inquirer</option>
                    <option value="linkedin_inquirer">LinkedIn Inquirer</option>
                  </optgroup>
                  <optgroup label="Audit">
                    <option value="website_research_auditor">Website Research Auditor</option>
                    <option value="linkedin_research_auditor">LinkedIn Research Auditor</option>
                    <option value="website_inquirer_auditor">Website Inquirer Auditor</option>
                    <option value="linkedin_inquirer_auditor">LinkedIn Inquirer Auditor</option>
                  </optgroup>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'approved' | 'pending' | 'disapproved' })
                  }
                  required
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="disapproved">Disapproved</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
