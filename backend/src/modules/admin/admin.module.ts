import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { InquiryAction } from '../inquiry/entities/inquiry-action.entity';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchAudit } from '../audit/entities/research-audit.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserRole, InquiryAction, ResearchTask, ResearchAudit, Category]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}