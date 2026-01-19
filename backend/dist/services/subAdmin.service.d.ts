export declare class SubAdminService {
    getDashboard(query: any, user: any): Promise<{}>;
    getCategories(user: any): Promise<any[]>;
    getCategoryRules(categoryId: any, user: any): Promise<{}>;
    updateCategoryRules(categoryId: any, body: any, user: any): Promise<{}>;
    getPerformance(categoryId: any, query: any, user: any): Promise<{}>;
    getAlerts(query: any, user: any): Promise<any[]>;
    getLogs(query: any, user: any): Promise<{
        logs: any[];
        total: number;
    }>;
    flagAction(body: any, user: any): Promise<{
        success: boolean;
    }>;
}
