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
  targetType: 'COMPANY' | 'LINKEDIN';
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

export interface AuditDecision {
  decision: 'APPROVED' | 'REJECTED';
  rejectionReasonId?: string;
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
};
