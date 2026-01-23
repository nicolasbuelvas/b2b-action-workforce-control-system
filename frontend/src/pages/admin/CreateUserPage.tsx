import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, createSubAdmin, getAdminCategories } from '../../api/admin.api';
import './createUserPage.css';

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    role: '',
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [countryInput, setCountryInput] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Roles mapping (display name -> database name)
  const roleMapping = {
    'Super Admin': 'super_admin',
    'Sub-Admin': 'sub_admin',
    'Website Researcher': 'website_researcher',
    'LinkedIn Researcher': 'linkedin_researcher',
    'Website Inquirer': 'website_inquirer',
    'LinkedIn Inquirer': 'linkedin_inquirer',
    'Website Inquirer Auditor': 'website_inquirer_auditor',
    'LinkedIn Inquirer Auditor': 'linkedin_inquirer_auditor',
    'Website Research Auditor': 'website_research_auditor',
    'LinkedIn Research Auditor': 'linkedin_research_auditor',
  };

  const roles = Object.keys(roleMapping);

  // Countries list (abbreviated for brevity, but includes major ones)
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kenya', 'South Korea', 'Kuwait', 'Lebanon', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Venezuela', 'Vietnam', 'Zimbabwe'
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAdminCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Manejo de categorías (Tags)
  const addCategory = (cat: any) => {
    if (!selectedCategories.includes(cat.id)) {
      setSelectedCategories([...selectedCategories, cat.id]);
    }
    setCategoryInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      // For now, allow typing, but ideally search
      const found = categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase());
      if (found) addCategory(found);
    }
  };

  const removeCategory = (idToRemove: string) => {
    setSelectedCategories(selectedCategories.filter(id => id !== idToRemove));
  };

  // Filtrar sugerencias basadas en lo que escribe el usuario
  const suggestions = categories.filter(
    cat => cat.name.toLowerCase().includes(categoryInput.toLowerCase()) && !selectedCategories.includes(cat.id)
  );

  const countrySuggestions = countries.filter(
    c => c.toLowerCase().includes(countryInput.toLowerCase()) && c !== formData.country
  );

  const selectCountry = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setCountryInput('');
    setShowCountrySuggestions(false);
  };

  const clearCountry = () => {
    setFormData(prev => ({ ...prev, country: '' }));
    setCountryInput('');
    setShowCountrySuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create user with role
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: roleMapping[formData.role as keyof typeof roleMapping],
      };
      if (formData.country) userData.country = formData.country;

      // Only send categories for Sub-Admin and if not Super Admin
      if (formData.role === 'Sub-Admin' && selectedCategories.length > 0) {
        userData.categoryIds = selectedCategories;
      }

      const user = await createUser(userData);

      navigate('/super-admin/users');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create user';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cu-container">
      {/* HEADER */}
      <header className="cu-header">
        <div className="cu-title-section">
          <button className="btn-back" onClick={() => navigate(-1)}>← Back to Users</button>
          <h1>Create User</h1>
          <p>Register a new Super Admin, Sub-Admin, or Worker into the system.</p>
        </div>
      </header>

      <div className="cu-content-grid">
        <form className="cu-form-card" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  placeholder="john@company.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <div className="country-selector">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countryInput}
                    onChange={(e) => {
                      setCountryInput(e.target.value);
                      setShowCountrySuggestions(true);
                    }}
                    onFocus={() => setShowCountrySuggestions(true)}
                  />
                  {formData.country && (
                    <button type="button" className="clear-country" onClick={clearCountry}>×</button>
                  )}
                  {showCountrySuggestions && countryInput && countrySuggestions.length > 0 && (
                    <div className="country-suggestions">
                      {countrySuggestions.slice(0, 10).map((country) => (
                        <div
                          key={country}
                          className="country-item"
                          onClick={() => selectCountry(country)}
                        >
                          {country}
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.country && (
                    <div className="selected-country">{formData.country}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Assign Role *</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="cu-select"
                  required
                >
                  <option value="">Select a role...</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {formData.role !== 'Super Admin' && (
            <>
              <hr className="form-divider" />

              <div className="form-section">
                <h3>Permissions & Scope</h3>
                <div className="form-group">
                  <label>Assign Categories (Search or Type & Press Enter)</label>
                  <div className="category-search-container">
                    <div className="tags-wrapper">
                      {selectedCategories.map((id) => {
                        const cat = categories.find(c => c.id === id);
                        return (
                          <span key={id} className="category-tag">
                            {cat?.name || id}
                            <button type="button" onClick={() => removeCategory(id)}>×</button>
                          </span>
                        );
                      })}
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
                            key={cat.id} 
                            className="suggestion-item"
                            onClick={() => addCategory(cat)}
                          >
                            {cat.name} <span className="add-label">+ Add</span>
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
            </>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>

        {/* SIDEBAR INFO (TIPS) */}
        <aside className="cu-tips">
          <div className="tip-card">
            <h4>Role Hierarchy</h4>
            <ul>
              <li><strong>Super Admin:</strong> Unrestricted access.</li>
              <li><strong>Sub-Admin:</strong> Restricted to selected categories.</li>
              <li><strong>Workers:</strong> Research/Inquiry/Auditor based on role.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}