import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolesService } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRole]),
  ],
  providers: [RolesService],
  exports: [
    RolesService,
    TypeOrmModule,
  ],
})
export class RolesModule {}