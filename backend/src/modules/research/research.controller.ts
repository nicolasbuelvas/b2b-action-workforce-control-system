import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('research')
@UseGuards(JwtGuard)
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  submit(
    @Body() dto: CreateResearchDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.researchService.submit(dto, userId);
  }
}