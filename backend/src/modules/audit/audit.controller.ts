import { Controller, Post, Param, Body, UseGuards, Get } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditResearchDto } from './dto/audit-research.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('audit')
@UseGuards(JwtGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('research/pending')
  @Roles('website_inquirer_auditor', 'linkedin_inquirer_auditor', 'website_research_auditor', 'linkedin_research_auditor')
  getPendingResearch(@CurrentUser('userId') auditorUserId: string) {
    return this.auditService.getPendingResearch(auditorUserId);
  }

  @Post('research/:id')
  @Roles('website_inquirer_auditor', 'linkedin_inquirer_auditor', 'website_research_auditor', 'linkedin_research_auditor')
  auditResearch(
    @Param('id') researchTaskId: string,
    @Body() dto: AuditResearchDto,
    @CurrentUser('userId') auditorUserId: string,
  ) {
    return this.auditService.auditResearch(
      researchTaskId,
      dto,
      auditorUserId,
    );
  }

  @Get('inquiry/pending')
  @Roles('website_inquirer_auditor', 'linkedin_inquirer_auditor')
  getPendingInquiry(@CurrentUser('userId') auditorUserId: string) {
    return this.auditService.getPendingInquiry(auditorUserId);
  }

  @Post('inquiry/:id')
  @Roles('website_inquirer_auditor', 'linkedin_inquirer_auditor')
  auditInquiry(
    @Param('id') inquiryTaskId: string,
    @Body() dto: AuditResearchDto,
    @CurrentUser('userId') auditorUserId: string,
  ) {
    return this.auditService.auditInquiry(
      inquiryTaskId,
      dto,
      auditorUserId,
    );
  }

  @Get('linkedin-inquiry/pending')
  @Roles('linkedin_inquirer_auditor')
  getPendingLinkedInInquiry(@CurrentUser('userId') auditorUserId: string) {
    return this.auditService.getPendingLinkedInInquiry(auditorUserId);
  }

  @Post('linkedin-inquiry/:taskId/actions/:actionId')
  @Roles('linkedin_inquirer_auditor')
  auditLinkedInInquiry(
    @Param('taskId') inquiryTaskId: string,
    @Param('actionId') actionId: string,
    @Body() dto: AuditResearchDto,
    @CurrentUser('userId') auditorUserId: string,
  ) {
    return this.auditService.auditLinkedInInquiry(
      inquiryTaskId,
      actionId,
      dto,
      auditorUserId,
    );
  }
}
