import React, { useState, useEffect } from 'react';
import './LinkedinResearchTasksPage.css';
import { researchApi, WebsiteResearchTask } from '../../../api/research.api';

interface Category {
  id: string;
  name: string;
}

interface Lead extends WebsiteResearchTask {
  name?: string;
  role?: string;
  company?: string;
  location?: string;
  connectionLevel?: string;
}

export default function LinkedinResearchTasksPage() {
  const [tasks, setTasks] = useState<Lead[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [manualProfileUrl, setManualProfileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load LinkedIn research tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await researchApi.getLinkedInTasks();
        setTasks(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const filteredLeads = tasks.filter(lead =>
    `${lead.domain} ${lead.priority} ${lead.category}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="res-tasks-container">
      <header className="res-tasks-header">
        <div>
          <h1>LinkedIn Research Terminal</h1>
          <p>Identify and qualify decision-makers for automated outreach flows.</p>
        </div>

        <div className="res-quota-card">
          <div className="quota-info">
            <span className="q-label">Daily Quota</span>
            <span className="q-value">0 / 0</span>
          </div>
          <div className="quota-bar">
            <div className="quota-fill" style={{ width: '0%' }} />
          </div>
        </div>
      </header>

      <div className="res-main-grid">
        {/* LEFT PANEL */}
        <aside>
          <div className="control-card">
            <h3>1. Select Target Category</h3>

            <div className="category-chips">
              {categories.length === 0 && (
                <span className="helper-text">No categories loaded</span>
              )}

              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`chip ${selectedCategoryId === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="control-card">
            <h3>2. Manual Profile Import</h3>
            <p className="helper-text">
              Paste a LinkedIn profile URL to add a lead directly.
            </p>

            <div className="input-action-group">
              <input
                type="text"
                placeholder="https://linkedin.com/in/..."
                value={manualProfileUrl}
                onChange={e => setManualProfileUrl(e.target.value)}
              />
              <button className="btn-import">Import</button>
            </div>
          </div>

          <div className="control-card stats-mini">
            <h3>Session Performance</h3>
            <div className="mini-stat-row">
              <span>Leads Found</span>
              <strong>{leads.length}</strong>
            </div>
            <div className="mini-stat-row">
              <span>Avg. Quality Score</span>
              <strong className="text-muted">—</strong>
            </div>
            <div className="mini-stat-row">
              <span>Est. Earnings</span>
              <strong className="text-muted">—</strong>
            </div>
          </div>
        </aside>

        {/* RESULTS */}
        <main>
          <div className="results-toolbar">
            <div className="search-bar-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search name, role or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="results-count">
              {filteredLeads.length} leads
            </div>
          </div>

          <div className="results-table-container">
            <table className="res-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Company & Role</th>
                  <th>Network</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      No leads available
                    </td>
                  </tr>
                )}

                {filteredLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div className="profile-cell">
                        <div className="p-avatar">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="p-name">{lead.name}</p>
                          <p className="p-loc">{lead.location}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <p className="p-role">{lead.role}</p>
                      <p className="p-company">{lead.company}</p>
                    </td>

                    <td>
                      <span className="conn-badge">
                        {lead.connectionLevel}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button className="btn-qualify">Qualify</button>
                        <button className="btn-discard">Discard</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}