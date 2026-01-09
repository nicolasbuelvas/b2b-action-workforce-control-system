import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createUserPage.css';

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Roles definidos por el cliente
  const roles = [
    'Super Admin', 'Sub-Admin', 
    'Website Researcher', 'LinkedIn Researcher', 
    'Website Inquirer', 'LinkedIn Inquirer', 
    'Website Auditor', 'LinkedIn Auditor'
  ];

  // Categorías existentes sugeridas
  const existingCategories = ['Product A', 'Product B', 'Product C', 'Marketing', 'Sales', 'Data Audit'];

  // Manejo de categorías (Tags)
  const addCategory = (cat: string) => {
    if (cat.trim() && !selectedCategories.includes(cat.trim())) {
      setSelectedCategories([...selectedCategories, cat.trim()]);
    }
    setCategoryInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      addCategory(categoryInput);
    }
  };

  const removeCategory = (indexToRemove: number) => {
    setSelectedCategories(selectedCategories.filter((_, index) => index !== indexToRemove));
  };

  // Filtrar sugerencias basadas en lo que escribe el usuario
  const suggestions = existingCategories.filter(
    cat => cat.toLowerCase().includes(categoryInput.toLowerCase()) && !selectedCategories.includes(cat)
  );

  return (
    <div className="cu-container">
      {/* WORK IN PROGRESS BANNER */}
      <div className="wip-banner">
        <span>SYSTEM MODULE: WORK IN PROGRESS (W.I.P)</span>
      </div>

      {/* HEADER */}
      <header className="cu-header">
        <div className="cu-title-section">
          <button className="btn-back" onClick={() => navigate(-1)}>← Back to Users</button>
          <h1>Create User</h1>
          <p>Register a new Super Admin, Sub-Admin, or Worker into the system.</p>
        </div>
      </header>

      <div className="cu-content-grid">
        <form className="cu-form-card" onSubmit={(e) => e.preventDefault()}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="e.g. John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="john@company.com" required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" placeholder="••••••••" required />
              </div>
              <div className="form-group">
                <label>Assign Role *</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="cu-select"
                  required
                >
                  <option value="">Select a role...</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <hr className="form-divider" />

          <div className="form-section">
            <h3>Permissions & Scope</h3>
            <div className="form-group">
              <label>Assign Categories (Search or Type & Press Enter)</label>
              <div className="category-search-container">
                <div className="tags-wrapper">
                  {selectedCategories.map((cat, index) => (
                    <span key={index} className="category-tag">
                      {cat}
                      <button type="button" onClick={() => removeCategory(index)}>×</button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    placeholder={selectedCategories.length === 0 ? "Search: Product A, Marketing..." : "Add more..."}
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                {/* SUGGESTIONS DROPDOWN */}
                {categoryInput && suggestions.length > 0 && (
                  <div className="suggestions-list">
                    {suggestions.map((cat) => (
                      <div 
                        key={cat} 
                        className="suggestion-item"
                        onClick={() => addCategory(cat)}
                      >
                        {cat} <span className="add-label">+ Add</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <small className="form-hint">
                  Assign specific categories to restrict user access. Leave empty for global access.
                </small>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-submit">Create User</button>
          </div>
        </form>

        {/* SIDEBAR INFO (TIPS) */}
        <aside className="cu-tips">
          <div className="tip-card">
            <h4>Role Hierarchy</h4>
            <ul>
              <li><strong>Super Admin:</strong> Unrestricted access.</li>
              <li><strong>Sub-Admin:</strong> Restricted to selected categories.</li>
              <li><strong>Workers:</strong> Research/Inquiry based on role.</li>
            </ul>
          </div>
          <div className="tip-card warning">
            <h4>Security Note</h4>
            <p>Ensure the password is secure. An invitation email will be sent to the user immediately.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}