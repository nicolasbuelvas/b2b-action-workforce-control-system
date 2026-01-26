import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubAdminCategories, getWebsiteResearchTasks } from '../../api/subadmin.api';
import './SubAdminTaskCreation.css';

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SubAdminCreateResearchTasks(): JSX.Element {
  const [platform, setPlatform] = useState<'website' | 'linkedin'>('website');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [items, setItems] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const data = await getSubAdminCategories();
        setCategories(Array.isArray(data) ? data : []);
        if (data && data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load categories:', err);
      }
    })();
  }, []);

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const filteredItems = items.filter(item => item.trim().length > 0);
      if (filteredItems.length === 0) {
        throw new Error('Please add at least one item');
      }

      const endpoint = platform === 'website'
        ? '/subadmin/research/website'
        : '/subadmin/research/linkedin';

      const body = platform === 'website'
        ? { categoryId: selectedCategory, domains: filteredItems }
        : { categoryId: selectedCategory, profileUrls: filteredItems };

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to create tasks: ${response.statusText}`);
      }

      setSuccess(`${filteredItems.length} ${platform} research task(s) created successfully!`);
      setItems(['']);

      setTimeout(() => {
        navigate(platform === 'website' ? '/sub-admin/research/website' : '/sub-admin/research/linkedin');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-create-page">
      <header className="sa-page-header">
        <div>
          <h2>Create Research Tasks</h2>
          <p className="muted">Bulk create research tasks for researchers in your assigned categories.</p>
        </div>
      </header>

      <main className="sa-main">
        <form onSubmit={handleSubmit} className="create-form">
          {/* Platform Selection */}
          <div className="form-section">
            <h3>Platform</h3>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="website"
                  checked={platform === 'website'}
                  onChange={(e) => setPlatform(e.target.value as 'website' | 'linkedin')}
                />
                Website
              </label>
              <label>
                <input
                  type="radio"
                  value="linkedin"
                  checked={platform === 'linkedin'}
                  onChange={(e) => setPlatform(e.target.value as 'website' | 'linkedin')}
                />
                LinkedIn
              </label>
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-section">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={categories.length === 0}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Items Input */}
          <div className="form-section">
            <label>
              {platform === 'website' ? 'Domains' : 'LinkedIn Profile URLs'} *
            </label>
            <p className="help-text">
              Add {platform === 'website' ? 'company domains' : 'LinkedIn profile URLs'}, one per row
            </p>

            <div className="items-list">
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={platform === 'website' ? 'example.com' : 'linkedin.com/in/...'}
                    className="item-input"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={addItem} className="btn-add-item">
              + Add Another
            </button>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Creating...' : 'Create Tasks'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
