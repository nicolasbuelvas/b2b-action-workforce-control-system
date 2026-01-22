import React, { useState, useEffect } from 'react';
import './WebsiteResearchTasksPage.css';
import { researchApi, WebsiteResearchTask, SubmitResearchPayload, Category } from '../../../api/research.api';
import { useAuth } from '../../../hooks/useAuth';

type ResearchFormData = {
  companyName: string;
  country: string;
  language: string;
};

export default function WebsiteResearchTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<WebsiteResearchTask[]>([]);
  const [activeTask, setActiveTask] = useState<WebsiteResearchTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState<ResearchFormData>({
    companyName: '',
    country: '',
    language: '',
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  // Load tasks when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      loadTasks();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingCategories(true);
      const userCats = await researchApi.getMyCategories();
      
      // DEBUG: Log raw response
      console.log('Raw categories from API:', userCats);
      console.log('Category count:', userCats?.length);
      if (userCats && userCats.length > 0) {
        console.log('First category ID:', userCats[0].id);
        console.log('All category IDs:', userCats.map((c: any) => c.id));
      }
      
      // Deduplicate categories by id before setting state
      const uniqueCategories = userCats && userCats.length > 0
        ? Array.from(new Map(userCats.map((cat: Category) => [cat.id, cat])).values())
        : [];
      
      console.log('After deduplication:', uniqueCategories.length, 'unique categories');
      
      setCategories(uniqueCategories);
      
      // Auto-select first category if user has exactly one
      if (uniqueCategories && uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0].id);
      } else if (uniqueCategories && uniqueCategories.length > 1) {
        // Let user choose - don't auto-select
        setSelectedCategory('');
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load your assigned categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load tasks on mount
  useEffect(() => {
    if (selectedCategory) {
      loadTasks();
    }
  }, [selectedCategory]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load tasks filtered by selected category (if available)
      const data = await researchApi.getWebsiteTasks(selectedCategory || undefined);
      
      console.log('Loaded tasks for category:', selectedCategory, 'Count:', data?.length);
      
      setTasks(data || []);
      setActiveTask(null); // Clear active task when switching categories
      setFormData({ companyName: '', country: '', language: '' }); // Clear form
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTask = (task: WebsiteResearchTask) => {
    // Just select the task - don't claim yet
    setActiveTask(task);
    
    // If already claimed, pre-fill form
    if (task.status === 'in_progress') {
      setFormData({
        companyName: task.name || '',
        country: task.country || '',
        language: '',
      });
    } else {
      // Clear form for unclaimed tasks
      setFormData({
        companyName: '',
        country: '',
        language: '',
      });
    }
  };

  const handleClaimTask = async () => {
    if (!activeTask) return;

    try {
      setLoading(true);
      console.log('[CLAIM] Claiming task:', activeTask.id);
      const claimResponse = await researchApi.claimTask(activeTask.id);
      console.log('[CLAIM] Claim response:', claimResponse);
      console.log('[CLAIM] Response assignedToUserId:', claimResponse?.assignedToUserId);
      
      // Verify claim was successful
      if (!claimResponse) {
        throw new Error('No response from claim endpoint');
      }
      
      // Update local state with response data
      const updatedTasks = tasks.map(t =>
        t.id === activeTask.id ? { ...t, status: 'in_progress' as const } : t
      );
      setTasks(updatedTasks);
      
      const updatedTask = { ...activeTask, status: 'in_progress' as const };
      setActiveTask(updatedTask);
      
      console.log('[CLAIM] Task successfully claimed and updated in state');
      
      // Pre-fill form with system data
      setFormData({
        companyName: activeTask.name || '',
        country: activeTask.country || '',
        language: '',
      });
    } catch (err: any) {
      console.error('[CLAIM] Error claiming task:', err);
      console.error('[CLAIM] Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to claim task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeTask) return;

    if (activeTask.status !== 'in_progress') {
      alert('Please claim this task before submitting');
      return;
    }

    // Basic validation
    if (!formData.companyName || !formData.companyName.trim()) {
      alert('Please provide the company name');
      return;
    }
    if (!formData.country || !formData.country.trim()) {
      alert('Please provide the country');
      return;
    }
    if (!formData.language || !formData.language.trim()) {
      alert('Please provide the website language');
      return;
    }

    try {
      setSubmitting(true);
      
      // Build payload - only language field
      const payload: SubmitResearchPayload = {
        taskId: activeTask.id,
        language: formData.language.trim(),
      };

      console.log('[SUBMIT] Submitting task:', activeTask.id);
      console.log('[SUBMIT] Payload:', payload);
      console.log('[SUBMIT] Active task status:', activeTask.status);

      await researchApi.submitTask(payload);

      console.log('[SUBMIT] Task submitted successfully');

      // Remove task from list after successful submission
      const updatedTasks = tasks.filter(t => t.id !== activeTask.id);
      setTasks(updatedTasks);

      // Clear form and selection
      setFormData({ companyName: '', country: '', language: '' });
      setActiveTask(null);

      alert('Research submitted successfully! Awaiting audit.');
    } catch (err: any) {
      console.error('[SUBMIT] Submit error:', err);
      console.error('[SUBMIT] Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to submit research');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
  const submittedTasks = tasks.filter(t => t.status === 'submitted').length;

  return (
    <div className="wb-res-tasks-container">
      {/* HEADER */}
      <header className="wb-res-header">
        <div className="wb-res-title">
          <h1>Website Intelligence Terminal</h1>
          <p>Analyze assigned domains and extract validated corporate intelligence.</p>
        </div>

        <div className="wb-res-stats">
          <div className="res-stat-item">Active Tasks: {activeTasks}</div>
          <div className="res-stat-item">Daily Progress: {submittedTasks}</div>
        </div>
      </header>

      {error && (
        <div style={{ background: '#fee', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#c00' }}>
          {error}
        </div>
      )}

      {/* CATEGORY DEPENDENCY SECTION */}
      {loadingCategories && (
        <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          Loading your assigned categories...
        </div>
      )}

      {!loadingCategories && categories.length === 0 && (
        <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>⚠️ No Categories Assigned</h3>
          <p style={{ margin: 0, color: '#991b1b' }}>
            You are not assigned to any category. Please contact an administrator to assign you to categories before you can access research tasks.
          </p>
        </div>
      )}

      {!loadingCategories && categories.length > 0 && categories.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Select Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <option value="">Choose a category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!loadingCategories && categories.length > 0 && !selectedCategory && categories.length > 1 && (
        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fcd34d' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            📁 Please select a category from above to view available tasks.
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#c00' }}>
          {error}
        </div>
      )}

      {/* MAIN */}
      {categories.length > 0 && selectedCategory && (
      <div className="wb-res-main">
        {/* TASK LIST */}
        <aside className="wb-res-list">
          <div className="list-search">
            <input 
              type="text" 
              placeholder="Search domain..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading && tasks.length === 0 && (
            <div className="empty-list">
              <p>Loading tasks...</p>
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <div className="empty-list">
              <p>No tasks available.</p>
            </div>
          )}

          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`target-card ${activeTask?.id === task.id ? 'active' : ''}`}
              onClick={() => handleSelectTask(task)}
            >
              <div className={`priority-line ${task.priority}`} />
              <div className="target-card-info">
                <h4>{task.domain}</h4>
                <div className="target-card-meta">
                  <span>{task.country}</span>
                  <span>•</span>
                  <span>{task.priority.toUpperCase()}</span>
                  <span>•</span>
                  <span>{task.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </aside>

        {/* EDITOR */}
        <main className="wb-res-editor">
          {!activeTask ? (
            <div className="empty-state">
              <div className="empty-icon">🌐</div>
              <h3>Select a domain to start research</h3>
              <p>Choose a task from the left panel to begin.</p>
            </div>
          ) : (
            <div className="editor-view">
              <div className="editor-header">
                <h2>
                  Inspecting:{' '}
                  <span className="domain-txt">{activeTask.domain}</span>
                </h2>
                <button
                  className="btn-open-site"
                  onClick={() =>
                    window.open(`https://${activeTask.domain}`, '_blank')
                  }
                >
                  Open Website ↗
                </button>
              </div>

              {/* UNCLAIMED TASK - SHOW CLAIM BUTTON */}
              {activeTask.status === 'unassigned' && (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fcd34d' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>🔒 Task Not Claimed</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#78350f' }}>
                      You must claim this task before you can enter research data.
                    </p>
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px', color: '#64748b', fontSize: '14px' }}>
                      <strong>Domain:</strong> {activeTask.domain}
                    </div>
                    {activeTask.name && (
                      <div style={{ marginBottom: '10px', color: '#64748b', fontSize: '14px' }}>
                        <strong>Company:</strong> {activeTask.name}
                      </div>
                    )}
                    <div style={{ marginBottom: '10px', color: '#64748b', fontSize: '14px' }}>
                      <strong>Country:</strong> {activeTask.country}
                    </div>
                  </div>

                  <button
                    className="btn-submit-task"
                    onClick={handleClaimTask}
                    disabled={loading}
                    style={{ padding: '12px 40px', fontSize: '16px' }}
                  >
                    {loading ? 'Claiming...' : 'Claim Task'}
                  </button>
                </div>
              )}

              {/* CLAIMED TASK - SHOW EDITABLE FORM */}
              {activeTask.status === 'in_progress' && (
                <div className="editor-content">
                  {/* READ-ONLY SYSTEM FIELD */}
                  <div className="form-group">
                    <label>Company Link (Domain)</label>
                    <input
                      type="text"
                      value={activeTask.domain}
                      disabled
                      style={{ background: '#f1f5f9', cursor: 'not-allowed', fontWeight: '500' }}
                    />
                    <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '12px' }}>
                      System-provided, cannot be changed
                    </small>
                  </div>

                  <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                  {/* EDITABLE RESEARCH FIELDS */}
                  <div className="form-group">
                    <label>Company Name <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="Enter or verify company name..."
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      style={{ borderColor: '#3b82f6' }}
                    />
                    <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '12px' }}>
                      Verify or correct the company name from the website
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Country <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="Enter or verify country..."
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      style={{ borderColor: '#3b82f6' }}
                    />
                    <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '12px' }}>
                      Verify or correct the country from the website
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Website Language <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g., English, Spanish, French, German..."
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                      style={{ borderColor: '#3b82f6' }}
                    />
                    <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '12px' }}>
                      Primary language of the website content
                    </small>
                  </div>

                  <div className="action-row" style={{ marginTop: '30px' }}>
                    <button 
                      className="btn-submit-task"
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{ width: '100%', padding: '12px' }}
                    >
                      {submitting ? 'Submitting...' : 'Submit for Audit'}
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMITTED TASK - READ-ONLY VIEW */}
              {activeTask.status === 'submitted' && (
                <div className="editor-content">
                  <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#1e40af' }}>
                    ✓ This task has been submitted and is awaiting audit.
                  </div>
                  
                  <div className="form-group">
                    <label>Company Link (Domain)</label>
                    <input type="text" value={activeTask.domain} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  
                  {activeTask.name && (
                    <div className="form-group">
                      <label>Company Name</label>
                      <input type="text" value={activeTask.name} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" value={activeTask.country} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      )}
    </div>
  );
}