import {
  Injectable,
  ConflictException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { normalizeDomain } from '../../common/utils/normalization.util';
import { Company } from './entities/company.entity';
import {
  ResearchTask,
  ResearchStatus,
} from './entities/research-task.entity';
import { CreateResearchDto } from './dto/create-research.dto';

@Injectable()
export class ResearchService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(ResearchTask)
    private readonly researchRepo: Repository<ResearchTask>,
  ) {}

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