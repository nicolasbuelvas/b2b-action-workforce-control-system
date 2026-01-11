import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';
import { Company } from './entities/company.entity';
import { ResearchTask } from './entities/research-task.entity';
import { LinkedInProfile } from './entities/linkedin-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      LinkedInProfile,
      ResearchTask,
    ]),
  ],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}