import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LinkedInResearchService } from '../services/linkedin-research.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateLinkedInResearchDto } from '../dto/create-linkedin-research.dto';

@Controller('linkedin/research')
@UseGuards(JwtGuard, RolesGuard)
export class LinkedInResearchController {
  constructor(private readonly linkedInResearchService: LinkedInResearchService) {}

  @Get('tasks')
  @Roles('linkedin_researcher')
  async getTasks(@CurrentUser('userId') userId: string) {
    return this.linkedInResearchService.getWebsiteTasks(userId);
  }

  @Post('tasks/:taskId/claim')
  @Roles('linkedin_researcher')
  async claimTask(
    @Param('taskId') taskId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.linkedInResearchService.claimTask(taskId, userId);
  }

  @Post('tasks/:taskId/submit')
  @Roles('linkedin_researcher')
  async submitResearch(
    @Param('taskId') taskId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateLinkedInResearchDto,
  ) {
    return this.linkedInResearchService.submitResearch(taskId, userId, dto);
  }
}
