import axios from './axios';

export interface InquiryTask {
  id: string;
  targetId: string;
  categoryId: string;
  categoryName: string;
  status: string;
  assignedToUserId?: string | null;
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

  takeTask: async (inquiryTaskId: string): Promise<any> => {
    const response = await axios.post('/inquiry/take', {
      inquiryTaskId,
    });
    return response.data;
  },

  submitAction: async (
    inquiryTaskId: string,
    actionType: 'EMAIL' | 'LINKEDIN' | 'CALL' | 'LINKEDIN_OUTREACH' | 'LINKEDIN_EMAIL_REQUEST' | 'LINKEDIN_CATALOGUE',
    screenshot: File,
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('inquiryTaskId', inquiryTaskId);
    formData.append('actionType', actionType);
    formData.append('screenshot', screenshot);

    console.log('[submitAction] Sending to /inquiry/submit');
    console.log('[submitAction] inquiryTaskId:', inquiryTaskId);
    console.log('[submitAction] actionType:', actionType);
    console.log('[submitAction] screenshot:', screenshot.name, `(${screenshot.size} bytes)`);

    const response = await axios.post('/inquiry/submit', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },
};
