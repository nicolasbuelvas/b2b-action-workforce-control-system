import React, { useEffect, useState } from 'react';
import './companyBlacklistPage.css';
import StatCard from '../../components/cards/StatCard';

interface BlacklistedCompany {
  id: string;
  domain: string;
  reason?: string;
  addedBy: string;
  addedAt: string;
  isActive: boolean;
}

export default function CompanyBlacklistPage() {
  const [companies, setCompanies] = useState<BlacklistedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    reason: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchBlacklistedCompanies();
  }, []);

  const fetchBlacklistedCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Connect to actual backend endpoint
      // const response = await fetch('/api/blacklist');
      // const data = await response.json();
      // setCompanies(data);
      
      // Mock data for now
      setCompanies([
        {
          id: '1',
          domain: 'example.com',
          reason: 'Invalid company information',
          addedBy: 'admin@system.com',
          addedAt: new Date().toISOString(),
          isActive: true,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blacklist');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.domain.trim()) {
      alert('Please enter a domain');
      return;
    }

    try {
      // TODO: Connect to actual backend endpoint
      // const response = await fetch('/api/blacklist', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      const newCompany: BlacklistedCompany = {
        id: Math.random().toString(),
        domain: formData.domain,
        reason: formData.reason,
        addedBy: 'current_user@system.com', // TODO: Get from auth context
        addedAt: new Date().toISOString(),
        isActive: true,
      };

      setCompanies([newCompany, ...companies]);
      setFormData({ domain: '', reason: '' });
      setShowForm(false);
    } catch (err) {
      alert('Failed to add company to blacklist');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this company from blacklist?')) return;

    try {
      // TODO: Connect to actual backend endpoint
      // await fetch(`/api/blacklist/${id}`, { method: 'DELETE' });
      
      setCompanies(companies.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to remove company');
    }
  };

  const filteredCompanies = companies.filter(
    c => c.domain.toLowerCase().includes(searchText.toLowerCase()) ||
         c.reason?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="company-blacklist-page">
      <header className="cbp-header">
        <div>
          <h1>Company Blacklist</h1>
          <p>Manage blacklisted companies. These domains cannot be used for task creation.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Company'}
        </button>
      </header>

      <div className="cbp-stats">
        <StatCard
          title="Total Blacklisted"
          value={companies.length}
          trend={companies.length > 0 ? 'neutral' : 'positive'}
        />
        <StatCard
          title="Active"
          value={companies.filter(c => c.isActive).length}
          trend="neutral"
        />
      </div>

      {showForm && (
        <div className="cbp-form-section">
          <h3>Add Company to Blacklist</h3>
          <form onSubmit={handleAdd} className="cbp-form">
            <div className="form-group">
              <label htmlFor="domain">Domain *</label>
              <input
                type="text"
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="e.g., example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Why is this company blacklisted?"
                rows={3}
              />
            </div>
            <button type="submit" className="btn-primary">
              Add to Blacklist
            </button>
          </form>
        </div>
      )}

      <div className="cbp-search">
        <input
          type="text"
          placeholder="Search by domain or reason..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <main className="cbp-main">
        {loading && <div className="loading">Loading blacklist...</div>}
        {error && <div className="error-message">Error: {error}</div>}

        {!loading && !error && filteredCompanies.length === 0 && (
          <div className="empty-state">
            <p>{searchText ? 'No companies found matching your search.' : 'No blacklisted companies yet.'}</p>
          </div>
        )}

        {!loading && !error && filteredCompanies.length > 0 && (
          <div className="cbp-list">
            <table className="cbp-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Reason</th>
                  <th>Added By</th>
                  <th>Added At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map(company => (
                  <tr key={company.id}>
                    <td className="domain"><strong>{company.domain}</strong></td>
                    <td>{company.reason || '-'}</td>
                    <td>{company.addedBy}</td>
                    <td>{new Date(company.addedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${company.isActive ? 'active' : 'inactive'}`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleRemove(company.id)}
                        title="Remove from blacklist"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
