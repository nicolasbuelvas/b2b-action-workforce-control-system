import { Repository } from 'typeorm';
import { RoleMetrics } from './entities/role-metrics.entity';
export declare class MetricsService {
    private readonly metricsRepo;
    constructor(metricsRepo: Repository<RoleMetrics>);
    private today;
    recordAction(params: {
        userId: string;
        role: string;
        categoryId?: string;
        status: 'approved' | 'rejected' | 'flagged';
    }): Promise<RoleMetrics>;
    getUserMetrics(params: {
        userId: string;
        role: string;
        categoryId?: string;
    }): Promise<RoleMetrics[]>;
    getTopWorkers(params: {
        role: string;
        categoryId?: string;
        from: string;
        to: string;
        limit?: number;
    }): Promise<any[]>;
}
