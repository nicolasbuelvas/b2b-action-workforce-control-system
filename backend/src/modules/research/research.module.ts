import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';
import { Company } from './entities/company.entity';
import { ResearchTask } from './entities/research-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, ResearchTask])],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}