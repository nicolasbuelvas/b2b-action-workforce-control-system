import { SubAdminService } from '../services/subAdmin.service';
export declare class SubAdminController {
    private readonly subAdminService;
    constructor(subAdminService: SubAdminService);
    getDashboard(query: any, user: any): Promise<{}>;
    getCategories(user: any): Promise<any[]>;
    getCategoryRules(categoryId: string, user: any): Promise<{}>;
    updateCategoryRules(categoryId: string, body: any, user: any): Promise<{}>;
    getPerformance(categoryId: string, query: any, user: any): Promise<{}>;
    getAlerts(query: any, user: any): Promise<any[]>;
    getLogs(query: any, user: any): Promise<{
        logs: any[];
        total: number;
    }>;
    flagAction(body: any, user: any): Promise<{
        success: boolean;
    }>;
}
