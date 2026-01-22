import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
    findById(id: string): Promise<import("./entities/user.entity").User>;
    suspend(id: string): Promise<import("./entities/user.entity").User>;
    getMyCategories(userId: string): Promise<{
        id: string;
        name: string;
        assignedAt: Date;
    }[]>;
}
