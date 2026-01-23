import axios from './axios';

export interface InquiryTask {
  id: string;
  targetId: string;
  categoryId: string;
  categoryName: string;
  status: string;
  type: 'website' | 'linkedin';
  companyName: string;
  companyDomain: string;
  companyCountry: string;
  language?: string;
  country?: string;
  contactName?: string;
  contactLinkedinUrl?: string;
  email?: string;
  phone?: string;
  techStack?: string;
  notes?: string;
  createdAt: string;
}

export interface ClaimedInquiryTask extends InquiryTask {
  claimedTaskId: string;
}

export const inquiryApi = {
  getWebsiteTasks: async (): Promise<InquiryTask[]> => {
    const response = await axios.get('/inquiry/tasks/website');
    return response.data;
  },

  getLinkedInTasks: async (): Promise<InquiryTask[]> => {
    const response = await axios.get('/inquiry/tasks/linkedin');
    return response.data;
  },

  takeTask: async (targetId: string, categoryId: string): Promise<any> => {
    const response = await axios.post('/inquiry/take', {
      targetId,
      categoryId,
    });
    return response.data;
  },

  submitAction: async (
    inquiryTaskId: string,
    actionType: 'EMAIL' | 'LINKEDIN' | 'CALL',
    screenshot: File,
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('inquiryTaskId', inquiryTaskId);
    formData.append('actionType', actionType);
    formData.append('screenshot', screenshot);

    const response = await axios.post('/inquiry/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
