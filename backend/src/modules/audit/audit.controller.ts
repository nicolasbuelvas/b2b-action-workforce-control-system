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
  @Roles('website_auditor', 'linkedin_auditor')
  getPendingResearch() {
    return this.auditService.getPendingResearch();
  }

  @Post('research/:id')
  @Roles('website_auditor', 'linkedin_auditor')
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
}