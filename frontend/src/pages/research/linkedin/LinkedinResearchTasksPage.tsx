import React, { useState, useEffect } from 'react';
import '../website/WebsiteResearchTasksPage.css';
import {
  researchApi,
  LinkedinResearchTask,
  SubmitLinkedinResearchPayload,
  Category,
} from '../../../api/research.api';
import { useAuth } from '../../../hooks/useAuth';

type LinkedinFormData = {
  contactName: string;
  contactLinkedinUrl: string;
  country: string;
  language: string;
};

export default function LinkedinResearchTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<LinkedinResearchTask[]>([]);
  const [activeTask, setActiveTask] = useState<LinkedinResearchTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submissionConfirmed, setSubmissionConfirmed] = useState(false);

  const [formData, setFormData] = useState<LinkedinFormData>({
    contactName: '',
    contactLinkedinUrl: '',
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

      const uniqueCategories = userCats && userCats.length > 0
        ? Array.from(new Map(userCats.map((cat: Category) => [cat.id, cat])).values())
        : [];

      setCategories(uniqueCategories);

      if (uniqueCategories && uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0].id);
      } else if (uniqueCategories && uniqueCategories.length > 1) {
        setSelectedCategory('');
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load your assigned categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchApi.getLinkedInTasks(selectedCategory || undefined);
      setTasks(data || []);
      setActiveTask(null);
      setFormData({ contactName: '', contactLinkedinUrl: '', country: '', language: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTask = (task: LinkedinResearchTask) => {
    setActiveTask(task);

    if (task.status === 'in_progress') {
      setFormData({
        contactName: task.name || '',
        contactLinkedinUrl: task.domain || '',
        country: task.country || '',
        language: '',
      });
    } else {
      setFormData({ contactName: '', contactLinkedinUrl: '', country: '', language: '' });
    }
    setSubmissionConfirmed(false);
  };

  const handleClaimTask = async () => {
    if (!activeTask) return;

    try {
      setLoading(true);
      const claimResponse = await researchApi.claimTask(activeTask.id);

      if (!claimResponse) {
        throw new Error('No response from claim endpoint');
      }

      const updatedTasks = tasks.map(t =>
        t.id === activeTask.id
          ? { ...t, status: 'in_progress' as const, assignedToUserId: user?.id || null }
          : t
      );
      setTasks(updatedTasks);

      const updatedTask = { ...activeTask, status: 'in_progress' as const, assignedToUserId: user?.id || null };
      setActiveTask(updatedTask);

      setFormData({
        contactName: updatedTask.name || '',
        contactLinkedinUrl: updatedTask.domain || '',
        country: updatedTask.country || '',
        language: '',
      });
    } catch (err: any) {
      console.error('[CLAIM] Error claiming task:', err);
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

    if (!formData.contactName.trim()) {
      alert('Please provide the contact name');
      return;
    }
    if (!formData.contactLinkedinUrl.trim()) {
      alert('Please provide the contact LinkedIn link');
      return;
    }
    if (!formData.country.trim()) {
      alert('Please provide the country');
      return;
    }
    if (!formData.language.trim()) {
      alert('Please provide the language');
      return;
    }

    try {
      setSubmitting(true);
      const payload: SubmitLinkedinResearchPayload = {
        taskId: activeTask.id,
        contactName: formData.contactName.trim(),
        contactLinkedinUrl: formData.contactLinkedinUrl.trim(),
        country: formData.country.trim(),
        language: formData.language.trim(),
      };

      await researchApi.submitLinkedinTask(payload);

      const updatedTasks = tasks.map(t =>
        t.id === activeTask.id ? { ...t, status: 'submitted' as const } : t,
      );
      setTasks(updatedTasks);

      const updatedTask = { ...activeTask, status: 'submitted' as const };
      setActiveTask(updatedTask);
      setSubmissionConfirmed(true);
    } catch (err: any) {
      console.error('[SUBMIT] Submit error:', err);
      alert(err.response?.data?.message || 'Failed to submit research');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(task =>
    (task.domain || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
  const submittedTasks = tasks.filter(t => t.status === 'submitted').length;

  const getStatusColor = (task: LinkedinResearchTask): string => {
    if (task.status === 'submitted') {
      return '#22c55e';
    }

    const isMine = task.assignedToUserId && user?.id && task.assignedToUserId === user.id;
    if (isMine) {
      return '#eab308';
    }

    return '#ef4444';
  };

  return (
    <div className="wb-res-tasks-container">
      <header className="wb-res-header">
        <div className="wb-res-title">
          <h1>LinkedIn Research Terminal</h1>
          <p>Analyze assigned LinkedIn profiles and submit validated contact details.</p>
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

      {categories.length > 0 && selectedCategory && (
        <div className="wb-res-main">
          <aside className="wb-res-list">
            <div className="list-search">
              <input
                type="text"
                placeholder="Search profile URL..."
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
                <div className={`priority-line`} style={{ backgroundColor: getStatusColor(task), height: '4px' }} />
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

          <main className="wb-res-editor">
            {!activeTask ? (
              <div className="empty-state">
                <div className="empty-icon">🔗</div>
                <h3>Select a profile to start research</h3>
                <p>Choose a task from the left panel to begin.</p>
              </div>
            ) : (
              <div className="editor-view">
                <div className="editor-header">
                  <h2>
                    Inspecting: <span className="domain-txt">{activeTask.domain}</span>
                  </h2>
                  <button
                    className="btn-open-site"
                    onClick={() => window.open(activeTask.domain.startsWith('http') ? activeTask.domain : `https://${activeTask.domain}`, '_blank')}
                  >
                    Open Profile ↗
                  </button>
                </div>

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
                        <strong>Profile:</strong> {activeTask.domain}
                      </div>
                      {activeTask.country && (
                        <div style={{ marginBottom: '10px', color: '#64748b', fontSize: '14px' }}>
                          <strong>Country:</strong> {activeTask.country}
                        </div>
                      )}
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

                {activeTask.status === 'in_progress' && (
                  <div className="editor-content">
                    <div className="form-group">
                      <label>LinkedIn Profile URL</label>
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

                    <div className="form-group">
                      <label>Contact Name <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="Enter or verify contact name..."
                        value={formData.contactName}
                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                        style={{ borderColor: '#3b82f6' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact LinkedIn Link <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.contactLinkedinUrl}
                        onChange={e => setFormData({ ...formData, contactLinkedinUrl: e.target.value })}
                        style={{ borderColor: '#3b82f6' }}
                      />
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
                    </div>

                    <div className="form-group">
                      <label>Language <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="e.g., English, Spanish, French, German..."
                        value={formData.language}
                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                        style={{ borderColor: '#3b82f6' }}
                      />
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

                {activeTask.status === 'submitted' && (
                  <div className="editor-content">
                    <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#1e40af' }}>
                      ✓ This task has been submitted and is awaiting audit.
                    </div>

                    <div className="form-group">
                      <label>LinkedIn Profile URL</label>
                      <input type="text" value={activeTask.domain} disabled style={{ background: '#f1f5f9' }} />
                    </div>

                    {activeTask.name && (
                      <div className="form-group">
                        <label>Contact Name</label>
                        <input type="text" value={activeTask.name} disabled style={{ background: '#f1f5f9' }} />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Country</label>
                      <input type="text" value={activeTask.country} disabled style={{ background: '#f1f5f9' }} />

                      {!submissionConfirmed && (
                        <div className="action-row" style={{ marginTop: '30px' }}>
                          <button
                            className="btn-submit-task"
                            onClick={() => {
                              setSubmissionConfirmed(true);
                              const updatedTasks = tasks.filter(t => t.id !== activeTask.id);
                              setTasks(updatedTasks);
                              setActiveTask(null);
                              setFormData({ contactName: '', contactLinkedinUrl: '', country: '', language: '' });
                            }}
                            style={{ width: '100%', padding: '12px', background: '#22c55e' }}
                          >
                            Understood
                          </button>
                        </div>
                      )}
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
