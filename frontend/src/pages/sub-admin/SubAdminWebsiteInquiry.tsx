import React, { useState, useEffect } from 'react';
import { getInquiryTasks, getSubAdminCategories } from '../../api/subadmin.api';
import type { Category } from '../../api/subadmin.api';
import './WebsiteResearch.css'; // Reuse the same CSS

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type StatusFilter = 'all' | 'pending' | 'in_progress' | 'submitted' | 'completed' | 'approved' | 'rejected';

interface WebsiteInquiryTask {
  id: string;
  companyName?: string;
  companyDomain?: string;
  country?: string;
  category: string;
  categoryName?: string;
  status: string;
  createdAt: string;
  platform: string;
  assignedToUserId?: string;
  researchTask?: { status: string };
}

export default function SubAdminWebsiteInquiry(): JSX.Element {
  const [tasks, setTasks] = useState<WebsiteInquiryTask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [categoriesLoaded, setCategoriesLoaded] = useState<LoadState>('idle');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Detail modal
  const [selectedTask, setSelectedTask] = useState<WebsiteInquiryTask | null>(null);

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
        const categoryId = selectedCategory === 'all' ? undefined : selectedCategory;
        const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus;
        
        const result = await getInquiryTasks(
          categoryId,
          'WEBSITE',
          statusFilter,
          limit,
          offset,
        );

        // Handle paginated response
        const tasksArray = result.data || [];
        const total = result.total || 0;

        // Apply search filter if needed
        let filtered = tasksArray;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = tasksArray.filter(
            (task) =>
              (task.companyName && task.companyName.toLowerCase().includes(query)) ||
              (task.companyDomain && task.companyDomain.toLowerCase().includes(query)) ||
              (task.country && task.country.toLowerCase().includes(query)),
          );
        }

        setTasks(filtered);
        setTotalCount(total);
        setLoadState('success');
      } catch (error) {
        console.error('Error loading tasks:', error);
        setLoadState('error');
      }
    };

    loadTasks();
  }, [selectedCategory, selectedStatus, limit, offset]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0); // Reset to first page
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Group tasks by category for display
  const tasksByCategory = tasks.reduce(
    (acc, task) => {
      const cat = task.categoryName || task.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(task);
      return acc;
    },
    {} as Record<string, WebsiteInquiryTask[]>,
  );

  const statusColors: Record<string, string> = {
    pending: '#FFA500',
    in_progress: '#3498DB',
    submitted: '#2ECC71',
    completed: '#27AE60',
    approved: '#2ECC71',
    rejected: '#E74C3C',
  };

  const getStatusBadgeColor = (status: string): string => {
    return statusColors[status] || '#95A5A6';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      submitted: 'Submitted',
      completed: 'Completed',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  return (
    <div className="website-research-container">
      <div className="website-research-header">
        <h1>📧 Website Inquiry Tasks</h1>
        <p className="header-subtitle">
          View and manage all website inquiry submissions for your assigned categories
        </p>
      </div>

      {/* Filters Section */}
      <div className="website-research-filters">
        <div className="filters-grid">
          {/* Search Filter */}
          <div className="filter-group">
            <label htmlFor="search-filter">Search by Company or Domain</label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search companies, domains..."
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

          {/* Status Filter */}
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as StatusFilter);
                setOffset(0);
              }}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
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
        {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
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
            {selectedStatus !== 'all' && (
              <div className="filter-tag">
                Status: {getStatusLabel(selectedStatus)}
                <button
                  onClick={() => {
                    setSelectedStatus('all');
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
          <p>Loading website inquiry tasks...</p>
        </div>
      )}

      {/* Error State */}
      {loadState === 'error' && (
        <div className="error-container">
          <p>❌ Failed to load website inquiry tasks</p>
          <p className="error-message">Please try again later or contact support</p>
        </div>
      )}

      {/* Tasks Display */}
      {loadState === 'success' && tasks.length === 0 && (
        <div className="empty-state">
          <p>📭 No website inquiry tasks found</p>
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
                        {task.companyName || task.companyDomain || 'Website Inquiry'}
                      </h3>
                      <span
                        className="task-status-badge"
                        style={{ backgroundColor: getStatusBadgeColor(task.status) }}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    <div className="task-card-body">
                      {task.companyDomain && (
                        <div className="task-field">
                          <span className="task-label">Domain:</span>
                          <span className="task-value">
                            <a
                              href={`https://${task.companyDomain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="domain-link"
                            >
                              {task.companyDomain}
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

                      <div className="task-field">
                        <span className="task-label">Created:</span>
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

                      {task.researchTask && (
                        <div className="task-field">
                          <span className="task-label">Research Status:</span>
                          <span className="task-value">{task.researchTask.status}</span>
                        </div>
                      )}
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
              <h2>{selectedTask.companyName || selectedTask.companyDomain || 'Website Inquiry'}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedTask(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {selectedTask.companyDomain && (
                <div className="detail-section">
                  <label>Domain</label>
                  <a
                    href={`https://${selectedTask.companyDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="domain-link"
                  >
                    {selectedTask.companyDomain}
                  </a>
                </div>
              )}

              <div className="detail-grid">
                {selectedTask.companyName && (
                  <div className="detail-section">
                    <label>Company Name</label>
                    <p>{selectedTask.companyName}</p>
                  </div>
                )}

                {selectedTask.country && (
                  <div className="detail-section">
                    <label>Country</label>
                    <p>🌍 {selectedTask.country}</p>
                  </div>
                )}

                <div className="detail-section">
                  <label>Category</label>
                  <p>{selectedTask.categoryName || selectedTask.category}</p>
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

                <div className="detail-section">
                  <label>Created</label>
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

                {selectedTask.researchTask && (
                  <div className="detail-section">
                    <label>Research Status</label>
                    <p>{selectedTask.researchTask.status}</p>
                  </div>
                )}
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
