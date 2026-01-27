import axios from './axios';

export interface PendingResearchSubmission {
  id: string;
  categoryId: string;
  categoryName: string;
  assignedToUserId: string;
  workerName: string;
  workerEmail: string;
  targetId: string;
  companyName: string;
  companyDomain: string;
  companyCountry: string;
  targetType: 'COMPANY' | 'LINKEDIN' | 'LINKEDIN_PROFILE';
  linkedInUrl?: string;
  linkedInContactName?: string;
  linkedInCountry?: string;
  linkedInLanguage?: string;
  createdAt: string;
  submission: {
    id: string;
    researchTaskId: string;
    email?: string;
    phone?: string;
    language?: string;
    country?: string;
    techStack?: string;
    notes?: string;
    contactName?: string;
    contactLinkedinUrl?: string;
    createdAt: string;
  } | null;
}

export interface PendingInquirySubmission {
  id: string;
  categoryId: string;
  categoryName: string;
  assignedToUserId: string;
  workerName: string;
  workerEmail: string;
  targetId: string;
  companyName: string;
  companyDomain: string;
  companyCountry: string;
  language: string;
  actionType: 'EMAIL' | 'LINKEDIN' | 'CALL';
  createdAt: string;
  actionCreatedAt: string;
  screenshotUrl: string | null;
  isDuplicate: boolean;
}

export interface LinkedInInquiryAction {
  id: string;
  actionType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  screenshotUrl: string | null;
  isDuplicate: boolean;
}

export interface PendingLinkedInInquirySubmission {
  id: string;
  categoryId: string;
  categoryName: string;
  assignedToUserId: string;
  workerName: string;
  workerEmail: string;
  targetId: string;
  status: string;
  createdAt: string;
  actions: LinkedInInquiryAction[];
}

export interface DisapprovalReason {
  id: string;
  reason: string;
  description?: string;
  reasonType: 'rejection' | 'flag';
  applicableRoles: string[];
  categoryIds: string[];
  isActive: boolean;
}

export interface AuditDecision {
  decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
  reasonId?: string;
}

export const auditApi = {
  getPendingResearch: async (): Promise<PendingResearchSubmission[]> => {
    const response = await axios.get('/audit/research/pending');
    return response.data;
  },

  auditResearch: async (taskId: string, decision: AuditDecision): Promise<any> => {
    const response = await axios.post(`/audit/research/${taskId}`, decision);
    return response.data;
  },

  getPendingInquiry: async (): Promise<PendingInquirySubmission[]> => {
    const response = await axios.get('/audit/inquiry/pending');
    return response.data;
  },

  auditInquiry: async (taskId: string, decision: AuditDecision): Promise<any> => {
    const response = await axios.post(`/audit/inquiry/${taskId}`, decision);
    return response.data;
  },

  getPendingLinkedInInquiry: async (): Promise<PendingLinkedInInquirySubmission[]> => {
    const response = await axios.get('/audit/linkedin-inquiry/pending');
    return response.data;
  },

  auditLinkedInInquiry: async (taskId: string, actionId: string, decision: AuditDecision): Promise<any> => {
    const response = await axios.post(`/audit/linkedin-inquiry/${taskId}/actions/${actionId}`, decision);
    return response.data;
  },

  getDisapprovalReasons: async (params: {
    role?: string;
    reasonType: 'rejection' | 'flag';
    categoryId?: string;
    search?: string;
  }): Promise<DisapprovalReason[]> => {
    const response = await axios.get('/audit/disapproval-reasons', { params });
    return response.data;
  },
};
