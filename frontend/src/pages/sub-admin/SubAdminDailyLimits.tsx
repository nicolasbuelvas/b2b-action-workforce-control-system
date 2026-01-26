import React, { useState, useEffect } from 'react';
import { client } from '../../api/client';
import { getSubAdminCategories } from '../../api/subadmin.api';
import './SubAdminCRUD.css';

interface DailyLimit {
  id: string;
  categoryId: string;
  categoryName: string;
  role: string;
  maxTasksPerDay: number;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SubAdminDailyLimits(): JSX.Element {
  const [limits, setLimits] = useState<DailyLimit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    role: 'website_researcher',
    maxTasksPerDay: 50,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoriesData = await getSubAdminCategories();
      setCategories(categoriesData);

      // Placeholder - backend endpoint to be implemented
      // const response = await client.get('/subadmin/daily-limits');
      // setLimits(response.data || []);
      setLimits([]);
    } catch (err: any) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      categoryId: categories[0]?.id || '',
      role: 'website_researcher',
      maxTasksPerDay: 50,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Placeholder - backend endpoint to be implemented
      // await client.post('/subadmin/daily-limits', formData);
      alert('Daily limits functionality - backend endpoint to be implemented');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert('Failed to set daily limit');
    }
  };

  return (
    <div className="sa-crud-page">
      <header className="sa-page-header">
        <div>
          <h2>Daily Task Limits</h2>
          <p className="muted">
            Configure maximum daily task quotas per role per category
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Set Limit
        </button>
      </header>

      <main className="sa-main">
        {loading && <div className="loading-state">Loading limits...</div>}

        {!loading && (
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Role</th>
                  <th>Max Tasks/Day</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {limits.map((limit) => (
                  <tr key={limit.id}>
                    <td className="font-semibold">{limit.categoryName}</td>
                    <td>{limit.role}</td>
                    <td>{limit.maxTasksPerDay}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-sm btn-secondary">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {limits.length === 0 && (
              <div className="empty-state">
                <p>No daily limits configured yet.</p>
                <button className="btn-primary" onClick={handleCreate}>
                  Set First Limit
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Set Daily Limit</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="categoryId">Category *</label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                <label htmlFor="maxTasksPerDay">Max Tasks per Day *</label>
                <input
                  type="number"
                  id="maxTasksPerDay"
                  value={formData.maxTasksPerDay}
                  onChange={(e) => setFormData({ ...formData, maxTasksPerDay: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="1000"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Set Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
