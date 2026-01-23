import React, { useMemo, useState, useEffect } from 'react';
import './WebsiteInquiryTasksPage.css';
import { inquiryApi, InquiryTask } from '../../../api/inquiry.api';

const FILE_SIZE_LIMIT = 500 * 1024;
const ALLOWED_FORMATS = ['image/png', 'image/jpeg'];

export default function WebsiteInquiryTasksPage() {
  const [tasks, setTasks] = useState<InquiryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<InquiryTask | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [messageDraft, setMessageDraft] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await inquiryApi.getWebsiteTasks();
        setTasks(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleTaskSelect = (task: InquiryTask) => {
    setSelectedTask(task);
    setProofFile(null);
    setPreviewUrl('');
    setFileError('');
    setMessageDraft('');
    setSubmitError('');
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
    if (!selectedTask || !proofFile) return;

    try {
      setSubmitting(true);
      setSubmitError('');
      await inquiryApi.submitAction(
        selectedTask.id,
        'EMAIL',
        proofFile,
      );
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
      setProofFile(null);
      setPreviewUrl('');
      setMessageDraft('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit inquiry');
      console.error('Error submitting inquiry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const hasTasks = useMemo(() => tasks.length > 0, [tasks]);
  const canSubmit = selectedTask && proofFile && messageDraft.trim().length > 0 && !submitting;

  return (
    <div className="inq-tasks-container">
      <header className="inq-tasks-header">
        <div className="title-group">
          <h1>Website Outreach Tasks</h1>
          <p>Execute contact actions and submit verifiable proof for review.</p>
        </div>
        <div className="task-counter">
          <span>Active Tasks: <strong>{tasks.length}</strong></span>
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
                <p>Review the research details and submit contact proof.</p>
              </div>
            ) : (
              <div className="execution-card">
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
                  <h2>Outreach Message</h2>
                  <div className="message-info">
                    <p>Customize the outreach message for this contact:</p>
                  </div>
                  <textarea
                    className="message-textarea"
                    placeholder="Enter your outreach message..."
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                  />
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

                <div className="action-buttons">
                  <button
                    className="btn-cancel"
                    onClick={() => handleTaskSelect(null as any)}
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
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}