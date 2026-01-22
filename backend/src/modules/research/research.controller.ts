import { Controller, Post, Get, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { SubmitResearchDto } from './dto/submit-research.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('research')
@UseGuards(JwtGuard, RolesGuard)
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Get('tasks/website')
  @Roles('website_researcher')
  getWebsiteTasks(
    @CurrentUser('userId') userId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.researchService.getAvailableTasks(userId, 'COMPANY', categoryId);
  }

  @Get('tasks/linkedin')
  @Roles('linkedin_researcher')
  getLinkedInTasks(
    @CurrentUser('userId') userId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.researchService.getAvailableTasks(userId, 'LINKEDIN', categoryId);
  }

  @Post('tasks/:taskId/claim')
  @Roles('website_researcher', 'linkedin_researcher')
  claimTask(
    @Param('taskId') taskId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.researchService.claimTask(taskId, userId);
  }

  @Post('tasks/submit')
  @Roles('website_researcher', 'linkedin_researcher')
  submitTask(
    @Body() dto: SubmitResearchDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.researchService.submitTaskData(dto, userId);
  }

  @Post()
  @Roles('website_researcher', 'linkedin_researcher')
  submit(
    @Body() dto: CreateResearchDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.researchService.submit(dto, userId);
  }
}