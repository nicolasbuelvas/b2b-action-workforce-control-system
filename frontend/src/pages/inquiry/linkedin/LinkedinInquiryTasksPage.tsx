import React, { useState, useEffect, useMemo } from 'react';
import './LinkedinInquiryTasksPage.css';
import { inquiryApi, InquiryTask } from '../../../api/inquiry.api';
import { researchApi, Category } from '../../../api/research.api';
import { useAuth } from '../../../hooks/useAuth';

const FILE_SIZE_LIMIT = 500 * 1024;
const ALLOWED_FORMATS = ['image/png', 'image/jpeg'];

// LinkedIn action templates for 3 steps
interface ActionTemplate {
  step: number;
  title: string;
  action: string;
  instruction: string;
  templates: { title: string; content: string }[];
}

const LINKEDIN_ACTIONS: ActionTemplate[] = [
  {
    step: 1,
    title: 'Step 1: Outreach',
    action: 'LINKEDIN_OUTREACH',
    instruction: 'Open LinkedIn profile, send connection request with personalized note. Screenshot must show LinkedIn URL and message.',
    templates: [
      {
        title: 'B2B Partnership',
        content: `Hi [Name],\n\nI noticed your work in [industry]. We help companies like yours with [value proposition]. Would love to connect and explore potential collaboration opportunities.\n\nBest regards`
      },
      {
        title: 'Industry Introduction',
        content: `Hello [Name],\n\nYour experience in [field] caught my attention. We specialize in [service] and I believe there could be valuable synergies. Looking forward to connecting.\n\nThank you`
      },
      {
        title: 'Direct Outreach',
        content: `Hi [Name],\n\nI'm reaching out regarding potential partnership opportunities between our companies. Would you be open to a brief conversation?\n\nBest`
      }
    ]
  },
  {
    step: 2,
    title: 'Step 2: Ask for Email',
    action: 'LINKEDIN_EMAIL_REQUEST',
    instruction: 'If connection accepted, send message asking for email contact. Screenshot must show reply and email (if provided).',
    templates: [
      {
        title: 'Email Request',
        content: `Hi [Name],\n\nThank you for connecting! I'd like to share some detailed information about our services. Would you mind sharing your business email so I can send you our portfolio?\n\nAppreciate it!`
      },
      {
        title: 'Professional Follow-up',
        content: `Hello [Name],\n\nGreat to be connected! I have some materials I'd like to share that might interest you. Could you please provide your email address?\n\nThanks in advance!`
      },
      {
        title: 'Direct Email Ask',
        content: `Hi [Name],\n\nI'd like to send you detailed information. What's the best email to reach you?\n\nThank you!`
      }
    ]
  },
  {
    step: 3,
    title: 'Step 3: Send Catalogue + Price List',
    action: 'LINKEDIN_CATALOGUE',
    instruction: 'If no email provided, send catalogue and price list via LinkedIn message. Screenshot must show the sent files/links and message.',
    templates: [
      {
        title: 'Catalogue Share',
        content: `Hi [Name],\n\nAs discussed, here's our product catalogue and current pricing. Please review and let me know if you have any questions or would like to discuss further.\n\n[Attach catalogue PDF/link]\n[Attach price list]\n\nLooking forward to your feedback!`
      },
      {
        title: 'Materials Delivery',
        content: `Hello [Name],\n\nI'm sharing our complete product information and pricing structure. Feel free to reach out with any questions.\n\n[Catalogue link]\n[Pricing document]\n\nBest regards`
      },
      {
        title: 'Direct Send',
        content: `Hi [Name],\n\nHere are the materials:\n\n• Product Catalogue: [link]\n• Price List: [link]\n\nLet me know your thoughts!`
      }
    ]
  }
];

export default function LinkedinInquiryTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<InquiryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<InquiryTask | null>(null);
  const [claimedTaskId, setClaimedTaskId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, or 3
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

      const list: Category[] = Array.isArray(rawCategories)
        ? rawCategories
        : (Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : []);

      const uniqueCategories = list && list.length > 0
        ? Array.from(new Map(list.map((cat: Category) => [cat.id, cat])).values())
        : [];

      setCategories(uniqueCategories);
      
      if (uniqueCategories && uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0].id);
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
      const data = await inquiryApi.getLinkedInTasks();
      const currentUserId = getCurrentUserId();
      
      const categoryFiltered = selectedCategory
        ? (data || []).filter(t => t.categoryId === selectedCategory)
        : (data || []);

      const visibilityFiltered = categoryFiltered.filter(task =>
        task.status === 'PENDING' ||
        (task.status === 'IN_PROGRESS' && currentUserId && task.assignedToUserId === currentUserId)
      );
      
      setTasks(visibilityFiltered);

      if (selectedTask && !visibilityFiltered.some(t => t.id === selectedTask.id)) {
        setSelectedTask(null);
        setClaimedTaskId(null);
      }
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
    setCurrentStep(1);
    setTemplateIndex(0);
    setMessageTitle(LINKEDIN_ACTIONS[0].templates[0].title);
    setMessageContent(LINKEDIN_ACTIONS[0].templates[0].content);
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
    const currentAction = LINKEDIN_ACTIONS[currentStep - 1];
    const newIndex = templateIndex === 0 ? currentAction.templates.length - 1 : templateIndex - 1;
    setTemplateIndex(newIndex);
    setMessageTitle(currentAction.templates[newIndex].title);
    setMessageContent(currentAction.templates[newIndex].content);
  };

  const handleNextTemplate = () => {
    const currentAction = LINKEDIN_ACTIONS[currentStep - 1];
    const newIndex = (templateIndex + 1) % currentAction.templates.length;
    setTemplateIndex(newIndex);
    setMessageTitle(currentAction.templates[newIndex].title);
    setMessageContent(currentAction.templates[newIndex].content);
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

  const handleSubmitStep = async () => {
    if (!claimedTaskId || !proofFile) return;

    try {
      setSubmitting(true);
      setSubmitError('');
      setDuplicateWarning('');
      
      const currentAction = LINKEDIN_ACTIONS[currentStep - 1];
      const response = await inquiryApi.submitAction(
        claimedTaskId,
        currentAction.action as any,
        proofFile,
      );
      
      if (response?.screenshotDuplicate) {
        setDuplicateWarning('Screenshot accepted (duplicate). Auditor will see duplicate flag.');
      }
      
      // Move to next step or complete task
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        setTemplateIndex(0);
        const nextAction = LINKEDIN_ACTIONS[currentStep]; // currentStep is already incremented in mind
        setMessageTitle(nextAction.templates[0].title);
        setMessageContent(nextAction.templates[0].content);
        setProofFile(null);
        setPreviewUrl('');
        setFileError('');
        setDuplicateWarning('');
      } else {
        // All 3 steps completed - remove task from list
        setTasks(tasks.filter(t => t.id !== selectedTask?.id));
        setSelectedTask(null);
        setClaimedTaskId(null);
        setCurrentStep(1);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to submit action';
      setSubmitError(errorMessage);
      console.error('Error submitting action:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const hasTasks = useMemo(() => tasks.length > 0, [tasks]);
  const canSubmit = claimedTaskId && proofFile && !submitting;
  const currentAction = LINKEDIN_ACTIONS[currentStep - 1];

  const getStatusColor = (task: InquiryTask): string => {
    if (task.status === 'SUBMITTED') return '#22c55e';
    if (task.status === 'IN_PROGRESS') return '#eab308';
    return '#ef4444';
  };

  if (loadingCategories) {
    return <div className="inq-state-screen"><p>Loading categories…</p></div>;
  }

  if (categories.length === 0) {
    return <div className="inq-state-screen"><p>No categories assigned. Contact administrator.</p></div>;
  }

  return (
    <div className="inq-tasks-container">
      {/* CATEGORY SELECTOR */}
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

      {/* MAIN CONTENT */}
      {selectedCategory && categories.length > 0 && (
        <>
          <header className="inq-tasks-header">
            <div className="title-group">
              <h1>LinkedIn Outreach Tasks</h1>
              <p>Execute 3-step LinkedIn outreach: Connection → Email Request → Catalogue Delivery</p>
            </div>
            <div className="task-counter">
              <span>Available Tasks: <strong>{tasks.length}</strong></span>
            </div>
          </header>

          {loading && <div className="loading-state"><p>Loading tasks...</p></div>}
          {error && <div className="error-state"><p>{error}</p></div>}

          {!loading && !error && (
            <div className="inq-layout">
              <aside className="tasks-sidebar">
                {!hasTasks && (
                  <div className="empty-tasks">
                    <p>No approved LinkedIn research available.</p>
                  </div>
                )}

                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`task-selector-card ${selectedTask?.id === task.id ? 'active' : ''}`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="priority-line" style={{ backgroundColor: getStatusColor(task), height: '4px' }} />
                    <div className="task-id-badge">LINKEDIN</div>
                    <h4>{task.contactName || 'LinkedIn Contact'}</h4>
                    <p className="task-category">{task.categoryName}</p>
                    <p className="task-country">{task.country || task.companyCountry || 'Global'}</p>
                    <div className="task-footer">
                      <span className="status">3-Step Workflow</span>
                    </div>
                  </div>
                ))}
              </aside>

              <main className="task-execution-area">
                {!selectedTask ? (
                  <div className="no-task-selected">
                    <div className="empty-illustration">💼</div>
                    <h3>Select a LinkedIn task to begin</h3>
                    <p>Claim the task and complete 3 sequential actions with screenshot proof.</p>
                  </div>
                ) : (
                  <div className="execution-card">
                    {!claimedTaskId ? (
                      <div className="claim-section">
                        <div className="claim-box">
                          <h2>Ready to Start LinkedIn Outreach</h2>
                          <div className="claim-info">
                            <p><strong>Contact:</strong> {selectedTask.contactName || 'N/A'}</p>
                            <p><strong>LinkedIn URL:</strong> {selectedTask.contactLinkedinUrl || selectedTask.targetId}</p>
                            <p><strong>Category:</strong> {selectedTask.categoryName}</p>
                            <p><strong>Country:</strong> {selectedTask.country || selectedTask.companyCountry || 'N/A'}</p>
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
                        {/* WORKFLOW PROGRESS BAR */}
                        <div className="workflow-progress">
                          {LINKEDIN_ACTIONS.map((action, idx) => (
                            <div
                              key={idx}
                              className={`progress-step ${
                                idx + 1 < currentStep
                                  ? 'completed'
                                  : idx + 1 === currentStep
                                  ? 'active'
                                  : 'pending'
                              }`}
                            >
                              <div className="step-circle">{idx + 1}</div>
                              <div className="step-label">{action.title}</div>
                            </div>
                          ))}
                        </div>

                        {/* RESEARCH CONTEXT */}
                        <div className="card-section research-context">
                          <h2>LinkedIn Contact Details (Read-Only)</h2>
                          <div className="context-grid">
                            <div className="context-item">
                              <label>Contact Name</label>
                              <p>{selectedTask.contactName || 'N/A'}</p>
                            </div>
                            <div className="context-item">
                              <label>LinkedIn Profile</label>
                              <a href={selectedTask.contactLinkedinUrl || selectedTask.targetId} target="_blank" rel="noreferrer">
                                {selectedTask.contactLinkedinUrl || selectedTask.targetId}
                              </a>
                            </div>
                            <div className="context-item">
                              <label>Country</label>
                              <p>{selectedTask.country || selectedTask.companyCountry || 'N/A'}</p>
                            </div>
                            <div className="context-item">
                              <label>Language</label>
                              <p>{selectedTask.language || 'N/A'}</p>
                            </div>
                            <div className="context-item">
                              <label>Category</label>
                              <p>{selectedTask.categoryName}</p>
                            </div>
                            <div className="context-item">
                              <label>Research Task ID</label>
                              <code className="task-id">{selectedTask.id}</code>
                            </div>
                          </div>
                        </div>

                        {/* CURRENT ACTION INSTRUCTIONS */}
                        <div className="card-section action-instructions">
                          <h2>{currentAction.title}</h2>
                          <div className="instruction-box">
                            <p className="instruction-text">{currentAction.instruction}</p>
                          </div>
                        </div>

                        {/* MESSAGE TEMPLATE */}
                        <div className="card-section message-section">
                          <h2>Message Template</h2>
                          <div className="template-selector">
                            <button
                              className="btn-template-nav"
                              onClick={handlePrevTemplate}
                              type="button"
                            >
                              ←
                            </button>
                            <span className="template-indicator">
                              Template {templateIndex + 1} of {currentAction.templates.length}
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
                              <label>Title / Subject</label>
                              <input
                                type="text"
                                className="message-title-input"
                                value={messageTitle}
                                onChange={(e) => setMessageTitle(e.target.value)}
                                placeholder="Message title"
                              />
                            </div>
                            <div className="message-field">
                              <label>Message Content</label>
                              <textarea
                                className="message-textarea"
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                placeholder="Message content..."
                                rows={8}
                              />
                            </div>
                          </div>
                        </div>

                        {/* SCREENSHOT UPLOAD */}
                        <div className="card-section proof-section">
                          <h2>Upload Proof of Action (Step {currentStep}/3)</h2>
                          <p className="proof-requirements">Maximum file size: 500 KB | Formats: PNG, JPG, JPEG</p>

                          <div className="upload-zone">
                            <div className="upload-icon">📸</div>
                            <p className="upload-text">
                              Screenshot must show LinkedIn profile URL and {
                                currentStep === 1 ? 'connection message' :
                                currentStep === 2 ? 'email request and reply (if any)' :
                                'catalogue/price list sent'
                              }.
                            </p>
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
                              setCurrentStep(1);
                            }}
                            disabled={submitting}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-submit"
                            onClick={handleSubmitStep}
                            disabled={!canSubmit}
                          >
                            {submitting ? 'Submitting...' : 
                              currentStep === 3 ? 'Complete Task' : `Submit Step ${currentStep} & Continue`
                            }
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