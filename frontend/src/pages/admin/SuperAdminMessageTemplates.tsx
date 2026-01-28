import React, { useState, useEffect } from 'react';
import client from '../../api/client';

interface MessageTemplate {
  id: string;
  title: string;
  body: string;
  categoryIds: string[];
  createdByUserId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function SuperAdminMessageTemplates(): JSX.Element {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await client.get('/superadmin/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await client.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setTitle('');
    setBody('');
    setSelectedCategories([]);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setTitle(template.title);
    setBody(template.body);
    setSelectedCategories(template.categoryIds);
    setIsActive(template.isActive);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setTitle('');
    setBody('');
    setSelectedCategories([]);
    setIsActive(true);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert('Title and body are required');
      return;
    }

    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        await client.patch(`/superadmin/templates/${editingTemplate.id}`, {
          title,
          body,
          categoryIds: selectedCategories,
          isActive,
        });
        alert('Template updated successfully');
      } else {
        // Create new template
        await client.post('/superadmin/templates', {
          title,
          body,
          categoryIds: selectedCategories,
          isActive,
        });
        alert('Template created successfully');
      }
      closeModal();
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await client.delete(`/superadmin/templates/${templateId}`);
      alert('Template deleted successfully');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      alert(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map(id => categories.find(c => c.id === id)?.name || 'Unknown')
      .join(', ');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Message Templates</h1>
            <p className="text-gray-600 mt-1">Manage system-wide message templates for all categories</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Template
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No templates found</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{template.title}</h3>
                      {template.isActive ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Categories: {getCategoryNames(template.categoryIds)}
                    </p>
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-gray-700 whitespace-pre-wrap">{template.body}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(template.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(template)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Title*
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Welcome Message, Task Assignment"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message Body*
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Enter the template message..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categories* (Select all that apply)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-gray-500 text-sm">No categories available</p>
                  ) : (
                    categories.map(category => (
                      <label key={category.id} className="flex items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="mr-2 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700">{category.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700 font-semibold">Active Template</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  Inactive templates won't appear in selection lists
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
