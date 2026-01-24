export declare class CooldownRecord {
    id: string;
    userId: string;
    targetId: string;
    categoryId: string;
    actionType: string;
    actionCount: number;
    cooldownStartedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
