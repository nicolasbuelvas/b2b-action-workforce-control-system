import {
  Injectable,
  ConflictException,
  NotImplementedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, In } from 'typeorm';

import { normalizeDomain } from '../../common/utils/normalization.util';
import { Company } from './entities/company.entity';
import {
  ResearchTask,
  ResearchStatus,
} from './entities/research-task.entity';
import { ResearchSubmission } from './entities/research-submission.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { CreateResearchDto } from './dto/create-research.dto';
import { SubmitResearchDto } from './dto/submit-research.dto';

@Injectable()
export class ResearchService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(ResearchTask)
    private readonly researchRepo: Repository<ResearchTask>,

    @InjectRepository(ResearchSubmission)
    private readonly submissionRepo: Repository<ResearchSubmission>,

    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
  ) {}

  async getAvailableTasks(userId: string, targetType: 'COMPANY' | 'LINKEDIN') {
    // First, get user's assigned categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    // If user has no categories assigned, return empty array
    if (userCategories.length === 0) {
      return [];
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    // Get tasks that are unassigned or assigned to this user, AND in user's categories
    const tasks = await this.researchRepo
      .createQueryBuilder('task')
      .where('task.targettype = :targetType', { targetType })
      .andWhere('task.status = :status', { status: ResearchStatus.PENDING })
      .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('(task.assignedToUserId IS NULL OR task.assignedToUserId = :userId)', { userId })
      .orderBy('task.createdAt', 'ASC')
      .limit(50)
      .getMany();

    // Join with companies to get domain info
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        let targetInfo: any = {};
        
        if (task.targetType === 'COMPANY') {
          const company = await this.companyRepo.findOne({
            where: { id: task.targetId },
          });
          
          if (company) {
            targetInfo = {
              domain: company.domain,
              name: company.name,
              country: company.country,
            };
          }
        }

        return {
          id: task.id,
          categoryId: task.categoryId,
          status: task.assignedToUserId === userId ? 'in_progress' : 'unassigned',
          priority: 'medium', // Can be enhanced with actual priority logic
          ...targetInfo,
        };
      })
    );

    return tasksWithDetails;
  }

  async claimTask(taskId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(ResearchTask, {
        where: { id: taskId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (task.status !== ResearchStatus.PENDING) {
        throw new BadRequestException('Task is not available for claiming');
      }

      if (task.assignedToUserId && task.assignedToUserId !== userId) {
        throw new ConflictException('Task already claimed by another user');
      }

      if (task.assignedToUserId === userId) {
        return task; // Already claimed by this user
      }

      task.assignedToUserId = userId;
      return manager.save(ResearchTask, task);
    });
  }

  async submitTaskData(dto: SubmitResearchDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(ResearchTask, {
        where: { id: dto.taskId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (task.assignedToUserId !== userId) {
        throw new BadRequestException('You are not assigned to this task');
      }

      if (task.status !== ResearchStatus.PENDING) {
        throw new BadRequestException('Task has already been submitted');
      }

      // Create submission record
      const submission = manager.create(ResearchSubmission, {
        researchTaskId: task.id,
        email: dto.email,
        phone: dto.phone,
        techStack: dto.techStack,
        notes: dto.notes,
      });

      await manager.save(ResearchSubmission, submission);

      // Mark task as submitted (still PENDING until audited)
      // We keep it PENDING for auditor review
      // You could add a 'SUBMITTED' status if needed

      return {
        taskId: task.id,
        submissionId: submission.id,
        message: 'Research submitted successfully and awaiting audit',
      };
    });
  }

  async submit(dto: CreateResearchDto, userId: string) {
    if (dto.targetType !== 'COMPANY') {
      throw new NotImplementedException(
        'LinkedIn research not enabled in phase 2',
      );
    }

    return this.dataSource.transaction(async manager => {
      const normalizedDomain = normalizeDomain(dto.domainOrProfile);

      let company = await manager.findOne(Company, {
        where: { normalizedDomain },
      });

      if (!company) {
        company = manager.create(Company, {
          name: dto.nameOrUrl,
          domain: dto.domainOrProfile,
          normalizedDomain,
          country: dto.country,
        });
        await manager.save(company);
      }

      const completed = await manager.findOne(ResearchTask, {
        where: {
          categoryId: dto.categoryId,
          targetId: company.id,
          status: ResearchStatus.COMPLETED,
        },
      });

      if (completed) {
        throw new ConflictException(
          'Research already completed for this company',
        );
      }

      const existingPending = await manager.findOne(ResearchTask, {
        where: {
          categoryId: dto.categoryId,
          targetId: company.id,
          status: ResearchStatus.PENDING,
        },
      });

      if (existingPending) {
        throw new ConflictException(
          'Research already pending for this company',
        );
      }

      const task = manager.create(ResearchTask, {
        categoryId: dto.categoryId,
        assignedToUserId: userId,
        targetType: 'COMPANY',
        targetId: company.id,
        status: ResearchStatus.PENDING,
      });

      return manager.save(task);
    });
  }
}