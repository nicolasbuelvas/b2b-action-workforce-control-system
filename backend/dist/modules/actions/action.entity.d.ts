export declare class Action {
    id: string;
    name: string;
    role: string;
    category: string;
    actionType: string;
    enabled: boolean;
    inputs: ActionInput[];
    evidence: EvidenceRule;
    approval: ApprovalRule;
    guidelines: string;
    deletedAt: Date | null;
}
export declare class ActionInput {
    id: string;
    actionId: string;
    action: Action;
    inputKey: string;
    label: string;
    type: string;
    required: boolean;
    optionsSource: string;
    validationRules: string;
    order: number;
}
export declare class EvidenceRule {
    id: string;
    actionId: string;
    requiresScreenshot: boolean;
    screenshotType: string;
    screenshotContext: string;
    maxSizeMb: number;
}
export declare class ApprovalRule {
    id: string;
    actionId: string;
    requiresApproval: boolean;
    approvalRole: string;
    approvalCriteria: string;
    rejectionReasonGroupId: string;
}
