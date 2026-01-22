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

  async getAvailableTasks(
    userId: string,
    targetType: 'COMPANY' | 'LINKEDIN',
    categoryId?: string,
  ) {
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

    // If a specific categoryId is provided, validate it belongs to user's assigned categories
    if (categoryId && !categoryIds.includes(categoryId)) {
      return []; // User trying to access a category they're not assigned to
    }

    // Build query with optional categoryId filter
    let query = this.researchRepo
      .createQueryBuilder('task')
      .where('task.targettype = :targetType', { targetType })
      .andWhere('task.status = :status', { status: ResearchStatus.PENDING })
      .andWhere('(task.assignedToUserId IS NULL OR task.assignedToUserId = :userId)', { userId });

    // If categoryId is specified, filter to only that category
    if (categoryId) {
      query = query.andWhere('task.categoryId = :categoryId', { categoryId });
    } else {
      // Otherwise, include all user's categories
      query = query.andWhere('task.categoryId IN (:...categoryIds)', { categoryIds });
    }

    const tasks = await query
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
    console.log('[claimTask] START - taskId:', taskId, 'userId:', userId);
    console.log('[claimTask] userId TYPE:', typeof userId, 'VALUE:', JSON.stringify(userId));
    
    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(ResearchTask, {
        where: { id: taskId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!task) {
        console.log('[claimTask] ERROR - Task not found');
        throw new NotFoundException('Task not found');
      }

      console.log('[claimTask] Task found - currentAssignedTo:', task.assignedToUserId, 'status:', task.status);

      if (task.status !== ResearchStatus.PENDING) {
        console.log('[claimTask] ERROR - Task not PENDING');
        throw new BadRequestException('Task is not available for claiming');
      }

      if (task.assignedToUserId && task.assignedToUserId !== userId) {
        console.log('[claimTask] ERROR - Task claimed by another user:', task.assignedToUserId);
        throw new ConflictException('Task already claimed by another user');
      }

      if (task.assignedToUserId === userId) {
        console.log('[claimTask] Task already claimed by this user - returning');
        return task; // Already claimed by this user
      }

      console.log('[claimTask] Assigning task to user:', userId);
      task.assignedToUserId = userId;
      const savedTask = await manager.save(ResearchTask, task);
      console.log('[claimTask] SUCCESS - Task assigned to:', savedTask.assignedToUserId);
      console.log('[claimTask] assignedToUserId TYPE:', typeof savedTask.assignedToUserId, 'userId TYPE:', typeof userId);
      return savedTask;
    });
  }

  async submitTaskData(dto: SubmitResearchDto, userId: string) {
    console.log('[submitTaskData] START - dto:', JSON.stringify(dto), 'userId:', userId);
    console.log('[submitTaskData] userId TYPE:', typeof userId, 'VALUE:', JSON.stringify(userId));
    
    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(ResearchTask, {
        where: { id: dto.taskId },
      });

      if (!task) {
        console.log('[submitTaskData] ERROR - Task not found');
        throw new NotFoundException('Task not found');
      }

      console.log('[submitTaskData] Task found - assignedToUserId:', task.assignedToUserId, 'requestingUserId:', userId);
      console.log('[submitTaskData] assignedToUserId TYPE:', typeof task.assignedToUserId, 'VALUE:', JSON.stringify(task.assignedToUserId));
      console.log('[submitTaskData] Strict comparison:', task.assignedToUserId, '!==', userId, '=', task.assignedToUserId !== userId);
      console.log('[submitTaskData] String comparison:', String(task.assignedToUserId), '!==', String(userId), '=', String(task.assignedToUserId) !== String(userId));

      if (task.assignedToUserId !== userId) {
        console.log('[submitTaskData] ERROR - User not assigned to task');
        console.log('[submitTaskData] Expected:', userId, 'Actual:', task.assignedToUserId);
        throw new BadRequestException('You are not assigned to this task');
      }

      if (task.status !== ResearchStatus.PENDING) {
        throw new BadRequestException('Task has already been submitted');
      }

      // Create submission record
      const submission = manager.create(ResearchSubmission, {
        researchTaskId: task.id,
        language: dto.language,
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