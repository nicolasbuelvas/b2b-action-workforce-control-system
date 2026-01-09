import { useState } from 'react';
import StatCard from '../../components/cards/StatCard';
import './categoriesPage.css';

interface Category {
  id: string;
  name: string;
  description: string;
  assignedSubAdmins: string[];
  websitesCount: number;
  linkedInLinksCount: number;
  dailyLimit: number;
  cooldown: number;
  status: 'Active' | 'Inactive';
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mock Data basada en requerimientos
  const [categories] = useState<Category[]>([
    { 
      id: 'CAT-001', name: 'Product A', description: 'Main hardware vertical', 
      assignedSubAdmins: ['Jane Smith', 'Mike Ross'], websitesCount: 12, 
      linkedInLinksCount: 45, dailyLimit: 150, cooldown: 3, status: 'Active' 
    },
    { 
      id: 'CAT-002', name: 'Product B', description: 'Software SaaS solutions', 
      assignedSubAdmins: ['Harvey Specter'], websitesCount: 8, 
      linkedInLinksCount: 30, dailyLimit: 100, cooldown: 5, status: 'Active' 
    },
    { 
      id: 'CAT-003', name: 'Product C', description: 'Consulting services', 
      assignedSubAdmins: [], websitesCount: 5, 
      linkedInLinksCount: 10, dailyLimit: 50, cooldown: 7, status: 'Inactive' 
    },
  ]);

  const totalSubAdmins = categories.reduce((acc, cat) => acc + cat.assignedSubAdmins.length, 0);

  return (
    <div className="categories-container">
      {/* WORK IN PROGRESS BANNER */}
      <div className="wip-banner">
        <span>SYSTEM MODULE: WORK IN PROGRESS (W.I.P)</span>
      </div>

      {/* HEADER */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Categories</h1>
          <p>Manage system categories, target links, and cooldown rules.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export List</button>
          <button className="btn-add-category">+ Add Category</button>
        </div>
      </header>

      {/* STATS SUMMARY */}
      <section className="categories-stats-grid">
        <StatCard title="Total Categories" value={categories.length} />
        <StatCard title="Sub-Admin Assigned" value={totalSubAdmins} />
        <StatCard title="Active Tasks" value={85} />
        <StatCard title="Global Cooldowns" value={12} />
      </section>

      {/* MANAGEMENT BAR */}
      <div className="management-bar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by category name, ID or Sub-Admin..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select><option>All Sub-Admins</option></select>
          <select><option>Status: All</option></select>
          <button className="btn-clear">Clear</button>
        </div>
      </div>

      {/* CATEGORIES TABLE */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>ID & Name</th>
                <th>Description</th>
                <th>Assigned Sub-Admins</th>
                <th className="txt-center">Websites</th>
                <th className="txt-center">LinkedIn</th>
                <th>Limits / Cooldown</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="cat-row">
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="cat-info-cell">
                      <span className="cat-id">{cat.id}</span>
                      <strong className="cat-name">{cat.name}</strong>
                    </div>
                  </td>
                  <td><p className="cat-desc">{cat.description}</p></td>
                  <td>
                    <div className="subadmin-tags">
                      {cat.assignedSubAdmins.length > 0 ? (
                        cat.assignedSubAdmins.map(admin => (
                          <span key={admin} className="admin-tag">{admin}</span>
                        ))
                      ) : (
                        <span className="no-admins">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{cat.websitesCount}</span>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{cat.linkedInLinksCount}</span>
                  </td>
                  <td>
                    <div className="limit-info">
                      <span className="limit-val" title="Daily Limit">Max: <strong>{cat.dailyLimit}</strong></span>
                      <span className="cooldown-val" title="Cooldown Days">{cat.cooldown}d Cooldown</span>
                    </div>
                  </td>
                  <td className="txt-right">
                    <div className="action-buttons">
                      <button className="btn-icon-act edit">Edit</button>
                      <button className="btn-icon-act delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}