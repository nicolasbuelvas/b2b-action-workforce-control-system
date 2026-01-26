import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWebsiteInquiryTasks, createLinkedInInquiryTasks, getSubAdminCategories } from '../../api/subadmin.api';
import './SubAdminTaskCreation.css';

interface Category {
  id: string;
  name: string;
}

export const SubAdminCreateInquiryTasks: React.FC = () => {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<'website' | 'linkedin'>('website');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [items, setItems] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const data = await getSubAdminCategories();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleAddItem = () => {
    setItems([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    const filteredItems = items.filter((item) => item.trim().length > 0);
    if (filteredItems.length === 0) {
      setError(`Please enter at least one ${platform === 'website' ? 'company URL' : 'LinkedIn profile URL'}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const filteredItems = items.filter((item) => item.trim().length > 0);
      
      if (platform === 'website') {
        await createWebsiteInquiryTasks(selectedCategory, filteredItems);
      } else {
        await createLinkedInInquiryTasks(selectedCategory, filteredItems);
      }

      setSuccess(`Successfully created ${filteredItems.length} inquiry task(s)`);
      setItems(['']);
      setTimeout(() => {
        navigate('/sub-admin/inquiry/website');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create inquiry tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-creation-page">
      <div className="task-header">
        <h1>Create Inquiry Tasks</h1>
        <p>Create bulk inquiry tasks for researchers</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="task-creation-form">
        {/* Platform Selection */}
        <div className="form-section">
          <h3>Select Platform</h3>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="platform"
                value="website"
                checked={platform === 'website'}
                onChange={(e) => setPlatform(e.target.value as 'website' | 'linkedin')}
              />
              <span className="radio-text">
                <span className="radio-title">Website Inquiry</span>
                <span className="radio-desc">Create inquiry tasks for company websites</span>
              </span>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="platform"
                value="linkedin"
                checked={platform === 'linkedin'}
                onChange={(e) => setPlatform(e.target.value as 'website' | 'linkedin')}
              />
              <span className="radio-text">
                <span className="radio-title">LinkedIn Inquiry</span>
                <span className="radio-desc">Create inquiry tasks for LinkedIn profiles (3-step process)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Category Selection */}
        <div className="form-section">
          <label htmlFor="category" className="form-label">
            Category <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            required
          >
            <option value="">-- Select a category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categories.length === 1 && (
            <p className="form-hint">
              ℹ You have access to only 1 category: {categories[0].name}
            </p>
          )}
        </div>

        {/* Items Input */}
        <div className="form-section">
          <label className="form-label">
            {platform === 'website' ? 'Company URLs' : 'LinkedIn Profile URLs'} <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-input-group">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  placeholder={
                    platform === 'website'
                      ? 'e.g., https://example.com'
                      : 'e.g., https://linkedin.com/in/johndoe'
                  }
                  className="form-input"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-item"
                    onClick={() => handleRemoveItem(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="btn-add-item"
          >
            + Add Another {platform === 'website' ? 'URL' : 'Profile'}
          </button>
        </div>

        {/* Summary */}
        <div className="form-section">
          <div className="summary-box">
            <p>
              <strong>Platform:</strong> {platform === 'website' ? 'Website Inquiry' : 'LinkedIn Inquiry (3-Step)'}
            </p>
            <p>
              <strong>Category:</strong> {categories.find((c) => c.id === selectedCategory)?.name || 'Not selected'}
            </p>
            <p>
              <strong>Tasks to Create:</strong> {items.filter((i) => i.trim().length > 0).length}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Inquiry Tasks'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubAdminCreateInquiryTasks;
