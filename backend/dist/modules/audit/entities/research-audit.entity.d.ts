export declare class ResearchAudit {
    id: string;
    researchTaskId: string;
    auditorUserId: string;
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
    disapprovalReasonId?: string;
    createdAt: Date;
}
