import { Action } from './action.entity';
import { Repository } from 'typeorm';
export declare class ActionsService {
    private readonly actionRepo;
    constructor(actionRepo: Repository<Action>);
    getAll(): Promise<Action[]>;
    create(dto: any): Promise<Action[]>;
    update(id: string, dto: any): Promise<Action>;
    enableDisable(id: string, enabled: boolean): Promise<Action>;
    softDelete(id: string): Promise<{
        success: boolean;
    }>;
}
