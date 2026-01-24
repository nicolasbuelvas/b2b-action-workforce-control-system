import React, { useMemo, useState, useEffect } from 'react';
import './WebsiteInquiryTasksPage.css';
import { inquiryApi, InquiryTask } from '../../../api/inquiry.api';
import { researchApi, Category } from '../../../api/research.api';
import { useAuth } from '../../../hooks/useAuth';

const FILE_SIZE_LIMIT = 500 * 1024;
const ALLOWED_FORMATS = ['image/png', 'image/jpeg'];

interface OutreachTemplate {
  title: string;
  content: string;
}

const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    title: 'Partnership Inquiry',
    content: `Hi there,\n\nI came across your website and was impressed by your work in [industry/field]. We specialize in [your service/product] and believe there could be valuable synergies between our companies.\n\nWould you be open to a brief call to explore potential collaboration opportunities?\n\nBest regards`
  },
  {
    title: 'Service Introduction',
    content: `Hello,\n\nI noticed your company is active in [specific area]. We provide [specific service] that has helped similar businesses achieve [specific benefit].\n\nI'd love to share how we might be able to support your goals. Would you have 15 minutes for a quick chat?\n\nThank you`
  },
  {
    title: 'Business Development',
    content: `Dear Team,\n\nYour company's approach to [specific aspect] caught my attention. We work with organizations like yours to [value proposition].\n\nI believe there's potential for a mutually beneficial relationship. Are you available for a brief discussion next week?\n\nLooking forward to connecting`
  }
];

export default function WebsiteInquiryTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<InquiryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<InquiryTask | null>(null);
  const [claimedTaskId, setClaimedTaskId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [messageTitle, setMessageTitle] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  const getCurrentUserId = (): string | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(window.atob(payload));
      return decoded.sub || null;
    } catch {
      return null;
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  // Load tasks when category changes
  useEffect(() => {
    if (selectedCategory || (!loadingCategories && categories.length > 0)) {
      loadTasks();
    }
  }, [selectedCategory, loadingCategories]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const rawCategories = await researchApi.getMyCategories();

      // Support both array and wrapped data shapes
      const list: Category[] = Array.isArray(rawCategories)
        ? rawCategories
        : (Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : []);

      console.log('[Inquirer] Raw categories from API:', rawCategories);
      const uniqueCategories = list && list.length > 0
        ? Array.from(new Map(list.map((cat: Category) => [cat.id, cat])).values())
        : [];

      console.log('[Inquirer] Unique categories:', uniqueCategories.length, uniqueCategories.map(c => c.id));
      setCategories(uniqueCategories);
      
      // Auto-select first category if user has exactly one
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
      const data = await inquiryApi.getWebsiteTasks();
      
      // Filter by selected category (client-side for consistency)
      // Backend already filters by inquirer's categories
      const filtered = selectedCategory
        ? (data || []).filter(t => t.categoryId === selectedCategory)
        : (data || []);
      
      setTasks(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task: InquiryTask) => {
    const userId = getCurrentUserId();
    const isAlreadyClaimed = task.status === 'IN_PROGRESS' && task.assignedToUserId === userId;
    
    setSelectedTask(task);
    
    if (isAlreadyClaimed) {
      setClaimedTaskId(task.id);
    } else {
      setClaimedTaskId(null);
    }
    
    setClaiming(false);
    setTemplateIndex(0);
    setMessageTitle(OUTREACH_TEMPLATES[0].title);
    setMessageContent(OUTREACH_TEMPLATES[0].content);
    setProofFile(null);
    setPreviewUrl('');
    setFileError('');
    setSubmitError('');
    setDuplicateWarning('');
  };

  const handleClaimTask = async () => {
    if (!selectedTask) return;

    try {
      setClaiming(true);
      setSubmitError('');
      const result = await inquiryApi.takeTask(selectedTask.id);
      setClaimedTaskId(result.id);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to claim task');
      console.error('Error claiming task:', err);
    } finally {
      setClaiming(false);
    }
  };

  const handlePrevTemplate = () => {
    const newIndex = templateIndex === 0 ? OUTREACH_TEMPLATES.length - 1 : templateIndex - 1;
    setTemplateIndex(newIndex);
    setMessageTitle(OUTREACH_TEMPLATES[newIndex].title);
    setMessageContent(OUTREACH_TEMPLATES[newIndex].content);
  };

  const handleNextTemplate = () => {
    const newIndex = (templateIndex + 1) % OUTREACH_TEMPLATES.length;
    setTemplateIndex(newIndex);
    setMessageTitle(OUTREACH_TEMPLATES[newIndex].title);
    setMessageContent(OUTREACH_TEMPLATES[newIndex].content);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');

    if (file.size > FILE_SIZE_LIMIT) {
      setFileError(`File too large. Maximum size is 500 KB. Your file is ${(file.size / 1024).toFixed(2)} KB.`);
      setProofFile(null);
      setPreviewUrl('');
      return;
    }

    if (!ALLOWED_FORMATS.includes(file.type)) {
      setFileError('Invalid format. Allowed: PNG, JPG, JPEG');
      setProofFile(null);
      setPreviewUrl('');
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!claimedTaskId || !proofFile) return;

    try {
      setSubmitting(true);
      setSubmitError('');
      setDuplicateWarning('');
      
      const response = await inquiryApi.submitAction(
        claimedTaskId,
        'EMAIL',
        proofFile,
      );
      
      // Check if response indicates duplicate screenshot
      if (response?.screenshotDuplicate) {
        setDuplicateWarning('Screenshot accepted (duplicate). Auditor will see duplicate flag.');
      }
      
      // Clear form and remove task from list
      setTasks(tasks.filter(t => t.id !== selectedTask?.id));
      setSelectedTask(null);
      setClaimedTaskId(null);
      setProofFile(null);
      setPreviewUrl('');
      setMessageTitle('');
      setMessageContent('');
    } catch (err: any) {
      // Show backend error message if available, otherwise show generic message
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to submit inquiry';
      setSubmitError(errorMessage);
      console.error('Error submitting inquiry:', err);
      // Do not clear task state - allow user to retry with different file
    } finally {
      setSubmitting(false);
    }
  };

  const hasTasks = useMemo(() => tasks.length > 0, [tasks]);
  const canSubmit = claimedTaskId && proofFile && !submitting;

  const getStatusColor = (task: InquiryTask): string => {
    if (task.status === 'SUBMITTED') {
      return '#22c55e'; // GREEN - Submitted
    }

    if (task.status === 'IN_PROGRESS') {
      return '#eab308'; // YELLOW - In progress (claimed)
    }

    return '#ef4444'; // RED - Not claimed or other states
  };

  if (loadingCategories) {
    return <div className="inq-state-screen"><p>Loading categories…</p></div>;
  }

  if (categories.length === 0) {
    return <div className="inq-state-screen"><p>No categories assigned. Contact administrator.</p></div>;
  }

  return (
    <div className="inq-tasks-container">
      {/* CATEGORY SELECTOR - ALWAYS VISIBLE */}
      {categories.length > 1 && (
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
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* WARNING IF NO CATEGORY SELECTED */}
      {!selectedCategory && categories.length > 1 && (
        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fcd34d' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            📁 Please select a category from above to view available tasks.
          </p>
        </div>
      )}

      {/* MAIN CONTENT - ONLY SHOW IF CATEGORY SELECTED */}
      {selectedCategory && categories.length > 0 && (
        <>
          <header className="inq-tasks-header">
            <div className="title-group">
              <h1>Website Outreach Tasks</h1>
              <p>Claim approved research, execute contact actions, and submit verifiable proof.</p>
            </div>
            <div className="task-counter">
              <span>Available Tasks: <strong>{tasks.length}</strong></span>
            </div>
          </header>

          {loading && (
            <div className="loading-state">
              <p>Loading tasks...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="inq-layout">
              <aside className="tasks-sidebar">
                {!hasTasks && (
                  <div className="empty-tasks">
                    <p>No approved research available at the moment.</p>
                  </div>
                )}

                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`task-selector-card ${selectedTask?.id === task.id ? 'active' : ''}`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="priority-line" style={{ backgroundColor: getStatusColor(task), height: '4px' }} />
                    <div className="task-id-badge">RESEARCH</div>
                    <h4>{task.companyName || task.companyDomain}</h4>
                    <p className="task-category">{task.categoryName}</p>
                    <p className="task-country">{task.companyCountry || 'Global'}</p>
                    <div className="task-footer">
                      <span className="status">Ready for Inquiry</span>
                    </div>
                  </div>
                ))}
              </aside>

              <main className="task-execution-area">
            {!selectedTask ? (
              <div className="no-task-selected">
                <div className="empty-illustration">📨</div>
                <h3>Select a research to begin outreach</h3>
                <p>Claim the task, review research details, and submit contact proof.</p>
              </div>
            ) : (
              <div className="execution-card">
                {!claimedTaskId ? (
                  <div className="claim-section">
                    <div className="claim-box">
                      <h2>Ready to Start Outreach</h2>
                      <div className="claim-info">
                        <p><strong>Company:</strong> {selectedTask.companyName}</p>
                        <p><strong>Domain:</strong> {selectedTask.companyDomain}</p>
                        <p><strong>Category:</strong> {selectedTask.categoryName}</p>
                      </div>
                      {submitError && <div className="submit-error">{submitError}</div>}
                      <button
                        className="btn-claim"
                        onClick={handleClaimTask}
                        disabled={claiming}
                      >
                        {claiming ? 'Claiming...' : 'Claim This Task'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="card-section research-context">
                      <h2>Research Context (Read-Only)</h2>
                  <div className="context-grid">
                    <div className="context-item">
                      <label>Company Name</label>
                      <p>{selectedTask.companyName}</p>
                    </div>
                    <div className="context-item">
                      <label>Website</label>
                      <a href={`https://${selectedTask.companyDomain}`} target="_blank" rel="noreferrer">
                        {selectedTask.companyDomain}
                      </a>
                    </div>
                    <div className="context-item">
                      <label>Country</label>
                      <p>{selectedTask.companyCountry || 'N/A'}</p>
                    </div>
                    <div className="context-item">
                      <label>Category</label>
                      <p>{selectedTask.categoryName}</p>
                    </div>
                    {selectedTask.contactName && (
                      <div className="context-item">
                        <label>Contact Name</label>
                        <p>{selectedTask.contactName}</p>
                      </div>
                    )}
                    {selectedTask.email && (
                      <div className="context-item">
                        <label>Email</label>
                        <p>{selectedTask.email}</p>
                      </div>
                    )}
                    <div className="context-item">
                      <label>Research Task ID</label>
                      <code className="task-id">{selectedTask.id}</code>
                    </div>
                  </div>
                    </div>

                    <div className="card-section message-section">
                      <h2>Outreach Message Template</h2>
                      <div className="template-selector">
                        <button
                          className="btn-template-nav"
                          onClick={handlePrevTemplate}
                          type="button"
                        >
                          ←
                        </button>
                        <span className="template-indicator">
                          Template {templateIndex + 1} of {OUTREACH_TEMPLATES.length}
                        </span>
                        <button
                          className="btn-template-nav"
                          onClick={handleNextTemplate}
                          type="button"
                        >
                          →
                        </button>
                      </div>
                      <div className="message-fields">
                        <div className="message-field">
                          <label>Subject / Title</label>
                          <input
                            type="text"
                            className="message-title-input"
                            value={messageTitle}
                            onChange={(e) => setMessageTitle(e.target.value)}
                            placeholder="Message subject"
                          />
                        </div>
                        <div className="message-field">
                          <label>Message Content</label>
                          <textarea
                            className="message-textarea"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Message content..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="card-section proof-section">
                  <h2>Upload Proof of Contact</h2>
                  <p className="proof-requirements">Maximum file size: 500 KB | Formats: PNG, JPG, JPEG</p>

                  <div className="upload-zone">
                    <div className="upload-icon">📸</div>
                    <p className="upload-text">Upload a screenshot showing the company website and your outreach message.</p>
                    <input
                      type="file"
                      id="proof-upload"
                      accept=".png,.jpg,.jpeg"
                      hidden
                      onChange={handleFileChange}
                    />
                    <label htmlFor="proof-upload" className="btn-upload">
                      Select Image
                    </label>
                    {fileError && <p className="file-error">{fileError}</p>}
                    {proofFile && <p className="file-name">✓ {proofFile.name}</p>}
                  </div>

                  {previewUrl && (
                    <div className="preview-container">
                      <img src={previewUrl} alt="Preview" className="preview-image" />
                    </div>
                  )}
                    </div>

                    {submitError && <div className="submit-error">{submitError}</div>}
                    
                    {duplicateWarning && (
                      <div className="submit-warning" style={{
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        color: '#92400e',
                        fontSize: '14px',
                      }}>
                        ⚠️ {duplicateWarning}
                      </div>
                    )}

                    <div className="action-buttons">
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setSelectedTask(null);
                          setClaimedTaskId(null);
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-submit"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                      >
                        {submitting ? 'Submitting...' : 'Submit for Review'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
          )}
        </>
      )}
    </div>
  );
}