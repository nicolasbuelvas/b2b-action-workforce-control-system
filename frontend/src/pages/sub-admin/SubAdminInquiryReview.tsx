import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPendingInquiryTasks, getSubAdminCategories } from '../../api/subadmin.api';
import type { Category } from '../../api/subadmin.api';
import './WebsiteResearch.css'; // Reuse the same CSS

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type PlatformFilter = 'website' | 'linkedin';

interface InquiryAuditTask {
  id: string;
  target: string;
  targetUrl?: string;
  channel: 'website' | 'linkedin';
  platform: string;
  status: string;
  category: string;
  categoryName: string;
  country?: string;
  worker?: string;
  researchStatus?: string;
  createdAt: string;
}

export default function SubAdminInquiryReview(): JSX.Element {
  const location = useLocation();
  const isLinkedInRoute = location.pathname.includes('linkedin-inquiry');
  const platformFilter: PlatformFilter = isLinkedInRoute ? 'linkedin' : 'website';
  
  const [tasks, setTasks] = useState<InquiryAuditTask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [categoriesLoaded, setCategoriesLoaded] = useState<LoadState>('idle');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Detail modal
  const [selectedTask, setSelectedTask] = useState<InquiryAuditTask | null>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoaded('loading');
        const data = await getSubAdminCategories();
        
        // Deduplicate categories by id
        const uniqueCategories = data && data.length > 0
          ? Array.from(new Map(data.map((cat: Category) => [cat.id, cat])).values())
          : [];
        
        setCategories(uniqueCategories);
        
        // Auto-select first category if user has exactly one
        if (uniqueCategories.length === 1) {
          setSelectedCategory(uniqueCategories[0].id);
        } else if (uniqueCategories.length > 1) {
          setSelectedCategory('all');
        }
        
        setCategoriesLoaded('success');
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategoriesLoaded('error');
      }
    };

    loadCategories();
  }, []);

  // Load tasks when filters change
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoadState('loading');
        
        const result = await getPendingInquiryTasks(limit, offset);

        // Handle paginated response
        const tasksArray = result.data || [];
        const total = result.total || 0;

        // Apply filters
        let filtered = tasksArray;
        
        // Category filter
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(task => 
            task.categoryName === categories.find(c => c.id === selectedCategory)?.name
          );
        }
        
        // Platform filter - always filter by route platform
        filtered = filtered.filter(task => task.platform === platformFilter);
        
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (task) =>
              (task.target && task.target.toLowerCase().includes(query)) ||
              (task.targetUrl && task.targetUrl.toLowerCase().includes(query)) ||
              (task.category && task.category.toLowerCase().includes(query)) ||
              (task.country && task.country.toLowerCase().includes(query)),
          );
        }

        setTasks(filtered);
        setTotalCount(total);
        setLoadState('success');
      } catch (error) {
        console.error('Error loading inquiry audit tasks:', error);
        setLoadState('error');
      }
    };

    loadTasks();
  }, [selectedCategory, platformFilter, limit, offset, searchQuery, categories]);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Group tasks by category for display
  const tasksByCategory = tasks.reduce(
    (acc, task) => {
      const cat = task.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(task);
      return acc;
    },
    {} as Record<string, InquiryAuditTask[]>,
  );

  const statusColors: Record<string, string> = {
    completed: '#3498DB',
    pending: '#FFA500',
    approved: '#2ECC71',
    rejected: '#E74C3C',
    in_progress: '#9B59B6',
  };

  const getStatusBadgeColor = (status: string): string => {
    return statusColors[status] || '#95A5A6';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      completed: 'Awaiting Audit',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      in_progress: 'In Progress',
    };
    return labels[status] || status;
  };

  const getPlatformLabel = (platform: string): string => {
    return platform === 'website' ? '🌐 Website' : '💼 LinkedIn';
  };

  return (
    <div className="website-research-container">
      <div className="website-research-header">
        <h1>📧 Inquiry Audit Queue</h1>
        <p className="header-subtitle">
          Review and audit completed inquiry submissions before approval or rejection
        </p>
      </div>

      {/* Filters Section */}
      <div className="website-research-filters">
        <div className="filters-grid">
          {/* Search Filter */}
          <div className="filter-group">
            <label htmlFor="search-filter">Search</label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search by target, URL, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input search-input"
            />
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setOffset(0);
              }}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Display (Read-Only) */}
          <div className="filter-group">
            <label htmlFor="platform-filter">Platform</label>
            <div
              id="platform-filter"
              className="filter-select"
              style={{
                backgroundColor: '#f5f5f5',
                color: '#333',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
              }}
            >
              {platformFilter === 'website' ? '🌐 Website' : '💼 LinkedIn'}
            </div>
          </div>

          {/* Results Per Page */}
          <div className="filter-group">
            <label htmlFor="limit-filter">Results Per Page</label>
            <select
              id="limit-filter"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
              className="filter-select"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            {selectedCategory !== 'all' && (
              <div className="filter-tag">
                Category: {categories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setOffset(0);
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="filter-tag">
                Search: "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setOffset(0);
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          Showing {tasks.length > 0 ? offset + 1 : 0} to{' '}
          {Math.min(offset + limit, totalCount)} of {totalCount} tasks
        </span>
      </div>

      {/* Loading State */}
      {loadState === 'loading' && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inquiry audit tasks...</p>
        </div>
      )}

      {/* Error State */}
      {loadState === 'error' && (
        <div className="error-container">
          <p>❌ Failed to load inquiry audit tasks</p>
          <p className="error-message">Please try again later or contact support</p>
        </div>
      )}

      {/* Tasks Display */}
      {loadState === 'success' && tasks.length === 0 && (
        <div className="empty-state">
          <p>📭 No inquiry tasks awaiting audit</p>
          <p>Try adjusting your filters or search query</p>
        </div>
      )}

      {loadState === 'success' && tasks.length > 0 && (
        <div className="tasks-container">
          {Object.entries(tasksByCategory).map(([categoryName, categoryTasks]) => (
            <div key={categoryName} className="category-group">
              <div className="category-header">
                <h2>{categoryName}</h2>
                <span className="category-count">{categoryTasks.length} tasks</span>
              </div>

              <div className="tasks-grid">
                {categoryTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-card-header">
                      <h3 className="task-company-name">
                        {task.target}
                      </h3>
                      <span
                        className="task-status-badge"
                        style={{ backgroundColor: getStatusBadgeColor(task.status) }}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    <div className="task-card-body">
                      <div className="task-field">
                        <span className="task-label">Platform:</span>
                        <span className="task-value">{getPlatformLabel(task.channel)}</span>
                      </div>

                      {task.targetUrl && (
                        <div className="task-field">
                          <span className="task-label">URL:</span>
                          <span className="task-value">
                            <a
                              href={task.targetUrl.startsWith('http') ? task.targetUrl : `https://${task.targetUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="domain-link"
                            >
                              {task.targetUrl}
                            </a>
                          </span>
                        </div>
                      )}

                      {task.country && (
                        <div className="task-field">
                          <span className="task-label">Country:</span>
                          <span className="task-value">🌍 {task.country}</span>
                        </div>
                      )}

                      {task.researchStatus && (
                        <div className="task-field">
                          <span className="task-label">Research Status:</span>
                          <span className="task-value">{task.researchStatus}</span>
                        </div>
                      )}

                      <div className="task-field">
                        <span className="task-label">Submitted:</span>
                        <span className="task-value">
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="task-card-footer">
                      <button 
                        className="btn-view-details"
                        onClick={() => setSelectedTask(task)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {loadState === 'success' && tasks.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setOffset(offset + limit)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTask.target}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedTask(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {selectedTask.targetUrl && (
                <div className="detail-section">
                  <label>URL</label>
                  <a
                    href={selectedTask.targetUrl.startsWith('http') ? selectedTask.targetUrl : `https://${selectedTask.targetUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="domain-link"
                  >
                    {selectedTask.targetUrl}
                  </a>
                </div>
              )}

              <div className="detail-grid">
                <div className="detail-section">
                  <label>Platform</label>
                  <p>{getPlatformLabel(selectedTask.channel)}</p>
                </div>

                {selectedTask.country && (
                  <div className="detail-section">
                    <label>Country</label>
                    <p>🌍 {selectedTask.country}</p>
                  </div>
                )}

                <div className="detail-section">
                  <label>Category</label>
                  <p>{selectedTask.category}</p>
                </div>

                <div className="detail-section">
                  <label>Status</label>
                  <span
                    className="status-badge-modal"
                    style={{ backgroundColor: getStatusBadgeColor(selectedTask.status) }}
                  >
                    {getStatusLabel(selectedTask.status)}
                  </span>
                </div>

                {selectedTask.researchStatus && (
                  <div className="detail-section">
                    <label>Research Status</label>
                    <p>{selectedTask.researchStatus}</p>
                  </div>
                )}

                <div className="detail-section">
                  <label>Submitted</label>
                  <p>
                    {new Date(selectedTask.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="detail-section">
                <label>Task ID</label>
                <code className="task-id">{selectedTask.id}</code>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-primary"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
