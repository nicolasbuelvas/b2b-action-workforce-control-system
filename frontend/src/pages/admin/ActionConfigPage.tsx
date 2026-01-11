import { useState } from 'react';
import StatCard from '../../components/cards/StatCard';
import './actionConfigPage.css';

type UserRole = 'Researcher' | 'Inquirer' | 'Reviewer';
type ActionStatus = 'Enabled' | 'Disabled';

interface ActionConfig {
  id: string;
  actionName: string;
  role: UserRole;
  dailyLimit: number;
  cooldownHours: number;
  requiresApproval: boolean;
  status: ActionStatus;
}

export default function ActionConfigPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [actions] = useState<ActionConfig[]>([
    {
      id: 'ACT-001',
      actionName: 'Submit Website',
      role: 'Researcher',
      dailyLimit: 200,
      cooldownHours: 0,
      requiresApproval: true,
      status: 'Enabled',
    },
    {
      id: 'ACT-002',
      actionName: 'Request Review',
      role: 'Inquirer',
      dailyLimit: 50,
      cooldownHours: 24,
      requiresApproval: false,
      status: 'Enabled',
    },
    {
      id: 'ACT-003',
      actionName: 'Approve Lead',
      role: 'Reviewer',
      dailyLimit: 300,
      cooldownHours: 0,
      requiresApproval: false,
      status: 'Disabled',
    },
  ]);

  const enabledActions = actions.filter(a => a.status === 'Enabled').length;

  return (
    <div className="categories-container">
      {/* WIP */}
      <div className="wip-banner">
        <span>SYSTEM MODULE: WORK IN PROGRESS (W.I.P)</span>
      </div>

      {/* HEADER */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Action Configuration</h1>
          <p>Define limits, cooldowns and permissions per system action.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export Actions</button>
          <button className="btn-add-category">+ Add Action</button>
        </div>
      </header>

      {/* STATS */}
      <section className="categories-stats-grid">
        <StatCard title="Total Actions" value={actions.length} />
        <StatCard title="Enabled Actions" value={enabledActions} />
        <StatCard title="Roles Covered" value={3} />
        <StatCard title="Approval Required" value={actions.filter(a => a.requiresApproval).length} />
      </section>

      {/* MANAGEMENT BAR */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by action name, ID or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select><option>Role: All</option></select>
          <select><option>Status: All</option></select>
          <button className="btn-clear">Clear</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>Action</th>
                <th>Role</th>
                <th className="txt-center">Daily Limit</th>
                <th className="txt-center">Cooldown</th>
                <th>Approval</th>
                <th>Status</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {actions.map(action => (
                <tr key={action.id} className="cat-row">
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="cat-info-cell">
                      <span className="cat-id">{action.id}</span>
                      <strong className="cat-name">{action.actionName}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="role-tag">{action.role}</span>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{action.dailyLimit}</span>
                  </td>
                  <td className="txt-center">
                    <span className="cooldown-val">
                      {action.cooldownHours === 0 ? 'None' : `${action.cooldownHours}h`}
                    </span>
                  </td>
                  <td>
                    {action.requiresApproval ? (
                      <span className="approval yes">Required</span>
                    ) : (
                      <span className="approval no">No</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${action.status.toLowerCase()}`}>
                      {action.status}
                    </span>
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