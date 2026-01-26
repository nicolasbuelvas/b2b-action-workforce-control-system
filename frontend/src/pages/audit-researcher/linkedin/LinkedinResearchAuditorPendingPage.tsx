import React, { useEffect, useState } from 'react';
import './LinkedinResearchAuditorPendingPage.css';
import { auditApi, PendingResearchSubmission } from '../../../api/audit.api';
import { researchApi, Category } from '../../../api/research.api';
import { useAuth } from '../../../hooks/useAuth';

export default function LinkedinResearchAuditorPendingPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingResearchSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<PendingResearchSubmission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (loadingCategories) return;

    if (!selectedCategory && categories.length === 1) {
      setSelectedCategory(categories[0].id);
      return;
    }

    if (!selectedCategory && categories.length > 1) {
      setSubmissions([]);
      return;
    }

    const filtered = selectedCategory
      ? allSubmissions.filter(s => s.categoryId === selectedCategory)
      : allSubmissions;

    setSubmissions(filtered);
  }, [selectedCategory, allSubmissions, loadingCategories, categories]);

  const loadCategories = async () => {
    if (!user?.id) return;

    try {
      setLoadingCategories(true);
      const rawCategories = await researchApi.getMyCategories();
      const list: Category[] = Array.isArray(rawCategories)
        ? rawCategories
        : (Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : []);

      const uniqueCategories = list.length > 0
        ? Array.from(new Map(list.map((cat: Category) => [cat.id, cat])).values())
        : [];

      setCategories(uniqueCategories);

      if (uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load your assigned categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await auditApi.getPendingResearch();
      const linkedinSubs = data.filter(s => s.targetType !== 'COMPANY');
      setAllSubmissions(linkedinSubs);

      const filtered = selectedCategory
        ? linkedinSubs.filter(s => s.categoryId === selectedCategory)
        : linkedinSubs;

      setSubmissions(filtered);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      await auditApi.auditResearch(taskId, { decision: 'APPROVED' });
      setSubmissions(prev => prev.filter(s => s.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve submission');
    }
  };

  const handleReject = async (taskId: string) => {
    const feedback = prompt('Please provide a short rejection note (optional):');
    try {
      await auditApi.auditResearch(taskId, { decision: 'REJECTED' });
      setSubmissions(prev => prev.filter(s => s.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject submission');
    }
  };

  const getDisplayUrl = (submission: PendingResearchSubmission) => {
    const fallback = submission.submission?.contactLinkedinUrl || submission.linkedInUrl || submission.targetId;
    if (!fallback) return '';
    return fallback.startsWith('http') ? fallback : `https://${fallback}`;
  };

  if (loadingCategories) {
    return <div className="wb-state-screen"><p>Loading categories…</p></div>;
  }

  if (categories.length === 0) {
    return <div className="wb-state-screen"><p>No categories assigned. Contact administrator.</p></div>;
  }

  return (
    <div className="wb-research-pending-container">
      {categories.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
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
              fontWeight: 500,
            }}
          >
            <option value="">Choose a category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedCategory && categories.length > 1 && (
        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fcd34d' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            📁 Please select a category from above to view pending submissions.
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#c00' }}>
          {error}
        </div>
      )}

      {selectedCategory && !loading && submissions.length === 0 && (
        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>No pending LinkedIn research submissions for this category.</p>
        </div>
      )}

      {selectedCategory && submissions.length > 0 && (
        <>
          <header className="wb-pending-header">
            <div>
              <h1>LinkedIn Research Audits</h1>
              <p>{submissions.length} pending submission{submissions.length !== 1 ? 's' : ''}</p>
            </div>
          </header>

          <div className="submissions-grid">
            {submissions.map(submission => {
              const displayUrl = getDisplayUrl(submission);
              return (
                <div key={submission.id} className="wb-card">
                  <div className="card-top">
                    <span className="type-badge">LinkedIn</span>
                    <span className="category-pill">{submission.categoryName}</span>
                  </div>

                  <div className="info-group">
                    <label>Profile / Search</label>
                    <div className="info-display">
                      <a href={displayUrl} target="_blank" rel="noopener noreferrer">{displayUrl}</a>
                    </div>
                  </div>

                  {(submission.linkedInContactName || submission.submission?.contactName) && (
                    <div className="info-group">
                      <label>Contact Name</label>
                      <div className="info-display">{submission.linkedInContactName || submission.submission?.contactName}</div>
                    </div>
                  )}

                  {(submission.submission?.country || submission.linkedInCountry) && (
                    <div className="info-group">
                      <label>Country</label>
                      <div className="info-display">{submission.submission?.country || submission.linkedInCountry}</div>
                    </div>
                  )}

                  {(submission.submission?.language || submission.linkedInLanguage) && (
                    <div className="info-group">
                      <label>Language</label>
                      <div className="info-display">{submission.submission?.language || submission.linkedInLanguage}</div>
                    </div>
                  )}

                  {submission.submission?.notes && (
                    <div className="info-group">
                      <label>Notes</label>
                      <div className="info-display">{submission.submission?.notes}</div>
                    </div>
                  )}

                  <div className="action-buttons">
                    <button className="btn-approve" onClick={() => handleApprove(submission.id)}>✓ Approve</button>
                    <button className="btn-reject" onClick={() => handleReject(submission.id)}>✕ Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
