import { ActionsService } from './actions.service';
export declare class ActionsController {
    private readonly actionsService;
    constructor(actionsService: ActionsService);
    getAll(): Promise<import("./action.entity").Action[]>;
    create(dto: any): Promise<import("./action.entity").Action[]>;
    update(id: string, dto: any): Promise<import("./action.entity").Action>;
    enableDisable(id: string, body: {
        enabled: boolean;
    }): Promise<import("./action.entity").Action>;
    softDelete(id: string): Promise<{
        success: boolean;
    }>;
}
