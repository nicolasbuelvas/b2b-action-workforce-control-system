import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
export declare class RolesService {
    private readonly roleRepo;
    private readonly userRoleRepo;
    constructor(roleRepo: Repository<Role>, userRoleRepo: Repository<UserRole>);
    createRole(name: string): Promise<{
        name: string;
    } & Role>;
    getRoleByName(name: string): Promise<Role>;
    getAllRoles(): Promise<Role[]>;
    assignRoleToUser(userId: string, roleName: string): Promise<{
        userId: string;
        roleId: string;
    } & UserRole>;
    getUserRoles(userId: string): Promise<string[]>;
    userHasRole(userId: string, roleName: string): Promise<boolean>;
}
