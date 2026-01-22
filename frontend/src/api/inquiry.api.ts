import axios from './axios';

export interface InquiryTask {
  id: string;
  targetId: string;
  categoryId: string;
  status: string;
  type: 'website' | 'linkedin';
  createdAt: string;
}

export const inquiryApi = {
  // Get available website inquiry tasks
  getWebsiteTasks: async (): Promise<InquiryTask[]> => {
    const response = await axios.get('/inquiry/tasks/website');
    return response.data;
  },

  // Get available LinkedIn inquiry tasks
  getLinkedInTasks: async (): Promise<InquiryTask[]> => {
    const response = await axios.get('/inquiry/tasks/linkedin');
    return response.data;
  },

  // Take/claim an inquiry task
  takeTask: async (targetId: string, categoryId: string): Promise<any> => {
    const response = await axios.post('/inquiry/take', {
      targetId,
      categoryId,
    });
    return response.data;
  },

  // Submit an inquiry action with screenshot
  submitAction: async (
    inquiryTaskId: string,
    actionType: 'outreach' | 'email_request' | 'catalogue',
    screenshot: File,
    actionData?: any,
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('inquiryTaskId', inquiryTaskId);
    formData.append('actionType', actionType);
    formData.append('screenshot', screenshot);
    
    if (actionData) {
      formData.append('actionData', JSON.stringify(actionData));
    }

    const response = await axios.post('/inquiry/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
