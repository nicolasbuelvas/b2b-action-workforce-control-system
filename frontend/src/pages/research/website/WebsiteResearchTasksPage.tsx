import React, { useState, useEffect } from 'react';
import './WebsiteResearchTasksPage.css';
import { researchApi, WebsiteResearchTask, SubmitResearchPayload } from '../../../api/research.api';
import { getUserCategories } from '../../../api/admin.api';
import { useAuth } from '../../../hooks/useAuth';

type ResearchFormData = {
  email: string;
  phone: string;
  techStack: string;
  notes: string;
};

interface Category {
  id: string;
  name: string;
}

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
    email: '',
    phone: '',
    techStack: '',
    notes: ''
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
      const userCats = await getUserCategories(user.id);
      setCategories(userCats || []);
      
      // Auto-select first category if user has exactly one
      if (userCats && userCats.length === 1) {
        setSelectedCategory(userCats[0].id);
      } else if (userCats && userCats.length > 1) {
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
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchApi.getWebsiteTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (task: WebsiteResearchTask) => {
    if (task.status === 'in_progress') {
      // Already claimed, just select it
      setActiveTask(task);
      return;
    }

    try {
      setLoading(true);
      await researchApi.claimTask(task.id);
      
      // Update local state
      const updatedTasks = tasks.map(t =>
        t.id === task.id ? { ...t, status: 'in_progress' as const } : t
      );
      setTasks(updatedTasks);
      
      const updatedTask = { ...task, status: 'in_progress' as const };
      setActiveTask(updatedTask);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to claim task');
      console.error('Error claiming task:', err);
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
    if (!formData.email && !formData.phone) {
      alert('Please provide at least email or phone number');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload: SubmitResearchPayload = {
        taskId: activeTask.id,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        techStack: formData.techStack || undefined,
        notes: formData.notes || undefined,
      };

      await researchApi.submitTask(payload);

      // Update task status
      const updatedTasks = tasks.map(t =>
        t.id === activeTask.id ? { ...t, status: 'submitted' as const } : t
      );
      setTasks(updatedTasks);

      // Clear form and selection
      setFormData({ email: '', phone: '', techStack: '', notes: '' });
      setActiveTask(null);

      alert('Research submitted successfully! Awaiting audit.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit research');
      console.error('Error submitting:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving if needed
    alert('Draft functionality not yet implemented');
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
              onClick={() => handleClaimTask(task)}
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

              {activeTask.status === 'submitted' && (
                <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#1e40af' }}>
                  This task has been submitted and is awaiting audit.
                </div>
              )}

              <div className="editor-grid">
                {/* DATA EXTRACTION */}
                <section className="form-section">
                  <h3>Required Data Extraction</h3>

                  <div className="form-group">
                    <label>Corporate Email</label>
                    <input
                      type="email"
                      placeholder="info@company.com"
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={activeTask.status === 'submitted'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 555..."
                      value={formData.phone}
                      onChange={e =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={activeTask.status === 'submitted'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Identified Tech Stack</label>
                    <textarea
                      placeholder="React, Cloudflare, AWS, etc."
                      value={formData.techStack}
                      onChange={e =>
                        setFormData({ ...formData, techStack: e.target.value })
                      }
                      disabled={activeTask.status === 'submitted'}
                    />
                  </div>
                </section>

                {/* SUBMISSION */}
                <section className="submission-section">
                  <div className="evidence-upload-area">
                    <h3>Proof of Existence</h3>
                    <p>Upload evidence from About / Contact pages.</p>

                    <div className="drop-zone">
                      <div className="drop-icon">📁</div>
                      <p>File upload coming soon</p>
                    </div>
                  </div>

                  <div className="submission-notes">
                    <h3>Internal Notes</h3>
                    <textarea
                      placeholder="Optional notes for the auditor..."
                      value={formData.notes}
                      onChange={e =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      disabled={activeTask.status === 'submitted'}
                    />
                  </div>

                  <div className="action-row">
                    <button 
                      className="btn-save-draft" 
                      onClick={handleSaveDraft}
                      disabled={activeTask.status === 'submitted' || submitting}
                    >
                      Save Draft
                    </button>
                    <button 
                      className="btn-submit-task"
                      onClick={handleSubmit}
                      disabled={activeTask.status === 'submitted' || submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit for Audit'}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
      )}
    </div>
  );
}