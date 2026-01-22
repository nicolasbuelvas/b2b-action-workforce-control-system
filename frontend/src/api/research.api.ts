import axios from './axios';

export interface Category {
  id: string;
  name: string;
  assignedAt?: string;
}

export interface WebsiteResearchTask {
  id: string;
  domain: string;
  name?: string;
  country: string;
  category: string;
  categoryId: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unassigned' | 'in_progress' | 'submitted';
}

export interface SubmitResearchPayload {
  taskId: string;
  email?: string;
  phone?: string;
  techStack?: string;
  notes?: string;
}

export const researchApi = {
  // Get user's assigned categories (non-admin endpoint - for authenticated users)
  getMyCategories: async (): Promise<Category[]> => {
    const response = await axios.get('/users/me/categories');
    return response.data;
  },

  // Get available website research tasks
  getWebsiteTasks: async (): Promise<WebsiteResearchTask[]> => {
    const response = await axios.get('/research/tasks/website');
    return response.data;
  },

  // Get available LinkedIn research tasks
  getLinkedInTasks: async (): Promise<any[]> => {
    const response = await axios.get('/research/tasks/linkedin');
    return response.data;
  },

  // Claim a task
  claimTask: async (taskId: string): Promise<any> => {
    const response = await axios.post(`/research/tasks/${taskId}/claim`);
    return response.data;
  },

  // Submit research data for a task
  submitTask: async (data: SubmitResearchPayload): Promise<any> => {
    const response = await axios.post('/research/tasks/submit', data);
    return response.data;
  },

  // Check if domain already exists (duplicate check)
  checkDuplicate: async (domain: string, categoryId: string): Promise<boolean> => {
    try {
      // This will throw if duplicate exists
      await axios.post('/research', {
        targetType: 'COMPANY',
        categoryId,
        nameOrUrl: domain,
        domainOrProfile: domain,
        country: 'US', // temporary
      });
      return false; // No duplicate
    } catch (error: any) {
      if (error.response?.status === 409) {
        return true; // Duplicate exists
      }
      throw error;
    }
  },
};
