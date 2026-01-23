import axios from './axios';

export interface PendingResearchSubmission {
  id: string;
  categoryId: string;
  categoryName?: string;
  targetId: string;
  targetType: 'COMPANY' | 'LINKEDIN';
  assignedToUserId: string;
  researcherEmail?: string;
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
