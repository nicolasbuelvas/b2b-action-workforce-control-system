import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
export declare class UsersService {
    private readonly userRepo;
    private readonly rolesService;
    constructor(userRepo: Repository<User>, rolesService: RolesService);
    create(dto: CreateUserDto): Promise<User>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    suspendUser(userId: string): Promise<User>;
}
