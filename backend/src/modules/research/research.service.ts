import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { normalizeDomain } from '../../common/utils/normalization.util';

import { Company } from './entities/company.entity';
import { ResearchTask, ResearchStatus } from './entities/research-task.entity';
import { CreateResearchDto } from './dto/create-research.dto';

@Injectable()
export class ResearchService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(ResearchTask)
    private readonly researchRepo: Repository<ResearchTask>,
  ) {}

  async submit(dto: CreateResearchDto, userId: string) {
    if (dto.targetType !== 'COMPANY') {
      throw new Error('LinkedIn research not implemented yet');
    }

    const normalizedDomain = normalizeDomain(dto.domainOrProfile);

    let company = await this.companyRepo.findOne({
      where: { normalizedDomain },
    });

    if (!company) {
      company = this.companyRepo.create({
        name: dto.nameOrUrl,
        domain: dto.domainOrProfile,
        normalizedDomain,
        country: dto.country,
      });
      await this.companyRepo.save(company);
    }

    const existingTask = await this.researchRepo.findOne({
      where: {
        categoryId: dto.categoryId,
        targetId: company.id,
        status: ResearchStatus.APPROVED,
      },
    });

    if (existingTask) {
      throw new ConflictException('Research already approved for this entity');
    }

    const task = this.researchRepo.create({
      categoryId: dto.categoryId,
      submittedByUserId: userId,
      targetType: 'COMPANY',
      targetId: company.id,
    });

    return this.researchRepo.save(task);
  }
}
