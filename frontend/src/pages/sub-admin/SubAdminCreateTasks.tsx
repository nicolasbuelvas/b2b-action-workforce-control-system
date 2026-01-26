import React, { useEffect, useMemo, useState } from 'react';
import {
  Category,
  CompanyType,
  CreateLinkedInResearchTaskPayload,
  CreateWebsiteResearchTaskPayload,
  JobType,
  createLinkedInResearchTasks,
  createWebsiteResearchTasks,
  getActiveCompanyTypes,
  getActiveJobTypes,
  getSubAdminCategories,
} from '../../api/subadmin.api';
import './SubAdminCreateTasks.css';

const toUnknown = (value?: string, fallback = 'unknown') => (value && value.trim() ? value.trim() : fallback);

type TaskType = 'website' | 'linkedin';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export default function SubAdminCreateTasks(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);

  const [categoryStatus, setCategoryStatus] = useState<LoadState>('idle');
  const [listsStatus, setListsStatus] = useState<LoadState>('idle');

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [taskType, setTaskType] = useState<TaskType>('website');
  const [categorySearch, setCategorySearch] = useState<string>('');

  const [jobTypeId, setJobTypeId] = useState('');
  const [companyTypeId, setCompanyTypeId] = useState('');

  const [websiteForm, setWebsiteForm] = useState({
    companyWebsite: '',
    companyName: '',
    country: '',
    language: '',
  });

  const [linkedinForm, setLinkedinForm] = useState({
    profileUrl: '',
    contactName: '',
    country: '',
    language: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load categories and type lists
  useEffect(() => {
    setCategoryStatus('loading');
    setListsStatus('loading');

    getSubAdminCategories()
      .then((data) => {
        // Deduplicate categories by ID
        const uniqueCategories = Array.from(
          new Map((data || []).map((cat) => [cat.id, cat])).values()
        );
        setCategories(uniqueCategories);
        if (uniqueCategories.length === 1) {
          setSelectedCategory(uniqueCategories[0].id);
        }
        setCategoryStatus('success');
      })
      .catch(() => setCategoryStatus('error'));

    Promise.all([getActiveJobTypes(), getActiveCompanyTypes()])
      .then(([jobs, companies]) => {
        setJobTypes(jobs || []);
        setCompanyTypes(companies || []);
        if (jobs?.length === 1) setJobTypeId(jobs[0].id);
        if (companies?.length === 1) setCompanyTypeId(companies[0].id);
        setListsStatus('success');
      })
      .catch(() => setListsStatus('error'));
  }, []);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const search = categorySearch.toLowerCase();
    return categories.filter((cat) => cat.name.toLowerCase().includes(search));
  }, [categories, categorySearch]);

  const categoryStateLabel = useMemo(() => {
    if (categoryStatus === 'loading') return 'Loading your categories...';
    if (categories.length === 0) return 'No categories assigned. Please contact Super Admin.';
    if (!selectedCategory && categories.length > 1) return 'Select a category to scope task creation.';
    return '';
  }, [categoryStatus, categories, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedCategory) {
      setError('Select a category before creating tasks.');
      return;
    }
    if (!jobTypeId || !companyTypeId) {
      setError('Job Type and Company Type are required.');
      return;
    }

    try {
      setSaving(true);

      if (taskType === 'website') {
        if (!websiteForm.companyWebsite.trim()) {
          throw new Error('Company Website is required.');
        }

        const payload: CreateWebsiteResearchTaskPayload = {
          categoryId: selectedCategory,
          jobTypeId,
          companyTypeId,
          companyWebsite: websiteForm.companyWebsite.trim(),
          companyName: toUnknown(websiteForm.companyName, 'Unknown'),
          country: toUnknown(websiteForm.country, 'Unknown'),
          language: toUnknown(websiteForm.language, 'unknown'),
        };

        await createWebsiteResearchTasks(payload);
        setSuccess('Website research task created successfully.');
        setWebsiteForm({ companyWebsite: '', companyName: '', country: '', language: '' });
      } else {
        if (!linkedinForm.profileUrl.trim()) {
          throw new Error('LinkedIn profile link is required.');
        }

        const payload: CreateLinkedInResearchTaskPayload = {
          categoryId: selectedCategory,
          jobTypeId,
          companyTypeId,
          profileUrl: linkedinForm.profileUrl.trim(),
          contactName: toUnknown(linkedinForm.contactName, 'Unknown'),
          country: toUnknown(linkedinForm.country, 'Unknown'),
          language: toUnknown(linkedinForm.language, 'unknown'),
        };

        await createLinkedInResearchTasks(payload);
        setSuccess('LinkedIn research task created successfully.');
        setLinkedinForm({ profileUrl: '', contactName: '', country: '', language: '' });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create task.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = Boolean(
    selectedCategory &&
    jobTypeId &&
    companyTypeId &&
    ((taskType === 'website' && websiteForm.companyWebsite.trim()) ||
      (taskType === 'linkedin' && linkedinForm.profileUrl.trim())),
  );

  return (
    <div className="sa-create-tasks">
      <header className="sa-create-header">
        <div>
          <p className="eyebrow">Management · Create Tasks</p>
          <h1>Create Research Tasks</h1>
          <p className="muted">
            Create Website or LinkedIn research tasks scoped to a single category. Job type and company type are mandatory.
          </p>
        </div>
      </header>

      <main className="sa-create-body">
        <section className="step-card">
          <div className="step-title">1. Select Category</div>
          {categoryStateLabel && (
            <div className="info-box">
              {categoryStateLabel}
            </div>
          )}

          {categories.length > 0 && (
            <>
              {categories.length > 5 && (
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              )}
              <div className="picker-grid">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`pill ${selectedCategory === cat.id ? 'pill-active' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))
                ) : (
                  <div className="empty-search">No categories match your search.</div>
                )}
              </div>
            </>
          )}
        </section>

        <section className="step-card">
          <div className="step-title">2. Task Type</div>
          <div className="task-type-grid">
            <button
              type="button"
              className={`type-card ${taskType === 'website' ? 'type-card-active' : ''}`}
              onClick={() => setTaskType('website')}
            >
              <div className="type-label">Website Research</div>
              <p>Create tasks for company website investigation.</p>
            </button>
            <button
              type="button"
              className={`type-card ${taskType === 'linkedin' ? 'type-card-active' : ''}`}
              onClick={() => setTaskType('linkedin')}
            >
              <div className="type-label">LinkedIn Research</div>
              <p>Create tasks for LinkedIn profile investigation.</p>
            </button>
          </div>
        </section>

        <form className="step-card" onSubmit={handleSubmit}>
          <div className="step-title">3. Task Details</div>

          <div className="field-grid">
            <div>
              <label>Job Type *</label>
              <select
                value={jobTypeId}
                onChange={(e) => setJobTypeId(e.target.value)}
                disabled={listsStatus === 'loading'}
              >
                <option value="">Select job type</option>
                {jobTypes.map((jt) => (
                  <option key={jt.id} value={jt.id}>{jt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Company Type *</label>
              <select
                value={companyTypeId}
                onChange={(e) => setCompanyTypeId(e.target.value)}
                disabled={listsStatus === 'loading'}
              >
                <option value="">Select company type</option>
                {companyTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
            </div>
          </div>

          {taskType === 'website' ? (
            <div className="form-stack">
              <div className="form-group">
                <label>Company Website Link *</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteForm.companyWebsite}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, companyWebsite: e.target.value })}
                  required
                />
              </div>
              <div className="field-grid">
                <div className="form-group">
                  <label>Company Name (optional)</label>
                  <input
                    type="text"
                    value={websiteForm.companyName}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, companyName: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="form-group">
                  <label>Country (optional)</label>
                  <input
                    type="text"
                    value={websiteForm.country}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Language (optional)</label>
                <input
                  type="text"
                  value={websiteForm.language}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, language: e.target.value })}
                  placeholder="English"
                />
                <small className="hint">If blank, we will store this as "unknown".</small>
              </div>
            </div>
          ) : (
            <div className="form-stack">
              <div className="form-group">
                <label>Contact LinkedIn Profile Link *</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinForm.profileUrl}
                  onChange={(e) => setLinkedinForm({ ...linkedinForm, profileUrl: e.target.value })}
                  required
                />
              </div>
              <div className="field-grid">
                <div className="form-group">
                  <label>Contact Name (optional)</label>
                  <input
                    type="text"
                    value={linkedinForm.contactName}
                    onChange={(e) => setLinkedinForm({ ...linkedinForm, contactName: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Country (optional)</label>
                  <input
                    type="text"
                    value={linkedinForm.country}
                    onChange={(e) => setLinkedinForm({ ...linkedinForm, country: e.target.value })}
                    placeholder="France"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Language (optional)</label>
                <input
                  type="text"
                  value={linkedinForm.language}
                  onChange={(e) => setLinkedinForm({ ...linkedinForm, language: e.target.value })}
                  placeholder="French"
                />
                <small className="hint">If blank, we will store this as "unknown".</small>
              </div>
            </div>
          )}

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <div className="actions-row">
            <div className="summary">
              <div>Category: {categories.find((c) => c.id === selectedCategory)?.name || 'Not selected'}</div>
              <div>Task Type: {taskType === 'website' ? 'Website Research' : 'LinkedIn Research'}</div>
            </div>
            <button type="submit" className="btn-primary" disabled={!canSubmit || saving}>
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
