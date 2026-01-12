import React, { useState } from 'react';
import './LinkedinResearchTasksPage.css';

const MOCK_CATEGORIES = ["Cybersecurity", "Fintech", "HealthTech", "Logistics"];
const SEARCH_RESULTS = [
  { id: 1, name: "Alice Thompson", role: "Procurement Manager", company: "SecureNet", location: "London, UK", connection: "2nd", linkedinId: "/in/athompson-sn" },
  { id: 2, name: "David Miller", role: "CTO", company: "FinFlow", location: "New York, USA", connection: "3rd", linkedinId: "/in/dmiller-cto" },
  { id: 3, name: "Sofia Rossi", role: "Head of Operations", company: "HealthPure", location: "Milan, Italy", connection: "2nd", linkedinId: "/in/srossi-ops" }
];

export default function LinkedinResearchTasksPage() {
  const [selectedCategory, setSelectedCategory] = useState("Cybersecurity");
  const [pastedUrl, setPastedUrl] = useState('');
  const [results, setResults] = useState(SEARCH_RESULTS);

  return (
    <div className="res-tasks-container">
      <header className="res-tasks-header">
        <div className="title-group">
          <h1>LinkedIn Research Terminal</h1>
          <p>Identify and qualify decision-makers for automated outreach flows.</p>
        </div>
        <div className="res-quota-card">
          <div className="quota-info">
            <span className="q-label">Daily Quota</span>
            <span className="q-value">34 / 50</span>
          </div>
          <div className="quota-bar"><div className="quota-fill" style={{width: '68%'}}></div></div>
        </div>
      </header>

      <div className="res-main-grid">
        <aside className="res-control-panel">
          <div className="control-card">
            <h3>1. Select Target Category</h3>
            <div className="category-chips">
              {MOCK_CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="control-card">
            <h3>2. Manual Profile Import</h3>
            <p className="helper-text">Paste a LinkedIn URL to quickly add a lead without searching.</p>
            <div className="input-action-group">
              <input 
                type="text" 
                placeholder="https://linkedin.com/in/..." 
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
              />
              <button className="btn-import">Import</button>
            </div>
          </div>

          <div className="control-card stats-mini">
            <h3>Session Performance</h3>
            <div className="mini-stat-row"><span>Leads Found:</span> <strong>12</strong></div>
            <div className="mini-stat-row"><span>Avg. Quality Score:</span> <strong className="text-success">94%</strong></div>
            <div className="mini-stat-row"><span>Est. Earnings:</span> <strong>$18.40</strong></div>
          </div>
        </aside>

        <main className="res-results-area">
          <div className="results-toolbar">
            <div className="search-bar-wrap">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search within results (Name, Role, Company)..." />
            </div>
            <div className="results-count">Showing {results.length} suggested leads</div>
          </div>

          <div className="results-table-container">
            <table className="res-table">
              <thead>
                <tr>
                  <th>Profile Info</th>
                  <th>Company & Role</th>
                  <th>Network</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div className="profile-cell">
                        <div className="p-avatar">{lead.name[0]}</div>
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
                      <span className="conn-badge">{lead.connection}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-qualify">Qualify Lead</button>
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