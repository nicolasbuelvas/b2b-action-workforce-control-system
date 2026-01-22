import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import { UserCategory } from '../categories/entities/user-category.entity';
export declare class UsersService {
    private readonly userRepo;
    private readonly userCategoryRepo;
    private readonly rolesService;
    constructor(userRepo: Repository<User>, userCategoryRepo: Repository<UserCategory>, rolesService: RolesService);
    create(dto: CreateUserDto): Promise<User>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    suspendUser(userId: string): Promise<User>;
    getUserCategories(userId: string): Promise<{
        id: string;
        name: string;
        assignedAt: Date;
    }[]>;
}
