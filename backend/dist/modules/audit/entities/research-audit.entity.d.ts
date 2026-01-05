export declare class ResearchAudit {
    id: string;
    researchTaskId: string;
    auditorUserId: string;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReasonId?: string;
    createdAt: Date;
}
